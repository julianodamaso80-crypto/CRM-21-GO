import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { quotationAdd, quotationUpdate } from '@/lib/powercrm'
import { getRequestContext } from '@/lib/request-context'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface IncomingPayload {
  nome?: string
  whatsapp?: string
  telefone?: string
  email?: string
  cpf?: string
  placa?: string
  marca?: string
  modelo?: string
  ano?: string | number
  ano_fabricacao?: string | number
  fipeCodigo?: string
  fipe_codigo?: string
  cidade?: string
  estado?: string
  plano?: string
  valorMensal?: number
  valorFipe?: number
  carroApp?: boolean
  leilao?: string
  seguroAtual?: string

  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  gclid?: string
  gbraid?: string
  wbraid?: string
  fbclid?: string
  fbp?: string
  fbc?: string
  ga_client_id?: string
  external_id?: string
  event_id?: string
  landing_page?: string
}

const POWERCRM_DEFAULT_LEAD_SOURCE = (() => {
  const v = process.env.POWERCRM_DEFAULT_LEAD_SOURCE
  return v ? Number(v) : undefined
})()

const POWERCRM_LEAD_SOURCE_GOOGLE = numEnv('POWERCRM_LEAD_SOURCE_GOOGLE')
const POWERCRM_LEAD_SOURCE_META = numEnv('POWERCRM_LEAD_SOURCE_META')
const POWERCRM_LEAD_SOURCE_INSTAGRAM = numEnv('POWERCRM_LEAD_SOURCE_INSTAGRAM')
const POWERCRM_LEAD_SOURCE_DIRECT = numEnv('POWERCRM_LEAD_SOURCE_DIRECT')
const POWERCRM_DEFAULT_COOP = numEnv('POWERCRM_DEFAULT_COOP')
const POWERCRM_DEFAULT_PWRLNK = process.env.POWERCRM_DEFAULT_PWRLNK

function numEnv(key: string): number | undefined {
  const v = process.env[key]
  return v ? Number(v) : undefined
}

function pickLeadSource(p: IncomingPayload): number | undefined {
  const source = (p.utm_source || '').toLowerCase()
  const medium = (p.utm_medium || '').toLowerCase()
  if (source === 'google' && (medium === 'cpc' || medium === 'paid')) return POWERCRM_LEAD_SOURCE_GOOGLE
  if (source === 'facebook' || source === 'meta') return POWERCRM_LEAD_SOURCE_META
  if (source === 'instagram') return POWERCRM_LEAD_SOURCE_INSTAGRAM ?? POWERCRM_LEAD_SOURCE_META
  if (!source) return POWERCRM_LEAD_SOURCE_DIRECT
  return POWERCRM_DEFAULT_LEAD_SOURCE
}

function s(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined
  const t = v.trim()
  return t.length > 0 ? t : undefined
}

function n(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string' && v.trim() !== '') {
    const parsed = Number(v)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}

