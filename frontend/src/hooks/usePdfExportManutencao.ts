import jsPDF from 'jspdf';
import { InspecaoManutencao } from '../types/manutencao';

export const usePdfExportManutencao = () => {
  const exportInspecaoToPdf = async (inspecao: InspecaoManutencao, filename: string) => {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const marginLeft = 12;
      const marginRight = 12;
      const maxWidth = pageWidth - marginLeft - marginRight;
      
      let yPosition = 15;

      // Função para adicionar nova página se necessário
      const verificarNovaLinhaOuPagina = (altura: number) => {
        if (yPosition + altura > pageHeight - 15) {
          pdf.addPage();
          yPosition = 15;
        }
      };

      // Cabeçalho
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('RELATÓRIO DE INSPEÇÃO DE MANUTENÇÃO', marginLeft, yPosition);
      yPosition += 10;

      // Dados da Manutenção
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'bold');
      pdf.text('DADOS DA MANUTENÇÃO', marginLeft, yPosition);
      yPosition += 6;

      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');

      const dadosManutencao = [
        { label: 'Data da Manutenção:', valor: inspecao.dataManutencao },
        { label: 'Local da Manutenção:', valor: inspecao.localManutencao },
        { label: 'Fabricante / Modelo:', valor: `${inspecao.fabricante} / ${inspecao.modelo}` },
        { label: 'Nº de Série / TAG:', valor: `${inspecao.numeroSerie} / ${inspecao.tag}` },
        { label: 'Destino:', valor: inspecao.destino },
        { label: 'Responsável:', valor: inspecao.responsavel },
      ];

      dadosManutencao.forEach((dado) => {
        verificarNovaLinhaOuPagina(5);
        pdf.text(`${dado.label} ${dado.valor}`, marginLeft, yPosition);
        yPosition += 5;
      });

      yPosition += 5;

      // Função para desenhar seção de verificações
      const desenharSecao = (
        titulo: string,
        itens: Array<{ id: string; titulo: string; resposta: string; observacoes?: string }>
      ) => {
        verificarNovaLinhaOuPagina(8);
        pdf.setFontSize(11);
        pdf.setFont(undefined, 'bold');
        pdf.text(`🔹 ${titulo}`, marginLeft, yPosition);
        yPosition += 8;

        pdf.setFontSize(9);
        pdf.setFont(undefined, 'normal');

        itens.forEach((item) => {
          verificarNovaLinhaOuPagina(6);
          
          // Texto da pergunta quebrado em múltiplas linhas
          const linhas = pdf.splitTextToSize(item.titulo, maxWidth - 30);
          linhas.forEach((linha: string, index: number) => {
            if (index === 0) {
              pdf.text(linha, marginLeft, yPosition);
              yPosition += 4;
            } else {
              verificarNovaLinhaOuPagina(4);
              pdf.text(linha, marginLeft, yPosition);
              yPosition += 4;
            }
          });

          // Checkboxes
          const respostas = ['SIM', 'NÃO', 'N/A'];
          let xPosCheckbox = marginLeft + 5;
          respostas.forEach((resp) => {
            const isSelected = item.resposta === resp;
            pdf.rect(xPosCheckbox, yPosition - 3, 3, 3);
            if (isSelected) {
              pdf.text('✓', xPosCheckbox + 0.5, yPosition - 0.5);
            }
            pdf.text(resp, xPosCheckbox + 5, yPosition);
            xPosCheckbox += 20;
          });

          yPosition += 5;

          // Observações se existirem
          if (item.observacoes) {
            verificarNovaLinhaOuPagina(4);
            pdf.setFont(undefined, 'italic');
            const obsLinhas = pdf.splitTextToSize(`Obs: ${item.observacoes}`, maxWidth - 10);
            obsLinhas.forEach((linha: string) => {
              verificarNovaLinhaOuPagina(3);
              pdf.text(linha, marginLeft + 5, yPosition);
              yPosition += 3;
            });
            pdf.setFont(undefined, 'normal');
            yPosition += 1;
          }
        });

        yPosition += 2;
      };

      // Desenhar todas as seções
      desenharSecao('CERTIFICAÇÕES E DOCUMENTAÇÃO', inspecao.certificacoes);
      desenharSecao('ESTRUTURA E INTEGRIDADE MECÂNICA', inspecao.estruturaMecanica);
      desenharSecao('SISTEMA HIDRÁULICO', inspecao.sistemaHidraulico);
      desenharSecao('SISTEMA PNEUMÁTICO', inspecao.sistemaPneumatico);
      desenharSecao('SISTEMA ELÉTRICO', inspecao.sistemaEletrico);
      desenharSecao('DISPOSITIVOS DE SEGURANÇA', inspecao.dispositivoSeguranca);
      desenharSecao('COMPONENTES OPERACIONAIS', inspecao.componentesOperacionais);
      desenharSecao('ACESSÓRIOS E ITENS ESPECÍFICOS', inspecao.acessorios);
      desenharSecao('TESTES OPERACIONAIS', inspecao.testesOperacionais);

      // Avaliação Final
      verificarNovaLinhaOuPagina(12);
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'bold');
      pdf.text('🔹 AVALIAÇÃO FINAL', marginLeft, yPosition);
      yPosition += 7;

      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');

      const avaliacoes = ['CONFORME', 'NÃO CONFORME'];
      let xPosAvaliacao = marginLeft;
      avaliacoes.forEach((aval) => {
        const isSelected = inspecao.avaliacaoFinal === aval;
        pdf.rect(xPosAvaliacao, yPosition - 2, 3, 3);
        if (isSelected) {
          pdf.text('✓', xPosAvaliacao + 0.5, yPosition);
        }
        pdf.text(aval, xPosAvaliacao + 5, yPosition + 1);
        xPosAvaliacao += 50;
      });

      yPosition += 10;

      // Observações
      if (inspecao.observacoes) {
        verificarNovaLinhaOuPagina(12);
        pdf.setFont(undefined, 'bold');
        pdf.text('Observações:', marginLeft, yPosition);
        yPosition += 5;
        
        pdf.setFont(undefined, 'normal');
        const obsLinhas = pdf.splitTextToSize(inspecao.observacoes, maxWidth);
        obsLinhas.forEach((linha: string) => {
          verificarNovaLinhaOuPagina(4);
          pdf.text(linha, marginLeft, yPosition);
          yPosition += 4;
        });
        yPosition += 5;
      }

      // Assinatura
      verificarNovaLinhaOuPagina(15);
      pdf.setFont(undefined, 'normal');
      pdf.text('Assinatura: _________________________________', marginLeft, yPosition);
      yPosition += 10;
      pdf.text('Data: _____/_____/_______', marginLeft, yPosition);

      // Salvar PDF
      pdf.save(filename);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      throw error;
    }
  };

  return { exportInspecaoToPdf };
};
