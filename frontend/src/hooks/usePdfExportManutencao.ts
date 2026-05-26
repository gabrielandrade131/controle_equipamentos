import jsPDF from 'jspdf';
import { aplicarChecklistManutencao } from '../constants/inspecaoManutencao';
import { InspecaoManutencao } from '../types/manutencao';

type ItemChecklist = {
  titulo: string;
  resposta: string;
};

export const usePdfExportManutencao = () => {
  const exportInspecaoToPdf = async (
    inspecao: InspecaoManutencao,
    filename: string
  ) => {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      const inspecaoChecklist = aplicarChecklistManutencao(inspecao, {
        tipoEquipamento: inspecao.tipoEquipamento,
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const marginX = 14;
      const marginBottom = 14;
      const contentWidth = pageWidth - marginX * 2;
      const green = { r: 178, g: 204, b: 33 };
      const border = { r: 220, g: 220, b: 220 };

      let y = 14;

      const formatDate = (value?: string) => {
        if (!value) return '-';

        const date = new Date(`${value}T00:00:00`);
        return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-BR');
      };

      const normalizeResposta = (value?: string) =>
        String(value ?? '')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toUpperCase();

      const ensureSpace = (height: number) => {
        if (y + height <= pageHeight - marginBottom) return;

        pdf.addPage();
        y = 14;
      };

      const sectionHeader = (title: string) => {
        ensureSpace(12);
        y += 4;
        pdf.setFillColor(green.r, green.g, green.b);
        pdf.rect(marginX, y, contentWidth, 8, 'F');
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.text(title, marginX + 2, y + 5.5);
        y += 12;
      };

      const drawText = (
        text: string,
        x: number,
        currentY: number,
        options?: { bold?: boolean; size?: number }
      ) => {
        pdf.setFont('helvetica', options?.bold ? 'bold' : 'normal');
        pdf.setFontSize(options?.size ?? 9);
        pdf.setTextColor(0, 0, 0);
        pdf.text(text, x, currentY);
      };

      const drawDataGrid = () => {
        const rows = [
          [
            { label: 'Data de retorno à base', value: formatDate(inspecao.dataRetornoBase) },
            { label: 'Data de início', value: formatDate(inspecao.dataInicio) },
          ],
          [
            { label: 'Previsão de término', value: formatDate(inspecao.previsaoTermino) },
            { label: 'Data de término', value: formatDate(inspecao.dataTermino) },
          ],
          [
            { label: 'Status', value: inspecao.statusManutencao || '-' },
            { label: 'Responsável', value: inspecao.responsavel || '-' },
          ],
          [
            { label: 'Fabricante', value: inspecao.fabricante || '-' },
            { label: 'Modelo', value: inspecao.modelo || '-' },
          ],
          [
            { label: 'Ordem de Manutenção', value: String(inspecao.numeroOrdemManutencao ?? '-') },
            { label: 'TAG', value: inspecao.tag || '-' },
          ],
          [
            { label: 'Destino', value: inspecao.destino || '-' },
            { label: 'Local da manutenção', value: inspecao.localManutencao || '-' },
          ],
        ];

        const colGap = 4;
        const colWidth = (contentWidth - colGap) / 2;
        const rowHeight = 11;
        const gridHeight = rows.length * rowHeight;
        ensureSpace(gridHeight + 2);

        rows.forEach((row, rowIndex) => {
          row.forEach((cell, colIndex) => {
            const x = marginX + colIndex * (colWidth + colGap);
            const rowY = y + rowIndex * rowHeight;

            pdf.setDrawColor(border.r, border.g, border.b);
            pdf.rect(x, rowY, colWidth, rowHeight);
            drawText(cell.label, x + 2, rowY + 4, { bold: true, size: 7.5 });

            const valueLines = pdf.splitTextToSize(cell.value, colWidth - 4);
            drawText(valueLines[0] || '-', x + 2, rowY + 8.5, { size: 8.5 });
          });
        });

        y += gridHeight + 4;
      };

      const drawCheckbox = (x: number, currentY: number, selected: boolean, label: string) => {
        const size = 3.2;
        pdf.setDrawColor(0, 0, 0);
        pdf.rect(x, currentY - 2.6, size, size);

        if (selected) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8);
          pdf.text('X', x + 0.6, currentY);
        }

        drawText(label, x + 5, currentY, { size: 8.5 });
      };

      const drawSection = (title: string, items: ItemChecklist[]) => {
        if (!items.length) return;

        sectionHeader(title);
        const questionWidth = contentWidth - 58;
        const optionStartX = marginX + questionWidth + 6;

        items.forEach((item) => {
          const lines = pdf.splitTextToSize(item.titulo, questionWidth);
          const rowHeight = Math.max(9, lines.length * 4 + 5);
          ensureSpace(rowHeight + 2);

          const rowTop = y;
          pdf.setDrawColor(238, 238, 238);
          pdf.line(marginX, rowTop + rowHeight, marginX + contentWidth, rowTop + rowHeight);

          drawText(lines[0], marginX, y + 4, { size: 8.5 });
          lines.slice(1).forEach((line: string, index: number) => {
            drawText(line, marginX, y + 8 + index * 4, { size: 8.5 });
          });

          const answer = normalizeResposta(item.resposta);
          const optionY = y + 4;
          drawCheckbox(optionStartX, optionY, answer === 'SIM', 'SIM');
          drawCheckbox(optionStartX + 20, optionY, answer === 'NAO', 'NÃO');
          drawCheckbox(optionStartX + 40, optionY, answer === 'N/A', 'N/A');

          y += rowHeight;
        });

        y += 4;
      };

      const drawObservacoesDiarias = () => {
        const observacoes = inspecao.observacoesHistorico || [];

        if (!observacoes.length) return;

        sectionHeader('OBSERVAÇÕES DIÁRIAS');

        observacoes.forEach((obs) => {
          const dateStr = formatDate(obs.data);
          const textLines = pdf.splitTextToSize(obs.texto || '-', contentWidth - 10);
          const height = Math.max(14, (textLines.length + 1) * 4 + 8);

          ensureSpace(height);
          pdf.setDrawColor(border.r, border.g, border.b);
          pdf.rect(marginX, y, contentWidth, height);

          drawText(`[${dateStr}]`, marginX + 2, y + 5, { bold: true, size: 8 });
          textLines.forEach((line: string, index: number) => {
            drawText(line, marginX + 4, y + 9 + index * 4, { size: 8 });
          });

          y += height + 2;
        });
      };

      drawText('HISTÓRICO DE INSPEÇÃO DE MANUTENÇÃO', marginX, y, {
        bold: true,
        size: 14,
      });
      y += 10;

      sectionHeader('DADOS DA MANUTENÇÃO');
      drawDataGrid();

      drawSection('CERTIFICAÇÕES E DOCUMENTAÇÃO', inspecaoChecklist.certificacoes);
      drawSection('ESTRUTURA E INTEGRIDADE MECÂNICA', inspecaoChecklist.estruturaMecanica);
      drawSection('SISTEMA HIDRÁULICO', inspecaoChecklist.sistemaHidraulico);
      drawSection('SISTEMA PNEUMÁTICO', inspecaoChecklist.sistemaPneumatico);
      drawSection('SISTEMA ELÉTRICO', inspecaoChecklist.sistemaEletrico);
      drawSection('DISPOSITIVOS DE SEGURANÇA', inspecaoChecklist.dispositivoSeguranca);
      drawSection('COMPONENTES OPERACIONAIS', inspecaoChecklist.componentesOperacionais);
      drawSection('ACESSÓRIOS E ITENS ESPECÍFICOS', inspecaoChecklist.acessorios);
      drawSection('TESTES OPERACIONAIS', inspecaoChecklist.testesOperacionais);

      sectionHeader('AVALIAÇÃO FINAL');
      ensureSpace(10);
      const finalAnswer = normalizeResposta(inspecao.avaliacaoFinal);
      drawCheckbox(marginX, y + 2, finalAnswer === 'CONFORME', 'CONFORME');
      drawCheckbox(marginX + 55, y + 2, finalAnswer === 'NAO CONFORME', 'NÃO CONFORME');
      y += 11;

      drawObservacoesDiarias();

      if (inspecao.imagensAnexadas && inspecao.imagensAnexadas.length > 0) {
        sectionHeader('FOTOS DA MANUTENÇÃO');
        
        const imagensPerPage = 2;
        const imageWidth = 85;
        const imageHeight = 85;
        const pageMargin = marginX;
        
        for (let i = 0; i < inspecao.imagensAnexadas.length; i++) {
          const indexInPage = i % imagensPerPage;
          
          if (indexInPage === 0 && i > 0) {
            pdf.addPage();
            y = 14;
            sectionHeader('FOTOS DA MANUTENÇÃO (Continuação)');
          }
          
          ensureSpace(imageHeight + 10);
          
          const imageX = pageMargin + (i % 2) * (imageWidth + 10);
          const imageY = y;
          
          try {
            pdf.addImage(
              inspecao.imagensAnexadas[i],
              'JPEG',
              imageX,
              imageY,
              imageWidth,
              imageHeight
            );
            
            drawText(`Foto ${i + 1}`, imageX, imageY + imageHeight + 4, { 
              size: 8, 
              bold: true 
            });
            
            if ((i + 1) % imagensPerPage === 0 || i === inspecao.imagensAnexadas.length - 1) {
              y += imageHeight + 10;
            }
          } catch (error) {
            console.error(`Erro ao adicionar imagem ${i + 1}:`, error);
          }
        }
      }

      sectionHeader('ASSINATURA');
      ensureSpace(24);
      drawText(`Responsável: ${inspecao.responsavel || '-'}`, marginX, y + 2, { size: 9 });
      y += 12;
      pdf.setDrawColor(0, 0, 0);
      pdf.line(marginX, y, marginX + 85, y);
      drawText('Assinatura', marginX, y + 5, { size: 8 });
      drawText(
        `Data: ${formatDate(inspecao.dataTermino)}`,
        marginX + 105,
        y + 2,
        { size: 9 }
      );

      pdf.save(filename);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      throw error;
    }
  };

  return { exportInspecaoToPdf };
};
