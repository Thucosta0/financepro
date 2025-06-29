-- ===========================================
-- REMOVER LIMITAÇÕES DO PERÍODO DE TESTE
-- Script para liberar TODAS as funcionalidades durante os 30 dias
-- ===========================================

-- 1. ATUALIZAR FUNÇÃO DE VERIFICAÇÃO DE LIMITES
CREATE OR REPLACE FUNCTION public.check_user_limits(user_uuid UUID, limit_type TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_subscription RECORD;
BEGIN
    -- Buscar assinatura do usuário
    SELECT * INTO user_subscription 
    FROM public.subscriptions 
    WHERE user_id = user_uuid;
    
    -- Se não tem assinatura, não pode usar
    IF user_subscription IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- 🎉 NOVO: DURANTE O TRIAL OU PRO = ACESSO COMPLETO SEM LIMITAÇÕES
    IF user_subscription.status = 'trialing' OR 
       user_subscription.trial_end > TIMEZONE('utc'::text, NOW()) OR
       (user_subscription.status = 'active' AND user_subscription.plan_id = 'pro') THEN
        RETURN TRUE;
    END IF;
    
    -- Se trial expirou e não tem plano ativo, bloquear
    IF user_subscription.trial_end < TIMEZONE('utc'::text, NOW()) AND 
       user_subscription.status != 'active' THEN
        RETURN FALSE;
    END IF;
    
    -- Para qualquer outro caso após o trial expirado = permitir
    -- (só bloqueia se realmente expirou e não tem plano pago)
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. ATUALIZAR VIEW DE STATUS DE ASSINATURA
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
    
    -- 🎉 NOVO: LIMITES ILIMITADOS DURANTE TRIAL
    CASE 
        WHEN s.status = 'trialing' OR s.trial_end > TIMEZONE('utc'::text, NOW()) OR s.plan_id = 'pro' THEN -1
        ELSE 0
    END as transactions_remaining,
    CASE 
        WHEN s.status = 'trialing' OR s.trial_end > TIMEZONE('utc'::text, NOW()) OR s.plan_id = 'pro' THEN -1
        ELSE 0
    END as categories_remaining,
    CASE 
        WHEN s.status = 'trialing' OR s.trial_end > TIMEZONE('utc'::text, NOW()) OR s.plan_id = 'pro' THEN -1
        ELSE 0
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

-- 3. ATUALIZAR FUNÇÃO DE CRIAÇÃO DE ASSINATURA GRATUITA
CREATE OR REPLACE FUNCTION public.create_free_subscription(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    -- Criar assinatura gratuita com 30 dias de teste COMPLETO
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
    ) ON CONFLICT (user_id) DO UPDATE SET
        plan_id = 'free',
        status = 'trialing',
        trial_start = TIMEZONE('utc'::text, NOW()),
        trial_end = TIMEZONE('utc'::text, NOW()) + INTERVAL '30 days',
        updated_at = TIMEZONE('utc'::text, NOW());
    
    -- Criar contadores de uso (mas não serão limitados durante trial)
    INSERT INTO public.usage_limits (user_id) 
    VALUES (user_uuid) 
    ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- 4. RESETAR ASSINATURAS EXISTENTES PARA TRIAL COMPLETO
UPDATE public.subscriptions 
SET 
    plan_id = 'free',
    status = 'trialing',
    trial_start = TIMEZONE('utc'::text, NOW()),
    trial_end = TIMEZONE('utc'::text, NOW()) + INTERVAL '30 days',
    updated_at = TIMEZONE('utc'::text, NOW())
WHERE plan_id = 'free' AND status != 'active';

-- 5. RESETAR CONTADORES DE USO (OPCIONAL)
UPDATE public.usage_limits 
SET 
    transactions_count = 0,
    categories_count = 0,
    cards_count = 0,
    period_start = date_trunc('month', TIMEZONE('utc'::text, NOW())),
    period_end = date_trunc('month', TIMEZONE('utc'::text, NOW())) + INTERVAL '1 month',
    updated_at = TIMEZONE('utc'::text, NOW());

-- 6. ATUALIZAR FUNÇÃO DE INCREMENTO (NÃO SERÁ LIMITANTE DURANTE TRIAL)
CREATE OR REPLACE FUNCTION public.increment_usage(user_uuid UUID, usage_type TEXT)
RETURNS VOID AS $$
DECLARE
    user_subscription RECORD;
BEGIN
    -- Buscar assinatura do usuário
    SELECT * INTO user_subscription 
    FROM public.subscriptions 
    WHERE user_id = user_uuid;
    
    -- 🎉 DURANTE TRIAL: APENAS CONTA, MAS NÃO LIMITA
    -- (Isso é para estatísticas, não para bloquear)
    
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

-- 7. GRANTS DE PERMISSÃO
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.usage_limits TO authenticated;
GRANT SELECT ON public.user_subscription_status TO authenticated;

-- 8. VERIFICAÇÃO DO STATUS ATUAL
SELECT 
    'LIMITAÇÕES DE TRIAL REMOVIDAS! ✅' as status,
    'Agora todos têm acesso COMPLETO durante 30 dias' as message;

-- Ver status de todos os usuários
SELECT 
    user_id,
    plan_id,
    status,
    trial_days_remaining,
    effective_status,
    transactions_remaining,
    categories_remaining,
    cards_remaining
FROM public.user_subscription_status; 