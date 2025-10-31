import React, { useState, useEffect, useMemo, useRef } from 'react';
import Header from '../components/Header';
import ClientManagement from '../components/admin/ClientManagement';
import PaymentReports from '../components/admin/PaymentReports';
import DoctorManagement from '../components/admin/DoctorManagement';
import ReminderManagement from '../components/admin/ReminderManagement';
import SalesScripts from '../components/admin/SalesScripts';
import GenerationResultModal from '../components/admin/GenerationResultModal';
import SaveChangesModal from '../components/admin/SaveChangesModal'; // Import the new modal
import { getClients, getReminders } from '../services/apiService';
import { MOCK_CLIENTS, MOCK_DOCTORS, MOCK_PAYMENTS, setBackupData, resetData } from '../services/mockData';
import { GOOGLE_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_DRIVE_SCOPE } from '../config';
import { useData } from '../context/DataContext'; // Import the new context hook
import { useAuth } from '../context/AuthContext'; // Import useAuth for logout
import type { Client, Reminder } from '../types';
import CarnetGeneration from '../components/admin/CarnetGeneration';

declare global {
    interface Window {
        gapi: any;
        google: any;
    }
}

type AdminTab = 'clients' | 'payments' | 'doctors' | 'reminders' | 'sales' | 'carnet';

// Icons remain the same...
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.414l-1.293 1.293a1 1 0 01-1.414-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L13 9.414V13H5.5z" /><path d="M9 13h2v5H9v-5z" /></svg>;
const DriveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>;
const ResetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.898 2.188l-1.583.791A5.002 5.002 0 005.999 7H8a1 1 0 010 2H3a1 1 0 01-1-1V3a1 1 0 011-1zm12 14a1 1 0 01-1-1v-2.101a7.002 7.002 0 01-11.898-2.188l1.583-.791A5.002 5.002 0 0014.001 13H12a1 1 0 010-2h5a1 1 0 011 1v5a1 1 0 01-1 1z" clipRule="evenodd" /></svg>;


