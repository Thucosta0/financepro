'use client'

import { useState } from 'react'
import { PLANS } from '@/lib/stripe'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check, X, AlertCircle } from 'lucide-react'

export default function TestStripePage() {
  const [result, setResult] = useState<{type: 'success' | 'error', message: string} | null>(null)
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      // Verificar configuração
      const hasValidPriceId = PLANS.PRO.stripePriceId && 
                             !PLANS.PRO.stripePriceId.includes('COLE_AQUI') &&
                             PLANS.PRO.stripePriceId.length > 20
      
      if (!hasValidPriceId) {
        setResult({
          type: 'error',
          message: 'Price ID inválido ou não configurado corretamente'
        })
        return
      }

      // Testar API
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: PLANS.PRO.stripePriceId,
          userId: 'test-user-123',
        }),
      })

      if (response.ok) {
        setResult({
          type: 'success',
          message: 'Stripe configurado corretamente! Checkout funcionando.'
        })
      } else {
        const error = await response.json()
        setResult({
          type: 'error',
          message: `Erro na API: ${error.error}`
        })
      }
      
    } catch (error) {
      setResult({
        type: 'error',
        message: `Erro: ${error}`
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">🧪 Teste Stripe</h1>
        
        <div className="space-y-4 mb-6">
          <div className="text-sm space-y-2">
            <div className="flex items-center justify-between">
              <span>Price ID:</span>
              <span className="font-mono text-xs">
                {PLANS.PRO.stripePriceId.substring(0, 15)}...
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Produto:</span>
              <span className="text-blue-600">{PLANS.PRO.name}</span>
            </div>
          </div>
        </div>

        <Button 
          onClick={runTests}
          disabled={loading}
          className="w-full mb-4"
        >
          {loading ? '⏳ Testando...' : '🚀 Testar Configuração'}
        </Button>

        {result && (
          <div className={`p-3 rounded-lg flex items-center gap-2 ${
            result.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {result.type === 'success' ? (
              <Check className="h-5 w-5" />
            ) : (
              <X className="h-5 w-5" />
            )}
            <span className="text-sm">{result.message}</span>
          </div>
        )}

        <div className="mt-6 text-xs text-gray-500">
          Use este teste para verificar se o Stripe está configurado corretamente
        </div>
      </Card>
    </div>
  )
} 