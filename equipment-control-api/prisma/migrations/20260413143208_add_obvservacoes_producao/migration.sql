-- CreateTable
CREATE TABLE "ObservacaoProducao" (
    "id" TEXT NOT NULL,
    "producaoId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ObservacaoProducao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ObservacaoProducao" ADD CONSTRAINT "ObservacaoProducao_producaoId_fkey" FOREIGN KEY ("producaoId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
