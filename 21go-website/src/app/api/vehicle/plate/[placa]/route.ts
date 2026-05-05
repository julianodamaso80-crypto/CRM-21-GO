import { NextRequest, NextResponse } from 'next/server'
import { lookupPlate } from '@/lib/plate-lookup'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ placa: string }> },
) {
  const { placa } = await params
  const result = await lookupPlate(placa)
  return NextResponse.json(result, { status: result.success ? 200 : 200 })
}
