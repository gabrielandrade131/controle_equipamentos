-- AlterTable
ALTER TABLE "Equipment" ADD COLUMN     "loteProducaoId" TEXT;

-- CreateTable
CREATE TABLE "LoteProducao" (
    "id" TEXT NOT NULL,
    "numeroLote" SERIAL NOT NULL,
    "tipoEquipamentoId" TEXT,
    "modelo" TEXT,
    "descricao" TEXT,
    "solicitante" TEXT,
    "quantidade" TEXT,
    "dataSolicitacao" TIMESTAMP(3),
    "dataInicio" TIMESTAMP(3),
    "previsaoTermino" TIMESTAMP(3),
    "dataTermino" TIMESTAMP(3),
    "statusProducao" "StatusProducao" NOT NULL DEFAULT 'PROGRAMADA',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "excluidoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoteProducao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LoteProducao_numeroLote_key" ON "LoteProducao"("numeroLote");

-- CreateIndex
CREATE INDEX "LoteProducao_numeroLote_idx" ON "LoteProducao"("numeroLote");

-- CreateIndex
CREATE INDEX "LoteProducao_statusProducao_idx" ON "LoteProducao"("statusProducao");

-- CreateIndex
CREATE INDEX "LoteProducao_tipoEquipamentoId_idx" ON "LoteProducao"("tipoEquipamentoId");

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_loteProducaoId_fkey" FOREIGN KEY ("loteProducaoId") REFERENCES "LoteProducao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoteProducao" ADD CONSTRAINT "LoteProducao_tipoEquipamentoId_fkey" FOREIGN KEY ("tipoEquipamentoId") REFERENCES "TipoEquipamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;
