import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import type { Client, Payment } from '../../types';
import { updatePaymentInvoiceStatus } from '../../services/apiService';
import Card from '../common/Card';
import Spinner from '../common/Spinner';

type PaymentWithClient = {
    payment: Payment;
    client: Client;
};

const CopyableField: React.FC<{ label: string; value: string }> = ({ label, value }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(value).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    return (
        <div>
            <label className="block text-xs font-medium text-gray-500">{label}</label>
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={value}
                    readOnly
                    className="w-full bg-gray-100 text-gray-800 p-2 border border-gray-300 rounded-md text-sm"
                />
                <button
                    onClick={handleCopy}
                    className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${copied ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                    {copied ? 'Copiado!' : 'Copiar'}
                </button>
            </div>
        </div>
    );
};

const InvoiceGeneration: React.FC = () => {
    const { clients, payments, isLoadingData, reloadData, setDirty } = useData();
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toLocaleString('pt-BR', { month: 'long' }).replace(/^\w/, c => c.toUpperCase()));
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [filterStatus, setFilterStatus] = useState<'pending' | 'generated' | 'all'>('pending');
    const [selected, setSelected] = useState<PaymentWithClient | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const paymentsWithClientData = useMemo<PaymentWithClient[]>(() => {
        const clientMap = new Map(clients.map(c => [c.id, c]));
        return payments
            .filter(p => p.month === selectedMonth && p.year === selectedYear)
            .map(p => ({ payment: p, client: clientMap.get(p.clientId)! }))
            .filter(item => item.client); // Garante que o cliente existe
    }, [payments, clients, selectedMonth, selectedYear]);
    
    const filteredList = useMemo(() => {
        if (filterStatus === 'all') return paymentsWithClientData;
        return paymentsWithClientData.filter(item => (item.payment.invoiceStatus ?? 'pending') === filterStatus);
    }, [paymentsWithClientData, filterStatus]);
    
    const handleMarkAsGenerated = async () => {
        if (!selected) return;
        setIsUpdating(true);
        try {
            await updatePaymentInvoiceStatus(selected.payment.id, 'generated');
            setDirty(true);
            reloadData();
            setSelected(null);
        } catch (error) {
            console.error("Failed to mark invoice as generated", error);
            alert("Erro ao atualizar o status da nota.");
        } finally {
            setIsUpdating(false);
        }
    };

    const years = Array.from(new Set(payments.map(p => p.year))).sort((a,b) => b-a);
    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    return (
        <Card title="Geração de Notas Fiscais">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel: Client List */}
                <div className="lg:col-span-1 border-r lg:pr-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-4">Clientes para Faturar</h3>
                    {/* Filters */}
                    <div className="space-y-4 mb-4">
                        <div className="flex gap-2">
                             <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg">
                                {months.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} className="w-full p-2 border border-gray-300 rounded-lg">
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                        <div className="flex justify-center gap-2">
                            {(['pending', 'generated', 'all'] as const).map(status => (
                                <button key={status} onClick={() => setFilterStatus(status)} className={`px-3 py-1 text-sm rounded-full ${filterStatus === status ? 'bg-ds-vinho text-white' : 'bg-gray-200'}`}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)} ({status === 'all' ? paymentsWithClientData.length : paymentsWithClientData.filter(i => (i.payment.invoiceStatus ?? 'pending') === status).length})
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Client List */}
                    <div className="max-h-[60vh] overflow-y-auto space-y-2">
                        {isLoadingData ? <Spinner /> : filteredList.map(item => (
                            <div key={item.payment.id} className={`p-3 rounded-lg border-l-4 ${item.payment.invoiceStatus === 'generated' ? 'border-green-500 bg-green-50' : 'border-yellow-500 bg-yellow-50'}`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-gray-800">{item.client.name}</p>
                                        <p className="text-xs text-gray-500">R$ {item.payment.amount.toFixed(2)}</p>
                                    </div>
                                    <button onClick={() => setSelected(item)} className="bg-ds-dourado text-ds-vinho text-xs font-bold py-1 px-3 rounded-full hover:bg-opacity-80">
                                        Gerar Nota
                                    </button>
                                </div>
                            </div>
                        ))}
                        {filteredList.length === 0 && !isLoadingData && <p className="text-center text-gray-500 py-4">Nenhum cliente para faturar neste período.</p>}
                    </div>
                </div>

                {/* Right Panel: iFrame and Data */}
                <div className="lg:col-span-2">
                    {!selected ? (
                        <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
                            <p className="text-gray-500">Selecione um cliente para começar</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <Card title="Painel de Faturamento">
                                <div className="space-y-3 mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h4 className="font-bold text-blue-800">Dados para Cópia Rápida</h4>
                                    <CopyableField label="Nome / Razão Social" value={selected.client.name} />
                                    <CopyableField label="CPF / CNPJ" value={selected.client.cpf} />
                                    <CopyableField label="Endereço Completo" value={`${selected.client.address}, ${selected.client.addressNumber} - ${selected.client.neighborhood}, ${selected.client.city}`} />
                                    <CopyableField label="Descrição do Serviço" value="MENSALIDADE PLANO DE SAUDE" />
                                    <CopyableField label="Valor do Serviço (R$)" value={selected.payment.amount.toFixed(2)} />
                                </div>
                                
                                {selected.payment.invoiceStatus !== 'generated' && (
                                    <button onClick={handleMarkAsGenerated} disabled={isUpdating} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-50">
                                        {isUpdating ? <Spinner/> : `Marcar como Nota Gerada para ${selected.payment.month}`}
                                    </button>
                                )}
                            </Card>
                            
                            <div className="w-full h-[80vh] border-2 border-ds-vinho rounded-lg overflow-hidden">
                                <iframe
                                    src="https://pedroosorio.govbr.cloud/nfse.portal/"
                                    title="Portal da Prefeitura"
                                    className="w-full h-full"
                                    sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
                                ></iframe>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default InvoiceGeneration;