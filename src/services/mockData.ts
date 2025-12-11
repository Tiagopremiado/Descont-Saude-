import type { User, Client, Payment, Doctor, Rating, ServiceHistoryItem, Reminder, UpdateApprovalRequest, PlanConfig, CourierFinancialRecord, Dependent, ActivityLog } from '../types';
import { GOOGLE_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_DRIVE_SCOPE } from '../config';

// Atualize esta versão para forçar o recarregamento dos dados no navegador dos usuários
const DATA_VERSION = '2025-12-12-DATA-RESTORE-FULL-BACKUP-V1'; 

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
      "id": "04512F1916B1488BA515949A38079309",
      "contractNumber": "01942689008",
      "name": "Josiane Gonçalves Rodrigues",
      "cpf": "006.426.890-08",
      "birthDate": "1990-01-01T00:00:00.000Z",
      "gender": "X",
      "phone": "(53) 530000000",
      "whatsapp": "(53) 530000000",
      "email": "descontsaudesuport@gmail.com",
      "address": "R. Maria Isabel de Souza",
      "addressNumber": "53991560861",
      "neighborhood": "A",
      "city": "Cerrito",
      "plan": "Plano Padrão",
      "monthlyFee": 26,
      "registrationFee": 0,
      "paymentDueDateDay": 20,
      "promotion": false,
      "salesRep": "TIAGO SILVA",
      "status": "active",
      "dependents": [
        {
          "id": "dep-04512F1916B1488BA515949A38079309-1",
          "name": "JARDEL BRAGA FELIX",
          "relationship": "Dependente",
          "cpf": "000.000.000-00",
          "birthDate": "1985-08-20T00:00:00.000Z",
          "status": "active",
          "registrationDate": "2025-10-31T11:07:20.885Z"
        },
        {
          "name": "RAISSA RODRIGUES FELIX",
          "relationship": "-",
          "status": "active",
          "cpf": "00000000000",
          "birthDate": "2025-11-02",
          "registrationDate": "2025-11-02T14:12:27.300Z",
          "id": "dep1762092747901"
        },
        {
          "name": "JOSIMAR GONÇALVES RODRIGUES",
          "relationship": "-",
          "status": "active",
          "cpf": "00000000000",
          "birthDate": "2025-11-02",
          "registrationDate": "2025-11-02T14:12:56.845Z",
          "id": "dep1762092777446"
        },
        {
          "name": "JOSIMERE GONÇALVES RODRIGUES",
          "relationship": "-",
          "status": "active",
          "cpf": "00000000000",
          "birthDate": "2025-11-02",
          "registrationDate": "2025-11-02T14:13:22.353Z",
          "id": "dep1762092802954"
        },
        {
          "name": "IRVANE GONÇALVES RODRIGUES",
          "relationship": "-",
          "status": "active",
          "cpf": "00000000000",
          "birthDate": "2025-11-02",
          "registrationDate": "2025-11-02T14:13:42.786Z",
          "id": "dep1762092823386"
        },
        {
          "name": "ADEMAR FERREIRA RODRIGUES",
          "relationship": "-",
          "status": "active",
          "cpf": "00000000000",
          "birthDate": "2025-11-02",
          "registrationDate": "2025-11-02T14:14:00.558Z",
          "id": "dep1762092841159"
        },
        {
          "name": "LARA SANTANA RODRIGUES",
          "relationship": "-",
          "status": "active",
          "cpf": "00000000000",
          "birthDate": "2025-11-02",
          "registrationDate": "2025-11-02T14:14:20.344Z",
          "id": "dep1762092860947"
        }
      ],
      "cep": "96395-000"
    },
    {
      "id": "AE0187794CA642729B27ADEE2F7E0F71",
      "contractNumber": "01994487069",
      "name": "DANIELE XAVIER MEDEIROS",
      "cpf": "017.944.870-69",
      "birthDate": "1990-01-01T00:00:00.000Z",
      "gender": "X",
      "phone": "(53) 991237969",
      "whatsapp": "(53) 991237969",
      "email": "medeirosxavierdani@gmail.com",
      "address": "IVO PERES",
      "addressNumber": "54",
      "neighborhood": "JAIME PONS",
      "city": "Pedro Osório",
      "plan": "Plano Padrão",
      "monthlyFee": 26,
      "registrationFee": 0,
      "paymentDueDateDay": 20,
      "promotion": false,
      "salesRep": "TIAGO SILVA",
      "status": "inactive",
      "dependents": [
        {
          "id": "dep-AE0187794CA642729B27ADEE2F7E0F71-1",
          "name": "MARCELLE XAVIER MEDEIROS",
          "relationship": "Dependente",
          "cpf": "000.000.000-00",
          "birthDate": "2023-02-15T00:00:00.000Z",
          "status": "active",
          "registrationDate": "2025-10-31T11:07:20.887Z"
        }
      ],
      "cep": "96360-000"
    }
];

