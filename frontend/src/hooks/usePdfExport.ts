import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Producao } from '../types/producao';

export const usePdfExport = () => {
    const exportToPdf =  async (elementId: string, filename: string) => {
        try {
            const element = document.getElementById(elementId);
            if(!element) {
                console.error('Elemento não encontrado:');
                return;
            }
        //converte HTML para imagem
            const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');

        //cria PDF
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(filename);
        }   catch (error) {
            console.error('Erro ao exportar PDF:', error);
            }
    };

    const exportOrdemProducaoToPdf = async (producao: Producao, filename: string, logoPath?: string) => {
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
            pdf.text('ORDEM DE PRODUÇÃO', pageWidth / 2, yPosition, { align: 'center' });
            
            pdf.setFontSize(9);
            pdf.text('FOR-MAN-007 - Rev. 4', pageWidth - marginRight - 5, yPosition, { align: 'right' });
            
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
                yPosition += 14;
            };

            const addField = (label: string, value: string | number) => {
                pdf.setFontSize(9);
                const labelWidth = maxWidth * 0.35;
                const valueX = marginLeft + labelWidth;
                
                pdf.text(label + ':', marginLeft + 3, yPosition);
                pdf.text(String(value), valueX, yPosition);
                
                yPosition += 6;
            };

            // Dados básicos
            addSection('DADOS DA ORDEM');
            addField('Número da Ordem', producao.numeroOrdem);
            addField('Número da Série', producao.numeroSerie);
            addField('Data Solicitação', producao.dataSolicitacao);
            addField('Modelo', producao.modelo);
            yPosition += 1;

            // Descrição
            addSection('DESCRIÇÃO');
            pdf.setFontSize(9);
            const descricaoLines = pdf.splitTextToSize(producao.descricao, maxWidth - 6);
            pdf.text(descricaoLines, marginLeft + 3, yPosition);
            yPosition += descricaoLines.length * 5 + 5;

            // Itens Serializados
            if (producao.itensSeriados && producao.itensSeriados.length > 0) {
                addSection('ITENS SERIALIZADOS');
                
                producao.itensSeriados.forEach((item) => {
                    const itemDescLines = pdf.splitTextToSize(item.descricao, maxWidth - 4);
                    
                    pdf.setFontSize(8);
                    itemDescLines.forEach((line: string) => {
                        pdf.text('• ' + line, marginLeft + 5, yPosition);
                        yPosition += 3.5;
                    });
                    yPosition += 1;
                });
                yPosition += 2;
            }

            // DOCUMENTOS RELACIONADOS - Seção consolidada
            if (producao.listaPecas || producao.sequencialMontagem || producao.inspecaoMontagem || producao.historicoEquipamento || producao.procedimentoTestes) {
                addSection('DOCUMENTOS RELACIONADOS');

                // Lista de Peças
                if (producao.listaPecas) {
                    pdf.setFontSize(9);
                    pdf.setFont(undefined, 'bold');
                    pdf.text('Lista de Peças:', marginLeft + 3, yPosition);
                    yPosition += 4;
                    pdf.setFont(undefined, 'normal');
                    
                    const listaPecasLines = pdf.splitTextToSize(producao.listaPecas, maxWidth - 6);
                    listaPecasLines.forEach((line: string) => {
                        pdf.text(line, marginLeft + 5, yPosition);
                        yPosition += 3.5;
                    });
                    yPosition += 2;
                }

                // Sequencial de Montagem
                if (producao.sequencialMontagem) {
                    pdf.setFontSize(9);
                    pdf.setFont(undefined, 'bold');
                    pdf.text('Sequencial de Montagem:', marginLeft + 3, yPosition);
                    yPosition += 4;
                    pdf.setFont(undefined, 'normal');
                    
                    const seqLines = pdf.splitTextToSize(producao.sequencialMontagem, maxWidth - 6);
                    seqLines.forEach((line: string) => {
                        pdf.text(line, marginLeft + 5, yPosition);
                        yPosition += 3.5;
                    });
                    yPosition += 2;
                }

                // Inspeção de Montagem
                if (producao.inspecaoMontagem) {
                    pdf.setFontSize(9);
                    pdf.setFont(undefined, 'bold');
                    pdf.text('Inspeção de Montagem:', marginLeft + 3, yPosition);
                    yPosition += 4;
                    pdf.setFont(undefined, 'normal');
                    
                    const inspecaoLines = pdf.splitTextToSize(producao.inspecaoMontagem, maxWidth - 6);
                    inspecaoLines.forEach((line: string) => {
                        pdf.text(line, marginLeft + 5, yPosition);
                        yPosition += 3.5;
                    });
                    yPosition += 2;
                }

                // Histórico do Equipamento
                if (producao.historicoEquipamento) {
                    pdf.setFontSize(9);
                    pdf.setFont(undefined, 'bold');
                    pdf.text('Histórico do Equipamento:', marginLeft + 3, yPosition);
                    yPosition += 4;
                    pdf.setFont(undefined, 'normal');
                    
                    const historicooLines = pdf.splitTextToSize(producao.historicoEquipamento, maxWidth - 6);
                    historicooLines.forEach((line: string) => {
                        pdf.text(line, marginLeft + 5, yPosition);
                        yPosition += 3.5;
                    });
                    yPosition += 2;
                }

                // Procedimento para Testes e Inspeção de Montagem
                if (producao.procedimentoTestes) {
                    pdf.setFontSize(9);
                    pdf.setFont(undefined, 'bold');
                    pdf.text('Procedimento para Testes e Inspeção de Montagem:', marginLeft + 3, yPosition);
                    yPosition += 4;
                    pdf.setFont(undefined, 'normal');
                    pdf.text('Código: ' + producao.procedimentoTestes, marginLeft + 5, yPosition);
                    yPosition += 4;
                }
            }

            // Observações
            if (producao.observacoes) {
                addSection('OBSERVAÇÕES');
                pdf.setFontSize(9);
                
                const obsLines = pdf.splitTextToSize(producao.observacoes, maxWidth - 6);
                obsLines.forEach((line: string) => {
                    pdf.text(line, marginLeft + 3, yPosition);
                    yPosition += 4;
                });
            }

            // Assinaturas
            yPosition += 10;
            addSection('RECEBIMENTO DA ORDEM');
            yPosition += 25;
            
            const signatureY = yPosition;
            const signatureAreaWidth = maxWidth; // Respeita margens
            const signatureColWidth = signatureAreaWidth / 3;
            const signatureCol1 = marginLeft + signatureColWidth / 2;
            const signatureCol2 = marginLeft + signatureColWidth + signatureColWidth / 2;
            const signatureCol3 = marginLeft + 2 * signatureColWidth + signatureColWidth / 2;
            const lineLength = signatureColWidth * 0.6; // Linha ocupa 60% da coluna
            
            pdf.line(signatureCol1 - lineLength / 2, signatureY, signatureCol1 + lineLength / 2, signatureY);
            pdf.line(signatureCol2 - lineLength / 2, signatureY, signatureCol2 + lineLength / 2, signatureY);
            pdf.line(signatureCol3 - lineLength / 2, signatureY, signatureCol3 + lineLength / 2, signatureY);
            
            yPosition = signatureY + 6;
            pdf.setFontSize(8);
            pdf.text('Nome', signatureCol1, yPosition, { align: 'center' });
            pdf.text('Data', signatureCol2, yPosition, { align: 'center' });
            pdf.text('Assinatura', signatureCol3, yPosition, { align: 'center' });

            pdf.save(filename);
        } catch (error) {
            console.error('Erro ao exportar PDF:', error);
            alert('Erro ao exportar PDF!');
        }
    };

    return { exportToPdf, exportOrdemProducaoToPdf };
};
