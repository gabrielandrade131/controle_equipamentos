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

            // Adicionar logo
            if (logoPath) {
                try {
                    const response = await fetch(logoPath);
                    const blob = await response.blob();
                    const reader = new FileReader();
                    
                    await new Promise((resolve) => {
                        reader.onload = () => {
                            const logoData = reader.result as string;
                            pdf.addImage(logoData, 'PNG', marginLeft, yPosition - 8, 18, 18);
                            resolve(null);
                        };
                        reader.readAsDataURL(blob);
                    });
                } catch (err) {
                    console.warn('Erro ao carregar logo:', err);
                }
            }

            // Cabeçalho
            pdf.setFontSize(14);
            pdf.text('ORDEM DE PRODUÇÃO', pageWidth / 2 + 5, yPosition, { align: 'center' });
            
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
                yPosition += 10;
            };

            const addField = (label: string, value: string) => {
                pdf.setFontSize(9);
                const labelWidth = maxWidth * 0.35;
                const valueX = marginLeft + labelWidth;
                
                pdf.text(label + ':', marginLeft + 3, yPosition);
                
                const valueLines = pdf.splitTextToSize(value, maxWidth * 0.6);
                pdf.text(valueLines, valueX, yPosition);
                
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

            // Documentos Relacionados
            addSection('DOCUMENTOS RELACIONADOS');
            pdf.setFontSize(9);
            
            if (producao.listaPecas) {
                const listaLines = pdf.splitTextToSize('✓ Lista de Peças - DM-' + producao.modelo, maxWidth - 6);
                pdf.text(listaLines, marginLeft + 3, yPosition);
                yPosition += listaLines.length * 5;
            }
            if (producao.sequencialMontagem) {
                const seqLines = pdf.splitTextToSize('✓ Sequencial de Montagem - ' + producao.modelo.substring(0, 8), maxWidth - 6);
                pdf.text(seqLines, marginLeft + 3, yPosition);
                yPosition += seqLines.length * 5;
            }
            if (producao.inspecaoMontagem) {
                const inspLines = pdf.splitTextToSize('✓ Inspeção de Montagem - FOR-MAN-006 (x) FOR-MAN-057 ( )', maxWidth - 6);
                pdf.text(inspLines, marginLeft + 3, yPosition);
                yPosition += inspLines.length * 5;
            }
            if (producao.historicoEquipamento) {
                const histLines = pdf.splitTextToSize('✓ Histórico do Equipamento - FOR-MAN-008', maxWidth - 6);
                pdf.text(histLines, marginLeft + 3, yPosition);
                yPosition += histLines.length * 5;
            }

            yPosition += 5;
            pdf.line(marginLeft, yPosition, pageWidth - marginRight, yPosition);
            yPosition += 10;

            // Assinaturas
            addSection('RECEBIMENTO DA ORDEM');
            yPosition += 25;
            
            const signatureY = yPosition;
            const col1 = marginLeft + 15;
            const col2 = pageWidth / 2;
            const col3 = pageWidth - marginRight - 15;
            
            pdf.line(col1 - 15, signatureY, col1 + 15, signatureY);
            pdf.line(col2 - 15, signatureY, col2 + 15, signatureY);
            pdf.line(col3 - 15, signatureY, col3 + 15, signatureY);
            
            yPosition = signatureY + 6;
            pdf.setFontSize(8);
            pdf.text('Nome', col1, yPosition, { align: 'center' });
            pdf.text('Data', col2, yPosition, { align: 'center' });
            pdf.text('Assinatura', col3, yPosition, { align: 'center' });

            pdf.save(filename);
        } catch (error) {
            console.error('Erro ao exportar PDF:', error);
            alert('Erro ao exportar PDF!');
        }
    };

    return { exportToPdf, exportOrdemProducaoToPdf };
};
