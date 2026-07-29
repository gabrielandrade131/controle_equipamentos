ALTER TABLE "Manutencao" ADD COLUMN "numeroSerie" TEXT;

CREATE INDEX "Manutencao_numeroSerie_idx" ON "Manutencao"("numeroSerie");
