/* ─────────────────────────────────────────────────────────────────────────────
 * Rate Limiter para consulta de placas — protege saldo da API Brasil
 *
 * DUPLA PROTEÇÃO: limita por IP E por WhatsApp.
 *
 * Regras:
 *  - Cada WhatsApp pode consultar no máximo 2 placas DIFERENTES a cada 7 dias.
 *  - Cada IP pode consultar no máximo 3 placas DIFERENTES a cada 7 dias.
 *  - O limite mais restritivo prevalece (basta UM estourar pra bloquear).
 *  - Consultas que batem no cache (mesma placa já consultada hoje) NÃO contam.
 *  - A janela reseta automaticamente (limpeza periódica do Map).
 *
 * Proteção contra: vendedores concorrentes usando o site pra consultar
 * preços rapidamente sem serem clientes reais.
 * ───────────────────────────────────────────────────────────────────────────── */

/** Máximo de placas NOVAS por WhatsApp por janela */
const MAX_PER_WHATSAPP = 2

/** Máximo de placas NOVAS por IP por janela (fallback se WhatsApp não for fornecido) */
const MAX_PER_IP = 3

/** Janela em milissegundos (7 dias) */
const WINDOW_MS = 7 * 24 * 60 * 60 * 1000

/** Números de WhatsApp que NÃO tem limite de consultas (admin/testes) */
const WHITELISTED_WHATSAPPS = [
  '21992208062', // Número do Juliano
  '21979034169', // Número 2
  '21965774240', // Número 3
]

/** IPs que NÃO tem limite de consultas (admin/testes) */
const WHITELISTED_IPS = [
  '127.0.0.1',
  '::1',
  '186.205.14.135', // IP do notebook do Juliano
]

interface LookupRecord {
  /** Placas distintas consultadas (que gastaram crédito da API) */
  plates: Set<string>
  /** Timestamp da primeira consulta nesta janela */
  windowStart: number
}

/** Mapa por WhatsApp (chave = digits do telefone) */
const whatsappMap = new Map<string, LookupRecord>()

/** Mapa por IP (proteção adicional) */
const ipMap = new Map<string, LookupRecord>()

/** Limpa registros expirados a cada 30 minutos pra não vazar memória */
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of whatsappMap) {
    if (now - record.windowStart > WINDOW_MS) whatsappMap.delete(key)
  }
  for (const [key, record] of ipMap) {
    if (now - record.windowStart > WINDOW_MS) ipMap.delete(key)
  }
}, 30 * 60 * 1000)

/** Extrai apenas dígitos do WhatsApp */
function normalizeWhatsApp(wpp: string): string {
  return wpp.replace(/\D/g, '')
}

function getRecord(map: Map<string, LookupRecord>, key: string): LookupRecord | null {
  const record = map.get(key)
  if (!record) return null
  if (Date.now() - record.windowStart > WINDOW_MS) {
    map.delete(key)
    return null
  }
  return record
}

/**
 * Verifica se a consulta pode ser feita.
 * Retorna { allowed: true } se pode, { allowed: false, ... } se bloqueado.
 */
export function checkRateLimit(
  ip: string,
  whatsapp?: string,
): {
  allowed: boolean
  remaining?: number
  retryAfterMs?: number
  blockedBy?: 'whatsapp' | 'ip'
} {
  // 0.1) Verifica se o IP é VIP (Whitelist)
  if (WHITELISTED_IPS.includes(ip)) {
    return { allowed: true, remaining: 9999 }
  }

  // 0.2) Verifica se é um número VIP (Whitelist)
  if (whatsapp) {
    const wppKey = normalizeWhatsApp(whatsapp)
    if (WHITELISTED_WHATSAPPS.includes(wppKey) || process.env.ADMIN_WHATSAPP === wppKey) {
      return { allowed: true, remaining: 9999 }
    }
  }

  // 1) Verifica por WhatsApp (mais forte)
  if (whatsapp) {
    const wppKey = normalizeWhatsApp(whatsapp)
    if (wppKey.length >= 10) {
      const record = getRecord(whatsappMap, wppKey)
      if (record && record.plates.size >= MAX_PER_WHATSAPP) {
        const retryAfterMs = WINDOW_MS - (Date.now() - record.windowStart)
        return { allowed: false, remaining: 0, retryAfterMs, blockedBy: 'whatsapp' }
      }
    }
  }

  // 2) Verifica por IP
  const ipRecord = getRecord(ipMap, ip)
  if (ipRecord && ipRecord.plates.size >= MAX_PER_IP) {
    const retryAfterMs = WINDOW_MS - (Date.now() - ipRecord.windowStart)
    return { allowed: false, remaining: 0, retryAfterMs, blockedBy: 'ip' }
  }

  // Calcula remaining (o menor dos dois)
  const wppUsed = whatsapp ? (getRecord(whatsappMap, normalizeWhatsApp(whatsapp))?.plates.size || 0) : 0
  const ipUsed = ipRecord?.plates.size || 0
  const wppRemaining = MAX_PER_WHATSAPP - wppUsed
  const ipRemaining = MAX_PER_IP - ipUsed
  const remaining = whatsapp ? Math.min(wppRemaining, ipRemaining) : ipRemaining

  return { allowed: true, remaining }
}

/**
 * Registra uma consulta que GASTOU crédito da API (não cache).
 */
export function recordLookup(ip: string, placa: string, whatsapp?: string): void {
  const now = Date.now()
  const normalPlaca = placa.toUpperCase()

  // Se for IP VIP, não registra limite
  if (WHITELISTED_IPS.includes(ip)) {
    return
  }

  // Se for número VIP, não registra limite no IP nem no WhatsApp (burlar limite)
  if (whatsapp) {
    const wppKey = normalizeWhatsApp(whatsapp)
    if (WHITELISTED_WHATSAPPS.includes(wppKey) || process.env.ADMIN_WHATSAPP === wppKey) {
      return // Não contabiliza, deixa livre!
    }
  }

  // Registra no IP
  let ipRec = getRecord(ipMap, ip)
  if (!ipRec) {
    ipRec = { plates: new Set(), windowStart: now }
    ipMap.set(ip, ipRec)
  }
  ipRec.plates.add(normalPlaca)

  // Registra no WhatsApp
  if (whatsapp) {
    const wppKey = normalizeWhatsApp(whatsapp)
    if (wppKey.length >= 10) {
      let wppRec = getRecord(whatsappMap, wppKey)
      if (!wppRec) {
        wppRec = { plates: new Set(), windowStart: now }
        whatsappMap.set(wppKey, wppRec)
      }
      wppRec.plates.add(normalPlaca)
    }
  }
}

/**
 * Verifica se a placa já foi contabilizada para este IP/WhatsApp
 * (evita contar a mesma placa 2x se o cliente recarregar a página).
 */
export function isPlateAlreadyCounted(ip: string, placa: string, whatsapp?: string): boolean {
  const normalPlaca = placa.toUpperCase()

  // Se já contou pro IP, não conta de novo
  const ipRec = getRecord(ipMap, ip)
  if (ipRec?.plates.has(normalPlaca)) return true

  // Se já contou pro WhatsApp, não conta de novo
  if (whatsapp) {
    const wppKey = normalizeWhatsApp(whatsapp)
    const wppRec = getRecord(whatsappMap, wppKey)
    if (wppRec?.plates.has(normalPlaca)) return true
  }

  return false
}
