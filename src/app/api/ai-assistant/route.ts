import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Configuração da chave API da OpenAI (via variável de ambiente)
const apiKey = process.env.OPENAI_API_KEY

// Inicializar o cliente OpenAI
let openai: OpenAI | null = null

try {
  if (apiKey && apiKey.startsWith('sk-')) {
    openai = new OpenAI({
      apiKey: apiKey,
    })
    console.log('✅ OpenAI API configurada com sucesso')
  } else {
    console.warn('⚠️ Chave OpenAI não configurada - Assistente IA desabilitado')
  }
} catch (error) {
  console.error('❌ Erro ao inicializar OpenAI:', error)
}

export async function POST(request: NextRequest) {
  try {
    // Verificar se o OpenAI está configurado
    if (!openai) {
      console.error('❌ OpenAI não configurado')
      return NextResponse.json(
        { 
          error: 'Assistente IA temporariamente indisponível. Tente novamente mais tarde.' 
        },
        { status: 503 }
      )
    }

    const { message, financialData } = await request.json()

    // Contexto básico sempre presente
    let systemPrompt = `Você é o FinanceGPT, um assistente financeiro especializado em educação financeira pessoal. Seja mais humano e mais educado.
    Você deve sempre responder em português brasileiro, ser educativo, positivo e oferecer dicas práticas.
    Mantenha suas respostas concisas (máximo 200 palavras) e focadas na educação financeira.`

    // Se dados financeiros estão disponíveis, adiciona contexto específico
    if (financialData) {
      systemPrompt += `\n\nDados financeiros atuais do usuário:
      - Receitas: R$ ${financialData.receitas.toLocaleString('pt-BR')}
      - Despesas: R$ ${financialData.despesas.toLocaleString('pt-BR')}
      - Saldo: R$ ${financialData.saldo.toLocaleString('pt-BR')}
      - Principais categorias: ${financialData.categorias}
      
      Use esses dados para dar conselhos mais específicos e personalizados.`
    } else {
      systemPrompt += `\n\nO usuário ainda não tem dados financeiros cadastrados no sistema. 
      Incentive-o a começar a registrar suas transações para ter uma visão melhor de sua situação financeira.`
    }

    console.log('🤖 Enviando requisição para OpenAI...')
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user", 
          content: message
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    })

    const response = completion.choices[0]?.message?.content || 'Desculpe, não consegui gerar uma resposta. Tente novamente.'

    console.log('✅ Resposta gerada com sucesso')
    return NextResponse.json({ response })
    
  } catch (error) {
    console.error('❌ Erro na API do assistente:', error)
    
    // Tratamento específico para erro de API
    if (error instanceof Error && (error.message.includes('apiKey') || error.message.includes('API'))) {
      return NextResponse.json(
        { 
          error: 'Erro na comunicação com o assistente IA. Tente novamente em alguns instantes.' 
        },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor. Verifique os logs para mais detalhes.' },
      { status: 500 }
    )
  }
} 