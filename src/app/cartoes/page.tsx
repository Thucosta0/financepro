'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff, Search, X } from 'lucide-react'
import { useFinancial } from '@/context/financial-context'
import { ProtectedRoute } from '@/components/protected-route'

export default function CartoesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [showModal, setShowModal] = useState(false)
  const [editingCard, setEditingCard] = useState<string | null>(null)
  const { cards, updateCard, deleteCard, getCardSummary } = useFinancial()

  const cartoesFiltrados = cards.filter(cartao => {
    const matchNome = cartao.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchBanco = cartao.bank.toLowerCase().includes(searchTerm.toLowerCase())
    const matchTipo = filtroTipo === 'todos' || cartao.type === filtroTipo
    return (matchNome || matchBanco) && matchTipo
  })

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  const getCardTypeLabel = (type: string) => {
    const types = {
      credit: 'Crédito',
      debit: 'Débito',
      cash: 'Dinheiro'
    }
    return types[type as keyof typeof types] || type
  }

  const getCardIcon = (type: string) => {
    const icons = {
      credit: '💳',
      debit: '💰',
      cash: '💵'
    }
    return icons[type as keyof typeof icons] || '💳'
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Cartões</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Cartão</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou banco..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todos os tipos</option>
            <option value="credit">Crédito</option>
            <option value="debit">Débito</option>
            <option value="cash">Dinheiro</option>
          </select>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="text-blue-600 mr-3">💳</div>
            <div>
              <p className="text-sm text-gray-600">Total de Cartões</p>
              <p className="text-xl font-semibold text-gray-900">{cards.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="text-green-600 mr-3">✅</div>
            <div>
              <p className="text-sm text-gray-600">Cartões Ativos</p>
              <p className="text-xl font-semibold text-green-600">
                {cards.filter(c => c.isActive).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="text-purple-600 mr-3">💰</div>
            <div>
              <p className="text-sm text-gray-600">Cartões Crédito</p>
              <p className="text-xl font-semibold text-purple-600">
                {cards.filter(c => c.type === 'credit').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="text-orange-600 mr-3">🏦</div>
            <div>
              <p className="text-sm text-gray-600">Bancos Diferentes</p>
              <p className="text-xl font-semibold text-orange-600">
                {[...new Set(cards.map(c => c.bank))].length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Cartões */}
      {cartoesFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cartoesFiltrados.map((cartao) => {
            const { total, transactions } = getCardSummary(cartao.id)
            return (
              <div key={cartao.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                {/* Header do cartão */}
                <div 
                  className="h-32 p-4 text-white relative"
                  style={{ backgroundColor: cartao.color }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-2xl mb-2">{getCardIcon(cartao.type)}</div>
                      <h3 className="font-semibold text-lg">{cartao.name}</h3>
                      <p className="text-sm opacity-90">{cartao.bank}</p>
                      {cartao.lastDigits && (
                        <p className="text-xs opacity-75">**** {cartao.lastDigits}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateCard(cartao.id, { isActive: !cartao.isActive })}
                        className={`p-1 rounded ${cartao.isActive ? 'bg-white/20' : 'bg-red-500/20'}`}
                      >
                        {cartao.isActive ? 
                          <Eye className="h-4 w-4" /> : 
                          <EyeOff className="h-4 w-4" />
                        }
                      </button>
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <span className="text-xs opacity-75 uppercase font-medium">
                      {getCardTypeLabel(cartao.type)}
                    </span>
                  </div>
                </div>

                {/* Body do cartão */}
                <div className="p-4">
                  <div className="space-y-3">
                    {cartao.limit && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Limite:</span>
                        <span className="font-medium">{formatarValor(cartao.limit)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Gasto Total:</span>
                      <span className={`font-medium ${total > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatarValor(total)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Transações:</span>
                      <span className="font-medium">{transactions}</span>
                    </div>
                    {cartao.limit && total > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Limite usado:</span>
                          <span>{((total / cartao.limit) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              (total / cartao.limit) * 100 > 80 ? 'bg-red-500' : 
                              (total / cartao.limit) * 100 > 60 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min((total / cartao.limit) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      cartao.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {cartao.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setEditingCard(cartao.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => deleteCard(cartao.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">💳</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cartão encontrado</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filtroTipo !== 'todos' 
              ? 'Tente ajustar os filtros ou criar um novo cartão.' 
              : 'Comece adicionando seu primeiro cartão.'
            }
          </p>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Adicionar Primeiro Cartão
          </button>
        </div>
      )}

      {/* Modal para adicionar/editar cartão */}
      {(showModal || editingCard) && (
        <CardModal 
          isOpen={showModal || !!editingCard}
          onClose={() => {
            setShowModal(false)
            setEditingCard(null)
          }}
          cardId={editingCard}
        />
      )}
      </div>
    </ProtectedRoute>
  )
}

// Componente Modal para adicionar/editar cartão
function CardModal({ isOpen, onClose, cardId }: { 
  isOpen: boolean; 
  onClose: () => void; 
  cardId?: string | null;
}) {
  const { cards, addCard, updateCard } = useFinancial()
  const [formData, setFormData] = useState({
    name: '',
    type: 'credit' as 'credit' | 'debit' | 'cash',
    bank: '',
    limit: '',
    color: '#3b82f6',
    lastDigits: '',
    isActive: true
  })

  // Se estiver editando, carrega os dados do cartão
  const editingCard = cardId ? cards.find(c => c.id === cardId) : null
  if (editingCard && formData.name === '') {
    setFormData({
      name: editingCard.name,
      type: editingCard.type,
      bank: editingCard.bank,
      limit: editingCard.limit?.toString() || '',
      color: editingCard.color,
      lastDigits: editingCard.lastDigits,
      isActive: editingCard.isActive
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const cardData = {
      name: formData.name,
      type: formData.type,
      bank: formData.bank,
      limit: formData.limit ? parseFloat(formData.limit) : undefined,
      color: formData.color,
      lastDigits: formData.lastDigits,
      isActive: formData.isActive
    }

    if (cardId) {
      updateCard(cardId, cardData)
    } else {
      addCard(cardData)
    }

    setFormData({
      name: '',
      type: 'credit',
      bank: '',
      limit: '',
      color: '#3b82f6',
      lastDigits: '',
      isActive: true
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white lg:rounded-lg shadow-lg max-w-md w-full m-4 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-orange-600 to-amber-600 text-white lg:rounded-t-lg flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">💳</span>
            </div>
            <h3 className="text-lg font-semibold">
              {cardId ? 'Editar Cartão' : 'Novo Cartão'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-orange-100 hover:text-white p-2 touch-manipulation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-orange-100 hover:scrollbar-thumb-orange-500">
          <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Cartão
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Ex: Cartão Principal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value as 'credit' | 'debit' | 'cash'})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="credit">Crédito</option>
              <option value="debit">Débito</option>
              <option value="cash">Dinheiro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Banco
            </label>
            <input
              type="text"
              required
              value={formData.bank}
              onChange={(e) => setFormData({...formData, bank: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Ex: Banco do Brasil"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Últimos 4 dígitos
            </label>
            <input
              type="text"
              maxLength={4}
              pattern="[0-9]{4}"
              value={formData.lastDigits}
              onChange={(e) => setFormData({...formData, lastDigits: e.target.value.replace(/\D/g, '')})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="1234"
            />
            <p className="text-xs text-gray-500 mt-1">
              Os últimos 4 dígitos do cartão (apenas números)
            </p>
          </div>

          {formData.type === 'credit' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Limite (opcional)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.limit}
                onChange={(e) => setFormData({...formData, limit: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="0,00"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cor do Cartão
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({...formData, color: e.target.value})}
                className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <span className="text-sm text-gray-600">{formData.color}</span>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
              Cartão ativo
            </label>
          </div>

            {/* Espaçamento extra para melhor scroll no mobile */}
            <div className="pb-4"></div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50 lg:bg-white flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg hover:from-orange-700 hover:to-amber-700"
          >
            {cardId ? 'Atualizar' : 'Adicionar'}
          </button>
        </div>
      </div>
    </div>
  )
}
