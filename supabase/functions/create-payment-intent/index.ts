/**
 * Edge Function : create-payment-intent
 *
 * Rôle : Valider les articles côté serveur, calculer le montant réel depuis la
 *        base de données, puis créer un PaymentIntent Stripe sécurisé.
 *
 * Secrets à configurer dans Supabase Dashboard → Edge Functions → Secrets :
 *   - STRIPE_SECRET_KEY        → sk_live_... ou sk_test_...
 *   - SUPABASE_SERVICE_ROLE_KEY → clé service_role (Settings > API)
 *
 * Déploiement :
 *   supabase functions deploy create-payment-intent
 */

import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req: Request) => {
  // Préflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { items, customer } = await req.json() as {
      items: Array<{ id: number; quantity: number }>;
      customer: { name: string; email: string; phone?: string };
    };

    if (!items?.length || !customer?.email) {
      return new Response(
        JSON.stringify({ error: 'Données manquantes (articles ou client).' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ─── Client Supabase avec clé service_role (bypass RLS) ──────────────────
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // ─── Validation des articles + calcul du montant réel ────────────────────
    let totalCents = 0;
    const validatedItems: Array<{ id: number; name: string; price: number; quantity: number }> = [];

    for (const item of items) {
      const { data: product, error } = await supabase
        .from('products')
        .select('id, name, price, stock, status')
        .eq('id', item.id)
        .single();

      if (error || !product) {
        return new Response(
          JSON.stringify({ error: `Produit #${item.id} introuvable.` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!product.status) {
        return new Response(
          JSON.stringify({ error: `Le produit "${product.name}" n'est plus disponible.` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (product.stock < item.quantity) {
        return new Response(
          JSON.stringify({ error: `Stock insuffisant pour "${product.name}" (disponible : ${product.stock}).` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Le montant vient de la BDD — jamais du client (sécurité critique)
      totalCents += Math.round(parseFloat(product.price) * 100) * item.quantity;
      validatedItems.push({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        quantity: item.quantity,
      });
    }

    if (totalCents < 50) { // Stripe minimum : 0.50€
      return new Response(
        JSON.stringify({ error: 'Montant trop faible pour être traité.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ─── Création du PaymentIntent Stripe ────────────────────────────────────
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2023-10-16',
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      metadata: {
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone ?? '',
        items_json: JSON.stringify(validatedItems),
      },
      receipt_email: customer.email,
    });

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        amount: totalCents,
        paymentIntentId: paymentIntent.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('[create-payment-intent]', err);
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
