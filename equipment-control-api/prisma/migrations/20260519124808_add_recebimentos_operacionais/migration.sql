-- CreateTable
CREATE TABLE "RecebimentoOperacional" (
    "id" TEXT NOT NULL,
    "osIdSynchro" TEXT,
    "numeroOs" TEXT NOT NULL,
    "cliente" TEXT,
    "descricaoOperacao" TEXT,
    "statusOperacao" TEXT,
    "usuarioRecebimentoId" TEXT,
    "usuarioRecebimento" TEXT,
    "dataRecebimento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecebimentoOperacional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecebimentoEquipamento" (
    "id" TEXT NOT NULL,
    "recebimentoId" TEXT NOT NULL,
    "equipamentoIdSynchro" TEXT,
    "tag" TEXT,
    "numeroSerie" TEXT,
    "tipoEquipamento" TEXT,
    "modelo" TEXT,
    "retornouFisicamente" BOOLEAN NOT NULL DEFAULT false,
    "equipamentoConferido" BOOLEAN NOT NULL DEFAULT false,
    "possuiAvaria" BOOLEAN NOT NULL DEFAULT false,
    "observacao" TEXT,
    "manutencaoId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecebimentoEquipamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FotoRecebimentoEquipamento" (
    "id" TEXT NOT NULL,
    "recebimentoEquipamentoId" TEXT NOT NULL,
    "tag" TEXT,
    "numeroSerie" TEXT,
    "tipoFoto" TEXT NOT NULL,
    "nomeArquivo" TEXT NOT NULL,
    "caminhoArquivo" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FotoRecebimentoEquipamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecebimentoOperacional_numeroOs_idx" ON "RecebimentoOperacional"("numeroOs");

-- CreateIndex
CREATE INDEX "RecebimentoOperacional_osIdSynchro_idx" ON "RecebimentoOperacional"("osIdSynchro");

-- CreateIndex
CREATE INDEX "RecebimentoEquipamento_tag_idx" ON "RecebimentoEquipamento"("tag");

-- CreateIndex
CREATE INDEX "RecebimentoEquipamento_numeroSerie_idx" ON "RecebimentoEquipamento"("numeroSerie");

-- CreateIndex
CREATE INDEX "RecebimentoEquipamento_recebimentoId_idx" ON "RecebimentoEquipamento"("recebimentoId");

-- CreateIndex
CREATE INDEX "FotoRecebimentoEquipamento_tag_idx" ON "FotoRecebimentoEquipamento"("tag");

-- CreateIndex
CREATE INDEX "FotoRecebimentoEquipamento_numeroSerie_idx" ON "FotoRecebimentoEquipamento"("numeroSerie");

-- AddForeignKey
ALTER TABLE "RecebimentoEquipamento" ADD CONSTRAINT "RecebimentoEquipamento_recebimentoId_fkey" FOREIGN KEY ("recebimentoId") REFERENCES "RecebimentoOperacional"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FotoRecebimentoEquipamento" ADD CONSTRAINT "FotoRecebimentoEquipamento_recebimentoEquipamentoId_fkey" FOREIGN KEY ("recebimentoEquipamentoId") REFERENCES "RecebimentoEquipamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
