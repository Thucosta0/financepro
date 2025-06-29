'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, DollarSign, PieChart, CreditCard, Target, Star, Sparkles } from 'lucide-react'

export default function BemVindoPage() {
  const [userName, setUserName] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // Pegar o nome do usuário dos parâmetros ou localStorage
    const name = searchParams.get('name') || localStorage.getItem('welcomeUserName') || 'Usuário'
    setUserName(name)
    
    // Limpar o nome do localStorage após usar
    if (localStorage.getItem('welcomeUserName')) {
      localStorage.removeItem('welcomeUserName')
    }
  }, [searchParams])

  const features = [
    {
      icon: DollarSign,
      title: 'Controle Total das Finanças',
      description: 'Gerencie todas suas receitas e despesas em um só lugar'
    },
    {
      icon: PieChart,
      title: 'Relatórios Detalhados',
      description: 'Visualize seus gastos com gráficos intuitivos e relatórios completos'
    },
    {
      icon: CreditCard,
      title: 'Gestão de Cartões',
      description: 'Organize todos seus cartões e contas bancárias'
    },
    {
      icon: Target,
      title: 'Metas e Orçamentos',
      description: 'Defina objetivos financeiros e acompanhe seu progresso'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600">
      <div className="absolute inset-0 bg-black bg-opacity-10"></div>
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          
          {/* Header de Boas-vindas */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 animate-bounce">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-yellow-300" />
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Bem-vindo, {userName}!
              </h1>
              <Sparkles className="h-6 w-6 text-yellow-300" />
            </div>
            
            <p className="text-xl text-blue-100 mb-2">
              🎉 Sua conta foi confirmada com sucesso!
            </p>
            <p className="text-lg text-blue-200">
              Agora você pode aproveitar todas as funcionalidades do <strong>FinancePRO</strong>
            </p>
          </div>

          {/* Cards de Funcionalidades */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Seção de Primeiros Passos */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              🚀 Seus Primeiros Passos
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold text-lg">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Faça seu Login</h3>
                <p className="text-sm text-gray-600">
                  Acesse sua conta com o email e senha cadastrados
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 font-bold text-lg">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Configure seu Perfil</h3>
                <p className="text-sm text-gray-600">
                  Complete suas informações pessoais
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold text-lg">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Comece a Usar</h3>
                <p className="text-sm text-gray-600">
                  Adicione suas primeiras transações
                </p>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="text-center space-y-4">
            <Link
              href="/login?welcome=true"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <CheckCircle2 className="h-5 w-5" />
              Fazer Login Agora
              <ArrowRight className="h-5 w-5" />
            </Link>
            
            <p className="text-blue-100 text-sm">
              Ou explore mais sobre o
              <Link href="/sobre" className="text-yellow-300 hover:text-yellow-200 underline ml-1">
                FinancePRO
              </Link>
            </p>
          </div>

          {/* Mensagem de Motivação */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur-sm rounded-2xl p-6 border border-yellow-300/30">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Star className="h-5 w-5 text-yellow-300 fill-current" />
                <Star className="h-5 w-5 text-yellow-300 fill-current" />
                <Star className="h-5 w-5 text-yellow-300 fill-current" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Sua jornada financeira começa agora!
              </h3>
              <p className="text-blue-100">
                Estamos aqui para te ajudar a alcançar seus objetivos financeiros. 
                Vamos transformar sua relação com o dinheiro! 💪
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 