-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "numeroOrdem" TEXT NOT NULL,
    "numeroSerie" TEXT,
    "dataSolicitacao" TIMESTAMP(3),
    "modelo" TEXT,
    "descricao" TEXT,
    "listaPecas" BOOLEAN NOT NULL DEFAULT false,
    "sequenciaMontagem" BOOLEAN NOT NULL DEFAULT false,
    "inspecaoMontagem" BOOLEAN NOT NULL DEFAULT false,
    "historicoEquipamento" BOOLEAN NOT NULL DEFAULT false,
    "procedimentoTesteInspecaoMontagem" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemSeriado" (
    "id" TEXT NOT NULL,
    "producaoID" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemSeriado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_numeroOrdem_key" ON "Equipment"("numeroOrdem");

-- AddForeignKey
ALTER TABLE "ItemSeriado" ADD CONSTRAINT "ItemSeriado_producaoID_fkey" FOREIGN KEY ("producaoID") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
