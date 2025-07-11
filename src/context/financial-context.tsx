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
  
  // Paginação de transações
  loadMoreTransactions: () => Promise<void>
  hasMoreTransactions: boolean
  transactionsLoading: boolean
  refreshTransactions: () => Promise<void>
  
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
  processRecurringTransactions: () => Promise<void>
  
  // Orçamentos
  addBudget: (budget: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateBudget: (id: string, budget: Partial<Budget>) => Promise<void>
  deleteBudget: (id: string) => Promise<void>
  
  // Resumo Financeiro
  getFinancialSummary: () => { receitas: number; despesas: number; saldo: number; categorias: string }
  getCompleteSummary: () => { receitas: number; despesas: number; saldo: number; categorias: string }
  
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

  // Estados de paginação para transações
  const [transactionsPage, setTransactionsPage] = useState(0)
  const [hasMoreTransactions, setHasMoreTransactions] = useState(true)
  const [transactionsLoading, setTransactionsLoading] = useState(false)
  const TRANSACTIONS_PER_PAGE = 50

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
      // Reset paginação
      setTransactionsPage(0)
      setHasMoreTransactions(true)
    }
  }, [user])

  // Processar transações recorrentes - OTIMIZADO: apenas se necessário
  useEffect(() => {
    if (!user || isLoading || recurringTransactions.length === 0) return
    
    // Verificar se há transações realmente vencidas antes de processar
    const now = new Date()
    const hasOverdue = recurringTransactions.some(rt => 
      rt.is_active && new Date(rt.next_execution_date) <= now
    )
    
    if (hasOverdue) {
      processRecurringTransactions()
    }
  }, [user, isLoading, recurringTransactions])

  // Processar transações recorrentes periodicamente - OTIMIZADO: 30min em vez de 10min
  useEffect(() => {
    if (!user || isLoading || recurringTransactions.length === 0) return
    
    const interval = setInterval(async () => {
      const now = new Date()
      const hasOverdue = recurringTransactions.some(rt => 
        rt.is_active && new Date(rt.next_execution_date) <= now
      )
      
      if (hasOverdue) {
        await processRecurringTransactions()
      }
    }, 30 * 60 * 1000) // 30 minutos
    
    return () => clearInterval(interval)
  }, [user, isLoading, recurringTransactions])

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

  const loadTransactions = async (page = 0, reset = false) => {
    if (!user) return
    
    if (page === 0 || reset) {
      setTransactionsLoading(true)
    }
    
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        category:categories(*),
        card:cards!card_id(*)
      `)
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false })
      .range(page * TRANSACTIONS_PER_PAGE, (page + 1) * TRANSACTIONS_PER_PAGE - 1)
    
    if (error) {
      console.error('Error loading transactions:', error)
      setTransactionsLoading(false)
      return
    }
    
    const newTransactions = data || []
    
    if (reset || page === 0) {
      setTransactions(newTransactions)
    } else {
      setTransactions(prev => [...prev, ...newTransactions])
    }
    
    setHasMoreTransactions(newTransactions.length === TRANSACTIONS_PER_PAGE)
    setTransactionsPage(page)
    setTransactionsLoading(false)
  }

  const loadMoreTransactions = async () => {
    if (!hasMoreTransactions || transactionsLoading) return
    await loadTransactions(transactionsPage + 1)
  }

  const loadRecurringTransactions = async () => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('recurring_transactions')
      .select(`
        *,
        category:categories(*),
        card:cards!card_id(*)
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
    
    // OTIMIZAÇÃO: Atualizar apenas as transações que usam essa categoria
    setTransactions(prev => prev.map(transaction => 
      transaction.category_id === id 
        ? { ...transaction, category: data }
        : transaction
    ))
    
    // Atualizar também transações recorrentes
    setRecurringTransactions(prev => prev.map(transaction => 
      transaction.category_id === id 
        ? { ...transaction, category: data }
        : transaction
    ))
    
    // Atualizar orçamentos relacionados
    setBudgets(prev => prev.map(budget => 
      budget.category_id === id 
        ? { ...budget, category: data }
        : budget
    ))
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
    // OTIMIZAÇÃO: Não recarregar transações - o RLS do banco já impede visualização
    // As transações com categoria deletada não serão mais visíveis due to FK constraint
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
    
    // OTIMIZAÇÃO: Atualizar apenas as transações que usam esse cartão
    setTransactions(prev => prev.map(transaction => 
      transaction.card_id === id 
        ? { ...transaction, card: data }
        : transaction
    ))
    
    // Atualizar também transações recorrentes
    setRecurringTransactions(prev => prev.map(transaction => 
      transaction.card_id === id 
        ? { ...transaction, card: data }
        : transaction
    ))
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
    // OTIMIZAÇÃO: Não recarregar transações - o RLS do banco já impede visualização
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
        card:cards!card_id(*)
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
    
    // Filtrar apenas os campos válidos da tabela transactions
    const validFields = {
      description: transactionData.description,
      amount: transactionData.amount,
      type: transactionData.type,
      category_id: transactionData.category_id,
      card_id: transactionData.card_id,
      transaction_date: transactionData.transaction_date,
      is_recurring: transactionData.is_recurring,
      recurring_transaction_id: transactionData.recurring_transaction_id,
      notes: transactionData.notes,
      is_completed: transactionData.is_completed
    }
    
    // Remover campos undefined
    const cleanData = Object.fromEntries(
      Object.entries(validFields).filter(([_, value]) => value !== undefined)
    )
    
    const { data, error } = await supabase
      .from('transactions')
      .update(cleanData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`
        *,
        category:categories(*),
        card:cards!card_id(*)
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
        card:cards!card_id(*)
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
        card:cards!card_id(*)
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

  const processRecurringTransactions = async () => {
    if (!user) return
    
    const today = new Date().toISOString().split('T')[0]
    
    // Buscar transações recorrentes que precisam ser executadas
    const dueRecurringTransactions = recurringTransactions.filter(
      rt => rt.is_active && rt.next_execution_date <= today
    )
    
    if (dueRecurringTransactions.length === 0) return
    
    // Executar todas as transações recorrentes vencidas
    for (const rt of dueRecurringTransactions) {
      try {
        await executeRecurringTransaction(rt.id)
      } catch (error) {
        console.error(`Erro ao executar transação recorrente ${rt.description}:`, error)
      }
    }
    
    // Recarregar transações após executar as recorrentes para atualizar o gráfico
    await loadTransactions()
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
    // Filtrar apenas transações não finalizadas para o dashboard
    const pendingTransactions = transactions.filter(t => !t.is_completed)
    
    const receitas = pendingTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const despesas = pendingTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const saldo = receitas - despesas
    
    const categoriasUsadas = new Set(pendingTransactions.map(t => t.category?.name).filter(Boolean)).size
    
    return {
      receitas,
      despesas,
      saldo,
      categorias: `${categoriasUsadas} categoria${categoriasUsadas !== 1 ? 's' : ''}`
    }
  }

  const getCompleteSummary = () => {
    // Incluir todas as transações (finalizadas e pendentes)
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
      processRecurringTransactions,
      addBudget,
      updateBudget,
      deleteBudget,
      getFinancialSummary,
      getCompleteSummary,
      isLoading,
      loadData,
      loadMoreTransactions,
      hasMoreTransactions,
      transactionsLoading,
      refreshTransactions: () => loadTransactions(0, true)
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