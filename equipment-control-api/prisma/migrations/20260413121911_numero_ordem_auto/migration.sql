/*
  Warnings:

  - The `numeroOrdem` column on the `Equipment` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Equipment" DROP COLUMN "numeroOrdem",
ADD COLUMN     "numeroOrdem" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_numeroOrdem_key" ON "Equipment"("numeroOrdem");
