import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { mapWebhookStatus } from '@/lib/powercrm'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface PowerCRMWebhookPayload {
  negotiationCode?: string
  quotationCode?: string
  status?: string
  hash?: string
}

const WEBHOOK_SLUG = process.env.POWERCRM_WEBHOOK_SLUG

export async function POST(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params

  if (!WEBHOOK_SLUG || slug !== WEBHOOK_SLUG) {
    return new NextResponse('Not Found', { status: 404 })
  }

  let payload: PowerCRMWebhookPayload
  let rawText = ''
  try {
    rawText = await req.text()
    payload = rawText ? (JSON.parse(rawText) as PowerCRMWebhookPayload) : {}
  } catch {
    return NextResponse.json({ ok: true, ignored: 'invalid_json' })
  }

  const headersObj: Record<string, string> = {}
  req.headers.forEach((v, k) => {
    if (k.toLowerCase() === 'authorization' || k.toLowerCase() === 'cookie') return
    headersObj[k] = v
  })

  const supa = supabaseAdmin()

  const { data: logRow, error: logErr } = await supa
    .from('webhook_inbound_log')
    .insert({
      source: 'powercrm',
      path: req.nextUrl.pathname,
      headers: headersObj,
      payload: payload as object,
      status: 'received',
    })
    .select('id')
    .single()

  if (logErr) {
    if (logErr.code === '23505') {
      return NextResponse.json({ ok: true, duplicate: true })
    }
    console.error('[powercrm webhook] log insert failed', logErr)
    return NextResponse.json({ ok: true, log: 'failed' })
  }

  const logId = logRow!.id as string

  process.nextTick(() => {
    void processWebhook(logId, payload).catch((err) => {
      console.error('[powercrm webhook] async processing failed', err)
      void supa
        .from('webhook_inbound_log')
        .update({
          status: 'failed',
          processed_at: new Date().toISOString(),
          error: err instanceof Error ? err.message : String(err),
        })
        .eq('id', logId)
    })
  })

  return NextResponse.json({ ok: true })
}

async function processWebhook(logId: string, payload: PowerCRMWebhookPayload): Promise<void> {
  const supa = supabaseAdmin()
  const { negotiationCode, quotationCode, status, hash } = payload

  let leadId: string | null = null

  if (hash) {
    const { data } = await supa
      .from('lead_attribution')
      .select('id')
      .eq('trk', hash)
      .maybeSingle()
    if (data) leadId = data.id as string
  }

  if (!leadId && quotationCode) {
    const { data } = await supa
      .from('lead_attribution')
      .select('id')
      .eq('quotation_code', quotationCode)
      .maybeSingle()
    if (data) leadId = data.id as string
  }

  if (!leadId && negotiationCode) {
    const { data } = await supa
      .from('lead_attribution')
      .select('id')
      .eq('negotiation_code', negotiationCode)
      .maybeSingle()
    if (data) leadId = data.id as string
  }

  const mappedStatus = status ? mapWebhookStatus(status) : null

  if (leadId) {
    const updates: Record<string, unknown> = {}
    if (negotiationCode) updates.negotiation_code = negotiationCode
    if (quotationCode) updates.quotation_code = quotationCode
    if (mappedStatus) updates.status = mappedStatus
    if (mappedStatus === 'COMPLETED') updates.completed_at = new Date().toISOString()
    if (Object.keys(updates).length > 0) {
      await supa.from('lead_attribution').update(updates).eq('id', leadId)
    }
  }

  await supa
    .from('webhook_inbound_log')
    .update({
      status: leadId ? 'processed' : 'ignored',
      processed_at: new Date().toISOString(),
      lead_attribution_id: leadId,
      error: leadId ? null : 'lead_attribution_not_found',
    })
    .eq('id', logId)

  // TODO(conversões): quando mappedStatus === 'COMPLETED' e leadId existir:
  //   1. Buscar valor da venda via getNegotiation(negotiationCode, leadId)
  //   2. Disparar Google Ads Enhanced Conversions (gclid + email/phone hashed)
  //   3. Disparar Meta CAPI (event Purchase com fbp/fbc/event_id)
  //   4. Disparar GA4 MP (purchase com client_id)
  //   5. Marcar gads_sent_at / meta_capi_sent_at / ga4_mp_sent_at na lead_attribution
}

export async function GET() {
  return new NextResponse('Not Found', { status: 404 })
}
