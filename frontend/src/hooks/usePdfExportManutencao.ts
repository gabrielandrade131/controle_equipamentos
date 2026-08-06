import jsPDF from "jspdf";
import { InspecaoManutencao } from "../types/manutencao";

type ItemChecklist = {
  titulo: string;
  resposta: string;
};

export const usePdfExportManutencao = () => {
  const exportInspecaoToPdf = async (
    inspecao: InspecaoManutencao,
    filename: string,
    logoPath?: string,
  ) => {
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      // O formulário já contém apenas os itens do checklist aplicável ao tipo
      // de equipamento. Reaplicar o template aqui poderia substituir esse
      // conjunto e fazer o PDF exibir perguntas que não pertencem à inspeção.
      const inspecaoChecklist = inspecao;

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const marginX = 14;
      const marginBottom = 14;
      const contentWidth = pageWidth - marginX * 2;
      const green = { r: 178, g: 204, b: 33 };
      const border = { r: 220, g: 220, b: 220 };

      let y = 14;

      const formatDate = (value?: string) => {
        if (!value) return "-";

        const date = new Date(`${value}T00:00:00`);
        return Number.isNaN(date.getTime())
          ? value
          : date.toLocaleDateString("pt-BR");
      };

      const normalizeResposta = (value?: string) =>
        String(value ?? "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
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
        pdf.rect(marginX, y, contentWidth, 8, "F");
        pdf.setTextColor(0, 0, 0);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.text(title, marginX + 2, y + 5.5);
        y += 12;
      };

      const drawText = (
        text: string,
        x: number,
        currentY: number,
        options?: { bold?: boolean; size?: number },
      ) => {
        pdf.setFont("helvetica", options?.bold ? "bold" : "normal");
        pdf.setFontSize(options?.size ?? 9);
        pdf.setTextColor(0, 0, 0);
        pdf.text(text, x, currentY);
      };

      const drawCenteredText = (
        text: string,
        startX: number,
        endX: number,
        currentY: number,
        options?: { bold?: boolean; size?: number },
      ) => {
        pdf.setFont("helvetica", options?.bold ? "bold" : "normal");
        pdf.setFontSize(options?.size ?? 9);
        pdf.setTextColor(0, 0, 0);
        const textWidth = pdf.getTextWidth(text);
        const centerX = startX + (endX - startX) / 2;
        pdf.text(text, centerX - textWidth / 2, currentY);
      };

      const drawDataGrid = () => {
        const rows = [
          [
            {
              label: "Data de retorno à base",
              value: formatDate(inspecao.dataRetornoBase),
            },
            { label: "Data de início", value: formatDate(inspecao.dataInicio) },
          ],
          [
            {
              label: "Previsão de término",
              value: formatDate(inspecao.previsaoTermino),
            },
            {
              label: "Data de término",
              value: formatDate(inspecao.dataTermino),
            },
          ],
          [
            { label: "Status", value: inspecao.statusManutencao || "-" },
            { label: "Executado por", value: inspecao.responsavel || "-" },
          ],
          [
            {
              label: "Revisado por",
              value: inspecao.responsavelRevisao || "-",
            },
            { label: "Validade", value: formatDate(inspecao.validade) },
          ],
          [
            { label: "Fabricante", value: inspecao.fabricante || "-" },
            { label: "Modelo", value: inspecao.modelo || "-" },
          ],
          [
            {
              label: "Ordem de Manutenção",
              value: String(inspecao.numeroOrdemManutencao ?? "-"),
            },
            { label: "TAG", value: inspecao.tag || "-" },
          ],
          [
            {
              label: "Tipo de manutenção",
              value:
                inspecao.tipoManutencao === "PREVENTIVA"
                  ? "Preventiva"
                  : "Corretiva",
            },
            {
              label: "Tipo de equipamento",
              value: inspecao.tipoEquipamento || "-",
            },
          ],
          [
            { label: "Destino", value: inspecao.destino || "-" },
            {
              label: "Local da manutenção",
              value: inspecao.localManutencao || "-",
            },
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
            drawText(valueLines[0] || "-", x + 2, rowY + 8.5, { size: 8.5 });
          });
        });

        y += gridHeight + 4;
      };

      const drawCheckbox = (
        x: number,
        currentY: number,
        selected: boolean,
        label: string,
      ) => {
        const size = 3.2;
        pdf.setDrawColor(0, 0, 0);
        pdf.rect(x, currentY - 2.6, size, size);

        if (selected) {
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(8);
          pdf.text("X", x + 0.6, currentY);
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
          pdf.line(
            marginX,
            rowTop + rowHeight,
            marginX + contentWidth,
            rowTop + rowHeight,
          );

          drawText(lines[0], marginX, y + 4, { size: 8.5 });
          lines.slice(1).forEach((line: string, index: number) => {
            drawText(line, marginX, y + 8 + index * 4, { size: 8.5 });
          });

          const answer = normalizeResposta(item.resposta);
          const optionY = y + 4;
          drawCheckbox(optionStartX, optionY, answer === "SIM", "SIM");
          drawCheckbox(optionStartX + 20, optionY, answer === "NAO", "NÃO");
          drawCheckbox(optionStartX + 40, optionY, answer === "N/A", "N/A");

          y += rowHeight;
        });

        y += 4;
      };

      const drawObservacoesDiarias = () => {
        const observacoes = inspecao.observacoesHistorico || [];

        if (!observacoes.length) return;

        sectionHeader("OBSERVAÇÕES DIÁRIAS");

        observacoes.forEach((obs) => {
          const dateStr = formatDate(obs.data);
          const textLines = pdf.splitTextToSize(
            obs.texto || "-",
            contentWidth - 10,
          );
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

      if (logoPath) {
        try {
          const img = new Image();
          img.src = logoPath;
          await new Promise(
            (resolve) => (img.onload = () => resolve(undefined)),
          );
          pdf.addImage(img, "PNG", marginX, y + 2, 27, 20);
          y += 18;
        } catch (e) {
          console.error("Erro ao adicionar logo:", e);
        }
      }

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text("HISTÓRICO DE INSPEÇÃO DE MANUTENÇÃO", pageWidth / 2, y, {
        align: "center",
      });
      y += 8;
      pdf.setDrawColor(0, 0, 0);
      pdf.line(marginX, y, pageWidth - marginX, y);
      y += 7;

      sectionHeader("DADOS DA MANUTENÇÃO");
      drawDataGrid();

      drawSection(
        "CERTIFICAÇÕES E DOCUMENTAÇÃO",
        inspecaoChecklist.certificacoes,
      );
      drawSection(
        "ESTRUTURA E INTEGRIDADE MECÂNICA",
        inspecaoChecklist.estruturaMecanica,
      );
      drawSection("SISTEMA HIDRÁULICO", inspecaoChecklist.sistemaHidraulico);
      drawSection("SISTEMA PNEUMÁTICO", inspecaoChecklist.sistemaPneumatico);
      drawSection("SISTEMA ELÉTRICO", inspecaoChecklist.sistemaEletrico);
      drawSection(
        "DISPOSITIVOS DE SEGURANÇA",
        inspecaoChecklist.dispositivoSeguranca,
      );
      drawSection(
        "COMPONENTES OPERACIONAIS",
        inspecaoChecklist.componentesOperacionais,
      );
      drawSection(
        "ACESSÓRIOS E ITENS ESPECÍFICOS",
        inspecaoChecklist.acessorios,
      );
      drawSection("TESTES OPERACIONAIS", inspecaoChecklist.testesOperacionais);

      sectionHeader("AVALIAÇÃO FINAL");
      ensureSpace(10);
      const finalAnswer = normalizeResposta(inspecao.avaliacaoFinal);
      drawCheckbox(marginX, y + 2, finalAnswer === "CONFORME", "CONFORME");
      drawCheckbox(
        marginX + 55,
        y + 2,
        finalAnswer === "NAO CONFORME",
        "NÃO CONFORME",
      );
      y += 11;

      drawObservacoesDiarias();

      if (inspecao.imagensAnexadas && inspecao.imagensAnexadas.length > 0) {
        const colunas = 3;
        const imagensPerPage = colunas * 2;
        const espacamentoHorizontal = 7;
        const imageWidth =
          (contentWidth - espacamentoHorizontal * (colunas - 1)) / colunas;
        const imageHeight = 52;
        const alturaLegenda = 6;
        const espacamentoVertical = 8;
        const alturaLinha = imageHeight + alturaLegenda + espacamentoVertical;
        const pageMargin = marginX;

        // Garante espaço para o cabeçalho (12) + primeira linha de imagens (alturaLinha)
        ensureSpace(12 + alturaLinha);
        sectionHeader("FOTOS DA MANUTENÇÃO");
        for (let i = 0; i < inspecao.imagensAnexadas.length; i++) {
          const indexInPage = i % imagensPerPage;
          if (i % colunas === 0) {
            const isFirstRow = i === 0;
            const needsContinuationHeader =
              i > 0 &&
              (indexInPage === 0 ||
                y + alturaLinha > pageHeight - marginBottom);

            if (needsContinuationHeader) {
              pdf.addPage();
              y = 14;
            } else if (!isFirstRow) {
              ensureSpace(alturaLinha);
            }
          }

          const colunaAtual = i % colunas;
          const imageX =
            pageMargin + colunaAtual * (imageWidth + espacamentoHorizontal);
          const imageY = y;
          const formatoImagem = inspecao.imagensAnexadas[i].startsWith(
            "data:image/png",
          )
            ? "PNG"
            : inspecao.imagensAnexadas[i].startsWith("data:image/webp")
              ? "WEBP"
              : "JPEG";

          try {
            pdf.addImage(
              inspecao.imagensAnexadas[i],
              formatoImagem,
              imageX,
              imageY,
              imageWidth,
              imageHeight,
            );

            drawText(`Foto ${i + 1}`, imageX, imageY + imageHeight + 4, {
              size: 8,
              bold: true,
            });

            if (
              (i + 1) % colunas === 0 ||
              i === inspecao.imagensAnexadas.length - 1
            ) {
              y += alturaLinha;
            }
          } catch (error) {
            console.error(`Erro ao adicionar imagem ${i + 1}:`, error);
          }
        }
      }

      sectionHeader("ASSINATURA");
      ensureSpace(36);
      const assinaturaLineWidth = 78;
      const assinaturaGap = 24;
      const assinaturaTotalWidth = assinaturaLineWidth * 2 + assinaturaGap;
      const assinaturaStartX =
        marginX + (contentWidth - assinaturaTotalWidth) / 2;
      const linhaExecutanteInicio = assinaturaStartX;
      const linhaExecutanteFim = linhaExecutanteInicio + assinaturaLineWidth;
      const linhaRevisaoInicio = linhaExecutanteFim + assinaturaGap;
      const linhaRevisaoFim = linhaRevisaoInicio + assinaturaLineWidth;
      drawText(
        `Executado por: ${inspecao.responsavel || "-"}`,
        linhaExecutanteInicio,
        y + 2,
        { size: 9 },
      );
      drawText(
        `Revisado por: ${inspecao.responsavelRevisao || "-"}`,
        linhaRevisaoInicio,
        y + 2,
        { size: 9 },
      );
      y += 20;
      pdf.setDrawColor(0, 0, 0);
      pdf.line(linhaExecutanteInicio, y, linhaExecutanteFim, y);
      drawCenteredText(
        "Assinatura executante",
        linhaExecutanteInicio,
        linhaExecutanteFim,
        y + 5,
        { size: 8 },
      );
      pdf.line(linhaRevisaoInicio, y, linhaRevisaoFim, y);
      drawCenteredText(
        "Assinatura revisão",
        linhaRevisaoInicio,
        linhaRevisaoFim,
        y + 5,
        { size: 8 },
      );
      drawText(`Data: ${formatDate(inspecao.dataTermino)}`, marginX, y + 18, {
        size: 9,
      });

      pdf.save(filename);
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      throw error;
    }
  };

  return { exportInspecaoToPdf };
};
