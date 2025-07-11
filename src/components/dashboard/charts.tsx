'use client'

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ComposedChart, Line } from 'recharts'
import { useState } from 'react'
import { useFinancial } from '@/context/financial-context'
import { PieChart as PieChartIcon, TrendingUp, CalendarDays } from 'lucide-react'
import type { Transaction } from '@/lib/supabase-client'

interface ChartsProps {
  transactions: Transaction[]
}

// Cores para os gráficos
const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316']

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload?: any;
  }>;
  label?: string;
}

export function ExpenseByCategoryChart({ transactions }: ChartsProps) {
  const expenseData = transactions
    .filter(t => t.type === 'expense' && t.category?.name && !t.is_completed)
    .reduce((acc, transaction) => {
      const categoryName = transaction.category?.name || 'Sem categoria'
      const existing = acc.find(item => item.name === categoryName)
      if (existing) {
        existing.value += transaction.amount
      } else {
        acc.push({ name: categoryName, value: transaction.amount })
      }
      return acc
    }, [] as { name: string; value: number }[])
    .sort((a, b) => b.value - a.value)
    .slice(0, 6) // Top 6 categorias

  const formatValue = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-blue-600 font-semibold">
            {formatValue(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  if (expenseData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p>Nenhuma despesa registrada</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Gráfico de Pizza Responsivo */}
      <div className="h-72 sm:h-80 lg:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={expenseData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={110}
              paddingAngle={3}
              dataKey="value"
            >
              {expenseData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legenda Mobile-First */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3 text-center">Categorias por Valor</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {expenseData.map((entry, index) => (
            <div key={entry.name} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
              <div className="flex items-center min-w-0">
                <div 
                  className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="font-medium text-gray-900 truncate">{entry.name}</span>
              </div>
              <span className="text-sm font-semibold text-gray-600 ml-2">
                {formatValue(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function MonthlyAnalysisChart({ transactions }: ChartsProps) {
  // Verificar se transactions é válido
  if (!transactions || !Array.isArray(transactions)) {
    return (
      <div className="flex items-center justify-center h-80 text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <p>Erro: Dados de transações inválidos</p>
        </div>
      </div>
    )
  }

  // Obter meses disponíveis das transações
  const availableMonths = transactions
    .filter(t => t.transaction_date && t.amount && !isNaN(t.amount))
    .map(t => {
      const date = new Date(t.transaction_date)
      const year = date.getFullYear()
      const month = date.getMonth()
      const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`
      const monthLabel = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      return { key: monthKey, label: monthLabel, date }
    })
    .filter((value, index, self) => 
      index === self.findIndex(item => item.key === value.key)
    )
    .sort((a, b) => b.date.getTime() - a.date.getTime())

  // Estados para período selecionado e modo de visualização
  const [periodType, setPeriodType] = useState<'single' | 'range' | 'preset'>('single')
  const [selectedMonth, setSelectedMonth] = useState(
    availableMonths.length > 0 ? availableMonths[0].key : ''
  )
  const [startMonth, setStartMonth] = useState(
    availableMonths.length > 0 ? availableMonths[0].key : ''
  )
  const [endMonth, setEndMonth] = useState(
    availableMonths.length > 0 ? availableMonths[0].key : ''
  )
  const [presetPeriod, setPresetPeriod] = useState('last3')
  const [viewMode, setViewMode] = useState<'chart' | 'list'>('list')
  const [isExporting, setIsExporting] = useState(false)

  // Opções de período pré-definidas
  const presetOptions = [
    { value: 'last3', label: 'Últimos 3 meses' },
    { value: 'last6', label: 'Últimos 6 meses' },
    { value: 'last12', label: 'Último ano' },
    { value: 'currentYear', label: 'Ano atual' },
    { value: 'all', label: 'Todo o período' }
  ]

  // Função para obter período baseado no preset
  const getPresetPeriod = (preset: string) => {
    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth()

    switch (preset) {
      case 'last3':
        const start3 = new Date(currentYear, currentMonth - 2, 1)
        return {
          start: `${start3.getFullYear()}-${String(start3.getMonth() + 1).padStart(2, '0')}`,
          end: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`
        }
      case 'last6':
        const start6 = new Date(currentYear, currentMonth - 5, 1)
        return {
          start: `${start6.getFullYear()}-${String(start6.getMonth() + 1).padStart(2, '0')}`,
          end: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`
        }
      case 'last12':
        const start12 = new Date(currentYear, currentMonth - 11, 1)
        return {
          start: `${start12.getFullYear()}-${String(start12.getMonth() + 1).padStart(2, '0')}`,
          end: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`
        }
      case 'currentYear':
        return {
          start: `${currentYear}-01`,
          end: `${currentYear}-12`
        }
      case 'all':
        if (availableMonths.length === 0) return { start: '', end: '' }
        return {
          start: availableMonths[availableMonths.length - 1].key,
          end: availableMonths[0].key
        }
      default:
        return { start: selectedMonth, end: selectedMonth }
    }
  }

  // Obter período efetivo baseado no tipo selecionado
  const getEffectivePeriod = () => {
    switch (periodType) {
      case 'single':
        return { start: selectedMonth, end: selectedMonth }
      case 'range':
        return { start: startMonth, end: endMonth }
      case 'preset':
        return getPresetPeriod(presetPeriod)
      default:
        return { start: selectedMonth, end: selectedMonth }
    }
  }

  const effectivePeriod = getEffectivePeriod()

  // Filtrar transações pelo período selecionado (excluindo finalizadas)
  const filteredTransactions = transactions
    .filter(transaction => {
      if (!transaction.transaction_date || !transaction.amount || isNaN(transaction.amount) || !transaction.description) {
        return false
      }
      
      // Excluir transações finalizadas do dashboard
      if (transaction.is_completed) {
        return false
      }
      
      const date = new Date(transaction.transaction_date)
      if (isNaN(date.getTime())) return false
      
      const year = date.getFullYear()
      const month = date.getMonth()
      const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`
      
      // Verificar se está no range selecionado
      return monthKey >= effectivePeriod.start && monthKey <= effectivePeriod.end
    })
    .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())

  // Calcular totais
  const totalReceitas = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const totalDespesas = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const saldoTotal = totalReceitas - totalDespesas

  // Dados para o gráfico de barras por mês (quando múltiplos meses)
  const monthlyData = filteredTransactions
    .reduce((acc, transaction) => {
      const date = new Date(transaction.transaction_date)
      const year = date.getFullYear()
      const month = date.getMonth()
      const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`
      const monthLabel = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      
      const existing = acc.find(item => item.monthKey === monthKey)
      if (existing) {
        if (transaction.type === 'income') {
          existing.receitas += transaction.amount
        } else {
          existing.despesas += transaction.amount
        }
        existing.saldo = existing.receitas - existing.despesas
      } else {
        acc.push({
          monthKey,
          monthLabel,
          receitas: transaction.type === 'income' ? transaction.amount : 0,
          despesas: transaction.type === 'expense' ? transaction.amount : 0,
          saldo: transaction.type === 'income' ? transaction.amount : -transaction.amount
        })
      }
      return acc
    }, [] as { monthKey: string; monthLabel: string; receitas: number; despesas: number; saldo: number }[])
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey))

  // Dados diários para período único
  const dailyData = periodType === 'single' ? filteredTransactions
    .reduce((acc, transaction) => {
      const date = new Date(transaction.transaction_date)
      const dayKey = date.getDate()
      const dayLabel = `${String(dayKey).padStart(2, '0')}`
      
      const existing = acc.find(item => item.day === dayKey)
      if (existing) {
        if (transaction.type === 'income') {
          existing.receitas += transaction.amount
        } else {
          existing.despesas += transaction.amount
        }
        existing.saldo = existing.receitas - existing.despesas
      } else {
        acc.push({
          day: dayKey,
          dayLabel,
          receitas: transaction.type === 'income' ? transaction.amount : 0,
          despesas: transaction.type === 'expense' ? transaction.amount : 0,
          saldo: transaction.type === 'income' ? transaction.amount : -transaction.amount
        })
      }
      return acc
    }, [] as { day: number; dayLabel: string; receitas: number; despesas: number; saldo: number }[])
    .sort((a, b) => a.day - b.day) : []

  const formatValueDetailed = (value: number) => {
    if (isNaN(value)) return 'R$ 0,00'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatValueForExport = (value: number) => {
    if (isNaN(value)) return '0,00'
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
    })
  }

  const formatDateForExport = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  // Obter label do período para exibição
  const getPeriodLabel = () => {
    if (periodType === 'single') {
      const monthData = availableMonths.find(m => m.key === selectedMonth)
      return monthData?.label || 'Período Selecionado'
    } else if (periodType === 'preset') {
      const preset = presetOptions.find(p => p.value === presetPeriod)
      return preset?.label || 'Período Personalizado'
    } else {
      const startData = availableMonths.find(m => m.key === effectivePeriod.start)
      const endData = availableMonths.find(m => m.key === effectivePeriod.end)
      if (startData && endData) {
        if (effectivePeriod.start === effectivePeriod.end) {
          return startData.label
        }
        return `${startData.label} até ${endData.label}`
      }
      return 'Período Personalizado'
    }
  }

  // Função para exportar CSV
  const exportToCSV = () => {
    setIsExporting(true)
    
    const periodLabel = getPeriodLabel()
    
    // Cabeçalho do CSV
    const headers = [
      'Data',
      'Descrição',
      'Categoria',
      'Cartão',
      'Tipo',
      'Valor (R$)',
      'Saldo Acumulado (R$)'
    ]

    // Ordenar transações por data para calcular saldo acumulado
    const sortedTransactions = [...filteredTransactions].sort(
      (a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
    )

    let saldoAcumulado = 0
    const csvData = sortedTransactions.map(transaction => {
      const valor = transaction.type === 'income' ? transaction.amount : -transaction.amount
      saldoAcumulado += valor
      
      return [
        formatDateForExport(transaction.transaction_date),
        `"${transaction.description || 'Sem descrição'}"`,
        `"${transaction.category?.name || 'Sem categoria'}"`,
        `"${transaction.card?.name || 'N/A'}"`,
        transaction.type === 'income' ? 'Receita' : 'Despesa',
        formatValueForExport(transaction.amount),
        formatValueForExport(saldoAcumulado)
      ]
    })

    // Adicionar resumo no final
    csvData.push([])
    csvData.push(['=== RESUMO DO PERÍODO ==='])
    csvData.push(['Total de Receitas', '', '', '', '', formatValueForExport(totalReceitas), ''])
    csvData.push(['Total de Despesas', '', '', '', '', formatValueForExport(totalDespesas), ''])
    csvData.push(['Saldo Final', '', '', '', '', formatValueForExport(saldoTotal), ''])
    csvData.push(['Número de Transações', '', '', '', '', filteredTransactions.length.toString(), ''])

    // Criar conteúdo CSV
    const csvContent = [
      `# Análise Financeira - ${periodLabel}`,
      `# Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
      '',
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n')

    // Download do arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `analise-financeira-${effectivePeriod.start}-${effectivePeriod.end}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setTimeout(() => setIsExporting(false), 1000)
  }

  // Função para exportar PDF
  const exportToPDF = () => {
    setIsExporting(true)
    
    const periodLabel = getPeriodLabel()
    
    // Criar conteúdo HTML para o PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Análise Financeira - ${periodLabel}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
            .summary { display: flex; justify-content: space-around; margin: 20px 0; }
            .summary-card { text-align: center; padding: 15px; border-radius: 8px; margin: 0 10px; }
            .receitas { background-color: #dcfce7; border: 1px solid #16a34a; }
            .despesas { background-color: #fee2e2; border: 1px solid #dc2626; }
            .saldo { background-color: #dbeafe; border: 1px solid #2563eb; }
            .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .table th, .table td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
            .table th { background-color: #f9fafb; font-weight: bold; }
            .income { color: #16a34a; }
            .expense { color: #dc2626; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>💰 FinancePRO - Análise Financeira</h1>
            <h2>${periodLabel}</h2>
            <p>Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
          </div>
          
          <div class="summary">
            <div class="summary-card receitas">
              <h3>💰 Receitas</h3>
              <p style="font-size: 24px; font-weight: bold;">${formatValueDetailed(totalReceitas)}</p>
              <p>${filteredTransactions.filter(t => t.type === 'income').length} transações</p>
            </div>
            <div class="summary-card despesas">
              <h3>💸 Despesas</h3>
              <p style="font-size: 24px; font-weight: bold;">${formatValueDetailed(totalDespesas)}</p>
              <p>${filteredTransactions.filter(t => t.type === 'expense').length} transações</p>
            </div>
            <div class="summary-card saldo">
              <h3>📊 Saldo</h3>
              <p style="font-size: 24px; font-weight: bold;">${formatValueDetailed(saldoTotal)}</p>
              <p>${filteredTransactions.length} transações total</p>
            </div>
          </div>
          
          <h3>📋 Detalhamento das Transações</h3>
          <table class="table">
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
              ${filteredTransactions.map(transaction => `
                <tr>
                  <td>${formatDateForExport(transaction.transaction_date)}</td>
                  <td>${transaction.description || 'Sem descrição'}</td>
                  <td>${transaction.category?.name || 'Sem categoria'}</td>
                  <td>${transaction.card?.name || 'N/A'}</td>
                  <td>${transaction.type === 'income' ? 'Receita' : 'Despesa'}</td>
                  <td class="${transaction.type === 'income' ? 'income' : 'expense'}">
                    ${transaction.type === 'income' ? '+' : '-'}${formatValueDetailed(transaction.amount)}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Gerado automaticamente pelo FinancePRO</p>
          </div>
        </body>
      </html>
    `
    
    // Abrir nova janela para impressão/salvamento como PDF
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      printWindow.focus()
      
      setTimeout(() => {
        printWindow.print()
        setIsExporting(false)
      }, 1000)
    } else {
      alert('Por favor, permita pop-ups para exportar o PDF')
      setIsExporting(false)
    }
  }

  if (availableMonths.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p>Nenhuma transação registrada</p>
          <p className="text-sm mt-2">Adicione algumas transações para ver a análise</p>
        </div>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{periodType === 'single' ? `Dia ${label}` : label}</p>
          {payload[0] && (
            <p className="text-green-600 font-semibold">
              Receitas: {formatValueDetailed(payload[0].value)}
            </p>
          )}
          {payload[1] && (
            <p className="text-red-600 font-semibold">
              Despesas: {formatValueDetailed(payload[1].value)}
            </p>
          )}
          {payload[2] && (
            <p className="text-blue-600 font-semibold">
              Saldo: {formatValueDetailed(payload[2].value)}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Seletor de Período Avançado */}
      <div className="bg-gray-50 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-900 mb-3 text-center">
          📅 Configurar Período de Análise
        </label>
        
        {/* Tipo de Período */}
        <div className="flex justify-center mb-4">
          <div className="bg-white rounded-lg p-1 flex">
            <button
              onClick={() => setPeriodType('single')}
              className={`px-3 py-2 rounded-md text-xs font-medium transition-all ${
                periodType === 'single'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mês Único
            </button>
            <button
              onClick={() => setPeriodType('preset')}
              className={`px-3 py-2 rounded-md text-xs font-medium transition-all ${
                periodType === 'preset'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Períodos Pré-definidos
            </button>
            <button
              onClick={() => setPeriodType('range')}
              className={`px-3 py-2 rounded-md text-xs font-medium transition-all ${
                periodType === 'range'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Período Personalizado
            </button>
          </div>
        </div>

        {/* Controles baseados no tipo */}
        {periodType === 'single' && (
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-base font-medium"
          >
            {availableMonths.map(month => (
              <option key={month.key} value={month.key}>
                {month.label}
              </option>
            ))}
          </select>
        )}

        {periodType === 'preset' && (
          <select
            value={presetPeriod}
            onChange={(e) => setPresetPeriod(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-base font-medium"
          >
            {presetOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {periodType === 'range' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Mês Inicial</label>
              <select
                value={startMonth}
                onChange={(e) => setStartMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              >
                {availableMonths.map(month => (
                  <option key={month.key} value={month.key}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Mês Final</label>
              <select
                value={endMonth}
                onChange={(e) => setEndMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              >
                {availableMonths.map(month => (
                  <option key={month.key} value={month.key}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Exibir período selecionado */}
        <div className="mt-3 text-center">
          <span className="text-sm font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
            📊 Analisando: {getPeriodLabel()}
          </span>
        </div>
      </div>

      {/* Controles: Toggle + Exportação */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
        {/* Toggle entre Gráfico e Lista */}
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <button
            onClick={() => setViewMode('chart')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === 'chart'
                ? 'bg-white text-blue-700 shadow-sm border border-blue-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 Gráfico
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              viewMode === 'list'
                ? 'bg-white text-blue-700 shadow-sm border border-blue-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📋 Lista
          </button>
        </div>

        {/* Botões de Exportação */}
        <div className="flex space-x-2">
          <button
            onClick={exportToCSV}
            disabled={isExporting || filteredTransactions.length === 0}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
              isExporting || filteredTransactions.length === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            <span>📊</span>
            <span>{isExporting ? 'Exportando...' : 'CSV'}</span>
          </button>
          
          <button
            onClick={exportToPDF}
            disabled={isExporting || filteredTransactions.length === 0}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
              isExporting || filteredTransactions.length === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            <span>📄</span>
            <span>{isExporting ? 'Gerando...' : 'PDF'}</span>
          </button>
        </div>
      </div>

      {/* Resumo Financeiro Mobile-First */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
          <div className="text-green-600 font-medium text-sm">💰 Receitas do Período</div>
          <div className="text-xl font-bold text-green-700 mt-1">
            {formatValueDetailed(totalReceitas)}
          </div>
          <div className="text-green-600 text-xs mt-1">
            {filteredTransactions.filter(t => t.type === 'income').length} transações
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-center">
          <div className="text-red-600 font-medium text-sm">💸 Despesas do Período</div>
          <div className="text-xl font-bold text-red-700 mt-1">
            {formatValueDetailed(totalDespesas)}
          </div>
          <div className="text-red-600 text-xs mt-1">
            {filteredTransactions.filter(t => t.type === 'expense').length} transações
          </div>
        </div>
        
        <div className={`p-4 rounded-lg text-center border ${saldoTotal >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
          <div className={`font-medium text-sm ${saldoTotal >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            {saldoTotal >= 0 ? '📈' : '📉'} Saldo do Período
          </div>
          <div className={`text-xl font-bold mt-1 ${saldoTotal >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
            {formatValueDetailed(saldoTotal)}
          </div>
          <div className={`text-xs mt-1 ${saldoTotal >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            {filteredTransactions.length} transações
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-center">
          <div className="text-purple-600 font-medium text-sm">📊 Média por Transação</div>
          <div className="text-purple-700 text-xl font-bold mt-1">
            {formatValueDetailed(totalDespesas / Math.max(filteredTransactions.filter(t => t.type === 'expense').length, 1))}
          </div>
          <div className="text-purple-600 text-xs mt-1">
            valor médio de despesa
          </div>
        </div>
      </div>

      {/* Conteúdo baseado no modo selecionado */}
      {viewMode === 'chart' ? (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-4 text-center">
            📈 {periodType === 'single' ? 'Movimentação Diária' : 'Movimentação Mensal'} de {getPeriodLabel()}
          </h3>
          
          {(periodType === 'single' ? dailyData : monthlyData).length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <div className="text-3xl mb-2">📊</div>
                <p className="font-medium">Nenhuma transação encontrada</p>
                <p className="text-sm mt-1">para o período selecionado</p>
              </div>
            </div>
          ) : (
            <div className="h-80 bg-white rounded-lg p-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart 
                  data={periodType === 'single' ? dailyData : monthlyData} 
                  margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey={periodType === 'single' ? 'dayLabel' : 'monthLabel'}
                    tick={{ fontSize: 11 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 11 }} 
                    tickFormatter={formatValueDetailed}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="receitas" fill="#10b981" name="Receitas" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="despesas" fill="#ef4444" name="Despesas" radius={[2, 2, 0, 0]} />
                  <Line 
                    type="monotone" 
                    dataKey="saldo" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    name="Saldo"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-4 text-center">
            📋 Transações de {getPeriodLabel()}
          </h3>
          
          {filteredTransactions.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <div className="text-center">
                <div className="text-3xl mb-2">📅</div>
                <p className="font-medium">Nenhuma transação encontrada</p>
                <p className="text-sm mt-1">para o período selecionado</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {filteredTransactions.slice(0, 20).map((transaction, index) => {
                const isIncome = transaction.type === 'income'
                
                return (
                  <div key={transaction.id || index} className="bg-white rounded-lg p-4 shadow-sm border">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start space-x-3">
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0 mt-1.5"
                            style={{ backgroundColor: transaction.category?.color || (isIncome ? '#10b981' : '#ef4444') }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 leading-tight">
                              {transaction.description || 'Transação sem descrição'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 flex items-center">
                              <span className="font-medium">
                                {transaction.category?.name || 'Sem categoria'}
                              </span>
                              {transaction.card?.name && (
                                <>
                                  <span className="mx-1">•</span>
                                  <span>{transaction.card.name}</span>
                                </>
                              )}
                              <span className="mx-1">•</span>
                              <span>{formatDate(transaction.transaction_date)}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-3 flex-shrink-0">
                        <div className={`text-sm font-bold ${
                          isIncome ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {isIncome ? '+' : '-'}{formatValueDetailed(transaction.amount)}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {isIncome ? 'Receita' : 'Despesa'}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              {filteredTransactions.length > 20 && (
                <div className="text-center p-4 bg-white rounded-lg border border-dashed">
                  <p className="text-gray-500 text-sm">
                    E mais {filteredTransactions.length - 20} transações...
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Use a exportação para ver o relatório completo
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function BalanceEvolutionChart({ transactions }: ChartsProps) {
  const sortedTransactions = [...transactions]
    .filter(t => !t.is_completed) // Excluir transações finalizadas
    .sort((a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime())
  
  let runningBalance = 0
  const balanceData = sortedTransactions.map(transaction => {
    if (transaction.type === 'income') {
      runningBalance += transaction.amount
    } else {
      runningBalance -= transaction.amount
    }
    
    return {
      date: new Date(transaction.transaction_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      saldo: runningBalance,
      transacao: transaction.description
    }
  }).slice(-15) // Últimas 15 transações para não poluir o gráfico

  const formatValue = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-blue-600 font-semibold">
            Saldo: {formatValue(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  if (balanceData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">📉</div>
          <p>Nenhuma transação registrada</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-80 sm:h-96">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={balanceData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
          <defs>
            <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 11 }} 
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            tick={{ fontSize: 11 }} 
            tickFormatter={formatValue}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="saldo" 
            stroke="#3B82F6" 
            fillOpacity={1} 
            fill="url(#colorSaldo)" 
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}



// Componente principal que agrega todos os gráficos
export function Charts() {
  const { transactions } = useFinancial()
  const [activeChart, setActiveChart] = useState('monthly')

  // Configuração das abas de gráficos
  const chartTabs = [
    { id: 'monthly', label: 'Análise Mensal', shortLabel: 'Mensal', icon: CalendarDays },
    { id: 'categories', label: 'Por Categoria', shortLabel: 'Categorias', icon: PieChartIcon },
    { id: 'evolution', label: 'Evolução', shortLabel: 'Evolução', icon: TrendingUp }
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="p-4 lg:p-6 border-b border-gray-200">
        <div className="flex flex-col space-y-4">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900 text-center lg:text-left">
            📊 Análise Visual Avançada
          </h2>
          
          {/* Abas Mobile-First */}
          <div className="flex w-full">
            <div className="flex w-full bg-gray-100 rounded-lg p-1 overflow-x-auto">
              {chartTabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveChart(tab.id)}
                    className={`flex-1 min-w-0 flex flex-col items-center justify-center px-2 py-3 lg:px-4 lg:py-2 lg:flex-row rounded-md text-xs lg:text-sm font-medium transition-all whitespace-nowrap ${
                      activeChart === tab.id
                        ? 'bg-white text-blue-700 shadow-sm border border-blue-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4 lg:h-4 lg:w-4 lg:mr-2 mb-1 lg:mb-0" />
                    <span className="hidden sm:inline lg:hidden">{tab.shortLabel}</span>
                    <span className="hidden lg:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 lg:p-6">
        {activeChart === 'monthly' && (
          <div>
            <h3 className="text-base lg:text-lg font-medium mb-4 text-gray-900 text-center lg:text-left">
              📈 Análise Mensal Completa
            </h3>
            <MonthlyAnalysisChart transactions={transactions} />
          </div>
        )}
        
        {activeChart === 'categories' && (
          <div>
            <h3 className="text-base lg:text-lg font-medium mb-4 text-gray-900 text-center lg:text-left">
              🎯 Distribuição de Despesas por Categoria
            </h3>
            <ExpenseByCategoryChart transactions={transactions} />
          </div>
        )}
        
        {activeChart === 'evolution' && (
          <div>
            <h3 className="text-base lg:text-lg font-medium mb-4 text-gray-900 text-center lg:text-left">
              📈 Evolução do Saldo
            </h3>
            <BalanceEvolutionChart transactions={transactions} />
          </div>
        )}
      </div>
    </div>
  )
} 