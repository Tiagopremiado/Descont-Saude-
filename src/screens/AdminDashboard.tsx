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
import { MOCK_CLIENTS, MOCK_DOCTORS, MOCK_PAYMENTS, setBackupData, resetData, saveBackupToDrive } from '../services/mockData';
import { useData } from '../context/DataContext'; 
import { useAuth } from '../context/AuthContext'; 
import type { Client, Reminder } from '../types';

declare global {
    interface Window {
        gapi: any;
        google: any;
    }
}

type AdminTab = 'clients' | 'payments' | 'doctors' | 'reminders' | 'invoices' | 'carnet';

const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.414l-1.293 1.293a1 1 0 01-1.414-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L13 9.414V13H5.5z" /><path d="M9 13h2v5H9v-5z" /></svg>;
const ResetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.898 2.188l-1.583.791A5.002 5.002 0 005.999 7H8a1 1 0 010 2H3a1 1 0 01-1-1V3a1 1 0 011-1zm12 14a1 1 0 01-1-1v-2.101a7.002 7.002 0 01-11.898-2.188l1.583-.791A5.002 5.002 0 0014.001 13H12a1 1 0 010-2h5a1 1 0 011 1v5a1 1 0 01-1 1z" clipRule="evenodd" /></svg>;

const AdminDashboard: React.FC = () => {
    const { clients, reminders, isLoadingData, reloadData, isDirty, setDirty } = useData();
    const { logout } = useAuth(); 
    
    const [activeTab, setActiveTab] = useState<AdminTab>('clients');
    const [filterPending, setFilterPending] = useState(false);
    const [generatedClient, setGeneratedClient] = useState<Client | null>(null);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const pendingClientItemsCount = useMemo(() => {
        const dependentCount = clients.reduce((count, client) => count + client.dependents.filter(d => d.status === 'pending').length, 0);
        const clientCount = clients.filter(c => c.status === 'pending').length;
        return dependentCount + clientCount;
    }, [clients]);
    
    const pendingRemindersCount = useMemo(() => reminders.filter(r => r.status === 'pending').length, [reminders]);

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
        const backupData = { clients: MOCK_CLIENTS, doctors: MOCK_DOCTORS, payments: MOCK_PAYMENTS };
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent( JSON.stringify(backupData, null, 2) )}`;
        const link = document.createElement("a");
        const date = new Date().toISOString().slice(0, 10);
        link.href = jsonString;
        link.download = `descontsaude_backup_${date}.json`;
        link.click();
    };

    const handleSaveToDrive = async () => {
        try {
            await saveBackupToDrive();
            setDirty(false);
            setIsSaveModalOpen(false);
            logout();
        } catch (error) {
            alert("Erro ao salvar no Google Drive. Verifique se o login está ativo e tente novamente.");
            console.error(error);
        }
    };

    const handleExitWithoutSaving = () => {
        setDirty(false);
        setIsSaveModalOpen(false);
        logout();
    };


    const handleRestoreClick = () => { fileInputRef.current?.click(); };

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
    
    const renderContent = () => {
        switch (activeTab) {
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
            case 'payments': return <PaymentReports onUpdate={handleDataUpdate} />;
            case 'doctors': return <DoctorManagement onUpdate={handleDataUpdate} />;
            case 'invoices': return <InvoiceGeneration />;
            case 'carnet': return <CarnetGeneration clients={clients} onUpdate={handleDataUpdate} />;
            default: return null;
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

    return (
        <div className="min-h-screen bg-gray-100">
            <Header pendingCount={pendingClientItemsCount + pendingRemindersCount} onNotificationClick={handleNotificationClick} onLogoutRequest={handleLogoutRequest} />
            <main className="p-4 sm:p-8">
                <div className="max-w-7xl mx-auto">
                     <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-ds-vinho">Painel Administrativo</h2>
                        <div className="flex items-center gap-2 mt-4 sm:mt-0 flex-wrap justify-center">
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
                            <TabButton tab="clients" label="Gerenciar Clientes" count={pendingClientItemsCount} />
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
        </div>
    );
};

export default AdminDashboard;