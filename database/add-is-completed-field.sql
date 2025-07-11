-- Adiciona campo is_completed na tabela transactions
-- Execute este comando no SQL Editor do Supabase

ALTER TABLE public.transactions 
ADD COLUMN is_completed BOOLEAN NOT NULL DEFAULT FALSE;

-- Adiciona comentário para documentar o campo
COMMENT ON COLUMN public.transactions.is_completed IS 'Indica se a transação foi finalizada/completada pelo usuário';

-- Adiciona índice para performance nas consultas por status
CREATE INDEX idx_transactions_completed ON public.transactions(is_completed);

-- Verificação - mostra a estrutura da tabela atualizada
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'transactions' 
AND column_name = 'is_completed'; 