/*
  Warnings:

  - You are about to drop the column `dataInicio` on the `Equipment` table. All the data in the column will be lost.
  - You are about to drop the column `dataNecessidade` on the `Equipment` table. All the data in the column will be lost.
  - You are about to drop the column `dataSolicitacao` on the `Equipment` table. All the data in the column will be lost.
  - You are about to drop the column `dataTermino` on the `Equipment` table. All the data in the column will be lost.
  - You are about to drop the column `modelo` on the `Equipment` table. All the data in the column will be lost.
  - You are about to drop the column `previsaoTermino` on the `Equipment` table. All the data in the column will be lost.
  - You are about to drop the column `solicitante` on the `Equipment` table. All the data in the column will be lost.
  - You are about to drop the column `statusProducao` on the `Equipment` table. All the data in the column will be lost.
  - You are about to drop the column `tipoEquipamentoId` on the `Equipment` table. All the data in the column will be lost.
  - Made the column `loteProducaoId` on table `Equipment` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Equipment" DROP CONSTRAINT "Equipment_loteProducaoId_fkey";

-- DropForeignKey
ALTER TABLE "Equipment" DROP CONSTRAINT "Equipment_tipoEquipamentoId_fkey";

-- AlterTable
ALTER TABLE "Equipment" DROP COLUMN "dataInicio",
DROP COLUMN "dataNecessidade",
DROP COLUMN "dataSolicitacao",
DROP COLUMN "dataTermino",
DROP COLUMN "modelo",
DROP COLUMN "previsaoTermino",
DROP COLUMN "solicitante",
DROP COLUMN "statusProducao",
DROP COLUMN "tipoEquipamentoId",
ALTER COLUMN "loteProducaoId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_loteProducaoId_fkey" FOREIGN KEY ("loteProducaoId") REFERENCES "LoteProducao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
