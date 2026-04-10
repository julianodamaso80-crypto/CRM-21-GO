-- AlterTable
ALTER TABLE "ouvidoria" ADD COLUMN "company_id" TEXT NOT NULL DEFAULT 'company-21go';

-- CreateIndex
CREATE INDEX "ouvidoria_company_id_idx" ON "ouvidoria"("company_id");

-- AddForeignKey
ALTER TABLE "ouvidoria" ADD CONSTRAINT "ouvidoria_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
