'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Crown, Zap, Star, TrendingUp, Shield, AlertTriangle } from 'lucide-react'

export function PlanosPreview() {
  // Dados dos planos (copiado do arquivo original)
  const PLANS = {
    FREE: {
      id: 'free',
      name: 'Trial Completo - 30 Dias',
      description: 'Acesso total e ilimitado por 30 dias - sem restrições',
      features: [
        '🎉 ACESSO COMPLETO por 30 dias',
        '🚫 ZERO limitações durante o trial',
        '💰 Transações ilimitadas',
        '🏷️ Categorias ilimitadas',
        '💳 Cartões e contas ilimitados',
        '📊 Todos os relatórios e gráficos',
        '🤖 Assistente IA financeiro',
        '📈 Análises avançadas',
        '🔄 Transações recorrentes',
        '🎯 Orçamentos inteligentes',
        '📤 Exportação de dados',
        '✨ Experiência Premium completa'
      ]
    },
    PRO: {
      id: 'pro',
      name: 'FinancePRO Premium',
      description: 'Acesso ilimitado a todas as funcionalidades',
      price: 17.00,
      features: [
        'Transações ilimitadas',
        'Categorias personalizadas ilimitadas',
        'Cartões e contas ilimitados',
        'Relatórios e gráficos avançados',
        'Análises financeiras profissionais',
        'Exportação de dados (Excel, PDF)',
        'Transações recorrentes automáticas',
        'Orçamentos inteligentes',
        'Suporte prioritário via chat',
        'Assistente IA financeiro'
      ]
    }
  }

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Escolha o Plano Ideal para Você
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Gerencie suas finanças com ferramentas profissionais
          </p>

          {/* Status atual - TRIAL EXPIRADO */}
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-6 py-3 shadow-lg border-2 border-red-200">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="font-medium text-red-700">
              Trial expirado - Faça upgrade para continuar
            </span>
          </div>
        </div>

        {/* Cards dos Planos */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Plano FREE - EXPIRADO */}
          <Card className="relative p-8 bg-white shadow-xl border-2 border-red-200 opacity-75">
            <div className="absolute top-4 right-4">
              <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold">
                ❌ EXPIRADO
              </div>
            </div>

            <div className="text-center mb-6">
              <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-600 mb-2">{PLANS.FREE.name}</h3>
              <p className="text-gray-500 mb-4">{PLANS.FREE.description}</p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-500">Grátis</span>
                <span className="text-gray-400 ml-2">por 30 dias</span>
              </div>

              {/* Status de expiração */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <p className="text-red-800 text-sm font-bold">PERÍODO EXPIRADO</p>
                </div>
                <p className="text-red-700 text-xs">
                  Seu trial de 30 dias acabou.<br />
                  Faça upgrade para continuar.
                </p>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {PLANS.FREE.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-500 line-through">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              className="w-full bg-gray-300 text-gray-600 hover:bg-gray-300 cursor-not-allowed"
              disabled
            >
              Período Expirado
            </Button>
          </Card>

          {/* Plano PRO - DESTACADO */}
          <Card className="relative p-8 bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-xl border-2 border-purple-500 transform scale-105 ring-4 ring-purple-300 ring-opacity-50">
            <div className="absolute top-4 right-4">
              <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 animate-pulse">
                <Crown className="w-4 h-4" />
                ÚNICA OPÇÃO
              </div>
            </div>

            <div className="text-center mb-6">
              <Star className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">{PLANS.PRO.name}</h3>
              <p className="text-purple-100 mb-4">{PLANS.PRO.description}</p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold">{formatPrice(PLANS.PRO.price)}</span>
                <span className="text-purple-200 ml-2">por mês</span>
              </div>

              {/* Destaque especial para usuário com trial expirado */}
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 border border-yellow-300 rounded-lg p-3 mb-4 font-bold">
                <p className="text-sm">
                  🚀 <strong>REATIVE AGORA!</strong><br />
                  ✨ Recupere acesso a todos os seus dados
                </p>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {PLANS.PRO.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-300 flex-shrink-0" />
                  <span className="text-white">{feature}</span>
                </li>
              ))}
            </ul>

            <Button 
              className="w-full bg-white text-purple-700 hover:bg-gray-100 font-bold py-3 text-lg animate-pulse"
            >
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="w-5 h-5" />
                REATIVAR ACESSO AGORA
              </div>
            </Button>
          </Card>
        </div>

        {/* Benefícios extras para usuário com trial expirado */}
        <div className="mt-12 max-w-4xl mx-auto">
          <Card className="p-8 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-orange-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-orange-800 mb-4">
                ⏰ Não Perca Mais Tempo!
              </h3>
              <p className="text-orange-700 mb-6 max-w-2xl mx-auto">
                Seus dados estão seguros, mas você precisa do plano PRO para continuar gerenciando suas finanças e criar novas transações.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 mt-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800">Dados Seguros</h4>
                  <p className="text-sm text-gray-600">Todas suas informações estão preservadas</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800">Reativação Instant.</h4>
                  <p className="text-sm text-gray-600">Acesso imediato após upgrade</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Crown className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-800">Sem Limitações</h4>
                  <p className="text-sm text-gray-600">Uso ilimitado de todas as funções</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
} 