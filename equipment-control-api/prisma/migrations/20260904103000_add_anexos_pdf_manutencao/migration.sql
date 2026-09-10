CREATE TABLE "AnexoPdfManutencao" (
    "id" TEXT NOT NULL,
    "manutencaoId" TEXT NOT NULL,
    "nomeArquivo" TEXT NOT NULL,
    "caminhoArquivo" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnexoPdfManutencao_pkey" PRIMARY KEY ("id")
);

INSERT INTO "AnexoPdfManutencao" ("id", "manutencaoId", "nomeArquivo", "caminhoArquivo", "criadoEm", "atualizadoEm")
SELECT
    md5(random()::text || clock_timestamp()::text || "id")::uuid::text,
    "id",
    regexp_replace("anexoPdf", '^.*/', ''),
    "anexoPdf",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Manutencao"
WHERE "anexoPdf" IS NOT NULL AND "anexoPdf" <> '';

CREATE INDEX "AnexoPdfManutencao_manutencaoId_idx" ON "AnexoPdfManutencao"("manutencaoId");

ALTER TABLE "AnexoPdfManutencao"
ADD CONSTRAINT "AnexoPdfManutencao_manutencaoId_fkey"
FOREIGN KEY ("manutencaoId") REFERENCES "Manutencao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
