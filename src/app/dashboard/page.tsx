'use client'

import { useState } from 'react'
import { Plus, Repeat, TrendingUp, TrendingDown, DollarSign, Activity, PieChart, BarChart3, Calendar, Target } from 'lucide-react'
import { useFinancial } from '@/context/financial-context'
import { NewTransactionModal } from '@/components/new-transaction-modal'
import { RecurringTransactionModal } from '@/components/recurring-transaction-modal'
import { TransactionPrerequisitesGuide } from '@/components/transaction-prerequisites-guide'
import { useTransactionPrerequisites } from '@/hooks/use-transaction-prerequisites'
import { ProtectedRoute } from '@/components/protected-route'
import { 
  ExpenseByCategoryChart, 
  IncomeVsExpenseChart, 
  BalanceEvolutionChart, 
  TopCategoriesChart, 
  WeeklySpendingChart 
} from '@/components/dashboard/charts'
import { Overview } from '@/components/dashboard/overview'

export default function DashboardPage() {
  const [showNewTransactionModal, setShowNewTransactionModal] = useState(false)
  const [showRecurringModal, setShowRecurringModal] = useState(false)
  const [showPrerequisitesGuide, setShowPrerequisitesGuide] = useState(false)
  const [activeChart, setActiveChart] = useState('overview')
  
  const { transactions, cards, categories, getFinancialSummary } = useFinancial()
  const { canCreateTransaction } = useTransactionPrerequisites()
  
  const { receitas, despesas, saldo } = getFinancialSummary()

  // Calcular dados para o mês anterior (para comparação)
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

  const lastMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.transaction_date)
    return transactionDate.getMonth() === lastMonth && transactionDate.getFullYear() === lastMonthYear
  })

  const lastMonthReceitas = lastMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  const lastMonthDespesas = lastMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
  const lastMonthSaldo = lastMonthReceitas - lastMonthDespesas

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getCardName = (cardId: string) => {
    const card = cards.find(c => c.id === cardId)
    if (!card) return 'Cartão não encontrado'
    return `${card.name} ${card.last_digits ? `(**** ${card.last_digits})` : ''}`
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.name || 'Categoria não encontrada'
  }

  // Função para lidar com o clique no botão Nova Transação
  const handleNewTransactionClick = () => {
    if (canCreateTransaction) {
      setShowNewTransactionModal(true)
    } else {
      setShowPrerequisitesGuide(true)
    }
  }

  // Função para continuar para o modal de transação após o guia
  const handleContinueToTransaction = () => {
    setShowNewTransactionModal(true)
  }

  // Últimas transações para mostrar no dashboard
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())

  // Configuração das abas de gráficos
  const chartTabs = [
    { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
    { id: 'categories', label: 'Por Categoria', icon: PieChart },
    { id: 'evolution', label: 'Evolução', icon: TrendingUp },
    { id: 'weekly', label: 'Semanal', icon: Calendar },
    { id: 'top', label: 'Top Categorias', icon: Target }
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
                onClick={handleNewTransactionClick}
                className={`inline-flex items-center px-4 py-2 rounded-lg transition-all ${
                  canCreateTransaction 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105' 
                    : 'bg-orange-500 text-white hover:bg-orange-600 animate-pulse'
                }`}
                title={canCreateTransaction ? 'Criar nova transação' : 'Configure categorias e cartões primeiro'}
              >
                <Plus className="h-4 w-4 mr-2" />
                <span>{canCreateTransaction ? 'Nova Transação' : 'Começar Transações'}</span>
              </button>
              <button
                onClick={() => setShowRecurringModal(true)}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Repeat className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Transação Fixa</span>
                <span className="sm:hidden">Fixa</span>
              </button>
            </div>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Receitas</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(receitas)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Despesas</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(despesas)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${saldo >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
                  <DollarSign className={`h-6 w-6 ${saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Saldo</p>
                  <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                    {formatCurrency(saldo)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Activity className="h-6 w-6 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Transações</p>
                  <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Overview Avançado */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Visão Geral Detalhada</h2>
            <Overview 
              totalIncome={receitas}
              totalExpenses={despesas}
              balance={saldo}
              previousMonthBalance={lastMonthSaldo}
            />
          </div>

          {/* Seção de Gráficos Avançados */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <h2 className="text-xl font-semibold text-gray-900">📊 Análise Visual Avançada</h2>
                <div className="flex flex-wrap gap-2">
                  {chartTabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveChart(tab.id)}
                        className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          activeChart === tab.id
                            ? 'bg-blue-100 text-blue-700 border border-blue-200 transform scale-105'
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

          {/* Recent Transactions & System Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Últimas Transações */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Últimas Transações</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentTransactions.length > 0 ? (
                    recentTransactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between py-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{getCategoryName(transaction.category_id)}</span>
                            <span>•</span>
                            <span>{getCardName(transaction.card_id)}</span>
                            <span>•</span>
                            <span>{formatDate(transaction.transaction_date)}</span>
                          </div>
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
                        onClick={handleNewTransactionClick}
                        className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {canCreateTransaction ? 'Criar primeira transação' : 'Configurar pré-requisitos'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status do Sistema */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Status do Sistema</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${categories.length > 0 ? 'bg-green-500' : 'bg-orange-500'}`} />
                      <span className="text-gray-700">Categorias</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {categories.length} categoria{categories.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${cards.filter(c => c.is_active).length > 0 ? 'bg-green-500' : 'bg-orange-500'}`} />
                      <span className="text-gray-700">Cartões Ativos</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {cards.filter(c => c.is_active).length} cartão{cards.filter(c => c.is_active).length !== 1 ? 'ões' : ''}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${canCreateTransaction ? 'bg-green-500' : 'bg-orange-500'}`} />
                      <span className="text-gray-700">Pronto para Transações</span>
                    </div>
                    <span className={`font-medium ${canCreateTransaction ? 'text-green-600' : 'text-orange-600'}`}>
                      {canCreateTransaction ? 'Sim' : 'Não'}
                    </span>
                  </div>

                  {!canCreateTransaction && (
                    <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-sm text-orange-800 mb-2">
                        📋 Para criar transações você precisa ter:
                      </p>
                      <ul className="text-xs text-orange-700 space-y-1">
                        {categories.length === 0 && <li>• Pelo menos 1 categoria</li>}
                        {cards.filter(c => c.is_active).length === 0 && <li>• Pelo menos 1 cartão/conta</li>}
                      </ul>
                      <button
                        onClick={() => setShowPrerequisitesGuide(true)}
                        className="mt-2 text-xs bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700 transition-colors"
                      >
                        Ver guia de configuração
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

        <TransactionPrerequisitesGuide
          isOpen={showPrerequisitesGuide}
          onClose={() => setShowPrerequisitesGuide(false)}
          onContinueToTransaction={handleContinueToTransaction}
        />
      </div>
    </ProtectedRoute>
  )
} 