import React, { useState, useMemo, useEffect, useRef } from 'react';
import Header from '../components/Header';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import type { Client, UpdateApprovalRequest } from '../types';
import { getUpdateRequests } from '../services/apiService';
import { importRouteData } from '../services/mockData';
import Spinner from '../components/common/Spinner';
import ClientUpdateModal from '../components/entregador/ClientUpdateModal';

const DELIVERY_PRICE = 1.90;

const MapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
);

const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.459l-6.554 1.73zM7.51 21.683l.341-.188c1.643-.906 3.518-1.391 5.472-1.391 5.433 0 9.875-4.442 9.875-9.875 0-5.433-4.442-9.875-9.875-9.875s-9.875 4.442-9.875 9.875c0 2.12.67 4.108 1.868 5.768l-.24 1.125 1.196.241zM12 6.422c.433 0 .78.347.78.78s-.347.78-.78.78a.78.78 0 010-1.56zm-.001 4.29c.433 0 .78.347.78.78s-.347.78-.78.78a.78.78 0 010-1.56zm0 2.894c.433 0 .78.347.78.78s-.347.78-.78.78a.78.78 0 010-1.56z"/>
    </svg>
);

const ImportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const EntregadorDashboard: React.FC = () => {
    const { logout } = useAuth();
    const { clients, isLoadingData, reloadData, setDirty } = useData();
    const [updateRequests, setUpdateRequests] = useState<UpdateApprovalRequest[]>([]);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFetchingRequests, setIsFetchingRequests] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Calcular estatísticas da rota
    const routeStats = useMemo(() => {
        const activeClients = clients.filter(c => c.status === 'active');
        const total = activeClients.length;
        const delivered = updatedClientIds.size;
        const pending = total - delivered;
        const earnings = delivered * DELIVERY_PRICE;
        const progress = total > 0 ? (delivered / total) * 100 : 0;

        return { total, delivered, pending, earnings, progress };
    }, [clients, updatedClientIds]);

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
        e.stopPropagation(); 
        const fullAddress = `${client.address}, ${client.addressNumber}, ${client.neighborhood}, ${client.city} - RS`;
        const encodedAddress = encodeURIComponent(fullAddress);
        const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
        window.open(mapUrl, '_blank');
    };

    const handleExportDailyReport = async () => {
        const today = new Date().toDateString();
        const dailyUpdates = updateRequests.filter(req => new Date(req.requestedAt).toDateString() === today);

        if (dailyUpdates.length === 0) {
            alert("Nenhuma atualização registrada hoje para enviar.");
            return;
        }

        const dataStr = JSON.stringify(dailyUpdates, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const file = new File([blob], `relatorio_entregas_${new Date().toISOString().slice(0, 10)}.json`, { type: "application/json" });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    title: 'Relatório Diário de Entregas',
                    text: `Segue o arquivo com as ${dailyUpdates.length} atualizações de cadastro de hoje.`,
                    files: [file]
                });
            } catch (error) {
                console.error("Erro ao compartilhar:", error);
            }
        } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            alert("Arquivo baixado! Por favor, envie o arquivo manualmente para o administrador pelo WhatsApp.");
        }
    };

    const handleImportRouteClick = () => {
        fileInputRef.current?.click();
    };

    const handleRouteFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("Failed to read file.");
                const newRouteData = JSON.parse(text);
                
                if (Array.isArray(newRouteData) && newRouteData.length > 0 && newRouteData[0].name) {
                    if(window.confirm("Isso atualizará os endereços dos clientes com o arquivo recebido. Suas visitas de hoje SERÃO MANTIDAS. Deseja continuar?")) {
                        importRouteData(newRouteData); 
                        reloadData();
                        alert("Rota e endereços atualizados com sucesso! Suas visitas foram preservadas.");
                    }
                } else {
                    throw new Error("Formato de arquivo inválido. Certifique-se que é o arquivo de rota enviado pelo Admin.");
                }
            } catch (error) {
                console.error("Error parsing route file:", error);
                alert("Erro ao ler o arquivo. Verifique se o arquivo está correto.");
            } finally {
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        };
        reader.readAsText(file);
    }
    
    const isLoading = isLoadingData || isFetchingRequests;

    return (
        <>
            <div className="min-h-screen bg-gray-100">
                <Header onLogoutRequest={logout} />
                <main className="p-4 sm:p-8 pb-24">
                    <div className="max-w-4xl mx-auto">
                        
                        {/* Painel de Produtividade */}
                        <div className="bg-white rounded-xl shadow-lg border-l-4 border-ds-vinho p-4 mb-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-ds-vinho" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                                </svg>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center relative z-10">
                                <div>
                                    <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Saldo a Receber</h2>
                                    <p className="text-4xl font-bold text-green-600">R$ {routeStats.earnings.toFixed(2).replace('.', ',')}</p>
                                    <p className="text-xs text-gray-400 mt-1">{routeStats.delivered} entregas x R$ {DELIVERY_PRICE.toFixed(2)}</p>
                                </div>
                                <div className="mt-4 sm:mt-0 flex gap-4 text-center">
                                    <div className="bg-gray-100 rounded-lg p-2 min-w-[80px]">
                                        <p className="text-xs text-gray-500 font-bold">ROTA</p>
                                        <p className="text-xl font-bold text-gray-800">{routeStats.total}</p>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-2 min-w-[80px]">
                                        <p className="text-xs text-green-600 font-bold">FEITO</p>
                                        <p className="text-xl font-bold text-green-700">{routeStats.delivered}</p>
                                    </div>
                                    <div className="bg-orange-50 rounded-lg p-2 min-w-[80px]">
                                        <p className="text-xs text-orange-600 font-bold">FALTA</p>
                                        <p className="text-xl font-bold text-orange-700">{routeStats.pending}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
                                    <span>Progresso da Rota</span>
                                    <span>{Math.round(routeStats.progress)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-ds-vinho h-2.5 rounded-full transition-all duration-500" style={{ width: `${routeStats.progress}%` }}></div>
                                </div>
                            </div>
                        </div>

                        {/* Botões de Ação */}
                        <div className="mb-6 flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row gap-3 justify-end">
                                <button
                                    onClick={handleImportRouteClick}
                                    className="bg-blue-600 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center shadow-md w-full sm:w-auto"
                                >
                                    <ImportIcon />
                                    Receber Rota
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleRouteFileChange} 
                                    className="hidden" 
                                    accept=".json" 
                                />
                                <button
                                    onClick={handleExportDailyReport}
                                    className="bg-green-600 text-white font-bold py-2 px-4 rounded-full hover:bg-green-700 transition-colors flex items-center justify-center shadow-md w-full sm:w-auto"
                                >
                                    <WhatsAppIcon />
                                    Enviar Relatório
                                </button>
                            </div>
                        </div>

                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Buscar cliente por nome ou endereço..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-ds-dourado focus:border-ds-dourado"
                            />
                        </div>

                        {isLoading ? <Spinner /> : (
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <ul className="divide-y divide-gray-200">
                                    {filteredClients.map(client => (
                                        <li key={client.id} className={updatedClientIds.has(client.id) ? "bg-gray-50 opacity-80" : ""}>
                                            <div className="flex w-full hover:bg-gray-100 transition-colors relative">
                                                <button 
                                                    onClick={() => setSelectedClient(client)}
                                                    className="flex-grow text-left p-4 pr-16 focus:outline-none"
                                                >
                                                    <div>
                                                        <p className={`font-semibold ${updatedClientIds.has(client.id) ? 'text-green-700' : 'text-ds-vinho'}`}>
                                                            {client.name}
                                                        </p>
                                                        <p className="text-sm text-gray-600">{`${client.address}, ${client.addressNumber} - ${client.neighborhood}`}</p>
                                                        <p className="text-xs text-gray-500">{client.city}</p>
                                                    </div>
                                                    <div className="mt-1">
                                                        {updatedClientIds.has(client.id) ? (
                                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                                                <CheckCircleIcon />
                                                                Entregue
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