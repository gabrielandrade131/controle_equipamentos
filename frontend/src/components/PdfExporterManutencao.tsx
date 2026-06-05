import React from 'react';
import { usePdfExportManutencao } from '../hooks/usePdfExportManutencao';
import { InspecaoManutencao } from '../types/manutencao';
import { getLocalDateInput } from '../utils/date';

interface PdfExporterManutencaoProps {
  inspecao: InspecaoManutencao;
  filename?: string;
}

export const PdfExporterManutencao: React.FC<PdfExporterManutencaoProps> = ({
  inspecao,
  filename,
}) => {
  const { exportInspecaoToPdf } = usePdfExportManutencao();

  const handleExport = async () => {
    try {
      const nomeArquivo =
        filename ||
        `inspecao_manutencao_${(inspecao.numeroOrdemManutencao ?? inspecao.tag) || 'equipamento'}_${getLocalDateInput()}.pdf`;
      await exportInspecaoToPdf(inspecao, nomeArquivo);
    } catch (error) {
      alert('Erro ao gerar PDF: ' + error);
    }
  };

  return (
    <button onClick={handleExport} className="btn-exportar-pdf">
      Exportar PDF
    </button>
  );
};
