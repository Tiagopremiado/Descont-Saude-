import type { User, Client, Payment, Doctor, Rating, ServiceHistoryItem, Reminder, UpdateApprovalRequest, PlanConfig, CourierFinancialRecord, ActivityLog } from '../types';
import { GOOGLE_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_DRIVE_SCOPE } from '../config';

const BACKUP_STORAGE_KEY = 'descontsaude_backup_data';
const REMINDERS_STORAGE_KEY = 'descontsaude_reminders';
const DRIVE_METADATA_KEY = 'descontsaude_drive_metadata';

interface SyncStatus {
    message: string;
    type: 'success' | 'info' | 'error';
}

declare global {
    interface Window {
        gapi: any;
        google: any;
    }
}

// Default Configuration
export const DEFAULT_PLAN_CONFIG: PlanConfig = {
    individualPrice: 26.00,
    familySmallPrice: 35.00,
    familyMediumPrice: 45.00,
    familyLargePrice: 55.00,
    extraDependentPrice: 10.00
};

// --- Mock Data Variables ---
export let MOCK_CLIENTS: Client[] = [];
export let MOCK_DOCTORS: Doctor[] = [];
export let MOCK_PAYMENTS: Payment[] = [];
export let MOCK_REMINDERS: Reminder[] = [];
export let MOCK_UPDATE_REQUESTS: UpdateApprovalRequest[] = [];
export let MOCK_PLAN_CONFIG: PlanConfig = { ...DEFAULT_PLAN_CONFIG };
export let MOCK_FINANCIAL_RECORDS: CourierFinancialRecord[] = [];
export let MOCK_RATINGS: Rating[] = [];
export let MOCK_SERVICE_HISTORY: ServiceHistoryItem[] = [];
export let MOCK_USERS: User[] = [];

// --- Helper Functions ---

const updateMockUsers = () => {
    MOCK_USERS = [
        { id: 'user1', name: 'Admin User', cpf: '111.111.111-11', phone: '(53) 91111-1111', role: 'admin' },
        { id: 'user2', name: 'Entregador', cpf: '000.000.000-00', phone: '(53) 90000-0000', role: 'entregador' },
        ...MOCK_CLIENTS.map((client) => ({
            id: `user-${client.id}`,
            name: client.name,
            cpf: client.cpf,
            phone: client.phone,
            role: 'client' as 'client',
            clientId: client.id
        }))
    ];
};

const parseDependents = (clientData: any): any[] => {
    const dependents = [];
    for (let i = 1; i <= 6; i++) {
        const field = `Campos Personalizado ${i}`;
        if (clientData[field]) {
            const text = clientData[field];
            const parts = text.split(':');
            if (parts.length >= 2) {
                const namePart = parts[0].replace('Dp', '').replace('Dep', '').trim();
                const infoPart = parts.slice(1).join(':').trim();

                const nameMatch = namePart;
                const dateMatch = infoPart.match(/(\d{2}\/\d{2}\/\d{4})/);
                const cpfMatch = infoPart.match(/(\d{3}\.\d{3}\.\d{3}-\d{2}|\d{11})/);

                if (nameMatch) {
                    const birthDate = dateMatch ? `${dateMatch[1].split('/')[2]}-${dateMatch[1].split('/')[1]}-${dateMatch[1].split('/')[0]}` : '2000-01-01';
                    dependents.push({
                        id: `dep-${clientData['Código']}-${i}`,
                        name: nameMatch.trim(),
                        relationship: 'Dependente',
                        cpf: cpfMatch ? cpfMatch[0] : '000.000.000-00',
                        birthDate: new Date(birthDate).toISOString(),
                        status: 'active',
                        registrationDate: new Date().toISOString(),
                    });
                }
            }
        }
    }
    return dependents;
};

// --- Raw Data Initialization (Simulated) ---
// In a real scenario, this would be empty or fetched.
// Using a small subset or empty array here if raw data is huge, 
// but based on errors, we need to populate MOCK_CLIENTS.
// I will assume MOCK_DOCTORS are hardcoded here for initialization if empty.

