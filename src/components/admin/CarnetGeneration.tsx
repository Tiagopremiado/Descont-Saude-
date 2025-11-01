import React, { useState, useMemo } from 'react';
import type { Client, Payment } from '../../types';
import { generateAnnualCarnet } from '../../services/apiService';
import { useData } from '../../context/DataContext';
import Card from '../common/Card';
import Modal from '../common/Modal';
import Spinner from '../common/Spinner';

interface CarnetGenerationProps {
    clients: Client[];
    onUpdate: () => void;
}

type CarnetStatus = 'generated' | 'pending' | 'cancelled';
type FilterStatus = CarnetStatus | 'all';

interface ClientWithCarnetStatus extends Client {
    carnetStatus: CarnetStatus;
}

const ButtonSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


const CarnetGeneration: React.FC<CarnetGenerationProps> = ({ clients, onUpdate }) => {
    const { payments, isLoadingData } = useData();
    const [isGenerating, setIsGenerating] = useState<string | null>(null);
    const [filter, setFilter] = useState<FilterStatus>('pending');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

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
            if (client.carnetStatus === 'generated') acc.generated++;
            else if (client.carnetStatus === 'pending') acc.pending++;
            else if (client.carnetStatus === 'cancelled') acc.cancelled++;
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
            onUpdate(); // Reload data in the context
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
    };
    
    const FilterButton: React.FC<{ value: typeof filter, label: string, count: number }> = ({ value, label, count }) => (
        <button
            onClick={() => setFilter(value)}
            className={`px-4 py-2 text-sm font-semibold rounded-full flex items-center gap-2 transition-colors ${
                filter === value
                ? 'bg-ds-vinho text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
        >
            {label}
            <span className={`px-2 rounded-full text-xs ${filter === value ? 'bg-white/20' : 'bg-gray-400/50'}`}>{count}</span>
        </button>
    );

    return (
        <>
            <Card title="Geração de Carnês para 2026">
                <p className="text-gray-600 mb-6">Esta ferramenta verifica quais clientes ativos ainda não possuem o carnê de mensalidades para o ano de 2026 e permite gerá-lo.</p>
                <div className="flex items-center gap-2 mb-6">
                    {Object.keys(statusFilterLabels).map(key => (
                        <FilterButton key={key} value={key as FilterStatus} label={statusFilterLabels[key as FilterStatus]} count={key === 'all' ? clients.length : carnetCounts[key as CarnetStatus]} />
                    ))}
                </div>
                {isLoadingData ? <Spinner /> : (
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPF</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status Carnê 2026</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                                </tr>
                            </thead>
                             <tbody className="bg-white divide-y divide-gray-200">
                                {filteredClients.map(client => (
                                    <tr key={client.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.cpf}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                                            <span className={statusMap[client.carnetStatus].color}>{statusMap[client.carnetStatus].text}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {client.carnetStatus === 'pending' ? (
                                                <button 
                                                    onClick={() => handleGenerateClick(client)}
                                                    disabled={isGenerating === client.id}
                                                    className="bg-ds-vinho text-white text-xs font-bold py-2 px-3 rounded-full hover:bg-opacity-90 flex items-center disabled:opacity-75 disabled:cursor-wait"
                                                >
                                                    {isGenerating === client.id && <ButtonSpinner />}
                                                    {isGenerating === client.id ? 'Gerando...' : 'Gerar Carnê'}
                                                </button>
                                            ) : (
                                                <span className="text-xs text-gray-400">N/A</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                             </tbody>
                        </table>
                        {filteredClients.length === 0 && <p className="text-center text-gray-500 py-6">Nenhum cliente encontrado para este filtro.</p>}
                    </div>
                )}
            </Card>
            {selectedClient && (
                <Modal isOpen={!!selectedClient} onClose={() => setSelectedClient(null)} title="Confirmar Geração de Carnê">
                    <div className="space-y-4">
                        <p>Você tem certeza que deseja gerar o carnê com 12 mensalidades para o ano de 2026 para o cliente <strong className="text-ds-vinho">{selectedClient.name}</strong>?</p>
                        <p className="text-sm bg-yellow-100 text-yellow-800 p-3 rounded-md">Esta ação não pode ser desfeita e criará 12 cobranças pendentes para o cliente.</p>
                         <div className="flex justify-end space-x-3 pt-2">
                            <button type="button" onClick={() => setSelectedClient(null)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-full hover:bg-gray-300">
                                Cancelar
                            </button>
                            <button type="button" onClick={handleConfirmGeneration} className="bg-ds-vinho text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-80">
                                Sim, Gerar Carnê
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
};

export default CarnetGeneration;