'use client'

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { useState } from 'react'
import { useFinancial } from '@/context/financial-context'
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Calendar, Target } from 'lucide-react'
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
    .filter(t => t.type === 'expense' && t.category?.name)
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
    <div className="h-64 lg:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={expenseData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {expenseData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Legenda personalizada */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        {expenseData.map((entry, index) => (
          <div key={entry.name} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="truncate">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function IncomeVsExpenseChart({ transactions }: ChartsProps) {
  // Agrupar por mês de forma mais robusta
  const monthlyData = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.transaction_date)
    const year = date.getFullYear()
    const month = date.getMonth()
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`
    const monthLabel = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
    
    const existing = acc.find(item => item.key === monthKey)
    if (existing) {
      if (transaction.type === 'income') {
        existing.receitas += transaction.amount
      } else {
        existing.despesas += transaction.amount
      }
    } else {
      acc.push({
        key: monthKey,
        month: monthLabel,
        receitas: transaction.type === 'income' ? transaction.amount : 0,
        despesas: transaction.type === 'expense' ? transaction.amount : 0,
      })
    }
    return acc
  }, [] as { key: string; month: string; receitas: number; despesas: number }[])
  
  // Ordenar corretamente por ano-mês e pegar os últimos 12 meses
  const sortedData = monthlyData
    .sort((a, b) => a.key.localeCompare(b.key))
    .slice(-12)
    .map(item => ({
      ...item,
      saldo: item.receitas - item.despesas,
      economia: item.receitas > 0 ? ((item.receitas - item.despesas) / item.receitas * 100) : 0
    }))

  // Calcular estatísticas resumidas
  const totalReceitas = sortedData.reduce((sum, item) => sum + item.receitas, 0)
  const totalDespesas = sortedData.reduce((sum, item) => sum + item.despesas, 0)
  const saldoTotal = totalReceitas - totalDespesas
  const mediaReceitas = totalReceitas / Math.max(sortedData.length, 1)
  const mediaDespesas = totalDespesas / Math.max(sortedData.length, 1)

  const formatValue = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-medium mb-3 text-gray-900">{label}</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-green-600">💰 Receitas:</span>
              <span className="font-semibold text-green-600">{formatValue(data.receitas)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-red-600">💸 Despesas:</span>
              <span className="font-semibold text-red-600">{formatValue(data.despesas)}</span>
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-between items-center">
              <span className={data.saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}>
                {data.saldo >= 0 ? '📈' : '📉'} Saldo:
              </span>
              <span className={`font-bold ${data.saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {formatValue(data.saldo)}
              </span>
            </div>
            {data.receitas > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-purple-600">🎯 Taxa Economia:</span>
                <span className="font-medium text-purple-600">{formatPercent(data.economia)}</span>
              </div>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  if (sortedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        <div className="text-center">
          <div className="text-6xl mb-4">📈</div>
          <h3 className="text-xl font-medium mb-2 text-gray-700">Nenhuma transação registrada</h3>
          <p className="text-gray-500">Adicione suas primeiras receitas e despesas para ver o gráfico</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Estatísticas Resumidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">{formatValue(totalReceitas)}</div>
          <div className="text-xs text-gray-600">Total Receitas</div>
          <div className="text-xs text-gray-500">Média: {formatValue(mediaReceitas)}</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-red-600">{formatValue(totalDespesas)}</div>
          <div className="text-xs text-gray-600">Total Despesas</div>
          <div className="text-xs text-gray-500">Média: {formatValue(mediaDespesas)}</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${saldoTotal >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            {formatValue(saldoTotal)}
          </div>
          <div className="text-xs text-gray-600">Saldo Total</div>
          <div className={`text-xs ${saldoTotal >= 0 ? 'text-blue-500' : 'text-orange-500'}`}>
            {saldoTotal >= 0 ? '📈 Positivo' : '📉 Negativo'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">
            {sortedData.length}
          </div>
          <div className="text-xs text-gray-600">Meses Analisados</div>
          <div className="text-xs text-gray-500">
            {totalReceitas > 0 ? formatPercent((saldoTotal / totalReceitas) * 100) : '0%'} economia
          </div>
        </div>
      </div>

      {/* Gráfico Principal */}
      <div className="h-80 lg:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} maxBarSize={40}>
            <defs>
              <linearGradient id="receitasGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.6}/>
              </linearGradient>
              <linearGradient id="despesasGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0.6}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 11 }} 
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fontSize: 12 }} 
              tickFormatter={formatValue}
              domain={[0, 'dataMax']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="receitas" 
              fill="url(#receitasGradient)" 
              name="Receitas" 
              radius={[4, 4, 0, 0]}
              stroke="#059669"
              strokeWidth={1}
            />
            <Bar 
              dataKey="despesas" 
              fill="url(#despesasGradient)" 
              name="Despesas" 
              radius={[4, 4, 0, 0]}
              stroke="#DC2626"
              strokeWidth={1}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Insights Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-green-600">📊</span>
            <span className="font-medium text-green-800">Melhor Mês</span>
          </div>
          <div className="mt-1">
            {sortedData.length > 0 && (() => {
              const bestMonth = sortedData.reduce((best, current) => 
                current.saldo > best.saldo ? current : best
              )
              return (
                <div>
                  <div className="font-semibold text-green-700">{bestMonth.month}</div>
                  <div className="text-green-600">{formatValue(bestMonth.saldo)}</div>
                </div>
              )
            })()}
          </div>
        </div>

        <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-blue-600">📈</span>
            <span className="font-medium text-blue-800">Tendência</span>
          </div>
          <div className="mt-1">
            {sortedData.length >= 2 && (() => {
              const recent = sortedData.slice(-2)
              const trend = recent[1].saldo - recent[0].saldo
              return (
                <div>
                  <div className={`font-semibold ${trend >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                    {trend >= 0 ? 'Melhorando' : 'Piorando'}
                  </div>
                  <div className={trend >= 0 ? 'text-blue-600' : 'text-orange-600'}>
                    {trend >= 0 ? '+' : ''}{formatValue(trend)}
                  </div>
                </div>
              )
            })()}
          </div>
        </div>

        <div className="p-2 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-purple-600">🎯</span>
            <span className="font-medium text-purple-800">Meta Economia</span>
          </div>
          <div className="mt-1">
            <div className="font-semibold text-purple-700">
              {totalReceitas > 0 && saldoTotal >= totalReceitas * 0.2 ? 'Atingida!' : 'Em progresso'}
            </div>
            <div className="text-purple-600">
              {totalReceitas > 0 ? formatPercent((saldoTotal / totalReceitas) * 100) : '0%'} de economia
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function BalanceEvolutionChart({ transactions }: ChartsProps) {
  const sortedTransactions = [...transactions].sort((a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime())
  
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
    <div className="h-64 lg:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={balanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={formatValue} />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="saldo" 
            stroke="#3B82F6" 
            fillOpacity={1} 
            fill="url(#colorSaldo)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function TopCategoriesChart({ transactions }: ChartsProps) {
  const categoryData = transactions
    .filter(t => t.type === 'expense' && t.category?.name)
    .reduce((acc, transaction) => {
      const categoryName = transaction.category?.name || 'Sem categoria'
      const existing = acc.find(item => item.name === categoryName)
      if (existing) {
        existing.value += transaction.amount
        existing.count += 1
      } else {
        acc.push({ name: categoryName, value: transaction.amount, count: 1 })
      }
      return acc
    }, [] as { name: string; value: number; count: number }[])
    .sort((a, b) => b.value - a.value)
    .slice(0, 5) // Top 5 categorias

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
          <p className="text-red-600 font-semibold">
            {formatValue(payload[0].value)}
          </p>
          <p className="text-gray-600 text-sm">
            {payload[0].payload?.count} transações
          </p>
        </div>
      )
    }
    return null
  }

  if (categoryData.length === 0) {
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
    <div className="h-64 lg:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={categoryData} 
          layout="horizontal"
          margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={formatValue} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" fill="#EF4444" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function WeeklySpendingChart({ transactions }: ChartsProps) {
  const today = new Date()
  
  const weeklyData = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
    const dateString = date.toISOString().split('T')[0]
    const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' })
    
    const dayTransactions = transactions.filter(t => t.transaction_date === dateString)
    const expenses = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    const income = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    
    weeklyData.push({
      day: dayName,
      despesas: expenses,
      receitas: income
    })
  }

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
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry, index: number) => (
            <p key={index} style={{ color: entry.color }} className="font-semibold">
              {entry.name}: {formatValue(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={formatValue} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="receitas" fill="#10B981" name="Receitas" radius={[2, 2, 0, 0]} />
          <Bar dataKey="despesas" fill="#EF4444" name="Despesas" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Componente principal que agrega todos os gráficos
export function Charts() {
  const { transactions } = useFinancial()
  const [activeChart, setActiveChart] = useState('overview')

  // Configuração das abas de gráficos
  const chartTabs = [
    { id: 'overview', label: 'Análise Completa', icon: BarChart3 },
    { id: 'categories', label: 'Por Categoria', icon: PieChartIcon },
    { id: 'evolution', label: 'Evolução', icon: TrendingUp },
    { id: 'weekly', label: 'Semanal', icon: Calendar },
    { id: 'top', label: 'Top Categorias', icon: Target }
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <h2 className="text-xl font-semibold text-gray-900">📊 Análise Visual Avançada</h2>
          <div className="flex flex-wrap gap-2">
            {chartTabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveChart(tab.id)}
                  className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeChart === tab.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200 transform scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {activeChart === 'overview' && (
          <div>
            <h3 className="text-lg font-medium mb-4 text-gray-900">📈 Análise Financeira Completa</h3>
            <IncomeVsExpenseChart transactions={transactions} />
          </div>
        )}
        
        {activeChart === 'categories' && (
          <div>
            <h3 className="text-lg font-medium mb-4 text-gray-900">Distribuição de Despesas por Categoria</h3>
            <ExpenseByCategoryChart transactions={transactions} />
          </div>
        )}
        
        {activeChart === 'evolution' && (
          <div>
            <h3 className="text-lg font-medium mb-4 text-gray-900">Evolução do Saldo</h3>
            <BalanceEvolutionChart transactions={transactions} />
          </div>
        )}
        
        {activeChart === 'weekly' && (
          <div>
            <h3 className="text-lg font-medium mb-4 text-gray-900">Movimentação dos Últimos 7 Dias</h3>
            <WeeklySpendingChart transactions={transactions} />
          </div>
        )}
        
        {activeChart === 'top' && (
          <div>
            <h3 className="text-lg font-medium mb-4 text-gray-900">Top 5 Categorias de Despesa</h3>
            <TopCategoriesChart transactions={transactions} />
          </div>
        )}
      </div>
    </div>
  )
} 