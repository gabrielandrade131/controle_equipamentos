import jsPDF from 'jspdf';
import { InspecaoMontagem } from '../types/inspecao';

export const usePdfExportInspecao = () => {
    const exportInspecaoToPdf = async (inspecao: InspecaoMontagem, filename: string, logoPath?: string) => {
        try {
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const marginLeft = 15;
            const marginRight = 15;
            const maxWidth = pageWidth - marginLeft - marginRight;
            
            let yPosition = 15;

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
            pdf.text('INSPEÇÃO DE MONTAGEM', pageWidth / 2, yPosition, { align: 'center' });
            
            pdf.setFontSize(9);
            pdf.text('FOR-MAN-005 - Rev. 5', pageWidth - marginRight - 5, yPosition, { align: 'right' });
            
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
            addField('Número de Série', inspecao.numeroSerie);
            addField('Modelo', inspecao.modelo);
            addField('Data', inspecao.data);
            addField('Responsável', inspecao.responsavel);

            // INSTRUMENTOS DE AFEIÇÃO
            if (inspecao.instrumentosAferição && inspecao.instrumentosAferição.length > 0) {
                addSection('VERIFICAÇÕES NOS INSTRUMENTOS DE AFEIÇÃO');
                inspecao.instrumentosAferição.forEach((item) => {
                    const conformidade = item.conformidade || '—';
                    pdf.setFontSize(8);
                    pdf.text(`• ${item.nome}: ${conformidade}`, marginLeft + 5, yPosition);
                    yPosition += 4;
                });
                yPosition += 2;
            }

            // VERIFICAÇÃO PRÉ MONTAGEM
            if (inspecao.verificacaoPremontagem && inspecao.verificacaoPremontagem.length > 0) {
                addSection('VERIFICAÇÃO GERAL PRÉ MONTAGEM');
                inspecao.verificacaoPremontagem.forEach((item) => {
                    pdf.setFontSize(8);
                    pdf.setFont(undefined, 'bold');
                    pdf.text(item.nome, marginLeft + 3, yPosition);
                    yPosition += 3;
                    pdf.setFont(undefined, 'normal');
                    
                    if (item.valorObservado) {
                        pdf.text(`Valor Observado: ${item.valorObservado}`, marginLeft + 5, yPosition);
                        yPosition += 3;
                    }
                    if (item.instrumentoMedicao) {
                        pdf.text(`Instrumento: ${item.instrumentoMedicao}`, marginLeft + 5, yPosition);
                        yPosition += 3;
                    }
                    pdf.text(`Conformidade: ${item.conformidade || '—'}`, marginLeft + 5, yPosition);
                    yPosition += 5;
                });
                yPosition += 2;
            }

            // ANÁLISE DIMENSIONAL
            if (inspecao.analiseDimensional && inspecao.analiseDimensional.length > 0) {
                addSection('ANÁLISE DIMENSIONAL DE CARCAÇA');
                inspecao.analiseDimensional.forEach((item) => {
                    pdf.setFontSize(8);
                    pdf.setFont(undefined, 'bold');
                    pdf.text(item.nome, marginLeft + 3, yPosition);
                    yPosition += 3;
                    pdf.setFont(undefined, 'normal');
                    
                    if (item.valorObservado) {
                        pdf.text(`Valor: ${item.valorObservado}`, marginLeft + 5, yPosition);
                        yPosition += 3;
                    }
                    if (item.instrumentoMedicao) {
                        pdf.text(`Instrumento: ${item.instrumentoMedicao}`, marginLeft + 5, yPosition);
                        yPosition += 3;
                    }
                    pdf.text(`Conformidade: ${item.conformidade || '—'}`, marginLeft + 5, yPosition);
                    yPosition += 5;
                });
                yPosition += 2;
            }

            // TESTES
            if (inspecao.testes && inspecao.testes.length > 0) {
                addSection('TESTES');
                inspecao.testes.forEach((item) => {
                    pdf.setFontSize(8);
                    pdf.setFont(undefined, 'bold');
                    pdf.text(item.nome, marginLeft + 3, yPosition);
                    yPosition += 3;
                    pdf.setFont(undefined, 'normal');
                    
                    if (item.valorObservado) {
                        pdf.text(`Valor: ${item.valorObservado}`, marginLeft + 5, yPosition);
                        yPosition += 3;
                    }
                    if (item.instrumentoMedicao) {
                        pdf.text(`Instrumento: ${item.instrumentoMedicao}`, marginLeft + 5, yPosition);
                        yPosition += 3;
                    }
                    pdf.text(`Conformidade: ${item.conformidade || '—'}`, marginLeft + 5, yPosition);
                    yPosition += 5;
                });
                yPosition += 2;
            }

            // VERIFICAÇÃO PÓS MONTAGEM
            if (inspecao.verificacaoPosmontagem && inspecao.verificacaoPosmontagem.length > 0) {
                addSection('VERIFICAÇÕES GERAIS PÓS MONTAGEM');
                inspecao.verificacaoPosmontagem.forEach((item) => {
                    pdf.setFontSize(8);
                    pdf.setFont(undefined, 'bold');
                    pdf.text(item.nome, marginLeft + 3, yPosition);
                    yPosition += 3;
                    pdf.setFont(undefined, 'normal');
                    
                    if (item.valorObservado) {
                        pdf.text(`Valor: ${item.valorObservado}`, marginLeft + 5, yPosition);
                        yPosition += 3;
                    }
                    if (item.instrumentoMedicao) {
                        pdf.text(`Instrumento: ${item.instrumentoMedicao}`, marginLeft + 5, yPosition);
                        yPosition += 3;
                    }
                    pdf.text(`Conformidade: ${item.conformidade || '—'}`, marginLeft + 5, yPosition);
                    yPosition += 5;
                });
                yPosition += 2;
            }

            // RESULTADO DE INSPEÇÃO
            if (inspecao.resultadoFinal) {
                addSection('RESULTADO DE INSPEÇÃO');
                pdf.setFontSize(11);
                pdf.setFont(undefined, 'bold');
                const color = inspecao.resultadoFinal === 'APROVADO' ? [76, 175, 80] : [244, 67, 54];
                pdf.setTextColor(color[0], color[1], color[2]);
                pdf.text(inspecao.resultadoFinal, marginLeft + 3, yPosition);
                pdf.setTextColor(0, 0, 0);
                yPosition += 10;
            }

            // OBSERVAÇÕES
            if (inspecao.observacoes) {
                addSection('OBSERVAÇÕES');
                pdf.setFontSize(9);
                const obsLines = pdf.splitTextToSize(inspecao.observacoes, maxWidth - 6);
                obsLines.forEach((line: string) => {
                    pdf.text(line, marginLeft + 3, yPosition);
                    yPosition += 4;
                });
            }

            pdf.save(filename);
        } catch (error) {
            console.error('Erro ao exportar PDF:', error);
            alert('Erro ao exportar PDF!');
        }
    };

    return { exportInspecaoToPdf };
};
