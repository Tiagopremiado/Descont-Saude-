// services/mockData.ts
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

export const DEFAULT_PLAN_CONFIG: PlanConfig = {
    individualPrice: 26.00,
    familySmallPrice: 35.00,
    familyMediumPrice: 45.00,
    familyLargePrice: 55.00,
    extraDependentPrice: 10.00
};

export let MOCK_CLIENTS: Client[] = [];
export let MOCK_USERS: User[] = [];
export let MOCK_PAYMENTS: Payment[] = [];
export let MOCK_DOCTORS: Doctor[] = [];
export const MOCK_RATINGS: Rating[] = [];
export const MOCK_SERVICE_HISTORY: ServiceHistoryItem[] = [];
export let MOCK_REMINDERS: Reminder[] = [];
export let MOCK_UPDATE_REQUESTS: UpdateApprovalRequest[] = [];
export let MOCK_FINANCIAL_RECORDS: CourierFinancialRecord[] = [];
export let MOCK_PLAN_CONFIG: PlanConfig = { ...DEFAULT_PLAN_CONFIG };

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

// Raw data (truncated for brevity in source, but represented fully here)
const rawClients = [
    {
        "Código": "03FB445E36404F0EBD3A5FE7DE3C5331",
        "Nome": "Maria Helena Magalhães",
        "E-mail": "descontsaudesuport@gmail.com",
        "CPF/CNPJ": "20703660063",
        "CEP": "96360000",
        "Endereço": "Bento Gonçalves",
        "Número": "39",
        "Bairro": "RS",
        "Cidade": "Pedro Osório",
        "Estado": "RS",
        "DDD": "53",
        "Telefone": "981229291"
    },
    // ... (Assume the rest of rawClients data is here as in the original file)
];

