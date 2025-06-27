// Teste de Conexão com Supabase
// Para usar: importe esta função e chame testSupabaseConnection()

import { supabase } from './supabase-client'

export async function testSupabaseConnection() {
  console.log('🔍 Testando conexão com Supabase...')
  
  try {
    // 1. Testar conexão básica
    const { data, error } = await supabase
      .from('categories')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Erro na conexão:', error.message)
      return {
        success: false,
        error: error.message,
        details: 'Não foi possível conectar com o banco de dados'
      }
    }
    
    console.log('✅ Conexão com banco OK')
    
    // 2. Testar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('❌ Erro na autenticação:', authError.message)
    } else {
      console.log('✅ Sistema de autenticação OK')
      if (user) {
        console.log('👤 Usuário logado:', user.email)
      } else {
        console.log('👤 Nenhum usuário logado (normal)')
      }
    }
    
    // 3. Testar RLS (só se houver usuário)
    if (user) {
      const { data: userCategories, error: rlsError } = await supabase
        .from('categories')
        .select('*')
        .limit(5)
      
      if (rlsError) {
        console.error('❌ Erro no RLS:', rlsError.message)
      } else {
        console.log('✅ RLS funcionando OK')
        console.log('📊 Categorias do usuário:', userCategories?.length || 0)
      }
    }
    
    return {
      success: true,
      user: user ? {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name
      } : null,
      message: 'Conexão com Supabase funcionando perfeitamente!'
    }
    
  } catch (err) {
    console.error('💥 Erro inesperado:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erro desconhecido',
      details: 'Verifique se o .env.local está configurado corretamente'
    }
  }
}

// Função para verificar configuração do ambiente
export function checkEnvironmentConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  console.log('🔍 Verificando configuração do ambiente...')
  
  if (!url) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL não configurada')
    return false
  }
  
  if (!key) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada')
    return false
  }
  
  if (!url.includes('supabase.co')) {
    console.error('❌ URL do Supabase parece incorreta:', url)
    return false
  }
  
  if (key.length < 100) {
    console.error('❌ Chave API parece incorreta (muito curta)')
    return false
  }
  
  console.log('✅ Variáveis de ambiente configuradas')
  console.log('🔗 URL:', url)
  console.log('🔑 Key:', key.substring(0, 20) + '...')
  
  return true
}

// Para usar no console do navegador
export function runQuickTest() {
  if (!checkEnvironmentConfig()) {
    return
  }
  
  testSupabaseConnection().then(result => {
    console.log('📋 Resultado do teste:', result)
  })
} 