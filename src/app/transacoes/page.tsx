'use client'

import { useState } from 'react'
import { Plus, Search, Filter, Download, Calendar, X, AlertTriangle } from 'lucide-react'
import { useFinancial } from '@/context/financial-context'
import { useSubscription } from '@/hooks/use-subscription'
import { NewTransactionModal } from '@/components/new-transaction-modal'
import { TransactionPrerequisitesGuide } from '@/components/transaction-prerequisites-guide'
import { useTransactionPrerequisites } from '@/hooks/use-transaction-prerequisites'
import { ProtectedRoute } from '@/components/protected-route'

export default function TransacoesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todas')
  const [showNewTransactionModal, setShowNewTransactionModal] = useState(false)
  const [showPrerequisitesGuide, setShowPrerequisitesGuide] = useState(false)
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
  const { canCreateTransaction } = useTransactionPrerequisites()
  const { canPerformAction, isTrialExpired } = useSubscription()

  const { receitas, despesas, saldo } = getFinancialSummary()

  // Verificar se pode criar transações considerando tanto pré-requisitos quanto trial
  const canCreateTransactionFull = canCreateTransaction && canPerformAction('transactions')

  // Função para lidar com o clique no botão Nova Transação
  const handleNewTransactionClick = () => {
    if (isTrialExpired()) {
      // Se trial expirou, redirecionar para planos
      window.location.href = '/planos'
      return
    }
    
    if (canCreateTransaction) {
      setShowNewTransactionModal(true)
    } else {
      setShowPrerequisitesGuide(true)
    }
  }

  // Função para continuar para o modal de transação após o guia
  const handleContinueToTransaction = () => {
    if (isTrialExpired()) {
      window.location.href = '/planos'
      return
    }
    setShowNewTransactionModal(true)
  }

  // Função para obter texto e estilo do botão baseado no status
  const getTransactionButtonProps = () => {
    if (isTrialExpired()) {
      return {
        text: 'Trial Expirado - Renovar',
        className: 'bg-red-600 text-white hover:bg-red-700 animate-pulse',
        icon: AlertTriangle,
        title: 'Seu trial expirou. Clique para renovar.'
      }
    }
    
    if (!canCreateTransaction) {
      return {
        text: 'Começar Transações',
        className: 'bg-orange-500 text-white hover:bg-orange-600 animate-pulse',
        icon: Plus,
        title: 'Configure categorias e cartões primeiro'
      }
    }
    
    return {
      text: 'Nova Transação',
      className: 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105',
      icon: Plus,
      title: 'Criar nova transação'
    }
  }

  const buttonProps = getTransactionButtonProps()
  const ButtonIcon = buttonProps.icon

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
            h1 { color: #333; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .income { color: green; }
            .expense { color: red; }
            .summary { margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h1>Relatório de Transações - FinancePRO</h1>
          <div class="summary">
            <p><strong>Período:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
            <p><strong>Total de Transações:</strong> ${transacoesFiltradas.length}</p>
            <p><strong>Receitas:</strong> ${formatarValor(receitas)}</p>
            <p><strong>Despesas:</strong> ${formatarValor(despesas)}</p>
            <p><strong>Saldo:</strong> ${formatarValor(saldo)}</p>
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
            onClick={handleNewTransactionClick}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all font-medium ${buttonProps.className}`}
            title={buttonProps.title}
          >
            <ButtonIcon className="h-4 w-4" />
            <span>{buttonProps.text}</span>
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

        {/* Alert de trial expirado */}
        {isTrialExpired() && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-600 mr-3">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Trial de 30 dias expirado</h3>
                <p className="text-sm text-red-700 mt-1">
                  Seu trial completo acabou. Faça upgrade para continuar criando e gerenciando transações.
                </p>
              </div>
              <button
                onClick={() => window.location.href = '/planos'}
                className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors font-medium"
              >
                Renovar Agora
              </button>
            </div>
          </div>
        )}

        {/* Alert de pré-requisitos se necessário */}
        {!isTrialExpired() && !canCreateTransaction && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-orange-600 mr-3">⚠️</div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-orange-800">Configuração necessária</h3>
                <p className="text-sm text-orange-700 mt-1">
                  Para criar transações você precisa ter pelo menos uma categoria e um cartão/conta cadastrados.
                </p>
              </div>
              <button
                onClick={() => setShowPrerequisitesGuide(true)}
                className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 transition-colors"
              >
                Ver guia
              </button>
            </div>
          </div>
        )}

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
              <div className="border-t pt-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Filtro de Data */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                    <input
                      type="date"
                      value={dateFilter.startDate}
                      onChange={(e) => setDateFilter({...dateFilter, startDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                    <input
                      type="date"
                      value={dateFilter.endDate}
                      onChange={(e) => setDateFilter({...dateFilter, endDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
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
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {transacoesFiltradas.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {transacoesFiltradas.map((transacao) => (
                <div key={transacao.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{transacao.description}</h3>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <span className="inline-block w-2 h-2 rounded-full mr-2" 
                                style={{ backgroundColor: transacao.category?.color || '#gray' }}></span>
                          {transacao.category?.name || 'Sem categoria'}
                        </span>
                        <span>•</span>
                        <span>{getCardName(transacao.card_id)}</span>
                        <span>•</span>
                        <span>{formatarData(transacao.transaction_date)}</span>
                        {transacao.is_recurring && (
                          <>
                            <span>•</span>
                            <span className="text-purple-600">🔄 Recorrente</span>
                          </>
                        )}
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
                onClick={handleNewTransactionClick}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isTrialExpired() ? 'Renovar para Adicionar' : canCreateTransaction ? 'Adicionar Primeira Transação' : 'Configurar Pré-requisitos'}
              </button>
            </div>
          )}
        </div>

        {/* Modais */}
        <NewTransactionModal
          isOpen={showNewTransactionModal}
          onClose={() => setShowNewTransactionModal(false)}
        />

        <TransactionPrerequisitesGuide
          isOpen={showPrerequisitesGuide}
          onClose={() => setShowPrerequisitesGuide(false)}
          onContinueToTransaction={handleContinueToTransaction}
        />
      </div>
    </ProtectedRoute>
  )
} 