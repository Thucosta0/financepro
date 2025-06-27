-- FinancePRO Database Schema
-- Execute este arquivo no painel do Supabase (SQL Editor)

-- Habilita extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- TABELAS PRINCIPAIS
-- ===========================================

-- 1. Tabela de perfis de usuário (complementa auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Tabela de categorias
CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    icon TEXT NOT NULL DEFAULT '📁',
    color TEXT NOT NULL DEFAULT '#3b82f6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, name, type)
);

-- 3. Tabela de cartões/contas
CREATE TABLE public.cards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'cash')),
    bank TEXT NOT NULL,
    card_limit DECIMAL(12,2),
    color TEXT NOT NULL DEFAULT '#3b82f6',
    last_digits TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Tabela de transações
CREATE TABLE public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT NOT NULL,
    card_id UUID REFERENCES public.cards(id) ON DELETE RESTRICT NOT NULL,
    transaction_date DATE NOT NULL,
    is_recurring BOOLEAN NOT NULL DEFAULT false,
    recurring_transaction_id UUID,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Tabela de transações recorrentes
CREATE TABLE public.recurring_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT NOT NULL,
    card_id UUID REFERENCES public.cards(id) ON DELETE RESTRICT NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'annually')),
    start_date DATE NOT NULL,
    end_date DATE,
    next_execution_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Tabela de orçamentos
CREATE TABLE public.budgets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    budget_limit DECIMAL(12,2) NOT NULL,
    period TEXT NOT NULL CHECK (period IN ('monthly', 'yearly')) DEFAULT 'monthly',
    year INTEGER NOT NULL,
    month INTEGER CHECK (month BETWEEN 1 AND 12),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, category_id, period, year, month)
);

-- ===========================================
-- ADICIONANDO FOREIGN KEY PARA RECURRING_TRANSACTIONS
-- ===========================================

ALTER TABLE public.transactions 
ADD CONSTRAINT fk_recurring_transaction 
FOREIGN KEY (recurring_transaction_id) REFERENCES public.recurring_transactions(id) ON DELETE SET NULL;

-- ===========================================
-- ÍNDICES PARA PERFORMANCE
-- ===========================================

-- Índices para consultas frequentes
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX idx_transactions_category ON public.transactions(category_id);
CREATE INDEX idx_transactions_card ON public.transactions(card_id);
CREATE INDEX idx_transactions_type ON public.transactions(type);

CREATE INDEX idx_categories_user_id ON public.categories(user_id);
CREATE INDEX idx_categories_type ON public.categories(type);

CREATE INDEX idx_cards_user_id ON public.cards(user_id);
CREATE INDEX idx_cards_active ON public.cards(is_active);

CREATE INDEX idx_recurring_user_id ON public.recurring_transactions(user_id);
CREATE INDEX idx_recurring_active ON public.recurring_transactions(is_active);
CREATE INDEX idx_recurring_next_date ON public.recurring_transactions(next_execution_date);

CREATE INDEX idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX idx_budgets_period ON public.budgets(year, month);

-- ===========================================
-- ROW LEVEL SECURITY (RLS)
-- ===========================================

-- Habilita RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- POLÍTICAS DE SEGURANÇA
-- ===========================================

-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para categories
CREATE POLICY "Users can view own categories" ON public.categories
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON public.categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON public.categories
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON public.categories
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para cards
CREATE POLICY "Users can view own cards" ON public.cards
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cards" ON public.cards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cards" ON public.cards
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cards" ON public.cards
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para transactions
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON public.transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON public.transactions
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para recurring_transactions
CREATE POLICY "Users can view own recurring transactions" ON public.recurring_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recurring transactions" ON public.recurring_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recurring transactions" ON public.recurring_transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recurring transactions" ON public.recurring_transactions
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para budgets
CREATE POLICY "Users can view own budgets" ON public.budgets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets" ON public.budgets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" ON public.budgets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" ON public.budgets
    FOR DELETE USING (auth.uid() = user_id);

-- ===========================================
-- FUNÇÕES E TRIGGERS
-- ===========================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_cards_updated_at
    BEFORE UPDATE ON public.cards
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_recurring_transactions_updated_at
    BEFORE UPDATE ON public.recurring_transactions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_budgets_updated_at
    BEFORE UPDATE ON public.budgets
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ===========================================
-- FUNÇÃO PARA CRIAR CATEGORIAS PADRÃO
-- ===========================================