export let MOCK_USERS: User[] = [];
export let MOCK_PAYMENTS: Payment[] = [];
export let MOCK_DOCTORS: Doctor[] = [
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

  // Pelotas
  { id: 'doc12', name: 'Clínica de Olhos Dr. Ricardo V. B. Nogueira', specialty: 'Oftalmologista', address: 'Rua Quinze de Novembro, 725', city: 'Pelotas', phone: '(53) 3225-3330', whatsapp: '(53) 99943-4217' },
  { id: 'doc13', name: 'Dr. Cesar R. P. Beltrão', specialty: 'Oftalmologista', address: 'Rua Quinze de Novembro, 742', city: 'Pelotas', phone: '(53) 3222-1138' },
  { id: 'doc14', name: 'Dr. Leonardo P. da Silva', specialty: 'Oftalmologista', address: 'Rua Andrade Neves, 2195', city: 'Pelotas', phone: '(53) 3225-8317' },
  { id: 'doc15', name: 'Laboratório Antonello', specialty: 'Laboratório', address: 'Rua General Osório, 770', city: 'Pelotas', phone: '(53) 3227-1482', whatsapp: '(53) 99173-8181' },
  { id: 'doc16', name: 'Laboratório Thofehrn', specialty: 'Laboratório', address: 'Rua Barão de Santa Tecla, 582', city: 'Pelotas', phone: '(53) 3222-1960', whatsapp: '(53) 98118-2070' },
  { id: 'doc17', name: 'Laboratório Vitaderm', specialty: 'Laboratório', address: 'Rua General Osório, 1125', city: 'Pelotas', phone: '(53) 3227-2300', whatsapp: '(53) 99999-9999' },
  { id: 'doc18', name: 'Dr. João Carlos da S. Pantoja', specialty: 'Clínico Geral', address: 'Rua Félix da Cunha, 766', city: 'Pelotas', phone: '(53) 3227-2342' },
  { id: 'doc19', name: 'Dra. Luiza D. V. Pantoja', specialty: 'Clínico Geral', address: 'Rua Félix da Cunha, 766', city: 'Pelotas', phone: '(53) 3227-2342' },
  { id: 'doc20', name: 'Dr. Fernando L. P. Leite', specialty: 'Otorrinolaringologista', address: 'Rua Voluntários da Pátria, 1174', city: 'Pelotas', phone: '(53) 3222-3868' },
  { id: 'doc21', name: 'Dr. Fernando T. A. Moreira', specialty: 'Cardiologista', address: 'Rua Quinze de Novembro, 963', city: 'Pelotas', phone: '(53) 3222-8350' },
  { id: 'doc22', name: 'Dr. Gustavo N. F. da Rosa', specialty: 'Ginecologista', address: 'Rua Quinze de Novembro, 614', city: 'Pelotas', phone: '(53) 3227-5056' },
  { id: 'doc23', name: 'Dr. Henrique D. de Freitas', specialty: 'Dermatologista', address: 'Rua Quinze de Novembro, 614', city: 'Pelotas', phone: '(53) 3227-5056' },
  { id: 'doc24', name: 'Dra. Carolina G. Saraiva', specialty: 'Pediatra', address: 'Rua Quinze de Novembro, 614', city: 'Pelotas', phone: '(53) 3227-5056' },
  { id: 'doc25', name: 'Dr. Jader B. Cruz', specialty: 'Urologista', address: 'Rua Almirante Barroso, 2307', city: 'Pelotas', phone: '(53) 3222-7945' },
  { id: 'doc26', name: 'Dra. Anelise B. Cruz', specialty: 'Psiquiatra', address: 'Rua Almirante Barroso, 2307', city: 'Pelotas', phone: '(53) 3222-7945' },
  { id: 'doc27', name: 'Consultório Odontológico Dr. Fabrício B. da Silva', specialty: 'Dentista', address: 'Rua Quinze de Novembro, 638', city: 'Pelotas', phone: '(53) 3222-8255' },

  // Canguçu
  { id: 'doc28', name: 'Farmácia Agafarma', specialty: 'Farmácia', address: 'Rua General Osório, 1279', city: 'Canguçu', phone: '(53) 3252-1629' },
  { id: 'doc29', name: 'Farmácia Farmavida', specialty: 'Farmácia', address: 'Rua General Osório, 1060', city: 'Canguçu', phone: '(53) 3252-7070' },

  // Morro Redondo
  { id: 'doc30', name: 'Farmácia Agafarma', specialty: 'Farmácia', address: 'Av. dos Pinhais, 09', city: 'Morro Redondo', phone: '(53) 3224-0010' },

  // Arroio Grande
  { id: 'doc31', name: 'Farmácia Droga Raia', specialty: 'Farmácia', address: 'Rua Dr. Monteiro, 715', city: 'Arroio Grande', phone: '(53) 3262-1088' },

  // Piratini
  { id: 'doc32', name: 'Farmácia Agafarma', specialty: 'Farmácia', address: 'Rua Comendador Freitas, 219', city: 'Piratini', phone: '(53) 3257-1191' }
];
export let MOCK_RATINGS: Rating[] = [];
export let MOCK_SERVICE_HISTORY: ServiceHistoryItem[] = [];
export let MOCK_REMINDERS: Reminder[] = [];
export let MOCK_UPDATE_REQUESTS: UpdateApprovalRequest[] = [];
export let MOCK_PLAN_CONFIG: PlanConfig = { ...DEFAULT_PLAN_CONFIG };
export let MOCK_FINANCIAL_RECORDS: CourierFinancialRecord[] = [];

