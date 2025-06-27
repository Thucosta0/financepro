'use client'

import { useState } from 'react'
import { Plus, Play, Pause, Trash2 } from 'lucide-react'
import { useFinancial } from '@/context/financial-context'
import { RecurringTransactionModal } from '@/components/recurring-transaction-modal'

export default function TransacoesFixasPage() {
  const [showRecurringModal, setShowRecurringModal] = useState(false)
  const { 
    recurringTransactions, 
    cards, 
    categories,
    deleteRecurringTransaction, 
    updateRecurringTransaction,
    executeRecurringTransaction 
  } = useFinancial()



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
    updateRecurringTransaction(id, { is_active: !isActive })
  }

  const handleDelete = (id: string, description: string) => {
    if (confirm(`Tem certeza que deseja excluir a transação recorrente "${description}"?`)) {
      deleteRecurringTransaction(id)
    }
  }

  const handleExecuteNow = async (id: string) => {
    try {
      await executeRecurringTransaction(id)
      alert('Transação recorrente executada com sucesso!')
    } catch (error) {
      alert('Erro ao executar transação recorrente')
      console.error(error)
    }
  }

  const activeRecurring = recurringTransactions.filter(t => t.is_active)
  const inactiveRecurring = recurringTransactions.filter(t => !t.is_active)

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Transações Fixas</h1>
          <p className="text-gray-600 text-sm lg:text-base">Gerencie suas receitas e despesas recorrentes</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <button 
            onClick={() => setShowRecurringModal(true)}
            className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 touch-manipulation font-medium"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Recorrente</span>
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
          <div className="flex items-center">
            <div className="text-blue-600 mr-3 text-xl">🔄</div>
            <div>
              <p className="text-sm text-gray-600">Total Recorrentes</p>
              <p className="text-lg lg:text-xl font-semibold text-blue-600">{recurringTransactions.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
          <div className="flex items-center">
            <div className="text-green-600 mr-3 text-xl">✅</div>
            <div>
              <p className="text-sm text-gray-600">Ativas</p>
              <p className="text-lg lg:text-xl font-semibold text-green-600">{activeRecurring.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6">
          <div className="flex items-center">
            <div className="text-gray-600 mr-3 text-xl">⏸️</div>
            <div>
              <p className="text-sm text-gray-600">Pausadas</p>
              <p className="text-lg lg:text-xl font-semibold text-gray-600">{inactiveRecurring.length}</p>
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
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors touch-manipulation"
                          title="Executar Agora"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleToggleActive(recurring.id, recurring.is_active)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors touch-manipulation"
                          title="Pausar"
                        >
                          <Pause className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(recurring.id, recurring.description)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors touch-manipulation"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors touch-manipulation"
                          title="Reativar"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(recurring.id, recurring.description)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors touch-manipulation"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
            onClick={() => setShowRecurringModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium touch-manipulation"
          >
            + Criar Primeira Transação Recorrente
          </button>
        </div>
      )}

      {/* Modal de Nova Transação Recorrente */}
      <RecurringTransactionModal
        isOpen={showRecurringModal}
        onClose={() => setShowRecurringModal(false)}
      />
    </div>
  )
} 