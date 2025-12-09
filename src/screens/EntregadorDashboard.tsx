import React, { useState, useMemo, useEffect, useRef } from 'react';
import Header from '../components/Header';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import type { Client, UpdateApprovalRequest, CourierFinancialRecord } from '../types';
import { getUpdateRequests, deletePendingRequestByClientId, createDailyFinancialRecord, getCourierFinancialRecords } from '../services/apiService';
import { importRouteData } from '../services/mockData';
import Spinner from '../components/common/Spinner';
import ClientUpdateModal from '../components/entregador/ClientUpdateModal';
import Modal from '../components/common/Modal';

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

const MoneyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
    </svg>
);

const EntregadorDashboard: React.FC = () => {
    const { logout } = useAuth();
    const { clients, isLoadingData, reloadData, setDirty } = useData();
    const [updateRequests, setUpdateRequests] = useState<UpdateApprovalRequest[]>([]);
    const [financialRecords, setFinancialRecords] = useState<CourierFinancialRecord[]>([]);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [clientToRevert, setClientToRevert] = useState<Client | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFetchingRequests, setIsFetchingRequests] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchRequests = async () => {
        setIsFetchingRequests(true);
        const [requests, records] = await Promise.all([
            getUpdateRequests(),
            getCourierFinancialRecords()
        ]);
        setUpdateRequests(requests);
        setFinancialRecords(records);
        setIsFetchingRequests(false);
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const updatedClientIds = useMemo(() => {
        return new Set(updateRequests.map(req => req.clientId));
    }, [updateRequests]);

    // Calcular estatísticas da rota atual
    const currentRouteStats = useMemo(() => {
        const activeClients = clients.filter(c => c.status === 'active');
        const total = activeClients.length;
        const delivered = updatedClientIds.size;
        const pending = total - delivered;
        const currentEarnings = delivered * DELIVERY_PRICE;
        const progress = total > 0 ? (delivered / total) * 100 : 0;

        return { total, delivered, pending, currentEarnings, progress };
    }, [clients, updatedClientIds]);

    // Calcular financeiro histórico
    const financialStats = useMemo(() => {
        const pendingPayout = financialRecords
            .filter(r => r.status === 'pending')
            .reduce((acc, r) => acc + r.totalAmount, 0);
        
        const lastPayment = financialRecords.find(r => r.status === 'paid');
        
        return {
            totalReceivable: pendingPayout + currentRouteStats.currentEarnings,
            lastPaidAmount: lastPayment ? lastPayment.totalAmount : 0,
            lastPaidDate: lastPayment ? lastPayment.paidAt : null
        };
    }, [financialRecords, currentRouteStats.currentEarnings]);

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
                if (aUpdated === bUpdated) {
                    // Prioritize pending deliveries if status is the same
                    if (a.deliveryStatus?.pending && !b.deliveryStatus?.pending) return -1;
                    if (!a.deliveryStatus?.pending && b.deliveryStatus?.pending) return 1;
                    return a.name.localeCompare(b.name);
                }
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

    const handleCloseDay = async () => {
        if (currentRouteStats.delivered === 0) {
            alert("Nenhuma entrega realizada hoje para fechar.");
            return;
        }

        if(!window.confirm(`Você tem certeza que deseja encerrar o dia?\n\nEntregas: ${currentRouteStats.delivered}\nValor: R$ ${currentRouteStats.currentEarnings.toFixed(2)}\n\nIsso irá gerar um registro de cobrança para o administrador.`)) {
            return;
        }

        try {
            // Create financial record
            await createDailyFinancialRecord(currentRouteStats.delivered, DELIVERY_PRICE);
            
            // Now generate the JSON report
            const today = new Date().toDateString();
            const dailyUpdates = updateRequests.filter(req => new Date(req.requestedAt).toDateString() === today);
            
            const dataStr = JSON.stringify(dailyUpdates, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            const file = new File([blob], `relatorio_entregas_${new Date().toISOString().slice(0, 10)}.json`, { type: "application/json" });

            // Share logic
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        title: 'Relatório Diário de Entregas',
                        text: `Dia fechado! ${currentRouteStats.delivered} entregas. Valor a receber: R$ ${currentRouteStats.currentEarnings.toFixed(2)}`,
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
                alert("Dia encerrado e cobrança gerada! Envie o arquivo baixado para o administrador.");
            }

            // Refresh data to update balance
            fetchRequests();
            setDirty(true);

        } catch (error) {
            console.error("Error closing day:", error);
            alert("Erro ao fechar o dia. Tente novamente.");
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
                        alert("Rota e endereços atualizados com sucesso! Clientes com entrega pendente foram destacados.");
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

    const handleClientClick = (client: Client) => {
        if (updatedClientIds.has(client.id)) {
            setClientToRevert(client);
        } else {
            setSelectedClient(client);
        }
    }

    const handleRevertAction = async () => {
        if (!clientToRevert) return;
        
        try {
            await deletePendingRequestByClientId(clientToRevert.id);
            fetchRequests(); 
            reloadData(); 
            setDirty(true);
            setClientToRevert(null);
        } catch (error) {
            console.error("Failed to revert action", error);
            alert("Erro ao desfazer ação. Tente novamente.");
        }
    }
    
    const getDeliveryBadge = (status: Client['deliveryStatus']) => {
        if (!status || !status.pending) return null;
        
        const badges = {
            new_contract: { color: 'bg-purple-100 text-purple-800', label: 'Novo Contrato' },
            carnet: { color: 'bg-blue-100 text-blue-800', label: 'Entregar Carnê' },
            card: { color: 'bg-orange-100 text-orange-800', label: 'Entregar Cartão' },
            other: { color: 'bg-gray-100 text-gray-800', label: 'Entrega Diversa' }
        };
        
        const style = badges[status.type] || badges.other;
        
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${style.color}`}>
                {style.label}
            </span>
        );
    }
    
    const isLoading = isLoadingData || isFetchingRequests;

    return (
        <>
            <div className="min-h-screen bg-gray-100">
                <Header onLogoutRequest={logout} />
                <main className="p-4 sm:p-8 pb-24">
                    <div className="max-w-4xl mx-auto">
                        
                        {/* Painel Financeiro Consolidado */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-500">
                                <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Saldo Total a Receber</h2>
                                <p className="text-3xl font-bold text-green-600">R$ {financialStats.totalReceivable.toFixed(2).replace('.', ',')}</p>
                                <p className="text-xs text-gray-400 mt-1">Inclui {currentRouteStats.delivered} entregas de hoje</p>
                            </div>
                            <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-500">
                                <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Último Pagamento</h2>
                                <p className="text-3xl font-bold text-blue-600">R$ {financialStats.lastPaidAmount.toFixed(2).replace('.', ',')}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {financialStats.lastPaidDate ? `Em ${new Date(financialStats.lastPaidDate).toLocaleDateString('pt-BR')}` : 'Nenhum pagamento registrado'}
                                </p>
                            </div>
                        </div>

                        {/* Painel de Progresso do Dia */}
                        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 relative overflow-hidden">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-gray-700">Progresso Hoje</h3>
                                <span className="text-sm font-bold text-ds-vinho">{Math.round(currentRouteStats.progress)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                                <div className="bg-ds-vinho h-2.5 rounded-full transition-all duration-500" style={{ width: `${currentRouteStats.progress}%` }}></div>
                            </div>
                            <div className="flex justify-between text-center text-sm">
                                <div>
                                    <p className="text-gray-500 font-semibold">Rota</p>
                                    <p className="font-bold">{currentRouteStats.total}</p>
                                </div>
                                <div>
                                    <p className="text-green-600 font-semibold">Feito</p>
                                    <p className="font-bold">{currentRouteStats.delivered}</p>
                                </div>
                                <div>
                                    <p className="text-orange-600 font-semibold">Falta</p>
                                    <p className="font-bold">{currentRouteStats.pending}</p>
                                </div>
                            </div>
                        </div>

                        {/* Botões de Ação */}
                        <div className="mb-6 flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row gap-3 justify-end">
                                <button
                                    onClick={handleImportRouteClick}
                                    className="bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center shadow-sm w-full sm:w-auto text-sm"
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
                                    onClick={handleCloseDay}
                                    className="bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center shadow-sm w-full sm:w-auto text-sm"
                                >
                                    <MoneyIcon />
                                    Encerrar Dia e Gerar Cobrança
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
                                        <li key={client.id} className={updatedClientIds.has(client.id) ? "bg-gray-50" : ""}>
                                            <div className="flex w-full hover:bg-gray-100 transition-colors relative">
                                                <button 
                                                    onClick={() => handleClientClick(client)}
                                                    className="flex-grow text-left p-4 pr-16 focus:outline-none"
                                                >
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <p className={`font-semibold ${updatedClientIds.has(client.id) ? 'text-green-700 line-through decoration-green-700' : 'text-ds-vinho'}`}>
                                                                {client.name}
                                                            </p>
                                                            {!updatedClientIds.has(client.id) && getDeliveryBadge(client.deliveryStatus)}
                                                        </div>
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
            
            {clientToRevert && (
                <Modal 
                    isOpen={!!clientToRevert} 
                    onClose={() => setClientToRevert(null)} 
                    title="Desfazer Ação"
                >
                    <div className="text-center space-y-4">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-gray-900">Reverter status de {clientToRevert.name}?</p>
                            <p className="text-sm text-gray-500 mt-2">
                                Isso cancelará a confirmação de entrega ou a solicitação de cancelamento enviada. O cliente voltará para a lista de pendentes.
                            </p>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setClientToRevert(null)}
                                className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-300"
                            >
                                Voltar
                            </button>
                            <button
                                onClick={handleRevertAction}
                                className="flex-1 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700"
                            >
                                Sim, Desfazer
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
};

export default EntregadorDashboard;