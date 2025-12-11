
import React, { useState, useEffect, useCallback } from 'react';
import type { Client, Payment } from '../../types';
import { getPaymentsByClientId } from '../../services/apiService';
import Card from '../common/Card';
import Spinner from '../common/Spinner';
import PixPaymentModal from './PixPaymentModal';

interface PaymentHistoryProps {
  client: Client;
}

// --- Funções para Geração do PIX (Mantidas) ---
const crc16 = (payload: string): string => {
    let crc = 0xFFFF;
    const polynomial = 0x1021;
    for (const b of payload) {
        crc ^= (b.charCodeAt(0) & 0xFF) << 8;
        for (let i = 0; i < 8; i++) {
            if ((crc & 0x8000) !== 0) {
                crc = ((crc << 1) & 0xFFFF) ^ polynomial;
            } else {
                crc <<= 1;
            }
        }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
};

const generatePixCode = (amount: number): string => {
    const pixKey = "55ba0287-58ef-4822-9a03-b775ba432555";
    const merchantName = "DESCONT SAUDE"; 
    const merchantCity = "PEDRO OSORIO"; 

    const field = (id: string, value: string) => {
        const len = String(value.length).padStart(2, '0');
        return `${id}${len}${value}`;
    };

    const merchantAccountInfo = 
        field('00', 'br.gov.bcb.pix') + 
        field('01', pixKey); 

    const payload = [
        field('00', '01'), 
        field('26', merchantAccountInfo),
        field('52', '0000'), 
        field('53', '986'), 
        field('54', amount.toFixed(2)), 
        field('58', 'BR'), 
        field('59', merchantName), 
        field('60', merchantCity), 
        field('62', field('05', '***')) 
    ].join('');
    
    const payloadWithCRC = payload + '6304'; 
    const crc = crc16(payloadWithCRC);

    return payloadWithCRC + crc;
};


const PaymentHistory: React.FC<PaymentHistoryProps> = ({ client }) => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPixModalOpen, setIsPixModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [pixCode, setPixCode] = useState<string | null>(null);

    const fetchPayments = useCallback(async () => {
        setLoading(true);
        const data = await getPaymentsByClientId(client.id);
        setPayments(data.sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()));
        setLoading(false);
    }, [client.id]);
    
    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const handleRequestBoleto = () => {
        const message = `Olá! Gostaria de solicitar a segunda via do boleto para o meu plano.\n\n*Nome:* ${client.name}\n*CPF:* ${client.cpf}`;
        const whatsappNumber = "5553991560861";
        const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handlePayWithPix = (payment: Payment) => {
        setSelectedPayment(payment);
        const code = generatePixCode(payment.amount);
        setPixCode(code);
        setIsPixModalOpen(true);
    };

    const getStatusInfo = (status: Payment['status']) => {
        const styles = {
            paid: 'bg-green-100 text-green-700 border-green-200',
            pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            overdue: 'bg-red-50 text-red-700 border-red-200'
        };
        const text = {
            paid: 'Paga',
            pending: 'Aberta',
            overdue: 'Vencida'
        }
        return { style: styles[status], label: text[status] };
    }

    return (
        <>
            <Card title="Faturas e Pagamentos">
                <div className="flex justify-end mb-6">
                    <button 
                        onClick={handleRequestBoleto}
                        className="text-sm font-medium text-ds-vinho hover:underline flex items-center gap-1"
                    >
                        Precisa de ajuda com boleto?
                    </button>
                </div>
                
                {loading ? <Spinner /> : (
                     <div className="space-y-3">
                        {payments.length === 0 ? <p className="text-center text-gray-500 py-8">Nenhuma fatura encontrada.</p> :
                        payments.map(payment => {
                            const status = getStatusInfo(payment.status);
                            const isPayable = payment.status === 'pending' || payment.status === 'overdue';
                            
                            return (
                                <div key={payment.id} className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-shadow hover:shadow-md ${status.style} bg-opacity-30`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-full ${payment.status === 'paid' ? 'bg-green-100' : 'bg-white'}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${payment.status === 'paid' ? 'text-green-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-lg">{payment.month} <span className="text-sm font-normal text-gray-500">{payment.year}</span></p>
                                            <p className="text-xs text-gray-500">Vence em {new Date(payment.dueDate).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-200">
                                        <p className="font-bold text-lg text-gray-800">R$ {payment.amount.toFixed(2)}</p>
                                        
                                        {isPayable ? (
                                            <button 
                                                onClick={() => handlePayWithPix(payment)}
                                                className="bg-ds-vinho text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors shadow-sm flex items-center gap-2"
                                            >
                                                Pagar
                                            </button>
                                        ) : (
                                            <span className="flex items-center gap-1 text-green-700 font-bold text-sm bg-green-100 px-3 py-1 rounded-full">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                Paga
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                     </div>
                )}
            </Card>
            <PixPaymentModal
                isOpen={isPixModalOpen}
                onClose={() => setIsPixModalOpen(false)}
                payment={selectedPayment}
                pixCode={pixCode}
            />
        </>
    );
};

export default PaymentHistory;
