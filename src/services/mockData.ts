import type { User, Client, Payment, Doctor, Rating, ServiceHistoryItem, Reminder, UpdateApprovalRequest, PlanConfig, CourierFinancialRecord, Dependent, ActivityLog } from '../types';
import { GOOGLE_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_DRIVE_SCOPE } from '../config';

// Atualize esta versão para forçar o recarregamento dos dados no navegador dos usuários
const DATA_VERSION = '2025-12-12-DATA-UPDATE-FULL-V3'; 

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

// --- DADOS DOS CLIENTES ---
export let MOCK_CLIENTS: Client[] = [
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
        },
        {
          "name": "ANTONELLA FERREIRA MAGALHAES",
          "relationship": "-",
          "status": "active",
          "cpf": "00000000000",
          "birthDate": "2025-11-02",
          "registrationDate": "2025-11-02T14:08:52.632Z",
          "id": "dep1762092533232"
        },
        {
          "name": "RODRIGO MAGALHÃES VAZ",
          "relationship": "-",
          "status": "active",
          "cpf": "00000000000",
          "birthDate": "2025-11-02",
          "registrationDate": "2025-11-02T14:09:10.389Z",
          "id": "dep1762092550990"
        },
        {
          "name": "LETICIA FERREIRA MAGALHALHÃES",
          "relationship": "-",
          "status": "active",
          "cpf": "00000000000",
          "birthDate": "2025-11-02",
          "registrationDate": "2025-11-02T14:09:36.980Z",
          "id": "dep1762092577582"
        },
        {
          "name": "OTHÁVIO FERREIRA MAGALHÃES",
          "relationship": "-",
          "status": "active",
          "cpf": "00000000000",
          "birthDate": "2025-11-02",
          "registrationDate": "2025-11-02T14:09:57.677Z",
          "id": "dep1762092598277"
        }
      ],
      "cep": "96360-000"
    },
    {
      "id": "AAA11B4565D4423C94730EF4F5222228",
      "contractNumber": "01922800082",
      "name": "Bruna Schoffer Pereira",
      "cpf": "976.228.000-82",
      "birthDate": "1990-01-01T00:00:00.000Z",
      "gender": "F",
      "phone": "(53) 991596987",
      "whatsapp": "(53) 991596987",
      "email": "descontsaudesuport@gmail.com",
      "address": "Rua orisman Rocha",
      "addressNumber": "39",
      "neighborhood": "RS",
      "city": "Pedro Osório",
      "plan": "Plano Padrão",
      "monthlyFee": 26,
      "registrationFee": 0,
      "paymentDueDateDay": 20,
      "promotion": false,
      "salesRep": "TIAGO SILVA",
      "status": "active",
      "dependents": [],
      "cep": "96360-000"
    }
];

export let MOCK_USERS: User[] = [
    { id: 'user1', name: 'Admin User', cpf: '991.560.861-00', phone: '991560861', role: 'admin' },
    { id: 'entregador1', name: 'Entregador', cpf: '000.000.000-00', phone: 'entregador', role: 'entregador' }
];

export let MOCK_PAYMENTS: Payment[] = [];
export let MOCK_DOCTORS: Doctor[] = [
  { id: 'doc1', name: 'Consultório Odontológico Aline Dias', specialty: 'Dentista', address: 'Rua Alberto Santos Dumont, 1610', city: 'Pedro Osório', phone: '(53) 99966-2292' },
  { id: 'doc2', name: 'Consultório Odontológico Francine Gayer', specialty: 'Dentista', address: 'Rua Maximiliano de Almeida, 2038', city: 'Pedro Osório', phone: '(53) 99969-5249' },
  { id: 'doc3', name: 'Clínica Popular Saúde', specialty: 'Clínico Geral', address: 'Rua Alberto Santos Dumont, 1492', city: 'Pedro Osório', phone: '(53) 3255-1718', whatsapp: '(53) 98404-9462' },
  { id: 'doc4', name: 'Farmácia Agafarma', specialty: 'Farmácia', address: 'Rua Maximiliano de Almeida, 1630', city: 'Pedro Osório', phone: '(53) 3255-1414', whatsapp: '(53) 98409-5415' },
];
export let MOCK_RATINGS: Rating[] = [];
export let MOCK_SERVICE_HISTORY: ServiceHistoryItem[] = [];
export let MOCK_REMINDERS: Reminder[] = [];
export let MOCK_UPDATE_REQUESTS: UpdateApprovalRequest[] = [];
export let MOCK_PLAN_CONFIG: PlanConfig = { ...DEFAULT_PLAN_CONFIG };
export let MOCK_FINANCIAL_RECORDS: CourierFinancialRecord[] = [];

