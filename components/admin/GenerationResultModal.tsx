import React, { useState } from 'react';
import type { Client } from '../../types';
import Modal from '../common/Modal';
import ContractView from './ContractView';
import IdCardView from './IdCardView';

declare const html2canvas: any;
declare const jspdf: any;

interface GenerationResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}

type ActiveTab = 'contract' | 'cards';

const GenerationResultModal: React.FC<GenerationResultModalProps> = ({ isOpen, onClose, client }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('contract');
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  if (!client) return null;

  const generatePdf = async () => {
    const page1Element = document.getElementById('pdf-page-1');
    const page2Element = document.getElementById('pdf-page-2');

    if (!page1Element || !page2Element) {
        console.error("Um ou ambos os elementos da página do contrato não foram encontrados.");
        alert("Não foi possível encontrar o conteúdo do contrato para gerar o PDF.");
        return null;
    }

    try {
        const { jsPDF } = jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const canvasOptions = { scale: 2, useCORS: true };

        const addPageToPdf = async (element: HTMLElement, pdfInstance: any) => {
            const canvas = await html2canvas(element, canvasOptions);
            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = pdfInstance.internal.pageSize.getWidth();
            const pdfHeight = pdfInstance.internal.pageSize.getHeight();
            
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            
            let imgWidth = pdfWidth;
            let imgHeight = imgWidth / ratio;

            // Se a imagem for muito alta, ajusta pela altura (embora isso não deva acontecer aqui)
            if (imgHeight > pdfHeight) {
                imgHeight = pdfHeight;
                imgWidth = imgHeight * ratio;
            }

            const xOffset = (pdfWidth - imgWidth) / 2;
            const yOffset = 0; // Alinhar ao topo

            pdfInstance.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
        };
        
        // Processa a Página 1
        await addPageToPdf(page1Element, pdf);
        
        // Processa a Página 2
        pdf.addPage();
        await addPageToPdf(page2Element, pdf);
        
        return pdf;

    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        alert('Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.');
        return null;
    }
  };


  const handleShare = async () => {
    if (!client || activeTab !== 'contract') return;
    setIsSharing(true);

    const pdf = await generatePdf();
    if (!pdf) {
        setIsSharing(false);
        return;
    }

    try {
        const pdfBlob = pdf.output('blob');
        const pdfFile = new File([pdfBlob], `Contrato-${client.name.replace(/\s/g, '_')}.pdf`, { type: 'application/pdf' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
            await navigator.share({
                title: `Contrato Descont'Saúde - ${client.name}`,
                text: `Olá! Segue o seu contrato da Descont'Saúde.`,
                files: [pdfFile]
            });
        } else {
            alert("Seu navegador não suporta o compartilhamento de arquivos. Por favor, utilize a opção 'Baixar Contrato' e envie manualmente.");
        }

    } catch (error) {
        console.error('Error sharing PDF:', error);
        alert('Ocorreu um erro ao compartilhar o PDF.');
    } finally {
        setIsSharing(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!client || activeTab !== 'contract') return;
    setIsDownloading(true);

    const pdf = await generatePdf();
    if (pdf) {
        pdf.save(`Contrato-${client.name.replace(/\s/g, '_')}.pdf`);
    }
    
    setIsDownloading(false);
  };

  const TabButton: React.FC<{tab: ActiveTab, label: string}> = ({ tab, label }) => (
    <button
       onClick={() => setActiveTab(tab)}
       className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 ${
           activeTab === tab 
           ? 'bg-gray-200 text-ds-vinho border-b-2 border-ds-vinho' 
           : 'text-gray-600 hover:bg-gray-100'
       }`}
   >
       {label}
   </button>
  );

  const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.459l-6.554 1.73zM7.51 21.683l.341-.188c1.643-.906 3.518-1.391 5.472-1.391 5.433 0 9.875-4.442 9.875-9.875 0-5.433-4.442-9.875-9.875-9.875s-9.875 4.442-9.875 9.875c0 2.12.67 4.108 1.868 5.768l-.24 1.125 1.196.241zM12 6.422c.433 0 .78.347.78.78s-.347.78-.78.78a.78.78 0 010-1.56zm-.001 4.29c.433 0 .78.347.78.78s-.347.78-.78.78a.78.78 0 010-1.56zm0 2.894c.433 0 .78.347.78.78s-.347.78-.78.78a.78.78 0 010-1.56z"/>
    </svg>
  );
  
  const baseCardNumber = "528753";

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-area .A4-page, .printable-area .A4-page * {
            visibility: visible;
          }
          .printable-area .A4-page {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center ${isOpen ? '' : 'hidden'}`}
        onClick={onClose}
        aria-modal="true"
        role="dialog"
      >
        <div 
          className="bg-white rounded-xl shadow-2xl w-full max-w-4xl m-4 flex flex-col h-[90vh]"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-200 no-print">
            <h3 className="text-xl font-bold text-ds-vinho">Documentos Gerados</h3>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600"
              aria-label="Fechar modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="border-b border-gray-200 no-print">
            <nav className="-mb-px flex space-x-4 px-6">
                <TabButton tab="contract" label="Contrato" />
                <TabButton tab="cards" label="Cartões Digitais" />
            </nav>
          </div>
          <div className="p-2 sm:p-6 bg-gray-200 overflow-y-auto flex-grow printable-area">
             {activeTab === 'contract' && <ContractView client={client} />}
             {activeTab === 'cards' && (
                <div className="space-y-8">
                    <IdCardView name={client.name} role="TITULAR" cardNumber={baseCardNumber} />
                    {client.dependents.map((dep) => (
                        <IdCardView 
                            key={dep.id} 
                            name={dep.name} 
                            role="DEPENDENTE" 
                            cardNumber={baseCardNumber} 
                            holderName={client.name}
                        />
                    ))}
                </div>
             )}
          </div>
           <div className="flex justify-end items-center gap-3 p-4 border-t no-print">
                <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-full hover:bg-gray-300">Fechar</button>
                
                {activeTab === 'contract' && (
                  <>
                    <button 
                      type="button" 
                      onClick={handleShare}
                      disabled={isSharing}
                      className="bg-green-500 text-white font-bold py-2 px-4 rounded-full hover:bg-green-600 flex items-center gap-2 disabled:opacity-50"
                    >
                        <WhatsAppIcon /> 
                        {isSharing ? 'Gerando...' : 'Compartilhar'}
                    </button>
                    <button 
                      type="button" 
                      onClick={handleDownloadPdf} 
                      disabled={isDownloading}
                      className="bg-ds-vinho text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-90 disabled:opacity-50"
                    >
                      {isDownloading ? 'Baixando...' : 'Baixar Contrato'}
                    </button>
                  </>
                )}
                {activeTab === 'cards' && (
                    <button type="button" onClick={() => window.print()} className="bg-ds-vinho text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-90">Imprimir Cartões</button>
                )}
            </div>
        </div>
      </div>
    </>
  );
};

export default GenerationResultModal;
