
import React, { useState, useEffect } from 'react';
import type { Payment, Client } from '../../types';
import Modal from '../common/Modal';
import BrandLogo from '../common/BrandLogo';

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
  const [paidAmount, setPaidAmount] = useState(payment?.amount || 0);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (payment) {
      setPaidAmount(payment.amount);
      setPaymentDate(new Date().toISOString().split('T')[0]);
    }
  }, [payment]);

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
      const { jsPDF } = jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const canvas = await html2canvas(contentElement, { scale: 3, useCORS: true });
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
          alert("Seu navegador não suporta o compartilhamento de arquivos. Por favor, utilize a opção 'Baixar PDF' e envie manualmente.");
        }
      }
    } catch (error) {
      console.error('Error processing receipt:', error);
      alert('Ocorreu um erro ao processar o comprovante.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const cpfDigits = client.cpf.replace(/\D/g, '');
  const receiptId = `01-00${cpfDigits.slice(-7)}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gerar Comprovante de Pagamento">
      <div className="relative">
        {isProcessing && (
          <div className="absolute inset-0 bg-white/80 flex flex-col justify-center items-center z-20 rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ds-vinho"></div>
            <p className="mt-2 text-ds-vinho font-semibold">Processando...</p>
          </div>
        )}

        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
            <div>
                <label htmlFor="paidAmount" className="block text-sm font-medium text-gray-700">
                    Valor Pago (edite se houver juros)
                </label>
                <input
                    type="number"
                    id="paidAmount"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ds-dourado focus:border-ds-dourado"
                />
                <p className="text-xs text-gray-500 mt-1">Este valor será exibido no comprovante como "Valor Pago".</p>
            </div>
            <div>
                <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700">
                    Data do Pagamento
                </label>
                <input
                    type="date"
                    id="paymentDate"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ds-dourado focus:border-ds-dourado"
                />
            </div>
        </div>


        <div id="receipt-content" className="bg-white text-gray-800 font-sans">
          <div className="relative overflow-hidden">
            <div className="bg-ds-vinho h-64 relative px-6 pt-6">
               <div className="flex justify-between items-start relative z-10">
                  <div className="bg-white text-black text-center font-bold p-2 rounded-xl shadow-md">
                    {receiptId}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="bg-[#25D366] text-white flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm border border-white/20">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.459l-6.554 1.73zM7.51 21.683l.341-.188c1.643-.906 3.518-1.391 5.472-1.391 5.433 0 9.875-4.442 9.875-9.875 0-5.433-4.442-9.875-9.875-9.875s-9.875 4.442-9.875 9.875c0 2.12.67 4.108 1.868 5.768l-.24 1.125 1.196.241z"/></svg>
                      <span>53 9 9156 - 0861</span>
                    </div>
                     <div className="bg-[#1877F2] text-white flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm border border-white/20">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      <span>@Descontsaude</span>
                    </div>
                  </div>
                </div>
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                 <BrandLogo className="w-24 h-24 mb-2 drop-shadow-lg" />
                 <h1 className="text-white text-2xl font-bold tracking-widest text-center mt-2 border-t border-white/30 pt-2 w-full">COMPROVANTE</h1>
              </div>
            </div>

            <div className="p-6 pt-8 bg-gray-100">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20">
                  <div className="w-full h-full bg-green-500" style={{clipPath: 'polygon(100% 0, 0 0, 100% 100%)'}}></div>
                  <div className="absolute top-2 right-2 text-white font-bold text-xs transform rotate-45">PAGO</div>
                </div>
                
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Cliente</p>
                <h2 className="text-2xl font-bold text-ds-vinho border-b pb-4 mb-4">{client.name}</h2>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-bold text-lg mb-4 text-gray-800">Detalhes da Fatura</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                        <span className="text-gray-500">Descrição</span>
                        <span className="font-semibold text-gray-700">Descont' Saúde</span>
                      </div>
                       <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                        <span className="text-gray-500">Valor Original</span>
                        <span className="font-semibold text-gray-700">R$ {payment.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="font-bold text-lg text-gray-800">Valor Pago</span>
                        <span className="font-bold text-lg text-green-600">R$ {paidAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-6">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Vencimento</p>
                        <p className="font-bold text-2xl text-gray-700">{new Date(payment.dueDate).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit', year: '2-digit'})}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Data do Pagamento</p>
                        <p className="font-bold text-xl text-gray-700">{new Date(paymentDate + 'T00:00:00').toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit', year: '2-digit'})}</p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-center text-xs text-gray-400 mt-6">Autenticação Digital: {Math.random().toString(36).substr(2, 15).toUpperCase()}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-full hover:bg-gray-300">Fechar</button>
        <button type="button" onClick={() => handleAction('share')} className="bg-green-500 text-white font-bold py-2 px-4 rounded-full hover:bg-green-600">Compartilhar</button>
        <button type="button" onClick={() => handleAction('download')} className="bg-blue-500 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-600">Baixar PDF</button>
      </div>
    </Modal>
  );
};

export default PaymentReceiptModal;
