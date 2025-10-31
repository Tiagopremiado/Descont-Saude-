import { MOCK_CLIENTS, MOCK_PAYMENTS, MOCK_DOCTORS, MOCK_RATINGS, MOCK_SERVICE_HISTORY, MOCK_REMINDERS, saveReminders } from './mockData';
import type { Client, Payment, Doctor, Rating, ServiceHistoryItem, Dependent, Reminder } from '../types';

// Simulate API delay
const apiDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- Client Services ---

export const getClients = async (): Promise<Client[]> => {
  await apiDelay(500);
  return JSON.parse(JSON.stringify(MOCK_CLIENTS)); // Return a deep copy
};

export const getClientById = async (id: string): Promise<Client | undefined> => {
  await apiDelay(300);
  const client = MOCK_CLIENTS.find(c => c.id === id);
  return client ? JSON.parse(JSON.stringify(client)) : undefined;
};

export const addClient = async (clientData: Omit<Client, 'id' | 'contractNumber'>): Promise<Client> => {
    await apiDelay(700);
    const timestamp = Date.now();
    const newClient: Client = {
        ...clientData,
        id: `client${timestamp}`,
        contractNumber: `019${String(timestamp).slice(-8)}`,
        dependents: clientData.dependents.map((dep, index) => ({
            ...dep,
            id: `dep${Date.now()}${index}`,
            status: 'active',
            registrationDate: new Date().toISOString(),
        })),
    };
    MOCK_CLIENTS.push(newClient);
    return JSON.parse(JSON.stringify(newClient));
};

export const updateClient = async (id: string, updatedData: Client): Promise<Client> => {
    await apiDelay(500);
    const clientIndex = MOCK_CLIENTS.findIndex(c => c.id === id);
    if (clientIndex === -1) {
        throw new Error('Client not found');
    }
    MOCK_CLIENTS[clientIndex] = JSON.parse(JSON.stringify(updatedData));
    return MOCK_CLIENTS[clientIndex];
};

export const resetClientPassword = async (clientId: string): Promise<{ success: true }> => {
    await apiDelay(500);
    // In a real app, this would trigger a password reset flow (e.g., send an email).
    // Here, we just log it, as the mock auth uses a static password.
    console.log(`Password for client ${clientId} has been reset to the default 'password123'.`);
    return { success: true };
};


// --- Dependent Services ---

export const requestAddDependent = async (clientId: string, dependentData: Omit<Dependent, 'id' | 'status' | 'registrationDate' | 'inactivationDate'>): Promise<Client | null> => {
    await apiDelay(600);
    const clientIndex = MOCK_CLIENTS.findIndex(c => c.id === clientId);
    if (clientIndex === -1) return null;

    const newDependent: Dependent = {
        ...dependentData,
        id: `dep${Date.now()}`,
        status: 'pending',
        registrationDate: new Date().toISOString(),
    };
    
    MOCK_CLIENTS[clientIndex].dependents.push(newDependent);
    return JSON.parse(JSON.stringify(MOCK_CLIENTS[clientIndex]));
};

// Admin action to add an active dependent directly
export const addDependent = async (clientId: string, dependentData: Omit<Dependent, 'id' | 'inactivationDate'>): Promise<Client | null> => {
    await apiDelay(600);
    const clientIndex = MOCK_CLIENTS.findIndex(c => c.id === clientId);
    if (clientIndex === -1) return null;

    const newDependent: Dependent = {
        ...dependentData,
        id: `dep${Date.now()}`,
    };
    
    MOCK_CLIENTS[clientIndex].dependents.push(newDependent);
    return JSON.parse(JSON.stringify(MOCK_CLIENTS[clientIndex]));
};

const updateDependentStatus = (clientId: string, dependentId: string, status: Dependent['status']): Client | null => {
    const clientIndex = MOCK_CLIENTS.findIndex(c => c.id === clientId);
    if (clientIndex === -1) return null;

    const dependentIndex = MOCK_CLIENTS[clientIndex].dependents.findIndex(d => d.id === dependentId);
    if (dependentIndex === -1) return null;

    MOCK_CLIENTS[clientIndex].dependents[dependentIndex].status = status;
    if (status === 'inactive') {
        MOCK_CLIENTS[clientIndex].dependents[dependentIndex].inactivationDate = new Date().toISOString();
    } else {
         delete MOCK_CLIENTS[clientIndex].dependents[dependentIndex].inactivationDate;
    }

    return JSON.parse(JSON.stringify(MOCK_CLIENTS[clientIndex]));
}

