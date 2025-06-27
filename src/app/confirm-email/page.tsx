'use client'

import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import ConfirmEmailContent from './confirm-email-content'

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-10"></div>
      
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Carregando...</h1>
            <p className="text-gray-600">Preparando confirmação de email</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ConfirmEmailContent />
    </Suspense>
  )
} 