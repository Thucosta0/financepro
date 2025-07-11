import { NextRequest, NextResponse } from 'next/server'

interface FinancialData {
  receitas: number
  despesas: number
  saldo: number
  categorias: string
}

interface RequestBody {
  message: string
  financialData?: FinancialData
  isForBudgetTip?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json()
    const { message, financialData, isForBudgetTip } = body

    // Para dicas de orçamento, gerar resposta baseada nos dados financeiros
    if (isForBudgetTip && financialData) {
      const { receitas, despesas, saldo } = financialData
      
      // Lógica para gerar dicas baseadas no perfil financeiro
      let titulo = ''
      let descricao = ''
      
      const percentualGasto = receitas > 0 ? (despesas / receitas) * 100 : 0
      
      if (saldo < 0) {
        titulo = '🚨 Controle de Gastos Urgente'
        descricao = `Com gastos de ${percentualGasto.toFixed(1)}% da renda, é crucial reduzir despesas imediatamente. Foque em categorias não essenciais e considere fontes extras de renda.`
      } else if (percentualGasto > 80) {
        titulo = '⚠️ Atenção ao Orçamento'
        descricao = `Você está gastando ${percentualGasto.toFixed(1)}% da sua renda. Tente reduzir para 70% para ter mais folga financeira e criar uma reserva de emergência.`
      } else if (percentualGasto > 60) {
        titulo = '💰 Oportunidade de Poupança'
        descricao = `Com ${percentualGasto.toFixed(1)}% de gastos, você pode direcionar mais recursos para poupança. Tente economizar pelo menos 20% da renda mensalmente.`
      } else if (saldo > receitas * 0.5) {
        titulo = '📈 Considere Investimentos'
        descricao = `Excelente controle financeiro! Com esse saldo positivo, considere diversificar em investimentos para fazer seu dinheiro trabalhar para você.`
      } else {
        titulo = '✅ Situação Equilibrada'
        descricao = `Seu orçamento está bem balanceado. Continue monitorando e considere definir metas específicas para diferentes categorias de gastos.`
      }
      
      return NextResponse.json({
        response: `Título: ${titulo} | Descrição: ${descricao}`
      })
    }

    // Para mensagens gerais do chat, gerar resposta baseada no contexto
    let response = ''
    
    if (message.toLowerCase().includes('orçamento')) {
      response = 'Para um orçamento eficaz, recomendo a regra 50-30-20: 50% para necessidades, 30% para desejos e 20% para poupança. Revise mensalmente e ajuste conforme necessário.'
    } else if (message.toLowerCase().includes('investir') || message.toLowerCase().includes('investimento')) {
      response = 'Antes de investir, certifique-se de ter uma reserva de emergência de 3-6 meses de gastos. Comece com investimentos conservadores como CDB ou Tesouro Direto.'
    } else if (message.toLowerCase().includes('dívida') || message.toLowerCase().includes('divida')) {
      response = 'Para quitar dívidas, liste todas por ordem de juros (da maior para menor), quite primeiro as de juros mais altos e negocie quando possível.'
    } else if (message.toLowerCase().includes('cartão') || message.toLowerCase().includes('cartao')) {
      response = 'Use o cartão de crédito com consciência: pague sempre o valor total da fatura, monitore os gastos semanalmente e tenha um limite interno menor que o oferecido pelo banco.'
    } else if (message.toLowerCase().includes('poupança') || message.toLowerCase().includes('poupanca')) {
      response = 'Automatize sua poupança! Configure uma transferência automática logo após receber o salário. Mesmo valores pequenos, quando consistentes, geram grandes resultados.'
    } else if (message.toLowerCase().includes('emergência') || message.toLowerCase().includes('emergencia')) {
      response = 'A reserva de emergência deve cobrir 3-6 meses de gastos essenciais. Mantenha em aplicações líquidas como poupança ou CDB com liquidez diária.'
    } else {
      response = 'Olá! Sou seu assistente financeiro. Posso ajudar com dicas sobre orçamento, investimentos, controle de gastos, pagamento de dívidas e planejamento financeiro. Em que posso te ajudar especificamente?'
    }

    return NextResponse.json({ response })

  } catch (error) {
    console.error('Erro na API do assistente IA:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 