import React from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { HistoricoEquipamentoData } from '../types/historico';

interface PdfExporterHistoricoProps {
  historico: HistoricoEquipamentoData;
}

export const PdfExporterHistorico: React.FC<PdfExporterHistoricoProps> = ({ historico }) => {
  const handleExportPDF = async () => {
    const element = document.createElement('div');
    element.innerHTML = gerarHtmlHistorico(historico);
    element.style.padding = '20px';
    element.style.backgroundColor = 'white';

    document.body.appendChild(element);

    try {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      pdf.save(`historico-${historico.numeroSerie}.pdf`);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Erro ao exportar PDF');
    } finally {
      document.body.removeChild(element);
    }
  };

  return (
    <button 
      onClick={handleExportPDF}
      className="btn-primary"
      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
    >
      Exportar PDF
    </button>
  );
};

const gerarHtmlHistorico = (historico: HistoricoEquipamentoData): string => {
  const notasText = historico.notas || '';
  const notasExemplo = `1) Todas as alterações no equipamento devem ser documentadas com uma breve descrição e data da ocorrência
2) Eventos que devem ser documentados: Troca de algum item seriado, devolução por parte do cliente, etc
3) Se o equipamento for vendido, deve-se mencionar número da nota fiscal e razão social do cliente
4) O histórico do equipamento deve ser preservado por toda sua vida útil ou por 12 meses a partir da data no caso de venda`;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 100%; border: 2px solid #000;">
      <div style="display: flex; align-items: center; border-bottom: 2px solid #000; padding: 10px;">
        <div style="flex: 1; text-align: center; border-right: 2px solid #000; padding: 10px;">
          <strong style="font-size: 18px;">ambipar</strong><br/>
          <span style="font-size: 10px;">response</span>
        </div>
        <div style="flex: 2; text-align: center; font-size: 20px; font-weight: bold;">
          HISTÓRICO DO EQUIPAMENTO
        </div>
        <div style="flex: 1; text-align: center; border-left: 2px solid #000; padding: 10px; font-size: 12px; font-weight: bold;">
          FOR-MAN-008 - Rev. 1
        </div>
      </div>

      <div style="padding: 10px;">
        <div style="margin-bottom: 15px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="border: 1px solid #000; padding: 8px; font-weight: bold; background-color: #f0f0f0; width: 20%;">Descrição</td>
              <td style="border: 1px solid #000; padding: 8px; background-color: #f0f0f0;"></td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 8px; font-weight: bold;">Número da Série</td>
              <td style="border: 1px solid #000; padding: 8px;">${historico.numeroSerie}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 8px; font-weight: bold;">Modelo</td>
              <td style="border: 1px solid #000; padding: 8px;">${historico.modelo}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 15px;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="border: 1px solid #000; padding: 8px; background-color: #f0f0f0; font-weight: bold; text-align: left;">Data</th>
                <th style="border: 1px solid #000; padding: 8px; background-color: #f0f0f0; font-weight: bold; text-align: left;">Histórico</th>
                <th style="border: 1px solid #000; padding: 8px; background-color: #f0f0f0; font-weight: bold; text-align: left;">Assinatura</th>
              </tr>
            </thead>
            <tbody>
              ${historico.registros.map(registro => `
                <tr>
                  <td style="border: 1px solid #000; padding: 8px;">${new Date(registro.data).toLocaleDateString('pt-BR')}</td>
                  <td style="border: 1px solid #000; padding: 8px;">${registro.historico}</td>
                  <td style="border: 1px solid #000; padding: 8px;">${registro.assinatura}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="margin-bottom: 15px; border: 1px solid #000; padding: 10px; background-color: #fffbea;">
          <div style="font-weight: bold; margin-bottom: 10px;">Notas:</div>
          <div style="font-size: 12px; line-height: 1.6;">
            ${notasExemplo.split('\n').map(nota => `<div>${nota}</div>`).join('')}
          </div>
        </div>

        ${notasText ? `
          <div style="margin-top: 15px; border: 1px solid #000; padding: 10px; background-color: #f0f0f0;">
            <div style="font-weight: bold; margin-bottom: 10px;">Observações Adicionais:</div>
            <div>${notasText}</div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
};
