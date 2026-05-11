ALTER TABLE "Manutencao" ADD COLUMN "synchroId" TEXT;

CREATE UNIQUE INDEX "Manutencao_synchroId_key"
  ON "Manutencao"("synchroId");
