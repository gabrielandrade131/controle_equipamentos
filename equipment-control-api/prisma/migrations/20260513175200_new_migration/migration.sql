/*
  Warnings:

  - Added the required column `responsavel` to the `ObservacaoProducao` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ObservacaoProducao" ADD COLUMN     "responsavel" TEXT NOT NULL;
