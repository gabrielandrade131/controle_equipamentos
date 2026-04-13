-- CreateEnum
CREATE TYPE "StatusProducao" AS ENUM ('PROGRAMADA', 'EM_ANDAMENTO', 'CONCLUIDA');

-- AlterTable
ALTER TABLE "Equipment" ADD COLUMN     "DataTermino" TIMESTAMP(3),
ADD COLUMN     "dataInicio" TIMESTAMP(3),
ADD COLUMN     "statusProducao" "StatusProducao" NOT NULL DEFAULT 'PROGRAMADA';
