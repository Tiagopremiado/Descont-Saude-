import type { User, Client, Payment, Doctor, Rating, ServiceHistoryItem, Reminder, UpdateApprovalRequest, PlanConfig, CourierFinancialRecord, Dependent, ActivityLog } from '../types';
import { GOOGLE_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_DRIVE_SCOPE } from '../config';

// Versão atualizada para forçar recarregamento dos dados
const DATA_VERSION = '2025-12-14-FULL-DB-RESTORE-V6'; 

const BACKUP_STORAGE_KEY = 'descontsaude_backup_data';
const VERSION_STORAGE_KEY = 'descontsaude_data_version';

export const DEFAULT_PLAN_CONFIG: PlanConfig = {
    individualPrice: 26.00,
    familySmallPrice: 35.00,
    familyMediumPrice: 45.00,
    familyLargePrice: 55.00,
    extraDependentPrice: 10.00
};

// --- DATA STORAGE VARIABLES ---
export let MOCK_CLIENTS: Client[] = [];
export let MOCK_USERS: User[] = [];
export let MOCK_PAYMENTS: Payment[] = [];
export let MOCK_DOCTORS: Doctor[] = [];
export let MOCK_RATINGS: Rating[] = [];
export let MOCK_SERVICE_HISTORY: ServiceHistoryItem[] = [];
export let MOCK_REMINDERS: Reminder[] = [];
export let MOCK_UPDATE_REQUESTS: UpdateApprovalRequest[] = [];
export let MOCK_PLAN_CONFIG: PlanConfig = { ...DEFAULT_PLAN_CONFIG };
export let MOCK_FINANCIAL_RECORDS: CourierFinancialRecord[] = [];

// --- HELPER FUNCTIONS ---

const parseDependents = (clientData: any): Dependent[] => {
    const dependents: Dependent[] = [];
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
                        id: `dep-${clientData['Código'] || Date.now()}-${i}`,
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

// Initial Raw Data (Truncated for brevity, normally this would be the full list)
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
 {
  "Código": "04512F1916B1488BA515949A38079309",
  "Nome": "Josiane Gonçalves Rodrigues",
  "E-mail": "descontsaudesuport@gmail.com",
  "CPF/CNPJ": "00642689008",
  "CEP": "96360000",
  "Endereço": "Whatsapp Descont' saúde ",
  "Número": "53991560861",
  "Bairro": "A",
  "Cidade": "Pedro Osório",
  "Estado": "RS",
  "DDD": "53",
  "Telefone": "530000000",
  "Campos Personalizado 1": "JARDEL BRAGA FELIX : 20/08/1985"
 },
 // ... Add more clients here if needed
];

const initialDoctors: Doctor[] = [
  { id: 'doc1', name: 'Consultório Odontológico Aline Dias', specialty: 'Dentista', address: 'Rua Alberto Santos Dumont, 1610', city: 'Pedro Osório', phone: '(53) 99966-2292' },
  { id: 'doc2', name: 'Consultório Odontológico Francine Gayer', specialty: 'Dentista', address: 'Rua Maximiliano de Almeida, 2038', city: 'Pedro Osório', phone: '(53) 99969-5249' },
  { id: 'doc3', name: 'Clínica Popular Saúde', specialty: 'Clínico Geral', address: 'Rua Alberto Santos Dumont, 1492', city: 'Pedro Osório', phone: '(53) 3255-1718', whatsapp: '(53) 98404-9462' },
  { id: 'doc4', name: 'Farmácia Agafarma', specialty: 'Farmácia', address: 'Rua Maximiliano de Almeida, 1630', city: 'Pedro Osório', phone: '(53) 3255-1414', whatsapp: '(53) 98409-5415' },
];

// --- INITIALIZATION LOGIC ---

