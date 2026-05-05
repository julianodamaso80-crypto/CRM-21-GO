import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { generateQuotePdf } from '@/lib/pdf-quote'
import { isStorageConfigured, uploadPdf } from '@/lib/storage'
import {
  buildExcludedMessage,
  buildFollowUpMessage,
  formatPhone,
  isWhatsappConfigured,
  sendPdfMedia,
  sendText,
} from '@/lib/whatsapp'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const POWERCRM_BASE_URL = process.env.POWERCRM_BASE_URL || 'https://api.powercrm.com.br'
const POWERAPI_TOKEN = process.env.POWERAPI_TOKEN
const POWERCRM_DEFAULT_SLSMN_NW_ID = process.env.POWERCRM_DEFAULT_SLSMN_NW_ID || 'WDVMKnkq'
const POWERCRM_DEFAULT_LEAD_SOURCE = process.env.POWERCRM_DEFAULT_LEAD_SOURCE || '1584'

interface LeadInput {
  nome?: string
  whatsapp?: string
  email?: string | null
  placa?: string | null
  marca?: string | null
  modelo?: string | null
  ano?: string | number | null
  cor?: string | null
  valorFipe?: number
  fipeCode?: string | null
  categoria?: string | null
  combustivel?: string | null
  cilindrada?: number | null
  plano?: string | null
  valorMensal?: number
  carroApp?: boolean
  leilao?: 'nao' | 'leilao' | 'remarcado' | string
  seguroAtual?: string | null
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  utm_content?: string | null
  utm_term?: string | null
  gclid?: string | null
  fbclid?: string | null
  fbp?: string | null
  fbc?: string | null
}

export async function POST(req: NextRequest) {
  let body: LeadInput
  try {
    body = (await req.json()) as LeadInput
  } catch {
    return NextResponse.json({ success: false, error: 'invalid_json' }, { status: 400 })
  }

  const nome = body.nome?.trim()
  const whatsapp = body.whatsapp?.trim().replace(/\D/g, '')
  if (!nome || !whatsapp) {
    return NextResponse.json(
      { success: false, error: 'nome e whatsapp são obrigatórios' },
      { status: 400 },
    )
  }

  const leadId = `lead_${crypto.randomBytes(8).toString('hex')}`

  // 1) Cria lead no PowerCRM (chain completa que descobrimos)
  const powercrm = POWERAPI_TOKEN
    ? await createLeadPowerCRM(body, leadId).catch((err) => ({
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      }))
    : { ok: false, error: 'POWERAPI_TOKEN ausente' }

  // 2) Resposta imediata pro front (não trava com PDF/WhatsApp)
  // PDF + WhatsApp rodam em background.
  ;(async () => {
    try {
      await sendQuotePdfWhatsApp(body, leadId)
    } catch (err) {
      console.error('[lead] Falha PDF/WhatsApp:', err instanceof Error ? err.message : err)
    }
  })()

  return NextResponse.json({
    success: true,
    leadId,
    powercrm,
  })
}

/* ───────────────── PowerCRM ───────────────── */

