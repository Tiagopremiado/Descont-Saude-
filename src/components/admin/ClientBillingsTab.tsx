import React, { useState, useEffect } from 'react';
import type { Client, Payment } from '../../types';
import { getPaymentsByClientId, generateNewInvoice, updatePaymentStatus, generateAnnualCarnet } from '../../services/apiService';
import Spinner from '../common/Spinner';

const ButtonSpinner = () => (
    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const ClientBillingsTab: React.FC<{ client: Client }> = ({ client }) => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    
    const [newInvoiceMonth, setNewInvoiceMonth] = useState('');
    const [newInvoiceYear, setNewInvoiceYear] = useState(new Date().getFullYear());
    const [isGenerating, setIsGenerating] = useState(false);
    
    const [carnetYear, setCarnetYear] = useState(new Date().getFullYear() + 1);
    const [isGeneratingCarnet, setIsGeneratingCarnet] = useState(false);


    const fetchPayments = async () => {
        setLoading(true);
        try {
            const data = await getPaymentsByClientId(client.id);
            setPayments(data.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
        } catch (error) {
            console.error("Failed to fetch payments", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [client.id]);

    const handleStatusChange = async (paymentId: string, newStatus: Payment['status']) => {
        setIsUpdating(paymentId);
        try {
            const updatedPayment = await updatePaymentStatus(paymentId, newStatus);
            if (updatedPayment) {
                setPayments(prev => prev.map(p => p.id === paymentId ? updatedPayment : p));
            }
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Erro ao atualizar o status.");
        } finally {
            setIsUpdating(null);
        }
    };

    const handleGenerateInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newInvoiceMonth || !newInvoiceYear) return;
        setIsGenerating(true);
        try {
            await generateNewInvoice(client.id, newInvoiceMonth, newInvoiceYear);
            setNewInvoiceMonth('');
            await fetchPayments();
        } catch(error) {
            console.error("Failed to generate invoice", error);
            alert("Erro ao gerar mensalidade.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateCarnet = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!carnetYear) return;
        
        const existingPayments = payments.filter(p => p.year === carnetYear).length;
        if (existingPayments > 0) {
            if (!window.confirm(`Já existem ${existingPayments} mensalidades para ${carnetYear}. Deseja gerar apenas as faltantes?`)) {
                return;
            }
        }

        setIsGeneratingCarnet(true);
        try {
            await generateAnnualCarnet(client.id, carnetYear);
            await fetchPayments();
        } catch(error) {
            console.error("Failed to generate carnet", error);
            alert("Erro ao gerar carnê.");
        } finally {
            setIsGeneratingCarnet(false);
        }
    };
    
    const getStatusStyles = (status: Payment['status']) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800 border-green-300';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'overdue': return 'bg-red-100 text-red-800 border-red-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const inputClass = "bg-white text-gray-900 mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-ds-dourado focus:border-ds-dourado";

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <form onSubmit={handleGenerateInvoice} className="p-4 bg-gray-50 rounded-lg border">
                    <h4 className="font-semibold text-gray-800 mb-2">Gerar Mensalidade Individual</h4>
                    <div className="flex items-end gap-3">
                        <div className="flex-grow">
                            <label htmlFor="new-month" className="text-sm font-medium text-gray-700">Mês</label>
                            <select id="new-month" value={newInvoiceMonth} onChange={e => setNewInvoiceMonth(e.target.value)} required className={inputClass}>
                                <option value="">Selecione...</option>
                                {months.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="new-year" className="text-sm font-medium text-gray-700">Ano</label>
                            <input id="new-year" type="number" value={newInvoiceYear} onChange={e => setNewInvoiceYear(parseInt(e.target.value))} required className={`${inputClass} w-28`} />
                        </div>
                        <button type="submit" disabled={isGenerating} className="bg-ds-vinho text-white font-bold py-2 px-4 rounded-md hover:bg-opacity-90 flex items-center disabled:opacity-75 h-10">
                           {isGenerating && <ButtonSpinner />} {isGenerating ? 'Gerando' : 'Gerar'}
                        </button>
                    </div>
                </form>

                 <form onSubmit={handleGenerateCarnet} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-gray-800 mb-2">Gerar Carnê Anual</h4>
                    <div className="flex items-end gap-3">
                        <div className="flex-grow">
                            <label htmlFor="carnet-year" className="text-sm font-medium text-gray-700">Ano do Carnê</label>
                            <input id="carnet-year" type="number" value={carnetYear} onChange={e => setCarnetYear(parseInt(e.target.value))} required className={`${inputClass} w-full`} />
                        </div>
                        <button type="submit" disabled={isGeneratingCarnet} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 flex items-center disabled:opacity-75 h-10">
                           {isGeneratingCarnet && <ButtonSpinner />} {isGeneratingCarnet ? 'Gerando...' : 'Gerar Ano Todo'}
                        </button>
                    </div>
                </form>
            </div>
            
            <div>
                <h4 className="font-semibold text-gray-800 mb-2">Histórico de Pagamentos</h4>
                {loading ? <Spinner /> : (
                    <div className="overflow-x-auto border rounded-lg max-h-96">
                        <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Referência</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vencimento</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {payments.map(payment => (
                                    <tr key={payment.id}>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{payment.month} {payment.year}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{new Date(payment.dueDate).toLocaleDateString('pt-BR')}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">R$ {payment.amount.toFixed(2)}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            {isUpdating === payment.id ? (
                                                <div className="flex justify-center items-center h-full w-24">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-ds-vinho"></div>
                                                </div>
                                            ) : (
                                                <select
                                                    value={payment.status}
                                                    onChange={(e) => handleStatusChange(payment.id, e.target.value as Payment['status'])}
                                                    className={`w-28 p-1 border rounded-md text-xs font-semibold focus:ring-ds-dourado focus:border-ds-dourado ${getStatusStyles(payment.status)}`}
                                                    aria-label={`Status do pagamento de ${payment.month}`}
                                                >
                                                    <option value="paid">Pago</option>
                                                    <option value="pending">Pendente</option>
                                                    <option value="overdue">Vencido</option>
                                                </select>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {payments.length === 0 && <p className="text-center text-gray-500 py-6">Nenhuma mensalidade encontrada.</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientBillingsTab;