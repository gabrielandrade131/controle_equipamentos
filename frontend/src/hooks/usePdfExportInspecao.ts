import jsPDF from 'jspdf';
import { InspecaoMontagem, VerificacaoItem } from '../types/inspecao';
import {
    LINHAS_PREMONTAGEM_INSPECAO_PDF,
    LINHAS_POSMONTAGEM_INSPECAO_PDF,
    NOMES_INSTRUMENTOS_AFERICAO,
} from '../constants/inspecaoMontagem';
import { ASSINATURA_DOUGLAS_BASE64 } from '../constants/assinaturaDouglas';
import { formatDatePtBr } from '../utils/date';

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

            const wrapTextLines = (text: string, width: number) => {
                const segments = (text || '-').split('\n');
                return segments.flatMap((segment) => pdf.splitTextToSize(segment, width) as string[]);
            };

            const normalizeConformidade = (value?: string | boolean | null): VerificacaoItem['conformidade'] => {
                if (value === true || value === 'SIM') return 'SIM';
                if (value === false || value === 'NÃO' || value === 'NAO') return 'NÃO';
                if (value === 'N/A' || value === 'NA') return 'N/A';
                return '';
            };

            const normalizePdfInstrumentText = (value?: string) => {
                if (!value) return '-';

                return value
                    .split('\n')
                    .map((line) => {
                        const serialMatch = line.match(/^n\s*[º°o]?\s*s\s*e\s*r\s*i\s*e:?\s*(.*)$/i);
                        if (serialMatch) {
                            const serial = serialMatch[1]?.trim();
                            return serial ? `Nº Série: ${serial}` : 'Nº Série:';
                        }

                        return line
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '')
                            .replace(/[☐☑]/g, '')
                            .replace(/\s*&\s*/g, ' / ')
                            .replace(/\s+/g, ' ')
                            .trim();
                    })
                    .filter(Boolean)
                    .join('\n')
                    .trim();
            };

            const drawTextLines = (lines: string[], x: number, startY: number, lineHeight: number) => {
                lines.forEach((line, index) => {
                    pdf.text(line || '-', x, startY + index * lineHeight);
                });
            };

            // Informações principais
            addSection('INFORMAÇÕES');
            addField('Número de Série', inspecao.numeroSerie);
            addField('Modelo', inspecao.modelo);
            addField('Data da Inspeção', inspecao.dataInspecao || inspecao.data || '');
            addField('Executado por', inspecao.responsavelServico || inspecao.responsavel);
            addField(
                'Revisado por',
                inspecao.statusProducao === 'CONCLUIDA'
                    ? 'Douglas Moreira Alves'
                    : inspecao.responsavelRevisao || '',
            );
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
            const instrumentosAfericaoOriginais = inspecao.instrumentosAferição ?? [];
            const instrumentosAfericao: VerificacaoItem[] = NOMES_INSTRUMENTOS_AFERICAO.length
                ? NOMES_INSTRUMENTOS_AFERICAO.map((nome, index) => {
                      const origem = instrumentosAfericaoOriginais[index];
                      return {
                          id: origem?.id ?? String(index),
                          nome: origem?.nome ?? nome,
                          conformidade: normalizeConformidade((origem as any)?.conformidade),
                      } as VerificacaoItem;
                  })
                : instrumentosAfericaoOriginais.map((origem, index) => ({
                      ...origem,
                      id: origem.id ?? String(index),
                      conformidade: normalizeConformidade((origem as any)?.conformidade),
                  }));

            if (instrumentosAfericao.length > 0) {
                checkPageBreak(25);
                addSection('INSTRUMENTOS DE AFERIÇÃO');
                const colWidths = [maxWidth * 0.65, maxWidth * 0.35];
                const rowLineHeight = 4;

                const drawInstrumentsHeader = () => {
                    pdf.setFillColor(240, 240, 240);
                    pdf.rect(marginLeft, yPosition, colWidths[0], 7, 'F');
                    pdf.rect(marginLeft + colWidths[0], yPosition, colWidths[1], 7, 'F');
                    pdf.setFont(undefined, 'bold');
                    pdf.setFontSize(8);
                    pdf.text('Instrumento', marginLeft + 2, yPosition + 4);
                    pdf.text('Conformidade', marginLeft + colWidths[0] + 2, yPosition + 4);
                    yPosition += 7;
                    pdf.setFont(undefined, 'normal');
                };

                drawInstrumentsHeader();
                instrumentosAfericao.forEach((it: VerificacaoItem) => {
                    const instrumentLines = wrapTextLines(normalizePdfInstrumentText(it.nome), colWidths[0] - 4);
                    const conformityLines = wrapTextLines(it.conformidade || '-', colWidths[1] - 4);
                    const rowH = Math.max(instrumentLines.length, conformityLines.length, 1) * rowLineHeight + 4;
                    const startedNew = checkPageBreak(rowH);
                    if (startedNew) drawInstrumentsHeader();
                    pdf.rect(marginLeft, yPosition, colWidths[0], rowH);
                    pdf.rect(marginLeft + colWidths[0], yPosition, colWidths[1], rowH);
                    pdf.setFontSize(7);
                    drawTextLines(instrumentLines, marginLeft + 2, yPosition + 4, rowLineHeight);
                    drawTextLines(conformityLines, marginLeft + colWidths[0] + 2, yPosition + 4, rowLineHeight);
                    yPosition += rowH;
                });
                yPosition += 4;
            }

            // Verificações gerais (pré e pós montagem)
            const renderVerificacoes = (title: string, items?: VerificacaoItem[]) => {
                const resolveInstrumento = (value?: string, fallback?: string) => {
                    const trimmed = (value ?? '').trim();
                    if (trimmed) return trimmed;
                    return (fallback ?? '').trim();
                };
                const cleanInstrument = (instr?: string) => {
                    if (!instr) return instr;
                    return instr.replace(/\(\s*\)/g, '').replace(/\s{2,}/g, ' ').trim();
                };
                // Map to the same lines used by the form so PDF matches o formulário
                const mapItemsFromTemplate = (): VerificacaoItem[] => {
                    if (title === 'VERIFICAÇÕES GERAIS PRÉ MONTAGEM') {
                        return LINHAS_PREMONTAGEM_INSPECAO_PDF.map((linha) => {
                            const origem = inspecao.verificacoesGeraisPremontagem?.[linha.itemIndex];
                            return {
                                id: origem?.id ?? String(linha.itemIndex),
                                nome: linha.titulo,
                                valorObservado: origem?.valorObservado ?? '',
                                instrumentoMedicao: normalizePdfInstrumentText(
                                    resolveInstrumento(origem?.instrumentoMedicao, linha.instrumentoPadrao),
                                ),
                                conformidade: normalizeConformidade(
                                    origem?.conformidade ?? (origem as any)?.conformidades,
                                ),
                            } as VerificacaoItem;
                        });
                    }

                    if (title === 'VERIFICAÇÕES GERAIS PÓS MONTAGEM') {
                        return LINHAS_POSMONTAGEM_INSPECAO_PDF.map((linha) => {
                            const origem = inspecao.verificacaoPosmontagem?.[linha.itemIndex];
                            return {
                                id: origem?.id ?? String(linha.itemIndex),
                                nome: linha.titulo,
                                valorObservado: origem?.valorObservado ?? '',
                                instrumentoMedicao: normalizePdfInstrumentText(
                                    cleanInstrument(
                                        resolveInstrumento(origem?.instrumentoMedicao, linha.instrumentoPadrao),
                                    ),
                                ),
                                conformidade: normalizeConformidade(
                                    origem?.conformidade ?? (origem as any)?.conformidades,
                                ),
                            } as VerificacaoItem;
                        });
                    }

                    return items ?? [];
                };

                const effectiveItems = mapItemsFromTemplate();
                if (!effectiveItems || effectiveItems.length === 0) return;

                checkPageBreak(25);
                addSection(title);
                const colWidths = [maxWidth * 0.50, maxWidth * 0.18, maxWidth * 0.16, maxWidth * 0.16];
                const rowLineHeight = 4;

                const drawVerificacoesHeader = () => {
                    pdf.setFillColor(240, 240, 240);
                    pdf.rect(marginLeft, yPosition, colWidths[0], 7, 'F');
                    pdf.rect(marginLeft + colWidths[0], yPosition, colWidths[1], 7, 'F');
                    pdf.rect(marginLeft + colWidths[0] + colWidths[1], yPosition, colWidths[2], 7, 'F');
                    pdf.rect(marginLeft + colWidths[0] + colWidths[1] + colWidths[2], yPosition, colWidths[3], 7, 'F');
                    pdf.setFont(undefined, 'bold');
                    pdf.setFontSize(7);
                    pdf.text('Item', marginLeft + 2, yPosition + 4);
                    pdf.text('Valor', marginLeft + colWidths[0] + 2, yPosition + 4);
                    pdf.text('Instrumento', marginLeft + colWidths[0] + colWidths[1] + 2, yPosition + 4);
                    pdf.text('Conformidade', marginLeft + colWidths[0] + colWidths[1] + colWidths[2] + 2, yPosition + 4);
                    yPosition += 7;
                    pdf.setFont(undefined, 'normal');
                };

                drawVerificacoesHeader();
                effectiveItems.forEach((it: VerificacaoItem) => {
                    const itemLines = wrapTextLines(it.nome || '-', colWidths[0] - 4);
                    const valorText = it.valorObservado?.trim() || '-';
                    const instrumentoText = normalizePdfInstrumentText(it.instrumentoMedicao);
                    const valorLines = wrapTextLines(valorText, colWidths[1] - 4);
                    const instrumentoLines = wrapTextLines(instrumentoText, colWidths[2] - 4);
                    const conformidadeLines = wrapTextLines(it.conformidade || '-', colWidths[3] - 4);

                    const rowH = Math.max(
                        itemLines.length,
                        valorLines.length,
                        instrumentoLines.length,
                        conformidadeLines.length,
                        1,
                    ) * rowLineHeight + 4;

                    const startedNew = checkPageBreak(rowH);
                    if (startedNew) drawVerificacoesHeader();

                    pdf.rect(marginLeft, yPosition, colWidths[0], rowH);
                    pdf.rect(marginLeft + colWidths[0], yPosition, colWidths[1], rowH);
                    pdf.rect(marginLeft + colWidths[0] + colWidths[1], yPosition, colWidths[2], rowH);
                    pdf.rect(marginLeft + colWidths[0] + colWidths[1] + colWidths[2], yPosition, colWidths[3], rowH);

                    pdf.setFontSize(7);
                    pdf.setFont(undefined, 'bold');
                    drawTextLines(itemLines, marginLeft + 2, yPosition + 4, rowLineHeight);
                    pdf.setFont(undefined, 'normal');
                    drawTextLines(valorLines, marginLeft + colWidths[0] + 2, yPosition + 4, rowLineHeight);
                    pdf.setFont(undefined, 'bold');
                    drawTextLines(instrumentoLines, marginLeft + colWidths[0] + colWidths[1] + 2, yPosition + 4, rowLineHeight);
                    pdf.setFont(undefined, 'normal');
                    drawTextLines(conformidadeLines, marginLeft + colWidths[0] + colWidths[1] + colWidths[2] + 2, yPosition + 4, rowLineHeight);

                    yPosition += rowH;
                });
                yPosition += 4;
            };

            renderVerificacoes('VERIFICAÇÕES GERAIS PRÉ MONTAGEM', inspecao.verificacoesGeraisPremontagem);
            renderVerificacoes('VERIFICAÇÕES GERAIS PÓS MONTAGEM', inspecao.verificacaoPosmontagem);

            if (inspecao.imagensAnexadas && inspecao.imagensAnexadas.length > 0) {
                checkPageBreak(15);
                addSection('FOTOS DA MONTAGEM');
                
                const imagensPerPage = 2;
                const imageWidth = 85;
                const imageHeight = 85;
                
                for (let i = 0; i < inspecao.imagensAnexadas.length; i++) {
                    const indexInPage = i % imagensPerPage;
                    
                    if (indexInPage === 0 && i > 0) {
                        pdf.addPage();
                        yPosition = 15;
                        addSection('FOTOS DA MONTAGEM (Continuação)');
                    }
                    
                    checkPageBreak(imageHeight + 10);
                    
                    const imageX = marginLeft + (i % 2) * (imageWidth + 10);
                    const imageY = yPosition;
                    
                    try {
                        pdf.addImage(
                            inspecao.imagensAnexadas[i],
                            'JPEG',
                            imageX,
                            imageY,
                            imageWidth,
                            imageHeight
                        );
                        
                        pdf.setFontSize(8);
                        pdf.text(`Foto ${i + 1}`, imageX, imageY + imageHeight + 4);
                        
                        if ((i + 1) % imagensPerPage === 0 || i === inspecao.imagensAnexadas.length - 1) {
                            yPosition += imageHeight + 10;
                        }
                    } catch (error) {
                        console.error(`Erro ao adicionar imagem ${i + 1}:`, error);
                    }
                }
            }

            // Resultado e assinatura
            checkPageBreak(40);
            addSection('RESULTADO E ASSINATURAS');
            pdf.setFontSize(9);
            pdf.text('Resultado Final:', marginLeft + 3, yPosition);
            pdf.setFont(undefined, 'bold');
            pdf.text(inspecao.resultadoFinal || (inspecao.aprovado ? 'APROVADO' : 'REPROVADO') || '-', marginLeft + 30, yPosition);
            pdf.setFont(undefined, 'normal');
            yPosition += 8;

            const drawCenteredText = (text: string, startX: number, endX: number, currentY: number) => {
                const textWidth = pdf.getTextWidth(text);
                const centerX = startX + (endX - startX) / 2;
                pdf.text(text, centerX - textWidth / 2, currentY);
            };
            const assinaturaLineWidth = 78;
            const assinaturaGap = 24;
            const assinaturaTotalWidth = assinaturaLineWidth * 2 + assinaturaGap;
            const assinaturaStartX = marginLeft + (maxWidth - assinaturaTotalWidth) / 2;
            const linhaExecutanteInicio = assinaturaStartX;
            const linhaExecutanteFim = linhaExecutanteInicio + assinaturaLineWidth;
            const linhaRevisaoInicio = linhaExecutanteFim + assinaturaGap;
            const linhaRevisaoFim = linhaRevisaoInicio + assinaturaLineWidth;

            const normalizarStatus = (s?: string) =>
                String(s || '')
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .toUpperCase()
                    .replace(/\s+/g, '_');

            const isConcluida =
                normalizarStatus(inspecao.statusProducao) === 'CONCLUIDA' ||
                normalizarStatus((inspecao as any).status) === 'CONCLUIDA' ||
                normalizarStatus((inspecao as any).statusManutencao) === 'CONCLUIDA';

            const revisadoPor = isConcluida
                ? 'Douglas Moreira Alves'
                : inspecao.responsavelRevisao || 'Douglas Moreira Alves';

            pdf.setFontSize(9);
            pdf.text(
                `Executado por: ${inspecao.responsavelServico || inspecao.responsavel || '-'}`,
                linhaExecutanteInicio,
                yPosition + 2,
            );
            pdf.text(
                `Revisado por: ${revisadoPor}`,
                linhaRevisaoInicio,
                yPosition + 2,
            );

            if (inspecao.assinatura) {
                try {
                    const sigExecWidth = 36;
                    const sigExecHeight = 21;
                    const sigExecX = linhaExecutanteInicio + (assinaturaLineWidth - sigExecWidth) / 2;
                    const sigExecY = yPosition + 6.5;
                    pdf.addImage(inspecao.assinatura, 'PNG', sigExecX, sigExecY, sigExecWidth, sigExecHeight);
                } catch (error) {
                    console.warn('Assinatura do executante não pôde ser carregada no PDF:', error);
                }
            }

            try {
                const sigWidth = 36;
                const sigHeight = 21;
                const sigX = linhaRevisaoInicio + (assinaturaLineWidth - sigWidth) / 2;
                const sigY = yPosition + 6.5;
                pdf.addImage(ASSINATURA_DOUGLAS_BASE64, 'PNG', sigX, sigY, sigWidth, sigHeight);
            } catch (error) {
                console.warn('Assinatura não pôde ser carregada no PDF:', error);
            }

            yPosition += 24;
            pdf.setDrawColor(0, 0, 0);
            pdf.line(linhaExecutanteInicio, yPosition, linhaExecutanteFim, yPosition);
            drawCenteredText('Assinatura executante', linhaExecutanteInicio, linhaExecutanteFim, yPosition + 5);
            pdf.line(linhaRevisaoInicio, yPosition, linhaRevisaoFim, yPosition);
            drawCenteredText('Assinatura revisão', linhaRevisaoInicio, linhaRevisaoFim, yPosition + 3);

            const dataFormatada = formatDatePtBr(
                inspecao.dataTermino || inspecao.dataInspecao || inspecao.data,
            );
            if (dataFormatada) {
                pdf.setFontSize(9);
                pdf.text(`Data: ${dataFormatada}`, marginLeft, yPosition + 14);
            }

            pdf.save(filename);
        } catch (error) {
            console.error('Erro ao exportar PDF:', error);
            alert('Erro ao exportar PDF!');
        }
    };

    return { exportInspecaoToPdf };
};
