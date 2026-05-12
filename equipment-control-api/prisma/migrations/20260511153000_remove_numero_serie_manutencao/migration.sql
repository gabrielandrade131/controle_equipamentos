DROP INDEX IF EXISTS "Manutencao_numeroSerie_idx";

ALTER TABLE "Manutencao"
  DROP COLUMN IF EXISTS "numeroSerie";
