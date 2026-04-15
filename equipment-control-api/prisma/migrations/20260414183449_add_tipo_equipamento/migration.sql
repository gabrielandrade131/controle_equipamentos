-- AlterTable
ALTER TABLE "Equipment" ADD COLUMN     "tipoEquipamentoId" TEXT;

-- CreateTable
CREATE TABLE "TipoEquipamento" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TipoEquipamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TipoEquipamento_nome_key" ON "TipoEquipamento"("nome");

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_tipoEquipamentoId_fkey" FOREIGN KEY ("tipoEquipamentoId") REFERENCES "TipoEquipamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;
