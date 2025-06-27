'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-client'
import { useAuth } from '@/context/auth-context'
import { ProtectedRoute } from '@/components/protected-route'

interface UserProfile {
  id: string
  name: string
  username?: string
  email: string
  created_at: string
}

interface DebugInfo {
  type: string
  message: string
}

export default function DebugUsernamePage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [debugInfo, setDebugInfo] = useState<DebugInfo[]>([])

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading users:', error)
        return
      }

      setUsers(data || [])
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const testUsernameLogin = async (username: string) => {
    if (!username) return

    try {
      console.log('🧪 Testando busca por username:', username)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('email, username, name')
        .eq('username', username)
        .single()
      
      console.log('📊 Resultado:', { data, error })
      
      if (data) {
        alert(`✅ Username encontrado!\nEmail: ${data.email}\nNome: ${data.name}`)
      } else {
        alert(`❌ Username não encontrado!\nErro: ${error?.message}`)
      }
    } catch (error) {
      console.error('Erro no teste:', error)
      alert(`❌ Erro no teste: ${error}`)
    }
  }

  const [isDebugging, setIsDebugging] = useState(false)

  const debugUserLogin = async () => {
    setDebugInfo([])
    setIsDebugging(true)
    
    const info: DebugInfo[] = []
    
    try {
      // Verificar se o username "thucosta" existe (busca exata)
      info.push({ type: 'info', message: '🔍 Verificando se username "thucosta" existe (busca exata)...' })
      
      const { data: thucostUser, error: thucostError } = await supabase
        .from('profiles')
        .select('id, name, username, email, created_at')
        .eq('username', 'thucosta')
        .single()
      
      // Também tentar busca case-insensitive
      info.push({ type: 'info', message: '🔍 Verificando com busca case-insensitive...' })
      
      const { data: thucostUserIlike, error: thucostErrorIlike } = await supabase
        .from('profiles')
        .select('id, name, username, email, created_at')
        .ilike('username', 'thucosta')
        .single()
      
              // Analisar resultados das duas buscas
        if (thucostUser) {
          info.push({ type: 'success', message: `✅ Usuário thucosta encontrado (busca exata)!` })
          info.push({ type: 'info', message: `📋 Dados: Nome: ${thucostUser.name}, Email: ${thucostUser.email}` })
        } else if (thucostUserIlike) {
          info.push({ type: 'success', message: `✅ Usuário thucosta encontrado (busca case-insensitive)!` })
          info.push({ type: 'info', message: `📋 Dados: Nome: ${thucostUserIlike.name}, Email: ${thucostUserIlike.email}` })
          info.push({ type: 'info', message: `⚠️ Username salvo como: &quot;${thucostUserIlike.username}&quot; (pode ter diferença de maiúsculas)` })
        } else {
          info.push({ type: 'error', message: `❌ Username thucosta não encontrado em nenhuma busca` })
          info.push({ type: 'error', message: `❌ Busca exata: ${thucostError?.message}` })
          info.push({ type: 'error', message: `❌ Busca case-insensitive: ${thucostErrorIlike?.message}` })
          
          // Se não encontrou, vamos listar todos os usuários para ver o que há
          info.push({ type: 'info', message: '📋 Listando todos os usuários cadastrados...' })
          
          const { data: allUsers, error: allError } = await supabase
            .from('profiles')
            .select('id, name, username, email, created_at')
            .order('created_at', { ascending: false })
          
          if (allError) {
            info.push({ type: 'error', message: `❌ Erro ao listar usuários: ${allError.message}` })
          } else {
            info.push({ type: 'success', message: `✅ Encontrados ${allUsers?.length || 0} usuários` })
            
            allUsers?.forEach((user, index) => {
              info.push({ 
                type: 'info', 
                message: `👤 ${index + 1}. Nome: ${user.name}, Username: ${user.username || 'N/A'}, Email: ${user.email}` 
              })
            })
          }
        }
      
    } catch (error) {
      console.error('Erro no teste:', error)
      info.push({ type: 'error', message: `❌ Erro no teste: ${error}` })
    } finally {
      setDebugInfo(info)
      setIsDebugging(false)
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando usuários...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Debug - Usernames</h1>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Página de Debug</h2>
            <p className="text-yellow-700">
              Esta página serve para verificar se os usuários têm usernames configurados e testar o login por username.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Usuários Cadastrados ({users.length})
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.username ? (
                            <span className="text-purple-600 font-medium">@{user.username}</span>
                          ) : (
                            <span className="text-gray-400 italic">Não configurado</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.username ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✅ Com username
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            ❌ Sem username
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {user.username && (
                          <button
                            onClick={() => testUsernameLogin(user.username!)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            🧪 Testar Login
                          </button>
                        )}
                        <a
                          href={`/perfil`}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          ✏️ Editar
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-800 mb-3">🚨 Debug Específico - thucosta</h3>
            <button
              onClick={debugUserLogin}
              disabled={isDebugging}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 mb-4"
            >
              {isDebugging ? 'Testando...' : '🔍 Testar Login thucosta'}
            </button>
            
            {debugInfo.length > 0 && (
              <div className="mt-4 space-y-2">
                {debugInfo.map((info, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded text-sm ${
                      info.type === 'error' 
                        ? 'bg-red-100 text-red-800' 
                        : info.type === 'success' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {info.message}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">📋 Instruções</h3>
            <ol className="list-decimal list-inside text-blue-700 space-y-1">
              <li>Usuários <strong>sem username</strong> só podem fazer login com email</li>
              <li>Para habilitar login por username, configure um username na página de perfil</li>
              <li>Use o botão "🧪 Testar Login" para verificar se a busca por username funciona</li>
              <li>Verifique o console do navegador (F12) para logs detalhados</li>
            </ol>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
} 