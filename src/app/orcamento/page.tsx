'use client'

import { useState } from 'react'
import { Plus, AlertTriangle, Lightbulb } from 'lucide-react'
import { useFinancial } from '@/context/financial-context'
import { NewCategoryModal } from '@/components/new-category-modal'
import { ProtectedRoute } from '@/components/protected-route'

export default function OrcamentoPage() {
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false)
  const { transactions, categories } = useFinancial()

  // Gerar orçamentos baseados nas categorias existentes
  const orcamentosAtualizados = categories
    .filter(c => c.type === 'expense')
    .map(categoria => {
      const gastoReal = transactions
        .filter(t => t.category_id === categoria.id && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
      
      // Limite sugerido baseado no gasto atual ou valor padrão
      const limiteSugerido = gastoReal > 0 ? Math.ceil(gastoReal * 1.2) : 500
      
      return {
        categoria: categoria.name,
        limite: limiteSugerido,
        gasto: gastoReal,
        cor: categoria.color
      }
    })

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  const obterCorProgressBar = (percentual: number) => {
    if (percentual >= 100) return 'bg-red-500'
    if (percentual >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const obterIconeStatus = (percentual: number) => {
    if (percentual >= 100) return '🚨'
    if (percentual >= 80) return '⚠️'
    return '✅'
  }

  const totalOrcamento = orcamentosAtualizados.reduce((sum, o) => sum + o.limite, 0)
  const totalGasto = orcamentosAtualizados.reduce((sum, o) => sum + o.gasto, 0)
  const percentualGeral = totalOrcamento > 0 ? (totalGasto / totalOrcamento) * 100 : 0

  const handleCreateCategory = () => {
    setShowNewCategoryModal(true)
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Orçamento</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Definir Orçamento</span>
          </button>
        </div>

        {/* Resumo Geral */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="text-blue-600 mr-3">🎯</div>
              <div>
                <p className="text-sm text-gray-600">Orçamento Total</p>
                <p className="text-xl font-semibold text-blue-600">{formatarValor(totalOrcamento)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="text-red-600 mr-3">💸</div>
              <div>
                <p className="text-sm text-gray-600">Total Gasto</p>
                <p className="text-xl font-semibold text-red-600">{formatarValor(totalGasto)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="text-green-600 mr-3">💰</div>
              <div>
                <p className="text-sm text-gray-600">Restante</p>
                <p className={`text-xl font-semibold ${(totalOrcamento - totalGasto) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatarValor(totalOrcamento - totalGasto)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="text-purple-600 mr-3">📊</div>
              <div>
                <p className="text-sm text-gray-600">% Utilizado</p>
                <p className={`text-xl font-semibold ${percentualGeral >= 100 ? 'text-red-600' : percentualGeral >= 80 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {percentualGeral.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Orçamentos por Categoria */}
        {orcamentosAtualizados.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Orçamentos por Categoria</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {orcamentosAtualizados.map((orcamento) => {
                  const percentual = orcamento.limite > 0 ? (orcamento.gasto / orcamento.limite) * 100 : 0
                  const restante = orcamento.limite - orcamento.gasto

                  return (
                    <div key={orcamento.categoria} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="text-xl">{obterIconeStatus(percentual)}</div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{orcamento.categoria}</h4>
                            <p className="text-sm text-gray-600">
                              {formatarValor(orcamento.gasto)} de {formatarValor(orcamento.limite)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${restante >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {restante >= 0 ? 'Restam' : 'Excedeu'} {formatarValor(Math.abs(restante))}
                          </p>
                          <p className="text-sm text-gray-600">{percentual.toFixed(1)}% usado</p>
                        </div>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-300 ${obterCorProgressBar(percentual)}`}
                          style={{ width: `${Math.min(percentual, 100)}%` }}
                        ></div>
                      </div>

                      {percentual >= 80 && (
                        <div className={`mt-2 p-2 rounded-md ${percentual >= 100 ? 'bg-red-50 text-red-800' : 'bg-yellow-50 text-yellow-800'}`}>
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {percentual >= 100 
                                ? 'Orçamento excedido!' 
                                : 'Atenção: orçamento quase no limite!'
                              }
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">🎯</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum orçamento definido</h3>
            <p className="text-gray-600 mb-4">
              Primeiro cadastre algumas categorias de despesas para poder definir orçamentos.
            </p>
            <button 
              onClick={handleCreateCategory}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Criar Primeira Categoria
            </button>
          </div>
        )}

        {/* Dicas Financeiras */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Lightbulb className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Dicas para Melhorar seu Orçamento</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-medium text-gray-900 mb-2">📊 Controle Diário</h4>
              <p className="text-sm text-gray-600">
                Registre todas as suas transações diariamente para ter uma visão precisa dos seus gastos.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-medium text-gray-900 mb-2">💰 Regra 50-30-20</h4>
              <p className="text-sm text-gray-600">
                50% para necessidades, 30% para desejos e 20% para poupança e investimentos.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-medium text-gray-900 mb-2">🎯 Metas Realistas</h4>
              <p className="text-sm text-gray-600">
                Defina orçamentos realistas baseados no seu histórico de gastos dos últimos meses.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-medium text-gray-900 mb-2">📱 Revisão Semanal</h4>
              <p className="text-sm text-gray-600">
                Revise seu orçamento semanalmente para fazer ajustes necessários e manter o controle.
              </p>
            </div>
          </div>
        </div>

        {/* Modal de Nova Categoria */}
        <NewCategoryModal
          isOpen={showNewCategoryModal}
          onClose={() => setShowNewCategoryModal(false)}
        />
      </div>
    </ProtectedRoute>
  )
} 