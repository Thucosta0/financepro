'use client'

import { useState, useEffect } from 'react'
import { X, Repeat, Calendar, Clock, AlertTriangle } from 'lucide-react'
import { useFinancial } from '@/context/financial-context'
import { useSubscription } from '@/hooks/use-subscription'

interface RecurringTransactionModalProps {
  isOpen: boolean
  onClose: () => void
}

const frequencyOptions = [
  { value: 'weekly', label: 'Semanal', icon: '📅' },
  { value: 'biweekly', label: 'Quinzenal', icon: '📆' },
  { value: 'monthly', label: 'Mensal', icon: '🗓️' },
  { value: 'quarterly', label: 'Trimestral', icon: '📊' },
  { value: 'annually', label: 'Anual', icon: '🎯' }
]

export function RecurringTransactionModal({ isOpen, onClose }: RecurringTransactionModalProps) {
  const { categories, cards, addRecurringTransaction } = useFinancial()
  const { canPerformAction, isTrialExpired } = useSubscription()
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: '',
    card: '',
    frequency: 'monthly' as 'monthly' | 'weekly' | 'biweekly' | 'quarterly' | 'annually',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  })

  const activeCards = cards.filter(card => card.is_active)
  const filteredCategories = categories.filter(cat => cat.type === formData.type)

  // Verificar trial expirado quando o modal abrir
  useEffect(() => {
    if (isOpen && isTrialExpired()) {
      onClose()
      window.location.href = '/planos'
    }
  }, [isOpen, isTrialExpired, onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Verificar novamente se o trial expirou antes de submeter
    if (isTrialExpired()) {
      onClose()
      window.location.href = '/planos'
      return
    }
    
    // Verificar se pode executar a ação
    if (!canPerformAction('transactions')) {
      alert('Você não tem permissão para criar transações recorrentes.')
      return
    }
    
    if (!formData.description || !formData.amount || !formData.category || !formData.card) {
      alert('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    const recurringData = {
      description: formData.description,
      amount: parseFloat(formData.amount),
      type: formData.type,
      category_id: formData.category,
      card_id: formData.card,
      frequency: formData.frequency,
      start_date: formData.startDate,
      end_date: formData.endDate || undefined,
      next_execution_date: formData.startDate,
      is_active: true
    }

    addRecurringTransaction(recurringData)

    // Reset form
    setFormData({
      description: '',
      amount: '',
      type: 'expense',
      category: '',
      card: '',
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: ''
    })

    onClose()
  }

  const formatCardName = (card: any) => {
    return `${card.name} ${card.lastDigits ? `(**** ${card.lastDigits})` : ''} - ${card.bank}`
  }

  if (!isOpen) return null

  // Se trial expirou, mostrar modal de bloqueio
  if (isTrialExpired()) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full m-4 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Transação Recorrente</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h4 className="text-xl font-bold text-red-800 mb-2">Trial Expirado</h4>
            <p className="text-gray-600 mb-6">
              Seu trial de 30 dias expirou. Faça upgrade para continuar criando transações recorrentes.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => {
                  onClose()
                  window.location.href = '/planos'
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Fazer Upgrade Agora
              </button>
              <button 
                onClick={onClose}
                className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full h-full lg:h-auto lg:max-h-[85vh] lg:rounded-lg shadow-lg lg:max-w-md lg:w-full lg:m-4 flex flex-col">
        <div className="flex items-center justify-between p-4 lg:p-6 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white lg:rounded-t-lg flex-shrink-0">
          <div className="flex items-center space-x-3">
            <Repeat className="h-6 w-6" />
            <h3 className="text-lg lg:text-xl font-semibold">Transação Recorrente</h3>
          </div>
          <button
            onClick={onClose}
            className="text-purple-100 hover:text-white p-2 touch-manipulation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-purple-100 hover:scrollbar-thumb-purple-500">
          <div className="p-4 lg:p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição *
              </label>
              <input
                type="text"
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base touch-manipulation"
                placeholder="Ex: Salário, Aluguel, Internet..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base touch-manipulation"
                placeholder="0,00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo *
              </label>
              <select
                value={formData.type}
                onChange={(e) => {
                  setFormData({
                    ...formData, 
                    type: e.target.value as 'income' | 'expense',
                    category: ''
                  })
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base touch-manipulation"
              >
                <option value="expense">Despesa Fixa</option>
                <option value="income">Receita Fixa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequência *
              </label>
              <div className="space-y-2">
                {frequencyOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors touch-manipulation ${
                      formData.frequency === option.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="frequency"
                      value={option.value}
                      checked={formData.frequency === option.value}
                      onChange={(e) => setFormData({...formData, frequency: e.target.value as any})}
                      className="sr-only"
                    />
                    <span className="text-xl mr-3">{option.icon}</span>
                    <span className="font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base touch-manipulation"
                required
              >
                <option value="">Selecione uma categoria</option>
                {filteredCategories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
              {filteredCategories.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  Nenhuma categoria de {formData.type === 'income' ? 'receita' : 'despesa'} cadastrada
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cartão/Conta *
              </label>
              <select
                value={formData.card}
                onChange={(e) => setFormData({...formData, card: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base touch-manipulation"
                required
              >
                <option value="">Selecione um cartão</option>
                {activeCards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {formatCardName(card)}
                  </option>
                ))}
              </select>
              {activeCards.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  Nenhum cartão ativo cadastrado
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Data de Início *
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base touch-manipulation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Data de Fim (Opcional)
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base touch-manipulation"
                />
              </div>
            </div>

            {/* Espaçamento extra para melhor scroll no mobile */}
            <div className="pb-8"></div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 p-4 lg:p-6 border-t bg-gray-50 lg:bg-white flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium touch-manipulation"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 font-medium touch-manipulation"
            disabled={activeCards.length === 0 || filteredCategories.length === 0}
          >
            Criar Transação Recorrente
          </button>
        </div>
      </div>
    </div>
  )
} 