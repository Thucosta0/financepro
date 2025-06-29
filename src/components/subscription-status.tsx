'use client'

import { useRouter } from 'next/navigation'
import { useSubscription } from '@/hooks/use-subscription'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Crown, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  Zap,
  Star
} from 'lucide-react'

export default function SubscriptionStatus() {
  const router = useRouter()
  const { 
    subscription, 
    loading, 
    isInTrial, 
    isPro, 
    isTrialExpired,
    getTrialDaysRemaining,
    getStatusText,
    getLimits 
  } = useSubscription()

  if (loading) {
    return (
      <Card className="p-4 bg-gray-50">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </Card>
    )
  }

  if (!subscription) return null

  const limits = getLimits()

  // Status de trial ativo
  if (isInTrial()) {
    const daysRemaining = getTrialDaysRemaining()
    const isNearExpiration = daysRemaining <= 7

    return (
      <Card className={`p-4 border-2 ${
        isNearExpiration 
          ? 'bg-orange-50 border-orange-200' 
          : 'bg-green-50 border-green-200'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              isNearExpiration ? 'bg-orange-100' : 'bg-green-100 animate-pulse'
            }`}>
              {isNearExpiration ? (
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              ) : (
                <Star className="w-5 h-5 text-green-600" />
              )}
            </div>
            <div>
              <h3 className={`font-semibold ${
                isNearExpiration ? 'text-orange-800' : 'text-green-800'
              }`}>
                {isNearExpiration ? 'Trial expirando em breve!' : '🎉 Acesso Premium Completo'}
              </h3>
              <p className={`text-sm ${
                isNearExpiration ? 'text-orange-600' : 'text-green-600'
              } font-medium`}>
                {isNearExpiration 
                  ? `${daysRemaining} ${daysRemaining === 1 ? 'dia restante' : 'dias restantes'} - Não perca!`
                  : `🚫 ZERO limitações • ${daysRemaining} dias restantes`
                }
              </p>
            </div>
          </div>
          
          <Button
            onClick={() => router.push('/planos')}
            size="sm"
            className={
              isNearExpiration 
                ? 'bg-orange-600 hover:bg-orange-700' 
                : 'bg-green-600 hover:bg-green-700'
            }
          >
            <Crown className="w-4 h-4 mr-1" />
            {isNearExpiration ? 'Renovar Agora' : 'Ver Planos'}
          </Button>
        </div>

        {/* Status visual de acesso ilimitado */}
        {!isNearExpiration && (
          <div className="mt-3 flex items-center gap-4 text-xs text-green-700">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Transações ∞</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Categorias ∞</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Cartões ∞</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Recursos ∞</span>
            </div>
          </div>
        )}
      </Card>
    )
  }

  // Status PRO ativo
  if (isPro()) {
    return (
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-full">
              <Star className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-purple-800 flex items-center gap-2">
                <Crown className="w-4 h-4" />
                FinancePRO Ativo
              </h3>
              <p className="text-sm text-purple-600">
                Aproveite todos os recursos ilimitados
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
              <Zap className="w-4 h-4" />
              Ilimitado
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // Trial expirado
  if (isTrialExpired()) {
    return (
      <Card className="p-4 bg-red-50 border-2 border-red-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-red-800">
                Trial de 30 dias expirado
              </h3>
              <p className="text-sm text-red-600">
                Faça upgrade para continuar com acesso ilimitado
              </p>
            </div>
          </div>
          
          <Button
            onClick={() => router.push('/planos')}
            size="sm"
            className="bg-red-600 hover:bg-red-700"
          >
            <TrendingUp className="w-4 h-4 mr-1" />
            Renovar Agora
          </Button>
        </div>

        <div className="mt-4 p-3 bg-red-100 rounded-lg">
          <p className="text-sm text-red-700">
            ⚠️ <strong>Acesso bloqueado:</strong> Seu trial completo de 30 dias expirou. Faça upgrade para continuar usando todas as funcionalidades.
          </p>
        </div>
      </Card>
    )
  }

  // Status indefinido
  return (
    <Card className="p-4 bg-gray-50 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-full">
            <Calendar className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Status da assinatura</h3>
            <p className="text-sm text-gray-600">{getStatusText()}</p>
          </div>
        </div>
        
        <Button
          onClick={() => router.push('/planos')}
          size="sm"
          variant="outline"
        >
          Ver Planos
        </Button>
      </div>
    </Card>
  )
} 