-- AlterTable
ALTER TABLE "messages" ADD COLUMN "message_type" TEXT NOT NULL DEFAULT 'text';
ALTER TABLE "messages" ADD COLUMN "media_base64" TEXT;
ALTER TABLE "messages" ADD COLUMN "media_mime_type" TEXT;
ALTER TABLE "messages" ADD COLUMN "media_url" TEXT;
ALTER TABLE "messages" ADD COLUMN "direction" TEXT NOT NULL DEFAULT 'inbound';
ALTER TABLE "messages" ADD COLUMN "whatsapp_message_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "messages_whatsapp_message_id_key" ON "messages"("whatsapp_message_id");
CREATE INDEX "messages_whatsapp_message_id_idx" ON "messages"("whatsapp_message_id");
