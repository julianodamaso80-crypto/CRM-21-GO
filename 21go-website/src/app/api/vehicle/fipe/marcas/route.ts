import { NextRequest, NextResponse } from 'next/server'
import { listMarcas, type VehicleKind } from '@/lib/fipe-lookup'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function normalizeKind(value: string | null): VehicleKind {
  return value === 'motos' ? 'motos' : 'carros'
}

export async function GET(req: NextRequest) {
  const tipo = req.nextUrl.searchParams.get('tipo')
  try {
    const data = await listMarcas(normalizeKind(tipo))
    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Erro ao buscar marcas' },
      { status: 200 },
    )
  }
}
