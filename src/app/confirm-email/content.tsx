'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'
import { CheckCircle, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react'

export default function ConfirmEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  
  const router = useRouter()

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Obter parâmetros da URL usando window.location (apenas no cliente)
        const urlParams = new URLSearchParams(window.location.search)
        const token = urlParams.get('token')
        const type = urlParams.get('type')
        
        if (!token || type !== 'signup') {
          setStatus('error')
          setMessage('Link de confirmação inválido ou expirado.')
          return
        }

        // Confirmar o email usando o token
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'signup'
        })

        if (error) {
          console.error('Error confirming email:', error)
          setStatus('error')
          
          if (error.message.includes('expired')) {
            setMessage('Link de confirmação expirado. Solicite um novo email de confirmação.')
          } else if (error.message.includes('invalid')) {
            setMessage('Link de confirmação inválido. Verifique se você está usando o link correto.')
          } else {
            setMessage('Erro ao confirmar email. Tente novamente.')
          }
        } else {
          setStatus('success')
          setMessage('Email confirmado com sucesso! Redirecionando para o login...')
          
          // Redirecionar para login após 3 segundos
          setTimeout(() => {
            router.push('/login')
          }, 3000)
        }
      } catch (error) {
        console.error('Error in confirmEmail:', error)
        setStatus('error')
        setMessage('Erro inesperado ao confirmar email.')
      }
    }

    // Só executar no lado cliente
    if (typeof window !== 'undefined') {
      confirmEmail()
    }
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
            
            {status === 'error' && (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro na confirmação</h1>
                <p className="text-gray-600">Não foi possível confirmar seu email</p>
              </>
            )}
          </div>

          {/* Mensagem de status */}
          <div className={`p-4 rounded-lg mb-6 ${
            status === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200'
              : status === 'error'
              ? 'bg-red-50 text-red-800 border border-red-200'
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
                  <li>• Você pode fazer login normalmente</li>
                  <li>• Aproveite todas as funcionalidades do FinancePRO</li>
                </ul>
              </div>
              
              <Link
                href="/login"
                className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-center"
              >
                Ir para o login
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-amber-800 mb-2">💡 O que fazer agora:</h3>
                <ul className="text-xs text-amber-700 space-y-1">
                  <li>• Verifique se o link está completo</li>
                  <li>• Tente criar uma nova conta se necessário</li>
                  <li>• Entre em contato conosco se o problema persistir</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <Link
                  href="/cadastro"
                  className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-center"
                >
                  Criar nova conta
                </Link>
                
                <Link
                  href="/login"
                  className="block w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 text-center"
                >
                  Tentar fazer login
                </Link>
              </div>
            </div>
          )}

          {status === 'loading' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-blue-700 text-center">
                Este processo pode levar alguns segundos...
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