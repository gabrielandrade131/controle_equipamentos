/*
  Warnings:

  - You are about to drop the column `DataTermino` on the `Equipment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Equipment" DROP COLUMN "DataTermino",
ADD COLUMN     "dataTermino" TIMESTAMP(3);
