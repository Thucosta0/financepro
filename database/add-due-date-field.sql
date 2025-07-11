-- Adicionar campo de data de vencimento nas transações
-- Executar no SQL Editor do Supabase

-- Adicionar coluna due_date (data de vencimento)
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS due_date DATE;

-- Comentário explicativo
COMMENT ON COLUMN transactions.due_date IS 'Data de vencimento/pagamento da transação';

-- Verificar a estrutura atualizada
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'transactions' 
ORDER BY ordinal_position; 