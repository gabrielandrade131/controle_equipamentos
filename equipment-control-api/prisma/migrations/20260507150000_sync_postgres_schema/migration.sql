CREATE TYPE "OrigemManutencao" AS ENUM ('SYNCHRO', 'MANUAL');
CREATE TYPE "StatusManutencao" AS ENUM ('PENDENTE', 'EM_MANUTENCAO', 'CONCLUIDA', 'PARALISADA');
CREATE TYPE "StatusProducao" AS ENUM ('PROGRAMADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'PARALISADA');

ALTER TABLE "ItemSeriado" DROP CONSTRAINT "ItemSeriado_equipmentId_fkey";

CREATE SEQUENCE equipment_numeroordem_seq;

ALTER TABLE "Equipment"
  DROP COLUMN "dataPrevisao",
  ALTER COLUMN "numeroOrdem" SET DEFAULT nextval('equipment_numeroordem_seq'),
  ALTER COLUMN "statusProducao" DROP DEFAULT,
  ALTER COLUMN "statusProducao" TYPE "StatusProducao" USING "statusProducao"::"StatusProducao",
  ALTER COLUMN "statusProducao" SET DEFAULT 'PROGRAMADA',
  ALTER COLUMN "listaPecas" DROP NOT NULL,
  ALTER COLUMN "listaPecas" DROP DEFAULT,
  ALTER COLUMN "sequenciaMontagem" DROP NOT NULL,
  ALTER COLUMN "sequenciaMontagem" DROP DEFAULT,
  ALTER COLUMN "inspecaoMontagem" DROP NOT NULL,
  ALTER COLUMN "inspecaoMontagem" DROP DEFAULT,
  ALTER COLUMN "historicoEquipamento" DROP NOT NULL,
  ALTER COLUMN "historicoEquipamento" DROP DEFAULT,
  ALTER COLUMN "procedimentoTesteInspecaoMontagem" DROP NOT NULL,
  ALTER COLUMN "procedimentoTesteInspecaoMontagem" DROP DEFAULT;

ALTER SEQUENCE equipment_numeroordem_seq OWNED BY "Equipment"."numeroOrdem";

ALTER TABLE "ItemSeriado" RENAME COLUMN "equipmentId" TO "producaoID";

ALTER TABLE "ItemSeriado"
  ADD CONSTRAINT "ItemSeriado_producaoID_fkey"
  FOREIGN KEY ("producaoID") REFERENCES "Equipment"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Manutencao"
  ALTER COLUMN "origem" DROP DEFAULT,
  ALTER COLUMN "origem" TYPE "OrigemManutencao" USING "origem"::"OrigemManutencao",
  ALTER COLUMN "origem" SET DEFAULT 'SYNCHRO',
  ALTER COLUMN "statusManutencao" DROP DEFAULT,
  ALTER COLUMN "statusManutencao" TYPE "StatusManutencao" USING "statusManutencao"::"StatusManutencao",
  ALTER COLUMN "statusManutencao" SET DEFAULT 'PENDENTE';
