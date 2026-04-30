import { NextRequest, NextResponse } from 'next/server'

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || ''
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE || '21go'
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || ''
const NOTIFY_NUMBER = process.env.NOTIFY_NUMBER || '5521980214882'

function isValidWhatsApp(v: string): boolean {
  const digits = v.replace(/\D/g, '')
  if (digits.length < 11) return false
  const ddd = parseInt(digits.slice(0, 2))
  if (ddd < 11 || ddd > 99) return false
  if (digits[2] !== '9') return false
  return digits.length === 11
}

export async function POST(request: NextRequest) {
  try {
    if (!EVOLUTION_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'WhatsApp n\u{E3}o configurado' },
        { status: 500 },
      )
    }

    const body = await request.json()
    const { nome, email, contato, experiencia } = body as {
      nome?: string
      email?: string
      contato?: string
      experiencia?: string
    }

    if (!nome?.trim() || !email?.trim() || !contato?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Nome, e-mail e contato s\u{E3}o obrigat\u{F3}rios.' },
        { status: 400 },
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'E-mail inv\u{E1}lido.' },
        { status: 400 },
      )
    }

    if (!isValidWhatsApp(contato)) {
      return NextResponse.json(
        { success: false, error: 'WhatsApp inv\u{E1}lido (DDD + 9 d\u{ED}gitos).' },
        { status: 400 },
      )
    }

    const message = [
      `\u{1F4BC} NOVO CANDIDATO A CONSULTOR - 21Go`,
      ``,
      `Nome: ${nome.trim()}`,
      `E-mail: ${email.trim()}`,
      `WhatsApp: ${contato.trim()}`,
      ``,
      `J\u{E1} trabalhou com prote\u{E7}\u{E3}o veicular?`,
      experiencia?.trim() ? experiencia.trim() : '(n\u{E3}o informado)',
      ``,
      `\u{1F680} Entre em contato pra qualificar e seguir com o onboarding.`,
    ].join('\n')

    const response = await fetch(
      `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: EVOLUTION_API_KEY,
        },
        body: JSON.stringify({ number: NOTIFY_NUMBER, text: message }),
      },
    )

    if (!response.ok) {
      const txt = await response.text().catch(() => '')
      console.error('[Consultor API] Evolution falhou', response.status, txt.slice(0, 200))
      return NextResponse.json(
        { success: false, error: 'Falha ao enviar — tente novamente em instantes.' },
        { status: 502 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[Consultor API]', err.message)
    return NextResponse.json(
      { success: false, error: 'Erro inesperado.' },
      { status: 500 },
    )
  }
}
