import Bull from 'bull'
import { prisma } from '../../config/database'
import { getRedisConfig } from '../../config/env'
import { sendFollowUp } from './lead-followup.service'

/* ─────────────────────────────────────────────────────────────────────────
 * Fila de follow-up com delay de 5 minutos.
 * Ao criar um lead via /lead, agendamos um job "follow-up-quote".
 * Se o cliente clicar em "Contratar pelo WhatsApp" antes dos 5 min,
 * removemos o job (cancelando o follow-up automático) — o envio imediato
 * é feito direto pelo endpoint /whatsapp-click.
 * ───────────────────────────────────────────────────────────────────────── */

export interface QuoteJobData {
  leadId: string
}

const redisConfig = getRedisConfig()

export const quoteQueue = new Bull<QuoteJobData>('quote-followup', {
  redis: typeof redisConfig === 'string' ? redisConfig : redisConfig,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: 100,
    attempts: 2,
    backoff: { type: 'exponential', delay: 30_000 },
  },
})

/** Agenda follow-up para 5 minutos após a criação do lead. */
export async function scheduleFollowUp(leadId: string): Promise<void> {
  const jobId = `followup:${leadId}`
  // Remove job anterior se já existir (idempotente — ex: lead atualizado)
  const existing = await quoteQueue.getJob(jobId)
  if (existing) {
    await existing.remove().catch(() => {})
  }
  await quoteQueue.add(
    { leadId },
    {
      jobId,
      delay: 5 * 60 * 1000, // 5 minutos
    },
  )
}

/** Cancela o follow-up agendado (ex: cliente clicou em "Contratar WhatsApp"). */
export async function cancelFollowUp(leadId: string): Promise<boolean> {
  const jobId = `followup:${leadId}`
  const job = await quoteQueue.getJob(jobId)
  if (job) {
    await job.remove()
    return true
  }
  return false
}

/* ─── Worker — processa follow-up de 5 min ─── */
quoteQueue.process(async (job) => {
  const { leadId } = job.data

  const lead = await prisma.lead.findUnique({ where: { id: leadId } })
  if (!lead) {
    console.warn(`[QuoteQueue] Lead ${leadId} não encontrado`)
    return
  }

  // Se já clicou no WhatsApp ou já converteu, não envia follow-up
  if (lead.whatsappClicado || lead.etapaFunil === 'convertido' || lead.followUpEnviado) {
    console.log(`[QuoteQueue] Lead ${leadId} já engajado — skip`)
    return
  }

  const result = await sendFollowUp({ leadId, withPdf: true })
  if (!result.success) {
    console.warn(`[QuoteQueue] Falha no follow-up ${leadId}: ${result.error}`)
  } else {
    console.log(`[QuoteQueue] Follow-up enviado para ${leadId}`)
  }
})

quoteQueue.on('error', (err) => {
  console.error('[QuoteQueue] Error:', err.message)
})
