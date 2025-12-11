
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Header from '../components/Header';
import ClientManagement from '../components/admin/ClientManagement';
import PaymentReports from '../components/admin/PaymentReports';
import DoctorManagement from '../components/admin/DoctorManagement';
import ReminderManagement from '../components/admin/ReminderManagement';
import InvoiceGeneration from '../components/admin/InvoiceGeneration';
import CarnetGeneration from '../components/admin/CarnetGeneration';
import GenerationResultModal from '../components/admin/GenerationResultModal';
import SaveChangesModal from '../components/admin/SaveChangesModal';
import ApprovalManagement from '../components/admin/ApprovalManagement';
import PlanConfigModal from '../components/admin/PlanConfigModal'; 
import CourierFinance from '../components/admin/CourierFinance'; 
import AdminHome from '../components/admin/AdminHome';
import { setBackupData, resetData, saveBackupToDrive, syncFromDrive, isGoogleApiInitialized, mergeUpdateRequests } from '../services/mockData';
import { useData } from '../context/DataContext'; 
import { useAuth } from '../context/AuthContext'; 
import type { Client } from '../types';

declare global {
    interface Window {
        gapi: any;
        google: any;
    }
}

type AdminTab = 'home' | 'clients' | 'payments' | 'doctors' | 'reminders' | 'invoices' | 'carnet' | 'approvals' | 'courier_finance';

interface SyncStatus {
    message: string;
    type: 'success' | 'info' | 'error';
}

const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.414l-1.293 1.293a1 1 0 01-1.414-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L13 9.414V13H5.5z" /><path d="M9 13h2v5H9v-5z" /></svg>;
const ResetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.898 2.188l-1.583.791A5.002 5.002 0 005.999 7H8a1 1 0 010 2H3a1 1 0 01-1-1V3a1 1 0 011-1zm12 14a1 1 0 01-1-1v-2.101a7.002 7.002 0 01-11.898-2.188l1.583-.791A5.002 5.002 0 0014.001 13H12a1 1 0 010-2h5a1 1 0 011 1v5a1 1 0 01-1 1z" clipRule="evenodd" /></svg>;
const GoogleDriveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.33,7.17H12.8L10.37,2.3A1.5,1.5,0,0,0,8.94,1.5H3.06A1.5,1.5,0,0,0,1.63,2.3L4.2,7.17H0.67a0.67,0.67,0,0,0-.57,1l6.5,11.5a0.67,0.67,0,0,0,1.14,0l3.8-6.75,3.8,6.75a0.67,0.67,0,0,0,1.14,0l6.5-11.5a0.67,0.67,0,0,0-.57-1Z"/>
    </svg>
);
const SyncIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.898 2.188l-1.583.791A5.002 5.002 0 005.999 7H8a1 1 0 010 2H3a1 1 0 01-1-1V3a1 1 0 011-1zm12 14a1 1 0 01-1-1v-2.101a7.002 7.002 0 01-11.898-2.188l1.583-.791A5.002 5.002 0 0014.001 13H12a1 1 0 010-2h5a1 1 0 011 1v5a1 1 0 01-1 1z" clipRule="evenodd" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>;
const DeliveryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" /></svg>;
const SendRouteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /></svg>;
const CodeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>;

const ButtonSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const AdminDashboard: React.FC = () => {
    const { clients, doctors, payments, reminders, isLoadingData, reloadData, isDirty, setDirty, syncStatus, setSyncStatus, updateRequests } = useData();
    const { logout } = useAuth(); 
    
    const [activeTab, setActiveTab] = useState<AdminTab>('home');
    const [filterPending, setFilterPending] = useState(false);
    const [generatedClient, setGeneratedClient] = useState<Client | null>(null);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isSavingToDrive, setIsSavingToDrive] = useState(false);
    const [isSyncingFromDrive, setIsSyncingFromDrive] = useState(false);
    const [isGoogleReady, setIsGoogleReady] = useState(isGoogleApiInitialized());
    const [notification, setNotification] = useState<SyncStatus | null>(null);
    const [isPlanConfigOpen, setIsPlanConfigOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const importInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (syncStatus) {
            setNotification(syncStatus);
            const timer = setTimeout(() => {
                setNotification(null);
            }, 8000); // 8 seconds to display
            setSyncStatus(null); // Clear from context so it doesn't reappear
            setIsGoogleReady(isGoogleApiInitialized());
            return () => clearTimeout(timer);
        }
    }, [syncStatus, setSyncStatus]);

    const pendingClientItemsCount = useMemo(() => {
        const dependentCount = clients.reduce((count, client) => count + client.dependents.filter(d => d.status === 'pending').length, 0);
        const clientCount = clients.filter(c => c.status === 'pending').length;
        return dependentCount + clientCount;
    }, [clients]);
    
    const pendingRemindersCount = useMemo(() => reminders.filter(r => r.status === 'pending').length, [reminders]);
    const pendingApprovalCount = useMemo(() => updateRequests.filter(r => r.status === 'pending').length, [updateRequests]);


    const handleLogoutRequest = () => {
        if (isDirty) {
            setIsSaveModalOpen(true);
        } else {
            logout();
        }
    };
    
    const handleNotificationClick = () => { setActiveTab('clients'); setFilterPending(true); };
    const handleTabClick = (tab: AdminTab) => { setActiveTab(tab); };
    const handleShowGenerationResult = (client: Client) => { setGeneratedClient(client); };
    
    const handleDataUpdate = () => {
        reloadData();
        setDirty(true);
    };

    const handleDownloadBackup = () => {
        const backupData = {
            clients,
            doctors,
            payments,
            reminders,
        };
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent( JSON.stringify(backupData, null, 2) )}`;
        const link = document.createElement("a");
        const date = new Date().toISOString().slice(0, 10);
        link.href = jsonString;
        link.download = `descontsaude_backup_local_${date}.json`;
        link.click();
    };

    // Função para exportar dados LIMPOS para o Desenvolvedor atualizar o código fonte
    const handleExportSystemData = () => {
        // Seleciona apenas os dados que devem ser persistentes no código
        const systemData = {
            clients,
            doctors,
            // Payments e reminders geralmente são dinâmicos e ficam no backup local/drive,
            // mas se você quiser "resetar" o sistema com pagamentos atuais, eles podem ir.
            // Para "atualização cadastral" e "lista de médicos", focamos nesses dois.
        };
        
        const jsonString = JSON.stringify(systemData, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const file = new File([blob], `dados_sistema_master_${new Date().toISOString().slice(0, 10)}.json`, { type: "application/json" });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert("Arquivo 'dados_sistema_master.json' baixado!\n\nEnvie este arquivo para o desenvolvedor para que os Médicos e Clientes sejam atualizados definitivamente no código do sistema.");
    };

    // New Function: Send Route to Entregador
    const handleSendRoute = async () => {
        try {
            // We only send clients list for the route update
            const routeData = clients;
            
            const jsonString = JSON.stringify(routeData, null, 2);
            const blob = new Blob([jsonString], { type: "application/json" });
            const fileName = `rota_atualizada_${new Date().toISOString().slice(0, 10)}.json`;
            const file = new File([blob], fileName, { type: "application/json" });

            // Tenta compartilhar nativamente (WhatsApp/Email) - Prioriza Mobile
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        title: 'Rota Atualizada',
                        text: 'Segue o arquivo com a rota e endereços atualizados para o sistema do entregador.',
                        files: [file]
                    });
                    return; // Se compartilhou, encerra
                } catch (err) {
                    // Se o usuário cancelar ou der erro, cai no fallback abaixo (exceto AbortError que é cancelamento intencional)
                     if ((err as Error).name === 'AbortError') return;
                     console.error("Error sharing route, falling back to download:", err);
                }
            } 

            // Fallback: Baixa o arquivo para envio manual
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Pequeno delay para garantir que o download iniciou antes do alert
            setTimeout(() => {
                 alert("Arquivo da rota baixado! Envie para o entregador via WhatsApp para que ele atualize o sistema.");
            }, 500);

        } catch (error) {
            console.error("Error generating route file:", error);
            alert("Erro ao gerar o arquivo de rota.");
        }
    };

    const handleSaveToDrive = async () => {
        setIsSavingToDrive(true);
        try {
            await saveBackupToDrive();
            setNotification({ message: 'Backup salvo no Google Drive com sucesso!', type: 'success' });
            setDirty(false);
        } catch (error) {
            console.error("Erro ao salvar no Google Drive:", error);
            setNotification({ message: `Falha ao salvar no Google Drive: ${(error as Error).message}`, type: 'error' });
        } finally {
            setIsSavingToDrive(false);
        }
    };

    const handleSyncFromDrive = async () => {
        setIsSyncingFromDrive(true);
        setNotification(null); // Clear previous notifications
        const status = await syncFromDrive();
        setNotification(status); // Show result to user
        if (status.type === 'success') {
            reloadData(); // Refresh data in the UI from context
            setDirty(false); // Syncing brings data up to date, so it's not "dirty" anymore
        }
        setIsSyncingFromDrive(false);
        setIsGoogleReady(isGoogleApiInitialized());
    };
    
    const handleExitWithoutSaving = () => {
        setDirty(false);
        setIsSaveModalOpen(false);
        logout();
    };


    const handleRestoreClick = () => { fileInputRef.current?.click(); };
    const handleImportClick = () => { importInputRef.current?.click(); };

    const handleResetData = () => {
        if (window.confirm("ATENÇÃO: Esta ação apagará TODOS os dados salvos no navegador (clientes, pagamentos, lembretes) e restaurará os dados iniciais do sistema. Esta ação é IRREVERSÍVEL. Deseja continuar?")) {
            resetData();
            alert("Os dados foram resetados. A página será recarregada.");
            window.location.reload();
        }
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("Failed to read file.");
                const backupData = JSON.parse(text);
                if (window.confirm("Você tem certeza que deseja restaurar este backup? TODOS os dados atuais serão substituídos. Esta ação é irreversível.")) {
                    setBackupData(backupData);
                    alert("Backup restaurado com sucesso! A página será recarregada para aplicar as mudanças.");
                    window.location.reload();
                }
            } catch (error) {
                console.error("Error parsing backup file:", error);
                alert("Erro ao ler o arquivo de backup. Verifique se o arquivo é um JSON válido e tem a estrutura correta.");
            }
        };
        reader.readAsText(file);
    };

    const handleImportFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("Failed to read file.");
                const importData = JSON.parse(text);
                
                if (Array.isArray(importData)) {
                    const count = mergeUpdateRequests(importData);
                    if (count > 0) {
                        reloadData();
                        setDirty(true);
                        setNotification({ message: `${count} atualizações importadas com sucesso! Verifique a aba 'Aprovações'.`, type: 'success' });
                        setActiveTab('approvals');
                    } else {
                        setNotification({ message: 'Nenhuma atualização nova encontrada no arquivo.', type: 'info' });
                    }
                } else {
                    throw new Error("Formato inválido");
                }
            } catch (error) {
                console.error("Error parsing import file:", error);
                alert("Erro ao ler o arquivo de importação. Certifique-se que é um arquivo JSON válido gerado pelo entregador.");
            } finally {
                if (importInputRef.current) importInputRef.current.value = "";
            }
        };
        reader.readAsText(file);
    };
    
    const renderContent = () => {
        switch (activeTab) {
            case 'home':
                return <AdminHome />;
            case 'clients':
                return <ClientManagement 
                            initialClients={clients} 
                            onClientsChange={handleDataUpdate} 
                            isLoading={isLoadingData} 
                            filterPending={filterPending}
                            setFilterPending={setFilterPending}
                            onShowGenerationResult={handleShowGenerationResult}
                        />;
            case 'reminders':
                return <ReminderManagement clients={clients} onUpdate={handleDataUpdate} initialReminders={reminders} />;
            case 'approvals':
                return <ApprovalManagement onUpdate={handleDataUpdate} />;
            case 'payments': return <PaymentReports onUpdate={handleDataUpdate} />;
            case 'doctors': return <DoctorManagement onUpdate={handleDataUpdate} />;
            case 'invoices': return <InvoiceGeneration />;
            case 'carnet': return <CarnetGeneration clients={clients} onUpdate={handleDataUpdate} />;
            case 'courier_finance': return <CourierFinance onUpdate={handleDataUpdate} />;
            default: return <AdminHome />;
        }
    };
    
    const TabButton: React.FC<{tab: AdminTab, label: string, count?: number}> = ({ tab, label, count = 0 }) => (
         <button
            onClick={() => handleTabClick(tab)}
            className={`flex items-center whitespace-nowrap space-x-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 ${ activeTab === tab ? 'bg-gray-100 text-ds-vinho border-b-2 border-ds-vinho' : 'text-gray-600 hover:bg-gray-200' }`}
        >
            <span>{label}</span>
            {count > 0 && <span className="ml-2 bg-ds-dourado text-ds-vinho text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>}
        </button>
    );
    
    const notificationStyles = {
        success: 'bg-green-500',
        info: 'bg-blue-500',
        error: 'bg-red-500',
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Header pendingCount={pendingClientItemsCount + pendingRemindersCount + pendingApprovalCount} onNotificationClick={handleNotificationClick} onLogoutRequest={handleLogoutRequest} />
             {notification && (
                <div className={`fixed top-16 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 py-3 text-white rounded-b-lg shadow-lg z-50 text-center ${notificationStyles[notification.type]}`}>
                    {notification.message}
                    <button onClick={() => setNotification(null)} className="absolute top-1/2 -translate-y-1/2 right-4 font-bold text-xl">&times;</button>
                </div>
            )}
            <main className="p-4 sm:p-8">
                <div className="max-w-7xl mx-auto">
                     <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-ds-vinho">Painel Administrativo</h2>
                        <div className="flex items-center gap-2 mt-4 sm:mt-0 flex-wrap justify-center">
                             <button
                                onClick={handleSyncFromDrive}
                                disabled={isSyncingFromDrive || !isGoogleReady}
                                title={!isGoogleReady ? "API do Google indisponível. Configure as chaves de API para usar." : "Sincronizar dados do Google Drive"}
                                className="flex items-center bg-blue-600 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
                            >
                                {isSyncingFromDrive ? <ButtonSpinner /> : <SyncIcon />}
                                {isSyncingFromDrive ? 'Sincronizando...' : 'Sincronizar'}
                            </button>
                            <button
                                onClick={handleSaveToDrive}
                                disabled={isSavingToDrive || !isGoogleReady}
                                title={!isGoogleReady ? "API do Google indisponível. Tente sincronizar primeiro." : "Salvar backup no Google Drive"}
                                className="flex items-center bg-gray-700 text-white font-bold py-2 px-4 rounded-full hover:bg-gray-800 transition-colors text-sm disabled:opacity-50"
                            >
                                {isSavingToDrive ? <ButtonSpinner /> : <GoogleDriveIcon />}
                                {isSavingToDrive ? 'Salvando...' : 'Salvar'}
                            </button>
                            
                            {/* Botão de Exportação para o Desenvolvedor */}
                            <button
                                onClick={handleExportSystemData}
                                className="flex items-center bg-indigo-600 text-white font-bold py-2 px-4 rounded-full hover:bg-indigo-700 transition-colors text-sm"
                                title="Baixar dados atuais (Médicos/Clientes) para atualizar o código fonte do sistema"
                            >
                                <CodeIcon /> Baixar Dados para o Desenvolvedor
                            </button>

                            <button onClick={() => setIsPlanConfigOpen(true)} className="flex items-center bg-ds-dourado text-ds-vinho font-bold py-2 px-4 rounded-full hover:bg-opacity-80 transition-colors text-sm">
                                <SettingsIcon /> Configurar Planos
                            </button>
                            <button onClick={handleSendRoute} className="flex items-center bg-teal-600 text-white font-bold py-2 px-4 rounded-full hover:bg-teal-700 transition-colors text-sm" title="Enviar rota atualizada para o Entregador">
                                <SendRouteIcon /> Enviar Rota (Admin &rarr; Entregador)
                            </button>
                            <button onClick={handleImportClick} className="flex items-center bg-purple-600 text-white font-bold py-2 px-4 rounded-full hover:bg-purple-700 transition-colors text-sm" title="Receber relatório do Entregador">
                                <DeliveryIcon /> Receber (Entregador &rarr; Admin)
                            </button>
                            <input type="file" ref={importInputRef} onChange={handleImportFileChange} className="hidden" accept=".json" />
                            <button onClick={handleDownloadBackup} className="flex items-center bg-blue-500 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-600 transition-colors text-sm">
                                <DownloadIcon /> Backup Local
                            </button>
                            <button onClick={handleRestoreClick} className="flex items-center bg-green-500 text-white font-bold py-2 px-4 rounded-full hover:bg-green-600 transition-colors text-sm">
                                <UploadIcon /> Restaurar Local
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
                            <button onClick={handleResetData} className="flex items-center bg-red-500 text-white font-bold py-2 px-4 rounded-full hover:bg-red-600 transition-colors text-sm">
                                <ResetIcon /> Resetar Dados
                            </button>
                        </div>
                    </div>
                    <div className="border-b border-gray-300 mb-6">
                        <nav className="-mb-px flex space-x-4 overflow-x-auto pb-px">
                            <TabButton tab="home" label="Visão Geral" />
                            <TabButton tab="clients" label="Gerenciar Clientes" count={pendingClientItemsCount} />
                            <TabButton tab="approvals" label="Aprovações" count={pendingApprovalCount} />
                            <TabButton tab="courier_finance" label="Pagamentos Entregador" />
                            <TabButton tab="reminders" label="Lembretes" count={pendingRemindersCount} />
                            <TabButton tab="payments" label="Relatório de Pagamentos" />
                            <TabButton tab="invoices" label="Notas Fiscais" />
                            <TabButton tab="carnet" label="Carnês 2026" />
                            <TabButton tab="doctors" label="Guia Médico" />
                        </nav>
                    </div>
                    <div>{renderContent()}</div>
                </div>
            </main>
            
            <GenerationResultModal isOpen={!!generatedClient} onClose={() => setGeneratedClient(null)} client={generatedClient} />
            <SaveChangesModal
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                onSaveDrive={handleSaveToDrive}
                onSaveLocal={() => { handleDownloadBackup(); handleExitWithoutSaving(); }}
                onExitWithoutSaving={handleExitWithoutSaving}
            />
            <PlanConfigModal
                isOpen={isPlanConfigOpen}
                onClose={() => setIsPlanConfigOpen(false)}
            />
        </div>
    );
};

export default AdminDashboard;
