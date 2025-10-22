import { MOCK_CLIENTS, MOCK_PAYMENTS, MOCK_DOCTORS, MOCK_RATINGS, MOCK_SERVICE_HISTORY } from './mockData';
import type { Client, Payment, Doctor, Rating, ServiceHistoryItem, Dependent } from '../types';

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

const updateDependentStatus =