-- FinancePRO - Dados de Exemplo para Teste
-- Execute após criar o schema principal

-- ===========================================
-- DADOS DE EXEMPLO (APENAS PARA DESENVOLVIMENTO)
-- ===========================================

-- Insere um usuário de exemplo (substitua pelo UUID real do Supabase Auth)
-- Este é apenas um exemplo - o usuário real será criado via Supabase Auth

-- Exemplo de como os dados serão estruturados:
/*

-- Supondo que temos um usuário com ID: 12345678-1234-1234-1234-123456789012

-- Categorias já são criadas automaticamente via trigger

-- Cartões de exemplo
INSERT INTO public.cards (user_id, name, type, bank, card_limit, color, last_digits, is_active) VALUES
('12345678-1234-1234-1234-123456789012', 'Cartão Principal', 'credit', 'Banco do Brasil', 5000.00, '#1e40af', '1234', true),
('12345678-1234-1234-1234-123456789012', 'Conta Corrente', 'debit', 'Banco do Brasil', NULL, '#059669', '5678', true),
('12345678-1234-1234-1234-123456789012', 'Dinheiro', 'cash', 'Carteira', NULL, '#d97706', '', true);

-- Transações de exemplo
WITH user_categories AS (
    SELECT id, name, type FROM public.categories 
    WHERE user_id = '12345678-1234-1234-1234-123456789012'
),
user_cards AS (
    SELECT id, name FROM public.cards 
    WHERE user_id = '12345678-1234-1234-1234-123456789012'
)
INSERT INTO public.transactions (user_id, description, amount, type, category_id, card_id, transaction_date) 
SELECT 
    '12345678-1234-1234-1234-123456789012',
    'Salário Mensal',
    5000.00,
    'income',
    (SELECT id FROM user_categories WHERE name = 'Salário' AND type = 'income'),
    (SELECT id FROM user_cards WHERE name = 'Conta Corrente'),
    CURRENT_DATE - INTERVAL '5 days'
UNION ALL
SELECT 
    '12345678-1234-1234-1234-123456789012',
    'Supermercado',
    250.50,
    'expense',
    (SELECT id FROM user_categories WHERE name = 'Alimentação' AND type = 'expense'),
    (SELECT id FROM user_cards WHERE name = 'Cartão Principal'),
    CURRENT_DATE - INTERVAL '3 days'
UNION ALL
SELECT 
    '12345678-1234-1234-1234-123456789012',
    'Combustível',
    150.00,
    'expense',
    (SELECT id FROM user_categories WHERE name = 'Transporte' AND type = 'expense'),
    (SELECT id FROM user_cards WHERE name = 'Cartão Principal'),
    CURRENT_DATE - INTERVAL '2 days'
UNION ALL
SELECT 
    '12345678-1234-1234-1234-123456789012',
    'Aluguel',
    1200.00,
    'expense',
    (SELECT id FROM user_categories WHERE name = 'Moradia' AND type = 'expense'),
    (SELECT id FROM user_cards WHERE name = 'Conta Corrente'),
    CURRENT_DATE - INTERVAL '1 day';

-- Transações recorrentes de exemplo
WITH user_categories AS (
    SELECT id, name, type FROM public.categories 
    WHERE user_id = '12345678-1234-1234-1234-123456789012'
),
user_cards AS (
    SELECT id, name FROM public.cards 
    WHERE user_id = '12345678-1234-1234-1234-123456789012'
)
INSERT INTO public.recurring_transactions (user_id, description, amount, type, category_id, card_id, frequency, start_date, next_execution_date)
SELECT 
    '12345678-1234-1234-1234-123456789012',
    'Salário Mensal',
    5000.00,
    'income',
    (SELECT id FROM user_categories WHERE name = 'Salário' AND type = 'income'),
    (SELECT id FROM user_cards WHERE name = 'Conta Corrente'),
    'monthly',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 month'
UNION ALL
SELECT 
    '12345678-1234-1234-1234-123456789012',
    'Aluguel',
    1200.00,
    'expense',
    (SELECT id FROM user_categories WHERE name = 'Moradia' AND type = 'expense'),
    (SELECT id FROM user_cards WHERE name = 'Conta Corrente'),
    'monthly',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 month'
UNION ALL
SELECT 
    '12345678-1234-1234-1234-123456789012',
    'Internet',
    89.90,
    'expense',
    (SELECT id FROM user_categories WHERE name = 'Serviços' AND type = 'expense'),
    (SELECT id FROM user_cards WHERE name = 'Cartão Principal'),
    'monthly',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 month';

-- Orçamentos de exemplo
WITH user_categories AS (
    SELECT id, name, type FROM public.categories 
    WHERE user_id = '12345678-1234-1234-1234-123456789012'
)
INSERT INTO public.budgets (user_id, category_id, budget_limit, period, year, month)
SELECT 
    '12345678-1234-1234-1234-123456789012',
    (SELECT id FROM user_categories WHERE name = 'Alimentação' AND type = 'expense'),
    800.00,
    'monthly',
    EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
    EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER
UNION ALL
SELECT 
    '12345678-1234-1234-1234-123456789012',
    (SELECT id FROM user_categories WHERE name = 'Transporte' AND type = 'expense'),
    500.00,
    'monthly',
    EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
    EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER
UNION ALL
SELECT 
    '12345678-1234-1234-1234-123456789012',
    (SELECT id FROM user_categories WHERE name = 'Lazer' AND type = 'expense'),
    300.00,
    'monthly',
    EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
    EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER;

*/