export const approveDependent = async (clientId: string, dependentId: string): Promise<Client | null> => {
    await apiDelay(400);
    return updateDependentStatus(clientId, dependentId, 'active');
};

export const rejectDependent = async (clientId: string, dependentId: string): Promise<Client | null> => {
    await apiDelay(400);
    const clientIndex = MOCK_CLIENTS.findIndex(c => c.id === clientId);
    if (clientIndex === -1) return null;

    MOCK_CLIENTS[clientIndex].dependents = MOCK_CLIENTS[clientIndex].dependents.filter(d => d.id !== dependentId);
    
    return JSON.parse(JSON.stringify(MOCK_CLIENTS[clientIndex]));
};

export const inactivateDependent = async (clientId: string, dependentId: string): Promise<Client | null> => {
    await apiDelay(400);
    return updateDependentStatus(clientId, dependentId, 'inactive');
}

export const reactivateDependent = async (clientId: string, dependentId: string): Promise<Client | null> => {
    await apiDelay(400);
    return updateDependentStatus(clientId, dependentId, 'active');
}


// --- Payment Services ---

export const getPaymentsByClientId = async (clientId: string): Promise<Payment[]> => {
  await apiDelay(400);
  return JSON.parse(JSON.stringify(MOCK_PAYMENTS.filter(p => p.clientId === clientId)));
};

export const getAllPayments = async (): Promise<Payment[]> => {
    await apiDelay(600);
    return JSON.parse(JSON.stringify(MOCK_PAYMENTS));
}

const monthMap: Record<string, number> = { "Janeiro": 0, "Fevereiro": 1, "Março": 2, "Abril": 3, "Maio": 4, "Junho": 5, "Julho": 6, "Agosto": 7, "Setembro": 8, "Outubro": 9, "Novembro": 10, "Dezembro": 11 };

export const generateNewInvoice = async (clientId: string, month: string, year: number): Promise<Payment> => {
    await apiDelay(1000);
    const client = MOCK_CLIENTS.find(c => c.id === clientId);
    if (!client) throw new Error("Client not found");

    const monthIndex = monthMap[month];
    if (monthIndex === undefined) throw new Error("Invalid month name");

    const newPayment: Payment = {
        id: `pay${Date.now()}`,
        clientId,
        amount: client.monthlyFee,
        month,
        year,
        dueDate: new Date(year, monthIndex, client.paymentDueDateDay).toISOString(),
        status: 'pending',
    };
    MOCK_PAYMENTS.push(newPayment);
    return JSON.parse(JSON.stringify(newPayment));
};

export const generateAnnualCarnet = async (clientId: string, year: number): Promise<Payment[]> => {
    await apiDelay(1500); // Simulate a longer process
    const client = MOCK_CLIENTS.find(c => c.id === clientId);
    if (!client) {
        throw new Error("Client not found");
    }

    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const newPayments: Payment[] = [];

    for (let i = 0; i < 12; i++) {
        // Check if a payment for this month/year already exists to avoid duplicates
        const existingPayment = MOCK_PAYMENTS.find(p => p.clientId === clientId && p.month === months[i] && p.year === year);
        if (!existingPayment) {
            const newPayment: Payment = {
                id: `pay-${clientId}-${year}-${i}`,
                clientId,
                amount: client.monthlyFee,
                month: months[i],
                year: year,
                dueDate: new Date(year, i, client.paymentDueDateDay).toISOString(),
                status: 'pending',
            };
            newPayments.push(newPayment);
        }
    }

    MOCK_PAYMENTS.push(...newPayments);
    
    return JSON.parse(JSON.stringify(newPayments));
};


export const generateCustomCharge = async (clientId: string, amount: number, description: string): Promise<Payment> => {
    await apiDelay(800);
    const client = MOCK_CLIENTS.find(c => c.id === clientId);
    if (!client) throw new Error("Client not found");

    const now = new Date();
    const dueDate = new Date(now);
    dueDate.setDate(now.getDate() + 10); // Due in 10 days

    const newPayment: Payment = {
        id: `pay${Date.now()}`,
        clientId,
        amount,
        month: description,
        year: now.getFullYear(),
        dueDate: dueDate.toISOString(),
        status: 'pending',
    };
    MOCK_PAYMENTS.push(newPayment);
    return JSON.parse(JSON.stringify(newPayment));
};

