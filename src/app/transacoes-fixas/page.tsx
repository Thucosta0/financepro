'use client'

import { useState } from 'react'
import { Plus, Play, Pause, Trash2, AlertTriangle, Edit2 } from 'lucide-react'
import { useFinancial } from '@/context/financial-context'
import { useSubscription } from '@/hooks/use-subscription'
import { RecurringTransactionModal } from '@/components/recurring-transaction-modal'
import type { RecurringTransaction } from '@/lib/supabase-client'

export default function TransacoesFixasPage() {
  const [showRecurringModal, setShowRecurringModal] = useState(false)
  const [editingRecurring, setEditingRecurring] = useState<RecurringTransaction | null>(null)
  const { 
    recurringTransactions, 
    cards, 
    categories,
    deleteRecurringTransaction, 
    updateRecurringTransaction,
    executeRecurringTransaction 
  } = useFinancial()
  const { canPerformAction, isTrialExpired } = useSubscription()

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const getFrequencyLabel = (frequency: string) => {
    const labels = {
      weekly: 'Semanal',
      biweekly: 'Quinzenal', 
      monthly: 'Mensal',
      quarterly: 'Trimestral',
      annually: 'Anual'
    }
    return labels[frequency as keyof typeof labels] || frequency
  }

  const getFrequencyIcon = (frequency: string) => {
    const icons = {
      weekly: '📅',
      biweekly: '📆',
      monthly: '🗓️',
      quarterly: '📊',
      annually: '🎯'
    }
    return icons[frequency as keyof typeof icons] || '🔄'
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

  const handleToggleActive = (id: string, isActive: boolean) => {
    if (isTrialExpired()) {
      window.location.href = '/planos'
      return
    }
    updateRecurringTransaction(id, { is_active: !isActive })
  }

  const handleDelete = (id: string, description: string) => {
    if (isTrialExpired()) {
      window.location.href = '/planos'
      return
    }
    if (confirm(`Tem certeza que deseja excluir a transação recorrente "${description}"?`)) {
      deleteRecurringTransaction(id)
    }
  }

  const handleExecuteNow = async (id: string) => {
    if (isTrialExpired()) {
      window.location.href = '/planos'
      return
    }
    try {
      await executeRecurringTransaction(id)
      alert('Transação recorrente executada com sucesso!')
    } catch (error) {
      alert('Erro ao executar transação recorrente')
      console.error(error)
    }
  }

  const handleNewRecurring = () => {
    if (isTrialExpired()) {
      window.location.href = '/planos'
      return
    }
    setEditingRecurring(null)
    setShowRecurringModal(true)
  }

  const handleEditRecurring = (recurring: RecurringTransaction) => {
    if (isTrialExpired()) {
      window.location.href = '/planos'
      return
    }
    setEditingRecurring(recurring)
    setShowRecurringModal(true)
  }

  // Função para obter props do botão baseado no status
  const getButtonProps = () => {
    if (isTrialExpired()) {
      return {
        text: 'Trial Expirado - Renovar',
        className: 'bg-red-600 text-white hover:bg-red-700 animate-pulse',
        icon: AlertTriangle,
        title: 'Seu trial expirou. Clique para renovar.'
      }
    }
    
    return {
      text: 'Nova Recorrente',
      className: 'bg-blue-600 text-white hover:bg-blue-700 transition-colors',
      icon: Plus,
      title: 'Criar nova transação recorrente'
    }
  }

  const buttonProps = getButtonProps()
  const ButtonIcon = buttonProps.icon

  const activeRecurring = recurringTransactions.filter(t => t.is_active)
  const inactiveRecurring = recurringTransactions.filter(t => !t.is_active)

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header Mobile-First */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">🔄 Transações Fixas</h1>
          <p className="text-gray-600 text-sm lg:text-base">Gerencie suas receitas e despesas recorrentes</p>
        </div>
        <button 
          onClick={handleNewRecurring}
          className={`w-full sm:w-auto px-4 py-3 rounded-lg flex items-center justify-center space-x-2 touch-manipulation font-medium ${buttonProps.className}`}
          title={buttonProps.title}
        >
          <ButtonIcon className="h-4 w-4" />
          <span>{buttonProps.text}</span>
        </button>
      </div>

      {/* Alert de trial expirado */}
      {isTrialExpired() && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0">
            <div className="flex items-start sm:items-center">
              <div className="text-red-600 mr-3 mt-0.5 sm:mt-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Trial de 30 dias expirado</h3>
                <p className="text-sm text-red-700 mt-1">
                  Seu trial completo acabou. Faça upgrade para continuar criando e gerenciando transações fixas.
                </p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/planos'}
              className="w-full sm:w-auto bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors font-medium"
            >
              Renovar Agora
            </button>
          </div>
        </div>
      )}

      {/* Cards de Estatísticas - Mobile-First */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-blue-600 mr-3 text-xl">🔄</div>
              <div>
                <p className="text-xs lg:text-sm text-gray-600">Total Recorrentes</p>
                <p className="text-lg lg:text-xl font-semibold text-blue-600">{recurringTransactions.length}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-green-600 mr-3 text-xl">✅</div>
              <div>
                <p className="text-xs lg:text-sm text-gray-600">Ativas</p>
                <p className="text-lg lg:text-xl font-semibold text-green-600">{activeRecurring.length}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-gray-600 mr-3 text-xl">⏸️</div>
              <div>
                <p className="text-xs lg:text-sm text-gray-600">Pausadas</p>
                <p className="text-lg lg:text-xl font-semibold text-gray-600">{inactiveRecurring.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Transações Recorrentes */}
      {recurringTransactions.length > 0 ? (
        <div className="space-y-4">
          {/* Transações Ativas */}
          {activeRecurring.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Play className="h-5 w-5 text-green-600 mr-2" />
                  Transações Ativas ({activeRecurring.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {activeRecurring.map((recurring) => (
                  <div key={recurring.id} className="p-4 lg:p-6 hover:bg-gray-50">
                    {/* Layout Mobile */}
                    <div className="block lg:hidden">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-3 flex-1">
                          <span className="text-2xl">{getFrequencyIcon(recurring.frequency)}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-base">{recurring.description}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {getFrequencyLabel(recurring.frequency)} • {getCategoryName(recurring.category_id)}
                            </p>
                          </div>
                        </div>
                        <div className={`text-right font-semibold text-lg ${recurring.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {recurring.type === 'income' ? '+' : '-'}{formatarValor(recurring.amount)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-gray-500">Próxima Execução</p>
                          <p className="font-medium text-gray-900">{formatarData(recurring.next_execution_date)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Cartão</p>
                          <p className="font-medium text-gray-900 truncate">{getCardName(recurring.card_id)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleExecuteNow(recurring.id)}
                            className={`p-3 rounded-lg transition-colors touch-manipulation ${
                              isTrialExpired() 
                                ? 'text-gray-400 cursor-not-allowed bg-gray-100' 
                                : 'text-blue-600 hover:bg-blue-50 bg-blue-50'
                            }`}
                            disabled={isTrialExpired()}
                          >
                            <Play className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditRecurring(recurring)}
                            className={`p-3 rounded-lg transition-colors touch-manipulation ${
                              isTrialExpired() 
                                ? 'text-gray-400 cursor-not-allowed bg-gray-100' 
                                : 'text-green-600 hover:bg-green-50 bg-green-50'
                            }`}
                            disabled={isTrialExpired()}
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleToggleActive(recurring.id, recurring.is_active)}
                            className={`p-3 rounded-lg transition-colors touch-manipulation ${
                              isTrialExpired() 
                                ? 'text-gray-400 cursor-not-allowed bg-gray-100' 
                                : 'text-orange-600 hover:bg-orange-50 bg-orange-50'
                            }`}
                            disabled={isTrialExpired()}
                          >
                            <Pause className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(recurring.id, recurring.description)}
                            className={`p-3 rounded-lg transition-colors touch-manipulation ${
                              isTrialExpired() 
                                ? 'text-gray-400 cursor-not-allowed bg-gray-100' 
                                : 'text-red-600 hover:bg-red-50 bg-red-50'
                            }`}
                            disabled={isTrialExpired()}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Layout Desktop */}
                    <div className="hidden lg:block">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-xl">{getFrequencyIcon(recurring.frequency)}</span>
                            <div>
                              <h4 className="font-semibold text-gray-900">{recurring.description}</h4>
                              <p className="text-sm text-gray-600">
                                {getFrequencyLabel(recurring.frequency)} • {getCategoryName(recurring.category_id)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-3 text-sm">
                            <div>
                              <p className="text-gray-500">Valor</p>
                              <p className={`font-semibold ${recurring.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                {recurring.type === 'income' ? '+' : '-'}{formatarValor(recurring.amount)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Próxima Execução</p>
                              <p className="font-medium">{formatarData(recurring.next_execution_date)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Cartão</p>
                              <p className="font-medium truncate">{getCardName(recurring.card_id)}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button 
                            onClick={() => handleExecuteNow(recurring.id)}
                            className={`p-2 rounded-lg transition-colors touch-manipulation ${
                              isTrialExpired() 
                                ? 'text-gray-400 cursor-not-allowed' 
                                : 'text-blue-600 hover:bg-blue-50'
                            }`}
                            disabled={isTrialExpired()}
                          >
                            <Play className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditRecurring(recurring)}
                            className={`p-2 rounded-lg transition-colors touch-manipulation ${
                              isTrialExpired() 
                                ? 'text-gray-400 cursor-not-allowed' 
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            disabled={isTrialExpired()}
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleToggleActive(recurring.id, recurring.is_active)}
                            className={`p-2 rounded-lg transition-colors touch-manipulation ${
                              isTrialExpired() 
                                ? 'text-gray-400 cursor-not-allowed' 
                                : 'text-orange-600 hover:bg-orange-50'
                            }`}
                            disabled={isTrialExpired()}
                          >
                            <Pause className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(recurring.id, recurring.description)}
                            className={`p-2 rounded-lg transition-colors touch-manipulation ${
                              isTrialExpired() 
                                ? 'text-gray-400 cursor-not-allowed' 
                                : 'text-red-600 hover:bg-red-50'
                            }`}
                            disabled={isTrialExpired()}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transações Pausadas */}
          {inactiveRecurring.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Pause className="h-5 w-5 text-gray-600 mr-2" />
                  Transações Pausadas ({inactiveRecurring.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {inactiveRecurring.map((recurring) => (
                  <div key={recurring.id} className="p-4 lg:p-6 hover:bg-gray-50 opacity-60">
                    {/* Layout Mobile */}
                    <div className="block lg:hidden">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-3 flex-1">
                          <span className="text-2xl grayscale">{getFrequencyIcon(recurring.frequency)}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-700 text-base">{recurring.description}</h4>
                            <p className="text-sm text-gray-500 mt-1">
                              {getFrequencyLabel(recurring.frequency)} • {getCategoryName(recurring.category_id)} • Pausada
                            </p>
                          </div>
                        </div>
                        <div className="text-right font-semibold text-lg text-gray-600">
                          {recurring.type === 'income' ? '+' : '-'}{formatarValor(recurring.amount)}
                        </div>
                      </div>
                      
                      <div className="mb-4 text-sm">
                        <p className="text-gray-500">Cartão</p>
                        <p className="font-medium text-gray-600 truncate">{getCardName(recurring.card_id)}</p>
                      </div>
                      
                      <div className="flex items-center justify-between space-x-2">
                        <button 
                          onClick={() => handleToggleActive(recurring.id, recurring.is_active)}
                          className={`p-3 rounded-lg transition-colors touch-manipulation ${
                            isTrialExpired() 
                              ? 'text-gray-400 cursor-not-allowed bg-gray-100' 
                              : 'text-green-600 hover:bg-green-50 bg-green-50'
                          }`}
                          disabled={isTrialExpired()}
                        >
                          <Play className="h-4 w-4" />
                        </button>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleEditRecurring(recurring)}
                            className={`p-3 rounded-lg transition-colors touch-manipulation ${
                              isTrialExpired() 
                                ? 'text-gray-400 cursor-not-allowed bg-gray-100' 
                                : 'text-blue-600 hover:bg-blue-50 bg-blue-50'
                            }`}
                            disabled={isTrialExpired()}
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(recurring.id, recurring.description)}
                            className={`p-3 rounded-lg transition-colors touch-manipulation ${
                              isTrialExpired() 
                                ? 'text-gray-400 cursor-not-allowed bg-gray-100' 
                                : 'text-red-600 hover:bg-red-50 bg-red-50'
                            }`}
                            disabled={isTrialExpired()}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Layout Desktop */}
                    <div className="hidden lg:block">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-xl grayscale">{getFrequencyIcon(recurring.frequency)}</span>
                            <div>
                              <h4 className="font-semibold text-gray-700">{recurring.description}</h4>
                              <p className="text-sm text-gray-500">
                                {getFrequencyLabel(recurring.frequency)} • {getCategoryName(recurring.category_id)} • Pausada
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 mt-3 text-sm">
                            <div>
                              <p className="text-gray-500">Valor</p>
                              <p className="font-semibold text-gray-600">
                                {recurring.type === 'income' ? '+' : '-'}{formatarValor(recurring.amount)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Cartão</p>
                              <p className="font-medium truncate text-gray-600">{getCardName(recurring.card_id)}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button 
                            onClick={() => handleToggleActive(recurring.id, recurring.is_active)}
                            className={`p-2 rounded-lg transition-colors touch-manipulation ${
                              isTrialExpired() 
                                ? 'text-gray-400 cursor-not-allowed' 
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            disabled={isTrialExpired()}
                          >
                            <Play className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditRecurring(recurring)}
                            className={`p-2 rounded-lg transition-colors touch-manipulation ${
                              isTrialExpired() 
                                ? 'text-gray-400 cursor-not-allowed' 
                                : 'text-blue-600 hover:bg-blue-50'
                            }`}
                            disabled={isTrialExpired()}
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(recurring.id, recurring.description)}
                            className={`p-2 rounded-lg transition-colors touch-manipulation ${
                              isTrialExpired() 
                                ? 'text-gray-400 cursor-not-allowed' 
                                : 'text-red-600 hover:bg-red-50'
                            }`}
                            disabled={isTrialExpired()}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 lg:py-12">
          <div className="text-gray-400 text-4xl lg:text-6xl mb-4">🔄</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma transação recorrente cadastrada</h3>
          <p className="text-gray-600 text-sm lg:text-base mb-4">
            Adicione salários, contas fixas e outras transações que se repetem automaticamente.
          </p>
          <button 
            onClick={handleNewRecurring}
            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium touch-manipulation"
          >
            {isTrialExpired() ? 'Renovar para Criar' : '+ Criar Primeira Transação Recorrente'}
          </button>
        </div>
      )}

      {/* Modal de Nova/Editar Transação Recorrente */}
      <RecurringTransactionModal
        isOpen={showRecurringModal}
        onClose={() => {
          setShowRecurringModal(false)
          setEditingRecurring(null)
        }}
        recurringTransaction={editingRecurring}
      />
    </div>
  )
} 