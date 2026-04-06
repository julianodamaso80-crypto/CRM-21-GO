import { prisma } from '../../config/database'

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'https://n8n-evolution.aynvvy.easypanel.host'
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE || '21go'
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || ''

interface FollowUpInput {
  leadId: string
}

function buildFollowUpMessage(lead: {
  nome: string
  marcaInteresse: string | null
  modeloInteresse: string | null
  placaInteresse: string | null
  cotacaoValor: number | null
  cotacaoPlano: string | null
  anoInteresse: number | null
}): string {
  const firstName = lead.nome.split(' ')[0]
  const isMoto = (lead.marcaInteresse || '').toLowerCase().includes('moto') ||
    (lead.cotacaoPlano || '').toLowerCase().includes('moto')
  const tipo = isMoto ? 'moto' : 'carro'
  const veiculo = lead.modeloInteresse && lead.modeloInteresse !== '(manual)' && lead.modeloInteresse !== '(informado manualmente)'
    ? `${lead.marcaInteresse} ${lead.modeloInteresse} ${lead.anoInteresse || ''}`.trim()
    : tipo === 'moto' ? 'sua moto' : 'seu carro'
  const placa = lead.placaInteresse || ''
  const valor = lead.cotacaoValor
    ? `R$ ${lead.cotacaoValor.toFixed(2).replace('.', ',')}`
    : null

  // Mensagem matadora — urgência + exclusividade + perda
  const lines = [
    `Oi ${firstName}! Aqui é da *21Go Proteção Veicular* 🛡️`,
    ``,
    `Vi que você acabou de simular a proteção do *${veiculo}*${placa ? ` (placa ${placa})` : ''}.`,
    ``,
  ]

  if (valor) {
    lines.push(`Seu orçamento ficou em *${valor}/mês* no plano *${lead.cotacaoPlano}*.`)
    lines.push(``)
  }

  lines.push(
    `⚡ *O que você precisa saber antes de fechar o dia sem proteção:*`,
    ``,
    `🔴 *129 veículos* são roubados por dia só no RJ`,
    `🔴 Se acontecer HOJE, você paga *100% do prejuízo do próprio bolso*`,
    `🔴 Seguradora recusa? A gente aceita. Nome sujo? A gente aceita. Leilão? A gente aceita.`,
    ``,
    `✅ Na 21Go você tem *cobertura ativa em até 48h*`,
    `✅ *20+ anos* no mercado, cadastrada na *SUSEP*`,
    `✅ *Guincho 200km + Assistência 24h* desde o dia 1`,
    ``,
    `Cada minuto sem proteção é um risco real. E o valor que você viu ali? *É o mais baixo que conseguimos*. Não trava, não sobe depois.`,
    ``,
    `Quer garantir essa condição? Me responde aqui que *eu fecho pra você agora* em menos de 5 minutos. 🚀`,
  )

  return lines.join('\n')
}

export async function sendFollowUp(input: FollowUpInput) {
  if (!EVOLUTION_API_KEY) {
    console.warn('[FollowUp] Evolution API key not configured, skipping')
    return { success: false, error: 'Evolution API not configured' }
  }

  try {
    const lead = await prisma.lead.findUnique({
      where: { id: input.leadId },
    })

    if (!lead) {
      return { success: false, error: 'Lead not found' }
    }

    // Não enviar se já converteu ou já recebeu follow-up
    if (lead.etapaFunil === 'convertido' || lead.followUpEnviado) {
      return { success: false, error: 'Lead already converted or followed up' }
    }

    // Formatar número (remover formatação, garantir 55 + DDD + número)
    const rawPhone = lead.whatsapp.replace(/\D/g, '')
    const phone = rawPhone.startsWith('55') ? rawPhone : `55${rawPhone}`

    const message = buildFollowUpMessage(lead)

    // Enviar via Evolution API
    const response = await fetch(
      `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_API_KEY,
        },
        body: JSON.stringify({
          number: phone,
          text: message,
        }),
      },
    )

    const result = await response.json()

    // Marcar follow-up como enviado
    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        followUpEnviado: true,
        followUpData: new Date(),
        etapaFunil: 'followup_enviado',
      },
    })

    console.log(`[FollowUp] Sent to ${lead.nome} (${phone})`)
    return { success: true, leadId: lead.id, phone }
  } catch (err: any) {
    console.error('[FollowUp] Error:', err.message)
    return { success: false, error: err.message }
  }
}