async function createLeadPowerCRM(body: LeadInput, leadId: string) {
  const apiHeaders = {
    accept: 'application/json',
    Authorization: `Bearer ${POWERAPI_TOKEN}`,
  } as Record<string, string>

  const placa = body.placa?.toUpperCase().replace(/[^A-Z0-9]/g, '')

  // Lookup PowerCRM plates pra pegar dados internos (brandId, codFipe, year, chassi)
  let pcVehicle: Record<string, unknown> | null = null
  if (placa && placa.length === 7) {
    try {
      const r = await fetch(`${POWERCRM_BASE_URL}/api/quotation/plates/${placa}`, {
        headers: apiHeaders,
      })
      const j = (await r.json().catch(() => null)) as Record<string, unknown> | null
      if (r.ok && j && (j as { mensagem?: string }).mensagem === 'ok') pcVehicle = j
    } catch {
      pcVehicle = null
    }
  }

  // Cidade interna PowerCRM (via UF/cidade do plates)
  let cityId: number | undefined
  if (pcVehicle?.uf && pcVehicle?.city) {
    try {
      const sttRes = await fetch(`${POWERCRM_BASE_URL}/api/quotation/stt`, { headers: apiHeaders })
      const sttList = (await sttRes.json().catch(() => null)) as
        | { id: number; back: string }[]
        | null
      const state = sttList?.find((s) => s.back === pcVehicle!.uf)
      if (state) {
        const ctRes = await fetch(`${POWERCRM_BASE_URL}/api/quotation/ct?st=${state.id}`, {
          headers: apiHeaders,
        })
        const ctList = (await ctRes.json().catch(() => null)) as
          | { id: number; text: string }[]
          | null
        const cityName = (pcVehicle.city as string).toUpperCase()
        const city = ctList?.find((c) => (c.text || '').toUpperCase() === cityName)
        if (city) cityId = city.id
      }
    } catch {
      cityId = undefined
    }
  }

  // Match modelo via codFipe (cb→cmby chain)
  let mdl: number | undefined
  let mdlYr: number | undefined
  const isMoto = (body.categoria || '').toLowerCase().includes('moto')
  const tipo = isMoto ? 2 : 3 // 1=carro, 2=moto, 3=caminhão? — uso 1 se carro normal
  const tipoFinal = isMoto ? 2 : 1

  const brandName = (body.marca || (pcVehicle?.brand as string) || '').toUpperCase()
  const codFipe = (pcVehicle?.codFipe as string) || body.fipeCode || ''
  const yearStr = (pcVehicle?.year as string) || (body.ano ? String(body.ano) : '')
  const yearMatch = yearStr.match(/(\d{4})/)
  const year = yearMatch ? yearMatch[1] : undefined

  if (brandName && codFipe && year) {
    try {
      const cbRes = await fetch(`${POWERCRM_BASE_URL}/api/quotation/cb?type=${tipoFinal}`, {
        headers: apiHeaders,
      })
      const cbList = (await cbRes.json().catch(() => null)) as { id: number; text: string }[] | null
      const tokens = brandName
        .split(/\s+/)
        .filter((t) => t.length >= 2 && !/^I+$/.test(t))
      let cbMatch: { id: number; text: string } | undefined
      for (const tok of tokens) {
        cbMatch = cbList?.find((c) => (c.text || '').toUpperCase() === tok)
        if (cbMatch) break
      }
      if (!cbMatch) {
        for (const tok of tokens) {
          cbMatch = cbList?.find((c) => (c.text || '').toUpperCase().includes(tok))
          if (cbMatch) break
        }
      }
      if (cbMatch) {
        const cmbyRes = await fetch(
          `${POWERCRM_BASE_URL}/api/quotation/cmby?cb=${cbMatch.id}&cy=${year}`,
          { headers: apiHeaders },
        )
        const cmbyList = (await cmbyRes.json().catch(() => null)) as
          | { id: number; text: string; back: string }[]
          | null
        const exact = cmbyList?.find((m) => m.back === codFipe)
        if (exact) {
          mdl = exact.id
          const cmyRes = await fetch(
            `${POWERCRM_BASE_URL}/api/quotation/cmy?cm=${exact.id}`,
            { headers: apiHeaders },
          )
          const cmyList = (await cmyRes.json().catch(() => null)) as
            | { id: number; text: string }[]
            | null
          const matchYear = cmyList?.find((y) => (y.text || '').startsWith(year))
          if (matchYear) mdlYr = matchYear.id
        }
      }
    } catch {
      // segue sem mdl/mdlYr
    }
  }

  // Add inicial
  const addPayload: Record<string, unknown> = {
    name: body.nome,
    phone: body.whatsapp?.replace(/\D/g, ''),
    email: body.email || undefined,
    plts: placa || undefined,
    leadSource: Number(POWERCRM_DEFAULT_LEAD_SOURCE),
    slsmnNwId: POWERCRM_DEFAULT_SLSMN_NW_ID,
  }
  if (pcVehicle?.chassi) addPayload.chassi = pcVehicle.chassi
  if (mdl) addPayload.mdl = mdl
  if (mdlYr) addPayload.mdlYr = mdlYr
  if (cityId) addPayload.city = cityId
  if (body.valorFipe) addPayload.protectedValue = body.valorFipe
  if (body.carroApp) addPayload.workVehicle = true

  const addRes = await fetch(`${POWERCRM_BASE_URL}/api/quotation/add`, {
    method: 'POST',
    headers: { ...apiHeaders, 'content-type': 'application/json' },
    body: JSON.stringify(addPayload),
  })
  const addJson = (await addRes.json().catch(() => null)) as Record<string, unknown> | null
  const quotationCode = addJson?.quotationCode as string | undefined

  // Updates em sequência (cada campo isolado, evita bug de combinação)
  const internalNotes: string[] = []
  if (body.leilao === 'leilao') internalNotes.push('Veículo de leilão')
  if (body.leilao === 'remarcado') internalNotes.push('Veículo remarcado')
  if (body.carroApp) internalNotes.push('Carro de aplicativo (Uber/99)')
  if (body.seguroAtual && body.seguroAtual.trim())
    internalNotes.push(`Já possui proteção atual: ${body.seguroAtual.trim()}`)

  const fabricationYear = yearStr.match(/(\d{4})/)?.[1]
    ? Number(yearStr.match(/(\d{4})/)![1])
    : undefined

  const updates: Record<string, unknown>[] = []
  if (mdl) updates.push({ carModel: mdl })
  if (mdlYr) updates.push({ carModelYear: mdlYr })
  if (fabricationYear) updates.push({ fabricationYear })
  if (body.carroApp) updates.push({ workVehicle: true })
  if (internalNotes.length > 0)
    updates.push({ noteContractInternal: internalNotes.join(' | ') })

  if (quotationCode) {
    for (const patch of updates) {
      try {
        await fetch(`${POWERCRM_BASE_URL}/api/quotation/update`, {
          method: 'POST',
          headers: { ...apiHeaders, 'content-type': 'application/json' },
          body: JSON.stringify({ code: quotationCode, ...patch }),
        })
      } catch {
        // segue
      }
    }
  }

  return {
    ok: addRes.ok,
    quotationCode,
    negotiationCode: addJson?.negotiationCode,
    leadId,
  }
}

