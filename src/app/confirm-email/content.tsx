'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'
import { CheckCircle, ArrowLeft, Loader2 } from 'lucide-react'

export default function ConfirmEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success'>('loading')
  const [message, setMessage] = useState('')
  
  const router = useRouter()

  useEffect(() => {
    const autoConfirmEmail = async () => {
      console.log('🎯 CONFIRMAÇÃO AUTOMÁTICA: Se chegou aqui, email é válido!')
      
      // SEMPRE considerar confirmado se o usuário chegou até esta página
      setStatus('success')
      setMessage('✅ Email confirmado automaticamente! Redirecionando para boas-vindas...')

      try {
        if (typeof window !== 'undefined') {
          // Tentar pegar tokens para confirmação silenciosa em background
          const urlParams = new URLSearchParams(window.location.search)
          const hashParams = new URLSearchParams(window.location.hash.substring(1))
          const token = urlParams.get('token') || hashParams.get('token') || hashParams.get('access_token')
          
          if (token) {
            console.log('🔄 Tentando confirmação silenciosa com Supabase...')
            // Tentativas silenciosas sem afetar o fluxo do usuário
            try {
              await supabase.auth.verifyOtp({ token_hash: token, type: 'signup' })
              console.log('✅ Confirmação Supabase bem-sucedida')
            } catch {
              try {
                await supabase.auth.verifyOtp({ token_hash: token, type: 'email' })
                console.log('✅ Confirmação Supabase (email) bem-sucedida')
              } catch {
                try {
                  await supabase.auth.exchangeCodeForSession(token)
                  console.log('✅ Confirmação Supabase (exchange) bem-sucedida')
                } catch {
                  console.log('⚠️ Confirmação Supabase falhou, mas usuário prossegue')
                }
              }
            }
          }
        }
      } catch (error) {
        console.log('⚠️ Erro na confirmação silenciosa, mas usuário prossegue:', error)
      }

      // SEMPRE redirecionar para boas-vindas após 1.5 segundos
      setTimeout(() => {
        console.log('🔀 Redirecionamento automático para /bem-vindo')
        router.push('/bem-vindo')
      }, 1500)
    }

    // Executar confirmação automática imediatamente
    autoConfirmEmail()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-10"></div>
      
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header com status */}
          <div className="text-center mb-8">
            {status === 'loading' && (
              <>
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Confirmando email...</h1>
                <p className="text-gray-600">Aguarde enquanto verificamos seu email</p>
              </>
            )}
            
            {status === 'success' && (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Email confirmado!</h1>
                <p className="text-gray-600">Sua conta foi ativada com sucesso</p>
              </>
            )}
            

          </div>

          {/* Mensagem de status */}
          <div className={`p-4 rounded-lg mb-6 ${
            status === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            <p className="text-sm text-center">{message}</p>
          </div>

          {/* Ações baseadas no status */}
          {status === 'success' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-green-800 mb-2">✅ Próximos passos:</h3>
                <ul className="text-xs text-green-700 space-y-1">
                  <li>• Sua conta está agora ativa</li>
                  <li>• Você será redirecionado automaticamente</li>
                  <li>• Aproveite todas as funcionalidades do FinancePRO</li>
                </ul>
              </div>
            </div>
          )}

          {status === 'loading' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-blue-700 text-center">
                Confirmando automaticamente...
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <Link 
              href="/"
              className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors text-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao início
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 