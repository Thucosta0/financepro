import Stripe from 'stripe'
import { loadStripe } from '@stripe/stripe-js'

// Verificar se as chaves estão configuradas
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

console.log('🔑 Stripe Keys Check (Client):', {
  hasPublishableKey: !!STRIPE_PUBLISHABLE_KEY,
  publishableKeyStart: STRIPE_PUBLISHABLE_KEY?.substring(0, 8)
})

// Para o cliente, só precisamos da chave pública
const hasStripeKeys = !!STRIPE_PUBLISHABLE_KEY

// Stripe server-side (apenas se as chaves estiverem configuradas)
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
export const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil',
  typescript: true,
}) : null

// Stripe client-side
let stripePromise: Promise<any>
export const getStripe = () => {
  if (!hasStripeKeys) {
    console.warn('⚠️ Chaves do Stripe não configuradas')
    return Promise.resolve(null)
  }
  
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}

// Configurações dos planos
export const PLANS = {
  FREE: {
    id: 'free',
    name: 'Trial Completo - 30 Dias',
    description: 'Acesso total e ilimitado por 30 dias - sem restrições',
    price: 0,
    currency: 'BRL',
    interval: 'month',
    features: [
      '🎉 ACESSO COMPLETO por 30 dias',
      '🚫 ZERO limitações durante o trial',
      '💰 Transações ilimitadas',
      '🏷️ Categorias ilimitadas',
      '💳 Cartões e contas ilimitados',
      '📊 Todos os relatórios e gráficos',
      '🤖 Assistente IA financeiro',
      '📈 Análises avançadas',
      '🔄 Transações recorrentes',
      '🎯 Orçamentos inteligentes',
      '📤 Exportação de dados',
      '✨ Experiência Premium completa'
    ],
    limits: {
      transactions: -1, // ILIMITADO
      categories: -1,   // ILIMITADO  
      cards: -1,        // ILIMITADO
      reports: true     // COMPLETO
    }
  },
  PRO: {
    id: 'pro',
    name: 'FinancePRO Premium',
    description: 'Acesso ilimitado a todas as funcionalidades',
    price: 17.00,
    currency: 'BRL',
    interval: 'month',
    stripeProductId: process.env.STRIPE_PRODUCT_ID || 'prod_SaR1OwjOyY2QKK',
    stripePriceId: process.env.STRIPE_PRICE_ID || 'price_1RfG9UBuYZD4v2rulRIZWc8B',
    features: [
      'Transações ilimitadas',
      'Categorias personalizadas ilimitadas',
      'Cartões e contas ilimitados',
      'Relatórios e gráficos avançados',
      'Análises financeiras profissionais',
      'Exportação de dados (Excel, PDF)',
      'Transações recorrentes automáticas',
      'Orçamentos inteligentes',
      'Suporte prioritário via chat',
      'Assistente IA financeiro'
    ],
    limits: {
      transactions: -1, // ilimitado
      categories: -1,
      cards: -1,
      reports: true
    }
  }
}

// Utilitário para formatação de preços
export const formatPrice = (price: number, currency: string = 'BRL') => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
  }).format(price)
} 