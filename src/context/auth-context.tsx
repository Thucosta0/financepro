'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, getCurrentUser, signIn, signUp, signOut } from '@/lib/supabase-client'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  login: (emailOrUsername: string, password: string) => Promise<{ success: boolean; message?: string }>
  register: (name: string, username: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verifica o usuário inicial
    checkAuthState()

    // Escuta mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        setUser(session?.user ?? null)
        setIsLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const checkAuthState = async () => {
    try {
      const user = await getCurrentUser()
      setUser(user)
    } catch (error) {
      console.error('Error checking auth state:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (emailOrUsername: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true)
      
      console.log('🔐 [AUTH] Iniciando login com:', emailOrUsername)
      
      // Detectar se é email ou username
      const isEmail = emailOrUsername.includes('@')
      
      if (isEmail) {
        // Se for email, tentar login direto
        console.log('📧 [AUTH] Detectado como email')
        const result = await signIn(emailOrUsername, password)
        
        if (result.error) {
          console.log('❌ [AUTH] Erro no login com email:', result.error.message)
          let message = 'Erro ao fazer login'
          
          if (result.error.message.includes('Invalid login credentials')) {
            message = 'Email ou senha incorretos'
          } else if (result.error.message.includes('Email not confirmed')) {
            message = 'Você precisa confirmar seu email antes de fazer login. Verifique sua caixa de entrada.'
          } else if (result.error.message.includes('not confirmed')) {
            message = 'Você precisa confirmar seu email antes de fazer login. Verifique sua caixa de entrada.'
          }
          
          return { success: false, message }
        }
        
        if (result.user) {
          console.log('✅ [AUTH] Login com email realizado com sucesso')
          setUser(result.user)
          return { success: true }
        }
      } else {
        // Se for username, buscar email primeiro
        console.log('👤 [AUTH] Detectado como username, buscando email...')
        
        try {
          // Buscar username
          const { data, error } = await supabase
            .from('profiles')
            .select('email, username')
            .eq('username', emailOrUsername.trim())
            .maybeSingle()
          
          if (error) {
            console.log('❌ [AUTH] Erro na busca por username:', error.message)
            return { success: false, message: 'Erro ao buscar nome de usuário' }
          }
          
          if (!data?.email) {
            console.log('❌ [AUTH] Username não encontrado')
            return { success: false, message: 'Nome de usuário não encontrado' }
          }
          
          console.log('✅ [AUTH] Username encontrado, fazendo login...')
          
          // Tentar login com o email encontrado
          const result = await signIn(data.email, password)
          
          if (result.error) {
            console.log('❌ [AUTH] Erro no login com email do username:', result.error.message)
            return { success: false, message: 'Senha incorreta' }
          }
          
          if (result.user) {
            console.log('✅ [AUTH] Login com username realizado com sucesso')
            setUser(result.user)
            return { success: true }
          }
        } catch (usernameError) {
          console.error('❌ [AUTH] Erro na busca do username:', usernameError)
          return { success: false, message: 'Erro ao buscar nome de usuário' }
        }
      }
      
      return { success: false, message: 'Erro inesperado ao fazer login' }
    } catch (error) {
      console.error('❌ [AUTH] Erro no login:', error)
      return { success: false, message: 'Erro de conexão' }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, username: string, email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true)
      
      // Verificar se username já existe
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single()
      
      if (existingUser) {
        return { success: false, message: 'Nome de usuário já está em uso' }
      }
      
      const { user, error } = await signUp(email, password, name, username)
      
      if (error) {
        let message = 'Erro ao criar conta'
        
        if (error.message.includes('User already registered')) {
          message = 'Este email já está cadastrado'
        } else if (error.message.includes('Password should be at least')) {
          message = 'A senha deve ter pelo menos 6 caracteres'
        } else if (error.message.includes('Invalid email')) {
          message = 'Email inválido'
        } else if (error.message.includes('Invalid API key')) {
          message = 'Erro de configuração do sistema. Verifique as variáveis de ambiente.'
        }
        
        return { success: false, message }
      }
      
      if (user) {
        // O usuário será definido pelo onAuthStateChange
        return { success: true, message: 'Conta criada com sucesso!' }
      }
      
      return { success: false, message: 'Erro inesperado ao criar conta' }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, message: 'Erro de conexão' }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      await signOut()
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 