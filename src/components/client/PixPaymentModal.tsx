import React, { useState } from 'react';
import type { Payment } from '../../types';
import Modal from '../common/Modal';

interface PixPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    payment: Payment | null;
    pixCode: string | null;
}

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

    if (!payment) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Pagamento com PIX">
            <div className="text-center">
                <p className="text-gray-600 mb-4">Para pagar, escaneie o código QR abaixo com o app do seu banco ou use o PIX Copia e Cola.</p>
                
                <div className="p-4 bg-gray-100 rounded-lg inline-block">
                    {/* Placeholder for QR Code */}
                    <svg viewBox="0 0 100 100" className="w-48 h-48 mx-auto bg-white p-1 border rounded-md">
                        <rect x="20" y="20" width="15" height="15" />
                        <rect x="25" y="25" width="5" height="5" fill="white" />
                        <rect x="65" y="20" width="15" height="15" />
                        <rect x="70" y="25" width="5" height="5" fill="white" />
                        <rect x="20" y="65" width="15" height="15" />
                        <rect x="25" y="70" width="5" height="5" fill="white" />
                        <rect x="40" y="40" width="20" height="20" />
                        <path d="M40 20 h5 v5 h-5z M50 20 h5 v5 h-5z M40 65 h5 v5 h-5z M65 40 h5 v5 h-5z M75 60 h5 v5 h-5z M55 55 h10 v10 h-10z M20 40 h10 v10 h-10z M40 75 h10 v10 h-10z" />
                    </svg>
                </div>

                <div className="mt-4">
                    <p className="text-sm font-semibold">Valor a Pagar</p>
                    <p className="text-3xl font-bold text-ds-vinho">R$ {payment.amount.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Referente a {payment.month} de {payment.year}</p>
                </div>
                
                <div className="mt-6">
                    <label className="text-sm font-medium text-gray-700">PIX Copia e Cola</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                        <input
                            type="text"
                            readOnly
                            value={pixCode || ''}
                            className="flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 bg-gray-50 p-2"
                        />
                        <button
                            onClick={handleCopy}
                            className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-200"
                        >
                            {copied ? 'Copiado!' : 'Copiar'}
                        </button>
                    </div>
                </div>
                
                <div className="mt-6 text-xs text-gray-500 bg-yellow-50 p-3 rounded-lg">
                    <p>Após o pagamento, a confirmação pode levar alguns minutos. Você pode fechar esta janela. O status será atualizado automaticamente.</p>
                </div>
            </div>
        </Modal>
    );
};
export default PixPaymentModal;
