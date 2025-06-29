'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  X, 
  CheckCircle, 
  AlertTriangle, 
  CreditCard, 
  Tag, 
  ArrowRight, 
  Plus,
  BookOpen,
  Target,
  Zap
} from 'lucide-react'
import { useFinancial } from '@/context/financial-context'

interface TransactionPrerequisitesGuideProps {
  isOpen: boolean
  onClose: () => void
  onContinueToTransaction: () => void
}

export function TransactionPrerequisitesGuide({ 
  isOpen, 
  onClose, 
  onContinueToTransaction 
}: TransactionPrerequisitesGuideProps) {
  const { categories, cards } = useFinancial()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)

  const activeCards = cards.filter(card => card.is_active)
  const hasCategories = categories.length > 0
  const hasCards = activeCards.length > 0
  const canCreateTransaction = hasCategories && hasCards

  const steps = [
    {
      id: 'intro',
      title: 'Como criar sua primeira transação',
      icon: BookOpen,
      content: 'Para registrar uma transação no FinancePRO, você precisa ter pelo menos uma categoria e um cartão/conta cadastrados.'
    },
    {
      id: 'categories',
      title: 'Passo 1: Categorias',
      icon: Tag,
      content: 'Categorias ajudam você a organizar e entender onde está gastando seu dinheiro.',
      status: hasCategories ? 'completed' : 'pending',
      action: hasCategories ? null : 'create-category'
    },
    {
      id: 'cards',
      title: 'Passo 2: Cartões/Contas',
      icon: CreditCard,
      content: 'Cartões e contas representam de onde o dinheiro está saindo ou entrando.',
      status: hasCards ? 'completed' : 'pending',
      action: hasCards ? null : 'create-card'
    },
    {
      id: 'ready',
      title: 'Pronto para criar transações!',
      icon: Target,
      content: 'Agora você pode registrar suas receitas e despesas de forma organizada.',
      status: canCreateTransaction ? 'completed' : 'disabled'
    }
  ]

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
    }
  }, [isOpen])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCreateCategory = () => {
    onClose()
    router.push('/categorias')
  }

  const handleCreateCard = () => {
    onClose()
    router.push('/cartoes')
  }

  const handleContinueToTransaction = () => {
    onClose()
    onContinueToTransaction()
  }

  if (!isOpen) return null

  const currentStepData = steps[currentStep]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <currentStepData.icon className="h-4 w-4" />
            </div>
            <h3 className="text-lg font-semibold">Guia de Transações</h3>
          </div>
          <button
            onClick={onClose}
            className="text-blue-100 hover:text-white p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Progresso</span>
            <span className="text-sm font-medium text-gray-700">
              {currentStep + 1} de {steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="text-center">
            {/* Icon */}
            <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
              currentStepData.status === 'completed' 
                ? 'bg-green-100 text-green-600' 
                : currentStepData.status === 'pending'
                ? 'bg-orange-100 text-orange-600'
                : 'bg-blue-100 text-blue-600'
            }`}>
              {currentStepData.status === 'completed' ? (
                <CheckCircle className="h-8 w-8" />
              ) : currentStepData.status === 'pending' ? (
                <AlertTriangle className="h-8 w-8" />
              ) : (
                <currentStepData.icon className="h-8 w-8" />
              )}
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              {currentStepData.title}
            </h2>

            {/* Description */}
            <p className="text-gray-600 mb-6 leading-relaxed">
              {currentStepData.content}
            </p>

            {/* Status specific content */}
            {currentStepData.id === 'categories' && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Categorias cadastradas</p>
                    <p className="text-sm text-gray-500">
                      {hasCategories ? `${categories.length} categoria${categories.length > 1 ? 's' : ''}` : 'Nenhuma categoria'}
                    </p>
                  </div>
                  <div className={`flex items-center ${hasCategories ? 'text-green-600' : 'text-orange-600'}`}>
                    {hasCategories ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5" />
                    )}
                  </div>
                </div>
                {!hasCategories && (
                  <button
                    onClick={handleCreateCategory}
                    className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Criar Primeira Categoria</span>
                  </button>
                )}
              </div>
            )}

            {currentStepData.id === 'cards' && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Cartões/Contas ativas</p>
                    <p className="text-sm text-gray-500">
                      {hasCards ? `${activeCards.length} cartão${activeCards.length > 1 ? 'ões' : ''}/conta${activeCards.length > 1 ? 's' : ''}` : 'Nenhum cartão/conta'}
                    </p>
                  </div>
                  <div className={`flex items-center ${hasCards ? 'text-green-600' : 'text-orange-600'}`}>
                    {hasCards ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5" />
                    )}
                  </div>
                </div>
                {!hasCards && (
                  <button
                    onClick={handleCreateCard}
                    className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Criar Primeiro Cartão/Conta</span>
                  </button>
                )}
              </div>
            )}

            {currentStepData.id === 'ready' && (
              <div className="space-y-4">
                {/* Resumo */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Categorias</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">{categories.length} disponível{categories.length > 1 ? 'is' : ''}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Cartões</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">{activeCards.length} ativo{activeCards.length > 1 ? 's' : ''}</p>
                  </div>
                </div>

                {/* Call to Action */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                  <Zap className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-700 mb-3">
                    Agora você pode criar sua primeira transação e começar a controlar suas finanças!
                  </p>
                  <button
                    onClick={handleContinueToTransaction}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2 font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Criar Minha Primeira Transação</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50 rounded-b-2xl">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
            }`}
          >
            Anterior
          </button>

          <div className="flex space-x-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-blue-600'
                    : index < currentStep
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Próximo
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Fechar
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 