const initializeData = () => {
    // 1. Initialize Clients
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
      cep: c['CEP']
    }));

    // 2. Initialize Users (Admin, Entregador, Clients/Dependents)
    MOCK_USERS = [
      { id: 'user1', name: 'Admin User', cpf: '111.111.111-11', phone: '(53) 91111-1111', role: 'admin' },
      { id: 'user2', name: 'Entregador', cpf: '222.222.222-22', phone: '(53) 92222-2222', role: 'entregador' },
      ...MOCK_CLIENTS.map((client) => ({
          id: `user-${client.id}`,
          name: client.name,
          cpf: client.cpf,
          phone: client.phone,
          role: 'client' as 'client',
          clientId: client.id
      }))
    ];

    // 3. Initialize Payments (Mock Data)
    MOCK_PAYMENTS = MOCK_CLIENTS.flatMap(client => ([
        { id: `pay-${client.id}-1`, clientId: client.id, amount: client.monthlyFee, month: 'Maio', year: 2024, dueDate: `2024-05-${client.paymentDueDateDay}T00:00:00.000Z`, status: 'paid' },
        { id: `pay-${client.id}-2`, clientId: client.id, amount: client.monthlyFee, month: 'Junho', year: 2024, dueDate: `2024-06-${client.paymentDueDateDay}T00:00:00.000Z`, status: 'paid' },
        { id: `pay-${client.id}-3`, clientId: client.id, amount: client.monthlyFee, month: 'Julho', year: 2024, dueDate: `2024-07-${client.paymentDueDateDay}T00:00:00.000Z`, status: 'pending' },
    ]));

    // 4. Initialize Doctors
    MOCK_DOCTORS = [...initialDoctors];
    
    // 5. Initialize others as empty
    MOCK_REMINDERS = [];
    MOCK_UPDATE_REQUESTS = [];
    MOCK_PLAN_CONFIG = { ...DEFAULT_PLAN_CONFIG };
    MOCK_FINANCIAL_RECORDS = [];
};

// Run initialization immediately on load
initializeData();


// --- EXPORTED SERVICE FUNCTIONS ---

export const setBackupData = (data: any) => {
  if (!data) return;
  if (data.clients) MOCK_CLIENTS = data.clients;
  if (data.doctors) MOCK_DOCTORS = data.doctors;
  if (data.payments) MOCK_PAYMENTS = data.payments;
  if (data.reminders) MOCK_REMINDERS = data.reminders;
  if (data.updateRequests) MOCK_UPDATE_REQUESTS = data.updateRequests;
  if (data.planConfig) MOCK_PLAN_CONFIG = data.planConfig;
  
  // Re-generate users based on the new client list
  MOCK_USERS = [
      { id: 'user1', name: 'Admin User', cpf: '111.111.111-11', phone: '(53) 91111-1111', role: 'admin' },
      { id: 'user2', name: 'Entregador', cpf: '222.222.222-22', phone: '(53) 92222-2222', role: 'entregador' },
      ...MOCK_CLIENTS.map((client) => ({
          id: `user-${client.id}`,
          name: client.name,
          cpf: client.cpf,
          phone: client.phone,
          role: 'client' as 'client',
          clientId: client.id
      }))
  ];
  console.log("Backup data restored successfully in memory.");
};

export const resetData = () => {
    localStorage.removeItem(BACKUP_STORAGE_KEY);
    initializeData();
};

export const saveReminders = () => {
    // In a real app with local storage persistence, this would save the state.
    // For this mock structure where state is kept in memory variables that are then 
    // saved via 'setBackupData' or the whole state dump, this function is a placeholder 
    // or can trigger a local storage save of the whole state.
    const backupData = {
        clients: MOCK_CLIENTS,
        doctors: MOCK_DOCTORS,
        payments: MOCK_PAYMENTS,
        reminders: MOCK_REMINDERS,
        updateRequests: MOCK_UPDATE_REQUESTS,
        planConfig: MOCK_PLAN_CONFIG,
    };
    localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(backupData));
};

export const saveBackupToDrive = async () => {
    console.log("Mock: Saving to Google Drive...");
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
};

export const syncFromDrive = async () => {
    console.log("Mock: Syncing from Google Drive...");
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { message: "Simulação: Sincronização concluída com sucesso.", type: "success" as const };
};

export const isGoogleApiInitialized = () => {
    // Check if API keys are present (basic check)
    return !!GOOGLE_API_KEY && !!GOOGLE_CLIENT_ID;
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

export const loadLocalData = () => {
    const backup = localStorage.getItem(BACKUP_STORAGE_KEY);
    if (backup) {
        try {
            const parsed = JSON.parse(backup);
            setBackupData(parsed);
        } catch (e) {
            console.error("Failed to load local data", e);
        }
    }
};

export const loadInitialData = async () => {
    loadLocalData();
    // In a real app, this might check for a newer version on the server/drive
    return null;
};

export const importRouteData = (data: any[]) => {
    if (!Array.isArray(data)) return;
    let count = 0;
    data.forEach(item => {
        // Assuming item has name and address fields
        const clientIndex = MOCK_CLIENTS.findIndex(c => c.name === item.name);
        if (clientIndex !== -1) {
            if (item.address) MOCK_CLIENTS[clientIndex].address = item.address;
            if (item.addressNumber) MOCK_CLIENTS[clientIndex].addressNumber = item.addressNumber;
            if (item.neighborhood) MOCK_CLIENTS[clientIndex].neighborhood = item.neighborhood;
            if (item.city) MOCK_CLIENTS[clientIndex].city = item.city;
            count++;
        }
    });
    console.log(`Updated ${count} clients from route data.`);
};
