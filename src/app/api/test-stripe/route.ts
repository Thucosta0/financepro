import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function GET() {
  try {
    // Verificar se as variáveis de ambiente estão configuradas
    const requiredEnvVars = {
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      STRIPE_PRO_PRICE_ID: process.env.STRIPE_PRO_PRICE_ID,
    }

    const missingVars = Object.entries(requiredEnvVars)
      .filter(([key, value]) => !value)
      .map(([key]) => key)

    if (missingVars.length > 0) {
      return NextResponse.json({
        status: 'error',
        message: 'Variáveis de ambiente faltando',
        missing: missingVars
      }, { status: 400 })
    }

    // Testar conexão com Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-05-28.basil'
    })

    // Verificar se consegue acessar o Stripe
    const account = await stripe.accounts.retrieve()

    return NextResponse.json({
      status: 'success',
      message: 'Stripe configurado corretamente!',
      account: {
        id: account.id,
        business_profile: account.business_profile?.name || 'Não configurado'
      },
      env_vars: {
        publishable_key: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 20) + '...',
        secret_key: process.env.STRIPE_SECRET_KEY?.substring(0, 20) + '...',
        webhook_secret: process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 20) + '...',
        price_id: process.env.STRIPE_PRO_PRICE_ID
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Erro ao conectar com Stripe',
      error: error.message
    }, { status: 500 })
  }
} 