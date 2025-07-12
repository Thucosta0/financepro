-- Migração para adicionar campos de parcelamento na tabela transactions

-- Adicionar campos para parcelamento
ALTER TABLE public.transactions 
ADD COLUMN installment_number INTEGER,
ADD COLUMN total_installments INTEGER,
ADD COLUMN installment_group_id UUID;

-- Adicionar índice para melhor performance nas consultas de parcelas
CREATE INDEX idx_transactions_installment_group ON public.transactions(installment_group_id) WHERE installment_group_id IS NOT NULL;

-- Adicionar comentários para documentação
COMMENT ON COLUMN public.transactions.installment_number IS 'Número da parcela atual (1, 2, 3...)';
COMMENT ON COLUMN public.transactions.total_installments IS 'Total de parcelas da transação (6, 12, 24...)';
COMMENT ON COLUMN public.transactions.installment_group_id IS 'ID para agrupar parcelas da mesma transação parcelada'; 