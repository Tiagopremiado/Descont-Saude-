
import { MOCK_CLIENTS, MOCK_PAYMENTS, MOCK_DOCTORS, MOCK_RATINGS, MOCK_SERVICE_HISTORY, MOCK_REMINDERS, saveReminders, MOCK_UPDATE_REQUESTS, MOCK_PLAN_CONFIG, MOCK_FINANCIAL_RECORDS } from './mockData';
import type { Client, Payment, Doctor, Rating, ServiceHistoryItem, Dependent, Reminder, UpdateApprovalRequest, PlanConfig, CourierFinancialRecord, ActivityLog } from '../types';

// Simulate API delay
const apiDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- Helper for Logging ---
const createLog = (action: ActivityLog['action'], description: string, details?: string[]): ActivityLog => ({
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    action,
    description,
    details,
    timestamp: new Date().toISOString(),
    author: 'Administrador' // Hardcoded for now, could be dynamic based on auth context in a real app
});

const detectChanges = (oldData: any, newData: any): string[] => {
    const changes: string[] = [];
    const fieldsToIgnore = ['id', 'contractNumber', 'dependents', 'logs', 'deliveryStatus'];
    
    for (const key in newData) {
        if (fieldsToIgnore.includes(key)) continue;
        if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
            changes.push(`${key}: "${oldData[key] || ''}" → "${newData[key] || ''}"`);
        }
    }
    return changes;
};

// ... (existing client, dependent, payment, doctor, reminder services - KEEP THEM) ...
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
        // Automatically mark new clients for contract delivery
        deliveryStatus: {
            pending: true,
            type: 'new_contract',
            description: 'Entregar Contrato e Boas Vindas'
        },
        dependents: clientData.dependents.map((dep, index) => ({
            ...dep,
            id: `dep${Date.now()}${index}`,
            status: 'active',
            registrationDate: new Date().toISOString(),
        })),
        logs: [createLog('create', 'Cliente cadastrado no sistema')]
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
    
    const oldClient = MOCK_CLIENTS[clientIndex];
    const changes = detectChanges(oldClient, updatedData);
    
    let newLogs = oldClient.logs || [];
    if (changes.length > 0) {
        newLogs.unshift(createLog('update', 'Dados cadastrais atualizados', changes));
    }
    
    // Check for status change specifically
    if (oldClient.status !== updatedData.status) {
        const actionType = 'status_change';
        const description = `Status alterado de ${oldClient.status} para ${updatedData.status}`;
        newLogs.unshift(createLog(actionType, description));
    }

    MOCK_CLIENTS[clientIndex] = {
        ...JSON.parse(JSON.stringify(updatedData)),
        logs: newLogs
    };
    
    return MOCK_CLIENTS[clientIndex];
};

// New function to manually set delivery status (e.g., for cards)
export const requestDelivery = async (clientId: string, type: Client['deliveryStatus']['type'], description: string): Promise<Client> => {
    await apiDelay(400);
    const clientIndex = MOCK_CLIENTS.findIndex(c => c.id === clientId);
    if (clientIndex === -1) throw new Error("Client not found");

    MOCK_CLIENTS[clientIndex].deliveryStatus = {
        pending: true,
        type,
        description
    };
    
    MOCK_CLIENTS[clientIndex].logs = MOCK_CLIENTS[clientIndex].logs || [];
    MOCK_CLIENTS[clientIndex].logs.unshift(createLog('delivery_request', `Solicitação de entrega: ${description}`));
    
    return JSON.parse(JSON.stringify(MOCK_CLIENTS[clientIndex]));
};

