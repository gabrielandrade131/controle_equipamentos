-- CreateTable
CREATE TABLE "HistoricoManutencao" (
    "id" TEXT NOT NULL,
    "manutencaoId" TEXT NOT NULL,
    "campo" TEXT NOT NULL,
    "valorAnterior" TEXT,
    "valorNovo" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistoricoManutencao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HistoricoManutencao_manutencaoId_idx" ON "HistoricoManutencao"("manutencaoId");

-- AddForeignKey
ALTER TABLE "HistoricoManutencao" ADD CONSTRAINT "HistoricoManutencao_manutencaoId_fkey" FOREIGN KEY ("manutencaoId") REFERENCES "Manutencao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
