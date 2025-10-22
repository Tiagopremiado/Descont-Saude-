import React, { useState, useEffect, useCallback } from 'react';
import type { Payment } from '../../types';
import { getPaymentsByClientId, generateNewInvoice } from '../../services/apiService';
import Card from '../common/Card';
import Spinner from '../common/Spinner';

interface PaymentHistoryProps {
  clientId: string;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ clientId }) => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    // FIX: Wrapped fetchPayments in useCallback to create a stable function reference,
    // which resolves the exhaustive-deps warning in the useEffect hook.
    const fetchPayments = useCallback(async () => {
        setLoading(true);
        const data = await getPaymentsByClientId(clientId);
        setPayments(data.sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()));
        setLoading(false);
    }, [clientId]);
    
    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const handleGenerateInvoice = async () => {
        setGenerating(true);
        // Generates invoice for next month for demo purposes
        const nextMonthDate = new Date();
        nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
        const month = nextMonthDate.toLocaleString('pt-BR', { month: 'long' });
        const year = nextMonthDate.getFullYear();
        await generateNewInvoice(clientId, month.charAt(0).toUpperCase() + month.slice(1), year);
        await fetchPayments(); // Refresh list
        setGenerating(false);
    }

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
        <Card title="Meu Histórico de Pagamentos">
            <div className="flex justify-end mb-4">
                <button 
                    onClick={handleGenerateInvoice}
                    disabled={generating}
                    className="bg-ds-dourado text-ds-vinho font-bold py-2 px-4 rounded-full hover:bg-opacity-90 transition-colors disabled:opacity-50"
                >
                    {generating ? 'Gerando...' : 'Solicitar 2ª Via / Boleto'}
                </button>
            </div>
            {loading ? <Spinner /> : (
                 <ul className="divide-y divide-gray-200">
                    {payments.map(payment => (
                        <li key={payment.id} className="py-4 flex items-center justify-between flex-wrap">
                            <div className="flex-grow">
                                <p className="text-sm font-medium text-ds-vinho">{payment.month} de {payment.year}</p>
                                <p className="text-sm text-gray-500">Vencimento: {new Date(payment.dueDate).toLocaleDateString('pt-BR')}</p>
                                <p className="text-lg font-bold">R$ {payment.amount.toFixed(2)}</p>
                            </div>
                             <div className="mt-2 sm:mt-0">
                                {getStatusChip(payment.status)}
                            </div>
                        </li>
                    ))}
                 </ul>
            )}
        </Card>
    );
};

export default PaymentHistory;