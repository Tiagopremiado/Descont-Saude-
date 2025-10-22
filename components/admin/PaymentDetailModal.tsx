import React from 'react';
import type { Payment, Client } from '../../types';
import Modal from '../common/Modal';

interface PaymentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  client?: Client | null;
}

const PaymentDetailModal: React.FC<PaymentDetailModalProps> = ({ isOpen, onClose, payment, client }) => {
  if (!payment) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Detalhes do Pagamento: ${payment.month}/${payment.year}`}>
      <div className="space-y-4">
        <div>
          <h4 className="font-bold text-gray-600">Cliente</h4>
          <p>{client?.name || 'Carregando...'}</p>
        </div>
        <div>
          <h4 className="font-bold text-gray-600">Valor</h4>
          <p>R$ {payment.amount.toFixed(2)}</p>
        </div>
        <div>
          <h4 className="font-bold text-gray-600">Vencimento</h4>
          <p>{new Date(payment.dueDate).toLocaleDateString('pt-BR')}</p>
        </div>
        <div>
          <h4 className="font-bold text-gray-600">Status</h4>
          <p className="capitalize">{payment.status}</p>
        </div>
        <div className="flex justify-end pt-4">
          <button onClick={onClose} className="bg-ds-vinho text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-90">
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentDetailModal;
