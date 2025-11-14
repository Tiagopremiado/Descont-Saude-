import React, { useState, useMemo, useEffect } from 'react';
import Header from '../components/Header';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import type { Client, UpdateApprovalRequest } from '../types';
import { getUpdateRequests } from '../services/apiService';
import Spinner from '../components/common/Spinner';
import ClientUpdateModal from '../components/entregador/ClientUpdateModal';

const EntregadorDashboard: React.FC = () => {
    const { logout } = useAuth();
    const { clients, isLoadingData, reloadData, setDirty } = useData();
    const [updateRequests, setUpdateRequests] = useState<UpdateApprovalRequest[]>([]);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFetchingRequests, setIsFetchingRequests] = useState(true);

    const fetchRequests = async () => {
        setIsFetchingRequests(true);
        const requests = await getUpdateRequests();
        setUpdateRequests(requests);
        setIsFetchingRequests(false);
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const updatedClientIds = useMemo(() => {
        return new Set(updateRequests.map(req => req.clientId));
    }, [updateRequests]);

    const filteredClients = useMemo(() => {
        return clients
            .filter(c => c.status === 'active')
            .filter(c => 
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.address.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => {
                const aUpdated = updatedClientIds.has(a.id);
                const bUpdated = updatedClientIds.has(b.id);
                if (aUpdated === bUpdated) return a.name.localeCompare(b.name);
                return aUpdated ? 1 : -1;
            });
    }, [clients, searchTerm, updatedClientIds]);

    const handleUpdateComplete = () => {
        fetchRequests();
        reloadData();
        setDirty(true);
        setSelectedClient(null);
    }
    
    const isLoading = isLoadingData || isFetchingRequests;

    return (
        <>
            <div className="min-h-screen bg-gray-100">
                <Header onLogoutRequest={logout} />
                <main className="p-4 sm:p-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-6">
                            <h2 className="text-3xl font-bold text-ds-vinho">Rota de Entregas</h2>
                            <p className="text-gray-500">Lista de clientes para visita e atualização cadastral.</p>
                        </div>

                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Buscar por nome ou endereço..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-ds-dourado focus:border-ds-dourado"
                            />
                        </div>

                        {isLoading ? <Spinner /> : (
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <ul className="divide-y divide-gray-200">
                                    {filteredClients.map(client => (
                                        <li key={client.id}>
                                            <button 
                                                onClick={() => setSelectedClient(client)}
                                                className="w-full text-left p-4 hover:bg-gray-50 focus:outline-none focus:bg-ds-bege/30 transition-colors"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="font-semibold text-ds-vinho">{client.name}</p>
                                                        <p className="text-sm text-gray-600">{`${client.address}, ${client.addressNumber} - ${client.neighborhood}, ${client.city}`}</p>
                                                    </div>
                                                    {updatedClientIds.has(client.id) ? (
                                                        <span className="flex items-center gap-2 text-sm font-semibold text-green-600">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                                            Atualizado
                                                        </span>
                                                    ) : (
                                                         <span className="text-sm font-semibold text-yellow-600">Pendente</span>
                                                    )}
                                                </div>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                {filteredClients.length === 0 && <p className="text-center text-gray-500 p-6">Nenhum cliente encontrado.</p>}
                            </div>
                        )}
                    </div>
                </main>
            </div>
            {selectedClient && (
                <ClientUpdateModal
                    isOpen={!!selectedClient}
                    onClose={() => setSelectedClient(null)}
                    client={selectedClient}
                    onUpdateComplete={handleUpdateComplete}
                />
            )}
        </>
    );
};

export default EntregadorDashboard;
