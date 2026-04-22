-- AlterTable: PDF de cotação + tracking de clique em "Contratar pelo WhatsApp"
ALTER TABLE "leads" ADD COLUMN "pdf_url" TEXT;
ALTER TABLE "leads" ADD COLUMN "pdf_gerado_em" TIMESTAMP(3);
ALTER TABLE "leads" ADD COLUMN "whatsapp_clicado" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "leads" ADD COLUMN "whatsapp_clicado_em" TIMESTAMP(3);
ALTER TABLE "leads" ADD COLUMN "pdf_enviado" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "leads" ADD COLUMN "pdf_enviado_em" TIMESTAMP(3);
