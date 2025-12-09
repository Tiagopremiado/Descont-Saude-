import React, { useState } from 'react';
import type { Payment } from '../../types';
import Modal from '../common/Modal';

interface PixPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    payment: Payment | null;
    pixCode: string | null;
}

const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.459l-6.554 1.73zM7.51 21.683l.341-.188c1.643-.906 3.518-1.391 5.472-1.391 5.433 0 9.875-4.442 9.875-9.875 0-5.433-4.442-9.875-9.875-9.875s-9.875 4.442-9.875 9.875c0 2.12.67 4.108 1.868 5.768l-.24 1.125 1.196.241z"/>
    </svg>
);

const PixPaymentModal: React.FC<PixPaymentModalProps> = ({ isOpen, onClose, payment, pixCode }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (pixCode) {
            navigator.clipboard.writeText(pixCode).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        }
    };

    const handleSendProof = () => {
        if (!payment) return;
        const message = `Olá! Realizei o pagamento via PIX.\n\nReferência: ${payment.month}/${payment.year}\nValor: R$ ${payment.amount.toFixed(2)}\n\nSegue o comprovante em anexo.`;
        const whatsappNumber = "5553991560861";
        const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    if (!payment || !pixCode) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Pagamento com PIX">
            <div className="text-center space-y-6">
                
                {/* Instructions */}
                <p className="text-gray-600">Para pagar, escaneie o código QR abaixo ou use o "Pix Copia e Cola" no app do seu banco.</p>
                
                {/* QR Code */}
                <div className="p-4 bg-white border-2 border-gray-200 rounded-xl inline-block shadow-sm">
                    <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=192x192&data=${encodeURIComponent(pixCode)}`} 
                        alt="PIX QR Code" 
                        className="w-48 h-48 mx-auto"
                    />
                </div>

                {/* Value */}
                <div>
                    <p className="text-sm text-gray-500 uppercase font-semibold">Valor a Pagar</p>
                    <p className="text-4xl font-bold text-ds-vinho">R$ {payment.amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Referente a {payment.month} de {payment.year}</p>
                </div>
                
                {/* Copia e Cola */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-left">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Código PIX Copia e Cola</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            readOnly
                            value={pixCode || ''}
                            className="flex-1 text-xs text-gray-600 bg-white border border-gray-300 rounded p-2 focus:outline-none"
                        />
                        <button
                            onClick={handleCopy}
                            className={`px-4 py-2 rounded text-sm font-bold transition-colors ${
                                copied 
                                ? 'bg-green-500 text-white' 
                                : 'bg-ds-vinho text-white hover:bg-opacity-90'
                            }`}
                        >
                            {copied ? 'Copiado!' : 'Copiar'}
                        </button>
                    </div>
                </div>
                
                {/* ALERT SECTION */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg text-left shadow-sm">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-3 w-full">
                            <h3 className="text-sm font-bold text-blue-800">Confirmação de Pagamento</h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <p>Após realizar o pagamento, é <strong>obrigatório enviar o comprovante</strong> para darmos baixa no sistema.</p>
                            </div>
                            <div className="mt-3">
                                <button 
                                    type="button" 
                                    onClick={handleSendProof}
                                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent font-bold rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 text-sm shadow-sm transition-colors"
                                >
                                    <WhatsAppIcon />
                                    Enviar Comprovante no WhatsApp
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </Modal>
    );
};
export default PixPaymentModal;