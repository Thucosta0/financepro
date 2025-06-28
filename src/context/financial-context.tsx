'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './auth-context'
import { supabase } from '@/lib/supabase-client'
import type { Category, Card, Transaction, RecurringTransaction, Budget } from '@/lib/supabase-client'

interface FinancialContextType {
  // Estados
  categories: Category[]
  cards: Card[]
  transactions: Transaction[]
  recurringTransactions: RecurringTransaction[]
  budgets: Budget[]
  
  // Categorias
  addCategory: (category: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  
  // Cartões
  addCard: (card: Omit<Card, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateCard: (id: string, card: Partial<Card>) => Promise<void>
  deleteCard: (id: string) => Promise<void>
  
  // Transações
  addTransaction: (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  
  // Transações Recorrentes
  addRecurringTransaction: (transaction: Omit<RecurringTransaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateRecurringTransaction: (id: string, transaction: Partial<RecurringTransaction>) => Promise<void>
  deleteRecurringTransaction: (id: string) => Promise<void>
  executeRecurringTransaction: (id: string) => Promise<void>
  
  // Orçamentos
  addBudget: (budget: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateBudget: (id: string, budget: Partial<Budget>) => Promise<void>
  deleteBudget: (id: string) => Promise<void>
  
  // Resumo Financeiro
  getFinancialSummary: () => { receitas: number; despesas: number; saldo: number; categorias: string }
  
  // Loading states
  isLoading: boolean
  loadData: () => Promise<void>
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined)

export function FinancialProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Carrega dados quando o usuário está logado
  useEffect(() => {
    if (user) {
      loadData()
    } else {
      // Limpa dados quando não há usuário
      setCategories([])
      setCards([])
      setTransactions([])
      setRecurringTransactions([])
      setBudgets([])
    }
  }, [user])

  const loadData = useCallback(async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      await Promise.all([
        loadCategories(),
        loadCards(),
        loadTransactions(),
        loadRecurringTransactions(),
        loadBudgets()
      ])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const loadCategories = async () => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('name')
    
    if (error) {
      console.error('Error loading categories:', error)
      return
    }
    
    setCategories(data || [])
  }

  const loadCards = async () => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('user_id', user.id)
      .order('name')
    
    if (error) {
      console.error('Error loading cards:', error)
      return
    }
    
    setCards(data || [])
  }

  const loadTransactions = async () => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        category:categories(*),
        card:cards(*)
      `)
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false })
    
    if (error) {
      console.error('Error loading transactions:', error)
      return
    }
    
    setTransactions(data || [])
  }

  const loadRecurringTransactions = async () => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('recurring_transactions')
      .select(`
        *,
        category:categories(*),
        card:cards(*)
      `)
      .eq('user_id', user.id)
      .order('next_execution_date')
    
    if (error) {
      console.error('Error loading recurring transactions:', error)
      return
    }
    
    setRecurringTransactions(data || [])
  }

  const loadBudgets = async () => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('budgets')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('user_id', user.id)
      .order('year', { ascending: false })
      .order('month', { ascending: false })
    
    if (error) {
      console.error('Error loading budgets:', error)
      return
    }
    
    setBudgets(data || [])
  }

  // === CATEGORIAS ===
  const addCategory = async (categoryData: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('categories')
      .insert({
        ...categoryData,
        user_id: user.id
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error adding category:', error)
      throw error
    }
    
    setCategories(prev => [...prev, data])
  }

  const updateCategory = async (id: string, categoryData: Partial<Category>) => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('categories')
      .update(categoryData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating category:', error)
      throw error
    }
    
    setCategories(prev => prev.map(cat => cat.id === id ? data : cat))
    await loadTransactions() // Recarregar transações para atualizar dados relacionados
  }

  const deleteCategory = async (id: string) => {
    if (!user) return
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Error deleting category:', error)
      throw error
    }
    
    setCategories(prev => prev.filter(cat => cat.id !== id))
    await loadTransactions() // Recarregar transações
  }

  // === CARTÕES ===
  const addCard = async (cardData: Omit<Card, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('cards')
      .insert({
        ...cardData,
        user_id: user.id
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error adding card:', error)
      throw error
    }
    
    setCards(prev => [...prev, data])
  }

  const updateCard = async (id: string, cardData: Partial<Card>) => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('cards')
      .update(cardData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating card:', error)
      throw error
    }
    
    setCards(prev => prev.map(card => card.id === id ? data : card))
    await loadTransactions() // Recarregar transações
  }

  const deleteCard = async (id: string) => {
    if (!user) return
    
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Error deleting card:', error)
      throw error
    }
    
    setCards(prev => prev.filter(card => card.id !== id))
    await loadTransactions() // Recarregar transações
  }

  // === TRANSAÇÕES ===
  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        ...transactionData,
        user_id: user.id
      })
      .select(`
        *,
        category:categories(*),
        card:cards(*)
      `)
      .single()
    
    if (error) {
      console.error('Error adding transaction:', error)
      throw error
    }
    
    setTransactions(prev => [data, ...prev])
  }

  const updateTransaction = async (id: string, transactionData: Partial<Transaction>) => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('transactions')
      .update(transactionData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`
        *,
        category:categories(*),
        card:cards(*)
      `)
      .single()
    
    if (error) {
      console.error('Error updating transaction:', error)
      throw error
    }
    
    setTransactions(prev => prev.map(trans => trans.id === id ? data : trans))
  }

  const deleteTransaction = async (id: string) => {
    if (!user) return
    
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Error deleting transaction:', error)
      throw error
    }
    
    setTransactions(prev => prev.filter(trans => trans.id !== id))
  }

  // === TRANSAÇÕES RECORRENTES ===
  const addRecurringTransaction = async (transactionData: Omit<RecurringTransaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('recurring_transactions')
      .insert({
        ...transactionData,
        user_id: user.id
      })
      .select(`
        *,
        category:categories(*),
        card:cards(*)
      `)
      .single()
    
    if (error) {
      console.error('Error adding recurring transaction:', error)
      throw error
    }
    
    setRecurringTransactions(prev => [...prev, data])
  }

  const updateRecurringTransaction = async (id: string, transactionData: Partial<RecurringTransaction>) => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('recurring_transactions')
      .update(transactionData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`
        *,
        category:categories(*),
        card:cards(*)
      `)
      .single()
    
    if (error) {
      console.error('Error updating recurring transaction:', error)
      throw error
    }
    
    setRecurringTransactions(prev => prev.map(trans => trans.id === id ? data : trans))
  }

  const deleteRecurringTransaction = async (id: string) => {
    if (!user) return
    
    const { error } = await supabase
      .from('recurring_transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Error deleting recurring transaction:', error)
      throw error
    }
    
    setRecurringTransactions(prev => prev.filter(trans => trans.id !== id))
  }

  const calculateNextExecutionDate = (frequency: string, currentDate: string): string => {
    const date = new Date(currentDate)
    
    switch (frequency) {
      case 'weekly':
        date.setDate(date.getDate() + 7)
        break
      case 'monthly':
        date.setMonth(date.getMonth() + 1)
        break
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1)
        break
      default:
        date.setDate(date.getDate() + 1)
    }
    
    return date.toISOString().split('T')[0]
  }

  const executeRecurringTransaction = async (id: string) => {
    if (!user) return
    
    const recurringTransaction = recurringTransactions.find(rt => rt.id === id)
    if (!recurringTransaction) return
    
    // Criar nova transação
    await addTransaction({
      type: recurringTransaction.type,
      amount: recurringTransaction.amount,
      description: recurringTransaction.description,
      category_id: recurringTransaction.category_id,
      card_id: recurringTransaction.card_id,
      transaction_date: new Date().toISOString().split('T')[0],
      is_recurring: true,
      recurring_transaction_id: id
    })
    
    // Atualizar próxima data de execução
    const nextDate = calculateNextExecutionDate(
      recurringTransaction.frequency,
      recurringTransaction.next_execution_date
    )
    
    await updateRecurringTransaction(id, {
      next_execution_date: nextDate
    })
  }

  // === ORÇAMENTOS ===
  const addBudget = async (budgetData: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('budgets')
      .insert({
        ...budgetData,
        user_id: user.id
      })
      .select(`
        *,
        category:categories(*)
      `)
      .single()
    
    if (error) {
      console.error('Error adding budget:', error)
      throw error
    }
    
    setBudgets(prev => [...prev, data])
  }

  const updateBudget = async (id: string, budgetData: Partial<Budget>) => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('budgets')
      .update(budgetData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`
        *,
        category:categories(*)
      `)
      .single()
    
    if (error) {
      console.error('Error updating budget:', error)
      throw error
    }
    
    setBudgets(prev => prev.map(budget => budget.id === id ? data : budget))
  }

  const deleteBudget = async (id: string) => {
    if (!user) return
    
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Error deleting budget:', error)
      throw error
    }
    
    setBudgets(prev => prev.filter(budget => budget.id !== id))
  }

  // === RESUMO FINANCEIRO ===
  const getFinancialSummary = () => {
    const receitas = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const despesas = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const saldo = receitas - despesas
    
    const categoriasUsadas = new Set(transactions.map(t => t.category?.name).filter(Boolean)).size
    
    return {
      receitas,
      despesas,
      saldo,
      categorias: `${categoriasUsadas} categoria${categoriasUsadas !== 1 ? 's' : ''}`
    }
  }

  return (
    <FinancialContext.Provider value={{
      categories,
      cards,
      transactions,
      recurringTransactions,
      budgets,
      addCategory,
      updateCategory,
      deleteCategory,
      addCard,
      updateCard,
      deleteCard,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addRecurringTransaction,
      updateRecurringTransaction,
      deleteRecurringTransaction,
      executeRecurringTransaction,
      addBudget,
      updateBudget,
      deleteBudget,
      getFinancialSummary,
      isLoading,
      loadData
    }}>
      {children}
    </FinancialContext.Provider>
  )
}

export function useFinancial() {
  const context = useContext(FinancialContext)
  if (context === undefined) {
    throw new Error('useFinancial must be used within a FinancialProvider')
  }
  return context
} 