import React from 'react';
import { usePdfExport } from '../hooks/usePdfExport';
import { Producao } from '../types/producao';

interface PdfExporterProps {
  producao: Producao;
  filename?: string;
}

export const PdfExporter: React.FC<PdfExporterProps> = ({ 
  producao,
  filename = 'ordem_producao.pdf' 
}) => {
  const { exportOrdemProducaoToPdf } = usePdfExport();

  const handleExport = async () => {
    const nomeArquivo = `ordem_producao_${producao.numeroOrdem}.pdf`;
    const logoPath = '/logo.png';
    await exportOrdemProducaoToPdf(producao, nomeArquivo, logoPath);
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
