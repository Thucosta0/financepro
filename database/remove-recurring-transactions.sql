-- MIGRATION: Remove recurring transactions functionality
-- This migration removes the recurring_transactions table and all related references

-- ===========================================
-- 1. REMOVE FOREIGN KEY CONSTRAINT
-- ===========================================

-- Remove the foreign key constraint from transactions table
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS fk_recurring_transaction;

-- ===========================================
-- 2. REMOVE COLUMNS FROM TRANSACTIONS TABLE
-- ===========================================

-- Remove recurring-related columns from transactions table
ALTER TABLE public.transactions 
DROP COLUMN IF EXISTS is_recurring,
DROP COLUMN IF EXISTS recurring_transaction_id;

-- ===========================================
-- 3. DROP RECURRING TRANSACTIONS TABLE
-- ===========================================

-- Drop the recurring_transactions table completely
DROP TABLE IF EXISTS public.recurring_transactions CASCADE;

-- ===========================================
-- 4. REMOVE INDEXES
-- ===========================================

-- Remove indexes related to recurring transactions
DROP INDEX IF EXISTS idx_recurring_user_id;
DROP INDEX IF EXISTS idx_recurring_active;
DROP INDEX IF EXISTS idx_recurring_next_date;

-- ===========================================
-- 5. VERIFICATION
-- ===========================================

-- Verify that the table and columns have been removed
SELECT 
    'recurring_transactions table exists' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'recurring_transactions'
        ) THEN 'FAILED - Table still exists'
        ELSE 'SUCCESS - Table removed'
    END as status;

-- Verify that columns have been removed from transactions table
SELECT 
    'recurring columns removed' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'transactions'
            AND column_name IN ('is_recurring', 'recurring_transaction_id')
        ) THEN 'FAILED - Columns still exist'
        ELSE 'SUCCESS - Columns removed'
    END as status;

-- List remaining tables to confirm
SELECT 
    'remaining tables' as check_type,
    string_agg(table_name, ', ' ORDER BY table_name) as tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- Show the final structure of the transactions table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'transactions'
ORDER BY ordinal_position; 