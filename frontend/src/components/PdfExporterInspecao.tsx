import React from 'react';
import { usePdfExportInspecao } from '../hooks/usePdfExportInspecao';
import { InspecaoMontagem } from '../types/inspecao';

interface PdfExporterInspecaoProps {
  inspecao: InspecaoMontagem;
  filename?: string;
}

export const PdfExporterInspecao: React.FC<PdfExporterInspecaoProps> = ({ 
  inspecao,
  filename = 'inspecao_montagem.pdf' 
}) => {
  const { exportInspecaoToPdf } = usePdfExportInspecao();

  const handleExport = async () => {
    const nomeArquivo = `inspecao_${inspecao.numeroSerie}_${inspecao.dataInspecao}.pdf`;
    const logoPath = '/logo.png';
    await exportInspecaoToPdf(inspecao, nomeArquivo, logoPath);
  };

  return (
    <button 
      onClick={handleExport}
      className="btn-primary"
    >
      Exportar PDF
    </button>
  );
};
