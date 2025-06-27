'use client'

import { useState } from 'react'
import { Plus, Search, Filter, Download } from 'lucide-react'
import { useFinancial } from '@/context/financial-context'
import { NewTransactionModal } from '@/components/new-transaction-modal'
import { ProtectedRoute } from '@/components/protected-route'

export default function TransacoesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todas')
  const [showNewTransactionModal, setShowNewTransactionModal] = useState(false)
  const { transactions, cards, getFinancialSummary } = useFinancial()

  const { receitas, despesas, saldo } = getFinancialSummary()

  const transacoesFiltradas = transactions.filter(transacao => {
    const categoryName = transacao.category?.name || ''
    const matchDescricao = transacao.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCategoria = categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchTipo = filtroTipo === 'todas' || transacao.type === filtroTipo.replace('receita', 'income').replace('despesa', 'expense')
    return (matchDescricao || matchCategoria) && matchTipo
  })

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const getCardName = (cardId: string) => {
    const card = cards.find(c => c.id === cardId)
    if (!card) return 'Cartão não encontrado'
    return `${card.name} ${card.last_digits ? `(**** ${card.last_digits})` : ''}`
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Transações</h1>
          <button 
            onClick={() => setShowNewTransactionModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Transação</span>
          </button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="text-green-600 mr-3">💰</div>
              <div>
                <p className="text-sm text-gray-600">Receitas</p>
                <p className="text-2xl font-bold text-green-600">{formatarValor(receitas)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="text-red-600 mr-3">💸</div>
              <div>
                <p className="text-sm text-gray-600">Despesas</p>
                <p className="text-2xl font-bold text-red-600">{formatarValor(despesas)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="text-blue-600 mr-3">💳</div>
              <div>
                <p className="text-sm text-gray-600">Saldo</p>
                <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatarValor(saldo)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por descrição ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="todas">Todas</option>
                <option value="receita">Receitas</option>
                <option value="despesa">Despesas</option>
              </select>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>Filtros</span>
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Exportar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Transações */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">
              {transacoesFiltradas.length} transação(ões) encontrada(s)
            </h3>
          </div>
          
          {transacoesFiltradas.length > 0 ? (
            <div className="divide-y">
              {transacoesFiltradas.map((transacao) => (
                <div key={transacao.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          transacao.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="font-medium text-gray-900">{transacao.description}</p>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                            <span>{transacao.category?.name || 'Sem categoria'}</span>
                            <span>•</span>
                            <span>{getCardName(transacao.card_id)}</span>
                            <span>•</span>
                            <span>{formatarData(transacao.transaction_date)}</span>
                            {transacao.is_recurring && (
                              <>
                                <span>•</span>
                                <span className="text-purple-600 flex items-center">
                                  🔄 Recorrente
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={`text-right font-semibold text-lg ${
                      transacao.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transacao.type === 'income' ? '+' : '-'}{formatarValor(transacao.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">💳</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma transação encontrada</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filtroTipo !== 'todas' 
                  ? 'Tente ajustar os filtros ou criar uma nova transação.' 
                  : 'Comece adicionando sua primeira transação.'
                }
              </p>
              <button 
                onClick={() => setShowNewTransactionModal(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Adicionar Primeira Transação
              </button>
            </div>
          )}
        </div>

        {/* Modal */}
        <NewTransactionModal
          isOpen={showNewTransactionModal}
          onClose={() => setShowNewTransactionModal(false)}
        />
      </div>
    </ProtectedRoute>
  )
} 