export const updatePaymentStatus = async (paymentId: string, status: Payment['status']): Promise<Payment | null> => {
    await apiDelay(400);
    const paymentIndex = MOCK_PAYMENTS.findIndex(p => p.id === paymentId);
    if (paymentIndex === -1) {
        return null;
    }
    MOCK_PAYMENTS[paymentIndex].status = status;
    return JSON.parse(JSON.stringify(MOCK_PAYMENTS[paymentIndex]));
};


// --- Doctor Services ---

export const getDoctors = async (): Promise<Doctor[]> => {
  await apiDelay(200);
  return JSON.parse(JSON.stringify(MOCK_DOCTORS));
};

export const addDoctor = async (doctorData: Omit<Doctor, 'id'>): Promise<Doctor> => {
    await apiDelay(500);
    const newDoctor: Doctor = {
        ...doctorData,
        id: `doc${Date.now()}`,
    };
    MOCK_DOCTORS.push(newDoctor);
    return JSON.parse(JSON.stringify(newDoctor));
};

export const updateDoctor = async (id: string, updatedData: Doctor): Promise<Doctor> => {
    await apiDelay(400);
    const docIndex = MOCK_DOCTORS.findIndex(d => d.id === id);
    if (docIndex === -1) {
        throw new Error('Doctor not found');
    }
    MOCK_DOCTORS[docIndex] = JSON.parse(JSON.stringify(updatedData));
    return MOCK_DOCTORS[docIndex];
};

export const deleteDoctor = async (id: string): Promise<{ success: true }> => {
    await apiDelay(300);
    const docIndex = MOCK_DOCTORS.findIndex(d => d.id === id);
    if (docIndex === -1) {
        throw new Error('Doctor not found');
    }
    MOCK_DOCTORS.splice(docIndex, 1);
    return { success: true };
};


// --- Reminder Services ---

export const getReminders = async (): Promise<Reminder[]> => {
  await apiDelay(300);
  return JSON.parse(JSON.stringify(MOCK_REMINDERS));
};

export const addReminder = async (reminderData: Omit<Reminder, 'id' | 'createdAt' | 'status'>): Promise<Reminder> => {
    await apiDelay(500);
    const newReminder: Reminder = {
        ...reminderData,
        id: `rem${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'pending',
    };
    MOCK_REMINDERS.unshift(newReminder);
    saveReminders();
    return JSON.parse(JSON.stringify(newReminder));
};

export const updateReminderStatus = async (id: string, status: Reminder['status']): Promise<Reminder | null> => {
    await apiDelay(400);
    const reminderIndex = MOCK_REMINDERS.findIndex(r => r.id === id);
    if (reminderIndex === -1) return null;

    MOCK_REMINDERS[reminderIndex].status = status;
    saveReminders();
    return JSON.parse(JSON.stringify(MOCK_REMINDERS[reminderIndex]));
};

export const deleteReminder = async (id: string): Promise<{ success: true }> => {
    await apiDelay(300);
    const initialLength = MOCK_REMINDERS.length;
    let indexToDelete = -1;
    for(let i = 0; i < MOCK_REMINDERS.length; i++) {
        if(MOCK_REMINDERS[i].id === id) {
            indexToDelete = i;
            break;
        }
    }
    
    if (indexToDelete === -1) {
        throw new Error('Reminder not found');
    }
    MOCK_REMINDERS.splice(indexToDelete, 1);
    saveReminders();
    return { success: true };
};


// --- Other Services ---

export const getRatingsByClientId = async (clientId: string): Promise<Rating[]> => {
  await apiDelay(300);
  return JSON.parse(JSON.stringify(MOCK_RATINGS.filter(r => r.clientId === clientId)));
};

export const getServiceHistoryByClientId = async (clientId: string): Promise<ServiceHistoryItem[]> => {
  await apiDelay(500);
  return JSON.parse(JSON.stringify(MOCK_SERVICE_HISTORY.filter(sh => sh.clientId === clientId)));
};