import { NextRequest, NextResponse } from 'next/server'
import { listModelos, type VehicleKind } from '@/lib/fipe-lookup'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function normalizeKind(value: string | null): VehicleKind {
  return value === 'motos' ? 'motos' : 'carros'
}

export async function GET(req: NextRequest) {
  const tipo = req.nextUrl.searchParams.get('tipo')
  const marca = req.nextUrl.searchParams.get('marca')
  if (!marca) {
    return NextResponse.json({ success: false, error: 'marca obrigatória' }, { status: 200 })
  }
  try {
    const data = await listModelos(normalizeKind(tipo), marca)
    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Erro ao buscar modelos' },
      { status: 200 },
    )
  }
}
