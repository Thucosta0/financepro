'use client'

import { AIAssistant } from './ai-assistant'
import { useFinancial } from '@/context/financial-context'
import { useAuth } from '@/context/auth-context'

export function AIAssistantWrapper() {
  const { user } = useAuth()
  const { getFinancialSummary } = useFinancial()
  
  // Só mostra o AI Assistant se o usuário estiver logado
  if (!user) {
    return null
  }
  
  // Obtém dados financeiros atualizados em tempo real
  const financialData = getFinancialSummary()
  
  return <AIAssistant financialData={financialData} />
} 