CREATE OR REPLACE FUNCTION public.create_default_categories(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.categories (user_id, name, type, icon, color) VALUES
    (user_uuid, 'Alimentação', 'expense', '🍽️', '#ef4444'),
    (user_uuid, 'Transporte', 'expense', '🚗', '#f97316'),
    (user_uuid, 'Moradia', 'expense', '🏠', '#eab308'),
    (user_uuid, 'Saúde', 'expense', '🏥', '#22c55e'),
    (user_uuid, 'Educação', 'expense', '📚', '#3b82f6'),
    (user_uuid, 'Lazer', 'expense', '🎮', '#8b5cf6'),
    (user_uuid, 'Compras', 'expense', '🛒', '#ec4899'),
    (user_uuid, 'Serviços', 'expense', '🔧', '#6b7280'),
    (user_uuid, 'Salário', 'income', '💰', '#10b981'),
    (user_uuid, 'Freelance', 'income', '💻', '#059669'),
    (user_uuid, 'Investimentos', 'income', '📈', '#0d9488'),
    (user_uuid, 'Outros', 'income', '💼', '#065f46');
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- TRIGGER PARA CRIAR PERFIL E CATEGORIAS AUTOMATICAMENTE
-- ===========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Cria o perfil do usuário
    INSERT INTO public.profiles (id, name, email)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'name', NEW.email);
    
    -- Cria as categorias padrão
    PERFORM public.create_default_categories(NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que executa quando um novo usuário é criado
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===========================================
-- VIEWS ÚTEIS PARA RELATÓRIOS
-- ===========================================

-- View para resumo financeiro por usuário
CREATE OR REPLACE VIEW public.financial_summary AS
SELECT 
    t.user_id,
    EXTRACT(YEAR FROM t.transaction_date) as year,
    EXTRACT(MONTH FROM t.transaction_date) as month,
    SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) as total_income,
    SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) as total_expenses,
    SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END) as net_balance
FROM public.transactions t
GROUP BY t.user_id, EXTRACT(YEAR FROM t.transaction_date), EXTRACT(MONTH FROM t.transaction_date);

-- View para gastos por categoria
CREATE OR REPLACE VIEW public.expenses_by_category AS
SELECT 
    t.user_id,
    c.name as category_name,
    c.icon as category_icon,
    c.color as category_color,
    SUM(t.amount) as total_spent,
    COUNT(t.id) as transaction_count,
    EXTRACT(YEAR FROM t.transaction_date) as year,
    EXTRACT(MONTH FROM t.transaction_date) as month
FROM public.transactions t
JOIN public.categories c ON t.category_id = c.id
WHERE t.type = 'expense'
GROUP BY t.user_id, c.id, c.name, c.icon, c.color, EXTRACT(YEAR FROM t.transaction_date), EXTRACT(MONTH FROM t.transaction_date);

-- View para controle de orçamento
CREATE OR REPLACE VIEW public.budget_tracking AS
SELECT 
    b.user_id,
    b.id as budget_id,
    c.name as category_name,
    b.budget_limit,
    COALESCE(SUM(t.amount), 0) as spent,
    b.budget_limit - COALESCE(SUM(t.amount), 0) as remaining,
    ROUND((COALESCE(SUM(t.amount), 0) / b.budget_limit) * 100, 2) as percentage_used,
    b.year,
    b.month,
    b.period
FROM public.budgets b
JOIN public.categories c ON b.category_id = c.id
LEFT JOIN public.transactions t ON c.id = t.category_id 
    AND t.type = 'expense'
    AND t.user_id = b.user_id
    AND EXTRACT(YEAR FROM t.transaction_date) = b.year
    AND (b.period = 'yearly' OR EXTRACT(MONTH FROM t.transaction_date) = b.month)
GROUP BY b.id, b.user_id, c.name, b.budget_limit, b.year, b.month, b.period;

-- ===========================================
-- COMENTÁRIOS DAS TABELAS
-- ===========================================

COMMENT ON TABLE public.profiles IS 'Perfis de usuário complementando auth.users';
COMMENT ON TABLE public.categories IS 'Categorias de receitas e despesas por usuário';
COMMENT ON TABLE public.cards IS 'Cartões de crédito/débito e contas por usuário';
COMMENT ON TABLE public.transactions IS 'Transações financeiras dos usuários';
COMMENT ON TABLE public.recurring_transactions IS 'Transações recorrentes configuradas pelos usuários';
COMMENT ON TABLE public.budgets IS 'Orçamentos definidos por categoria e período';

-- ===========================================
-- GRANTS DE PERMISSÃO
-- ===========================================

-- Permissões para usuários autenticados
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Permissões para usuários anônimos (apenas leitura limitada se necessário)
GRANT USAGE ON SCHEMA public TO anon;

-- Concluído! Execute este script no SQL Editor do Supabase. 