// Initialize Users logic
const initializeUsers = () => {
    MOCK_USERS = [
        { id: 'user1', name: 'Admin User', cpf: '111.111.111-11', phone: '(53) 91111-1111', role: 'admin' },
        { id: 'user-entregador', name: 'Entregador', cpf: '000.000.000-00', phone: '(00) 00000-0000', role: 'entregador' },
        ...MOCK_CLIENTS.map((client) => ({
            id: `user-${client.id}`,
            name: client.name,
            cpf: client.cpf,
            phone: client.phone,
            role: 'client' as const,
            clientId: client.id
        }))
    ];
    // Add dependents as users
    MOCK_CLIENTS.forEach(client => {
        if(client.dependents) {
            client.dependents.forEach(dep => {
                 // Only add if they have a CPF (login identifier)
                 if(dep.cpf && dep.cpf !== '000.000.000-00' && dep.cpf.replace(/\D/g, '').length === 11) {
                     MOCK_USERS.push({
                        id: `user-dep-${dep.id}`,
                        name: dep.name,
                        cpf: dep.cpf,
                        phone: client.phone, // Shares phone with titular usually
                        role: 'dependent' as const,
                        clientId: client.id,
                        dependentId: dep.id
                     });
                 }
            });
        }
    });
};

const saveToLocalStorage = () => {
    const backupData = {
        clients: MOCK_CLIENTS,
        doctors: MOCK_DOCTORS,
        payments: MOCK_PAYMENTS,
        reminders: MOCK_REMINDERS,
        updateRequests: MOCK_UPDATE_REQUESTS,
        planConfig: MOCK_PLAN_CONFIG,
        financialRecords: MOCK_FINANCIAL_RECORDS,
    };
    localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(backupData));
    localStorage.setItem(VERSION_STORAGE_KEY, DATA_VERSION);
};

