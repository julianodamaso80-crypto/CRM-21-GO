-- AlterTable: Seguro atual do veiculo. Quando preenchido, indica que o cliente
-- ja possui seguro vigente com a seguradora informada (texto livre). Null = nao tem.
ALTER TABLE "leads" ADD COLUMN "seguro_atual" TEXT;