export const resetClientPassword = async (clientId: string): Promise<{ success: true }> => {
    await apiDelay(500);
    const clientIndex = MOCK_CLIENTS.findIndex(c => c.id === clientId);
    if (clientIndex !== -1) {
        MOCK_CLIENTS[clientIndex].logs = MOCK_CLIENTS[clientIndex].logs || [];
        MOCK_CLIENTS[clientIndex].logs.unshift(createLog('password_reset', 'Senha resetada manualmente pelo admin'));
    }
    console.log(`Password for client ${clientId} has been reset.`);
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
    MOCK_CLIENTS[clientIndex].logs = MOCK_CLIENTS[clientIndex].logs || [];
    MOCK_CLIENTS[clientIndex].logs.unshift(createLog('dependent_action', `Solicitação de inclusão de dependente: ${newDependent.name}`));

    // Create a reminder for the admin
    await addReminder({
        description: `Aprovar novo dependente "${newDependent.name}"`,
        priority: 'medium',
        clientId: clientId,
        clientName: MOCK_CLIENTS[clientIndex].name
    });

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
    MOCK_CLIENTS[clientIndex].logs = MOCK_CLIENTS[clientIndex].logs || [];
    MOCK_CLIENTS[clientIndex].logs.unshift(createLog('dependent_action', `Dependente adicionado manualmente: ${newDependent.name} (${newDependent.status})`));

    return JSON.parse(JSON.stringify(MOCK_CLIENTS[clientIndex]));
};

// New function to update existing dependent
export const updateDependent = async (clientId: string, dependentId: string, dependentData: Partial<Omit<Dependent, 'id'>>): Promise<Client | null> => {
    await apiDelay(500);
    const clientIndex = MOCK_CLIENTS.findIndex(c => c.id === clientId);
    if (clientIndex === -1) return null;

    const depIndex = MOCK_CLIENTS[clientIndex].dependents.findIndex(d => d.id === dependentId);
    if (depIndex === -1) return null;

    const oldData = MOCK_CLIENTS[clientIndex].dependents[depIndex];
    MOCK_CLIENTS[clientIndex].dependents[depIndex] = { ...oldData, ...dependentData };

    const changes = detectChanges(oldData, dependentData);
    if (changes.length > 0) {
        MOCK_CLIENTS[clientIndex].logs = MOCK_CLIENTS[clientIndex].logs || [];
        MOCK_CLIENTS[clientIndex].logs.unshift(createLog('dependent_action', `Dependente ${oldData.name} editado`, changes));
    }

    return JSON.parse(JSON.stringify(MOCK_CLIENTS[clientIndex]));
};

const updateDependentStatus = (clientId: string, dependentId: string, status: Dependent['status']): Client | null => {
    const clientIndex = MOCK_CLIENTS.findIndex(c => c.id === clientId);
    if (clientIndex === -1) return null;

    const dependentIndex = MOCK_CLIENTS[clientIndex].dependents.findIndex(d => d.id === dependentId);
    if (dependentIndex === -1) return null;

    const depName = MOCK_CLIENTS[clientIndex].dependents[dependentIndex].name;
    MOCK_CLIENTS[clientIndex].dependents[dependentIndex].status = status;
    
    if (status === 'inactive') {
        MOCK_CLIENTS[clientIndex].dependents[dependentIndex].inactivationDate = new Date().toISOString();
    } else {
         delete MOCK_CLIENTS[clientIndex].dependents[dependentIndex].inactivationDate;
    }

    MOCK_CLIENTS[clientIndex].logs = MOCK_CLIENTS[clientIndex].logs || [];
    MOCK_CLIENTS[clientIndex].logs.unshift(createLog('dependent_action', `Dependente ${depName} alterado para ${status}`));

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

    const dependent = MOCK_CLIENTS[clientIndex].dependents.find(d => d.id === dependentId);
    const depName = dependent ? dependent.name : 'Unknown';

    MOCK_CLIENTS[clientIndex].dependents = MOCK_CLIENTS[clientIndex].dependents.filter(d => d.id !== dependentId);
    
    MOCK_CLIENTS[clientIndex].logs = MOCK_CLIENTS[clientIndex].logs || [];
    MOCK_CLIENTS[clientIndex].logs.unshift(createLog('dependent_action', `Solicitação de dependente REJEITADA: ${depName}`));

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
        console.error(`Payment with id ${paymentId} not found.`);
        return null;
    }

    MOCK_PAYMENTS[paymentIndex].status = status;
    
    return JSON.parse(JSON.stringify(MOCK_PAYMENTS[paymentIndex]));
};

