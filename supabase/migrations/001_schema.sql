-- ═══════════════════════════════════════════════════════════════════════════
--  La Caverne du Pro — Schéma de base de données complet
--  À exécuter dans : Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Table : products ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id                    BIGSERIAL PRIMARY KEY,
  name                  TEXT NOT NULL,
  category              TEXT NOT NULL DEFAULT '',
  subcategory           TEXT DEFAULT '',
  price                 DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock                 INTEGER NOT NULL DEFAULT 0,
  status                BOOLEAN DEFAULT true,
  description           TEXT DEFAULT '',
  image                 TEXT DEFAULT '',
  manufacturer          TEXT DEFAULT '',
  supplier              TEXT DEFAULT '',
  reference             TEXT DEFAULT '',
  supplier_reference    TEXT DEFAULT '',
  ean13                 TEXT DEFAULT '',
  weight                DECIMAL(10,3),
  location              TEXT DEFAULT '',
  is_pack               BOOLEAN DEFAULT false,
  is_downloadable       BOOLEAN DEFAULT false,
  purchase_price_ht     DECIMAL(10,2) DEFAULT 0,
  selling_price_ht      DECIMAL(10,2) DEFAULT 0,
  tax_rate              DECIMAL(5,2) DEFAULT 20,
  eco_tax               DECIMAL(10,2) DEFAULT 0,
  discount              DECIMAL(10,2) DEFAULT 0,
  discount_percent      DECIMAL(5,2) DEFAULT 0,
  available_from        TIMESTAMPTZ,
  available_to          TIMESTAMPTZ,
  on_sale               BOOLEAN DEFAULT false,
  out_of_stock_behavior TEXT DEFAULT 'default',
  in_stock_message      TEXT DEFAULT '',
  out_of_stock_message  TEXT DEFAULT '',
  summary               TEXT DEFAULT '',
  tags                  TEXT DEFAULT '',
  accessories           TEXT DEFAULT '',
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Table : manufacturers ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS manufacturers (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Table : suppliers ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS suppliers (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Table : orders ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                       UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_name            TEXT NOT NULL,
  customer_email           TEXT NOT NULL,
  customer_phone           TEXT DEFAULT '',
  total_amount             DECIMAL(10,2) NOT NULL,
  status                   TEXT DEFAULT 'En attente',
  stripe_payment_intent_id TEXT DEFAULT '',
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  updated_at               TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Table : order_items ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id            BIGSERIAL PRIMARY KEY,
  order_id      UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id    BIGINT REFERENCES products(id) ON DELETE SET NULL,
  product_name  TEXT NOT NULL,
  product_price DECIMAL(10,2) NOT NULL,
  quantity      INTEGER NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_category  ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status    ON products(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order  ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status      ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_email       ON orders(customer_email);

-- ─── Trigger : updated_at auto ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Row Level Security (RLS) ────────────────────────────────────────────────
ALTER TABLE products      ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers     ENABLE ROW LEVEL SECURITY;

-- Products : lecture publique / écriture admin uniquement
CREATE POLICY "products_select_public"
  ON products FOR SELECT USING (true);

CREATE POLICY "products_insert_admin"
  ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "products_update_admin"
  ON products FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "products_delete_admin"
  ON products FOR DELETE USING (auth.role() = 'authenticated');

-- Orders : insertion publique (client), lecture/modification admin
CREATE POLICY "orders_insert_public"
  ON orders FOR INSERT WITH CHECK (true);

CREATE POLICY "orders_select_admin"
  ON orders FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "orders_update_admin"
  ON orders FOR UPDATE USING (auth.role() = 'authenticated');

-- Order items : insertion publique, lecture admin
CREATE POLICY "order_items_insert_public"
  ON order_items FOR INSERT WITH CHECK (true);

CREATE POLICY "order_items_select_admin"
  ON order_items FOR SELECT USING (auth.role() = 'authenticated');

-- Manufacturers : lecture publique, écriture admin
CREATE POLICY "manufacturers_select_public"
  ON manufacturers FOR SELECT USING (true);

CREATE POLICY "manufacturers_all_admin"
  ON manufacturers FOR ALL USING (auth.role() = 'authenticated');

-- Suppliers : lecture publique, écriture admin
CREATE POLICY "suppliers_select_public"
  ON suppliers FOR SELECT USING (true);

CREATE POLICY "suppliers_all_admin"
  ON suppliers FOR ALL USING (auth.role() = 'authenticated');

-- ─── Données initiales : fabricants ──────────────────────────────────────────
INSERT INTO manufacturers (name) VALUES
  ('BARTCHER'), ('SAMSUNG'), ('TEFAL')
ON CONFLICT (name) DO NOTHING;

-- ─── Données initiales : produits exemples ───────────────────────────────────
INSERT INTO products (name, category, price, stock, description, selling_price_ht, tax_rate, image) VALUES
  ('Couteau de Chef Japonais 20cm',     'Inox',               129.99,  12, 'Lame forgée main en acier damas. Parfait pour les viandes et poissons.', 108.33, 20, 'https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=600&q=80'),
  ('Batterie de Cuisine Inox 5 Pièces', 'Batterie de cuisine', 299.00,   5, 'Set comprenant casseroles et faitouts fond épais. Compatible tous feux dont induction.', 249.17, 20, 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80'),
  ('Robot Pâtissier Multifonction',     'Matériels de Préparations', 450.00, 3, 'Modèle pro avec cuve 6.9L. Fourni avec fouet, batteur plat et crochet pétrisseur.', 375.00, 20, 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=600&q=80'),
  ('Planche à Découper Billot',         'Inox',                89.50,   8, 'Bois debout massif de hêtre. Hautement résistante.', 74.58, 20, 'https://images.unsplash.com/photo-1580928224581-2287233261a8?auto=format&fit=crop&w=600&q=80'),
  ('Poêle En Fonte Émaillée 28cm',      'Cuisson',            145.00,  15, 'Poignée ergonomique, répartition parfaite de la chaleur. Saisie parfaite des viandes.', 120.83, 20, 'https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?auto=format&fit=crop&w=600&q=80'),
  ('Mallette Couteaux Pro 12 Pièces',   'Inox',               350.00,   0, 'Mallette rigide de transport sécurisée incluant tous les indispensables.', 291.67, 20, 'https://images.unsplash.com/photo-1574223214495-5cb95a32adbb?auto=format&fit=crop&w=600&q=80')
ON CONFLICT DO NOTHING;
