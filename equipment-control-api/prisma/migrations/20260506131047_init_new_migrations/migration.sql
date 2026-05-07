-- CreateTable
CREATE TABLE "Equipment" (
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
    "listaPecas" BOOLEAN NOT NULL DEFAULT false,
    "sequenciaMontagem" BOOLEAN NOT NULL DEFAULT false,
    "inspecaoMontagem" BOOLEAN NOT NULL DEFAULT false,
    "historicoEquipamento" BOOLEAN NOT NULL DEFAULT false,
    "procedimentoTesteInspecaoMontagem" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "excluidoEm" DATETIME,
    CONSTRAINT "Equipment_tipoEquipamentoId_fkey" FOREIGN KEY ("tipoEquipamentoId") REFERENCES "TipoEquipamento" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HistoricoProducao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "equipmentId" TEXT NOT NULL,
    "campo" TEXT NOT NULL,
    "valorAnterior" TEXT,
    "valorNovo" TEXT,
    "alteradoPor" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HistoricoProducao_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ItemSeriado" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "equipmentId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ItemSeriado_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ObservacaoProducao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "producaoId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ObservacaoProducao_producaoId_fkey" FOREIGN KEY ("producaoId") REFERENCES "Equipment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "precisaTrocarSenha" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "TipoEquipamento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RegistroInspecaoMontagem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "equipmentId" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "valorObservado" TEXT,
    "instrumentoMedicao" TEXT,
    "conformidades" BOOLEAN,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "RegistroInspecaoMontagem_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Manutencao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "origem" TEXT NOT NULL DEFAULT 'SYNCHRO',
    "tipoEquipamentoNome" TEXT,
    "modeloEquipamento" TEXT,
    "numeroSerie" TEXT,
    "tag" TEXT,
    "situacaoEquipamento" TEXT,
    "dataRetornoBase" DATETIME,
    "dataInicio" DATETIME,
    "dataTermino" DATETIME,
    "statusManutencao" TEXT NOT NULL DEFAULT 'PENDENTE',
    "diagnostico" TEXT,
    "responsavelManutencao" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "excluidoEm" DATETIME
);

-- CreateTable
CREATE TABLE "HistoricoManutencao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "manutencaoId" TEXT NOT NULL,
    "campo" TEXT NOT NULL,
    "valorAnterior" TEXT,
    "valorNovo" TEXT,
    "alteradoPor" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HistoricoManutencao_manutencaoId_fkey" FOREIGN KEY ("manutencaoId") REFERENCES "Manutencao" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_numeroOrdem_key" ON "Equipment"("numeroOrdem");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_tag_key" ON "Equipment"("tag");

-- CreateIndex
CREATE INDEX "HistoricoProducao_equipmentId_idx" ON "HistoricoProducao"("equipmentId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TipoEquipamento_nome_key" ON "TipoEquipamento"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "RegistroInspecaoMontagem_equipmentId_ordem_key" ON "RegistroInspecaoMontagem"("equipmentId", "ordem");

-- CreateIndex
CREATE INDEX "Manutencao_numeroSerie_idx" ON "Manutencao"("numeroSerie");

-- CreateIndex
CREATE INDEX "Manutencao_tag_idx" ON "Manutencao"("tag");

-- CreateIndex
CREATE INDEX "HistoricoManutencao_manutencaoId_idx" ON "HistoricoManutencao"("manutencaoId");
