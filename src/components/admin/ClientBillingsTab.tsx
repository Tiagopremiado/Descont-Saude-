import React, { useState, useEffect, useMemo } from 'react';
import type { Client, Payment } from '../../types';
import { getPaymentsByClientId, generateNewInvoice, updatePaymentStatus, generateAnnualCarnet, deletePayment, updatePayment } from '../../services/apiService';
import Spinner from '../common/Spinner';
import Modal from '../common/Modal';

const ButtonSpinner = () => (
    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const PencilIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const ClientBillingsTab: React.FC<{ client: Client }> = ({ client }) => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    
    // Multi-selection state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);
    
    // Single Invoice State
    const [newInvoiceMonth, setNewInvoiceMonth] = useState('');
    const [newInvoiceYear, setNewInvoiceYear] = useState(new Date().getFullYear());
    const [newInvoiceAmount, setNewInvoiceAmount] = useState<string>(client.monthlyFee?.toFixed(2) || '0.00');
    const [newInvoiceDueDate, setNewInvoiceDueDate] = useState<string>('');
    const [newInvoiceObservation, setNewInvoiceObservation] = useState('');
    const [newInvoiceFinePercent, setNewInvoiceFinePercent] = useState<string>('2.00');
    const [newInvoiceInterestPercent, setNewInvoiceInterestPercent] = useState<string>('1.00');
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Carnet State
    const [carnetYear, setCarnetYear] = useState(new Date().getFullYear() + 1);
    const [carnetAmount, setCarnetAmount] = useState<string>(client.monthlyFee?.toFixed(2) || '0.00');
    const [carnetDueDay, setCarnetDueDay] = useState<string>(String(client.paymentDueDateDay || 20));
    const [carnetStartMonth, setCarnetStartMonth] = useState('Janeiro');
    const [carnetObservation, setCarnetObservation] = useState('');
    const [carnetFinePercent, setCarnetFinePercent] = useState<string>('2.00');
    const [carnetInterestPercent, setCarnetInterestPercent] = useState<string>('1.00');
    const [isGeneratingCarnet, setIsGeneratingCarnet] = useState(false);

    // Edit Modal States
    const [paymentToEdit, setPaymentToEdit] = useState<Payment | null>(null);
    const [editAmount, setEditAmount] = useState<string>('');
    const [editObservation, setEditObservation] = useState('');
    const [isSavingEdit, setIsSavingEdit] = useState(false);

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
        // Reset multi-selection when client changes
        setSelectedIds(new Set());
        // Reset defaults when client changes
        setNewInvoiceAmount(client.monthlyFee?.toFixed(2) || '0.00');
        setCarnetAmount(client.monthlyFee?.toFixed(2) || '0.00');
        setCarnetDueDay(String(client.paymentDueDateDay || 20));
    }, [client.id, client.monthlyFee, client.paymentDueDateDay]);

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
            await generateNewInvoice({
                clientId: client.id,
                month: newInvoiceMonth,
                year: newInvoiceYear,
                amount: parseFloat(newInvoiceAmount),
                dueDate: newInvoiceDueDate || undefined,
                observation: newInvoiceObservation,
                finePercent: newInvoiceFinePercent ? parseFloat(newInvoiceFinePercent) : undefined,
                interestPercent: newInvoiceInterestPercent ? parseFloat(newInvoiceInterestPercent) : undefined
            });
            setNewInvoiceMonth('');
            setNewInvoiceObservation('');
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
        
        setIsGeneratingCarnet(true);
        try {
            await generateAnnualCarnet({
                clientId: client.id, 
                year: carnetYear,
                amount: parseFloat(carnetAmount),
                dueDay: parseInt(carnetDueDay),
                observation: carnetObservation,
                startMonth: carnetStartMonth,
                finePercent: carnetFinePercent ? parseFloat(carnetFinePercent) : undefined,
                interestPercent: carnetInterestPercent ? parseFloat(carnetInterestPercent) : undefined
            });
            setCarnetObservation('');
            await fetchPayments();
        } catch(error) {
            console.error("Failed to generate carnet", error);
            alert("Erro ao gerar carnê.");
        } finally {
            setIsGeneratingCarnet(false);
        }
    };

    const handleDelete = async (paymentId: string) => {
        if (!window.confirm("Tem certeza que deseja apagar esta mensalidade? Esta ação não pode ser desfeita.")) {
            return;
        }
        setIsDeleting(paymentId);
        try {
            await deletePayment(paymentId);
            setPayments(prev => prev.filter(p => p.id !== paymentId));
            // Remove from selected if it was there
            const newSelected = new Set(selectedIds);
            newSelected.delete(paymentId);
            setSelectedIds(newSelected);
        } catch (error) {
            console.error("Failed to delete payment", error);
            alert("Erro ao excluir pagamento.");
        } finally {
            setIsDeleting(null);
        }
    };

    // --- Multi-selection Handlers ---
    const toggleSelectAll = () => {
        if (selectedIds.size === payments.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(payments.map(p => p.id)));
        }
    };

    const toggleSelectOne = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const handleBulkDelete = async () => {
        const count = selectedIds.size;
        if (count === 0) return;

        if (!window.confirm(`ATENÇÃO: Você está prestes a EXCLUIR ${count} mensalidades permanentemente. Deseja continuar?`)) {
            return;
        }

        setIsBulkProcessing(true);
        try {
            // FIX: Explicitly cast Array.from(selectedIds) to string[] to resolve the "unknown" type issue when using catch(error) in strict TS mode
            const idsToDelete = Array.from(selectedIds) as string[];
            for (const id of idsToDelete) {
                await deletePayment(id);
            }
            alert(`${count} mensalidades excluídas com sucesso.`);
            setSelectedIds(new Set());
            await fetchPayments();
        } catch (error) {
            console.error("Bulk delete failed", error);
            alert("Erro ao processar exclusão em massa. Algumas faturas podem não ter sido apagadas.");
            await fetchPayments();
        } finally {
            setIsBulkProcessing(false);
        }
    };

    const openEditModal = (payment: Payment) => {
        setPaymentToEdit(payment);
        setEditAmount(payment.amount.toFixed(2));
        setEditObservation(payment.observation || '');
    };

    const handleSaveEdit = async () => {
        if (!paymentToEdit) return;
        
        const finalAmount = parseFloat(editAmount) || 0;

        if (finalAmount <= 0) {
            alert("O valor total deve ser maior que zero.");
            return;
        }

        setIsSavingEdit(true);
        try {
            const updated = await updatePayment(paymentToEdit.id, { 
                amount: finalAmount,
                observation: editObservation
            });
            setPayments(prev => prev.map(p => p.id === paymentToEdit.id ? updated : p));
            setPaymentToEdit(null);
        } catch (error) {
            console.error("Error updating payment", error);
            alert("Erro ao atualizar pagamento.");
        } finally {
            setIsSavingEdit(false);
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
    const inputClass = "bg-white text-gray-900 mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-ds-dourado focus:border-ds-dourado text-sm";
    const labelClass = "block text-xs font-medium text-gray-700";

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* SINGLE INVOICE FORM */}
                <form onSubmit={handleGenerateInvoice} className="p-4 bg-gray-50 rounded-lg border shadow-sm">
                    <h4 className="font-bold text-ds-vinho mb-3 border-b pb-2">Gerar Mensalidade Individual</h4>
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Mês</label>
                                <select value={newInvoiceMonth} onChange={e => setNewInvoiceMonth(e.target.value)} required className={inputClass}>
                                    <option value="">Selecione...</option>
                                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Ano</label>
                                <input type="number" value={newInvoiceYear} onChange={e => setNewInvoiceYear(parseInt(e.target.value))} required className={inputClass} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Valor (R$)</label>
                                <input type="number" step="0.01" value={newInvoiceAmount} onChange={e => setNewInvoiceAmount(e.target.value)} required className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Vencimento (Opcional)</label>
                                <input type="date" value={newInvoiceDueDate} onChange={e => setNewInvoiceDueDate(e.target.value)} className={inputClass} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Multa (%)</label>
                                <input type="number" step="0.01" value={newInvoiceFinePercent} onChange={e => setNewInvoiceFinePercent(e.target.value)} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Juros Mensais (%)</label>
                                <input type="number" step="0.01" value={newInvoiceInterestPercent} onChange={e => setNewInvoiceInterestPercent(e.target.value)} className={inputClass} />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Observação</label>
                            <input type="text" value={newInvoiceObservation} onChange={e => setNewInvoiceObservation(e.target.value)} placeholder="Ex: Acordo especial" className={inputClass} />
                        </div>
                        <button type="submit" disabled={isGenerating} className="w-full bg-ds-vinho text-white font-bold py-2 px-4 rounded-md hover:bg-opacity-90 flex items-center justify-center disabled:opacity-75 mt-2">
                           {isGenerating && <ButtonSpinner />} {isGenerating ? 'Gerando...' : 'Gerar Fatura'}
                        </button>
                    </div>
                </form>

                {/* CARNET FORM */}
                 <form onSubmit={handleGenerateCarnet} className="p-4 bg-blue-50 rounded-lg border border-blue-200 shadow-sm">
                    <h4 className="font-bold text-blue-900 mb-3 border-b border-blue-200 pb-2">Gerar Carnê (Lote)</h4>
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Ano de Referência</label>
                                <input type="number" value={carnetYear} onChange={e => setCarnetYear(parseInt(e.target.value))} required className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Mês Inicial</label>
                                <select value={carnetStartMonth} onChange={e => setCarnetStartMonth(e.target.value)} required className={inputClass}>
                                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Valor Mensal (R$)</label>
                                <input type="number" step="0.01" value={carnetAmount} onChange={e => setCarnetAmount(e.target.value)} required className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Dia Vencimento</label>
                                <input type="number" min="1" max="31" value={carnetDueDay} onChange={e => setCarnetDueDay(e.target.value)} required className={inputClass} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Multa (%)</label>
                                <input type="number" step="0.01" value={carnetFinePercent} onChange={e => setCarnetFinePercent(e.target.value)} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Juros Mensais (%)</label>
                                <input type="number" step="0.01" value={carnetInterestPercent} onChange={e => setCarnetInterestPercent(e.target.value)} className={inputClass} />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Observação (para todos os meses)</label>
                            <input type="text" value={carnetObservation} onChange={e => setCarnetObservation(e.target.value)} placeholder="Ex: Valor fixo promocional" className={inputClass} />
                        </div>
                        <button type="submit" disabled={isGeneratingCarnet} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center disabled:opacity-75 mt-auto">
                           {isGeneratingCarnet && <ButtonSpinner />} {isGeneratingCarnet ? 'Gerando...' : 'Gerar do Mês Selecionado em Diante'}
                        </button>
                    </div>
                </form>
            </div>
            
            <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <h4 className="font-semibold text-gray-800">Histórico de Pagamentos</h4>
                    
                    {/* Bulk Action Bar */}
                    {selectedIds.size > 0 && (
                        <div className="flex items-center gap-3 bg-red-50 p-2 px-4 rounded-lg border border-red-200 animate-fade-in">
                            <span className="text-sm font-bold text-red-700">{selectedIds.size} faturas selecionadas</span>
                            <button 
                                onClick={handleBulkDelete}
                                disabled={isBulkProcessing}
                                className="bg-red-600 text-white text-xs font-bold py-1.5 px-3 rounded hover:bg-red-700 flex items-center gap-1 transition-colors"
                            >
                                {isBulkProcessing ? <Spinner /> : <TrashIcon />}
                                {isBulkProcessing ? 'Apagando...' : 'Apagar Selecionados'}
                            </button>
                            <button 
                                onClick={() => setSelectedIds(new Set())}
                                className="text-gray-500 hover:text-gray-700 text-xs font-bold"
                            >
                                Cancelar
                            </button>
                        </div>
                    )}
                </div>

                {loading ? <Spinner /> : (
                    <div className="overflow-x-auto border rounded-lg max-h-[500px]">
                        <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-2 text-left w-10">
                                        <input 
                                            type="checkbox" 
                                            checked={payments.length > 0 && selectedIds.size === payments.length}
                                            onChange={toggleSelectAll}
                                            className="h-4 w-4 rounded text-ds-vinho focus:ring-ds-dourado cursor-pointer"
                                        />
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Referência</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vencimento</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Obs</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {payments.map(payment => (
                                    <tr key={payment.id} className={`${selectedIds.has(payment.id) ? 'bg-ds-vinho/5' : 'hover:bg-gray-50'}`}>
                                        <td className="px-4 py-2">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedIds.has(payment.id)}
                                                onChange={() => toggleSelectOne(payment.id)}
                                                className="h-4 w-4 rounded text-ds-vinho focus:ring-ds-dourado cursor-pointer"
                                            />
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{payment.month} {payment.year}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{new Date(payment.dueDate).toLocaleDateString('pt-BR')}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">R$ {payment.amount.toFixed(2)}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 max-w-[150px] truncate" title={payment.observation}>{payment.observation || '-'}</td>
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
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 flex items-center gap-2">
                                            <button 
                                                onClick={() => openEditModal(payment)} 
                                                className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors" 
                                                title="Editar Valor / Obs"
                                            >
                                                <PencilIcon />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(payment.id)} 
                                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors" 
                                                title="Apagar Mensalidade"
                                                disabled={isDeleting === payment.id}
                                            >
                                                {isDeleting === payment.id ? <ButtonSpinner /> : <TrashIcon />}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {payments.length === 0 && <p className="text-center text-gray-500 py-6">Nenhuma mensalidade encontrada.</p>}
                    </div>
                )}
            </div>

            {/* Modal de Edição de Valor / Obs */}
            {paymentToEdit && (
                <Modal isOpen={!!paymentToEdit} onClose={() => setPaymentToEdit(null)} title="Editar Detalhes">
                    <div className="space-y-4">
                        <div className="bg-yellow-50 p-3 rounded text-sm text-yellow-800 border border-yellow-200">
                            Editando: <strong>{paymentToEdit.month}/{paymentToEdit.year}</strong>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Valor Base</label>
                            <input 
                                type="number" 
                                step="0.01" 
                                value={editAmount} 
                                onChange={(e) => setEditAmount(e.target.value)} 
                                className={inputClass} 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Observação</label>
                            <input 
                                type="text" 
                                value={editObservation} 
                                onChange={(e) => setEditObservation(e.target.value)} 
                                className={inputClass} 
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button 
                                onClick={() => setPaymentToEdit(null)} 
                                className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-full hover:bg-gray-300"
                                disabled={isSavingEdit}
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSaveEdit} 
                                className="bg-ds-vinho text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-90 flex items-center disabled:opacity-75"
                                disabled={isSavingEdit}
                            >
                                {isSavingEdit && <ButtonSpinner />}
                                Salvar
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default ClientBillingsTab;
