import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(`
    ❌ Variáveis de ambiente do Supabase não configuradas!
    
    Para corrigir:
    1. Crie um arquivo .env.local na raiz do projeto
    2. Adicione as seguintes variáveis:
    
    NEXT_PUBLIC_SUPABASE_URL=https://sua-url-do-projeto.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
    
    Para obter essas informações:
    - Acesse https://supabase.com/dashboard
    - Selecione seu projeto
    - Vá em Settings > API
    - Copie a Project URL e anon public key
  `)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Tipos principais
export interface Profile {
  id: string
  name: string
  username?: string
  email: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  type: 'income' | 'expense'
  icon: string
  color: string
  created_at: string
  updated_at: string
}

export interface Card {
  id: string
  user_id: string
  name: string
  type: 'credit' | 'debit' | 'cash'
  bank: string
  card_limit?: number
  color: string
  last_digits?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category_id: string
  card_id: string
  transaction_date: string
  due_date?: string
  notes?: string
  is_completed?: boolean
  created_at: string
  updated_at: string
  category?: Category
  card?: Card
}



export interface Budget {
  id: string
  user_id: string
  category_id: string
  budget_limit: number
  period: 'monthly' | 'yearly'
  year: number
  month?: number
  created_at: string
  updated_at: string
  category?: Category
}

// Helpers de autenticação
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    // Não logar erro se for apenas sessão ausente (situação normal)
    if (error.message !== 'Auth session missing!') {
      console.error('Error getting user:', error)
    }
    return null
  }
  return user
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error signing out:', error)
    return false
  }
  return true
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) {
    console.error('Error signing in:', error)
    return { user: null, error }
  }
  
  return { user: data.user, error: null }
}

export const signUp = async (email: string, password: string, name: string, username?: string) => {
  // Determinar a URL de redirecionamento baseada no ambiente
  const getRedirectUrl = () => {
    if (typeof window === 'undefined') return 'http://localhost:3000/confirm-email'
    
    const origin = window.location.origin
    
    // Se estamos em produção (financepro.dev.br) ou outros domínios de produção
    if (origin.includes('financepro.dev.br') || origin.includes('vercel.app')) {
      return `${origin}/confirm-email`
    }
    
    // Para desenvolvimento local
    return 'http://localhost:3000/confirm-email'
  }

  const redirectUrl = getRedirectUrl()
  console.log('🔗 URL de redirecionamento para confirmação:', redirectUrl)

  // Armazenar o nome do usuário para usar na página de boas-vindas (múltiplas chaves)
  if (typeof window !== 'undefined') {
    localStorage.setItem('welcomeUserName', name)
    localStorage.setItem('userName', name)
    localStorage.setItem('userFullName', name)
    console.log('💾 Nome salvo no localStorage:', name)
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,
        username: username
      },
      emailRedirectTo: redirectUrl
    }
  })
  
  if (error) {
    console.error('Error signing up:', error)
    // Limpar o nome se deu erro
    if (typeof window !== 'undefined') {
      localStorage.removeItem('welcomeUserName')
    }
    return { user: null, error }
  }

  console.log('✅ Usuário criado com sucesso. Email de confirmação enviado para:', email)

  // Se o usuário foi criado com sucesso e temos username, atualizar o perfil
  if (data.user && username) {
    try {
      console.log('🔄 Tentando salvar username no perfil:', username)
      
      // Aguardar um momento para o trigger criar o perfil primeiro
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const { data: updateResult, error: updateError } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', data.user.id)
        .select()
      
      if (updateError) {
        console.error('❌ Erro ao atualizar username:', updateError)
      } else {
        console.log('✅ Username salvo com sucesso:', updateResult)
      }
    } catch (profileError) {
      console.error('❌ Erro ao salvar username no perfil:', profileError)
    }
  }
  
  return { user: data.user, error: null }
}

export default supabase 