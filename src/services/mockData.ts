// services/mockData.ts
import type { User, Client, Payment, Doctor, Rating, ServiceHistoryItem } from '../types';

const BACKUP_STORAGE_KEY = 'descontsaude_backup_data';

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
 {
  "Código": "05196B68BA4D46D6B04D8E3D7BCD0571",
  "Nome": "Maria Dorcelina O. Jurgina",
  "E-mail": "descontsaudesuport@gmail.com",
  "CPF/CNPJ": "57176060010",
  "CEP": "96360000",
  "Endereço": "Whatsapp Descont' saúde ",
  "Número": "53991560861",
  "Bairro": "RS",
  "Cidade": "Pedro Osório",
  "Estado": "RS",
  "DDD": "53",
  "Telefone": "991631918"
 },
 // ... (restante dos dados brutos omitido para brevidade)
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
}));

const initialDoctors: Doctor[] = [
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

export let MOCK_CLIENTS: Client[];
export let MOCK_USERS: User[];
export let MOCK_PAYMENTS: Payment[];
export let MOCK_DOCTORS: Doctor[];
export let MOCK_RATINGS: Rating[] = [];
export let MOCK_SERVICE_HISTORY: ServiceHistoryItem[] = [];

function loadData() {
  try {
    const storedData = localStorage.getItem(BACKUP_STORAGE_KEY);
    if (storedData) {
      const backup = JSON.parse(storedData);
      if (backup.clients && backup.doctors && backup.payments) {
        MOCK_CLIENTS = backup.clients;
        MOCK_DOCTORS = backup.doctors;
        MOCK_PAYMENTS = backup.payments;
        console.log("Data loaded from localStorage backup.");
      } else {
        throw new Error("Backup data is invalid.");
      }
    } else {
      throw new Error("No backup found in localStorage.");
    }
  } catch (e) {
    console.warn("Failed to load from localStorage, using initial data:", e);
    MOCK_CLIENTS = initialClients;
    MOCK_DOCTORS = initialDoctors;
    MOCK_PAYMENTS = initialClients.flatMap(client => ([
        { id: `pay-${client.id}-1`, clientId: client.id, amount: client.monthlyFee, month: 'Maio', year: 2024, dueDate: `2024-05-${client.paymentDueDateDay}T00:00:00.000Z`, status: 'paid' },
        { id: `pay-${client.id}-2`, clientId: client.id, amount: client.monthlyFee, month: 'Junho', year: 2024, dueDate: `2024-06-${client.paymentDueDateDay}T00:00:00.000Z`, status: 'paid' },
        { id: `pay-${client.id}-3`, clientId: client.id, amount: client.monthlyFee, month: 'Julho', year: 2024, dueDate: `2024-07-${client.paymentDueDateDay}T00:00:00.000Z`, status: 'pending' },
    ]));
  }
  
  MOCK_USERS = [
    { id: 'user1', name: 'Admin User', cpf: '111.111.111-11', phone: '(53) 91111-1111', role: 'admin' },
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

loadData();

export const setBackupData = (data: { clients: Client[], doctors: Doctor[], payments: Payment[] }) => {
  if (!data || !Array.isArray(data.clients) || !Array.isArray(data.doctors) || !Array.isArray(data.payments)) {
    throw new Error("Invalid backup file structure.");
  }
  
  localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(data, null, 2));

  MOCK_CLIENTS = data.clients;
  MOCK_DOCTORS = data.doctors;
  MOCK_PAYMENTS = data.payments;
  
  MOCK_USERS = [
    { id: 'user1', name: 'Admin User', cpf: '111.111.111-11', phone: '(53) 91111-1111', role: 'admin' },
    ...MOCK_CLIENTS.map((client) => ({
        id: `user-${client.id}`,
        name: client.name,
        cpf: client.cpf,
        phone: client.phone,
        role: 'client' as 'client',
        clientId: client.id
    }))
  ];
  console.log("Backup data restored and saved to localStorage.");
};

export const resetData = () => {
    localStorage.removeItem(BACKUP_STORAGE_KEY);
    loadData();
    console.log("Data has been reset to initial state.");
};
