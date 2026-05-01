/* ─────────────────────────────────────────────────────────────────────────────
 * Rate Limiter para consulta de placas — protege saldo da API Brasil
 *
 * Regras:
 *  - Cada IP pode fazer no máximo N consultas de placas DIFERENTES por janela.
 *  - Consultas que batem no cache (mesma placa já consultada hoje) NÃO contam.
 *  - A janela reseta automaticamente (limpeza periódica do Map).
 *  - IPs que excedem o limite recebem erro 429 amigável.
 *
 * Proteção contra: vendedores concorrentes usando o site pra consultar
 * preços rapidamente sem serem clientes reais.
 * ───────────────────────────────────────────────────────────────────────────── */

/** Máximo de consultas de placas NOVAS (não-cache) por IP por janela */
const MAX_LOOKUPS_PER_IP = 3

/** Janela de rate limit em milissegundos (24 horas) */
const WINDOW_MS = 24 * 60 * 60 * 1000

interface IpRecord {
  /** Placas distintas consultadas (que gastaram crédito da API) */
  plates: Set<string>
  /** Timestamp da primeira consulta nesta janela */
  windowStart: number
}

const ipMap = new Map<string, IpRecord>()

/** Limpa registros expirados a cada 30 minutos pra não vazar memória */
setInterval(() => {
  const now = Date.now()
  for (const [ip, record] of ipMap) {
    if (now - record.windowStart > WINDOW_MS) {
      ipMap.delete(ip)
    }
  }
}, 30 * 60 * 1000)

/**
 * Verifica se o IP pode fazer mais consultas.
 * Retorna { allowed: true } se pode, { allowed: false, ... } se bloqueado.
 *
 * IMPORTANTE: chamar `recordLookup` SOMENTE quando a consulta realmente
 * for feita (ou seja, NÃO veio do cache).
 */
export function checkRateLimit(ip: string): {
  allowed: boolean
  remaining?: number
  retryAfterMs?: number
} {
  const now = Date.now()
  const record = ipMap.get(ip)

  // Sem registro = primeiro acesso — libera
  if (!record) {
    return { allowed: true, remaining: MAX_LOOKUPS_PER_IP }
  }

  // Janela expirou — reseta
  if (now - record.windowStart > WINDOW_MS) {
    ipMap.delete(ip)
    return { allowed: true, remaining: MAX_LOOKUPS_PER_IP }
  }

  const used = record.plates.size
  if (used >= MAX_LOOKUPS_PER_IP) {
    const retryAfterMs = WINDOW_MS - (now - record.windowStart)
    return { allowed: false, remaining: 0, retryAfterMs }
  }

  return { allowed: true, remaining: MAX_LOOKUPS_PER_IP - used }
}

/**
 * Registra uma consulta que GASTOU crédito da API (não cache).
 * Chamar DEPOIS de confirmar que a consulta não veio do cache.
 */
export function recordLookup(ip: string, placa: string): void {
  const now = Date.now()
  let record = ipMap.get(ip)

  if (!record || now - record.windowStart > WINDOW_MS) {
    record = { plates: new Set(), windowStart: now }
    ipMap.set(ip, record)
  }

  record.plates.add(placa.toUpperCase())
}

/**
 * Verifica se a placa já foi contabilizada para este IP
 * (evita contar a mesma placa 2x se o cliente recarregar a página).
 */
export function isPlateAlreadyCounted(ip: string, placa: string): boolean {
  const record = ipMap.get(ip)
  if (!record) return false
  if (Date.now() - record.windowStart > WINDOW_MS) return false
  return record.plates.has(placa.toUpperCase())
}
