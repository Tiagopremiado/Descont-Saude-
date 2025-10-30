import React, { useState, useMemo, useEffect } from 'react';
import type { Client, Payment } from '../../types';
import { getAllPayments, generateAnnualCarnet } from '../../services/apiService';
import Card from '../common/Card';
import Modal from '../common/Modal';
import Spinner from '../common/Spinner';

interface CarnetGenerationProps {
    clients: Client[];
}

type CarnetStatus = 'generated' | 'pending' | 'cancelled';
type FilterStatus = CarnetStatus | 'all';

interface ClientWithCarnetStatus extends Client {
    carnetStatus: CarnetStatus;
}

const CarnetGeneration: React.FC<CarnetGenerationProps> = ({ clients }) => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState<string | null>(null); // Store client ID being generated
    const [filter, setFilter] = useState<FilterStatus>('pending');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    const fetchPayments = async () => {
        setIsLoading(true);
        const paymentsData = await getAllPayments();
        setPayments(paymentsData);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const clientsWithStatus: ClientWithCarnetStatus[] = useMemo(() => {
        return clients.map(client => {
            if (client.status === 'inactive') {
                return { ...client, carnetStatus: 'cancelled' };
            }
            const paymentsFor2026 = payments.filter(p => p.clientId === client.id && p.year === 2026);
            if (paymentsFor2026.length >= 12) {
                return { ...client, carnetStatus: 'generated' };
            }
            return { ...client, carnetStatus: 'pending' };
        });
    }, [clients, payments]);

    const carnetCounts = useMemo(() => {
        return clientsWithStatus.reduce((acc, client) => {
            if (client.carnetStatus === 'generated') {
                acc.generated++;
            } else if (client.carnetStatus === 'pending') {
                acc.pending++;
            } else if (client.carnetStatus === 'cancelled') {
                acc.cancelled++;
            }
            return acc;
        }, { generated: 0, pending: 0, cancelled: 0 });
    }, [clientsWithStatus]);

    const filteredClients = useMemo(() => {
        if (filter === 'all') return clientsWithStatus;
        return clientsWithStatus.filter(c => c.carnetStatus === filter);
    }, [clientsWithStatus, filter]);

    const handleGenerateClick = (client: Client) => {
        setSelectedClient(client);
    };

    const handleConfirmGeneration = async () => {
        if (!selectedClient) return;
        
        setIsGenerating(selectedClient.id);
        setSelectedClient(null);

        try {
            await generateAnnualCarnet(selectedClient.id, 2026);
            await fetchPayments();
        } catch (error) {
            console.error("Failed to generate carnet", error);
            alert("Falha ao gerar o carnê.");
        } finally {
            setIsGenerating(null);
        }
    };

    const statusMap: Record<CarnetStatus, { icon: string; text: string; color: string; }> = {
        pending: { icon: '🟡', text: 'Pendente', color: 'text-yellow-600' },
        generated: { icon: '🟢', text: 'Gerado', color: 'text-green-600' },
        cancelled: { icon: '🔴', text: 'Cancelado', color: 'text-red-600' },
    };

    const statusFilterLabels: Record<FilterStatus, string> = {
        all: "Todos",
        pending: "Pendentes",
        generated: "Gerados",
        cancelled: "Cancelados",
    }

    return (
        <>
            <Card title="Geração de Carnês para 2026">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                        <p className="text-sm font-medium text-yellow-700">Carnês Pendentes</p>
                        <p className="text-3xl font-bold text-yellow-800">{carnetCounts.pending}</p>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                        <p className="text-sm font-medium text-green-700">Carnês Gerados</p>
                        <p className="text-3xl font-bold text-green-800">{carnetCounts.generated}</p>
                    </div>
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                        <p className="text-sm font-medium text-red-700">Clientes Cancelados</p>
                        <p className="text-3xl font-bold text-red-800">{carnetCounts.cancelled}</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                    <p className="text-gray-600">
                        Filtre e gerencie a geração dos carnês anuais de pagamento.
                    </p>
                    <div className="flex items-center gap-2">
                        {(['pending', 'generated', 'cancelled', 'all'] as FilterStatus[]).map(status => (
                             <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                                    filter === status
                                    ? 'bg-ds-vinho text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                {statusFilterLabels[status]}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? <Spinner /> : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome do Cliente</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPF</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status Contrato</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredClients.map(client => (
                                    <tr key={client.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`font-bold ${statusMap[client.carnetStatus].color}`}>
                                                {statusMap[client.carnetStatus].icon} {statusMap[client.carnetStatus].text}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.cpf}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{client.status}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {isGenerating === client.id ? (
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Spinner /> Gerando...
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleGenerateClick(client)}
                                                    disabled={client.carnetStatus !== 'pending' || client.status !== 'active'}
                                                    className="bg-ds-vinho text-white font-bold py-1 px-3 rounded-full hover:bg-opacity-90 transition-colors text-xs disabled:bg-gray-300 disabled:cursor-not-allowed"
                                                >
                                                    Gerar Carnê
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredClients.length === 0 && <p className="text-center text-gray-500 py-4">Nenhum cliente encontrado com este filtro.</p>}
                    </div>
                )}
            </Card>

            {selectedClient && (
                <Modal isOpen={!!selectedClient} onClose={() => setSelectedClient(null)} title="Confirmar Geração de Carnê">
                    <div className="space-y-4">
                        <p>Você está prestes a gerar o carnê anual para o cliente:</p>
                        <div className="bg-gray-100 p-4 rounded-lg">
                            <p className="font-bold text-lg text-ds-vinho">{selectedClient.name}</p>
                            <p className="text-sm text-gray-600">CPF: {selectedClient.cpf}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-center">
                             <div className="bg-blue-50 p-3 rounded-lg">
                                <p className="text-sm text-blue-800">Valor Parcela</p>
                                <p className="text-2xl font-bold text-blue-900">R$ {selectedClient.monthlyFee.toFixed(2)}</p>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg">
                                <p className="text-sm text-green-800">Valor Anual</p>
                                <p className="text-2xl font-bold text-green-900">R$ {(selectedClient.monthlyFee * 12).toFixed(2)}</p>
                            </div>
                        </div>
                        <p className="text-sm text-center text-gray-500">Serão criados 12 boletos, de Janeiro a Dezembro de 2026.</p>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button onClick={() => setSelectedClient(null)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-full hover:bg-gray-300">
                                Cancelar
                            </button>
                            <button onClick={handleConfirmGeneration} className="bg-ds-vinho text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-90">
                                Confirmar e Gerar
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
};

export default CarnetGeneration;