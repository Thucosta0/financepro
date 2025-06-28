'use client'

import { useState } from 'react'
import { Plus, Search, Filter, Download, Calendar, X } from 'lucide-react'
import { useFinancial } from '@/context/financial-context'
import { NewTransactionModal } from '@/components/new-transaction-modal'
import { ProtectedRoute } from '@/components/protected-route'

export default function TransacoesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todas')
  const [showNewTransactionModal, setShowNewTransactionModal] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  })
  const [categoryFilter, setCategoryFilter] = useState('')
  const [cardFilter, setCardFilter] = useState('')
  const [amountFilter, setAmountFilter] = useState({
    min: '',
    max: ''
  })
  const { transactions, cards, categories, getFinancialSummary } = useFinancial()

  const { receitas, despesas, saldo } = getFinancialSummary()

  const transacoesFiltradas = transactions.filter(transacao => {
    const categoryName = transacao.category?.name || ''
    const matchDescricao = transacao.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCategoria = categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchTipo = filtroTipo === 'todas' || transacao.type === filtroTipo.replace('receita', 'income').replace('despesa', 'expense')
    
    // Filtros avançados
    const matchCategory = !categoryFilter || transacao.category_id === categoryFilter
    const matchCard = !cardFilter || transacao.card_id === cardFilter
    
    // Filtro de data
    const transactionDate = new Date(transacao.transaction_date)
    const matchStartDate = !dateFilter.startDate || transactionDate >= new Date(dateFilter.startDate)
    const matchEndDate = !dateFilter.endDate || transactionDate <= new Date(dateFilter.endDate)
    
    // Filtro de valor
    const matchMinAmount = !amountFilter.min || transacao.amount >= parseFloat(amountFilter.min)
    const matchMaxAmount = !amountFilter.max || transacao.amount <= parseFloat(amountFilter.max)
    
    return (matchDescricao || matchCategoria) && matchTipo && matchCategory && matchCard && 
           matchStartDate && matchEndDate && matchMinAmount && matchMaxAmount
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

  const exportToCSV = () => {
    if (transacoesFiltradas.length === 0) {
      alert('Nenhuma transação para exportar!')
      return
    }

    const headers = ['Data', 'Descrição', 'Categoria', 'Cartão', 'Tipo', 'Valor', 'Recorrente']
    const csvData = [
      headers.join(','),
      ...transacoesFiltradas.map(t => [
        formatarData(t.transaction_date),
        `"${t.description}"`,
        `"${t.category?.name || 'Sem categoria'}"`,
        `"${getCardName(t.card_id)}"`,
        t.type === 'income' ? 'Receita' : 'Despesa',
        t.amount.toString().replace('.', ','),
        t.is_recurring ? 'Sim' : 'Não'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `transacoes_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToPDF = () => {
    if (transacoesFiltradas.length === 0) {
      alert('Nenhuma transação para exportar!')
      return
    }

    let htmlContent = `
      <html>
        <head>
          <title>Relatório de Transações - FinancePRO</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #4F46E5; color: white; }
            tr:nth-child(even) { background-color: #f2f2f2; }
            .income { color: #059669; font-weight: bold; }
            .expense { color: #DC2626; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>FinancePRO - Relatório de Transações</h1>
            <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')}</p>
          </div>
          <div class="summary">
            <h3>Resumo Financeiro</h3>
            <p><strong>Receitas:</strong> ${formatarValor(receitas)}</p>
            <p><strong>Despesas:</strong> ${formatarValor(despesas)}</p>
            <p><strong>Saldo:</strong> ${formatarValor(saldo)}</p>
            <p><strong>Total de Transações:</strong> ${transacoesFiltradas.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Cartão</th>
                <th>Tipo</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
    `

    transacoesFiltradas.forEach(t => {
      htmlContent += `
        <tr>
          <td>${formatarData(t.transaction_date)}</td>
          <td>${t.description}</td>
          <td>${t.category?.name || 'Sem categoria'}</td>
          <td>${getCardName(t.card_id)}</td>
          <td>${t.type === 'income' ? 'Receita' : 'Despesa'}</td>
          <td class="${t.type === 'income' ? 'income' : 'expense'}">
            ${t.type === 'income' ? '+' : '-'}${formatarValor(t.amount)}
          </td>
        </tr>
      `
    })

    htmlContent += `
            </tbody>
          </table>
        </body>
      </html>
    `

    const newWindow = window.open('', '_blank')
    if (newWindow) {
      newWindow.document.write(htmlContent)
      newWindow.document.close()
      newWindow.print()
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFiltroTipo('todas')
    setDateFilter({ startDate: '', endDate: '' })
    setCategoryFilter('')
    setCardFilter('')
    setAmountFilter({ min: '', max: '' })
    setShowAdvancedFilters(false)
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
          <div className="flex flex-col gap-4">
            {/* Filtros básicos */}
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
                <button 
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={`px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center space-x-2 ${showAdvancedFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300'}`}
                >
                  <Filter className="h-4 w-4" />
                  <span>Filtros</span>
                </button>
                <div className="relative">
                  <button 
                    onClick={() => {
                      const dropdown = document.getElementById('export-dropdown')
                      dropdown?.classList.toggle('hidden')
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Exportar</span>
                  </button>
                  <div id="export-dropdown" className="hidden absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <button 
                      onClick={exportToCSV}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                    >
                      📊 Exportar CSV
                    </button>
                    <button 
                      onClick={exportToPDF}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                    >
                      📄 Imprimir PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Filtros avançados */}
            {showAdvancedFilters && (
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Filtro de Data */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
                    <div className="space-y-2">
                      <input
                        type="date"
                        value={dateFilter.startDate}
                        onChange={(e) => setDateFilter({...dateFilter, startDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Data inicial"
                      />
                      <input
                        type="date"
                        value={dateFilter.endDate}
                        onChange={(e) => setDateFilter({...dateFilter, endDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Data final"
                      />
                    </div>
                  </div>

                  {/* Filtro de Categoria */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="">Todas as categorias</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro de Cartão */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cartão</label>
                    <select
                      value={cardFilter}
                      onChange={(e) => setCardFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="">Todos os cartões</option>
                      {cards.map(card => (
                        <option key={card.id} value={card.id}>{card.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro de Valor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                    <div className="space-y-2">
                      <input
                        type="number"
                        value={amountFilter.min}
                        onChange={(e) => setAmountFilter({...amountFilter, min: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Valor mínimo"
                        step="0.01"
                      />
                      <input
                        type="number"
                        value={amountFilter.max}
                        onChange={(e) => setAmountFilter({...amountFilter, max: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Valor máximo"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                {/* Botão limpar filtros */}
                <div className="flex justify-end mt-4">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Limpar Filtros</span>
                  </button>
                </div>
              </div>
            )}
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