'use client'

import { useState } from 'react'
import { useFinancial } from '@/context/financial-context'
import { NewTransactionModal } from '@/components/new-transaction-modal'
import { RecurringTransactionModal } from '@/components/recurring-transaction-modal'
import { ProtectedRoute } from '@/components/protected-route'
import { ExpenseByCategoryChart, IncomeVsExpenseChart, BalanceEvolutionChart, TopCategoriesChart, WeeklySpendingChart } from '@/components/dashboard/charts'
import { Repeat, Plus, TrendingUp, TrendingDown, DollarSign, Target, Calendar, PieChart, BarChart3, Activity } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewTransactionModal, setShowNewTransactionModal] = useState(false)
  const [showRecurringModal, setShowRecurringModal] = useState(false)
  const [activeChart, setActiveChart] = useState('overview')
  const { transactions, recurringTransactions } = useFinancial()
  
  // Calcula dados financeiros reais
  const receitas = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
    
  const despesas = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
    
  const saldo = receitas - despesas
  const previousMonthBalance = 0 // Valor que pode vir de histórico futuro

  const filteredTransactions = transactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Dados das transações recorrentes
  const activeRecurring = recurringTransactions.filter(r => r.is_active)
  const totalRecurringIncome = activeRecurring
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0)
  const totalRecurringExpense = activeRecurring
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  // Cálculos para insights
  const avgDailyExpense = despesas / 30
  const categoryCount = transactions
    .filter(t => t.category?.name)
    .reduce((acc, t) => {
      const name = t.category?.name || 'Sem categoria'
      acc[name] = (acc[name] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  const topCategory = Object.entries(categoryCount).sort(([,a], [,b]) => b - a)[0]

  const chartTabs = [
    { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
    { id: 'categories', label: 'Por Categoria', icon: PieChart },
    { id: 'evolution', label: 'Evolução', icon: TrendingUp },
    { id: 'weekly', label: 'Semanal', icon: Calendar },
    { id: 'top', label: 'Top Categorias', icon: Activity }
  ]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard Financeiro</h1>
              <p className="text-gray-600 mt-1">Visão completa das suas finanças</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowNewTransactionModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Transação
              </button>
              <button
                onClick={() => setShowRecurringModal(true)}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Repeat className="h-4 w-4 mr-2" />
                Transação Fixa
              </button>
            </div>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-sm text-gray-500">Este mês</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Receitas</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(receitas)}</p>
                {totalRecurringIncome > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    🔄 {formatCurrency(totalRecurringIncome)} fixas/mês
                  </p>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
                <span className="text-sm text-gray-500">Este mês</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Despesas</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(despesas)}</p>
                {totalRecurringExpense > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    🔄 {formatCurrency(totalRecurringExpense)} fixas/mês
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-sm text-gray-500">Saldo atual</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Saldo</p>
                <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(saldo)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Média diária: {formatCurrency(avgDailyExpense)}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-sm text-gray-500">Categoria top</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {topCategory ? topCategory[0] : 'Nenhuma'}
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {topCategory ? `${topCategory[1]}x` : '0'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Transações registradas
                </p>
              </div>
            </div>
          </div>

          {/* Seção de Gráficos */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <h2 className="text-xl font-semibold text-gray-900">Análise Visual</h2>
                <div className="flex flex-wrap gap-2">
                  {chartTabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveChart(tab.id)}
                        className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          activeChart === tab.id
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {tab.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {activeChart === 'overview' && (
                <div>
                  <h3 className="text-lg font-medium mb-4 text-gray-900">Receitas vs Despesas por Mês</h3>
                  <IncomeVsExpenseChart transactions={transactions} />
                </div>
              )}
              
              {activeChart === 'categories' && (
                <div>
                  <h3 className="text-lg font-medium mb-4 text-gray-900">Distribuição de Despesas por Categoria</h3>
                  <ExpenseByCategoryChart transactions={transactions} />
                </div>
              )}
              
              {activeChart === 'evolution' && (
                <div>
                  <h3 className="text-lg font-medium mb-4 text-gray-900">Evolução do Saldo</h3>
                  <BalanceEvolutionChart transactions={transactions} />
                </div>
              )}
              
              {activeChart === 'weekly' && (
                <div>
                  <h3 className="text-lg font-medium mb-4 text-gray-900">Movimentação dos Últimos 7 Dias</h3>
                  <WeeklySpendingChart transactions={transactions} />
                </div>
              )}
              
              {activeChart === 'top' && (
                <div>
                  <h3 className="text-lg font-medium mb-4 text-gray-900">Top 5 Categorias de Despesa</h3>
                  <TopCategoriesChart transactions={transactions} />
                </div>
              )}
            </div>
          </div>

          {/* Duas colunas - Transações Recentes e Próximas Recorrentes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transações Recentes */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Transações Recentes</h3>
                  <Link href="/transacoes" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Ver todas
                  </Link>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.slice(0, 5).map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900 truncate">{transaction.description}</p>
                            {transaction.is_recurring && (
                              <span className="text-purple-600 text-xs">🔄</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {transaction.category?.name} • {formatDate(transaction.transaction_date)}
                          </p>
                        </div>
                        <div className={`font-medium ml-4 text-right ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">📊</div>
                      <p>Nenhuma transação encontrada</p>
                      <button
                        onClick={() => setShowNewTransactionModal(true)}
                        className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Criar primeira transação
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Próximas Transações Recorrentes */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Próximas Recorrentes</h3>
                  <Link href="/transacoes-fixas" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                    Gerenciar
                  </Link>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {activeRecurring.length > 0 ? (
                    activeRecurring
                      .sort((a, b) => new Date(a.next_execution_date).getTime() - new Date(b.next_execution_date).getTime())
                      .slice(0, 4)
                      .map((recurring) => (
                        <div key={recurring.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">🔄</span>
                              <span className="text-sm font-medium text-gray-900 truncate">{recurring.description}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Próxima execução: {formatDate(recurring.next_execution_date)}
                            </p>
                          </div>
                          <span className={`text-sm font-medium ml-2 flex-shrink-0 ${
                            recurring.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {recurring.type === 'income' ? '+' : '-'}{formatCurrency(recurring.amount)}
                          </span>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">🔄</div>
                      <p>Nenhuma transação recorrente</p>
                      <button
                        onClick={() => setShowRecurringModal(true)}
                        className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
                      >
                        Criar primeira recorrente
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>


        </div>

        {/* Modais */}
        <NewTransactionModal
          isOpen={showNewTransactionModal}
          onClose={() => setShowNewTransactionModal(false)}
        />
        <RecurringTransactionModal
          isOpen={showRecurringModal}
          onClose={() => setShowRecurringModal(false)}
        />
      </div>
    </ProtectedRoute>
  )
} 