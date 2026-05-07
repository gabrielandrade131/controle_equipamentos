-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Equipment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numeroOrdem" INTEGER NOT NULL,
    "numeroSerie" TEXT,
    "tag" TEXT,
    "dataSolicitacao" DATETIME,
    "solicitante" TEXT,
    "dataInicio" DATETIME,
    "dataTermino" DATETIME,
    "dataPrevisao" DATETIME,
    "statusProducao" TEXT NOT NULL DEFAULT 'PROGRAMADA',
    "tipoEquipamentoId" TEXT,
    "modelo" TEXT,
    "descricao" TEXT,
    "listaPecas" TEXT,
    "sequenciaMontagem" TEXT,
    "inspecaoMontagem" TEXT,
    "historicoEquipamento" TEXT,
    "procedimentoTesteInspecaoMontagem" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "excluidoEm" DATETIME,
    CONSTRAINT "Equipment_tipoEquipamentoId_fkey" FOREIGN KEY ("tipoEquipamentoId") REFERENCES "TipoEquipamento" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Equipment" ("ativo", "atualizadoEm", "criadoEm", "dataInicio", "dataPrevisao", "dataSolicitacao", "dataTermino", "descricao", "excluidoEm", "historicoEquipamento", "id", "inspecaoMontagem", "listaPecas", "modelo", "numeroOrdem", "numeroSerie", "procedimentoTesteInspecaoMontagem", "sequenciaMontagem", "solicitante", "statusProducao", "tag", "tipoEquipamentoId") SELECT "ativo", "atualizadoEm", "criadoEm", "dataInicio", "dataPrevisao", "dataSolicitacao", "dataTermino", "descricao", "excluidoEm", "historicoEquipamento", "id", "inspecaoMontagem", "listaPecas", "modelo", "numeroOrdem", "numeroSerie", "procedimentoTesteInspecaoMontagem", "sequenciaMontagem", "solicitante", "statusProducao", "tag", "tipoEquipamentoId" FROM "Equipment";
DROP TABLE "Equipment";
ALTER TABLE "new_Equipment" RENAME TO "Equipment";
CREATE UNIQUE INDEX "Equipment_numeroOrdem_key" ON "Equipment"("numeroOrdem");
CREATE UNIQUE INDEX "Equipment_tag_key" ON "Equipment"("tag");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
