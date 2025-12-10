import React, { useState, useEffect, useMemo } from 'react';
import type { Client } from '../../types';
import { useData } from '../../context/DataContext';
import Card from '../common/Card';
import Spinner from '../common/Spinner';
import AddClientModal from './AddClientModal';
import ClientDetailModal from './ClientDetailModal';

interface ClientManagementProps {
    initialClients: Client[];
    onClientsChange: () => void; // Now a reload function
    isLoading: boolean;
    filterPending: boolean;
    setFilterPending: (filter: boolean) => void;
    onShowGenerationResult: (client: Client) => void;
}

const CLIENTS_PER_PAGE = 50;

const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.459l-6.554 1.73zM7.51 21.683l.341-.188c1.643-.906 3.518-1.391 5.472-1.391 5.433 0 9.875-4.442 9.875-9.875 0-5.433-4.442-9.875-9.875-9.875s-9.875 4.442-9.875 9.875c0 2.12.67 4.108 1.868 5.768l-.24 1.125 1.196.241z"/>
    </svg>
);

const ClientManagement: React.FC<ClientManagementProps> = ({ 
    initialClients, 
    onClientsChange: reloadClients,
    isLoading,
    filterPending,
    setFilterPending,
    onShowGenerationResult
}) => {
    const { setDirty } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [showInactive, setShowInactive] = useState(false); // Default to false to hide inactive clients

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterPending, showInactive]);

    const clientCounts = useMemo(() => {
        return initialClients.reduce((acc, client) => {
            if (client.status === 'active') {
                acc.active++;
            } else if (client.status === 'inactive') {
                acc.inactive++;
            }
            return acc;
        }, { active: 0, inactive: 0 });
    }, [initialClients]);
    
    const fullyFilteredClients = useMemo(() => {
        let clients = initialClients;

        // Filter out inactive clients unless showInactive is true
        if (!showInactive) {
            clients = clients.filter(c => c.status !== 'inactive');
        }

        if (filterPending) {
            clients = clients.filter(c => c.status === 'pending' || c.dependents.some(d => d.status === 'pending'));
        }
        
        if (searchTerm) {
            clients = clients.filter(c => 
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.cpf.includes(searchTerm)
            );
        }
        return clients;
    }, [initialClients, searchTerm, filterPending, showInactive]);

    const totalPages = Math.ceil(fullyFilteredClients.length / CLIENTS_PER_PAGE);

    const paginatedClients = useMemo(() => {
        const startIndex = (currentPage - 1) * CLIENTS_PER_PAGE;
        const endIndex = startIndex + CLIENTS_PER_PAGE;
        return fullyFilteredClients.slice(startIndex, endIndex);
    }, [fullyFilteredClients, currentPage]);

    const handleClientAdded = (newClient: Client) => {
        setIsAddModalOpen(false);
        reloadClients();
        setDirty(true);
        onShowGenerationResult(newClient);
    };
    
    const handleDetailModalClose = () => {
        setSelectedClient(null);
        // Data might have been changed in the modal, so we reload and mark as dirty
        reloadClients();
        setDirty(true);
    }

    const handleWhatsAppClick = (client: Client) => {
        const number = client.whatsapp || client.phone;
        const cleanNumber = number.replace(/\D/g, '');
        if (cleanNumber) {
            const url = `https://wa.me/55${cleanNumber}`;
            window.open(url, '_blank');
        } else {
            alert('Número de telefone inválido ou não cadastrado.');
        }
    };

    const getStatusChip = (status: Client['status']) => {
        const styles = {
            active: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            inactive: 'bg-red-100 text-red-800'
        };
        const text = {
            active: 'Ativo',
            pending: 'Pendente',
            inactive: 'Inativo'
        }
        return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>{text[status]}</span>
    }
    
    const hasPendingDependent = (client: Client): boolean => {
        return client.dependents.some(d => d.status === 'pending');
    }

    return (
        <>
            <Card>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                        <p className="text-sm font-medium text-green-700">Clientes Ativos</p>
                        <p className="text-3xl font-bold text-green-800">{clientCounts.active}</p>
                    </div>
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                        <p className="text-sm font-medium text-red-700">Clientes Inativos</p>
                        <p className="text-3xl font-bold text-red-800">{clientCounts.inactive}</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Buscar por nome ou CPF..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-1/3 p-2 border border-gray-300 rounded-lg focus:ring-ds-dourado focus:border-ds-dourado"
                    />
                    <div className="flex flex-wrap items-center gap-4 justify-end">
                         <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showInactive}
                                onChange={(e) => setShowInactive(e.target.checked)}
                                className="h-4 w-4 rounded text-ds-vinho focus:ring-ds-dourado"
                            />
                            <span className="text-sm text-gray-700">Mostrar Inativos</span>
                        </label>
                         <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filterPending}
                                onChange={(e) => setFilterPending(e.target.checked)}
                                className="h-4 w-4 rounded text-ds-vinho focus:ring-ds-dourado"
                            />
                            <span className="text-sm text-gray-700">Mostrar Pendentes</span>
                        </label>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-ds-vinho text-white font-bold py-2 px-4 rounded-full hover:bg-opacity-90 transition-colors"
                        >
                            Adicionar Cliente
                        </button>
                    </div>
                </div>

                {isLoading ? <Spinner /> : (
                    <div className="overflow-x-auto pb-4">
                        <table className="min-w-full divide-y divide-gray-200 border-separate border-spacing-y-1">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPF</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {paginatedClients.map((client) => (
                                    <tr 
                                        key={client.id}
                                        className="group transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.15)] hover:bg-white hover:scale-[1.01] hover:z-20 relative border-l-4 border-transparent hover:border-ds-vinho rounded-md"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="text-sm font-medium text-gray-900 group-hover:text-ds-vinho group-hover:font-bold transition-colors">
                                                    {client.name}
                                                </div>
                                                {hasPendingDependent(client) && (
                                                    <span title="Dependente pendente" className="ml-2 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.cpf}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.phone}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{getStatusChip(client.status)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={() => handleWhatsAppClick(client)} 
                                                    className="text-green-600 hover:text-green-800 transition-colors transform hover:scale-110"
                                                    title="Chamar no WhatsApp"
                                                >
                                                    <WhatsAppIcon />
                                                </button>
                                                <button onClick={() => setSelectedClient(client)} className="text-ds-vinho hover:text-ds-dourado font-semibold">
                                                    Ver / Editar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {paginatedClients.length === 0 && <p className="text-center text-gray-500 py-4">Nenhum cliente encontrado.</p>}
                    </div>
                )}
                 {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4">
                        <button
                            onClick={() => setCurrentPage(p => p - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                        >
                            Anterior
                        </button>
                        <span className="text-sm text-gray-700">
                            Página {currentPage} de {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => p + 1)}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                        >
                            Próximo
                        </button>
                    </div>
                )}
            </Card>

            <AddClientModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onClientAdded={handleClientAdded}
            />

            {selectedClient && (
                <ClientDetailModal
                    isOpen={!!selectedClient}
                    onClose={handleDetailModalClose}
                    client={selectedClient}
                    onShowGenerationResult={onShowGenerationResult}
                />
            )}
        </>
    );
};

export default ClientManagement;