-- ===========================================
-- FUNÇÃO PARA CRIAR DADOS DE EXEMPLO
-- ===========================================

CREATE OR REPLACE FUNCTION public.create_sample_data(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
    salary_category_id UUID;
    food_category_id UUID;
    transport_category_id UUID;
    housing_category_id UUID;
    services_category_id UUID;
    leisure_category_id UUID;
    
    main_card_id UUID;
    checking_account_id UUID;
    cash_id UUID;
BEGIN
    -- Busca as categorias do usuário
    SELECT id INTO salary_category_id FROM public.categories 
    WHERE user_id = user_uuid AND name = 'Salário' AND type = 'income';
    
    SELECT id INTO food_category_id FROM public.categories 
    WHERE user_id = user_uuid AND name = 'Alimentação' AND type = 'expense';
    
    SELECT id INTO transport_category_id FROM public.categories 
    WHERE user_id = user_uuid AND name = 'Transporte' AND type = 'expense';
    
    SELECT id INTO housing_category_id FROM public.categories 
    WHERE user_id = user_uuid AND name = 'Moradia' AND type = 'expense';
    
    SELECT id INTO services_category_id FROM public.categories 
    WHERE user_id = user_uuid AND name = 'Serviços' AND type = 'expense';
    
    SELECT id INTO leisure_category_id FROM public.categories 
    WHERE user_id = user_uuid AND name = 'Lazer' AND type = 'expense';

    -- Cria cartões de exemplo
    INSERT INTO public.cards (user_id, name, type, bank, card_limit, color, last_digits, is_active) VALUES
    (user_uuid, 'Cartão Principal', 'credit', 'Banco do Brasil', 5000.00, '#1e40af', '1234', true)
    RETURNING id INTO main_card_id;
    
    INSERT INTO public.cards (user_id, name, type, bank, color, last_digits, is_active) VALUES
    (user_uuid, 'Conta Corrente', 'debit', 'Banco do Brasil', '#059669', '5678', true)
    RETURNING id INTO checking_account_id;
    
    INSERT INTO public.cards (user_id, name, type, bank, color, last_digits, is_active) VALUES
    (user_uuid, 'Dinheiro', 'cash', 'Carteira', '#d97706', '', true)
    RETURNING id INTO cash_id;

    -- Cria transações de exemplo
    INSERT INTO public.transactions (user_id, description, amount, type, category_id, card_id, transaction_date) VALUES
    (user_uuid, 'Salário Mensal', 5000.00, 'income', salary_category_id, checking_account_id, CURRENT_DATE - INTERVAL '5 days'),
    (user_uuid, 'Supermercado', 250.50, 'expense', food_category_id, main_card_id, CURRENT_DATE - INTERVAL '3 days'),
    (user_uuid, 'Combustível', 150.00, 'expense', transport_category_id, main_card_id, CURRENT_DATE - INTERVAL '2 days'),
    (user_uuid, 'Aluguel', 1200.00, 'expense', housing_category_id, checking_account_id, CURRENT_DATE - INTERVAL '1 day');

    -- Cria transações recorrentes de exemplo
    INSERT INTO public.recurring_transactions (user_id, description, amount, type, category_id, card_id, frequency, start_date, next_execution_date) VALUES
    (user_uuid, 'Salário Mensal', 5000.00, 'income', salary_category_id, checking_account_id, 'monthly', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month'),
    (user_uuid, 'Aluguel', 1200.00, 'expense', housing_category_id, checking_account_id, 'monthly', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month'),
    (user_uuid, 'Internet', 89.90, 'expense', services_category_id, main_card_id, 'monthly', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month');

    -- Cria orçamentos de exemplo
    INSERT INTO public.budgets (user_id, category_id, budget_limit, period, year, month) VALUES
    (user_uuid, food_category_id, 800.00, 'monthly', EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER),
    (user_uuid, transport_category_id, 500.00, 'monthly', EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER),
    (user_uuid, leisure_category_id, 300.00, 'monthly', EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER);

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- INSTRUÇÕES DE USO
-- ===========================================

/*
Para criar dados de exemplo para um usuário específico, execute:

SELECT public.create_sample_data('SEU_USER_ID_AQUI');

Substitua 'SEU_USER_ID_AQUI' pelo UUID real do usuário logado.
Você pode obter este ID com: SELECT auth.uid();
*/ 