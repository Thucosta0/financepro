'use client'

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts'
import type { Transaction } from '@/lib/supabase-client'

interface ChartsProps {
  transactions: Transaction[]
}

// Cores para os gráficos
const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316']

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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload }: any) => {
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
  const monthlyData = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.transaction_date)
    const monthYear = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
    
    const existing = acc.find(item => item.month === monthYear)
    if (existing) {
      if (transaction.type === 'income') {
        existing.receitas += transaction.amount
      } else {
        existing.despesas += transaction.amount
      }
    } else {
      acc.push({
        month: monthYear,
        receitas: transaction.type === 'income' ? transaction.amount : 0,
        despesas: transaction.type === 'expense' ? transaction.amount : 0,
      })
    }
    return acc
  }, [] as { month: string; receitas: number; despesas: number }[])
  .sort((a, b) => {
    // Ordenar por data real
    const dateA = new Date(a.month + ' 01')
    const dateB = new Date(b.month + ' 01')
    return dateA.getTime() - dateB.getTime()
  })
  .slice(-6) // Últimos 6 meses

  const formatValue = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="font-semibold">
              {entry.name}: {formatValue(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (monthlyData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">📈</div>
          <p>Nenhuma transação registrada</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-64 lg:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={formatValue} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="receitas" fill="#10B981" name="Receitas" radius={[2, 2, 0, 0]} />
          <Bar dataKey="despesas" fill="#EF4444" name="Despesas" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-red-600 font-semibold">
            {formatValue(payload[0].value)}
          </p>
          <p className="text-gray-600 text-sm">
            {payload[0].payload.count} transações
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
  const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
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