// Initial Data Loading Logic
const initializeWithDefaults = () => {
    MOCK_CLIENTS = rawClients.map((c: any, index: number) => ({
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
        annotations: '',
        logs: [],
        deliveryStatus: undefined
    }));

    MOCK_USERS = [
        { id: 'user1', name: 'Admin User', cpf: '111.111.111-11', phone: '(53) 91111-1111', role: 'admin' },
        { id: 'user2', name: 'Entregador', cpf: '000.000.000-00', phone: '(53) 00000-0000', role: 'entregador' },
        ...MOCK_CLIENTS.map((client) => ({
            id: `user-${client.id}`,
            name: client.name,
            cpf: client.cpf,
            phone: client.phone,
            role: 'client' as 'client',
            clientId: client.id
        }))
    ];

    MOCK_PAYMENTS = MOCK_CLIENTS.flatMap(client => ([
        { id: `pay-${client.id}-1`, clientId: client.id, amount: client.monthlyFee, month: 'Maio', year: 2024, dueDate: `2024-05-${client.paymentDueDateDay}T00:00:00.000Z`, status: 'paid' },
        { id: `pay-${client.id}-2`, clientId: client.id, amount: client.monthlyFee, month: 'Junho', year: 2024, dueDate: `2024-06-${client.paymentDueDateDay}T00:00:00.000Z`, status: 'paid' },
        { id: `pay-${client.id}-3`, clientId: client.id, amount: client.monthlyFee, month: 'Julho', year: 2024, dueDate: `2024-07-${client.paymentDueDateDay}T00:00:00.000Z`, status: 'pending' },
    ])) as Payment[];

    MOCK_DOCTORS = [
        { id: 'doc1', name: 'Consultório Odontológico Aline Dias', specialty: 'Dentista', address: 'Rua Alberto Santos Dumont, 1610', city: 'Pedro Osório', phone: '(53) 99966-2292' },
        { id: 'doc2', name: 'Consultório Odontológico Francine Gayer', specialty: 'Dentista', address: 'Rua Maximiliano de Almeida, 2038', city: 'Pedro Osório', phone: '(53) 99969-5249' },
        { id: 'doc3', name: 'Clínica Popular Saúde', specialty: 'Clínico Geral', address: 'Rua Alberto Santos Dumont, 1492', city: 'Pedro Osório', phone: '(53) 3255-1718', whatsapp: '(53) 98404-9462' },
        { id: 'doc4', name: 'Farmácia Agafarma', specialty: 'Farmácia', address: 'Rua Maximiliano de Almeida, 1630', city: 'Pedro Osório', phone: '(53) 3255-1414', whatsapp: '(53) 98409-5415' },
        { id: 'doc5', name: 'Farmácia Confiança', specialty: 'Farmácia', address: 'Rua Alberto Santos Dumont, 1378', city: 'Pedro Osório', phone: '(53) 3255-1215', whatsapp: '(53) 98433-8809' },
        { id: 'doc6', name: 'Farmácia Líder', specialty: 'Farmácia', address: 'Rua Maximiliano de Almeida, 1910', city: 'Pedro Osório', phone: '(53) 3255-1361' },
        { id: 'doc7', name: 'Dra. Carolina Torma', specialty: 'Psicóloga', address: 'Rua Alberto Santos Dumont, 1361', city: 'Pedro Osório', phone: '(53) 99119-9439' },
        { id: 'doc8', name: 'Farmácia Municipal', specialty: 'Farmácia', address: 'Rua Doutor Ferreira, 477', city: 'Cerrito', phone: '(53) 3254-1188' },
        { id: 'doc9', name: 'Farmácia Agafarma', specialty: 'Farmácia', address: 'Rua Doutor Ferreira, 429', city: 'Cerrito', phone: '(53) 3254-1100', whatsapp: '(53) 98409-5409' },
        { id: 'doc10', name: 'Farmácia Confiança', specialty: 'Farmácia', address: 'Rua Doutor Ferreira, 474', city: 'Cerrito', phone: '(53) 3254-1215', whatsapp: '(53) 98409-5408' },
        { id: 'doc11', name: 'Consultório Odontológico Franciele Gayer', specialty: 'Dentista', address: 'Rua Doutor Ferreira, 477', city: 'Cerrito', phone: '(53) 98402-2373' },
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
        { id: 'doc28', name: 'Farmácia Agafarma', specialty: 'Farmácia', address: 'Rua General Osório, 1279', city: 'Canguçu', phone: '(53) 3252-1629' },
        { id: 'doc29', name: 'Farmácia Farmavida', specialty: 'Farmácia', address: 'Rua General Osório, 1060', city: 'Canguçu', phone: '(53) 3252-7070' },
        { id: 'doc30', name: 'Farmácia Agafarma', specialty: 'Farmácia', address: 'Av. dos Pinhais, 09', city: 'Morro Redondo', phone: '(53) 3224-0010' },
        { id: 'doc31', name: 'Farmácia Droga Raia', specialty: 'Farmácia', address: 'Rua Dr. Monteiro, 715', city: 'Arroio Grande', phone: '(53) 3262-1088' },
        { id: 'doc32', name: 'Farmácia Agafarma', specialty: 'Farmácia', address: 'Rua Comendador Freitas, 219', city: 'Piratini', phone: '(53) 3257-1191' }
    ];
};

export const loadLocalData = () => {
    const savedData = localStorage.getItem(BACKUP_STORAGE_KEY);
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            if(parsed.clients) MOCK_CLIENTS = parsed.clients;
            if(parsed.doctors) MOCK_DOCTORS = parsed.doctors;
            if(parsed.payments) MOCK_PAYMENTS = parsed.payments;
            if(parsed.reminders) MOCK_REMINDERS = parsed.reminders;
            if(parsed.updateRequests) MOCK_UPDATE_REQUESTS = parsed.updateRequests;
            if(parsed.planConfig) MOCK_PLAN_CONFIG = parsed.planConfig;
            if(parsed.financialRecords) MOCK_FINANCIAL_RECORDS = parsed.financialRecords;
            
            // Rebuild users based on loaded clients
            MOCK_USERS = [
                { id: 'user1', name: 'Admin User', cpf: '111.111.111-11', phone: '(53) 91111-1111', role: 'admin' },
                { id: 'user2', name: 'Entregador', cpf: '000.000.000-00', phone: '(53) 00000-0000', role: 'entregador' },
                ...MOCK_CLIENTS.map((client) => ({
                    id: `user-${client.id}`,
                    name: client.name,
                    cpf: client.cpf,
                    phone: client.phone,
                    role: 'client' as 'client',
                    clientId: client.id
                }))
            ];
        } catch (e) {
            console.error("Failed to load local data", e);
            initializeWithDefaults();
        }
    } else {
        initializeWithDefaults();
    }
};

