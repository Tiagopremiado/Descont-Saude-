import React, { useState, useEffect, useMemo } from 'react';
import type { Payment, Client } from '../../types';
import { getAllPayments, getClients } from '../../services/apiService';
import Card from '../common/Card';
import Spinner from '../common/Spinner';
import PaymentReceiptModal from './PaymentReceiptModal';

const PaymentReports: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<Payment['status'] | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [paymentsData, clientsData] = await Promise.all([
                getAllPayments(),
                getClients()
            ]);
            setPayments(paymentsData);
            setClients(clientsData);
            setLoading(false);
        };
        fetchData();
    }, []);

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
        
        return filtered.sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
    }, [payments, filterStatus, searchTerm, clientMap]);

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
                
                {loading ? <Spinner /> : (
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
                                        <td className="px-6 py-4 whitespace-nowrap">{getStatusChip(payment.status)}</td>
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
