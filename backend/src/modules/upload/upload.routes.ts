import { FastifyInstance, FastifyRequest } from 'fastify'
import { authenticate } from '../../middlewares/authenticate'
import { randomUUID } from 'crypto'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function uploadRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', authenticate)

  // POST /upload - Upload single file
  fastify.post('/', async (request: FastifyRequest, reply) => {
    const data = await request.file()

    if (!data) {
      return reply.code(400).send({ error: 'No file uploaded' })
    }

    const user = (request as any).user
    const fileExt = data.filename.split('.').pop()
    const fileName = `${randomUUID()}.${fileExt}`
    const uploadDir = join(process.cwd(), 'uploads', user.companyId)

    // Ensure upload directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const filePath = join(uploadDir, fileName)
    const buffer = await data.toBuffer()
    await writeFile(filePath, buffer)

    const fileUrl = `/uploads/${user.companyId}/${fileName}`

    return reply.send({
      success: true,
      fileName: data.filename,
      storedName: fileName,
      url: fileUrl,
      size: buffer.length,
      mimeType: data.mimetype,
    })
  })

  // POST /upload/multiple - Upload multiple files
  fastify.post('/multiple', async (request: FastifyRequest, reply) => {
    const files = request.files()
    const user = (request as any).user
    const uploadDir = join(process.cwd(), 'uploads', user.companyId)

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const results = []

    for await (const file of files) {
      const fileExt = file.filename.split('.').pop()
      const fileName = `${randomUUID()}.${fileExt}`
      const filePath = join(uploadDir, fileName)
      const buffer = await file.toBuffer()
      await writeFile(filePath, buffer)

      results.push({
        originalName: file.filename,
        storedName: fileName,
        url: `/uploads/${user.companyId}/${fileName}`,
        size: buffer.length,
        mimeType: file.mimetype,
      })
    }

    return reply.send({ success: true, files: results })
  })
}
