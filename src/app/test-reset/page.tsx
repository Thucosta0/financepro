'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

export default function TestResetPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const searchParams = useSearchParams()

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
    console.log(message)
  }

  useEffect(() => {
    const testAll = async () => {
      addLog('=== TESTE DE RESET DE SENHA ===')
      addLog(`URL completa: ${window.location.href}`)
      
      // Todos os parâmetros da URL
      const allParams = Object.fromEntries(searchParams.entries())
      addLog(`Parâmetros: ${JSON.stringify(allParams, null, 2)}`)

      // Verificar sessão atual
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          addLog(`Erro ao verificar sessão: ${error.message}`)
        } else {
          addLog(`Sessão atual: ${session ? 'ATIVA' : 'INATIVA'}`)
          if (session) {
            setSessionInfo(session)
            addLog(`Usuário: ${session.user.email}`)
          }
        }
      } catch (error) {
        addLog(`Erro ao verificar sessão: ${error}`)
      }

      // Teste 1: exchangeCodeForSession
      const code = searchParams.get('code')
      if (code) {
        addLog('--- TESTE 1: exchangeCodeForSession ---')
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            addLog(`ERRO: ${error.message}`)
          } else {
            addLog('SUCESSO com exchangeCodeForSession')
            setSessionInfo(data.session)
          }
        } catch (error) {
          addLog(`EXCEÇÃO: ${error}`)
        }
      }

      // Teste 2: setSession com tokens
      const accessToken = searchParams.get('access_token')
      const refreshToken = searchParams.get('refresh_token')
      if (accessToken && refreshToken) {
        addLog('--- TESTE 2: setSession ---')
        try {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          if (error) {
            addLog(`ERRO: ${error.message}`)
          } else {
            addLog('SUCESSO com setSession')
          }
        } catch (error) {
          addLog(`EXCEÇÃO: ${error}`)
        }
      }

      // Teste 3: verifyOtp
      const tokenHash = searchParams.get('token_hash') || searchParams.get('token')
      const type = searchParams.get('type')
      if (tokenHash && type === 'recovery') {
        addLog('--- TESTE 3: verifyOtp ---')
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'recovery'
          })
          if (error) {
            addLog(`ERRO: ${error.message}`)
          } else {
            addLog('SUCESSO com verifyOtp')
          }
        } catch (error) {
          addLog(`EXCEÇÃO: ${error}`)
        }
      }

      addLog('=== FIM DOS TESTES ===')
    }

    testAll()
  }, [searchParams])

  const testPasswordUpdate = async () => {
    addLog('--- TESTE DE ATUALIZAÇÃO DE SENHA ---')
    try {
      const { error } = await supabase.auth.updateUser({
        password: 'novasenha123'
      })
      if (error) {
        addLog(`ERRO ao atualizar senha: ${error.message}`)
      } else {
        addLog('SUCESSO: Senha atualizada!')
      }
    } catch (error) {
      addLog(`EXCEÇÃO ao atualizar senha: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Teste Reset de Senha - Debug</h1>
        
        {/* Informações da Sessão */}
        {sessionInfo && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <h2 className="font-semibold text-green-800 mb-2">✅ Sessão Ativa</h2>
            <p className="text-sm text-green-700">Email: {sessionInfo.user?.email}</p>
            <p className="text-sm text-green-700">ID: {sessionInfo.user?.id}</p>
            <button
              onClick={testPasswordUpdate}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Testar Atualização de Senha
            </button>
          </div>
        )}
        
        {/* Logs */}
        <div className="bg-white border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Logs de Debug</h2>
          <div className="bg-gray-50 rounded p-3 max-h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-sm font-mono mb-1">
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Controles */}
        <div className="mt-4 space-x-2">
          <button
            onClick={() => setLogs([])}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Limpar Logs
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Recarregar Página
          </button>
        </div>
      </div>
    </div>
  )
} 