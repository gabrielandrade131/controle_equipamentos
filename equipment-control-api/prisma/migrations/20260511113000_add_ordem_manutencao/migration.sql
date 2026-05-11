ALTER TABLE "Manutencao" ADD COLUMN "numeroOrdemManutencao" SERIAL NOT NULL;

CREATE UNIQUE INDEX "Manutencao_numeroOrdemManutencao_key"
  ON "Manutencao"("numeroOrdemManutencao");
