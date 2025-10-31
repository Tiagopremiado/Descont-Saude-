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

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterPending]);

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
    }, [initialClients, searchTerm, filterPending]);

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
        reloadClients();
        setDirty(true);
    }

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
                    <div className="flex items-center gap-4">
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
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPF</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedClients.map((client) => (
                                    <tr key={client.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="text-sm font-medium text-gray-900">{client.name}</div>
                                                {hasPendingDependent(client) && (
                                                    <span title="Dependente pendente" className="ml-2 w-3 h-3 bg-yellow-400 rounded-full"></span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.cpf}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.phone}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{getStatusChip(client.status)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button onClick={() => setSelectedClient(client)} className="text-ds-vinho hover:text-ds-dourado">
                                                Ver / Editar
                                            </button>
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
