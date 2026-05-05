import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

/**
 * Storage S3-compatível pra hospedar PDFs gerados.
 * Funciona com MinIO local (Easypanel) ou Cloudflare R2 — o cliente é o mesmo,
 * só muda o endpoint.
 *
 * Variáveis de ambiente:
 *   MINIO_ENDPOINT       — URL do MinIO (ex: http://minio-social:9000)
 *   MINIO_ACCESS_KEY     — access key
 *   MINIO_SECRET_KEY     — secret key
 *   MINIO_BUCKET         — nome do bucket (default: 21go-quotes)
 *   MINIO_PUBLIC_BASE    — URL pública pra montar o link do PDF
 *
 * Alternativa Cloudflare R2 (substitui MINIO_* por R2_*):
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_KEY, R2_BUCKET, R2_PUBLIC_BASE
 */

const endpoint = process.env.MINIO_ENDPOINT || ''
const accessKeyId = process.env.MINIO_ACCESS_KEY || process.env.R2_ACCESS_KEY_ID || ''
const secretAccessKey = process.env.MINIO_SECRET_KEY || process.env.R2_SECRET_KEY || ''
const bucket = process.env.MINIO_BUCKET || process.env.R2_BUCKET || '21go-quotes'
const publicBase = (process.env.MINIO_PUBLIC_BASE || process.env.R2_PUBLIC_BASE || '').replace(
  /\/$/,
  '',
)

const r2AccountId = process.env.R2_ACCOUNT_ID || ''

let client: S3Client | null = null

function getClient(): S3Client {
  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      'Storage não configurado: defina MINIO_ACCESS_KEY/SECRET ou R2_ACCESS_KEY_ID/SECRET',
    )
  }
  if (!client) {
    const finalEndpoint = endpoint || (r2AccountId ? `https://${r2AccountId}.r2.cloudflarestorage.com` : '')
    if (!finalEndpoint) {
      throw new Error('Storage sem endpoint: defina MINIO_ENDPOINT ou R2_ACCOUNT_ID')
    }
    client = new S3Client({
      region: 'us-east-1',
      endpoint: finalEndpoint,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true, // MinIO precisa, R2 também aceita
    })
  }
  return client
}

export function isStorageConfigured(): boolean {
  return Boolean(accessKeyId && secretAccessKey && (endpoint || r2AccountId) && publicBase)
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
  const url = `${publicBase}/${bucket}/${key}`
  return { key, url }
}