/* ───────────────── PDF + WhatsApp ───────────────── */

async function sendQuotePdfWhatsApp(body: LeadInput, leadId: string) {
  if (!isWhatsappConfigured()) {
    console.warn('[lead] WhatsApp não configurado — pulando envio')
    return
  }

  // Lead excluído (sem cotação) → manda mensagem texto simples sem PDF
  const isExcluded = (body.plano || '').toUpperCase() === 'EXCLUIDO'
  const phone = formatPhone(body.whatsapp || '')

  if (isExcluded) {
    await sendText(
      phone,
      buildExcludedMessage({
        nome: body.nome || '',
        whatsapp: body.whatsapp || '',
        placa: body.placa,
        marca: body.marca,
        modelo: body.modelo,
        ano: body.ano,
        fipe: body.valorFipe,
      }),
    )
    return
  }

  // Validações para gerar PDF
  if (!body.marca || !body.modelo || !body.valorFipe || !body.plano || !body.valorMensal) {
    console.warn('[lead] Dados incompletos pra gerar PDF — enviando mensagem texto')
    await sendText(phone, buildFollowUpMessage({
      nome: body.nome || '',
      marca: body.marca,
      modelo: body.modelo,
      placa: body.placa,
    }))
    return
  }

  const filename = `simulacao-21go-${leadId}.pdf`
  const pdf = await generateQuotePdf({
    nome: body.nome || '',
    whatsapp: body.whatsapp || '',
    email: body.email,
    placa: body.placa,
    marca: body.marca,
    modelo: body.modelo,
    ano: body.ano || '',
    cor: body.cor,
    fipe: body.valorFipe,
    planoNome: body.plano,
    mensalidade: body.valorMensal,
    isMoto: (body.categoria || '').toLowerCase().includes('moto'),
    categoria: body.categoria,
    combustivel: body.combustivel,
    cilindrada: body.cilindrada,
    carroApp: body.carroApp,
    leilao: body.leilao,
    seguroAtual: body.seguroAtual,
  })

  let media: string
  if (isStorageConfigured()) {
    try {
      const key = `quotes/${new Date().toISOString().slice(0, 10)}/${leadId}.pdf`
      const { url } = await uploadPdf(key, pdf, filename)
      media = url
    } catch (err) {
      console.warn('[lead] Storage upload falhou, usando base64:', err instanceof Error ? err.message : err)
      media = pdf.toString('base64')
    }
  } else {
    media = pdf.toString('base64')
  }

  const caption = buildFollowUpMessage({
    nome: body.nome || '',
    marca: body.marca,
    modelo: body.modelo,
    placa: body.placa,
  })
  await sendPdfMedia(phone, media, caption, filename)
}