export const updatePaymentInvoiceStatus = async (paymentId: string, status: 'pending' | 'generated'): Promise<Payment | null> => {
    await apiDelay(400);
    const paymentIndex = MOCK_PAYMENTS.findIndex(p => p.id === paymentId);
    if (paymentIndex === -1) {
        console.error(`Payment with id ${paymentId} not found.`);
        return null;
    }

    MOCK_PAYMENTS[paymentIndex].invoiceStatus = status;
    
    return JSON.parse(JSON.stringify(MOCK_PAYMENTS[paymentIndex]));
};


const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export const generateAnnualCarnet = async (clientId: string, year: number): Promise<Payment[]> => {
    await apiDelay(1500);
    const clientIndex = MOCK_CLIENTS.findIndex(c => c.id === clientId);
    if (clientIndex === -1) throw new Error("Client not found");
    const client = MOCK_CLIENTS[clientIndex];

    const existingPaymentsForYear = MOCK_PAYMENTS.filter(p => p.clientId === clientId && p.year === year);
    const existingMonths = existingPaymentsForYear.map(p => p.month);
    
    const newPayments: Payment[] = [];

    for (const month of months) {
        if (!existingMonths.includes(month)) {
            const monthIndex = monthMap[month];
            const newPayment: Payment = {
                id: `pay-${client.id}-${year}-${month}`,
                clientId,
                amount: client.monthlyFee,
                month,
                year,
                dueDate: new Date(year, monthIndex, client.paymentDueDateDay).toISOString(),
                status: 'pending',
            };
            newPayments.push(newPayment);
        }
    }

    MOCK_PAYMENTS.push(...newPayments);

    // Automatically mark client for Carnet delivery
    MOCK_CLIENTS[clientIndex].deliveryStatus = {
        pending: true,
        type: 'carnet',
        description: `Entregar Carnê ${year}`
    };
    
    MOCK_CLIENTS[clientIndex].logs = MOCK_CLIENTS[clientIndex].logs || [];
    MOCK_CLIENTS[clientIndex].logs.unshift(createLog('delivery_request', `Carnê ${year} gerado e marcado para entrega.`));

    return JSON.parse(JSON.stringify(newPayments));
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


// --- Update Request Services ---

export const getUpdateRequests = async (): Promise<UpdateApprovalRequest[]> => {
    await apiDelay(300);
    return JSON.parse(JSON.stringify(MOCK_UPDATE_REQUESTS));
};

export const submitUpdateRequest = async (
    clientId: string, 
    currentData: UpdateApprovalRequest['currentData'],
    updates: UpdateApprovalRequest['updates'],
    requestType: UpdateApprovalRequest['requestType'] = 'update',
    payload?: string | UpdateApprovalRequest['newDependentData'] | UpdateApprovalRequest['cardRequestData'],
    deliveryNote?: string, // Optional delivery note
    signature?: string // Optional signature (base64)
): Promise<UpdateApprovalRequest> => {
    await apiDelay(700);
    const client = MOCK_CLIENTS.find(c => c.id === clientId);
    if (!client) throw new Error("Client not found");

    const newRequest: UpdateApprovalRequest = {
        id: `update-${Date.now()}`,
        clientId,
        clientName: client.name,
        requestedAt: new Date().toISOString(),
        status: 'pending',
        requestType,
        currentData,
        updates,
        deliveryNote,
        signature // Add signature to request
    };

    if ((requestType === 'cancellation' || requestType === 'delivery_failed') && typeof payload === 'string') {
        // payload acts as cancellation reason OR delivery failure reason
        if(requestType === 'cancellation') newRequest.cancellationReason = payload;
    } else if (requestType === 'new_dependent') {
        newRequest.newDependentData = payload as UpdateApprovalRequest['newDependentData'];
    } else if (requestType === 'card_request') {
        newRequest.cardRequestData = payload as UpdateApprovalRequest['cardRequestData'];
    }

    MOCK_UPDATE_REQUESTS.unshift(newRequest);
    return JSON.parse(JSON.stringify(newRequest));
};

export const deletePendingRequestByClientId = async (clientId: string): Promise<{ success: true }> => {
    await apiDelay(400);
    const indexToDelete = MOCK_UPDATE_REQUESTS.findIndex(r => r.clientId === clientId && r.status === 'pending');
    
    if (indexToDelete !== -1) {
        MOCK_UPDATE_REQUESTS.splice(indexToDelete, 1);
    }
    
    return { success: true };
};

export const approveUpdateRequest = async (requestId: string): Promise<Client | null> => {
    await apiDelay(800);
    const requestIndex = MOCK_UPDATE_REQUESTS.findIndex(r => r.id === requestId);
    if (requestIndex === -1) throw new Error("Request not found");

    const request = MOCK_UPDATE_REQUESTS[requestIndex];
    const clientIndex = MOCK_CLIENTS.findIndex(c => c.id === request.clientId);
    
    if (clientIndex === -1) {
        MOCK_UPDATE_REQUESTS[requestIndex].status = 'rejected';
        return null;
    }

    // Add log for Delivery Note if present
    if (request.deliveryNote) {
        MOCK_CLIENTS[clientIndex].logs = MOCK_CLIENTS[clientIndex].logs || [];
        MOCK_CLIENTS[clientIndex].logs.unshift(createLog('update', `Observação do Entregador: ${request.deliveryNote}`));
    }
    
    // Add log if signature present (Proof of visit)
    if (request.signature) {
        MOCK_CLIENTS[clientIndex].logs = MOCK_CLIENTS[clientIndex].logs || [];
        MOCK_CLIENTS[clientIndex].logs.unshift(createLog('update', `Visita confirmada com assinatura digital.`));
    }

    if (request.requestType === 'cancellation') {
        MOCK_CLIENTS[clientIndex].status = 'inactive';
        MOCK_CLIENTS[clientIndex].annotations += `\n[CANCELAMENTO] Solicitado em ${new Date(request.requestedAt).toLocaleDateString()}. Motivo: ${request.cancellationReason || 'Não informado'}. Aprovado em ${new Date().toLocaleDateString()}.`;
        MOCK_CLIENTS[clientIndex].logs = MOCK_CLIENTS[clientIndex].logs || [];
        MOCK_CLIENTS[clientIndex].logs.unshift(createLog('status_change', 'Cliente CANCELADO (Solicitação do Entregador aprovada)'));
    } else if (request.requestType === 'delivery_failed') {
        // Delivery failed logic
        MOCK_CLIENTS[clientIndex].logs = MOCK_CLIENTS[clientIndex].logs || [];
        MOCK_CLIENTS[clientIndex].logs.unshift(createLog('delivery_attempt', `Tentativa de entrega falhou: Ausente/Não Encontrado`));
        // Important: We do NOT clear the deliveryStatus.pending flag here, so it remains in the route for next time.
    } else if (request.requestType === 'new_dependent') {
        if (request.newDependentData) {
            MOCK_CLIENTS[clientIndex].dependents.push({
                id: `dep-${Date.now()}`,
                name: request.newDependentData.name,
                cpf: request.newDependentData.cpf,
                birthDate: request.newDependentData.birthDate,
                relationship: request.newDependentData.relationship,
                status: 'pending', // Adm needs to contact client first, so keeps as pending in client list but approve request
                registrationDate: new Date().toISOString()
            });
            MOCK_CLIENTS[clientIndex].logs = MOCK_CLIENTS[clientIndex].logs || [];
            MOCK_CLIENTS[clientIndex].logs.unshift(createLog('dependent_action', `Dependente solicitado pelo entregador adicionado (Pendente): ${request.newDependentData.name}`));
        }
    } else if (request.requestType === 'card_request') {
        if (request.cardRequestData) {
            MOCK_CLIENTS[clientIndex].deliveryStatus = {
                pending: true,
                type: 'card',
                description: `Entregar Cartão para ${request.cardRequestData.personName} (${request.cardRequestData.role})`
            };
            MOCK_CLIENTS[clientIndex].logs = MOCK_CLIENTS[clientIndex].logs || [];
            MOCK_CLIENTS[clientIndex].logs.unshift(createLog('delivery_request', `Solicitação de cartão aprovada para ${request.cardRequestData.personName}`));
        }
    } else {
        // Normal update
        const changes = detectChanges(MOCK_CLIENTS[clientIndex], request.updates);
        const updatedClientData = { ...MOCK_CLIENTS[clientIndex], ...request.updates };
        MOCK_CLIENTS[clientIndex] = updatedClientData;
        MOCK_CLIENTS[clientIndex].logs = MOCK_CLIENTS[clientIndex].logs || [];
        if(changes.length > 0) {
             MOCK_CLIENTS[clientIndex].logs.unshift(createLog('update', 'Dados atualizados via solicitação do entregador', changes));
        }
    }
    
    // Clear delivery status if update was successful/confirmed (ONLY if it wasn't a failed attempt)
    if (request.requestType !== 'delivery_failed' && MOCK_CLIENTS[clientIndex].deliveryStatus?.pending) {
        MOCK_CLIENTS[clientIndex].deliveryStatus = undefined;
    }
    
    MOCK_UPDATE_REQUESTS[requestIndex].status = 'approved';

    return JSON.parse(JSON.stringify(MOCK_CLIENTS[clientIndex]));
};

export const rejectUpdateRequest = async (requestId: string): Promise<UpdateApprovalRequest | null> => {
    await apiDelay(400);
    const requestIndex = MOCK_UPDATE_REQUESTS.findIndex(r => r.id === requestId);
    if (requestIndex === -1) return null;

    MOCK_UPDATE_REQUESTS[requestIndex].status = 'rejected';
    return JSON.parse(JSON.stringify(MOCK_UPDATE_REQUESTS[requestIndex]));
};

// --- Plan Config Services ---

export const getPlanConfig = async (): Promise<PlanConfig> => {
    await apiDelay(200);
    return JSON.parse(JSON.stringify(MOCK_PLAN_CONFIG));
};

export const updatePlanConfig = async (newConfig: PlanConfig): Promise<PlanConfig> => {
    await apiDelay(400);
    // Directly mutate MOCK_PLAN_CONFIG (imported from mockData) because it's a let variable there.
    // In a real API, this would be a PUT request.
    Object.assign(MOCK_PLAN_CONFIG, newConfig);
    return JSON.parse(JSON.stringify(MOCK_PLAN_CONFIG));
}

// --- Courier Financial Services ---

export const getCourierFinancialRecords = async (): Promise<CourierFinancialRecord[]> => {
    await apiDelay(300);
    return JSON.parse(JSON.stringify(MOCK_FINANCIAL_RECORDS));
}

export const createDailyFinancialRecord = async (deliveriesCount: number, rate: number = 1.90): Promise<CourierFinancialRecord> => {
    await apiDelay(500);
    const newRecord: CourierFinancialRecord = {
        id: `fin-${Date.now()}`,
        date: new Date().toISOString(),
        deliveriesCount,
        totalAmount: deliveriesCount * rate,
        status: 'pending'
    };
    MOCK_FINANCIAL_RECORDS.unshift(newRecord);
    return JSON.parse(JSON.stringify(newRecord));
}

export const markFinancialRecordAsPaid = async (recordId: string): Promise<CourierFinancialRecord | null> => {
    await apiDelay(400);
    const index = MOCK_FINANCIAL_RECORDS.findIndex(r => r.id === recordId);
    if (index === -1) return null;

    MOCK_FINANCIAL_RECORDS[index].status = 'paid';
    MOCK_FINANCIAL_RECORDS[index].paidAt = new Date().toISOString();
    
    return JSON.parse(JSON.stringify(MOCK_FINANCIAL_RECORDS[index]));
}
