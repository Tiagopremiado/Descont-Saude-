
import type { User, Client, Payment, Doctor, Rating, ServiceHistoryItem, Reminder, UpdateApprovalRequest, PlanConfig, CourierFinancialRecord, Dependent, ActivityLog } from '../types';
import { GOOGLE_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_DRIVE_SCOPE } from '../config';

const DATA_VERSION = '2025-11-03-RESTORE-FULL'; 
const BACKUP_STORAGE_KEY = 'descontsaude_backup_data';
const VERSION_STORAGE_KEY = 'descontsaude_data_version';
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const BACKUP_FILE_NAME = 'descontsaude_system_backup.json';

export const DEFAULT_PLAN_CONFIG: PlanConfig = {
    individualPrice: 26.00,
    familySmallPrice: 35.00,
    familyMediumPrice: 45.00,
    familyLargePrice: 55.00,
    extraDependentPrice: 10.00
};

// Simplified initial data to ensure file validity and compilation
const initialClientsData: Client[] = [
    {
      "id": "03FB445E36404F0EBD3A5FE7DE3C5331",
      "contractNumber": "01903660063",
      "name": "Maria Helena Magalhães",
      "cpf": "207.036.600-63",
      "birthDate": "1990-01-01T00:00:00.000Z",
      "gender": "X",
      "phone": "(53) 981229291",
      "whatsapp": "(53) 981229291",
      "email": "descontsaudesuport@gmail.com",
      "address": "R. Júlio de Castilhos",
      "addressNumber": "71",
      "neighborhood": "RS",
      "city": "Pedro Osório",
      "plan": "Plano Padrão",
      "monthlyFee": 34,
      "registrationFee": 0,
      "paymentDueDateDay": 20,
      "promotion": false,
      "salesRep": "TIAGO SILVA",
      "status": "active",
      "dependents": [
        {
          "name": "FRANCINE MAGALHÃES VAZ",
          "relationship": "-",
          "status": "active",
          "cpf": "00000000000",
          "birthDate": "2025-11-02",
          "registrationDate": "2025-11-02T14:08:11.985Z",
          "id": "dep1762092492592"
        }
      ],
      "cep": "96360-000",
      "annotations": "",
      "logs": []
    }
    // Add other initial clients here if needed
];

// Initialize mutable mock data arrays
export let MOCK_CLIENTS: Client[] = [...initialClientsData];
export let MOCK_DOCTORS: Doctor[] = [
  { id: 'doc1', name: 'Consultório Odontológico Aline Dias', specialty: 'Dentista', address: 'Rua Alberto Santos Dumont, 1610', city: 'Pedro Osório', phone: '(53) 99966-2292' },
  { id: 'doc2', name: 'Clínica Popular Saúde', specialty: 'Clínico Geral', address: 'Rua Alberto Santos Dumont, 1492', city: 'Pedro Osório', phone: '(53) 3255-1718', whatsapp: '(53) 98404-9462' },
];
export let MOCK_PAYMENTS: Payment[] = [];
export let MOCK_REMINDERS: Reminder[] = [];
export let MOCK_RATINGS: Rating[] = [];
export let MOCK_SERVICE_HISTORY: ServiceHistoryItem[] = [];
export let MOCK_UPDATE_REQUESTS: UpdateApprovalRequest[] = [];
export let MOCK_FINANCIAL_RECORDS: CourierFinancialRecord[] = [];
export let MOCK_PLAN_CONFIG: PlanConfig = { ...DEFAULT_PLAN_CONFIG };

// Derive users from clients + add admin and courier
export let MOCK_USERS: User[] = [
    { id: 'user1', name: 'Admin User', cpf: '111.111.111-11', phone: '(53) 91111-1111', role: 'admin' },
    { id: 'user-entregador', name: 'Entregador', cpf: '000.000.000-00', phone: '(53) 00000-0000', role: 'entregador' },
    ...MOCK_CLIENTS.map((client) => ({
        id: `user-${client.id}`,
        name: client.name,
        cpf: client.cpf,
        phone: client.phone,
        role: 'client' as const,
        clientId: client.id
    }))
];

