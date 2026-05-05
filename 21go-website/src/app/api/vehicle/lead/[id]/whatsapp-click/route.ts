import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Endpoint informativo: o cliente clicou em "Contratar pelo WhatsApp" no site.
 *
 * No fluxo atual (sem fila Bull/Redis), o PDF já é enviado IMEDIATAMENTE no
 * /api/vehicle/lead — não há follow-up agendado de 5min. Então aqui só
 * registramos o clique e respondemos OK pra não quebrar o front.
 *
 * Caso futuramente a gente adicione fila com delay, é aqui que ela é cancelada.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  console.log('[whatsapp-click] lead', id, 'clicou no botão WhatsApp')
  return NextResponse.json({ success: true, leadId: id, cancelled: false })
}
