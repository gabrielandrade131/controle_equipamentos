-- AddForeignKey
ALTER TABLE "RecebimentoEquipamento" ADD CONSTRAINT "RecebimentoEquipamento_manutencaoId_fkey" FOREIGN KEY ("manutencaoId") REFERENCES "Manutencao"("id") ON DELETE SET NULL ON UPDATE CASCADE;