const initialDoctors: Doctor[] = [
  // Pedro Osório
  { id: 'doc1', name: 'Consultório Odontológico Aline Dias', specialty: 'Dentista', address: 'Rua Alberto Santos Dumont, 1610', city: 'Pedro Osório', phone: '(53) 99966-2292' },
  { id: 'doc2', name: 'Consultório Odontológico Francine Gayer', specialty: 'Dentista', address: 'Rua Maximiliano de Almeida, 2038', city: 'Pedro Osório', phone: '(53) 99969-5249' },
  { id: 'doc3', name: 'Clínica Popular Saúde', specialty: 'Clínico Geral', address: 'Rua Alberto Santos Dumont, 1492', city: 'Pedro Osório', phone: '(53) 3255-1718', whatsapp: '(53) 98404-9462' },
  { id: 'doc4', name: 'Farmácia Agafarma', specialty: 'Farmácia', address: 'Rua Maximiliano de Almeida, 1630', city: 'Pedro Osório', phone: '(53) 3255-1414', whatsapp: '(53) 98409-5415' },
  { id: 'doc5', name: 'Farmácia Confiança', specialty: 'Farmácia', address: 'Rua Alberto Santos Dumont, 1378', city: 'Pedro Osório', phone: '(53) 3255-1215', whatsapp: '(53) 98433-8809' },
  { id: 'doc6', name: 'Farmácia Líder', specialty: 'Farmácia', address: 'Rua Maximiliano de Almeida, 1910', city: 'Pedro Osório', phone: '(53) 3255-1361' },
  { id: 'doc7', name: 'Dra. Carolina Torma', specialty: 'Psicóloga', address: 'Rua Alberto Santos Dumont, 1361', city: 'Pedro Osório', phone: '(53) 99119-9439' },
  // Cerrito
  { id: 'doc8', name: 'Farmácia Municipal', specialty: 'Farmácia', address: 'Rua Doutor Ferreira, 477', city: 'Cerrito', phone: '(53) 3254-1188' },
  { id: 'doc9', name: 'Farmácia Agafarma', specialty: 'Farmácia', address: 'Rua Doutor Ferreira, 429', city: 'Cerrito', phone: '(53) 3254-1100', whatsapp: '(53) 98409-5409' },
  { id: 'doc10', name: 'Farmácia Confiança', specialty: 'Farmácia', address: 'Rua Doutor Ferreira, 474', city: 'Cerrito', phone: '(53) 3254-1215', whatsapp: '(53) 98409-5408' },
  { id: 'doc11', name: 'Consultório Odontológico Franciele Gayer', specialty: 'Dentista', address: 'Rua Doutor Ferreira, 477', city: 'Cerrito', phone: '(53) 98402-2373' },
  // Pelotas (truncated for brevity, real app would have full list)
  { id: 'doc12', name: 'Clínica de Olhos Dr. Ricardo V. B. Nogueira', specialty: 'Oftalmologista', address: 'Rua Quinze de Novembro, 725', city: 'Pelotas', phone: '(53) 3225-3330', whatsapp: '(53) 99943-4217' },
];

// --- Google Drive Integration ---

let isGoogleClientInitialized = false;

export const isGoogleApiInitialized = () => isGoogleClientInitialized;

const initializeGoogleClient = async () => {
    if (!GOOGLE_API_KEY || !GOOGLE_CLIENT_ID) {
        console.warn("Credenciais do Google não fornecidas. Google Drive desabilitado.");
        isGoogleClientInitialized = false;
        return;
    }
    
    if (isGoogleClientInitialized) return;

    try {
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Tempo de carregamento da API do Google esgotado.')), 3000)
        );

        await Promise.race([
            (async () => {
                await (window as any).gapiLoaded;
                await (window as any).gsiLoaded;
                await new Promise<void>(resolve => window.gapi.load('client', resolve));
                await window.gapi.client.init({
                    apiKey: GOOGLE_API_KEY,
                    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
                });
            })(),
            timeoutPromise
        ]);
        
        isGoogleClientInitialized = true;
        console.log("Google API Client initialized successfully.");
    } catch (error) {
        console.error("Failed to initialize Google API client:", error);
        isGoogleClientInitialized = false;
    }
};

