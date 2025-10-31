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

    return (
        <>
            <Card title="Geração de Carnês para 2026">
                {/* ... (UI part is largely unchanged) ... */}
            </Card>
            {selectedClient && (
                <Modal isOpen={!!selectedClient} onClose={() => setSelectedClient(null)} title="Confirmar Geração de Carnê">
                    {/* ... (Modal UI is largely unchanged) ... */}
                </Modal>
            )}
        </>
    );
};

export default CarnetGeneration;
