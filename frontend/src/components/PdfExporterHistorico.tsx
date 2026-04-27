import React from 'react';
import jsPDF from 'jspdf';
import { HistoricoEquipamentoData } from '../types/historico';

interface PdfExporterHistoricoProps {
  historico: HistoricoEquipamentoData;
  logoPath?: string;
}

export const PdfExporterHistorico: React.FC<PdfExporterHistoricoProps> = ({ historico, logoPath }) => {
  const handleExportPDF = async () => {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const marginLeft = 15;
      const marginRight = 15;
      const maxWidth = pageWidth - marginLeft - marginRight;
      const pageBottomMargin = 15;
      const maxYPosition = pageHeight - pageBottomMargin;
      
      let yPosition = 15;

      // Função para gerenciar quebra de página automática
      const checkPageBreak = (spaceNeeded: number) => {
        if (yPosition + spaceNeeded > maxYPosition) {
          pdf.addPage();
          yPosition = 15;
        }
      };

      // Logo
      if (logoPath) {
        try {
          const img = new Image();
          img.src = logoPath;
          await new Promise((resolve) => {
            img.onload = () => {
              pdf.addImage(img, 'PNG', marginLeft, yPosition + 2, 27, 20);
              resolve(undefined);
            };
          });
          yPosition += 15;
        } catch (e) {
          console.error('Erro ao adicionar logo:', e);
        }
      }

      // Cabeçalho
      pdf.setFontSize(14);
      pdf.text('HISTÓRICO DO EQUIPAMENTO', pageWidth / 2, yPosition, { align: 'center' });
      
      pdf.setFontSize(9);
      pdf.text('FOR-MAN-008 - Rev. 1', pageWidth - marginRight - 5, yPosition, { align: 'right' });
      
      yPosition += 8;

      // Linha divisória
      pdf.setDrawColor(0, 0, 0);
      pdf.line(marginLeft, yPosition, pageWidth - marginRight, yPosition);
      yPosition += 7;

      // Função auxiliar para seções
      const addSection = (title: string) => {
        pdf.setFontSize(10);
        pdf.setFillColor(178, 204, 33);
        pdf.rect(marginLeft, yPosition, maxWidth, 7, 'F');
        pdf.text(title, marginLeft + 2, yPosition + 4.5);
        yPosition += 12;
      };

      const addField = (label: string, value: string | number) => {
        pdf.setFontSize(9);
        const labelWidth = maxWidth * 0.35;
        const valueX = marginLeft + labelWidth;
        
        pdf.text(label + ':', marginLeft + 3, yPosition);
        pdf.text(String(value), valueX, yPosition);
        
        yPosition += 6;
      };

      // DESCRIÇÃO
      addSection('DESCRIÇÃO');
      addField('Número de Série', historico.numeroSerie);
      addField('Modelo', historico.modelo);

      // REGISTROS
      if (historico.registros && historico.registros.length > 0) {
        checkPageBreak(25);
        addSection('HISTÓRICO DE REGISTROS');
        
        // Tabela com linhas
        const colWidths = [maxWidth * 0.20, maxWidth * 0.50, maxWidth * 0.30];
        const rowHeight = 6;
        
        // Cabeçalho da tabela
        pdf.setFillColor(240, 240, 240);
        pdf.setDrawColor(0, 0, 0);
        pdf.rect(marginLeft, yPosition, colWidths[0], rowHeight, 'F');
        pdf.rect(marginLeft + colWidths[0], yPosition, colWidths[1], rowHeight, 'F');
        pdf.rect(marginLeft + colWidths[0] + colWidths[1], yPosition, colWidths[2], rowHeight, 'F');
        
        pdf.setFont(undefined, 'bold');
        pdf.setFontSize(8);
        pdf.text('Data', marginLeft + 2, yPosition + 3.5);
        pdf.text('Histórico', marginLeft + colWidths[0] + 2, yPosition + 3.5);
        pdf.text('Assinatura', marginLeft + colWidths[0] + colWidths[1] + 2, yPosition + 3.5);
        yPosition += rowHeight;
        
        // Linhas de dados
        pdf.setFont(undefined, 'normal');
        historico.registros.forEach((registro) => {
          checkPageBreak(8);
          pdf.setDrawColor(0, 0, 0);
          pdf.rect(marginLeft, yPosition, colWidths[0], rowHeight);
          pdf.rect(marginLeft + colWidths[0], yPosition, colWidths[1], rowHeight);
          pdf.rect(marginLeft + colWidths[0] + colWidths[1], yPosition, colWidths[2], rowHeight);
          
          pdf.setFontSize(7);
          const dataFormatada = new Date(registro.data).toLocaleDateString('pt-BR');
          pdf.text(dataFormatada, marginLeft + 2, yPosition + 3);
          
          const historicoText = pdf.splitTextToSize(registro.historico, colWidths[1] - 4);
          pdf.text(historicoText[0] || '', marginLeft + colWidths[0] + 2, yPosition + 3);
          pdf.text(registro.assinatura || '', marginLeft + colWidths[0] + colWidths[1] + 2, yPosition + 3);
          yPosition += rowHeight;
        });
        yPosition += 3;
      }

      // NOTAS
      if (historico.notas) {
        checkPageBreak(20);
        addSection('NOTAS');
        pdf.setFontSize(9);
        const notasLines = pdf.splitTextToSize(historico.notas, maxWidth - 6);
        notasLines.forEach((line: string) => {
          checkPageBreak(5);
          pdf.text(line, marginLeft + 3, yPosition);
          yPosition += 5;
        });
        yPosition += 5;
      }

      // INSTRUÇÕES
      checkPageBreak(30);
      addSection('INSTRUÇÕES IMPORTANTES');
      pdf.setFontSize(8);
      
      const instrucoes = [
        '1) Todas as alterações no equipamento devem ser documentadas com uma breve descrição e data da ocorrência',
        '2) Eventos que devem ser documentados: Troca de algum item seriado, devolução por parte do cliente, etc',
        '3) Se o equipamento for vendido, deve-se mencionar número da nota fiscal e razão social do cliente',
        '4) O histórico do equipamento deve ser preservado por toda sua vida útil ou por 12 meses a partir da data no caso de venda'
      ];
      
      instrucoes.forEach((instr) => {
        checkPageBreak(8);
        const instrLines = pdf.splitTextToSize(instr, maxWidth - 6);
        instrLines.forEach((line: string) => {
          checkPageBreak(4);
          pdf.text(line, marginLeft + 3, yPosition);
          yPosition += 4;
        });
        yPosition += 1;
      });

      pdf.save(`historico-${historico.numeroSerie}.pdf`);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Erro ao exportar PDF');
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