export async function POST(req: NextRequest) {
  let body: IncomingPayload
  try {
    body = (await req.json()) as IncomingPayload
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  const nome = s(body.nome)
  const telefone = s(body.whatsapp ?? body.telefone)
  if (!nome || !telefone) {
    return NextResponse.json({ ok: false, error: 'nome e telefone são obrigatórios' }, { status: 400 })
  }

  const ctx = getRequestContext(req)
  const supa = supabaseAdmin()

  // Origem mapeada igual a regra do trigger SQL planejado
  const utmSource = (s(body.utm_source) ?? '').toLowerCase()
  const utmMedium = (s(body.utm_medium) ?? '').toLowerCase()
  const origem =
    !utmSource ? 'site_organico'
    : utmSource === 'google' && (utmMedium === 'cpc' || utmMedium === 'paid' || utmMedium === 'ads') ? 'google_ads'
    : (utmSource === 'facebook' || utmSource === 'meta') ? 'meta_ads'
    : utmSource === 'instagram' ? 'instagram'
    : utmSource === 'whatsapp' ? 'whatsapp'
    : 'outro'

  // trk = hash unico para tracking de conversao (compatibilidade com PowerCRM)
  const trk = crypto.randomBytes(16).toString('hex')

  // Tenta gravar em lead_attribution. Se a tabela nao existir, gravar em public.leads (CRM).
  // Mantemos lead_attribution como path preferencial para nao quebrar fluxos antigos quando
  // a migration for aplicada.
  const attrPayload = {
    trk,
    nome,
    email: s(body.email) ?? null,
    telefone,
    cpf: s(body.cpf) ?? null,
    placa: s(body.placa) ?? null,
    fipe_codigo: s(body.fipeCodigo ?? body.fipe_codigo) ?? null,
    marca: s(body.marca) ?? null,
    modelo: s(body.modelo) ?? null,
    ano_modelo: n(body.ano) ?? null,
    ano_fabricacao: n(body.ano_fabricacao) ?? null,
    plano_interesse: s(body.plano) ?? null,
    cidade: s(body.cidade) ?? null,
    estado: s(body.estado) ?? null,
    gclid: s(body.gclid) ?? null,
    gbraid: s(body.gbraid) ?? null,
    wbraid: s(body.wbraid) ?? null,
    fbclid: s(body.fbclid) ?? null,
    fbp: s(body.fbp) ?? null,
    fbc: s(body.fbc) ?? null,
    ga_client_id: s(body.ga_client_id) ?? null,
    external_id: s(body.external_id) ?? null,
    utm_source: s(body.utm_source) ?? null,
    utm_medium: s(body.utm_medium) ?? null,
    utm_campaign: s(body.utm_campaign) ?? null,
    utm_content: s(body.utm_content) ?? null,
    utm_term: s(body.utm_term) ?? null,
    landing_page: s(body.landing_page) ?? null,
    referrer: ctx.referer,
    client_ip: ctx.ip,
    client_user_agent: ctx.userAgent,
    event_id: s(body.event_id) ?? undefined,
    value_cents: typeof body.valorMensal === 'number' ? Math.round(body.valorMensal * 100) : null,
  }

  let leadId: string
  const { data: insertedAttr, error: attrErr } = await supa
    .from('lead_attribution')
    .insert(attrPayload)
    .select('id, trk')
    .single()

  if (insertedAttr) {
    leadId = insertedAttr.id as string
  } else {
    // Fallback: tabela lead_attribution nao existe ainda. Grava direto em public.leads (CRM).
    // Mantem zero perda de leads ate a migration de unificacao ser aplicada.
    console.warn('[from-website] lead_attribution falhou, fallback pra public.leads:', attrErr?.code, attrErr?.message)

    const companyId = process.env.DEFAULT_COMPANY_ID || 'company-21go'
    const fallbackId = `lead_${trk}`

    const { error: leadErr } = await supa.from('leads').insert({
      id: fallbackId,
      company_id: companyId,
      nome,
      telefone,
      whatsapp: telefone,
      email: s(body.email) ?? null,
      placa_interesse: s(body.placa) ?? null,
      marca_interesse: s(body.marca) ?? null,
      modelo_interesse: s(body.modelo) ?? null,
      ano_interesse: n(body.ano) ?? null,
      cotacao_plano: s(body.plano) ?? null,
      cotacao_valor: typeof body.valorMensal === 'number' ? body.valorMensal : null,
      valor_fipe_consultado: typeof body.valorFipe === 'number' ? body.valorFipe : null,
      etapa_funil: 'novo',
      status: 'lead',
      qualificado_por: 'site',
      score_qualificacao: 0,
      origem,
      utm_source: s(body.utm_source) ?? null,
      utm_medium: s(body.utm_medium) ?? null,
      utm_campaign: s(body.utm_campaign) ?? null,
      utm_content: s(body.utm_content) ?? null,
      utm_term: s(body.utm_term) ?? null,
      gclid: s(body.gclid) ?? null,
      fbclid: s(body.fbclid) ?? null,
      fbp: s(body.fbp) ?? null,
      fbc: s(body.fbc) ?? null,
      ip_address: ctx.ip,
      user_agent: ctx.userAgent,
      cotacao_enviada: false,
      meta_capi_sent: false,
      google_ads_sent: false,
      follow_up_enviado: false,
      reengajamento_enviado: false,
      carro_app: body.carroApp === true,
      whatsapp_clicado: false,
      pdf_enviado: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (leadErr) {
      console.error('[from-website] fallback leads insert failed', leadErr)
      return NextResponse.json(
        { ok: false, error: 'database_error', detail: leadErr.message },
        { status: 500 },
      )
    }

    leadId = fallbackId
  }

  if (!process.env.POWERAPI_TOKEN) {
    return NextResponse.json({
      ok: true,
      trk,
      leadId,
      quotationCode: null,
      powercrm: 'skipped_no_token',
    })
  }

  const addInput = {
    name: nome,
    email: s(body.email),
    phone: telefone,
    registration: s(body.cpf),
    plts: s(body.placa),
    leadSource: pickLeadSource(body),
    origemId: pickLeadSource(body),
    pwrlnk: POWERCRM_DEFAULT_PWRLNK || undefined,
    coop: POWERCRM_DEFAULT_COOP,
    workVehicle: body.carroApp === true ? true : undefined,
    hash: trk,
  }

  const addResult = await quotationAdd(addInput, leadId)

  // Tentar atualizar lead_attribution (se existir) — silenciosamente ignora se nao existir
  await supa
    .from('lead_attribution')
    .update({
      quotation_code: addResult.quotationCode,
      powercrm_add_response: addResult.raw as object | null,
    })
    .eq('id', leadId)
    .then(({ error }) => {
      if (error) console.warn('[from-website] update lead_attribution skipped:', error.code)
    })

  if (addResult.ok && addResult.quotationCode) {
    const noteParts = [
      `trk=${trk}`,
      body.gclid && `gclid=${body.gclid}`,
      body.fbclid && `fbclid=${body.fbclid}`,
      body.utm_source && `utm_source=${body.utm_source}`,
      body.utm_medium && `utm_medium=${body.utm_medium}`,
      body.utm_campaign && `utm_campaign=${body.utm_campaign}`,
      body.utm_content && `utm_content=${body.utm_content}`,
      body.utm_term && `utm_term=${body.utm_term}`,
    ].filter(Boolean) as string[]

    const updateInput = {
      code: addResult.quotationCode,
      noteContract: noteParts.join('; '),
      plates: s(body.placa),
      fabricationYear: n(body.ano_fabricacao),
      carModelYear: n(body.ano),
    }

    const updateResult = await quotationUpdate(updateInput, leadId)
    await supa
      .from('lead_attribution')
      .update({ powercrm_update_response: updateResult.raw as object | null })
      .eq('id', leadId)
      .then(({ error }) => {
        if (error) console.warn('[from-website] update powercrm_response skipped:', error.code)
      })
  }

  return NextResponse.json({
    ok: addResult.ok,
    trk,
    leadId,
    quotationCode: addResult.quotationCode,
    powercrmStatus: addResult.statusCode,
    error: addResult.error ?? null,
  })
}
