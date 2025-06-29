'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'
import { CheckCircle2, ArrowRight, DollarSign, PieChart, CreditCard, Target, Star, Sparkles } from 'lucide-react'

export default function BemVindoContent() {
  const [userName, setUserName] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const getUserName = async () => {
      try {
        // Múltiplas estratégias para capturar o nome do usuário
        let name = ''
        
        // 1. Tentar pegar da URL
        name = searchParams.get('name') || searchParams.get('user_name') || ''
        
        // 2. Tentar pegar do localStorage (múltiplas chaves)
        if (!name) {
          name = localStorage.getItem('welcomeUserName') || 
                 localStorage.getItem('userName') || 
                 localStorage.getItem('user_name') || ''
        }
        
        // 3. Tentar pegar do usuário logado no Supabase
        if (!name) {
          try {
            const { data: { user } } = await supabase.auth.getUser()
            if (user?.user_metadata?.name) {
              name = user.user_metadata.name
              console.log('✅ Nome obtido do Supabase:', name)
            } else if (user?.user_metadata?.full_name) {
              name = user.user_metadata.full_name
            } else if (user?.email) {
              // Se não tem nome, usar a parte antes do @ do email
              name = user.email.split('@')[0]
              console.log('📧 Nome derivado do email:', name)
            }
          } catch (supabaseError) {
            console.log('⚠️ Erro ao buscar usuário no Supabase:', supabaseError)
          }
        }
        
        // 4. Fallback para nome genérico, mas capitalizado
        if (!name || name.trim() === '') {
          name = 'Amigo'
        }
        
        // Capitalizar primeira letra de cada palavra
        const formattedName = name.trim()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ')
        
        console.log('👤 Nome do usuário definido:', formattedName)
        setUserName(formattedName)
        
        // Salvar o nome para futuras visitas
        localStorage.setItem('lastUserName', formattedName)
        
      } catch (error) {
        console.error('❌ Erro ao obter nome do usuário:', error)
        setUserName('Amigo')
      }
    }
    
    getUserName()
  }, [searchParams])

  // Redirecionamento automático para login após 8 segundos
  useEffect(() => {
    const autoRedirect = setTimeout(() => {
      console.log('🔀 Redirecionamento automático para login...')
      router.push('/login?from=welcome')
    }, 8000)

    return () => clearTimeout(autoRedirect)
  }, [router])

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
              Agora faça seu <strong>login</strong> para começar a usar o <strong>FinancePRO</strong>
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

          {/* Próximo Passo */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              🔐 Próximo Passo: Fazer Login
            </h2>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-2xl">🔑</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Entre na sua conta</h3>
              <p className="text-gray-600 mb-4">
                Use o email e senha que você cadastrou para acessar o FinancePRO
              </p>
              
              {/* Contador visual */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-700">
                  ⏱️ Você será redirecionado automaticamente para o login em alguns segundos...
                </p>
              </div>
            </div>
          </div>

          {/* Botão de Ação */}
          <div className="text-center space-y-4">
            <Link
              href="/login?from=welcome"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-blue-600 text-white px-12 py-5 rounded-xl font-bold text-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 animate-pulse"
            >
              🔑 Entrar na Minha Conta
              <ArrowRight className="h-6 w-6" />
            </Link>
            
            <p className="text-blue-100 text-sm">
              Ou aguarde o redirecionamento automático
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
                Sua jornada financeira está prestes a começar!
              </h3>
              <p className="text-blue-100">
                Após fazer login, você terá acesso a todas as ferramentas para
                transformar sua relação com o dinheiro! 💪
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 