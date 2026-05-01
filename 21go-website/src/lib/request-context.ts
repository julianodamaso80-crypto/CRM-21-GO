import 'server-only'
import type { NextRequest } from 'next/server'

export interface RequestContext {
  ip: string | null
  userAgent: string | null
  referer: string | null
  host: string | null
}

export function getRequestContext(req: NextRequest): RequestContext {
  const headers = req.headers
  const xff = headers.get('x-forwarded-for')
  const ip =
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    headers.get('true-client-ip') ||
    (xff ? xff.split(',')[0].trim() : null)

  return {
    ip: ip || null,
    userAgent: headers.get('user-agent'),
    referer: headers.get('referer') || headers.get('referrer'),
    host: headers.get('host'),
  }
}
