
import React, { useState, useEffect } from 'react';
import type { ServiceHistoryItem } from '../../types';
import { getServiceHistoryByClientId } from '../../services/apiService';
import Card from '../common/Card';
import Spinner from '../common/Spinner';

interface ServiceHistoryProps {
    clientId: string;
}

const ServiceHistory: React.FC<ServiceHistoryProps> = ({ clientId }) => {
    const [history, setHistory] = useState<ServiceHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            const data = await getServiceHistoryByClientId(clientId);
            setHistory(data);
            setLoading(false);
        };
        fetchHistory();
    }, [clientId]);

    return (
        <Card title="Meu Histórico de Atendimentos">
            {loading ? <Spinner /> : (
                <div className="space-y-4">
                    {history.length > 0 ? (
                        history.map(item => (
                            <div key={item.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-center">
                                    <p className="font-bold text-ds-vinho">{item.procedure}</p>
                                    <p className="text-sm text-gray-600">{new Date(item.date).toLocaleDateString('pt-BR')}</p>
                                </div>
                                <p className="text-sm text-gray-800">{item.doctorName}</p>
                                <p className="text-xs text-gray-500">{item.specialty}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-4">Nenhum histórico de atendimento encontrado.</p>
                    )}
                </div>
            )}
        </Card>
    );
};

export default ServiceHistory;
