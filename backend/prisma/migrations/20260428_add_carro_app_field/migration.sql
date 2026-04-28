-- AlterTable: Carro de aplicativo (Uber, 99, etc.) - +R$ 20/mes na mensalidade
ALTER TABLE "leads" ADD COLUMN "carro_app" BOOLEAN NOT NULL DEFAULT false;
