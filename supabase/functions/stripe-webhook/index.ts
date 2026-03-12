/**
 * Edge Function : stripe-webhook
 *
 * Rôle : Recevoir les événements Stripe, vérifier leur authenticité, puis
 *        confirmer les commandes et déduire le stock après un paiement réussi.
 *
 * Secrets à configurer dans Supabase Dashboard → Edge Functions → Secrets :
 *   - STRIPE_SECRET_KEY        → sk_live_... ou sk_test_...
 *   - STRIPE_WEBHOOK_SECRET    → whsec_... (Stripe Dashboard → Webhooks)
 *   - SUPABASE_SERVICE_ROLE_KEY
 *
 * URL du webhook à renseigner dans Stripe Dashboard → Webhooks :
 *   https://VOTRE_PROJECT_ID.supabase.co/functions/v1/stripe-webhook
 *
 * Événements à activer :
 *   - payment_intent.succeeded
 *   - payment_intent.payment_failed
 *
 * Déploiement :
 *   supabase functions deploy stripe-webhook
 */

import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req: Request) => {
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response('Signature manquante', { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    );
  } catch (err) {
    console.error('[stripe-webhook] Signature invalide:', err);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // ─── Paiement réussi ───────────────────────────────────────────────────────
  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent;

    const customerName  = pi.metadata.customer_name;
    const customerEmail = pi.metadata.customer_email;
    const customerPhone = pi.metadata.customer_phone ?? '';
    const itemsRaw      = pi.metadata.items_json;

    if (!itemsRaw) {
      console.error('[stripe-webhook] items_json manquant dans metadata');
      return new Response('OK', { status: 200 });
    }

    const items: Array<{ id: number; name: string; price: number; quantity: number }> =
      JSON.parse(itemsRaw);

    // 1. Créer la commande en BDD avec statut "Payée"
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        total_amount: pi.amount / 100,
        status: 'Payée',
        stripe_payment_intent_id: pi.id,
      })
      .select()
      .single();

    if (orderError) {
      console.error('[stripe-webhook] Erreur création commande:', orderError.message);
      return new Response('Erreur BDD', { status: 500 });
    }

    // 2. Insérer les articles
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      product_price: item.price,
      quantity: item.quantity,
    }));

    await supabase.from('order_items').insert(orderItems);

    // 3. Déduire le stock pour chaque article
    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('stock')
        .eq('id', item.id)
        .single();

      if (product) {
        await supabase
          .from('products')
          .update({ stock: Math.max(0, product.stock - item.quantity) })
          .eq('id', item.id);
      }
    }

    console.log(`[stripe-webhook] Commande ${order.id} créée — ${pi.amount / 100}€`);
  }

  // ─── Paiement échoué ───────────────────────────────────────────────────────
  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object as Stripe.PaymentIntent;
    console.warn(`[stripe-webhook] Paiement échoué — PaymentIntent ${pi.id}`);
    // Optionnel : notifier l'admin par email, loguer, etc.
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
