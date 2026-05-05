import { NextRequest, NextResponse } from 'next/server'
import { lookupFipePrice, type VehicleKind } from '@/lib/fipe-lookup'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function normalizeKind(value: string | null): VehicleKind {
  return value === 'motos' ? 'motos' : 'carros'
}

export async function GET(req: NextRequest) {
  const tipo = req.nextUrl.searchParams.get('tipo')
  const marca = req.nextUrl.searchParams.get('marca')
  const modelo = req.nextUrl.searchParams.get('modelo')
  const ano = req.nextUrl.searchParams.get('ano')
  if (!marca || !modelo || !ano) {
    return NextResponse.json(
      { success: false, error: 'marca, modelo e ano obrigatórios' },
      { status: 200 },
    )
  }
  const result = await lookupFipePrice(normalizeKind(tipo), marca, modelo, ano)
  return NextResponse.json(result)
}
