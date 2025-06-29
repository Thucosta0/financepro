-- MIGRAÇÃO PARA SISTEMA DE ASSINATURAS E PAGAMENTOS
-- Execute este script no SQL Editor do Supabase Dashboard

-- ===========================================
-- 1. TABELA DE ASSINATURAS
-- ===========================================

CREATE TABLE public.subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    
    -- Informações do plano
    plan_id TEXT NOT NULL DEFAULT 'free', -- 'free' ou 'pro'
    status TEXT NOT NULL DEFAULT 'trialing', -- 'trialing', 'active', 'canceled', 'past_due', 'unpaid'
    
    -- Datas importantes
    trial_start TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    trial_end TIMESTAMP WITH TIME ZONE DEFAULT (TIMEZONE('utc'::text, NOW()) + INTERVAL '30 days') NOT NULL,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    
    -- Stripe
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    stripe_price_id TEXT,
    
    -- Metadados
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ===========================================
-- 2. TABELA DE LIMITES DE USO
-- ===========================================

CREATE TABLE public.usage_limits (
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
-- 3. ÍNDICES PARA PERFORMANCE
-- ===========================================

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_trial_end ON public.subscriptions(trial_end);
CREATE INDEX idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription ON public.subscriptions(stripe_subscription_id);

CREATE INDEX idx_usage_limits_user_id ON public.usage_limits(user_id);
CREATE INDEX idx_usage_limits_period ON public.usage_limits(period_start, period_end);

-- ===========================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ===========================================

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_limits ENABLE ROW LEVEL SECURITY;

-- Políticas para subscriptions
CREATE POLICY "Users can view own subscription" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para usage_limits
CREATE POLICY "Users can view own usage" ON public.usage_limits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own usage" ON public.usage_limits
    FOR UPDATE USING (auth.uid() = user_id);

-- ===========================================
-- 5. TRIGGERS PARA UPDATED_AT
-- ===========================================

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_usage_limits_updated_at
    BEFORE UPDATE ON public.usage_limits
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ===========================================
-- 6. FUNÇÃO PARA CRIAR ASSINATURA GRATUITA AUTOMÁTICA
-- ===========================================

CREATE OR REPLACE FUNCTION public.create_free_subscription(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    -- Criar assinatura gratuita com 30 dias de teste
    INSERT INTO public.subscriptions (
        user_id, 
        plan_id, 
        status,
        trial_start,
        trial_end
    ) VALUES (
        user_uuid,
        'free',
        'trialing',
        TIMEZONE('utc'::text, NOW()),
        TIMEZONE('utc'::text, NOW()) + INTERVAL '30 days'
    ) ON CONFLICT (user_id) DO NOTHING; -- Evita duplicatas
    
    -- Criar contadores de uso
    INSERT INTO public.usage_limits (user_id) 
    VALUES (user_uuid) 
    ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- 7. ATUALIZAR TRIGGER DE NOVOS USUÁRIOS
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
    );
    
    -- Cria as categorias padrão
    PERFORM public.create_default_categories(NEW.id);
    
    -- Cria assinatura gratuita com 30 dias de teste
    PERFORM public.create_free_subscription(NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- 8. FUNÇÃO PARA VERIFICAR LIMITES
-- ===========================================

CREATE OR REPLACE FUNCTION public.check_user_limits(user_uuid UUID, limit_type TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_subscription RECORD;
    user_usage RECORD;
    max_limit INTEGER;
BEGIN
    -- Buscar assinatura do usuário
    SELECT * INTO user_subscription 
    FROM public.subscriptions 
    WHERE user_id = user_uuid;
    
    -- Se não tem assinatura, não pode usar
    IF user_subscription IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Se está em período de teste ou tem plano PRO, pode usar ilimitadamente
    IF user_subscription.status = 'trialing' OR 
       (user_subscription.status = 'active' AND user_subscription.plan_id = 'pro') THEN
        RETURN TRUE;
    END IF;
    
    -- Se teste expirou e não tem plano ativo, bloquear
    IF user_subscription.trial_end < TIMEZONE('utc'::text, NOW()) AND 
       user_subscription.status != 'active' THEN
        RETURN FALSE;
    END IF;
    
    -- Buscar uso atual
    SELECT * INTO user_usage 
    FROM public.usage_limits 
    WHERE user_id = user_uuid;
    
    -- Se não tem registro de uso, criar
    IF user_usage IS NULL THEN
        INSERT INTO public.usage_limits (user_id) VALUES (user_uuid);
        RETURN TRUE;
    END IF;
    
    -- Verificar limites para plano FREE
    IF user_subscription.plan_id = 'free' THEN
        CASE limit_type
            WHEN 'transactions' THEN max_limit := 100;
            WHEN 'categories' THEN max_limit := 10;
            WHEN 'cards' THEN max_limit := 1;
            ELSE RETURN TRUE;
        END CASE;
        
        CASE limit_type
            WHEN 'transactions' THEN RETURN user_usage.transactions_count < max_limit;
            WHEN 'categories' THEN RETURN user_usage.categories_count < max_limit;
            WHEN 'cards' THEN RETURN user_usage.cards_count < max_limit;
            ELSE RETURN TRUE;
        END CASE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- 9. FUNÇÃO PARA INCREMENTAR USO
-- ===========================================

CREATE OR REPLACE FUNCTION public.increment_usage(user_uuid UUID, usage_type TEXT)
RETURNS VOID AS $$
BEGIN
    -- Atualizar contador baseado no tipo
    CASE usage_type
        WHEN 'transactions' THEN
            UPDATE public.usage_limits 
            SET transactions_count = transactions_count + 1,
                updated_at = TIMEZONE('utc'::text, NOW())
            WHERE user_id = user_uuid;
        WHEN 'categories' THEN
            UPDATE public.usage_limits 
            SET categories_count = categories_count + 1,
                updated_at = TIMEZONE('utc'::text, NOW())
            WHERE user_id = user_uuid;
        WHEN 'cards' THEN
            UPDATE public.usage_limits 
            SET cards_count = cards_count + 1,
                updated_at = TIMEZONE('utc'::text, NOW())
            WHERE user_id = user_uuid;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- 10. VIEW PARA STATUS DE ASSINATURA
-- ===========================================

CREATE OR REPLACE VIEW public.user_subscription_status AS
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
    ul.transactions_count,
    ul.categories_count,
    ul.cards_count,
    -- Verificações de limites
    CASE s.plan_id
        WHEN 'free' THEN 100 - ul.transactions_count
        ELSE -1
    END as transactions_remaining,
    CASE s.plan_id
        WHEN 'free' THEN 10 - ul.categories_count
        ELSE -1
    END as categories_remaining,
    CASE s.plan_id
        WHEN 'free' THEN 1 - ul.cards_count
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
-- GRANTS DE PERMISSÃO
-- ===========================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.usage_limits TO authenticated;
GRANT SELECT ON public.user_subscription_status TO authenticated;

-- ===========================================
-- COMENTÁRIOS DAS TABELAS
-- ===========================================

COMMENT ON TABLE public.subscriptions IS 'Assinaturas dos usuários com integração Stripe';
COMMENT ON TABLE public.usage_limits IS 'Contadores de uso para limites de planos';
COMMENT ON VIEW public.user_subscription_status IS 'View consolidada do status de assinatura do usuário';

-- Concluído! Execute este script no SQL Editor do Supabase
SELECT 'SISTEMA DE ASSINATURAS CRIADO COM SUCESSO! ✅' AS status; 