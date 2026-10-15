-- ==============================================================================
-- iziFlow - Schéma Supabase complet (Commerce, Stocks, Facturation, Signature, Paie)
-- ==============================================================================

-- 1. EXTENSIONS & MIGRATIONS SUR TABLES EXISTANTES
-- ==============================================================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  company_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  ninea TEXT,
  rccm TEXT,
  role TEXT DEFAULT 'Administrateur Pro',
  plan TEXT DEFAULT 'gratuit',
  plan_expires_at TIMESTAMPTZ,
  currency TEXT DEFAULT 'XOF',
  default_tax_rate DECIMAL(5,2) DEFAULT 18.00,
  -- Signature & Cachet d'Entreprise
  company_logo_url TEXT,
  company_stamp_url TEXT,
  company_signature_url TEXT,
  company_signatory_name TEXT,
  use_stamp_on_documents BOOLEAN DEFAULT TRUE,
  use_signature_on_documents BOOLEAN DEFAULT TRUE,
  -- Passerelles
  bictorys_api_key TEXT,
  bictorys_webhook_secret TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Si la table profiles existe déjà, appliquer ces migrations :
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rccm TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'XOF';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS default_tax_rate DECIMAL(5,2) DEFAULT 18.00;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_logo_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_stamp_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_signature_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_signatory_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS use_stamp_on_documents BOOLEAN DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS use_signature_on_documents BOOLEAN DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bictorys_api_key TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bictorys_webhook_secret TEXT;


-- Clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  ninea TEXT,
  rccm TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS rccm TEXT;


-- 2. MODULE STOCKS & PRODUITS
-- ==============================================================================

-- Products table (Catalogue et gestion de stock)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  sku TEXT, -- Code article ou code-barres
  category TEXT DEFAULT 'Général',
  purchase_price DECIMAL(12,2) DEFAULT 0, -- Coût d'achat pour calcul des marges
  selling_price DECIMAL(12,2) NOT NULL, -- Prix de vente public HT ou TTC
  stock_quantity DECIMAL(10,2) DEFAULT 0, -- Quantité en stock
  min_stock_alert DECIMAL(10,2) DEFAULT 5, -- Seuil d'alerte stock bas
  track_stock BOOLEAN DEFAULT TRUE, -- FALSE pour prestations de services
  unit TEXT DEFAULT 'unité', -- unité, kg, carton, litre, prestation
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, sku)
);

-- Stock movements table (Traçabilité totale des entrées et sorties)
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'in' (approvisionnement), 'out' (vente/facture), 'adjustment' (inventaire), 'return' (retour)
  quantity DECIMAL(10,2) NOT NULL,
  previous_stock DECIMAL(10,2) DEFAULT 0,
  new_stock DECIMAL(10,2) DEFAULT 0,
  reference_type TEXT, -- 'sale', 'invoice', 'manual_adjustment'
  reference_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 3. MODULE FACTURATION CERTIFIÉE & SIGNATURE
-- ==============================================================================

-- Invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  type TEXT DEFAULT 'invoice', -- 'invoice' (facture), 'quote' (devis), 'receipt' (reçu)
  status TEXT DEFAULT 'draft', -- 'draft', 'pending', 'paid', 'cancelled', 'overdue'
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal DECIMAL(12,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 18.00,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) DEFAULT 0,
  -- Signature & Cachet
  is_signed BOOLEAN DEFAULT FALSE,
  signed_at TIMESTAMPTZ,
  stamp_applied BOOLEAN DEFAULT TRUE,
  signature_url TEXT,
  stamp_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, invoice_number)
);

-- Migrations factures si table existante
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'invoice';
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 18.00;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS is_signed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS signed_at TIMESTAMPTZ;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS stamp_applied BOOLEAN DEFAULT TRUE;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS signature_url TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS stamp_url TEXT;

-- Invoice items table
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  purchase_price DECIMAL(12,2) DEFAULT 0, -- Pour calcul de la marge financière
  unit_price DECIMAL(12,2) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id) ON DELETE SET NULL;
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS purchase_price DECIMAL(12,2) DEFAULT 0;


-- 4. MODULE VENTES DIRECTES & CAISSE RAPIDE (POS)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  sale_number TEXT NOT NULL,
  customer_name TEXT DEFAULT 'Client de passage',
  payment_method TEXT DEFAULT 'cash', -- 'cash', 'wave', 'om', 'card', 'bank_transfer'
  subtotal DECIMAL(12,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  total_cost DECIMAL(12,2) DEFAULT 0, -- Coût de revient total
  margin DECIMAL(12,2) DEFAULT 0, -- Marge bénéficiaire directe
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, sale_number)
);

