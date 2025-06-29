'use client'

import { useState, useMemo } from 'react'
import { Plus, AlertTriangle, Lightbulb, Edit2, Trash2 } from 'lucide-react'
import { useFinancial } from '@/context/financial-context'
import { useSubscription } from '@/hooks/use-subscription'
import { NewCategoryModal } from '@/components/new-category-modal'
import { BudgetModal } from '@/components/budget-modal'
import { ProtectedRoute } from '@/components/protected-route'

export default function OrcamentoPage() {
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false)
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const { transactions, categories, budgets, deleteBudget } = useFinancial()
  const { canPerformAction, isTrialExpired } = useSubscription()

  // Sistema de dicas diárias - baseado no dia do ano
  const dicasFinanceiras = [
    {
      titulo: "📊 Controle Diário",
      descricao: "Registre todas as suas transações diariamente para ter uma visão precisa dos seus gastos e tomar decisões mais assertivas."
    },
    {
      titulo: "💰 Regra 50-30-20",
      descricao: "50% para necessidades essenciais, 30% para desejos pessoais e 20% para poupança e investimentos. Uma fórmula comprovada!"
    },
    {
      titulo: "🎯 Metas Realistas",
      descricao: "Defina orçamentos realistas baseados no seu histórico de gastos dos últimos 3 meses. Seja honesto com seus padrões de consumo."
    },
    {
      titulo: "📱 Revisão Semanal",
      descricao: "Dedique 15 minutos semanais para revisar seu orçamento. Pequenos ajustes regulares evitam grandes problemas futuros."
    },
    {
      titulo: "🏦 Reserva de Emergência",
      descricao: "Mantenha de 3 a 6 meses de gastos essenciais em uma conta separada. Sua segurança financeira vale mais que qualquer investimento."
    },
    {
      titulo: "💳 Cartão Consciente",
      descricao: "Use o cartão de crédito como ferramenta, não como extensão da renda. Pague sempre o valor total da fatura."
    },
    {
      titulo: "📈 Invista em Conhecimento",
      descricao: "Dedique 30 minutos semanais estudando sobre finanças. O conhecimento é o melhor investimento com retorno garantido."
    },
    {
      titulo: "🔄 Automatize Poupanças",
      descricao: "Configure transferências automáticas para poupança logo após receber o salário. Pague-se primeiro, sempre!"
    },
    {
      titulo: "🛒 Lista de Compras",
      descricao: "Faça uma lista antes de ir às compras e estabeleça um limite de gastos. Evite compras por impulso que destroem orçamentos."
    },
    {
      titulo: "📊 Compare Preços",
      descricao: "Pesquise preços antes de grandes compras. Apps de comparação podem economizar centenas de reais em eletrodomésticos."
    },
    {
      titulo: "💡 Renda Extra",
      descricao: "Considere fontes de renda complementar: freelances, vendas online ou serviços. Diversificar a renda traz mais segurança."
    },
    {
      titulo: "🎯 Objetivos Claros",
      descricao: "Defina metas financeiras específicas com prazos: viagem em 6 meses, carro em 2 anos. Objetivos claros motivam mais."
    },
    {
      titulo: "📱 Apps Financeiros",
      descricao: "Use aplicativos para acompanhar gastos, investimentos e metas. A tecnologia pode ser sua aliada na organização financeira."
    },
    {
      titulo: "🏠 Gastos Domésticos",
      descricao: "Monitore contas de água, luz e gás. Pequenas mudanças de hábito podem reduzir significativamente essas despesas mensais."
    },
    {
      titulo: "🍕 Delivery Consciente",
      descricao: "Limite pedidos de delivery a 2-3 vezes por semana. Cozinhar em casa economiza em média R$ 800/mês para uma família."
    },
    {
      titulo: "🚗 Transporte Inteligente",
      descricao: "Compare custos entre uber, transporte público e carro próprio. Às vezes o transporte público é mais econômico que manter um carro."
    },
    {
      titulo: "📚 Educação Financeira",
      descricao: "Leia um livro sobre finanças por trimestre. Livros como 'Pai Rico, Pai Pobre' podem mudar sua perspectiva sobre dinheiro."
    },
    {
      titulo: "💼 Seguro e Previdência",
      descricao: "Avalie seguros e previdência privada. Proteção financeira é tão importante quanto acumulação de patrimônio."
    },
    {
      titulo: "🎉 Premiações Pessoais",
      descricao: "Defina pequenas recompensas ao atingir metas de economia. Celebrar conquistas mantém você motivado no longo prazo."
    },
    {
      titulo: "📊 Planilhas Simples",
      descricao: "Mantenha planilhas simples de controle. Complicar demais pode fazer você desistir do controle financeiro."
    },
    {
      titulo: "💰 Dinheiro Físico",
      descricao: "Use dinheiro físico para gastos variáveis como lazer e alimentação. Você gasta menos quando vê o dinheiro saindo da carteira."
    },
    {
      titulo: "🔍 Análise Mensal",
      descricao: "Todo início de mês, analise onde gastou mais no mês anterior. Identificar padrões ajuda a tomar decisões melhores."
    },
    {
      titulo: "🎯 Método Envelope",
      descricao: "Separe dinheiro em 'envelopes' para cada categoria de gasto. Quando o envelope esvaziar, você atingiu o limite daquela categoria."
    },
    {
      titulo: "💳 Cashback Inteligente",
      descricao: "Use cartões com cashback apenas em categorias que você já gasta naturalmente. Não gaste mais só para ganhar cashback."
    },
    {
      titulo: "📱 Notificações Financeiras",
      descricao: "Configure alertas para acompanhar gastos em tempo real. A consciência imediata dos gastos evita surpresas no fim do mês."
    },
    {
      titulo: "🏆 Desafio 52 Semanas",
      descricao: "Poupe R$ 1 na primeira semana, R$ 2 na segunda... até R$ 52 na última. Você terá R$ 1.378 no final do ano!"
    },
    {
      titulo: "🎯 Regra das 24 Horas",
      descricao: "Para compras acima de R$ 200, espere 24 horas antes de decidir. Você se surpreenderá com quantas compras desnecessárias evitará."
    },
    {
      titulo: "💡 Energia e Água",
      descricao: "Pequenas mudanças como banhos mais curtos e lâmpadas LED podem economizar R$ 100-200 mensais na conta de energia."
    },
    {
      titulo: "📊 Proporção de Gastos",
      descricao: "Alimentação deve representar máximo 25% da renda, moradia 30%, transporte 15%. Use essas proporções como guia."
    },
    {
      titulo: "🎯 Metas SMART",
      descricao: "Metas Específicas, Mensuráveis, Atingíveis, Relevantes e Temporais. 'Quero poupar R$ 5.000 em 10 meses' é melhor que 'quero poupar'."
    },
    {
      titulo: "💰 Arredondamento",
      descricao: "Arredonde gastos para cima em seus controles. Se gastou R$ 47,30, anote R$ 50. O extra vira uma reserva natural."
    }
  ]

  // Seleciona a dica baseada no dia do ano
  const dicaDoDia = useMemo(() => {
    const hoje = new Date()
    const inicioAno = new Date(hoje.getFullYear(), 0, 1)
    const diferencaEmMs = hoje.getTime() - inicioAno.getTime()
    const diaDaAno = Math.floor(diferencaEmMs / (1000 * 60 * 60 * 24))
    const indiceDica = diaDaAno % dicasFinanceiras.length
    return dicasFinanceiras[indiceDica]
  }, [])

  // Obter mês e ano atual
  const mesAtual = new Date().getMonth() + 1
  const anoAtual = new Date().getFullYear()

  // Orçamentos para o mês atual
  const orcamentosAtuais = budgets
    .filter(b => b.month === mesAtual && b.year === anoAtual)
    .map(budget => {
      const categoria = categories.find(c => c.id === budget.category_id)
      const gastoReal = transactions
        .filter(t => {
          const transactionDate = new Date(t.transaction_date)
          return t.category_id === budget.category_id && 
                 t.type === 'expense' &&
                 transactionDate.getMonth() + 1 === mesAtual &&
                 transactionDate.getFullYear() === anoAtual
        })
        .reduce((sum, t) => sum + t.amount, 0)
      
      return {
        id: budget.id,
        categoria: categoria?.name || 'Categoria não encontrada',
        categoriaIcon: categoria?.icon || '❓',
        limite: budget.budget_limit,
        gasto: gastoReal,
        cor: categoria?.color || '#666'
      }
    })
    .sort((a, b) => a.categoria.localeCompare(b.categoria))

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

  const totalOrcamento = orcamentosAtuais.reduce((sum, o) => sum + o.limite, 0)
  const totalGasto = orcamentosAtuais.reduce((sum, o) => sum + o.gasto, 0)
  const percentualGeral = totalOrcamento > 0 ? (totalGasto / totalOrcamento) * 100 : 0

  const handleCreateCategory = () => {
    if (isTrialExpired()) {
      window.location.href = '/planos'
      return
    }
    setShowNewCategoryModal(true)
  }

  const handleDefinirOrcamento = () => {
    if (isTrialExpired()) {
      window.location.href = '/planos'
      return
    }
    setShowBudgetModal(true)
  }

  const handleDeleteBudget = async (budgetId: string, categoryName: string) => {
    if (isTrialExpired()) {
      window.location.href = '/planos'
      return
    }

    if (confirm(`Tem certeza que deseja excluir o orçamento de "${categoryName}"?`)) {
      try {
        await deleteBudget(budgetId)
      } catch (error) {
        console.error('Erro ao excluir orçamento:', error)
        alert('Erro ao excluir orçamento. Tente novamente.')
      }
    }
  }

  // Função para obter props do botão baseado no status
  const getButtonProps = () => {
    if (isTrialExpired()) {
      return {
        text: 'Trial Expirado - Renovar',
        className: 'bg-red-600 text-white hover:bg-red-700 animate-pulse',
        icon: AlertTriangle,
        title: 'Seu trial expirou. Clique para renovar.'
      }
    }
    
    return {
      text: 'Definir Orçamento',
      className: 'bg-blue-600 text-white hover:bg-blue-700 transition-colors',
      icon: Plus,
      title: 'Definir novo orçamento'
    }
  }

  const buttonProps = getButtonProps()
  const ButtonIcon = buttonProps.icon

  const formatarMes = (mes: number) => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]
    return meses[mes - 1]
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orçamento</h1>
            <p className="text-gray-600 mt-1">{formatarMes(mesAtual)} de {anoAtual}</p>
          </div>
          <button 
            onClick={handleDefinirOrcamento}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${buttonProps.className}`}
            title={buttonProps.title}
          >
            <ButtonIcon className="h-4 w-4" />
            <span>{buttonProps.text}</span>
          </button>
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
                  Seu trial completo acabou. Faça upgrade para continuar criando e gerenciando orçamentos.
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

        {/* Dica do Dia - Movida para o topo */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Lightbulb className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">💡 Dica Financeira do Dia</h3>
              <p className="text-sm text-gray-600">
                {new Date().toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-2 text-lg">{dicaDoDia.titulo}</h4>
            <p className="text-gray-700 leading-relaxed">{dicaDoDia.descricao}</p>
          </div>
          <div className="mt-3 text-xs text-gray-500 text-center">
            💡 Uma nova dica aparece a cada dia para te ajudar na jornada financeira!
          </div>
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
        {orcamentosAtuais.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Orçamentos - {formatarMes(mesAtual)} {anoAtual}</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {orcamentosAtuais.map((orcamento) => {
                  const percentual = orcamento.limite > 0 ? (orcamento.gasto / orcamento.limite) * 100 : 0
                  const restante = orcamento.limite - orcamento.gasto

                  return (
                    <div key={orcamento.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="text-xl">{orcamento.categoriaIcon}</div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{orcamento.categoria}</h4>
                            <p className="text-sm text-gray-600">
                              {formatarValor(orcamento.gasto)} de {formatarValor(orcamento.limite)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right mr-4">
                            <p className={`font-semibold ${restante >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {restante >= 0 ? 'Restam' : 'Excedeu'} {formatarValor(Math.abs(restante))}
                            </p>
                            <p className="text-sm text-gray-600">{percentual.toFixed(1)}% usado</p>
                          </div>
                          <button 
                            onClick={() => handleDeleteBudget(orcamento.id, orcamento.categoria)}
                            className={`p-2 rounded-lg transition-colors ${
                              isTrialExpired() 
                                ? 'text-gray-400 cursor-not-allowed' 
                                : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                            }`}
                            title={isTrialExpired() ? 'Trial expirado' : 'Excluir orçamento'}
                            disabled={isTrialExpired()}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {categories.filter(c => c.type === 'expense').length === 0 
                ? 'Nenhuma categoria de despesa cadastrada' 
                : 'Nenhum orçamento definido para este mês'
              }
            </h3>
            <p className="text-gray-600 mb-4">
              {categories.filter(c => c.type === 'expense').length === 0 
                ? 'Primeiro cadastre algumas categorias de despesas para poder definir orçamentos.'
                : `Defina orçamentos para suas categorias em ${formatarMes(mesAtual)} de ${anoAtual}.`
              }
            </p>
            <button 
              onClick={categories.filter(c => c.type === 'expense').length === 0 ? handleCreateCategory : handleDefinirOrcamento}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isTrialExpired() ? 'Renovar para Criar' : 
                categories.filter(c => c.type === 'expense').length === 0 ? 'Criar Primeira Categoria' : 'Definir Primeiro Orçamento'
              }
            </button>
          </div>
        )}

        {/* Modal de Nova Categoria */}
        <NewCategoryModal
          isOpen={showNewCategoryModal}
          onClose={() => setShowNewCategoryModal(false)}
        />

        {/* Modal de Orçamento */}
        <BudgetModal
          isOpen={showBudgetModal}
          onClose={() => setShowBudgetModal(false)}
        />
      </div>
    </ProtectedRoute>
  )
} 