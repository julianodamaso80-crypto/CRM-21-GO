import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

let _client: SupabaseClient | null = null

export function supabaseAdmin(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'Supabase não configurado: defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env',
    )
  }
  if (!_client) {
    _client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { 'x-app': '21go-website' } },
    })
  }
  return _client
}

export type LeadStatus =
  | 'RECEIVED'
  | 'IN_NEGOTIATION'
  | 'INSPECTION'
  | 'RELEASED_FOR_REGISTRATION'
  | 'COMPLETED'

export interface LeadAttributionRow {
  id: string
  trk: string
  quotation_code: string | null
  negotiation_code: string | null
  status: LeadStatus
  nome: string | null
  email: string | null
  telefone: string | null
  cpf: string | null
  placa: string | null
  fipe_codigo: string | null
  marca: string | null
  modelo: string | null
  ano_modelo: number | null
  ano_fabricacao: number | null
  plano_interesse: string | null
  cidade: string | null
  estado: string | null
  gclid: string | null
  gbraid: string | null
  wbraid: string | null
  fbclid: string | null
  fbp: string | null
  fbc: string | null
  ga_client_id: string | null
  external_id: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  utm_term: string | null
  landing_page: string | null
  referrer: string | null
  client_ip: string | null
  client_user_agent: string | null
  event_id: string
  event_time: string
  value_cents: number | null
  currency: string | null
  powercrm_add_response: unknown
  powercrm_update_response: unknown
  gads_sent_at: string | null
  meta_capi_sent_at: string | null
  ga4_mp_sent_at: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
}