// Functions

export const saveReminders = () => {
    // In a real app, this would persist to backend. 
    // Here we rely on the main backup/sync mechanism.
};

export const setBackupData = (data: any) => {
    if (data.clients) MOCK_CLIENTS = data.clients;
    if (data.doctors) MOCK_DOCTORS = data.doctors;
    if (data.payments) MOCK_PAYMENTS = data.payments;
    if (data.reminders) MOCK_REMINDERS = data.reminders;
    if (data.updateRequests) MOCK_UPDATE_REQUESTS = data.updateRequests;
    if (data.planConfig) MOCK_PLAN_CONFIG = data.planConfig;
    if (data.financialRecords) MOCK_FINANCIAL_RECORDS = data.financialRecords;

    // Rebuild users
    MOCK_USERS = [
        { id: 'user1', name: 'Admin User', cpf: '111.111.111-11', phone: '(53) 91111-1111', role: 'admin' },
        { id: 'user-entregador', name: 'Entregador', cpf: '000.000.000-00', phone: '(53) 00000-0000', role: 'entregador' },
        ...MOCK_CLIENTS.map((client) => ({
            id: `user-${client.id}`,
            name: client.name,
            cpf: client.cpf,
            phone: client.phone,
            role: 'client' as const,
            clientId: client.id
        }))
    ];
};

export const resetData = () => {
    localStorage.removeItem(BACKUP_STORAGE_KEY);
    localStorage.removeItem(VERSION_STORAGE_KEY);
    // Reloads the page usually handled by caller
};

export const loadLocalData = () => {
    const savedData = localStorage.getItem(BACKUP_STORAGE_KEY);
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            setBackupData(parsedData);
        } catch (e) {
            console.error("Failed to load local data", e);
        }
    }
};

export const loadInitialData = async (): Promise<{ message: string; type: 'success' | 'info' | 'error' } | null> => {
    // This function is simulating a sync with a backend or Google Drive
    // For now, it just loads local data as "sync"
    loadLocalData();
    return { message: 'Dados carregados localmente.', type: 'info' };
};

// Google Drive Integration Mocks/Stubs
// In a real implementation these would interact with the Google API Client Library

export const isGoogleApiInitialized = () => {
    return false; // Stub
};

export const saveBackupToDrive = async () => {
    // Stub
    console.log("Saving to Google Drive (Stubbed)");
    // In real app, persist to local storage as fallback
    const backupData = {
        clients: MOCK_CLIENTS,
        doctors: MOCK_DOCTORS,
        payments: MOCK_PAYMENTS,
        reminders: MOCK_REMINDERS,
        updateRequests: MOCK_UPDATE_REQUESTS,
        planConfig: MOCK_PLAN_CONFIG,
        financialRecords: MOCK_FINANCIAL_RECORDS
    };
    localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(backupData));
    return true;
};

export const syncFromDrive = async () => {
    // Stub
    console.log("Syncing from Google Drive (Stubbed)");
    loadLocalData();
    return { message: 'Sincronização simulada concluída.', type: 'success' as const };
};

export const mergeUpdateRequests = (importedRequests: UpdateApprovalRequest[]) => {
    let count = 0;
    importedRequests.forEach(newReq => {
        if (!MOCK_UPDATE_REQUESTS.some(existing => existing.id === newReq.id)) {
            MOCK_UPDATE_REQUESTS.push(newReq);
            count++;
        }
    });
    return count;
};

export const importRouteData = (routeData: Client[]) => {
    // Update existing clients with address info from routeData
    let count = 0;
    routeData.forEach(routeClient => {
        const index = MOCK_CLIENTS.findIndex(c => c.id === routeClient.id);
        if (index !== -1) {
            // Only update address related fields
            MOCK_CLIENTS[index].address = routeClient.address;
            MOCK_CLIENTS[index].addressNumber = routeClient.addressNumber;
            MOCK_CLIENTS[index].neighborhood = routeClient.neighborhood;
            MOCK_CLIENTS[index].city = routeClient.city;
            count++;
        }
    });
    console.log(`Updated addresses for ${count} clients from route file.`);
};
