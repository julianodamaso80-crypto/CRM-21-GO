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

  const artigo = isMoto ? 'a' : 'o'
  const pronome = isMoto ? 'ela' : 'ele'

  const lines = [
    `Oi *${firstName}*! Tudo bem? 😊`,
    ``,
    `Recebi aqui sua simulação d${artigo} *${veiculo}*${placa ? ` — placa *${placa}*` : ''}.`,
    ``,
  ]

  if (valor) {
    lines.push(`Ficou em *${valor}/mês* pra proteger ${pronome} com o plano *${lead.cotacaoPlano}*.`)
    lines.push(``)
  }

  lines.push(
    `Com a *21Go* ${artigo} ${tipo} fica segur${artigo} *a partir de agora*. E o valor que apareceu ali? *Não muda, não sobe, sem surpresa*.`,
    ``,
    `Vamos proteger su${artigo} ${tipo} hoje? Me responde aqui que *eu resolvo pra você agora*, rapidinho 🚀`,
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
