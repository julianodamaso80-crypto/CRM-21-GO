import axios from 'axios'
import { createHash } from 'crypto'

const META_PIXEL_ID = process.env.META_PIXEL_ID
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN
const META_API_VERSION = 'v19.0'

interface MetaCapiInput {
  eventName: string
  eventTime: number
  value: number
  currency: string
  email?: string | null
  phone?: string | null
  fbp?: string | null
  fbc?: string | null
  fbclid?: string | null
  sourceUrl?: string
  ip?: string | null
  userAgent?: string | null
}

function hashSHA256(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
}

export async function sendMetaCAPI(input: MetaCapiInput) {
  if (!META_PIXEL_ID || !META_ACCESS_TOKEN) {
    console.warn('[MetaCAPI] Missing PIXEL_ID or ACCESS_TOKEN, skipping')
    return { skipped: true, reason: 'Missing credentials' }
  }

  const userData: Record<string, unknown> = {}

  if (input.email) userData.em = [hashSHA256(input.email)]
  if (input.phone) userData.ph = [hashSHA256(input.phone.replace(/\D/g, ''))]
  if (input.fbp) userData.fbp = input.fbp
  if (input.fbc) userData.fbc = input.fbc
  if (input.ip) userData.client_ip_address = input.ip
  if (input.userAgent) userData.client_user_agent = input.userAgent

  const eventData = {
    event_name: input.eventName,
    event_time: input.eventTime,
    event_id: `purchase_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    action_source: 'website',
    event_source_url: input.sourceUrl || 'https://21go.site',
    user_data: userData,
    custom_data: {
      value: input.value,
      currency: input.currency,
      content_category: 'protecao_veicular',
    },
  }

  const url = `https://graph.facebook.com/${META_API_VERSION}/${META_PIXEL_ID}/events`

  console.log('[MetaCAPI] Sending Purchase event:', JSON.stringify({
    pixel: META_PIXEL_ID,
    event: input.eventName,
    value: input.value,
    hasEmail: !!input.email,
    hasPhone: !!input.phone,
    hasFbp: !!input.fbp,
    hasGclid: !!input.fbclid,
  }))

  const response = await axios.post(url, {
    data: [eventData],
    access_token: META_ACCESS_TOKEN,
  }, { timeout: 10000 })

  console.log('[MetaCAPI] Response:', response.status, JSON.stringify(response.data))
  return response.data
}
