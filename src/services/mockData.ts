// services/mockData.ts
import type { User, Client, Payment, Doctor, Rating, ServiceHistoryItem, Reminder } from '../types';
import { GOOGLE_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_DRIVE_SCOPE } from '../config';

const BACKUP_STORAGE_KEY = 'descontsaude_backup_data';
const REMINDERS_STORAGE_KEY = 'descontsaude_reminders';
const DRIVE_METADATA_KEY = 'descontsaude_drive_metadata';

interface SyncStatus {
    message: string;
    type: 'success' | 'info' | 'error';
}

// Helper to load Google API scripts dynamically
const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.body.appendChild(script);
  });
};

let isGoogleClientInitialized = false;

// Centralized function to ensure Google API clients are ready
const initializeGoogleClient = async () => {
    if (isGoogleClientInitialized) {
        return;
    }
    try {
        await loadScript('https://apis.google.com/js/api.js');
        await new Promise<void>(resolve => window.gapi.load('client', resolve));
        await window.gapi.client.init({
            apiKey: GOOGLE_API_KEY,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        });
        await loadScript('https://accounts.google.com/gsi/client');
        isGoogleClientInitialized = true;
        console.log("Google API Client initialized successfully.");
    } catch (error) {
        console.error("Failed to initialize Google API client:", error);
        isGoogleClientInitialized = false; // Reset on failure
        throw new Error('Falha ao inicializar a API do Google. Verifique sua conexão e tente novamente.');
    }
};


// Helper to get Google Drive token with user consent if needed
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
                        reject(new Error('Failed to get access token from callback.'));
                    }
                },
                error_callback: (error: any) => {
                    console.error('Google Auth Error:', error);
                    let message = 'Google Authentication failed.';
                    if (error && error.type === 'popup_closed_by_user') {
                        message = 'Login com Google cancelado pelo usuário.';
                    } else if (error && (error.details || error.error)) {
                        message = `Google Authentication failed: ${error.details || error.error}`;
                    }
                    reject(new Error(message));
                }
            });
            tokenClient.requestAccessToken({ prompt });
        } catch (e) {
            reject(e);
        }
    });
};

// Main function to save backup data to Google Drive
export const saveBackupToDrive = async () => {
    await initializeGoogleClient();

    if (!window.gapi || !window.gapi.client || !window.google) {
        throw new Error('Google API client not loaded. Please try again.');
    }

    await getDriveToken('consent');

    const backupData = {
        clients: MOCK_CLIENTS,
        doctors: MOCK_DOCTORS,
        payments: MOCK_PAYMENTS,
    };
    const backupContent = JSON.stringify(backupData, null, 2);

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

    let requestBody;
    let path;
    let method;

    if (latestFile && latestFile.id) {
        path = `/upload/drive/v3/files/${latestFile.id}?uploadType=multipart`;
        method = 'PATCH';
        const metadata = { mimeType: 'application/json' };

        requestBody =
            delimiter +
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
        const metadata = {
            name: fileName,
            mimeType: 'application/json',
        };

        requestBody =
            delimiter +
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
        'headers': {
            'Content-Type': `multipart/related; boundary="${boundary}"`
        },
        'body': requestBody
    });

    return new Promise((resolve, reject) => {
        request.execute((file: any, err: any) => {
            if (err) {
                console.error("Error saving to Drive:", err);
                reject(err);
            } else {
                console.log("File saved to Drive:", file);
                localStorage.setItem(DRIVE_METADATA_KEY, JSON.stringify({ modifiedTime: file.modifiedTime }));
                resolve(file);
            }
        });
    });
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

const rawClients = [
 // ... (JSON data omitted for brevity)
 {
  "Código": "FFADA80BAE774145908E06EFF854C239",
  "Nome": "Elizabete Pinheiro da Rosa",
  "E-mail": "descontsaudesuport@gmail.com",
  "CPF/CNPJ": "94520542049",
  "CEP": "96360000",
  "Endereço": "Bento Gonçalves",
  "Número": "39",
  "Bairro": "RS",
  "Cidade": "Pedro Osório",
  "Estado": "RS",
  "DDD": "53",
  "Telefone": "991476349"
 }
];

const initialDoctors: Doctor[] = [
  // ... (Doctor data omitted for brevity)
  { id: 'doc32', name: 'Farmácia Agafarma', specialty: 'Farmácia', address: 'Rua Comendador Freitas, 219', city: 'Piratini', phone: '(53) 3257-1191' }
];

const initialClients: Client[] = rawClients.map((c: any, index: number) => ({
  id: c['Código'] || `client${index}`,
  contractNumber: `019${String(c['CPF/CNPJ'] || '').replace(/\D/g, '').slice(-8) || String(Date.now() + index).slice(-8)}`,
  name: c['Nome'] || 'Nome não informado',
  cpf: String(c['CPF/CNPJ'] || '').replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') || '000.000.000-00',
  birthDate: '1990-01-01T00:00:00.000Z',
  gender: 'X',
  phone: `(${c['DDD'] || '00'}) ${c['Telefone'] || '00000-0000'}`,
  whatsapp: `(${c['DDD'] || '00'}) ${c['Telefone'] || '00000-0000'}`,
  email: c['E-mail'] || 'email@naoinformado.com',
  address: c['Endereço'] || 'Não informado',
  addressNumber: c['Número'] || 'S/N',
  neighborhood: c['Bairro'] || 'Não informado',
  city: c['Cidade'] || 'Não informada',
  plan: 'Plano Padrão',
  monthlyFee: 26.00,
  registrationFee: 0.00,
  paymentDueDateDay: 20,
  promotion: false,
  salesRep: 'TIAGO SILVA',
  status: 'active',
  dependents: parseDependents(c),
  annotations: c['Anotações'] || '',
}));


