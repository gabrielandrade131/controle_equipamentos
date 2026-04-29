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
            pdf.text('INSPEÇÃO DE MONTAGEM', pageWidth / 2, yPosition, { align: 'center' });
            
            pdf.setFontSize(9);
            pdf.text('FOR-MAN-006 - Rev. 5', pageWidth - marginRight - 5, yPosition, { align: 'right' });
            
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
                checkPageBreak(25);
                addSection('VERIFICAÇÕES NOS INSTRUMENTOS DE AFERIÇÃO');
                
                // Tabela com linhas
                const colWidths = [maxWidth * 0.75, maxWidth * 0.25];
                const rowHeight = 6;
                
                // Cabeçalho da tabela
                pdf.setFillColor(240, 240, 240);
                pdf.rect(marginLeft, yPosition, colWidths[0], rowHeight, 'F');
                pdf.rect(marginLeft + colWidths[0], yPosition, colWidths[1], rowHeight, 'F');
                pdf.setDrawColor(0, 0, 0);
                pdf.setFont(undefined, 'bold');
                pdf.setFontSize(8);
                pdf.text('Item', marginLeft + 2, yPosition + 4);
                pdf.text('Conformidade', marginLeft + colWidths[0] + 2, yPosition + 4);
                yPosition += rowHeight;
                
                // Linhas de dados
                pdf.setFont(undefined, 'normal');
                inspecao.instrumentosAferição.forEach((item, idx) => {
                    checkPageBreak(8);
                    const conformidade = item.conformidade || '—';
                    pdf.setDrawColor(200, 200, 200);
                    pdf.rect(marginLeft, yPosition, colWidths[0], rowHeight);
                    pdf.rect(marginLeft + colWidths[0], yPosition, colWidths[1], rowHeight);
                    
                    const itemText = pdf.splitTextToSize(item.nome, colWidths[0] - 4);
                    pdf.setFontSize(7);
                    pdf.text(itemText[0] || '', marginLeft + 2, yPosition + 3);
                    pdf.text(conformidade, marginLeft + colWidths[0] + 2, yPosition + 3);
                    yPosition += rowHeight;
                });
                yPosition += 3;
            }

            // VERIFICAÇÕES GERAIS PRÉ MONTAGEM
            if (inspecao.verificacoesGeraisPremontagem && inspecao.verificacoesGeraisPremontagem.length > 0) {
                checkPageBreak(25);
                addSection('VERIFICAÇÕES GERAIS PRÉ MONTAGEM');
                
                // Tabela com linhas
                const colWidths = [maxWidth * 0.40, maxWidth * 0.20, maxWidth * 0.20, maxWidth * 0.20];
                const rowHeight = 6;
                
                // Cabeçalho
                pdf.setFillColor(240, 240, 240);
                pdf.setDrawColor(0, 0, 0);
                pdf.rect(marginLeft, yPosition, colWidths[0], rowHeight, 'F');
                pdf.rect(marginLeft + colWidths[0], yPosition, colWidths[1], rowHeight, 'F');
                pdf.rect(marginLeft + colWidths[0] + colWidths[1], yPosition, colWidths[2], rowHeight, 'F');
                pdf.rect(marginLeft + colWidths[0] + colWidths[1] + colWidths[2], yPosition, colWidths[3], rowHeight, 'F');
                
                pdf.setFont(undefined, 'bold');
                pdf.setFontSize(7);
                pdf.text('Item', marginLeft + 2, yPosition + 3.5);
                pdf.text('Valor', marginLeft + colWidths[0] + 2, yPosition + 3.5);
                pdf.text('Instrumento', marginLeft + colWidths[0] + colWidths[1] + 2, yPosition + 3.5);
                pdf.text('Conformidade', marginLeft + colWidths[0] + colWidths[1] + colWidths[2] + 2, yPosition + 3.5);
                yPosition += rowHeight;
                
                // Dados
                pdf.setFont(undefined, 'normal');
                inspecao.verificacoesGeraisPremontagem.forEach((item) => {
                    checkPageBreak(8);
                    if (item.nome.startsWith('@SECTION:')) {
                        // Linha de seção
                        pdf.setFillColor(255, 255, 255);
                        pdf.rect(marginLeft, yPosition, maxWidth, rowHeight, 'F');
                        pdf.setDrawColor(0, 0, 0);
                        pdf.rect(marginLeft, yPosition, maxWidth, rowHeight);
                        pdf.setFont(undefined, 'bold');
                        pdf.setFontSize(8);
                        const sectionTitle = item.nome.replace('@SECTION:', '');
                        pdf.text(sectionTitle, marginLeft + 2, yPosition + 3.5);
                        yPosition += rowHeight;
                    } else {
                        // Linha de item
                        pdf.rect(marginLeft, yPosition, colWidths[0], rowHeight);
                        pdf.rect(marginLeft + colWidths[0], yPosition, colWidths[1], rowHeight);
                        pdf.rect(marginLeft + colWidths[0] + colWidths[1], yPosition, colWidths[2], rowHeight);
                        pdf.rect(marginLeft + colWidths[0] + colWidths[1] + colWidths[2], yPosition, colWidths[3], rowHeight);
                        
                        pdf.setFont(undefined, 'normal');
                        pdf.setFontSize(6);
                        const itemText = pdf.splitTextToSize(item.nome, colWidths[0] - 4);
                        pdf.text(itemText[0] || '', marginLeft + 2, yPosition + 3);
                        pdf.text(item.valorObservado || '', marginLeft + colWidths[0] + 2, yPosition + 3);
                        pdf.text(item.instrumentoMedicao || '', marginLeft + colWidths[0] + colWidths[1] + 2, yPosition + 3);
                        pdf.text(item.conformidade || '—', marginLeft + colWidths[0] + colWidths[1] + colWidths[2] + 2, yPosition + 3);
                        yPosition += rowHeight;
                    }
                });
                yPosition += 3;
            }

            // VERIFICAÇÃO PÓS MONTAGEM
            if (inspecao.verificacaoPosmontagem && inspecao.verificacaoPosmontagem.length > 0) {
                checkPageBreak(25);
                addSection('VERIFICAÇÕES GERAIS PÓS MONTAGEM');
                
                // Tabela com linhas
                const colWidths = [maxWidth * 0.40, maxWidth * 0.20, maxWidth * 0.20, maxWidth * 0.20];
                const rowHeight = 6;
                
                // Cabeçalho
                pdf.setFillColor(240, 240, 240);
                pdf.setDrawColor(0, 0, 0);
                pdf.rect(marginLeft, yPosition, colWidths[0], rowHeight, 'F');
                pdf.rect(marginLeft + colWidths[0], yPosition, colWidths[1], rowHeight, 'F');
                pdf.rect(marginLeft + colWidths[0] + colWidths[1], yPosition, colWidths[2], rowHeight, 'F');
                pdf.rect(marginLeft + colWidths[0] + colWidths[1] + colWidths[2], yPosition, colWidths[3], rowHeight, 'F');
                
                pdf.setFont(undefined, 'bold');
                pdf.setFontSize(7);
                pdf.text('Item', marginLeft + 2, yPosition + 3.5);
                pdf.text('Valor', marginLeft + colWidths[0] + 2, yPosition + 3.5);
                pdf.text('Instrumento', marginLeft + colWidths[0] + colWidths[1] + 2, yPosition + 3.5);
                pdf.text('Conformidade', marginLeft + colWidths[0] + colWidths[1] + colWidths[2] + 2, yPosition + 3.5);
                yPosition += rowHeight;
                
                // Dados
                pdf.setFont(undefined, 'normal');
                inspecao.verificacaoPosmontagem.forEach((item) => {
                    checkPageBreak(8);
                    pdf.setDrawColor(0, 0, 0);
                    pdf.rect(marginLeft, yPosition, colWidths[0], rowHeight);
                    pdf.rect(marginLeft + colWidths[0], yPosition, colWidths[1], rowHeight);
                    pdf.rect(marginLeft + colWidths[0] + colWidths[1], yPosition, colWidths[2], rowHeight);
                    pdf.rect(marginLeft + colWidths[0] + colWidths[1] + colWidths[2], yPosition, colWidths[3], rowHeight);
                    
                    pdf.setFont(undefined, 'normal');
                    pdf.setFontSize(6);
                    const itemText = pdf.splitTextToSize(item.nome, colWidths[0] - 4);
                    pdf.text(itemText[0] || '', marginLeft + 2, yPosition + 3);
                    pdf.text(item.valorObservado || '', marginLeft + colWidths[0] + 2, yPosition + 3);
                    pdf.text(item.instrumentoMedicao || '', marginLeft + colWidths[0] + colWidths[1] + 2, yPosition + 3);
                    pdf.text(item.conformidade || '—', marginLeft + colWidths[0] + colWidths[1] + colWidths[2] + 2, yPosition + 3);
                    yPosition += rowHeight;
                });
                yPosition += 3;
            }

            // RESULTADO DE INSPEÇÃO
            if (inspecao.resultadoFinal) {
                checkPageBreak(10);
                // Seção removida conforme solicitação
            }

            // ASSINATURA E APROVAÇÃO
            checkPageBreak(25);
            addSection('RESULTADO DA INSPEÇÃO');
            
            pdf.setFontSize(9);
            pdf.setFont(undefined, 'normal');
            
            // Aprovado (lado esquerdo)
            pdf.text('Aprovado:', marginLeft + 3, yPosition);
            const aprovadoText = inspecao.aprovado ? 'SIM' : 'NÃO';
            const aprovadoColor = inspecao.aprovado ? [76, 175, 80] : [244, 67, 54];
            pdf.setTextColor(aprovadoColor[0], aprovadoColor[1], aprovadoColor[2]);
            pdf.setFont(undefined, 'bold');
            pdf.text(aprovadoText, marginLeft + 26, yPosition);
            pdf.setTextColor(0, 0, 0);
            pdf.setFont(undefined, 'normal');
            
            // Assinatura (lado direito)
            const signatureX = marginLeft + 100;
            pdf.text('Assinatura:', signatureX, yPosition);
            pdf.setDrawColor(0, 0, 0);
            pdf.line(signatureX + 25, yPosition + 1, signatureX + 70, yPosition + 1);

            pdf.save(filename);
        } catch (error) {
            console.error('Erro ao exportar PDF:', error);
            alert('Erro ao exportar PDF!');
        }
    };

    return { exportInspecaoToPdf };
};
