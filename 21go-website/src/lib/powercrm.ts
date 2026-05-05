import 'server-only'
import { supabaseAdmin } from './supabase-admin'

const POWERCRM_BASE_URL = process.env.POWERCRM_BASE_URL || 'https://api.powercrm.com.br'
const POWERAPI_TOKEN = process.env.POWERAPI_TOKEN

function authHeaders(): Record<string, string> {
  if (!POWERAPI_TOKEN) {
    throw new Error('POWERAPI_TOKEN não configurado no .env')
  }
  return {
    accept: 'application/json',
    'content-type': 'application/json',
    Authorization: `Bearer ${POWERAPI_TOKEN}`,
  }
}

interface OutboundLogInput {
  leadAttributionId: string | null
  kind: 'powerapi_add' | 'powerapi_update' | 'powerapi_get_negotiation' | 'gads_capi' | 'meta_capi' | 'ga4_mp'
  request: unknown
  response: unknown
  statusCode: number
  latencyMs: number
  error?: string
}

async function logOutbound(input: OutboundLogInput): Promise<void> {
  try {
    await supabaseAdmin().from('outbound_event_log').insert({
      lead_id: input.leadAttributionId,
      kind: input.kind,
      request_payload: input.request,
      response_payload: input.response,
      status_code: input.statusCode,
      latency_ms: input.latencyMs,
      error: input.error ?? null,
    })
  } catch (err) {
    console.error('[powercrm] falha ao gravar outbound_event_log', err)
  }
}

export interface QuotationAddInput {
  name: string
  email?: string
  phone?: string
  registration?: string
  plts?: string
  chassi?: string
  mdl?: number
  mdlYr?: number
  city?: number
  coop?: number
  discount?: string
  affiliateId?: string
  leadSource?: number
  origemId?: number
  slsmnId?: string
  slsmnNwId?: string
  pwrlnk?: string
  workVehicle?: boolean
  hash?: string
}

export interface QuotationAddResult {
  ok: boolean
  statusCode: number
  quotationCode: string | null
  raw: unknown
  error?: string
}

export async function quotationAdd(
  input: QuotationAddInput,
  leadAttributionId: string,
): Promise<QuotationAddResult> {
  const started = Date.now()
  let statusCode = 0
  let raw: unknown = null
  let error: string | undefined

  try {
    const res = await fetch(`${POWERCRM_BASE_URL}/api/quotation/add`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(input),
    })
    statusCode = res.status
    raw = await res.json().catch(() => null)
    const ok = res.status >= 200 && res.status < 300
    const quotationCode = extractQuotationCode(raw)

    await logOutbound({
      leadAttributionId,
      kind: 'powerapi_add',
      request: input,
      response: raw,
      statusCode,
      latencyMs: Date.now() - started,
      error: ok ? undefined : `status ${statusCode}`,
    })

    return { ok, statusCode, quotationCode, raw, error: ok ? undefined : `status ${statusCode}` }
  } catch (err) {
    error = err instanceof Error ? err.message : String(err)
    await logOutbound({
      leadAttributionId,
      kind: 'powerapi_add',
      request: input,
      response: null,
      statusCode,
      latencyMs: Date.now() - started,
      error,
    })
    return { ok: false, statusCode, quotationCode: null, raw: null, error }
  }
}

function extractQuotationCode(raw: unknown): string | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const candidates = [r.quotationCode, r.code, r.id, r.codigo]
  for (const c of candidates) {
    if (typeof c === 'string' && c.length > 0) return c
    if (typeof c === 'number') return String(c)
  }
  return null
}

export interface QuotationUpdateInput {
  code: string
  email?: string
  phone?: string
  fullName?: string
  birthdate?: string
  rg?: string
  registration?: string
  noteContract?: string
  plates?: string
  chassi?: string
  fabricationYear?: number
  carModelYear?: number
  carModel?: number
  fuel?: number
  shift?: number
  protectedValue?: number
  tppId?: number
  city?: number
  addressZipcode?: string
  addressAddress?: string
  addressNumber?: string
  addressComplement?: string
  addressNeighborhood?: string
  expirationDay?: number
  workVehicle?: boolean
}

export async function quotationUpdate(
  input: QuotationUpdateInput,
  leadAttributionId: string,
): Promise<{ ok: boolean; statusCode: number; raw: unknown; error?: string }> {
  const started = Date.now()
  let statusCode = 0
  let raw: unknown = null

  try {
    const res = await fetch(`${POWERCRM_BASE_URL}/api/quotation/update`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(input),
    })
    statusCode = res.status
    raw = await res.json().catch(() => null)
    const ok = res.status >= 200 && res.status < 300

    await logOutbound({
      leadAttributionId,
      kind: 'powerapi_update',
      request: input,
      response: raw,
      statusCode,
      latencyMs: Date.now() - started,
      error: ok ? undefined : `status ${statusCode}`,
    })

    return { ok, statusCode, raw, error: ok ? undefined : `status ${statusCode}` }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    await logOutbound({
      leadAttributionId,
      kind: 'powerapi_update',
      request: input,
      response: null,
      statusCode,
      latencyMs: Date.now() - started,
      error,
    })
    return { ok: false, statusCode, raw: null, error }
  }
}

export async function getNegotiation(
  negotiationCode: string,
  leadAttributionId: string | null,
): Promise<{ ok: boolean; statusCode: number; raw: unknown; error?: string }> {
  const started = Date.now()
  let statusCode = 0
  let raw: unknown = null

  try {
    const res = await fetch(`${POWERCRM_BASE_URL}/api/negotiation/${encodeURIComponent(negotiationCode)}`, {
      method: 'GET',
      headers: authHeaders(),
    })
    statusCode = res.status
    raw = await res.json().catch(() => null)
    const ok = res.status >= 200 && res.status < 300

    await logOutbound({
      leadAttributionId,
      kind: 'powerapi_get_negotiation',
      request: { negotiationCode },
      response: raw,
      statusCode,
      latencyMs: Date.now() - started,
      error: ok ? undefined : `status ${statusCode}`,
    })

    return { ok, statusCode, raw, error: ok ? undefined : `status ${statusCode}` }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    await logOutbound({
      leadAttributionId,
      kind: 'powerapi_get_negotiation',
      request: { negotiationCode },
      response: null,
      statusCode,
      latencyMs: Date.now() - started,
      error,
    })
    return { ok: false, statusCode, raw: null, error }
  }
}

const POWERCRM_STATUS_MAP: Record<string, 'RECEIVED' | 'IN_NEGOTIATION' | 'INSPECTION' | 'RELEASED_FOR_REGISTRATION' | 'COMPLETED'> = {
  'cotacao recebida': 'RECEIVED',
  'cotação recebida': 'RECEIVED',
  'em negociacao': 'IN_NEGOTIATION',
  'em negociação': 'IN_NEGOTIATION',
  vistoria: 'INSPECTION',
  'liberada para cadastro': 'RELEASED_FOR_REGISTRATION',
  'venda concretizada': 'COMPLETED',
}

export function mapWebhookStatus(status: string): 'RECEIVED' | 'IN_NEGOTIATION' | 'INSPECTION' | 'RELEASED_FOR_REGISTRATION' | 'COMPLETED' | null {
  if (!status) return null
  return POWERCRM_STATUS_MAP[status.trim().toLowerCase()] ?? null
}