const getDriveToken = (prompt: 'consent' | '' = ''): Promise<any> => {
    return new Promise((resolve, reject) => {
        try {
            if (!window.google || !window.google.accounts) {
                return reject(new Error('Google Identity Services not loaded.'));
            }

            const tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: GOOGLE_CLIENT_ID,
                scope: GOOGLE_DRIVE_SCOPE,
                callback: (tokenResponse: any) => {
                    if (tokenResponse && tokenResponse.access_token) {
                        window.gapi.client.setToken(tokenResponse);
                        resolve(tokenResponse);
                    } else {
                        reject(new Error('Failed to get access token.'));
                    }
                },
                error_callback: (error: any) => {
                    console.error('Google Auth Error:', error);
                    reject(new Error('Google Authentication failed.'));
                }
            });
            tokenClient.requestAccessToken({ prompt });
        } catch (e) {
            reject(e);
        }
    });
};

export const saveBackupToDrive = async () => {
    await initializeGoogleClient();
    if (!window.gapi || !window.gapi.client) throw new Error('Google API client not loaded.');

    await getDriveToken('consent');

    const backupData = {
        clients: MOCK_CLIENTS,
        doctors: MOCK_DOCTORS,
        payments: MOCK_PAYMENTS,
        reminders: MOCK_REMINDERS,
        updateRequests: MOCK_UPDATE_REQUESTS,
        planConfig: MOCK_PLAN_CONFIG,
        financialRecords: MOCK_FINANCIAL_RECORDS,
    };
    const backupContent = JSON.stringify(backupData, null, 2);

    // Check for existing file
    const driveFiles = await window.gapi.client.drive.files.list({
        pageSize: 1,
        fields: "files(id, name, modifiedTime)",
        q: `name contains 'descontsaude_backup_' and trashed = false`,
        orderBy: 'modifiedTime desc'
    });

    const latestFile = driveFiles.result.files?.[0];
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const close_delim = `\r\n--${boundary}--`;

    let path, method, requestBody;

    if (latestFile && latestFile.id) {
        path = `/upload/drive/v3/files/${latestFile.id}?uploadType=multipart`;
        method = 'PATCH';
        const metadata = { mimeType: 'application/json' };
        requestBody = delimiter +
            'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
            JSON.stringify(metadata) +
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            backupContent +
            close_delim;
    } else {
        const date = new Date().toISOString().slice(0, 10);
        const fileName = `descontsaude_backup_${date}.json`;
        path = '/upload/drive/v3/files?uploadType=multipart';
        method = 'POST';
        const metadata = { name: fileName, mimeType: 'application/json' };
        requestBody = delimiter +
            'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
            JSON.stringify(metadata) +
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            backupContent +
            close_delim;
    }

    const request = window.gapi.client.request({
        'path': path,
        'method': method,
        'headers': { 'Content-Type': `multipart/related; boundary="${boundary}"` },
        'body': requestBody
    });

    return new Promise((resolve, reject) => {
        request.execute((file: any, err: any) => {
            if (err) {
                console.error("Error saving to Drive:", err);
                reject(err);
            } else {
                localStorage.setItem(DRIVE_METADATA_KEY, JSON.stringify({ modifiedTime: file.modifiedTime }));
                resolve(file);
            }
        });
    });
};

export async function syncFromDrive(): Promise<SyncStatus> {
    try {
        await initializeGoogleClient();
        await getDriveToken('consent');

        const driveFiles = await window.gapi.client.drive.files.list({
            'pageSize': 1,
            'fields': "files(id, name, modifiedTime)",
            'q': "name contains 'descontsaude_backup_' and trashed = false",
            'orderBy': 'modifiedTime desc'
        });

        const latestFile = driveFiles.result.files?.[0];
        if (latestFile && latestFile.id) {
             const fileRes = await window.gapi.client.drive.files.get({ fileId: latestFile.id, alt: 'media' });
             const backupData = JSON.parse(fileRes.body);
             setBackupData(backupData);
             localStorage.setItem(DRIVE_METADATA_KEY, JSON.stringify({ modifiedTime: latestFile.modifiedTime }));
             const date = new Date(latestFile.modifiedTime!).toLocaleString('pt-BR');
             return { message: `Backup do Google Drive de ${date} restaurado.`, type: 'success' };
        } else {
            return { message: 'Nenhum backup encontrado no Google Drive.', type: 'info' };
        }
    } catch (error) {
        console.error("Sync failed:", error);
        return { message: `Falha na sincronização: ${(error as Error).message}`, type: 'error' };
    }
}