export let MOCK_CLIENTS: Client[] = [];
export let MOCK_USERS: User[] = [];
export let MOCK_PAYMENTS: Payment[] = [];
export let MOCK_DOCTORS: Doctor[] = [];
export let MOCK_REMINDERS: Reminder[] = [];
export let MOCK_RATINGS: Rating[] = [];
export let MOCK_SERVICE_HISTORY: ServiceHistoryItem[] = [];

export const saveReminders = () => {
    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(MOCK_REMINDERS));
};

function applyBackupData(data: { clients: Client[], doctors: Doctor[], payments: Payment[] }) {
    MOCK_CLIENTS = data.clients || [];
    MOCK_DOCTORS = data.doctors || [];
    MOCK_PAYMENTS = data.payments || [];

    MOCK_USERS = [
      { id: 'user1', name: 'Admin User', cpf: '111.111.111-11', phone: '(53) 991560861', role: 'admin' },
      ...MOCK_CLIENTS.map((client) => ({
          id: `user-${client.id}`,
          name: client.name,
          cpf: client.cpf,
          phone: client.phone,
          role: 'client' as 'client',
          clientId: client.id
      }))
    ];
}


// New central loading function
export async function loadInitialData(): Promise<SyncStatus | null> {
    // 1. Load from local storage first for speed
    try {
        const storedData = localStorage.getItem(BACKUP_STORAGE_KEY);
        if (storedData) {
            const backup = JSON.parse(storedData);
            if (backup.clients && backup.doctors && backup.payments) {
                applyBackupData(backup);
                console.log("Data loaded from localStorage backup.");
            }
        } else {
            throw new Error("No backup found in localStorage.");
        }
    } catch (e) {
        console.warn("Using initial hardcoded data:", e);
        applyBackupData({ clients: initialClients, doctors: initialDoctors, payments: [] });
    }

    // 2. Load reminders from local storage
    try {
        const storedReminders = localStorage.getItem(REMINDERS_STORAGE_KEY);
        MOCK_REMINDERS = storedReminders ? JSON.parse(storedReminders) : [];
    } catch(e) {
        console.warn("Failed to load reminders from localStorage.", e);
        MOCK_REMINDERS = [];
    }
    
    // 3. In the background, try to sync with Google Drive
    try {
        await initializeGoogleClient();
        await getDriveToken(''); // Attempt silent token request

        const localMeta = JSON.parse(localStorage.getItem(DRIVE_METADATA_KEY) || '{}');
        const driveFiles = await window.gapi.client.drive.files.list({
            'pageSize': 1,
            'fields': "files(id, name, modifiedTime)",
            'q': "name contains 'descontsaude_backup_'",
            'orderBy': 'modifiedTime desc'
        });

        const latestFile = driveFiles.result.files?.[0];
        if (latestFile && latestFile.id && latestFile.modifiedTime && (!localMeta.modifiedTime || new Date(latestFile.modifiedTime) > new Date(localMeta.modifiedTime))) {
             console.log("Newer backup found on Google Drive. Fetching...");
             const fileRes = await window.gapi.client.drive.files.get({ fileId: latestFile.id, alt: 'media' });
             const backupData = JSON.parse(fileRes.body);
             setBackupData(backupData);
             localStorage.setItem(DRIVE_METADATA_KEY, JSON.stringify({ modifiedTime: latestFile.modifiedTime }));
             console.log("Data synced from Google Drive.");
             const date = new Date(latestFile.modifiedTime).toLocaleString('pt-BR');
             return { message: `Backup do Google Drive de ${date} foi restaurado.`, type: 'success' };
        } else {
            console.log("Local data is up-to-date with Google Drive.");
            return { message: 'Seus dados locais já estão atualizados.', type: 'info' };
        }
    } catch (error) {
        console.error("Could not sync with Google Drive on startup:", error);
        return { message: `Falha ao verificar backup no Google Drive: ${(error as Error).message}`, type: 'error' };
    }
}


export const setBackupData = (data: { clients: Client[], doctors: Doctor[], payments: Payment[] }) => {
  if (!data || !Array.isArray(data.clients) || !Array.isArray(data.doctors) || !Array.isArray(data.payments)) {
    throw new Error("Invalid backup file structure.");
  }
  
  localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(data, null, 2));
  localStorage.removeItem(REMINDERS_STORAGE_KEY);
  applyBackupData(data);
  console.log("Backup data restored and saved to localStorage.");
};

export const resetData = () => {
    localStorage.removeItem(BACKUP_STORAGE_KEY);
    localStorage.removeItem(REMINDERS_STORAGE_KEY);
    localStorage.removeItem(DRIVE_METADATA_KEY);
    applyBackupData({ clients: initialClients, doctors: initialDoctors, payments: [] });
    console.log("Data has been reset to initial state.");
};