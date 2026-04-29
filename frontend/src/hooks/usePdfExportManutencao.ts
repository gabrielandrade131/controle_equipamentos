import jsPDF from 'jspdf';
import { InspecaoManutencao } from '../types/manutencao';

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

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const marginLeft = 15;
      const marginRight = 15;
      const maxWidth = pageWidth - marginLeft - marginRight;

      let yPosition = 15;

      const greenColor = [173, 216, 59];

      const verificarNovaLinhaOuPagina = (altura: number) => {
        if (yPosition + altura > pageHeight - 15) {
          pdf.addPage();
          yPosition = 15;
        }
      };

      const desenharBoxSecao = (titulo: string) => {
        verificarNovaLinhaOuPagina(10);

        pdf.setFillColor(greenColor[0], greenColor[1], greenColor[2]);
        pdf.rect(marginLeft, yPosition, maxWidth, 7, 'F');
        pdf.setFontSize(11);
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(titulo, marginLeft + 2, yPosition + 5);

        yPosition += 8;
      };

      // CABEÇALHO
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('HISTORICO DE INSPECAO DE MANUTENCAO', marginLeft, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');

      // DADOS
      desenharBoxSecao('DADOS DA MANUTENCAO');

      const dadosManutencao = [
        { label: 'Data da Manutencao:', valor: inspecao.dataManutencao },
        { label: 'Local da Manutencao:', valor: inspecao.localManutencao },
        {
          label: 'Fabricante / Modelo:',
          valor: `${inspecao.fabricante} / ${inspecao.modelo}`,
        },
        {
          label: 'No de Serie / TAG:',
          valor: `${inspecao.numeroSerie} / ${inspecao.tag}`,
        },
        { label: 'Destino:', valor: inspecao.destino },
        { label: 'Responsavel:', valor: inspecao.responsavel },
      ];

      dadosManutencao.forEach((desc) => {
        const linha = `${desc.label} ${desc.valor}`;
        const linhas = pdf.splitTextToSize(linha, maxWidth);

        linhas.forEach((l: string) => {
          verificarNovaLinhaOuPagina(4);
          pdf.text(l, marginLeft, yPosition);
          yPosition += 4;
        });
      });

      yPosition += 5;

      // ✅ FUNÇÃO CORRETA (ÚNICA)
      const desenharSecao = (
        titulo: string,
        itens: Array<{ titulo: string; resposta: string }>
      ) => {
        if (itens.length === 0) return;

        desenharBoxSecao(titulo);

        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');

        itens.forEach((item) => {
          const checkboxSize = 3;

          const checkboxAreaWidth = 55; // espaço reservado à direita
          const textWidth = maxWidth - checkboxAreaWidth;

          const linhas = pdf.splitTextToSize(item.titulo, textWidth);

          const alturaBloco = linhas.length * 4 + 6;
          verificarNovaLinhaOuPagina(alturaBloco);

          const startY = yPosition;

          // TEXTO
          linhas.forEach((linha: string, index: number) => {
            pdf.text(linha, marginLeft, startY + index * 4);
          });

          // CHECKBOX
          let xCheckbox = marginLeft + textWidth + 5;
          const yCheckbox = startY - 2;

          ['SIM', 'NAO', 'N/A'].forEach((option) => {
            pdf.rect(xCheckbox, yCheckbox, checkboxSize, checkboxSize);

            if (item.resposta === option) {
              pdf.text('X', xCheckbox + 0.5, yCheckbox + 2.5);
            }

            pdf.text(option, xCheckbox + 5, yCheckbox + 2.5);
            xCheckbox += 20;
          });

          yPosition += alturaBloco;
        });

        yPosition += 2;
      };

      // CHAMADAS DAS SEÇÕES
      desenharSecao('CERTIFICACOES E DOCUMENTACAO', inspecao.certificacoes);
      desenharSecao('ESTRUTURA E INTEGRIDADE MECANICA', inspecao.estruturaMecanica);
      desenharSecao('SISTEMA HIDRAULICO', inspecao.sistemaHidraulico);
      desenharSecao('SISTEMA PNEUMATICO', inspecao.sistemaPneumatico);
      desenharSecao('SISTEMA ELETRICO', inspecao.sistemaEletrico);
      desenharSecao('DISPOSITIVOS DE SEGURANCA', inspecao.dispositivoSeguranca);
      desenharSecao('COMPONENTES OPERACIONAIS', inspecao.componentesOperacionais);
      desenharSecao('ACESSORIOS E ITENS ESPECIFICOS', inspecao.acessorios);
      desenharSecao('TESTES OPERACIONAIS', inspecao.testesOperacionais);

      // AVALIAÇÃO FINAL
      desenharBoxSecao('AVALIACAO FINAL');

      const checkboxSize = 3;
      let xPosAval = marginLeft;

      ['CONFORME', 'NAO CONFORME'].forEach((option) => {
        pdf.rect(xPosAval, yPosition - 2, checkboxSize, checkboxSize);

        if (inspecao.avaliacaoFinal === option) {
          pdf.text('X', xPosAval + 0.5, yPosition);
        }

        pdf.text(option, xPosAval + 5, yPosition);
        xPosAval += 50;
      });

      yPosition += 10;

      // OBS
      if (inspecao.observacoes) {
        desenharBoxSecao('OBSERVACOES');

        const obsLinhas = pdf.splitTextToSize(inspecao.observacoes, maxWidth - 4);

        obsLinhas.forEach((linha: string) => {
          verificarNovaLinhaOuPagina(4);
          pdf.text(linha, marginLeft + 2, yPosition);
          yPosition += 4;
        });

        yPosition += 5;
      }

      // INSTRUÇÕES
      desenharBoxSecao('INSTRUCOES IMPORTANTES');

      const instrucoes = [
        '1) Todas as alteracoes no equipamento devem ser documentadas',
        '2) Eventos devem ser registrados',
        '3) Em caso de venda, registrar NF e cliente',
        '4) Historico deve ser preservado',
      ];

      instrucoes.forEach((instr) => {
        const linhas = pdf.splitTextToSize(instr, maxWidth - 4);

        linhas.forEach((linha: string) => {
          verificarNovaLinhaOuPagina(4);
          pdf.text(linha, marginLeft + 2, yPosition);
          yPosition += 4;
        });

        yPosition += 2;
      });

      // ASSINATURA
      yPosition += 10;
      verificarNovaLinhaOuPagina(15);

      pdf.text('Assinatura: _________________________________', marginLeft, yPosition);
      yPosition += 8;
      pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, marginLeft, yPosition);

      pdf.save(filename);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      throw error;
    }
  };

  return { exportInspecaoToPdf };
};