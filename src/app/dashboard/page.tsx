'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { useFinancial } from '@/context/financial-context'
import { useSubscription } from '@/hooks/use-subscription'
import { OnboardingWizard } from '@/components/onboarding-wizard'
import { Charts } from '@/components/dashboard/charts'
import { NewTransactionModal } from '@/components/new-transaction-modal'
import { RecurringTransactionModal } from '@/components/recurring-transaction-modal'
import { ProtectedRoute } from '@/components/protected-route'
import { Plus, TrendingUp, TrendingDown, DollarSign, Hash, AlertTriangle, CheckCircle, Clock, Users } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { transactions, categories, cards, getFinancialSummary, isLoading } = useFinancial()
  const { canPerformAction, getStatusText, isInTrial, isTrialExpired, getTrialDaysRemaining } = useSubscription()
  
  const [showNewTransactionModal, setShowNewTransactionModal] = useState(false)
  const [showRecurringModal, setShowRecurringModal] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Detectar se precisa de configuração inicial
  useEffect(() => {
    // Só verificar onboarding após os dados carregarem
    if (!isLoading && !isTrialExpired()) {
      const needsConfiguration = categories.length === 0 || 
                                categories.filter(c => c.type === 'expense').length === 0 ||
                                cards.length === 0

      if (needsConfiguration && categories.length === 0) {
        setShowOnboarding(true)
      } else {
        setShowOnboarding(false)
      }
    }
  }, [categories, cards, isTrialExpired, isLoading])

  const summary = getFinancialSummary()

  // Função para determinar se pode criar transação
  const canCreateTransaction = categories.filter(c => c.type === 'expense').length > 0 && 
                              cards.length > 0

  const canCreateTransactionFull = canCreateTransaction && canPerformAction('transactions')

  // Função para obter propriedades do botão de transação
  const getTransactionButtonProps = () => {
    if (isTrialExpired()) {
      return {
        text: 'Trial Expirado - Renovar',
        className: 'bg-red-600 text-white hover:bg-red-700 animate-pulse',
        icon: AlertTriangle,
        onClick: () => router.push('/planos'),
        title: 'Seu trial expirou. Clique para renovar.'
      }
    }
    
    if (!canCreateTransaction) {
      return {
        text: 'Preparar Sistema',
        className: 'bg-yellow-600 text-white hover:bg-yellow-700',
        icon: Clock,
        onClick: () => router.push('/categorias'),
        title: 'Configure categorias e cartões primeiro'
      }
    }
    
    return {
      text: 'Nova Transação',
      className: 'bg-blue-600 text-white hover:bg-blue-700',
      icon: Plus,
      onClick: () => setShowNewTransactionModal(true),
      title: 'Adicionar nova transação'
    }
  }

  const transactionButtonProps = getTransactionButtonProps()
  const TransactionIcon = transactionButtonProps.icon

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
  }

  // Estatísticas para o status do sistema
  const systemStats = [
    {
      label: 'Categorias',
      value: categories.length,
      status: categories.length > 0 ? 'success' : 'warning',
      action: () => router.push('/categorias')
    },
    {
      label: 'Cartões Ativos',
      value: cards.filter(c => c.is_active).length,
      status: cards.filter(c => c.is_active).length > 0 ? 'success' : 'warning',
      action: () => router.push('/cartoes')
    },
    {
      label: 'Pronto para Transações',
      value: canCreateTransaction ? 'Sim' : 'Não',
      status: canCreateTransaction ? 'success' : 'warning',
      action: () => router.push('/categorias')
    }
  ]

  // Mostrar loading enquanto carrega dados
  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando seus dados financeiros...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Container centralizado */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Header centralizado */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Financeiro</h1>
              <p className="text-gray-600 mt-2">Visão completa das suas finanças</p>
              
              {/* Botões de ação centralizados */}
              <div className="flex justify-center gap-4 mt-6">
                <button 
                  onClick={transactionButtonProps.onClick}
                  className={`px-6 py-3 rounded-lg flex items-center space-x-2 ${transactionButtonProps.className} transition-all`}
                  title={transactionButtonProps.title}
                >
                  <TransactionIcon className="h-5 w-5" />
                  <span>{transactionButtonProps.text}</span>
                </button>
                
                <button 
                  onClick={() => setShowRecurringModal(true)}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2 transition-all"
                  disabled={!canCreateTransactionFull}
                >
                  <Clock className="h-5 w-5" />
                  <span>Transação Fixa</span>
                </button>
              </div>
            </div>

            {/* Alert de trial expirado */}
            {isTrialExpired() && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="text-red-600 mr-3">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-red-800">Trial de 30 dias expirado</h3>
                      <p className="text-sm text-red-700 mt-1">
                        Seu trial completo acabou. Faça upgrade para continuar usando todas as funcionalidades.
                      </p>
                    </div>
                    <button
                      onClick={() => router.push('/planos')}
                      className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors font-medium"
                    >
                      Renovar Agora
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Status do trial */}
            {isInTrial() && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="text-green-600 mr-3">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-green-800">
                        🎉 Trial Ativo - Acesso Completo!
                      </h3>
                      <p className="text-sm text-green-700 mt-1">
                        Você tem <strong>{getTrialDaysRemaining()} dias restantes</strong> de acesso ilimitado a todas as funcionalidades.
                      </p>
                    </div>
                    <button
                      onClick={() => router.push('/planos')}
                      className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors font-medium"
                    >
                      Ver Planos
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Cards principais - Mobile-First */}
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-green-600 mr-3">
                        <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6" />
                      </div>
                      <div>
                        <p className="text-xs lg:text-sm text-gray-600">💰 Receitas</p>
                        <p className="text-lg lg:text-xl font-semibold text-green-600">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                            minimumFractionDigits: 2
                          }).format(summary.receitas)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-red-600 mr-3">
                        <TrendingDown className="h-5 w-5 lg:h-6 lg:w-6" />
                      </div>
                      <div>
                        <p className="text-xs lg:text-sm text-gray-600">💸 Despesas</p>
                        <p className="text-lg lg:text-xl font-semibold text-red-600">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                            minimumFractionDigits: 2
                          }).format(summary.despesas)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-blue-600 mr-3">
                        <DollarSign className="h-5 w-5 lg:h-6 lg:w-6" />
                      </div>
                      <div>
                        <p className="text-xs lg:text-sm text-gray-600">📊 Saldo</p>
                        <p className={`text-lg lg:text-xl font-semibold ${summary.saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                            minimumFractionDigits: 2
                          }).format(summary.saldo)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-purple-600 mr-3">
                        <Hash className="h-5 w-5 lg:h-6 lg:w-6" />
                      </div>
                      <div>
                        <p className="text-xs lg:text-sm text-gray-600">📈 Transações</p>
                        <p className="text-lg lg:text-xl font-semibold text-purple-600">{transactions.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status do Sistema e Últimas Transações - centralizados */}
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Status do Sistema */}
                <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold mb-4 text-center">Status do Sistema</h3>
                  
                  <div className="space-y-4">
                    {systemStats.map((stat, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={stat.action}
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">{stat.label}</p>
                          <p className="text-lg font-semibold text-gray-700">{stat.value}</p>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${
                          stat.status === 'success' ? 'bg-green-500' : 'bg-yellow-500'
                        }`} />
                      </div>
                    ))}
                  </div>

                  {!canCreateTransaction && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800 text-sm">
                        ⚠️ <strong>Sistema não configurado</strong><br />
                        Configure categorias e cartões para começar a usar
                      </p>
                      <button
                        onClick={() => router.push('/categorias')}
                        className="mt-2 text-yellow-800 underline text-sm hover:text-yellow-900"
                      >
                        Configurar agora →
                      </button>
                    </div>
                  )}
                </div>

                {/* Últimas Transações */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-center">Últimas Transações</h3>
                  </div>
                  <div className="p-6">
                    {transactions.length > 0 ? (
                      <div className="space-y-4">
                        {transactions.slice(0, 5).map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div>
                              <p className="font-medium text-gray-900">{transaction.description}</p>
                              <p className="text-sm text-gray-600">
                                {transaction.category?.name} • {new Date(transaction.transaction_date).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.type === 'income' ? '+' : '-'}
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                                minimumFractionDigits: 2
                              }).format(transaction.amount)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Hash className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Nenhuma transação encontrada</p>
                        <button
                          onClick={() => setShowNewTransactionModal(true)}
                          disabled={!canCreateTransactionFull}
                          className="mt-4 text-blue-600 hover:text-blue-700 underline disabled:text-gray-400 disabled:no-underline"
                        >
                          Criar primeira transação
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Análise Visual Avançada - centralizada */}
            <div className="max-w-6xl mx-auto">
              <Charts />
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

        {/* Onboarding Wizard para contas novas */}
        {showOnboarding && (
          <OnboardingWizard onComplete={handleOnboardingComplete} />
        )}
      </div>
    </ProtectedRoute>
  )
} 