export const loadLocalData = () => {
    const savedData = localStorage.getItem(BACKUP_STORAGE_KEY);
    const savedVersion = localStorage.getItem(VERSION_STORAGE_KEY);

    if (savedData) {
        if (savedVersion === DATA_VERSION) {
            try {
                const parsed = JSON.parse(savedData);
                if (parsed.clients) MOCK_CLIENTS = parsed.clients;
                if (parsed.doctors) MOCK_DOCTORS = parsed.doctors;
                if (parsed.payments) MOCK_PAYMENTS = parsed.payments;
                if (parsed.reminders) MOCK_REMINDERS = parsed.reminders;
                if (parsed.updateRequests) MOCK_UPDATE_REQUESTS = parsed.updateRequests;
                if (parsed.planConfig) MOCK_PLAN_CONFIG = parsed.planConfig;
                if (parsed.financialRecords) MOCK_FINANCIAL_RECORDS = parsed.financialRecords;
            } catch (e) {
                console.error("Error loading local data", e);
            }
        } else {
            console.log("Data version mismatch. Using default mock data.");
            // Optionally migrate data here if needed, or just overwrite
            localStorage.setItem(VERSION_STORAGE_KEY, DATA_VERSION);
            saveToLocalStorage(); // Overwrite old data with new structure/mocks
        }
    } else {
        saveToLocalStorage();
    }
    initializeUsers();
};

export const loadInitialData = async (): Promise<{ message: string, type: 'success' | 'info' | 'error' } | null> => {
    // This function can simulate async loading or real API call
    return null;
};

export const saveReminders = () => {
    saveToLocalStorage();
};

export const setBackupData = (data: any) => {
    if (data.clients) MOCK_CLIENTS = data.clients;
    if (data.doctors) MOCK_DOCTORS = data.doctors;
    if (data.payments) MOCK_PAYMENTS = data.payments;
    if (data.reminders) MOCK_REMINDERS = data.reminders;
    if (data.updateRequests) MOCK_UPDATE_REQUESTS = data.updateRequests;
    if (data.planConfig) MOCK_PLAN_CONFIG = data.planConfig;
    if (data.financialRecords) MOCK_FINANCIAL_RECORDS = data.financialRecords;
    
    initializeUsers();
    saveToLocalStorage();
};

export const resetData = () => {
    localStorage.removeItem(BACKUP_STORAGE_KEY);
    localStorage.removeItem(VERSION_STORAGE_KEY);
};

export const saveBackupToDrive = async () => {
    // Placeholder for Google Drive API interaction
    console.log("Saving to Google Drive...");
    return new Promise<void>((resolve) => setTimeout(resolve, 1000));
};

export const syncFromDrive = async (): Promise<{ message: string, type: 'success' | 'info' | 'error' }> => {
    // Placeholder for Google Drive API interaction
    console.log("Syncing from Google Drive...");
    return new Promise((resolve) => setTimeout(() => resolve({ message: "Sync not implemented", type: 'info' }), 1000));
};

export const isGoogleApiInitialized = () => {
    return false; // Set to true if Google API is configured
};

export const mergeUpdateRequests = (newRequests: UpdateApprovalRequest[]) => {
    let count = 0;
    newRequests.forEach(req => {
        if (!MOCK_UPDATE_REQUESTS.find(r => r.id === req.id)) {
            MOCK_UPDATE_REQUESTS.unshift(req);
            count++;
        }
    });
    saveToLocalStorage();
    return count;
};

export const importRouteData = (routeData: any[]) => {
    // Logic to update client addresses from a simple route list if needed
    // This is a placeholder logic
    let updatedCount = 0;
    routeData.forEach(routeItem => {
        const client = MOCK_CLIENTS.find(c => c.id === routeItem.id);
        if (client) {
            if (routeItem.address && client.address !== routeItem.address) {
                client.address = routeItem.address;
                updatedCount++;
            }
            // Add other fields as necessary
        }
    });
    if (updatedCount > 0) saveToLocalStorage();
};

// Initial call to set up users if data is already loaded (e.g. from static MOCK_CLIENTS)
initializeUsers();
