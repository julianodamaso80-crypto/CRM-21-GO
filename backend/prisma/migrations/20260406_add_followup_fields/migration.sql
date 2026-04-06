-- AlterTable
ALTER TABLE "leads" ADD COLUMN "follow_up_enviado" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "leads" ADD COLUMN "follow_up_data" TIMESTAMP(3);
