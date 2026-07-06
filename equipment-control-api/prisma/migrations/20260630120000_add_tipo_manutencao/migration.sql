CREATE TYPE "TipoManutencao" AS ENUM ('CORRETIVA', 'PREVENTIVA');

ALTER TABLE "Manutencao"
  ADD COLUMN "tipoManutencao" "TipoManutencao" NOT NULL DEFAULT 'CORRETIVA';
