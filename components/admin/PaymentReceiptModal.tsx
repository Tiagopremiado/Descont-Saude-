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
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !payment || !client) return null;

  const handleDownload = async () => {
    setIsDownloading(true);
    const contentElement = document.querySelector('.printable-receipt-content');
    if (!contentElement) {
        console.error("Receipt element not found!");
        alert("Não foi possível encontrar o conteúdo do recibo para gerar o PDF.");
        setIsDownloading(false);
        return;
    }

    try {
        const canvas = await html2canvas(contentElement as HTMLElement, { scale: 2 });
        const imgData = canvas.toDataURL('image/jpeg', 0.9);
        const { jsPDF } = jspdf;
        
        const pdfWidth = 80; // Standard thermal receipt width in mm
        const canvasAspectRatio = canvas.height / canvas.width;
        const pdfHeight = pdfWidth * canvasAspectRatio;

        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: [pdfWidth, pdfHeight]
        });
        
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Recibo-${client.name.replace(/\s/g, '_')}-${payment.month}-${payment.year}.pdf`);

    } catch (error) {
        console.error('Error generating receipt PDF:', error);
        alert('Ocorreu um erro ao gerar o PDF do recibo.');
    } finally {
        setIsDownloading(false);
    }
  };

  const statusText: Record<Payment['status'], string> = {
    paid: 'PAGO',
    pending: 'PENDENTE',
    overdue: 'VENCIDO'
  }

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-area, .printable-area * {
            visibility: visible;
          }
          .printable-area {
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
      <Modal isOpen={isOpen} onClose={onClose} title="Comprovante de Pagamento">
        <div className="printable-area">
            <div className="font-mono text-sm text-gray-800 p-6 border-2 border-dashed border-gray-400 bg-gray-50 printable-receipt-content">
                <div className="text-center mb-4">
                    <h3 className="font-bold text-xl">Descont'Saúde</h3>
                    <p className="text-xs">FRANQUIA AUTORIZADA - CNPJ 09.371.421/0001-01</p>
                    <p className="text-xs">PEDRO OSÓRIO / RS</p>
                </div>
                
                <hr className="my-3 border-dashed border-gray-400" />
                
                <div className="text-center">
                    <h4 className="font-bold text-lg uppercase tracking-wider">Recibo de Pagamento</h4>
                    <p className="text-xs">ID da Transação: {payment.id}</p>
                </div>

                <hr className="my-3 border-dashed border-gray-400" />
                
                <div className="space-y-1">
                    <p><strong>DATA DE EMISSÃO:</strong> {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                    <p><strong>RECEBEMOS DE:</strong> {client.name}</p>
                    <p><strong>CPF:</strong> {client.cpf}</p>
                </div>
                
                <hr className="my-3 border-dashed border-gray-400" />

                <div className="space-y-1">
                    <p><strong>REFERENTE A:</strong> Mensalidade {payment.month} de {payment.year}</p>
                    <p><strong>VENCIMENTO ORIGINAL:</strong> {new Date(payment.dueDate).toLocaleDateString('pt-BR')}</p>
                </div>
                
                <hr className="my-3 border-dashed border-gray-400" />

                <div className="text-right mt-4">
                    <p className="text-lg">VALOR TOTAL:</p>
                    <p className="font-bold text-2xl">R$ {payment.amount.toFixed(2)}</p>
                    <p className="font-bold text-lg text-green-600 mt-1">{statusText[payment.status]}</p>
                </div>

                <hr className="my-3 border-dashed border-gray-400" />
                
                <p className="text-center text-xs mt-4">-- OBRIGADO PELA PREFERÊNCIA --</p>
            </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 no-print">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-full hover:bg-gray-300">Fechar</button>
            <button 
                type="button" 
                onClick={handleDownload} 
                disabled={isDownloading}
                className="bg-ds-vinho text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-90 disabled:opacity-50"
            >
                {isDownloading ? 'Baixando...' : 'Baixar Recibo'}
            </button>
        </div>
      </Modal>
    </>
  );
};

export default PaymentReceiptModal;