CREATE TABLE IF NOT EXISTS public.sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  purchase_price DECIMAL(12,2) DEFAULT 0,
  unit_price DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 5. MODULE PAIEMENTS & ENCAISSEMENTS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  payment_method TEXT, -- Wave, OM, Cash, Bank Transfer
  transaction_id TEXT,
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 6. EXTENSION PAIE & RH (RESSOURCES HUMAINES)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  position TEXT NOT NULL, -- Poste / Rôle
  department TEXT DEFAULT 'Opérations',
  base_salary DECIMAL(12,2) NOT NULL DEFAULT 0,
  contract_type TEXT DEFAULT 'CDI', -- CDI, CDD, Stage, Prestation
  hire_date DATE DEFAULT CURRENT_DATE,
  payment_method TEXT DEFAULT 'wave', -- 'wave', 'om', 'bank_transfer', 'cash'
  account_number TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'on_leave', 'terminated'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payrolls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  period_month INT NOT NULL, -- 1 à 12
  period_year INT NOT NULL, -- 2026
  base_salary DECIMAL(12,2) NOT NULL,
  bonus DECIMAL(12,2) DEFAULT 0,
  deductions DECIMAL(12,2) DEFAULT 0,
  net_salary DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'pending', -- 'draft', 'pending', 'paid'
  payment_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, employee_id, period_month, period_year)
);


-- 7. SÉCURITÉ ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payrolls ENABLE ROW LEVEL SECURITY;

-- Politiques RLS (Users can only access their own data)
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users manage own clients" ON public.clients FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "Users manage own products" ON public.products FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "Users manage own stock movements" ON public.stock_movements FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "Users manage own invoices" ON public.invoices FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "Users manage own invoice items" ON public.invoice_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.profile_id = auth.uid())
);
CREATE POLICY "Users manage own sales" ON public.sales FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "Users manage own sale items" ON public.sale_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.sales WHERE sales.id = sale_items.sale_id AND sales.profile_id = auth.uid())
);
CREATE POLICY "Users manage own payments" ON public.payments FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "Users manage own employees" ON public.employees FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "Users manage own payrolls" ON public.payrolls FOR ALL USING (auth.uid() = profile_id);


-- 8. INDEXES DE PERFORMANCE
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_products_profile ON public.products(profile_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_stock_movements_prod ON public.stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_invoices_profile_date ON public.invoices(profile_id, issue_date);
CREATE INDEX IF NOT EXISTS idx_sales_profile_date ON public.sales(profile_id, created_at);
CREATE INDEX IF NOT EXISTS idx_payments_profile ON public.payments(profile_id);


-- 9. DÉSTOCKAGE AUTOMATIQUE (FUNCTION & TRIGGER)
-- ==============================================================================

-- Lorsqu'une vente directe ou un élément de facture est inséré pour un produit traqué :
CREATE OR REPLACE FUNCTION public.handle_sale_stock_deduction()
RETURNS TRIGGER AS $$
DECLARE
  v_track_stock BOOLEAN;
  v_current_stock DECIMAL(10,2);
  v_profile_id UUID;
BEGIN
  -- Récupérer les informations du produit
  SELECT track_stock, stock_quantity, profile_id 
  INTO v_track_stock, v_current_stock, v_profile_id
  FROM public.products
  WHERE id = NEW.product_id;

  -- Si le produit existe et est traqué
  IF FOUND AND v_track_stock IS TRUE THEN
    -- Mettre à jour la quantité en stock
    UPDATE public.products
    SET stock_quantity = stock_quantity - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;

    -- Enregistrer le mouvement d'historique
    INSERT INTO public.stock_movements (
      profile_id,
      product_id,
      type,
      quantity,
      previous_stock,
      new_stock,
      reference_type,
      reference_id,
      notes
    ) VALUES (
      v_profile_id,
      NEW.product_id,
      'out',
      NEW.quantity,
      v_current_stock,
      v_current_stock - NEW.quantity,
      'sale',
      NEW.sale_id,
      CONCAT('Vente directe #', NEW.sale_id)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sale_item_stock ON public.sale_items;
CREATE TRIGGER trg_sale_item_stock
  AFTER INSERT ON public.sale_items
  FOR EACH ROW
  WHEN (NEW.product_id IS NOT NULL)
  EXECUTE FUNCTION public.handle_sale_stock_deduction();


-- 10. TRIGGER AUTOMATIQUE CRÉATION DE PROFIL LORS DE L'INSCRIPTION
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    company_name, 
    email, 
    phone, 
    ninea, 
    plan
  ) VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'company_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'ninea',
    COALESCE(new.raw_user_meta_data->>'plan', 'gratuit')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
