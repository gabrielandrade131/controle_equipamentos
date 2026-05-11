CREATE TABLE "Equipment" (
  "id" TEXT NOT NULL,
  "numeroOrdem" INTEGER NOT NULL,
  "numeroSerie" TEXT,
  "tag" TEXT,
  "dataSolicitacao" TIMESTAMP(3),
  "solicitante" TEXT,
  "dataInicio" TIMESTAMP(3),
  "dataTermino" TIMESTAMP(3),
  "dataPrevisao" TIMESTAMP(3),
  "statusProducao" TEXT NOT NULL DEFAULT 'PROGRAMADA',
  "tipoEquipamentoId" TEXT,
  "modelo" TEXT,
  "descricao" TEXT,
  "listaPecas" BOOLEAN NOT NULL DEFAULT false,
  "sequenciaMontagem" BOOLEAN NOT NULL DEFAULT false,
  "inspecaoMontagem" BOOLEAN NOT NULL DEFAULT false,
  "historicoEquipamento" BOOLEAN NOT NULL DEFAULT false,
  "procedimentoTesteInspecaoMontagem" BOOLEAN NOT NULL DEFAULT false,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "excluidoEm" TIMESTAMP(3),
  CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HistoricoProducao" (
  "id" TEXT NOT NULL,
  "equipmentId" TEXT NOT NULL,
  "campo" TEXT NOT NULL,
  "valorAnterior" TEXT,
  "valorNovo" TEXT,
  "alteradoPor" TEXT,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HistoricoProducao_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ItemSeriado" (
  "id" TEXT NOT NULL,
  "equipmentId" TEXT NOT NULL,
  "descricao" TEXT NOT NULL,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ItemSeriado_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ObservacaoProducao" (
  "id" TEXT NOT NULL,
  "producaoId" TEXT NOT NULL,
  "descricao" TEXT NOT NULL,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ObservacaoProducao_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "senha" TEXT NOT NULL,
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "precisaTrocarSenha" BOOLEAN NOT NULL DEFAULT true,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TipoEquipamento" (
  "id" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TipoEquipamento_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RegistroInspecaoMontagem" (
  "id" TEXT NOT NULL,
  "equipmentId" TEXT NOT NULL,
  "ordem" INTEGER NOT NULL,
  "valorObservado" TEXT,
  "instrumentoMedicao" TEXT,
  "conformidades" BOOLEAN,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RegistroInspecaoMontagem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Manutencao" (
  "id" TEXT NOT NULL,
  "origem" TEXT NOT NULL DEFAULT 'SYNCHRO',
  "tipoEquipamentoNome" TEXT,
  "modeloEquipamento" TEXT,
  "numeroSerie" TEXT,
  "tag" TEXT,
  "situacaoEquipamento" TEXT,
  "dataRetornoBase" TIMESTAMP(3),
  "dataInicio" TIMESTAMP(3),
  "dataTermino" TIMESTAMP(3),
  "statusManutencao" TEXT NOT NULL DEFAULT 'PENDENTE',
  "diagnostico" TEXT,
  "responsavelManutencao" TEXT,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "excluidoEm" TIMESTAMP(3),
  CONSTRAINT "Manutencao_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HistoricoManutencao" (
  "id" TEXT NOT NULL,
  "manutencaoId" TEXT NOT NULL,
  "campo" TEXT NOT NULL,
  "valorAnterior" TEXT,
  "valorNovo" TEXT,
  "alteradoPor" TEXT,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HistoricoManutencao_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Equipment_numeroOrdem_key" ON "Equipment"("numeroOrdem");
CREATE UNIQUE INDEX "Equipment_tag_key" ON "Equipment"("tag");
CREATE INDEX "HistoricoProducao_equipmentId_idx" ON "HistoricoProducao"("equipmentId");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "TipoEquipamento_nome_key" ON "TipoEquipamento"("nome");
CREATE UNIQUE INDEX "RegistroInspecaoMontagem_equipmentId_ordem_key" ON "RegistroInspecaoMontagem"("equipmentId", "ordem");
CREATE INDEX "Manutencao_numeroSerie_idx" ON "Manutencao"("numeroSerie");
CREATE INDEX "Manutencao_tag_idx" ON "Manutencao"("tag");
CREATE INDEX "HistoricoManutencao_manutencaoId_idx" ON "HistoricoManutencao"("manutencaoId");

ALTER TABLE "Equipment"
  ADD CONSTRAINT "Equipment_tipoEquipamentoId_fkey"
  FOREIGN KEY ("tipoEquipamentoId") REFERENCES "TipoEquipamento"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "HistoricoProducao"
  ADD CONSTRAINT "HistoricoProducao_equipmentId_fkey"
  FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ItemSeriado"
  ADD CONSTRAINT "ItemSeriado_equipmentId_fkey"
  FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ObservacaoProducao"
  ADD CONSTRAINT "ObservacaoProducao_producaoId_fkey"
  FOREIGN KEY ("producaoId") REFERENCES "Equipment"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RegistroInspecaoMontagem"
  ADD CONSTRAINT "RegistroInspecaoMontagem_equipmentId_fkey"
  FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "HistoricoManutencao"
  ADD CONSTRAINT "HistoricoManutencao_manutencaoId_fkey"
  FOREIGN KEY ("manutencaoId") REFERENCES "Manutencao"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