const AdminDashboard: React.FC = () => {
    const { isDirty, setDirty } = useData();
    const { logout } = useAuth();
    
    const [activeTab, setActiveTab] = useState<AdminTab>('clients');
    const [clients, setClients] = useState<Client[]>([]);
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterPending, setFilterPending] = useState(false);
    const [generatedClient, setGeneratedClient] = useState<Client | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSavePromptOpen, setIsSavePromptOpen] = useState(false);

    // Google Drive State
    const [isGapiLoaded, setIsGapiLoaded] = useState(false);
    const [isGisLoaded, setIsGisLoaded] = useState(false);
    const [driveSaveState, setDriveSaveState] = useState<'idle' | 'saving' | 'success'>('idle');
    const [driveRestoreState, setDriveRestoreState] = useState<'idle' | 'restoring'>('idle');
    
    // UI components for buttons...
    const ButtonSpinner = () => <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
    const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
    const RestoreFromDriveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>;

    const fetchData = async () => {
        setIsLoading(true);
        const [clientData, reminderData] = await Promise.all([getClients(), getReminders()]);
        setClients(clientData);
        setReminders(reminderData);
        setIsLoading(false);
        setDirty(true); // Set dirty when data is modified by an action
    };

    const fetchInitialData = async () => {
        setIsLoading(true);
        const [clientData, reminderData] = await Promise.all([getClients(), getReminders()]);
        setClients(clientData);
        setReminders(reminderData);
        setIsLoading(false);
        // Do not set dirty on initial load
    }

    // Effect for beforeunload prompt
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (isDirty) {
                event.preventDefault();
                event.returnValue = ''; // Required for cross-browser compatibility
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isDirty]);


    useEffect(() => {
        fetchInitialData();

        // Load Google API scripts...
        const gapiScript = document.createElement('script');
        gapiScript.src = 'https://apis.google.com/js/api.js';
        gapiScript.async = true; gapiScript.defer = true;
        gapiScript.onload = () => window.gapi.load('client', () => setIsGapiLoaded(true));
        document.body.appendChild(gapiScript);

        const gisScript = document.createElement('script');
        gisScript.src = 'https://accounts.google.com/gsi/client';
        gisScript.async = true; gisScript.defer = true;
        gisScript.onload = () => setIsGisLoaded(true);
        document.body.appendChild(gisScript);

    }, []);

    // Other useEffects for Google API remain the same...
    useEffect(() => {
        if (isGapiLoaded) {
             window.gapi.client.init({ apiKey: GOOGLE_API_KEY, discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'], });
        }
    }, [isGapiLoaded]);

    useEffect(() => {
        if (driveSaveState === 'success') {
            const timer = setTimeout(() => setDriveSaveState('idle'), 3000);
            return () => clearTimeout(timer);
        }
    }, [driveSaveState]);


    const pendingClientItemsCount = useMemo(() => {
        const dependentCount = clients.reduce((count, client) => count + client.dependents.filter(d => d.status === 'pending').length, 0);
        const clientCount = clients.filter(c => c.status === 'pending').length;
        return dependentCount + clientCount;
    }, [clients]);
    const pendingRemindersCount = useMemo(() => reminders.filter(r => r.status === 'pending').length, [reminders]);

    const handleLogoutRequest = () => {
        if (isDirty) {
            setIsSavePromptOpen(true);
        } else {
            logout();
        }
    };
    
    // Handlers for client/tab management...
    const handleNotificationClick = () => { setActiveTab('clients'); setFilterPending(true); };
    const handleTabClick = (tab: AdminTab) => { setActiveTab(tab); };
    const handleShowGenerationResult = (client: Client) => { setGeneratedClient(client); };
    
    const handleDownloadBackup = () => {
        const backupData = {
            clients: MOCK_CLIENTS,
            doctors: MOCK_DOCTORS,
            payments: MOCK_PAYMENTS,
        };
        const jsonString = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
    
        const link = document.createElement("a");
        const date = new Date().toISOString().slice(0, 10);
        link.href = url;
        link.download = `descontsaude_backup_${date}.json`;
    
        document.body.appendChild(link);
        link.click();
    
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setDirty(false); // Mark changes as saved
    };

    const handleSaveToDrive = () => {
        return new Promise<void>((resolve, reject) => {
            if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.startsWith('SEU_ID_DE_CLIENTE') || !GOOGLE_API_KEY || GOOGLE_API_KEY.startsWith('SUA_CHAVE_DE_API')) {
                alert("Configuração de API do Google incompleta! Verifique o arquivo src/config.ts");
                reject(new Error("Google API credentials are not configured."));
                return;
            }
            if (!isGapiLoaded || !isGisLoaded) {
                alert("A API do Google Drive ainda não foi carregada. Tente novamente em alguns segundos.");
                reject(new Error("Google API scripts not loaded."));
                return;
            }

            setDriveSaveState('saving');
            
            const tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: GOOGLE_CLIENT_ID,
                scope: GOOGLE_DRIVE_SCOPE,
                callback: (resp: any) => {
                    if (resp.error !== undefined) {
                        setDriveSaveState('idle');
                        console.error("Google Auth Error:", resp);
                        alert(`Erro de autenticação com o Google: ${resp.error}. Verifique se pop-ups estão bloqueados.`);
                        reject(resp.error);
                        return;
                    }
                    
                    const backupData = { clients: MOCK_CLIENTS, doctors: MOCK_DOCTORS, payments: MOCK_PAYMENTS };
                    const jsonString = JSON.stringify(backupData, null, 2);
                    const date = new Date().toISOString().slice(0, 10);
                    const fileName = `descontsaude_backup_${date}.json`;
                    const boundary = '-------314159265358979323846';
                    const delimiter = `\r\n--${boundary}\r\n`;
                    const close_delim = `\r\n--${boundary}--`;
                    const metadata = { name: fileName, mimeType: 'application/json' };
                    const multipartRequestBody = delimiter + 'Content-Type: application/json\r\n\r\n' + JSON.stringify(metadata) + delimiter + 'Content-Type: application/json\r\n\r\n' + jsonString + close_delim;

                    const request = window.gapi.client.request({
                        'path': 'https://www.googleapis.com/upload/drive/v3/files',
                        'method': 'POST',
                        'params': { 'uploadType': 'multipart' },
                        'headers': { 'Content-Type': `multipart/related; boundary=${boundary}` },
                        'body': multipartRequestBody
                    });

                    request.execute((file: any, err: any) => {
                        if (err) {
                            console.error("Google Drive API Error:", err);
                            alert(`Falha ao salvar no Google Drive: ${err.result.error.message}`);
                            setDriveSaveState('idle');
                            reject(err);
                        } else {
                            setDriveSaveState('success');
                            setDirty(false);
                            resolve();
                        }
                    });
                },
            });

            if (window.gapi.client.getToken() === null) {
                tokenClient.requestAccessToken({ prompt: 'consent' });
            } else {
                tokenClient.requestAccessToken({ prompt: '' });
            }
        });
    };

    const handleRestoreFromDrive = () => {
        if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.startsWith('SEU_ID_DE_CLIENTE') || !GOOGLE_API_KEY || GOOGLE_API_KEY.startsWith('SUA_CHAVE_DE_API')) {
            alert("Configuração de API do Google incompleta! Verifique o arquivo src/config.ts");
            return;
        }
        if (!isGapiLoaded || !isGisLoaded) {
            alert("A API do Google Drive ainda não foi carregada. Tente novamente em alguns segundos.");
            return;
        }

        setDriveRestoreState('restoring');

        const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: GOOGLE_DRIVE_SCOPE,
            callback: async (resp: any) => {
                if (resp.error !== undefined) {
                    setDriveRestoreState('idle');
                    console.error("Google Auth Error:", resp);
                    alert(`Erro de autenticação com o Google: ${resp.error}.`);
                    return;
                }
                
                try {
                    const res = await window.gapi.client.drive.files.list({
                        'pageSize': 1,
                        'fields': "nextPageToken, files(id, name)",
                        'q': "name contains 'descontsaude_backup_'",
                        'orderBy': 'modifiedTime desc'
                    });

                    if (res.result.files && res.result.files.length > 0) {
                        const file = res.result.files[0];
                        if (window.confirm(`Restaurar o backup mais recente encontrado: "${file.name}"? TODOS os dados atuais serão substituídos.`)) {
                            const fileRes = await window.gapi.client.drive.files.get({ fileId: file.id, alt: 'media' });
                            const backupData = JSON.parse(fileRes.body);
                            setBackupData(backupData);
                            alert("Backup restaurado com sucesso! A página será recarregada.");
                            window.location.reload();
                        } else {
                           setDriveRestoreState('idle');
                        }
                    } else {
                        alert("Nenhum arquivo de backup da Descont'Saúde encontrado no seu Google Drive.");
                        setDriveRestoreState('idle');
                    }
                } catch (err: any) {
                    console.error("Google Drive API Error:", err);
                    alert(`Falha ao buscar backups: ${err.result?.error?.message || err.message}`);
                    setDriveRestoreState('idle');
                }
            },
        });
        
        if (window.gapi.client.getToken() === null) {
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            tokenClient.requestAccessToken({ prompt: '' });
        }
    };

    const handleRestoreClick = () => { fileInputRef.current?.click(); };
    const handleResetData = () => { if (window.confirm("...")) { resetData(); alert("..."); window.location.reload(); }};
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => { /* ... existing logic ... */ };
    

    const renderContent = () => { /* ... no changes here ... */ 
        switch (activeTab) {
            case 'clients':
                return <ClientManagement 
                            initialClients={clients} 
                            onClientsChange={setClients} 
                            isLoading={isLoading} 
                            filterPending={filterPending}
                            setFilterPending={setFilterPending}
                            onShowGenerationResult={handleShowGenerationResult}
                        />;
            case 'payments':
                return <PaymentReports />;
            case 'doctors':
                return <DoctorManagement />;
            case 'reminders':
                return <ReminderManagement clients={clients} onUpdate={fetchData} initialReminders={reminders} />;
            case 'sales':
                return <SalesScripts />;
            case 'carnet':
                return <CarnetGeneration clients={clients} />;
            default:
                return <ClientManagement 
                            initialClients={clients} 
                            onClientsChange={setClients} 
                            isLoading={isLoading} 
                            filterPending={filterPending}
                            setFilterPending={setFilterPending}
                            onShowGenerationResult={handleShowGenerationResult}
                        />;
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
            <Header pendingCount={pendingClientItemsCount} onNotificationClick={handleNotificationClick} onLogoutRequest={handleLogoutRequest} />
            <main className="p-4 sm:p-8">
                <div className="max-w-7xl mx-auto">
                     <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                        <h2 className="text-3xl font-bold text-ds-vinho">Painel Administrativo</h2>
                        <div className="flex items-center gap-2 mt-4 sm:mt-0 flex-wrap justify-center">
                            <button onClick={handleSaveToDrive} disabled={driveSaveState !== 'idle'} className={`flex items-center text-white font-bold py-2 px-4 rounded-full transition-colors text-sm disabled:opacity-75 ${ driveSaveState === 'success' ? 'bg-green-500' : 'bg-gray-700 hover:bg-gray-800' }`}>
                                {driveSaveState === 'idle' && <><DriveIcon /> Salvar no Drive</>}
                                {driveSaveState === 'saving' && <><ButtonSpinner /> Salvando...</>}
                                {driveSaveState === 'success' && <><CheckIcon /> Salvo!</>}
                            </button>
                            <button onClick={handleRestoreFromDrive} disabled={driveRestoreState === 'restoring'} className="flex items-center bg-yellow-500 text-white font-bold py-2 px-4 rounded-full hover:bg-yellow-600 transition-colors text-sm disabled:opacity-75">
                                {driveRestoreState === 'restoring' ? <><ButtonSpinner /> Buscando...</> : <><RestoreFromDriveIcon /> Restaurar do Drive</>}
                            </button>
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
                            <TabButton tab="doctors" label="Guia Médico" />
                            <TabButton tab="carnet" label="Gerar Carnês" />
                            <TabButton tab="sales" label="Scripts de Venda" />
                        </nav>
                    </div>
                    <div>{renderContent()}</div>
                </div>
            </main>
            
            <GenerationResultModal isOpen={!!generatedClient} onClose={() => setGeneratedClient(null)} client={generatedClient} />

            <SaveChangesModal
                isOpen={isSavePromptOpen}
                onClose={() => setIsSavePromptOpen(false)}
                onSaveDrive={async () => {
                    await handleSaveToDrive();
                    logout();
                }}
                onSaveLocal={() => {
                    handleDownloadBackup();
                    logout();
                }}
                onExitWithoutSaving={logout}
            />
        </div>
    );
};

export default AdminDashboard;