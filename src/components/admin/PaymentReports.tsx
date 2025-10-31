import React, { useState, useMemo } from 'react';
import type { Payment, Client } from '../../types';
import { updatePaymentStatus } from '../../services/apiService';
import { useData } from '../../context/DataContext';
import Card from '../common/Card';
import Spinner from '../common/Spinner';
import PaymentReceiptModal from './PaymentReceiptModal';

const PaymentReports: React.FC<{ onUpdate: () => void }> = ({ onUpdate }) => {
    const { payments, clients, isLoadingData } = useData();
    const [filterStatus, setFilterStatus] = useState<Payment['status'] | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    const clientMap = useMemo(() => {
        return clients.reduce((acc, client) => {
            acc[client.id] = client;
            return acc;
        }, {} as Record<string, Client>);
    }, [clients]);

    const filteredPayments = useMemo(() => {
        let filtered = payments;

        if (filterStatus !== 'all') {
            filtered = filtered.filter(p => p.status === filterStatus);
        }

        if (searchTerm) {
            const lowercasedSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(p => 
                clientMap[p.clientId]?.name.toLowerCase().includes(lowercasedSearch)
            );
        }
        
        return [...filtered].sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
    }, [payments, filterStatus, searchTerm, clientMap]);

    const getStatusStyles = (status: Payment['status']) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800 border-green-300';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'overdue': return 'bg-red-100 text-red-800 border-red-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };
    
    const handleStatusChange = async (paymentId: string, newStatus: Payment['status']) => {
        setIsUpdating(paymentId);
        try {
            await updatePaymentStatus(paymentId, newStatus);
            onUpdate(); // Reload data in the context
        } catch (error) {
            console.error("Failed to update payment status:", error);
            alert("Erro ao atualizar status do pagamento.");
        } finally {
            setIsUpdating(null);
        }
    };

    return (
        <>
            <Card title="Relatório de Pagamentos">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Buscar por nome do cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-1/3 p-2 border border-gray-300 rounded-lg focus:ring-ds-dourado focus:border-ds-dourado"
                    />
                    <select 
                        value={filterStatus} 
                        onChange={e => setFilterStatus(e.target.value as Payment['status'] | 'all')}
                        className="w-full sm:w-auto p-2 border border-gray-300 rounded-lg focus:ring-ds-dourado focus:border-ds-dourado"
                    >
                        <option value="all">Todos os Status</option>
                        <option value="paid">Pago</option>
                        <option value="pending">Pendente</option>
                        <option value="overdue">Vencido</option>
                    </select>
                </div>
                
                {isLoadingData ? <Spinner /> : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referência</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vencimento</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredPayments.map((payment) => (
                                    <tr key={payment.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{clientMap[payment.clientId]?.name || 'Cliente não encontrado'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.month} de {payment.year}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(payment.dueDate).toLocaleDateString('pt-BR')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">R$ {payment.amount.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {isUpdating === payment.id ? (
                                                <div className="flex justify-center items-center h-full">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-ds-vinho"></div>
                                                </div>
                                            ) : (
                                                <select 
                                                    value={payment.status}
                                                    onChange={(e) => handleStatusChange(payment.id, e.target.value as Payment['status'])}
                                                    className={`w-full p-1 border rounded-md text-xs font-semibold focus:ring-ds-dourado focus:border-ds-dourado ${getStatusStyles(payment.status)}`}
                                                    aria-label={`Status do pagamento de ${clientMap[payment.clientId]?.name}`}
                                                >
                                                    <option value="paid">Pago</option>
                                                    <option value="pending">Pendente</option>
                                                    <option value="overdue">Vencido</option>
                                                </select>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button onClick={() => setSelectedPayment(payment)} className="text-ds-vinho hover:text-ds-dourado">
                                                Gerar Comprovante
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredPayments.length === 0 && <p className="text-center text-gray-500 py-4">Nenhum pagamento encontrado.</p>}
                    </div>
                )}
            </Card>

            <PaymentReceiptModal 
                isOpen={!!selectedPayment}
                onClose={() => setSelectedPayment(null)}
                payment={selectedPayment}
                client={selectedPayment ? clientMap[selectedPayment.clientId] : undefined}
            />
        </>
    );
};

export default PaymentReports;
