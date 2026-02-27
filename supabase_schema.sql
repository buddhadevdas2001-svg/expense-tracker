-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    currency TEXT DEFAULT 'INR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT DEFAULT '??',
    color TEXT DEFAULT '#4F46E5',
    type TEXT CHECK (type IN ('income', 'expense', 'both')) DEFAULT 'both',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(user_id, name)
);

-- ============================================
-- TRANSACTIONS TABLE
-- ============================================
CREATE TABLE transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create index for faster queries
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_category ON transactions(category_id);

-- ============================================
-- BUDGETS TABLE
-- ============================================
CREATE TABLE budgets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    month TEXT NOT NULL, -- Format: YYYY-MM
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(user_id, category_id, month)
);

CREATE INDEX idx_budgets_user_month ON budgets(user_id, month);

-- ============================================
-- DEFAULT CATEGORIES (to be inserted after user creation)
-- ============================================
INSERT INTO categories (id, name, icon, color, type, is_default) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Salary', '??', '#10B981', 'income', TRUE),
    ('22222222-2222-2222-2222-222222222222', 'Freelance', '??', '#3B82F6', 'income', TRUE),
    ('33333333-3333-3333-3333-333333333333', 'Investment', '??', '#8B5CF6', 'income', TRUE),
    ('44444444-4444-4444-4444-444444444444', 'Food & Dining', '??', '#EF4444', 'expense', TRUE),
    ('55555555-5555-5555-5555-555555555555', 'Transportation', '??', '#F59E0B', 'expense', TRUE),
    ('66666666-6666-6666-6666-666666666666', 'Shopping', '???', '#EC4899', 'expense', TRUE),
    ('77777777-7777-7777-7777-777777777777', 'Entertainment', '??', '#6366F1', 'expense', TRUE),
    ('88888888-8888-8888-8888-888888888888', 'Utilities', '??', '#6B7280', 'expense', TRUE),
    ('99999999-9999-9999-9999-999999999999', 'Healthcare', '??', '#14B8A6', 'expense', TRUE),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Education', '??', '#A855F7', 'expense', TRUE),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Rent', '??', '#64748B', 'expense', TRUE),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Travel', '??', '#06B6D4', 'expense', TRUE);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================
-- CATEGORIES POLICIES
-- ============================================
CREATE POLICY "Users can view own and default categories"
    ON categories FOR SELECT
    USING (auth.uid() = user_id OR is_default = TRUE);

CREATE POLICY "Users can insert own categories"
    ON categories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
    ON categories FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own non-default categories"
    ON categories FOR DELETE
    USING (auth.uid() = user_id AND is_default = FALSE);

-- ============================================
-- TRANSACTIONS POLICIES
-- ============================================
CREATE POLICY "Users can view own transactions"
    ON transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
    ON transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
    ON transactions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
    ON transactions FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- BUDGETS POLICIES
-- ============================================
CREATE POLICY "Users can view own budgets"
    ON budgets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets"
    ON budgets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets"
    ON budgets FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets"
    ON budgets FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id, 
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
    BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get monthly summary
CREATE OR REPLACE FUNCTION get_monthly_summary(
    p_user_id UUID,
    p_year INTEGER,
    p_month INTEGER
)
RETURNS TABLE (
    total_income DECIMAL,
    total_expense DECIMAL,
    savings DECIMAL,
    category_id UUID,
    category_name TEXT,
    category_icon TEXT,
    category_color TEXT,
    category_amount DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH monthly_totals AS (
        SELECT
            COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
            COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
        FROM transactions
        WHERE user_id = p_user_id
            AND EXTRACT(YEAR FROM date) = p_year
            AND EXTRACT(MONTH FROM date) = p_month
    ),
    category_breakdown AS (
        SELECT
            t.category_id,
            c.name,
            c.icon,
            c.color,
            SUM(t.amount) as amount
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = p_user_id
            AND t.type = 'expense'
            AND EXTRACT(YEAR FROM t.date) = p_year
            AND EXTRACT(MONTH FROM t.date) = p_month
        GROUP BY t.category_id, c.name, c.icon, c.color
    )
    SELECT
        mt.income,
        mt.expense,
        mt.income - mt.expense as savings,
        cb.category_id,
        cb.name,
        cb.icon,
        cb.color,
        cb.amount
    FROM monthly_totals mt
    LEFT JOIN category_breakdown cb ON true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check budget status
CREATE OR REPLACE FUNCTION check_budget_status(
    p_user_id UUID,
    p_month TEXT
)
RETURNS TABLE (
    category_id UUID,
    category_name TEXT,
    category_icon TEXT,
    budget_amount DECIMAL,
    spent_amount DECIMAL,
    remaining DECIMAL,
    percentage_used DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        b.category_id,
        c.name,
        c.icon,
        b.amount as budget_amount,
        COALESCE(SUM(t.amount), 0) as spent_amount,
        b.amount - COALESCE(SUM(t.amount), 0) as remaining,
        CASE 
            WHEN b.amount > 0 THEN 
                ROUND((COALESCE(SUM(t.amount), 0) / b.amount * 100)::numeric, 2)
            ELSE 0 
        END as percentage_used
    FROM budgets b
    JOIN categories c ON b.category_id = c.id
    LEFT JOIN transactions t ON 
        t.category_id = b.category_id 
        AND t.user_id = b.user_id
        AND t.type = 'expense'
        AND TO_CHAR(t.date, 'YYYY-MM') = b.month
    WHERE b.user_id = p_user_id
        AND b.month = p_month
    GROUP BY b.category_id, c.name, c.icon, b.amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
