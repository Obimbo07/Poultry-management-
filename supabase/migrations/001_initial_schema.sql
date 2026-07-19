-- ============================================================
-- Poultry Management System - Initial Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('super_admin', 'farm_manager', 'staff')),
  avatar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  currency TEXT NOT NULL DEFAULT 'USD',
  farm_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (currency, farm_name) VALUES ('USD', 'Poultry Farm')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SUPPLIERS
-- ============================================================
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- BIRD BATCHES
-- ============================================================
CREATE TABLE IF NOT EXISTS bird_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_name TEXT NOT NULL,
  breed TEXT,
  category TEXT CHECK (category IN ('Layer', 'Broiler', 'Breeder', 'Chick')),
  quantity INTEGER DEFAULT 0,
  age INTEGER,
  arrival_date DATE,
  supplier TEXT,
  purchase_price NUMERIC(12,2),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- BIRD INVENTORY (summary of active birds)
-- ============================================================
CREATE TABLE IF NOT EXISTS bird_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  current_quantity INTEGER NOT NULL DEFAULT 0,
  batch_id UUID REFERENCES bird_batches(id) ON DELETE SET NULL,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FEED INVENTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS feed_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feed_name TEXT NOT NULL,
  feed_type TEXT CHECK (feed_type IN ('Layer', 'Broiler', 'Grower', 'Starter', 'Finisher')),
  supplier TEXT,
  quantity NUMERIC(12,2) DEFAULT 0,
  unit TEXT CHECK (unit IN ('kg', 'bags', 'tonnes', 'lbs')),
  purchase_price NUMERIC(12,2),
  reorder_level NUMERIC(12,2) DEFAULT 0,
  expiry_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FEED CONSUMPTION
-- ============================================================
CREATE TABLE IF NOT EXISTS feed_consumption (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  quantity_used NUMERIC(12,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- EGG COLLECTION
-- ============================================================
CREATE TABLE IF NOT EXISTS egg_collection (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  eggs_collected INTEGER DEFAULT 0,
  broken_eggs INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MORTALITY
-- ============================================================
CREATE TABLE IF NOT EXISTS mortality (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  dead_birds INTEGER DEFAULT 0,
  reason TEXT CHECK (reason IN ('Disease', 'Heat stress', 'Injury', 'Predator', 'Unknown')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- VACCINATION
-- ============================================================
CREATE TABLE IF NOT EXISTS vaccination (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vaccine_name TEXT NOT NULL,
  next_due_date DATE,
  administered_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MEDICATION
-- ============================================================
CREATE TABLE IF NOT EXISTS medication (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medicine TEXT NOT NULL,
  dosage TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CUSTOMERS
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SALES
-- ============================================================
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  product TEXT,
  sale_type TEXT CHECK (sale_type IN ('Eggs', 'Birds', 'Manure', 'Other')),
  quantity NUMERIC(12,2),
  price NUMERIC(12,2),
  total NUMERIC(12,2),
  payment_method TEXT CHECK (payment_method IN ('Cash', 'Bank Transfer', 'Mobile Money', 'Credit')),
  sold_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- EXPENSES
-- ============================================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT CHECK (category IN ('Feed', 'Medication', 'Labor', 'Utilities', 'Maintenance', 'Transport', 'Other')),
  description TEXT,
  amount NUMERIC(12,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- EMPLOYEES
-- ============================================================
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  role TEXT,
  phone TEXT,
  salary NUMERIC(12,2),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'terminated')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_bird_batches_status ON bird_batches(status);
CREATE INDEX IF NOT EXISTS idx_feed_consumption_date ON feed_consumption(date);
CREATE INDEX IF NOT EXISTS idx_egg_collection_date ON egg_collection(date);
CREATE INDEX IF NOT EXISTS idx_mortality_date ON mortality(date);
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_vaccination_next_due_date ON vaccination(next_due_date);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bird_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE bird_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE egg_collection ENABLE ROW LEVEL SECURITY;
ALTER TABLE mortality ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccination ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all profiles, insert own, update only their own
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Settings: authenticated users can read and update
CREATE POLICY "Authenticated users can view settings" ON settings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update settings" ON settings FOR UPDATE USING (auth.role() = 'authenticated');

-- All data tables: authenticated users can CRUD
CREATE POLICY "Authenticated users can manage suppliers" ON suppliers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage bird_batches" ON bird_batches FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage bird_inventory" ON bird_inventory FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage feed_inventory" ON feed_inventory FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage feed_consumption" ON feed_consumption FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage egg_collection" ON egg_collection FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage mortality" ON mortality FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage vaccination" ON vaccination FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage medication" ON medication FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage customers" ON customers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage sales" ON sales FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage expenses" ON expenses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage employees" ON employees FOR ALL USING (auth.role() = 'authenticated');

-- Audit logs: authenticated users can read, insert only
CREATE POLICY "Authenticated users can view audit_logs" ON audit_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert audit_logs" ON audit_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
