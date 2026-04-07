-- CreateTable
CREATE TABLE "ouvidoria" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "nome" TEXT,
    "telefone" TEXT,
    "assunto" TEXT,
    "mensagem" TEXT,
    "comentario" TEXT,
    "arquivos" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "resposta" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ouvidoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ouvidoria_tipo_idx" ON "ouvidoria"("tipo");
CREATE INDEX "ouvidoria_status_idx" ON "ouvidoria"("status");
CREATE INDEX "ouvidoria_created_at_idx" ON "ouvidoria"("created_at");
