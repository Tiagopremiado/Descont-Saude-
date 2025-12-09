import React, { useState, useEffect, useMemo } from 'react';
import type { CourierFinancialRecord } from '../../types';
import { getCourierFinancialRecords, markFinancialRecordAsPaid } from '../../services/apiService';
import Card from '../common/Card';
import Spinner from '../common/Spinner';

const CourierFinance: React.FC<{ onUpdate: () => void }> = ({ onUpdate }) => {
    const [records, setRecords] = useState<CourierFinancialRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    const fetchRecords = async () => {
        setIsLoading(true);
        const data = await getCourierFinancialRecords();
        setRecords(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    const totals = useMemo(() => {
        return records.reduce((acc, rec) => {
            if (rec.status === 'pending') acc.pending += rec.totalAmount;
            if (rec.status === 'paid') acc.paid += rec.totalAmount;
            return acc;
        }, { pending: 0, paid: 0 });
    }, [records]);

    const handlePay = async (record: CourierFinancialRecord) => {
        if (!window.confirm(`Confirmar pagamento de R$ ${record.totalAmount.toFixed(2)} referente ao dia ${new Date(record.date).toLocaleDateString('pt-BR')}?`)) {
            return;
        }

        setIsUpdating(record.id);
        try {
            await markFinancialRecordAsPaid(record.id);
            await fetchRecords();
            onUpdate(); // Refresh global context if needed
        } catch (error) {
            console.error("Failed to pay", error);
            alert("Erro ao registrar pagamento.");
        } finally {
            setIsUpdating(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
                    <p className="text-gray-500 font-medium">Total Pendente (A Pagar)</p>
                    <p className="text-3xl font-bold text-yellow-600">R$ {totals.pending.toFixed(2).replace('.', ',')}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
                    <p className="text-gray-500 font-medium">Total Já Pago</p>
                    <p className="text-3xl font-bold text-green-600">R$ {totals.paid.toFixed(2).replace('.', ',')}</p>
                </div>
            </div>

            <Card title="Histórico de Dias Trabalhados">
                {isLoading ? <Spinner /> : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entregas</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {records.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Nenhum registro encontrado.</td>
                                    </tr>
                                ) : (
                                    records.map(record => (
                                        <tr key={record.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(record.date).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {record.deliveriesCount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                R$ {record.totalAmount.toFixed(2).replace('.', ',')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    record.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {record.status === 'paid' ? 'Pago' : 'Pendente'}
                                                </span>
                                                {record.paidAt && <div className="text-xs text-gray-400 mt-1">em {new Date(record.paidAt).toLocaleDateString('pt-BR')}</div>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {record.status === 'pending' && (
                                                    <button
                                                        onClick={() => handlePay(record)}
                                                        disabled={!!isUpdating}
                                                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                                                    >
                                                        {isUpdating === record.id ? 'Processando...' : 'Pagar'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default CourierFinance;