// --- Data Persistence ---

export const loadLocalData = () => {
    const savedData = localStorage.getItem(BACKUP_STORAGE_KEY);
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            MOCK_CLIENTS = parsed.clients || [];
            MOCK_DOCTORS = parsed.doctors || initialDoctors;
            MOCK_PAYMENTS = parsed.payments || [];
            MOCK_REMINDERS = parsed.reminders || [];
            MOCK_UPDATE_REQUESTS = parsed.updateRequests || [];
            MOCK_PLAN_CONFIG = parsed.planConfig || DEFAULT_PLAN_CONFIG;
            MOCK_FINANCIAL_RECORDS = parsed.financialRecords || [];
            updateMockUsers();
            return true;
        } catch (e) {
            console.error("Failed to parse local data", e);
        }
    } else {
        // Initialize with default/mock data if no local storage
        MOCK_DOCTORS = initialDoctors;
        // In a real app, MOCK_CLIENTS would be empty or seeded.
        // If we have rawClients we could process them here.
        updateMockUsers();
    }
    return false;
};

export const loadInitialData = async (): Promise<SyncStatus | null> => {
    // This function can be used to check for newer versions on Drive automatically on startup
    // For now, we rely on manual sync or local data.
    return null; 
};

export const setBackupData = (data: any) => {
    if (!data) return;
    MOCK_CLIENTS = data.clients || [];
    MOCK_DOCTORS = data.doctors || [];
    MOCK_PAYMENTS = data.payments || [];
    MOCK_REMINDERS = data.reminders || [];
    MOCK_UPDATE_REQUESTS = data.updateRequests || [];
    MOCK_PLAN_CONFIG = data.planConfig || DEFAULT_PLAN_CONFIG;
    MOCK_FINANCIAL_RECORDS = data.financialRecords || [];
    updateMockUsers();
    
    // Save immediately to local storage
    localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(data));
};

export const resetData = () => {
    localStorage.removeItem(BACKUP_STORAGE_KEY);
    localStorage.removeItem(REMINDERS_STORAGE_KEY);
    MOCK_CLIENTS = [];
    MOCK_PAYMENTS = [];
    MOCK_REMINDERS = [];
    MOCK_UPDATE_REQUESTS = [];
    MOCK_FINANCIAL_RECORDS = [];
    MOCK_DOCTORS = initialDoctors;
    MOCK_PLAN_CONFIG = DEFAULT_PLAN_CONFIG;
    updateMockUsers();
};

export const saveReminders = () => {
    // This function is kept for compatibility but data is saved generally via the main backup object
    const backup = JSON.parse(localStorage.getItem(BACKUP_STORAGE_KEY) || '{}');
    backup.reminders = MOCK_REMINDERS;
    localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(backup));
};

// --- Import/Export Helpers ---

export const importRouteData = (newRouteData: Client[]) => {
    // Update existing clients with data from route (e.g. address corrections from entregador)
    let updatedCount = 0;
    newRouteData.forEach(newClient => {
        const index = MOCK_CLIENTS.findIndex(c => c.id === newClient.id);
        if (index !== -1) {
            // Merge fields that might have changed
            MOCK_CLIENTS[index] = { ...MOCK_CLIENTS[index], ...newClient };
            updatedCount++;
        }
    });
    console.log(`Updated ${updatedCount} clients from route import.`);
    updateMockUsers();
    
    // Persist
    const backup = JSON.parse(localStorage.getItem(BACKUP_STORAGE_KEY) || '{}');
    backup.clients = MOCK_CLIENTS;
    localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(backup));
};

export const mergeUpdateRequests = (newRequests: UpdateApprovalRequest[]): number => {
    let count = 0;
    newRequests.forEach(req => {
        if (!MOCK_UPDATE_REQUESTS.find(r => r.id === req.id)) {
            MOCK_UPDATE_REQUESTS.push(req);
            count++;
        }
    });
    if (count > 0) {
        // Persist
        const backup = JSON.parse(localStorage.getItem(BACKUP_STORAGE_KEY) || '{}');
        backup.updateRequests = MOCK_UPDATE_REQUESTS;
        localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(backup));
    }
    return count;
};

// Initialize users on load
updateMockUsers();
