-- CreateEnum
CREATE TYPE "StatusRecebimentoOperacional" AS ENUM ('CONCLUIDO', 'PENDENTE_SYNCHRO', 'SINCRONIZADO_SYNCHRO', 'ERRO_SYNCHRO');

-- AlterTable
ALTER TABLE "RecebimentoOperacional" ADD COLUMN     "dataSincronizacaoSynchro" TIMESTAMP(3),
ADD COLUMN     "erroSincronizacaoSynchro" TEXT,
ADD COLUMN     "sincronizadoSynchro" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "statusRecebimento" "StatusRecebimentoOperacional" NOT NULL DEFAULT 'CONCLUIDO';

-- CreateIndex
CREATE INDEX "RecebimentoOperacional_statusRecebimento_idx" ON "RecebimentoOperacional"("statusRecebimento");

-- CreateIndex
CREATE INDEX "RecebimentoOperacional_sincronizadoSynchro_idx" ON "RecebimentoOperacional"("sincronizadoSynchro");