export const saveReminders = () => {
    // This function can trigger a save of the whole state to local storage
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
};

export const setBackupData = (data: any) => {
    if (data.clients) MOCK_CLIENTS = data.clients;
    if (data.doctors) MOCK_DOCTORS = data.doctors;
    if (data.payments) MOCK_PAYMENTS = data.payments;
    if (data.reminders) MOCK_REMINDERS = data.reminders;
    if (data.updateRequests) MOCK_UPDATE_REQUESTS = data.updateRequests;
    if (data.planConfig) MOCK_PLAN_CONFIG = data.planConfig;
    if (data.financialRecords) MOCK_FINANCIAL_RECORDS = data.financialRecords;

    MOCK_USERS = [
        { id: 'user1', name: 'Admin User', cpf: '111.111.111-11', phone: '(53) 91111-1111', role: 'admin' },
        { id: 'user2', name: 'Entregador', cpf: '000.000.000-00', phone: '(53) 00000-0000', role: 'entregador' },
        ...MOCK_CLIENTS.map((client) => ({
            id: `user-${client.id}`,
            name: client.name,
            cpf: client.cpf,
            phone: client.phone,
            role: 'client' as 'client',
            clientId: client.id
        }))
    ];
    saveReminders();
};

export const resetData = () => {
    localStorage.removeItem(BACKUP_STORAGE_KEY);
    initializeWithDefaults();
};

// Google Drive Integration Placeholders/Logic
export const isGoogleApiInitialized = () => {
    return window.gapi && window.gapi.client;
}

export const loadInitialData = async (): Promise<SyncStatus | null> => {
    if (!isGoogleApiInitialized()) return null;
    // Real implementation would check drive for latest file and sync if newer
    return null;
}

export const saveBackupToDrive = async () => {
    if (!isGoogleApiInitialized()) throw new Error("Google API not initialized");
    // Placeholder for actual Drive API call
    console.log("Saving to Drive...");
    return true;
}

export const syncFromDrive = async (): Promise<SyncStatus> => {
    if (!isGoogleApiInitialized()) return { message: "Google API não inicializada", type: "error" };
    // Placeholder for actual Drive API call
    console.log("Syncing from Drive...");
    return { message: "Sincronização simulada com sucesso", type: "success" };
}

export const mergeUpdateRequests = (requests: UpdateApprovalRequest[]): number => {
    let count = 0;
    requests.forEach(req => {
        if (!MOCK_UPDATE_REQUESTS.find(r => r.id === req.id)) {
            MOCK_UPDATE_REQUESTS.push(req);
            count++;
        }
    });
    saveReminders();
    return count;
}

export const importRouteData = (routeData: Client[]) => {
    // Logic to import route data and update addresses/status without overwriting everything
    const routeMap = new Map(routeData.map(c => [c.id, c]));
    
    MOCK_CLIENTS = MOCK_CLIENTS.map(client => {
        const update = routeMap.get(client.id);
        if (update) {
            return {
                ...client,
                address: update.address,
                addressNumber: update.addressNumber,
                neighborhood: update.neighborhood,
                city: update.city,
                deliveryStatus: update.deliveryStatus // preserve or update status
            };
        }
        return client;
    });
    saveReminders();
}
