-- SCRIPT DE CORREÇÃO PARA SISTEMA DE ASSINATURAS EXISTENTE
-- Execute este script para corrigir problemas no sistema já criado

-- ===========================================
-- 1. VERIFICAR E CRIAR VIEW (se não existir)
-- ===========================================

DROP VIEW IF EXISTS public.user_subscription_status;

CREATE VIEW public.user_subscription_status AS
SELECT 
    s.user_id,
    s.plan_id,
    s.status,
    s.trial_start,
    s.trial_end,
    CASE 
        WHEN s.trial_end > TIMEZONE('utc'::text, NOW()) THEN 
            EXTRACT(days FROM (s.trial_end - TIMEZONE('utc'::text, NOW())))
        ELSE 0 
    END as trial_days_remaining,
    s.current_period_start,
    s.current_period_end,
    s.stripe_customer_id,
    s.stripe_subscription_id,
    s.cancel_at_period_end,
    COALESCE(ul.transactions_count, 0) as transactions_count,
    COALESCE(ul.categories_count, 0) as categories_count,
    COALESCE(ul.cards_count, 0) as cards_count,
    -- Verificações de limites
    CASE s.plan_id
        WHEN 'free' THEN 100 - COALESCE(ul.transactions_count, 0)
        ELSE -1
    END as transactions_remaining,
    CASE s.plan_id
        WHEN 'free' THEN 10 - COALESCE(ul.categories_count, 0)
        ELSE -1
    END as categories_remaining,
    CASE s.plan_id
        WHEN 'free' THEN 1 - COALESCE(ul.cards_count, 0)
        ELSE -1
    END as cards_remaining,
    -- Status geral
    CASE 
        WHEN s.status = 'trialing' AND s.trial_end > TIMEZONE('utc'::text, NOW()) THEN 'active_trial'
        WHEN s.status = 'active' THEN 'active_paid'
        WHEN s.trial_end < TIMEZONE('utc'::text, NOW()) AND s.status != 'active' THEN 'expired'
        ELSE s.status
    END as effective_status
FROM public.subscriptions s
LEFT JOIN public.usage_limits ul ON s.user_id = ul.user_id;

-- ===========================================
-- 2. CRIAR TABELA usage_limits (se não existir)
-- ===========================================

CREATE TABLE IF NOT EXISTS public.usage_limits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    
    -- Contadores mensais (resetam todo mês)
    transactions_count INTEGER DEFAULT 0,
    categories_count INTEGER DEFAULT 0,
    cards_count INTEGER DEFAULT 0,
    
    -- Período de contagem atual
    period_start TIMESTAMP WITH TIME ZONE DEFAULT date_trunc('month', TIMEZONE('utc'::text, NOW())) NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE DEFAULT (date_trunc('month', TIMEZONE('utc'::text, NOW())) + INTERVAL '1 month') NOT NULL,
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ===========================================
-- 3. HABILITAR RLS E CRIAR POLÍTICAS
-- ===========================================

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_limits ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view own usage" ON public.usage_limits;
DROP POLICY IF EXISTS "Users can update own usage" ON public.usage_limits;

-- Criar políticas
CREATE POLICY "Users can view own subscription" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own usage" ON public.usage_limits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own usage" ON public.usage_limits
    FOR UPDATE USING (auth.uid() = user_id);

-- ===========================================
-- 4. CRIAR ASSINATURA PARA USUÁRIO ATUAL
-- ===========================================

-- Inserir assinatura gratuita para o usuário atual (se não existir)
INSERT INTO public.subscriptions (
    user_id, 
    plan_id, 
    status,
    trial_start,
    trial_end
) 
SELECT 
    id,
    'free',
    'trialing',
    TIMEZONE('utc'::text, NOW()),
    TIMEZONE('utc'::text, NOW()) + INTERVAL '30 days'
FROM auth.users 
WHERE email = 'arthurcos33@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET
    plan_id = 'free',
    status = 'trialing',
    trial_start = TIMEZONE('utc'::text, NOW()),
    trial_end = TIMEZONE('utc'::text, NOW()) + INTERVAL '30 days',
    updated_at = TIMEZONE('utc'::text, NOW());

-- Inserir uso para o usuário atual (se não existir)
INSERT INTO public.usage_limits (user_id) 
SELECT id FROM auth.users WHERE email = 'arthurcos33@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET
    transactions_count = 0,
    categories_count = 0,
    cards_count = 0,
    period_start = date_trunc('month', TIMEZONE('utc'::text, NOW())),
    period_end = date_trunc('month', TIMEZONE('utc'::text, NOW())) + INTERVAL '1 month',
    updated_at = TIMEZONE('utc'::text, NOW());

-- ===========================================
-- 5. ATUALIZAR FUNÇÃO handle_new_user
-- ===========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Cria o perfil do usuário
    INSERT INTO public.profiles (id, name, username, email)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'name', 'Novo Usuário'), 
        NEW.raw_user_meta_data->>'username',
        NEW.email
    ) ON CONFLICT (id) DO NOTHING;
    
    -- Não criar categorias automáticas - deixar conta limpa
    -- PERFORM public.create_default_categories(NEW.id);
    
    -- Cria assinatura gratuita com 30 dias de teste
    INSERT INTO public.subscriptions (
        user_id, 
        plan_id, 
        status,
        trial_start,
        trial_end
    ) VALUES (
        NEW.id,
        'free',
        'trialing',
        TIMEZONE('utc'::text, NOW()),
        TIMEZONE('utc'::text, NOW()) + INTERVAL '30 days'
    ) ON CONFLICT (user_id) DO NOTHING;
    
    -- Cria contadores de uso
    INSERT INTO public.usage_limits (user_id) 
    VALUES (NEW.id) 
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- 6. GRANTS DE PERMISSÃO
-- ===========================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.usage_limits TO authenticated;
GRANT SELECT ON public.user_subscription_status TO authenticated;

-- ===========================================
-- 7. VERIFICAÇÃO FINAL
-- ===========================================

SELECT 
    'SISTEMA CORRIGIDO COM SUCESSO! ✅' as status,
    COUNT(*) as total_subscriptions
FROM public.subscriptions;

-- Mostrar dados do usuário atual
SELECT 
    'DADOS DO USUÁRIO ATUAL:' as info,
    user_id,
    plan_id,
    status,
    trial_days_remaining,
    effective_status
FROM public.user_subscription_status 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'arthurcos33@gmail.com'); 