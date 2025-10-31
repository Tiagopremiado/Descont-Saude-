import React, { useState, useEffect, useCallback } from 'react';
import type { Client, Payment } from '../../types';
import { getPaymentsByClientId } from '../../services/apiService';
import Card from '../common/Card';
import Spinner from '../common/Spinner';
import PixPaymentModal from './PixPaymentModal';

interface PaymentHistoryProps {
  client: Client;
}

// --- Funções para Geração do PIX ---

// Calcula o CRC16 para o código PIX
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

// Gera o código completo (BRCode) para o PIX Copia e Cola e QR Code
const generatePixCode = (amount: number): string => {
    const pixKey = "55ba0287-58ef-4822-9a03-b775ba432555";
    const merchantName = "DESCONT SAUDE"; // Nome que aparecerá para o cliente
    const merchantCity = "PEDRO OSORIO"; // Cidade do recebedor

    const field = (id: string, value: string) => {
        const len = String(value.length).padStart(2, '0');
        return `${id}${len}${value}`;
    };

    const merchantAccountInfo = 
        field('00', 'br.gov.bcb.pix') + // GUI Padrão
        field('01', pixKey); // Chave PIX

    const payload = [
        field('00', '01'), // Payload Format Indicator
        field('26', merchantAccountInfo),
        field('52', '0000'), // Merchant Category Code (não especificado)
        field('53', '986'), // Moeda (BRL)
        field('54', amount.toFixed(2)), // Valor da transação
        field('58', 'BR'), // País
        field('59', merchantName), // Nome do Recebedor
        field('60', merchantCity), // Cidade do Recebedor
        field('62', field('05', '***')) // ID da Transação (*** para estático)
    ].join('');
    
    const payloadWithCRC = payload + '6304'; // ID e tamanho do CRC16
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

    const getStatusChip = (status: Payment['status']) => {
        const styles = {
            paid: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            overdue: 'bg-red-100 text-red-800'
        };
        const text = {
            paid: 'Pago',
            pending: 'Pendente',
            overdue: 'Vencido'
        }
        return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>{text[status]}</span>
    }

    return (
        <>
            <Card title="Meu Histórico de Pagamentos">
                <div className="flex justify-end mb-4">
                    <button 
                        onClick={handleRequestBoleto}
                        className="bg-ds-dourado text-ds-vinho font-bold py-2 px-4 rounded-full hover:bg-opacity-90 transition-colors"
                    >
                        Solicitar Boleto por WhatsApp
                    </button>
                </div>
                {loading ? <Spinner /> : (
                     <ul className="divide-y divide-gray-200">
                        {payments.map(payment => (
                            <li key={payment.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex-grow">
                                    <p className="text-sm font-medium text-ds-vinho">{payment.month} de {payment.year}</p>
                                    <p className="text-sm text-gray-500">Vencimento: {new Date(payment.dueDate).toLocaleDateString('pt-BR')}</p>
                                    <p className="text-lg font-bold">R$ {payment.amount.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-4 mt-2 sm:mt-0">
                                    {getStatusChip(payment.status)}
                                    {(payment.status === 'pending' || payment.status === 'overdue') && (
                                        <button 
                                            onClick={() => handlePayWithPix(payment)}
                                            className="bg-cyan-500 text-white text-xs font-bold py-1 px-3 rounded-full hover:bg-cyan-600 transition-colors"
                                        >
                                            Pagar com PIX
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                     </ul>
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