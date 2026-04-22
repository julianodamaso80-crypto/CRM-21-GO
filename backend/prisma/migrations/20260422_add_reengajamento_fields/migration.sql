-- AlterTable: Reengajamento automatico (5 min apos o follow-up, se nao clicou nem respondeu)
ALTER TABLE "leads" ADD COLUMN "reengajamento_enviado" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "leads" ADD COLUMN "reengajamento_data" TIMESTAMP(3);
