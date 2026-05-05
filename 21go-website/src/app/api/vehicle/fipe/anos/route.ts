import { NextRequest, NextResponse } from 'next/server'
import { listAnos, type VehicleKind } from '@/lib/fipe-lookup'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function normalizeKind(value: string | null): VehicleKind {
  return value === 'motos' ? 'motos' : 'carros'
}

export async function GET(req: NextRequest) {
  const tipo = req.nextUrl.searchParams.get('tipo')
  const marca = req.nextUrl.searchParams.get('marca')
  const modelo = req.nextUrl.searchParams.get('modelo')
  if (!marca || !modelo) {
    return NextResponse.json(
      { success: false, error: 'marca e modelo obrigatórios' },
      { status: 200 },
    )
  }
  try {
    const data = await listAnos(normalizeKind(tipo), marca, modelo)
    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Erro ao buscar anos' },
      { status: 200 },
    )
  }
}
