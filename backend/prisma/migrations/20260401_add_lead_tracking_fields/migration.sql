-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "data_conversao" TIMESTAMP(3),
ADD COLUMN     "fbc" TEXT,
ADD COLUMN     "fbclid" TEXT,
ADD COLUMN     "fbp" TEXT,
ADD COLUMN     "gclid" TEXT,
ADD COLUMN     "google_ads_sent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "google_ads_sent_at" TIMESTAMP(3),
ADD COLUMN     "ip_address" TEXT,
ADD COLUMN     "meta_capi_sent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "meta_capi_sent_at" TIMESTAMP(3),
ADD COLUMN     "produto_comprado" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'lead',
ADD COLUMN     "user_agent" TEXT,
ADD COLUMN     "valor_compra" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "plate_lookups" (
    "id" TEXT NOT NULL,
    "placa" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "from_cache" BOOLEAN NOT NULL DEFAULT false,
    "marca" TEXT,
    "modelo" TEXT,
    "ano" TEXT,
    "fipe_value" DOUBLE PRECISION,
    "result" JSONB NOT NULL DEFAULT '{}',
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plate_lookups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "plate_lookups_placa_created_at_idx" ON "plate_lookups"("placa", "created_at");

-- CreateIndex
CREATE INDEX "plate_lookups_created_at_idx" ON "plate_lookups"("created_at");
