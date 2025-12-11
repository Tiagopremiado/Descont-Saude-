
import type { User, Client, Payment, Doctor, Rating, ServiceHistoryItem, Reminder, UpdateApprovalRequest, PlanConfig, CourierFinancialRecord, Dependent, ActivityLog } from '../types';
import { GOOGLE_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_DRIVE_SCOPE } from '../config';

// Atualize esta versão para forçar o recarregamento dos dados no navegador dos usuários
const DATA_VERSION = '2025-11-04-BACKUP-RESTORED-V6'; 

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

// -------------------------------------------------------------------------
// ÁREA DO DESENVOLVEDOR - IMPORTAÇÃO DE DADOS
// -------------------------------------------------------------------------
// Instrução: Para atualizar os dados definitivos do sistema,
// substitua o conteúdo das variáveis MOCK_CLIENTS e MOCK_DOCTORS abaixo
// com o conteúdo do arquivo 'sistema_completo_para_dev.json' gerado pelo Admin.
// -------------------------------------------------------------------------

const parseDependents = (clientData: any): any[] => {
    // Legacy parser for raw imports. Not used if MOCK_CLIENTS is fully populated.
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
                const cpfMatch = infoPart.match(/(\d{3}\.\d{3}\.\d{3}-\d{2})|(\d{11})/);

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

// Legacy Raw Data (Used for initial seed, can be kept or cleared if full MOCK_CLIENTS is provided)
const rawClients = [
 { "Código": "03FB445E36404F0EBD3A5FE7DE3C5331", "Nome": "Maria Helena Magalhães", "E-mail": "descontsaudesuport@gmail.com", "CPF/CNPJ": "20703660063", "CEP": "96360000", "Endereço": "Bento Gonçalves", "Número": "39", "Bairro": "RS", "Cidade": "Pedro Osório", "Estado": "RS", "DDD": "53", "Telefone": "981229291" },
 // ... data truncated for brevity ...
];

// --- DADOS DOS CLIENTES ---
// Substitua esta inicialização se tiver um JSON completo exportado
export let MOCK_CLIENTS: Client[] = rawClients.map((c: any, index: number) => ({
  id: c['Código'] || c['id'] || `client${index}`,
  contractNumber: c['contractNumber'] || `019${String(c['CPF/CNPJ'] || '').replace(/\D/g, '').slice(-8) || String(Date.now() + index).slice(-8)}`,
  name: c['Nome'] || c['name'] || 'Nome não informado',
  cpf: c['cpf'] || String(c['CPF/CNPJ'] || '').replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') || '000.000.000-00',
  birthDate: c['birthDate'] || '1990-01-01T00:00:00.000Z', 
  gender: c['gender'] || 'X',
  phone: c['phone'] || `(${c['DDD'] || '00'}) ${c['Telefone'] || '00000-0000'}`,
  whatsapp: c['whatsapp'] || `(${c['DDD'] || '00'}) ${c['Telefone'] || '00000-0000'}`,
  email: c['E-mail'] || c['email'] || 'email@naoinformado.com',
  address: c['Endereço'] || c['address'] || 'Não informado',
  addressNumber: c['Número'] || c['addressNumber'] || 'S/N',
  neighborhood: c['Bairro'] || c['neighborhood'] || 'Não informado',
  city: c['Cidade'] || c['city'] || 'Não informada',
  plan: c['plan'] || 'Plano Padrão',
  monthlyFee: c['monthlyFee'] || 26.00,
  registrationFee: c['registrationFee'] || 0.00,
  paymentDueDateDay: c['paymentDueDateDay'] || 20,
  promotion: c['promotion'] !== undefined ? c['promotion'] : false,
  salesRep: c['salesRep'] || 'TIAGO SILVA',
  status: c['status'] || 'active',
  dependents: c['dependents'] || parseDependents(c),
  cep: c['CEP'] || c['cep'],
  annotations: c['Anotações'] || c['annotations'] || '',
  logs: c['logs'] || []
}));

// --- DADOS DOS MÉDICOS ---
export let MOCK_DOCTORS: Doctor[] = [
  // ... (Doctors list remains unchanged) ...
  { id: 'doc1', name: 'Consultório Odontológico Aline Dias', specialty: 'Dentista', address: 'Rua Alberto Santos Dumont, 1610', city: 'Pedro Osório', phone: '(53) 99966-2292' },
];

export let MOCK_PAYMENTS: Payment[] = [];
export let MOCK_REMINDERS: Reminder[] = [];
export let MOCK_UPDATE_REQUESTS: UpdateApprovalRequest[] = [];
export let MOCK_FINANCIAL_RECORDS: CourierFinancialRecord[] = [];
export let MOCK_PLAN_CONFIG: PlanConfig = { ...DEFAULT_PLAN_CONFIG };
export let MOCK_RATINGS: Rating[] = [];
export let MOCK_SERVICE_HISTORY: ServiceHistoryItem[] = [];

// Derived MOCK_USERS
export let MOCK_USERS: User[] = [];

const generateMockUsers = () => {
    MOCK_USERS = [
        { id: 'user1', name: 'Admin User', cpf: '111.111.111-11', phone: '(53) 91111-1111', role: 'admin' },
        { id: 'user-entregador', name: 'Entregador', cpf: '000.000.000-00', phone: '(53) 90000-0000', role: 'entregador' },
    ];

    // Create users for CLIENTS
    MOCK_CLIENTS.forEach(client => {
        MOCK_USERS.push({
            id: `user-${client.id}`,
            name: client.name,
            cpf: client.cpf,
            phone: client.phone,
            role: 'client',
            clientId: client.id
        });

        // Create users for DEPENDENTS
        if (client.dependents) {
            client.dependents.forEach(dep => {
                const cleanCpf = dep.cpf.replace(/\D/g, '');
                if (cleanCpf && cleanCpf !== '00000000000') {
                    MOCK_USERS.push({
                        id: `user-dep-${dep.id}`,
                        name: dep.name,
                        cpf: dep.cpf,
                        phone: client.phone, // Dependents share contact
                        role: 'dependent',
                        clientId: client.id,
                        dependentId: dep.id
                    });
                }
            });
        }
    });
    console.log(`Generated ${MOCK_USERS.length} users for login.`);
};

// Initial generation to ensure users exist on first load
generateMockUsers();

// Helper functions for data management
export const loadLocalData = () => {
    try {
        // Check version
        const savedVersion = localStorage.getItem(VERSION_STORAGE_KEY);
        if (savedVersion !== DATA_VERSION) {
            console.log("New data version detected. Resetting local data to defaults.");
            localStorage.removeItem(BACKUP_STORAGE_KEY);
            localStorage.setItem(VERSION_STORAGE_KEY, DATA_VERSION);
            
            // Reset modifiable arrays
            MOCK_PAYMENTS = [];
            MOCK_REMINDERS = [];
            MOCK_UPDATE_REQUESTS = [];
            MOCK_FINANCIAL_RECORDS = [];
            MOCK_PLAN_CONFIG = { ...DEFAULT_PLAN_CONFIG };
            
            // Re-generate users based on the static client list
            generateMockUsers();
            return;
        }

        const savedData = localStorage.getItem(BACKUP_STORAGE_KEY);
        if (savedData) {
            const parsed = JSON.parse(savedData);
            MOCK_CLIENTS = parsed.clients || MOCK_CLIENTS;
            MOCK_DOCTORS = parsed.doctors || MOCK_DOCTORS;
            MOCK_PAYMENTS = parsed.payments || [];
            MOCK_REMINDERS = parsed.reminders || [];
            MOCK_UPDATE_REQUESTS = parsed.updateRequests || [];
            MOCK_FINANCIAL_RECORDS = parsed.financialRecords || [];
            MOCK_PLAN_CONFIG = parsed.planConfig || { ...DEFAULT_PLAN_CONFIG };
        }
        generateMockUsers();
    } catch (e) {
        console.error("Error loading local data", e);
        generateMockUsers();
    }
};

export const loadInitialData = async () => {
    // This is where Google Drive sync would happen
    // For now we assume loadLocalData has run.
    return null;
};

export const saveReminders = () => {
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
    
    generateMockUsers();
    saveReminders(); // Save to local storage
};

export const resetData = () => {
    localStorage.removeItem(BACKUP_STORAGE_KEY);
    localStorage.removeItem(VERSION_STORAGE_KEY);
    // Reloads defaults on next load or refresh
};

// ... (Rest of Google Drive Integration stubs)
export const isGoogleApiInitialized = () => {
    return !!(window.gapi && window.google);
};

export const saveBackupToDrive = async () => {
    // Implementation would go here using gapi
    console.log("Saving to drive...");
    await new Promise(resolve => setTimeout(resolve, 1000));
};

export const syncFromDrive = async () => {
    console.log("Syncing from drive...");
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { message: 'Sincronização simulada concluída.', type: 'success' as const };
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

export const importRouteData = (routeData: any[]) => {
    // Updates addresses of existing clients based on route data
    let count = 0;
    routeData.forEach(routeItem => {
        const client = MOCK_CLIENTS.find(c => c.id === routeItem.id);
        if (client) {
            client.address = routeItem.address || client.address;
            client.addressNumber = routeItem.addressNumber || client.addressNumber;
            client.neighborhood = routeItem.neighborhood || client.neighborhood;
            client.city = routeItem.city || client.city;
            count++;
        }
    });
    console.log(`Updated ${count} clients from route data.`);
    saveReminders();
};
