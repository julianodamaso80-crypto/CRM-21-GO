-- AlterTable: Origem do veiculo (leilao / remarcado / nao) - guardado pra
-- exibir no PDF, na mensagem do cliente e na notificacao interna ao corretor.
ALTER TABLE "leads" ADD COLUMN "leilao" TEXT;
