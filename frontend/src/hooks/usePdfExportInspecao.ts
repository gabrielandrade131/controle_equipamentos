import jsPDF from 'jspdf';
import { InspecaoMontagem, VerificacaoItem } from '../types/inspecao';

export const usePdfExportInspecao = () => {
    const exportInspecaoToPdf = async (inspecao: InspecaoMontagem, filename: string, logoPath?: string) => {
        try {
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const marginLeft = 15;
            const marginRight = 15;
            const maxWidth = pageWidth - marginLeft - marginRight;
            const pageBottomMargin = 15;
            const maxYPosition = pageHeight - pageBottomMargin;
            let yPosition = 15;

            const checkPageBreak = (spaceNeeded: number) => {
                if (yPosition + spaceNeeded > maxYPosition) {
                    pdf.addPage();
                    yPosition = 15;
                    return true; // new page started
                }
                return false;
            };

            // Logo
            if (logoPath) {
                try {
                    const img = new Image();
                    img.src = logoPath;
                    await new Promise((resolve) => (img.onload = () => resolve(undefined)));
                    pdf.addImage(img, 'PNG', marginLeft, yPosition + 2, 27, 20);
                    yPosition += 18;
                } catch (e) {
                    console.error('Erro ao adicionar logo:', e);
                }
            }

            // Cabeçalho (padrão visual atual)
            pdf.setFontSize(14);
            pdf.text('INSPEÇÃO DE MONTAGEM', pageWidth / 2, yPosition, { align: 'center' });
            pdf.setFontSize(9);
            pdf.text('FOR-MAN-006 - Rev. 5', pageWidth - marginRight - 5, yPosition, { align: 'right' });
            yPosition += 8;
            pdf.setDrawColor(0, 0, 0);
            pdf.line(marginLeft, yPosition, pageWidth - marginRight, yPosition);
            yPosition += 7;

            const addSection = (title: string) => {
                pdf.setFontSize(10);
                pdf.setFillColor(178, 204, 33);
                pdf.rect(marginLeft, yPosition, maxWidth, 7, 'F');
                pdf.text(title, marginLeft + 2, yPosition + 4.5);
                yPosition += 12;
            };

            const addField = (label: string, value?: string) => {
                pdf.setFontSize(9);
                const labelWidth = maxWidth * 0.35;
                const valueX = marginLeft + labelWidth;
                pdf.text(label + ':', marginLeft + 3, yPosition);
                pdf.text(value || '-', valueX, yPosition);
                yPosition += 6;
            };

            // Informações principais
            addSection('INFORMAÇÕES');
            addField('Número de Série', inspecao.numeroSerie);
            addField('Modelo', inspecao.modelo);
            addField('Data da Inspeção', inspecao.dataInspecao || inspecao.data || '');
            addField('Responsável', inspecao.responsavel);
            if (inspecao.observacoes) {
                yPosition += 2;
                addSection('OBSERVAÇÕES');
                const obsLines = pdf.splitTextToSize(inspecao.observacoes || '', maxWidth - 6);
                obsLines.forEach((ln: string) => {
                    checkPageBreak(6);
                    pdf.text(ln, marginLeft + 3, yPosition);
                    yPosition += 5;
                });
            }

            // Instrumentos de aferição
            if (inspecao.instrumentosAferição && inspecao.instrumentosAferição.length > 0) {
                checkPageBreak(25);
                addSection('INSTRUMENTOS DE AFERIÇÃO');
                const colWidths = [maxWidth * 0.65, maxWidth * 0.35];
                const rowH = 7;
                const drawInstrumentsHeader = () => {
                    pdf.setFillColor(240, 240, 240);
                    pdf.rect(marginLeft, yPosition, colWidths[0], rowH, 'F');
                    pdf.rect(marginLeft + colWidths[0], yPosition, colWidths[1], rowH, 'F');
                    pdf.setFont(undefined, 'bold');
                    pdf.setFontSize(8);
                    pdf.text('Instrumento', marginLeft + 2, yPosition + 4);
                    pdf.text('Conformidade', marginLeft + colWidths[0] + 2, yPosition + 4);
                    yPosition += rowH;
                    pdf.setFont(undefined, 'normal');
                };

                drawInstrumentsHeader();
                inspecao.instrumentosAferição.forEach((it: VerificacaoItem) => {
                    const startedNew = checkPageBreak(rowH);
                    if (startedNew) drawInstrumentsHeader();
                    pdf.rect(marginLeft, yPosition, colWidths[0], rowH);
                    pdf.rect(marginLeft + colWidths[0], yPosition, colWidths[1], rowH);
                    pdf.setFontSize(7);
                    const parts = pdf.splitTextToSize(it.nome, colWidths[0] - 4);
                    pdf.text(parts[0] || '', marginLeft + 2, yPosition + 4);
                    pdf.text(it.conformidade || '-', marginLeft + colWidths[0] + 2, yPosition + 4);
                    yPosition += rowH;
                });
                yPosition += 4;
            }

            // Verificações gerais (pré e pós montagem)
            const renderVerificacoes = (title: string, items?: VerificacaoItem[]) => {
                if (!items || items.length === 0) return;
                checkPageBreak(25);
                addSection(title);
                const colWidths = [maxWidth * 0.50, maxWidth * 0.18, maxWidth * 0.16, maxWidth * 0.16];
                const rowH = 7;
                const drawVerificacoesHeader = () => {
                    pdf.setFillColor(240, 240, 240);
                    pdf.rect(marginLeft, yPosition, colWidths[0], rowH, 'F');
                    pdf.rect(marginLeft + colWidths[0], yPosition, colWidths[1], rowH, 'F');
                    pdf.rect(marginLeft + colWidths[0] + colWidths[1], yPosition, colWidths[2], rowH, 'F');
                    pdf.rect(marginLeft + colWidths[0] + colWidths[1] + colWidths[2], yPosition, colWidths[3], rowH, 'F');
                    pdf.setFont(undefined, 'bold');
                    pdf.setFontSize(7);
                    pdf.text('Item', marginLeft + 2, yPosition + 4);
                    pdf.text('Valor', marginLeft + colWidths[0] + 2, yPosition + 4);
                    pdf.text('Instrumento', marginLeft + colWidths[0] + colWidths[1] + 2, yPosition + 4);
                    pdf.text('Conformidade', marginLeft + colWidths[0] + colWidths[1] + colWidths[2] + 2, yPosition + 4);
                    yPosition += rowH;
                    pdf.setFont(undefined, 'normal');
                };

                drawVerificacoesHeader();
                items.forEach((it: VerificacaoItem) => {
                    const startedNew = checkPageBreak(rowH);
                    if (startedNew) drawVerificacoesHeader();
                    if (it.nome.startsWith('@SECTION:')) {
                        pdf.setFont(undefined, 'bold');
                        const sectionTitle = it.nome.replace('@SECTION:', '');
                        pdf.text(sectionTitle, marginLeft + 2, yPosition + 4);
                        yPosition += rowH;
                        pdf.setFont(undefined, 'normal');
                    } else {
                        pdf.rect(marginLeft, yPosition, colWidths[0], rowH);
                        pdf.rect(marginLeft + colWidths[0], yPosition, colWidths[1], rowH);
                        pdf.rect(marginLeft + colWidths[0] + colWidths[1], yPosition, colWidths[2], rowH);
                        pdf.rect(marginLeft + colWidths[0] + colWidths[1] + colWidths[2], yPosition, colWidths[3], rowH);
                        pdf.setFontSize(7);
                        const txt = pdf.splitTextToSize(it.nome, colWidths[0] - 4);
                        pdf.text(txt[0] || '', marginLeft + 2, yPosition + 4);
                        pdf.text(it.valorObservado || '-', marginLeft + colWidths[0] + 2, yPosition + 4);
                        pdf.text(it.instrumentoMedicao || '-', marginLeft + colWidths[0] + colWidths[1] + 2, yPosition + 4);
                        pdf.text(it.conformidade || '-', marginLeft + colWidths[0] + colWidths[1] + colWidths[2] + 2, yPosition + 4);
                        yPosition += rowH;
                    }
                });
                yPosition += 4;
            };

            renderVerificacoes('VERIFICAÇÕES GERAIS PRÉ MONTAGEM', inspecao.verificacoesGeraisPremontagem);
            renderVerificacoes('VERIFICAÇÕES GERAIS PÓS MONTAGEM', inspecao.verificacaoPosmontagem);

            // Resultado e assinatura
            checkPageBreak(30);
            addSection('RESULTADO E ASSINATURAS');
            pdf.setFontSize(9);
            pdf.text('Resultado Final:', marginLeft + 3, yPosition);
            pdf.setFont(undefined, 'bold');
            pdf.text(inspecao.resultadoFinal || (inspecao.aprovado ? 'APROVADO' : 'REPROVADO') || '-', marginLeft + 30, yPosition);
            pdf.setFont(undefined, 'normal');
            yPosition += 8;

            // Apenas exibir a linha para assinatura — não mostrar o nome do assinante
            pdf.text('Assinatura:', marginLeft + 3, yPosition);
            pdf.line(marginLeft + 35, yPosition + 1, marginLeft + 110, yPosition + 1);
            yPosition += 14;

            pdf.save(filename);
        } catch (error) {
            console.error('Erro ao exportar PDF:', error);
            alert('Erro ao exportar PDF!');
        }
    };

    return { exportInspecaoToPdf };
};
