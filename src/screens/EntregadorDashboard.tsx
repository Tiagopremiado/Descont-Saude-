import React, { useState, useMemo, useEffect } from 'react';
import Header from '../components/Header';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import type { Client, UpdateApprovalRequest } from '../types';
import { getUpdateRequests } from '../services/apiService';
import Spinner from '../components/common/Spinner';
import ClientUpdateModal from '../components/entregador/ClientUpdateModal';

const MapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
);

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

    const openGoogleMaps = (e: React.MouseEvent, client: Client) => {
        e.stopPropagation(); // Impede que o modal de edição abra
        const fullAddress = `${client.address}, ${client.addressNumber}, ${client.neighborhood}, ${client.city} - RS`;
        const encodedAddress = encodeURIComponent(fullAddress);
        const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
        window.open(mapUrl, '_blank');
    };
    
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
                                            <div className="flex w-full hover:bg-gray-50 transition-colors relative">
                                                <button 
                                                    onClick={() => setSelectedClient(client)}
                                                    className="flex-grow text-left p-4 pr-16 focus:outline-none"
                                                >
                                                    <div>
                                                        <p className="font-semibold text-ds-vinho">{client.name}</p>
                                                        <p className="text-sm text-gray-600">{`${client.address}, ${client.addressNumber} - ${client.neighborhood}`}</p>
                                                        <p className="text-xs text-gray-500">{client.city}</p>
                                                    </div>
                                                    <div className="mt-1">
                                                        {updatedClientIds.has(client.id) ? (
                                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                                                Visitado
                                                            </span>
                                                        ) : (
                                                             <span className="text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">Pendente</span>
                                                        )}
                                                    </div>
                                                </button>
                                                
                                                <div className="flex items-center justify-center p-2 absolute right-2 top-1/2 -translate-y-1/2">
                                                    <button
                                                        onClick={(e) => openGoogleMaps(e, client)}
                                                        className="bg-blue-100 text-blue-600 p-3 rounded-full hover:bg-blue-200 transition-colors shadow-sm"
                                                        title="Abrir Rota no GPS"
                                                    >
                                                        <MapIcon />
                                                    </button>
                                                </div>
                                            </div>
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