import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

/* ─────────────────────────────────────────────────────────────────────────
 * Cloudflare R2 — API S3-compatível.
 * Variáveis de ambiente necessárias:
 *   R2_ACCOUNT_ID     — id da conta Cloudflare
 *   R2_ACCESS_KEY_ID  — access key do bucket
 *   R2_SECRET_KEY     — secret key do bucket
 *   R2_BUCKET         — nome do bucket (ex: 21go-quotes)
 *   R2_PUBLIC_BASE    — URL pública (ex: https://pub-xxxx.r2.dev ou CDN custom)
 * ───────────────────────────────────────────────────────────────────────── */

const accountId = process.env.R2_ACCOUNT_ID || ''
const accessKeyId = process.env.R2_ACCESS_KEY_ID || ''
const secretAccessKey = process.env.R2_SECRET_KEY || ''
const bucket = process.env.R2_BUCKET || '21go-quotes'
const publicBase = (process.env.R2_PUBLIC_BASE || '').replace(/\/$/, '')

let client: S3Client | null = null

function getClient(): S3Client {
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('R2 não configurado: defina R2_ACCOUNT_ID, R2_ACCESS_KEY_ID e R2_SECRET_KEY')
  }
  if (!client) {
    client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    })
  }
  return client
}

export function isR2Configured(): boolean {
  return Boolean(accountId && accessKeyId && secretAccessKey && publicBase)
}

export interface UploadResult {
  key: string
  url: string
}

export async function uploadPdf(
  key: string,
  body: Buffer,
  filename?: string,
): Promise<UploadResult> {
  const c = getClient()
  await c.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: 'application/pdf',
      ContentDisposition: filename ? `inline; filename="${filename}"` : 'inline',
      CacheControl: 'public, max-age=604800',
    }),
  )
  const url = `${publicBase}/${key}`
  return { key, url }
}
