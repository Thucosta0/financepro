'use client'

import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl font-bold text-white">₿</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">FinancePRO</h2>
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Redirecionamento está sendo feito no useEffect
  }

  return <>{children}</>
} 