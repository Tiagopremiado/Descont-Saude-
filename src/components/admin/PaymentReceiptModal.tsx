import React, { useState } from 'react';
import type { Payment, Client } from '../../types';
import Modal from '../common/Modal';

declare const html2canvas: any;
declare const jspdf: any;

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  client?: Client;
}

const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({ isOpen, onClose, payment, client }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !payment || !client) return null;

  const handleAction = async (action: 'download' | 'share') => {
    setIsProcessing(true);
    const contentElement = document.getElementById('receipt-content');
    if (!contentElement) {
      alert("Erro: Não foi possível encontrar o conteúdo do comprovante.");
      setIsProcessing(false);
      return;
    }

    try {
      const canvas = await html2canvas(contentElement, { scale: 3, useCORS: true });
      const { jsPDF } = jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      if (action === 'download') {
        pdf.save(`Comprovante-${client.name.replace(/\s/g, '_')}.pdf`);
      } else if (action === 'share') {
        const pdfBlob = pdf.output('blob');
        const file = new File([pdfBlob], `Comprovante-${client.name.replace(/\s/g, '_')}.pdf`, { type: 'application/pdf' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Comprovante Descont'Saúde - ${client.name}`,
            text: `Olá! Segue o seu comprovante de pagamento da Descont'Saúde.`,
            files: [file],
          });
        } else {
          alert("Seu navegador não suporta o compartilhamento de arquivos. Por favor, utilize a opção de download.");
        }
      }
    } catch (error) {
      console.error('Error processing receipt:', error);
      alert('Ocorreu um erro ao processar o comprovante.');
    } finally {
      setIsProcessing(false);
    }
  };

  const dueDate = new Date(payment.dueDate);
  const paymentPeriodStart = new Date(dueDate);
  paymentPeriodStart.setMonth(paymentPeriodStart.getMonth() -1);
  paymentPeriodStart.setDate(paymentPeriodStart.getDate() + 1);


  const paymentPeriodEnd = new Date(dueDate);
  
  const receiptId = `01-0${client.contractNumber.slice(-8)}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gerar Comprovante de Pagamento">
      <div className="relative">
        {isProcessing && (
          <div className="absolute inset-0 bg-white/80 flex flex-col justify-center items-center z-20 rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ds-vinho"></div>
            <p className="mt-2 text-ds-vinho font-semibold">Processando...</p>
          </div>
        )}

        <div id="receipt-content" className="bg-white text-gray-800 font-sans">
          <div className="relative overflow-hidden">
            <div className="bg-ds-vinho h-48 relative" style={{ clipPath: 'ellipse(100% 70% at 50% 30%)' }}>
              <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start text-white">
                <div className="bg-white text-black text-center font-bold p-2 rounded-xl shadow-md">
                  {receiptId}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="bg-[#25D366] text-white flex items-center gap-2 px-3 py-1.5 rounded-full text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.459l-6.554 1.73zM7.51 21.683l.341-.188c1.643-.906 3.518-1.391 5.472-1.391 5.433 0 9.875-4.442 9.875-9.875 0-5.433-4.442-9.875-9.875-9.875s-9.875 4.442-9.875 9.875c0 2.12.67 4.108 1.868 5.768l-.24 1.125 1.196.241z"/></svg>
                    <span>53 9 9156 - 0861</span>
                  </div>
                   <div className="bg-[#1877F2] text-white flex items-center gap-2 px-3 py-1.5 rounded-full text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    <span>@Descontsaude</span>
                  </div>
                </div>
              </div>
              <h1 className="absolute top-16 left-1/2 -translate-x-1/2 text-white text-3xl font-bold tracking-wider">COMPROVANTE DE PAGAMENTO</h1>
              <div className="absolute top-28 left-1/2 -translate-x-1/2">
                <svg viewBox="0 0 100 100" className="w-20 h-20 opacity-80">
                    <g>
                        <path d="M50 20 L80 50 L50 80 L20 50 Z" fill="#D0AB6A"/>
                        <path d="M42 30 H58 V43 H70 V57 H58 V70 H42 V57 H30 V43 H42Z" fill="#750721"/>
                    </g>
                </svg>
              </div>
            </div>

            <div className="p-6 -mt-10 relative">
              <div className="bg-gray-50/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg relative overflow-hidden border">
                <div className="absolute -top-16 -right-16 text-center transform rotate-45 bg-green-500 text-white font-bold uppercase text-lg px-8 py-2 shadow-lg w-60">
                    Pago
                </div>
                
                <p className="text-sm text-gray-500">CLIENTE</p>
                <h2 className="text-2xl font-bold text-gray-800">{client.name}</h2>

                <div className="mt-8 grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-bold text-lg mb-4 text-gray-700">Detalhes da Fatura</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-gray-600">Descrição</span>
                        <span className="font-semibold">Descont' Saúde</span>
                      </div>
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-semibold">R$ {payment.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-gray-600">Desconto</span>
                        <span className="font-semibold text-gray-400">R$ 0,00</span>
                      </div>
                       <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-gray-600">Multas</span>
                        <span className="font-semibold text-gray-400">R$ 0,00</span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="font-bold text-lg">Total</span>
                        <span className="font-bold text-lg text-ds-vinho">R$ {payment.amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600">Vencimento</p>
                    <p className="font-bold text-3xl text-gray-800">{new Date(payment.dueDate).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <div className="border-t-2 border-dotted border-gray-400 my-6"></div>
                <h3 className="font-bold text-ds-vinho mb-4 text-lg">3. RECIBO DE PAGAMENTO</h3>
                <div className="text-sm space-y-2">
                    <p><strong>Recebemos de:</strong> {client.name}</p>
                    <p><strong>Referente ao pagamento de:</strong> {paymentPeriodStart.toLocaleDateString('pt-BR')} a {paymentPeriodEnd.toLocaleDateString('pt-BR')}</p>
                    <p><strong>Recebido pela:</strong> <span className="font-serif italic text-ds-vinho text-lg">Descont'Saúde</span></p>
                    <p><strong>Forma de pagamento:</strong> BOLETO BANCÁRIO / PIX</p>
                </div>
                <div className="border-b-2 border-ds-vinho mt-6 w-1/3"></div>
                 <p className="mt-6 font-semibold">Descont' Saúde - Pedro Osório</p>
              </div>
            </div>
          </div>
          <footer className="bg-ds-vinho text-white text-center text-xs py-3">
             PEDRO OSÓRIO, RS • CNPJ 09.371.421/0001-01
          </footer>
        </div>
      </div>
      <div className="flex justify-end space-x-3 pt-4 no-print">
        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-full hover:bg-gray-300">Fechar</button>
        <button type="button" onClick={() => handleAction('share')} className="bg-green-500 text-white font-bold py-2 px-4 rounded-full hover:bg-green-600">Compartilhar</button>
        <button type="button" onClick={() => handleAction('download')} className="bg-blue-500 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-600">Baixar PDF</button>
      </div>
    </Modal>
  );
};

export default PaymentReceiptModal;
