
-- Purnata Inventory - Advanced Supabase Schema

-- 1. Users & Staff
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'STAFF',
    permissions JSONB DEFAULT '[]'::jsonb,
    last_active TEXT DEFAULT 'Never',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Products
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    cost_price DECIMAL(12,2) NOT NULL,
    selling_price DECIMAL(12,2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    warehouse_id TEXT DEFAULT 'W1',
    low_stock_alert INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    total DECIMAL(12,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    source TEXT NOT NULL DEFAULT 'MANUAL',
    courier_id TEXT,
    courier_type TEXT,
    tracking_id TEXT,
    cod_amount DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(12,2) NOT NULL
);

-- 5. Financials (Income)
CREATE TABLE IF NOT EXISTS incomes (
    id PRIMARY KEY DEFAULT gen_random_uuid(),
    amount DECIMAL(12,2) NOT NULL,
    source TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    method TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Financials (Expenses)
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount DECIMAL(12,2) NOT NULL,
    category TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    method TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Loans
CREATE TABLE IF NOT EXISTS loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    interest_rate DECIMAL(5,2),
    monthly_installment DECIMAL(12,2),
    paid_amount DECIMAL(12,2) DEFAULT 0,
    start_date DATE,
    end_date DATE,
    next_payment_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Courier Configurations
CREATE TABLE IF NOT EXISTS courier_configs (
    type TEXT PRIMARY KEY,
    api_key TEXT,
    store_id TEXT,
    is_active BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SEED INITIAL OWNER (If not exists)
INSERT INTO users (name, email, role, permissions, last_active)
SELECT 'Owner', 'owner@purnata.io', 'OWNER', '["dashboard", "orders", "inventory", "logistics", "customers", "financials", "loans", "staff", "settings"]', 'Active Now'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'owner@purnata.io');
