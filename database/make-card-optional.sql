-- Migração para tornar card_id opcional na tabela transactions

-- Primeiro, remover a constraint NOT NULL do card_id
ALTER TABLE public.transactions ALTER COLUMN card_id DROP NOT NULL;

-- Atualizar o índice para permitir valores NULL
DROP INDEX IF EXISTS idx_transactions_card;
CREATE INDEX idx_transactions_card ON public.transactions(card_id) WHERE card_id IS NOT NULL; 