CREATE TYPE "DestinoManutencao" AS ENUM ('ESTOQUE', 'OPERACAO');

ALTER TABLE "Manutencao"
ADD COLUMN "destino" "DestinoManutencao";
