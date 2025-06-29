import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase-client'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe não configurado' },
      { status: 500 }
    )
  }

  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('Stripe-Signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Erro na verificação do webhook:', err)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  console.log(`Evento recebido: ${event.type}`)

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Evento não tratado: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id)
  
  if (session.mode === 'subscription' && stripe) {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
    await handleSubscriptionCreated(subscription)
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId
  
  if (!userId) {
    console.error('UserId não encontrado nos metadados da assinatura')
    return
  }

  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      plan_id: 'pro',
      status: subscription.status,
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      stripe_price_id: subscription.items.data[0]?.price.id,
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      trial_start: subscription.trial_start 
        ? new Date(subscription.trial_start * 1000).toISOString()
        : null,
      trial_end: subscription.trial_end 
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
    })

  if (error) {
    console.error('Erro ao criar/atualizar assinatura:', error)
  } else {
    console.log('Assinatura criada/atualizada com sucesso para o usuário:', userId)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId
  
  if (!userId) {
    // Tentar encontrar o usuário pelo customer_id
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .single()
    
    if (!existingSubscription) {
      console.error('Usuário não encontrado para a assinatura:', subscription.id)
      return
    }
  }

  const { error } = await supabase
    .from('subscriptions')
    .update({
      plan_id: 'pro',
      status: subscription.status,
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at 
        ? new Date(subscription.canceled_at * 1000).toISOString()
        : null,
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Erro ao atualizar assinatura:', error)
  } else {
    console.log('Assinatura atualizada com sucesso:', subscription.id)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Erro ao cancelar assinatura:', error)
  } else {
    console.log('Assinatura cancelada com sucesso:', subscription.id)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  if ((invoice as any).subscription && stripe) {
    const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string)
    await handleSubscriptionUpdated(subscription)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Payment failed for invoice:', invoice.id)
  
  if ((invoice as any).subscription) {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'past_due',
      })
      .eq('stripe_subscription_id', (invoice as any).subscription as string)

    if (error) {
      console.error('Erro ao atualizar status para past_due:', error)
    }
  }
} 