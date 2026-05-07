CREATE TABLE "HistoricoEquipamentoRegistro" (
  "id" TEXT NOT NULL,
  "equipmentId" TEXT NOT NULL,
  "data" TIMESTAMP(3) NOT NULL,
  "historico" TEXT NOT NULL,
  "assinatura" TEXT NOT NULL,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "HistoricoEquipamentoRegistro_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "HistoricoEquipamentoRegistro_equipmentId_fkey"
    FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "HistoricoEquipamentoRegistro_equipmentId_idx"
  ON "HistoricoEquipamentoRegistro"("equipmentId");
