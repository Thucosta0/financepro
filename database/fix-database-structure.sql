-- SCRIPT PARA VERIFICAR E CORRIGIR ESTRUTURA DO BANCO
-- Execute no SQL Editor do Supabase

-- 1. VERIFICAR SE CAMPO is_completed EXISTE
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'transactions' 
AND column_name = 'is_completed';

-- 2. ADICIONAR CAMPO is_completed SE NECESSÁRIO
-- (Execute apenas se o SELECT acima retornar vazio)
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS is_completed BOOLEAN NOT NULL DEFAULT FALSE;

-- 3. VERIFICAR ESTRUTURA COMPLETA DA TABELA TRANSACTIONS
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'transactions' 
ORDER BY ordinal_position;

-- 4. TESTE DE JOIN PARA VERIFICAR SE AS RELAÇÕES FUNCIONAM
SELECT 
    t.id,
    t.description,
    t.amount,
    t.is_completed,
    c.name as category_name,
    cards.name as card_name,
    cards.bank as card_bank
FROM public.transactions t
LEFT JOIN public.categories c ON t.category_id = c.id
LEFT JOIN public.cards ON t.card_id = cards.id
LIMIT 1; 