// Helper functions for data management

export const saveReminders = () => {
    // In a real app with local storage persistence only, we'd save to localStorage here
    // But our main persistence strategy for this mock is `saveBackupToDrive` or browser reload persistence handled in DataContext
    // This is just a placeholder to satisfy the import
};

export const setBackupData = (data: any) => {
    if (data.clients) MOCK_CLIENTS = data.clients;
    if (data.doctors) MOCK_DOCTORS = data.doctors;
    if (data.payments) MOCK_PAYMENTS = data.payments;
    if (data.reminders) MOCK_REMINDERS = data.reminders;
    if (data.updateRequests) MOCK_UPDATE_REQUESTS = data.updateRequests;
    if (data.planConfig) MOCK_PLAN_CONFIG = data.planConfig;
    if (data.financialRecords) MOCK_FINANCIAL_RECORDS = data.financialRecords;
    
    // Persist immediately to local storage
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
    localStorage.setItem(VERSION_STORAGE_KEY, DATA_VERSION);
};

export const resetData = () => {
    localStorage.removeItem(BACKUP_STORAGE_KEY);
    localStorage.removeItem(VERSION_STORAGE_KEY);
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

// Google Drive Integration Stubs
export const isGoogleApiInitialized = () => {
    return typeof window.gapi !== 'undefined' && typeof window.google !== 'undefined';
};

export const loadInitialData = async () => {
    // Stub for initial load from Drive
    // In a real implementation, this would use the GAPI client to list files and download the backup
    return null;
};

export const saveBackupToDrive = async () => {
    // Stub for saving to Drive
    // In a real implementation, this would create/update the backup file in Drive
    console.log("Saving backup to drive...");
    return true;
};

export const syncFromDrive = async () => {
    // Stub for sync
    console.log("Syncing from drive...");
    return { message: 'Sincronização simulada com sucesso.', type: 'success' as const };
};

export const mergeUpdateRequests = (newRequests: UpdateApprovalRequest[]) => {
    let count = 0;
    newRequests.forEach(req => {
        if (!MOCK_UPDATE_REQUESTS.find(r => r.id === req.id)) {
            MOCK_UPDATE_REQUESTS.push(req);
            count++;
        }
    });
    return count;
};

export const importRouteData = (routeData: Client[]) => {
    // Updates local clients with data from route file (usually from courier app)
    routeData.forEach(routeClient => {
        const index = MOCK_CLIENTS.findIndex(c => c.id === routeClient.id);
        if (index !== -1) {
            // Update address/contact info
            MOCK_CLIENTS[index].address = routeClient.address;
            MOCK_CLIENTS[index].addressNumber = routeClient.addressNumber;
            MOCK_CLIENTS[index].neighborhood = routeClient.neighborhood;
            MOCK_CLIENTS[index].city = routeClient.city;
            MOCK_CLIENTS[index].phone = routeClient.phone;
            MOCK_CLIENTS[index].whatsapp = routeClient.whatsapp;
            
            // Log the update
            if (!MOCK_CLIENTS[index].logs) MOCK_CLIENTS[index].logs = [];
            MOCK_CLIENTS[index].logs!.unshift({
                id: `log-${Date.now()}`,
                action: 'update',
                description: 'Dados atualizados via importação de rota',
                timestamp: new Date().toISOString(),
                author: 'Entregador (Import)'
            });
        }
    });
};
