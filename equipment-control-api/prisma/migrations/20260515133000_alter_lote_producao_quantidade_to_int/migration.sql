-- AlterTable
ALTER TABLE "LoteProducao"
ALTER COLUMN "quantidade" TYPE INTEGER
USING "quantidade"::INTEGER;
