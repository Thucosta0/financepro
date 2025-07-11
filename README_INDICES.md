# 📋 Guia: Aplicar Índices de Performance no Supabase

## 🔧 Problema Encontrado
```
ERROR: 42704: data type uuid has no default operator class for access method "gin"
```

## ✅ Solução Aplicada
O problema foi corrigido separando os índices GIN (para full-text search) dos índices compostos com UUID.

## 🚀 Como Aplicar os Índices

### Opção 1: Script Completo (Recomendado)
1. Abra o **SQL Editor** do Supabase
2. Execute o script: `database/performance-indexes.sql`

### Opção 2: Script Simplificado (Se houver problemas)
1. Abra o **SQL Editor** do Supabase
2. Execute o script: `database/performance-indexes-simple.sql`

## 📊 Verificação dos Índices

Execute no SQL Editor para verificar se foram criados:
```sql
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

## 🎯 Índices Criados

### **Transações (Principais)**
- `idx_transactions_user_date_type` - Filtros por usuário + data + tipo
- `idx_transactions_user_category_date` - Filtros por categoria
- `idx_transactions_user_card_date` - Filtros por cartão
- `idx_transactions_user_date_completed` - Ordenação por data + status

### **Outros**
- `idx_recurring_user_active_next` - Transações recorrentes
- `idx_budgets_user_period_category` - Orçamentos
- `idx_profiles_username_lower` - Login por username

## 🔍 Troubleshooting

### Caso ainda tenha erros:
1. **Copie e cole** apenas um índice por vez
2. **Verifique** se cada um foi criado antes de continuar
3. **Pule** os índices que derem erro

### Exemplo de aplicação individual:
```sql
-- Aplicar um por vez
CREATE INDEX IF NOT EXISTS idx_transactions_user_date_type 
ON public.transactions(user_id, transaction_date DESC, type);

-- Verificar se foi criado
SELECT indexname FROM pg_indexes WHERE indexname = 'idx_transactions_user_date_type';
```

---

**Status**: ✅ **Problema corrigido - Pronto para aplicar**  
**Prioridade**: Alta (melhora significativa de performance) 