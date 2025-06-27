'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import { useFinancial } from '@/context/financial-context'
import { NewCategoryModal } from '@/components/new-category-modal'
import type { Category } from '@/lib/supabase-client'
import { ProtectedRoute } from '@/components/protected-route'

export default function CategoriasPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todas')
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const { categories, transactions, deleteCategory } = useFinancial()

  const categoriasFiltradas = categories.filter(categoria => {
    const matchNome = categoria.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchTipo = filtroTipo === 'todas' || categoria.type === filtroTipo.replace('receita', 'income').replace('despesa', 'expense')
    return matchNome && matchTipo
  })

  const obterTotalCategoria = (categoriaId: string) => {
    const transacoesCategoria = transactions.filter(t => t.category_id === categoriaId)
    return transacoesCategoria.reduce((sum, t) => sum + t.amount, 0)
  }

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (confirm(`Tem certeza que deseja excluir a categoria "${categoryName}"?`)) {
      try {
        await deleteCategory(categoryId)
      } catch (error) {
        console.error('Erro ao excluir categoria:', error)
        alert('Erro ao excluir categoria. Verifique se não há transações vinculadas a ela.')
      }
    }
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setShowNewCategoryModal(true)
  }

  const handleCloseModal = () => {
    setShowNewCategoryModal(false)
    setEditingCategory(null)
  }

  const handleNewCategory = () => {
    setEditingCategory(null)
    setShowNewCategoryModal(true)
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Categorias</h1>
          <button 
            onClick={handleNewCategory}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Categoria</span>
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar categoria..."
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
              <option value="todas">Todas</option>
              <option value="receita">Receitas</option>
              <option value="despesa">Despesas</option>
            </select>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="text-green-600 mr-3">📊</div>
              <div>
                <p className="text-sm text-gray-600">Total Categorias</p>
                <p className="text-xl font-semibold text-gray-900">{categories.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="text-green-600 mr-3">💰</div>
              <div>
                <p className="text-sm text-gray-600">Categorias Receita</p>
                <p className="text-xl font-semibold text-green-600">
                  {categories.filter(c => c.type === 'income').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="text-red-600 mr-3">💸</div>
              <div>
                <p className="text-sm text-gray-600">Categorias Despesa</p>
                <p className="text-xl font-semibold text-red-600">
                  {categories.filter(c => c.type === 'expense').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de Categorias */}
        {categoriasFiltradas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoriasFiltradas.map((categoria) => {
              const total = obterTotalCategoria(categoria.id)
              return (
                <div key={categoria.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{categoria.icon}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{categoria.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{categoria.type === 'income' ? 'Receita' : 'Despesa'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleEditCategory(categoria)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar categoria"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(categoria.id, categoria.name)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir categoria"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Usado</span>
                      <span className={`font-medium ${categoria.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {formatarValor(total)}
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${categoria.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min((total / 1000) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {categories.length === 0 ? 'Nenhuma categoria cadastrada' : 'Nenhuma categoria encontrada'}
            </h3>
            <p className="text-gray-600 mb-4">
              {categories.length === 0 
                ? 'Comece criando suas primeiras categorias para organizar suas transações.'
                : 'Tente ajustar os filtros para encontrar a categoria desejada.'
              }
            </p>
            <button 
              onClick={handleNewCategory}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Criar Primeira Categoria
            </button>
          </div>
        )}

        {/* Modal de Nova/Editar Categoria */}
        <NewCategoryModal
          isOpen={showNewCategoryModal}
          onClose={handleCloseModal}
          editingCategory={editingCategory}
        />
      </div>
    </ProtectedRoute>
  )
} 