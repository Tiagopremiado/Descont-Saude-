
import { supabase } from '../supabase';
import type { 
    Client, Dependent, Payment, Doctor, Rating, ServiceHistoryItem, Reminder, 
    UpdateApprovalRequest, PlanConfig, CourierFinancialRecord, AppNotification 
} from '../types';
import { DEFAULT_PLAN_CONFIG } from './mockData';

// --- SISTEMA DE FEEDBACK CENTRALIZADO ---

const showFeedback = (message: string, type: 'success' | 'error' | 'info') => {
    console.log(`[${type.toUpperCase()}] ${message}`);
    if (type === 'error') {
        alert(`❌ Ocorreu um erro:\n${message}`);
    }
};

// --- HELPER PARA GERAR UUID ---
const generateUUID = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// --- HELPERS DE MAPEAMENTO ---

const mapDependentFromDb = (d: any): Dependent => ({
    id: d.id,
    name: d.name,
    relationship: d.relationship,
    cpf: d.cpf,
    birthDate: d.birth_date,
    status: d.status,
    registrationDate: d.registration_date,
    inactivationDate: d.inactivation_date,
    lastSeen: d.last_seen
});

const mapClientFromDb = (c: any): Client => ({
    id: c.id,
    contractNumber: c.contract_number,
    name: c.name,
    cpf: c.cpf,
    birthDate: c.birth_date,
    gender: c.gender,
    phone: c.phone,
    whatsapp: c.whatsapp,
    email: c.email,
    cep: c.cep,
    address: c.address,
    addressNumber: c.address_number,
    neighborhood: c.neighborhood,
    city: c.city,
    plan: c.plan,
    monthlyFee: c.monthly_fee,
    registrationFee: c.registration_fee,
    paymentDueDateDay: c.payment_due_date_day,
    promotion: c.promotion,
    salesRep: c.sales_rep,
    status: c.status,
    dependents: c.dependents ? c.dependents.map(mapDependentFromDb) : [],
    annotations: c.annotations,
    deliveryStatus: c.delivery_status,
    logs: c.logs || [],
    lastSeen: c.last_seen
});

const mapClientToDb = (c: Partial<Client>) => {
    const dbObj: any = { ...c };
    if (c.contractNumber) dbObj.contract_number = c.contractNumber;
    if (c.birthDate) dbObj.birth_date = c.birthDate;
    if (c.addressNumber) dbObj.address_number = c.addressNumber;
    if (c.monthlyFee !== undefined) dbObj.monthly_fee = c.monthlyFee;
    if (c.registrationFee !== undefined) dbObj.registration_fee = c.registrationFee;
    if (c.paymentDueDateDay) dbObj.payment_due_date_day = c.paymentDueDateDay;
    if (c.salesRep) dbObj.sales_rep = c.salesRep;
    if (c.deliveryStatus) dbObj.delivery_status = c.deliveryStatus;
    
    delete dbObj.contractNumber;
    delete dbObj.birthDate;
    delete dbObj.addressNumber;
    delete dbObj.monthlyFee;
    delete dbObj.registrationFee;
    delete dbObj.paymentDueDateDay;
    delete dbObj.salesRep;
    delete dbObj.deliveryStatus;
    delete dbObj.dependents; 
    delete dbObj.logs; 
    delete dbObj.lastSeen;
    
    return dbObj;
};

// --- CLIENT SERVICES ---

export const getClients = async (): Promise<Client[]> => {
    try {
        const { data, error } = await supabase.from('clients').select('*, dependents(*)');
        if (error) throw error;
        return data.map(mapClientFromDb);
    } catch (error: any) {
        showFeedback("Falha ao carregar clientes: " + error.message, 'error');
        return [];
    }
};

export const getClientById = async (id: string): Promise<Client | undefined> => {
    try {
        const { data, error } = await supabase.from('clients').select('*, dependents(*)').eq('id', id).single();
        if (error) throw error;
        return mapClientFromDb(data);
    } catch (error: any) {
        showFeedback("Falha ao carregar detalhes: " + error.message, 'error');
        return undefined;
    }
};

export const addClient = async (clientData: Omit<Client, 'id' | 'contractNumber' | 'logs'>): Promise<Client> => {
    try {
        const newClientId = generateUUID();
        const contractNumber = `019${String(Date.now()).slice(-8)}`;
        const dbClient = mapClientToDb({ ...clientData, id: newClientId, contractNumber });
        const { error: clientError } = await supabase.from('clients').insert(dbClient);
        if (clientError) throw clientError;
        if (clientData.dependents && clientData.dependents.length > 0) {
            const dependentsToInsert = clientData.dependents.map(dep => ({
                id: generateUUID(),
                client_id: newClientId,
                name: dep.name,
                relationship: dep.relationship || 'Dependente',
                cpf: dep.cpf || '',
                birth_date: dep.birthDate,
                status: 'active',
                registration_date: new Date().toISOString()
            }));
            await supabase.from('dependents').insert(dependentsToInsert);
        }
        return getClientById(newClientId) as Promise<Client>;
    } catch (error: any) {
        showFeedback("Erro ao adicionar cliente: " + error.message, 'error');
        throw error;
    }
};

export const updateClient = async (id: string, updatedData: Client): Promise<Client> => {
    try {
        const dbClient = mapClientToDb(updatedData);
        const { data, error } = await supabase.from('clients').update(dbClient).eq('id', id).select().single();
        if (error) throw error;
        return mapClientFromDb(data);
    } catch (error: any) {
        showFeedback("Erro ao atualizar cliente: " + error.message, 'error');
        throw error;
    }
};

export const updateLastSeen = async (id: string, role: 'client' | 'dependent'): Promise<void> => {
    const now = new Date().toISOString();
    try {
        if (role === 'client') {
            await supabase.from('clients').update({ last_seen: now }).eq('id', id);
        } else if (role === 'dependent') {
            await supabase.from('dependents').update({ last_seen: now }).eq('id', id);
        }
    } catch (error) {
        console.warn("Failed to update last seen:", error);
    }
};

export const resetClientPassword = async (clientId: string): Promise<{ success: true }> => {
    return { success: true };
};

// --- DEPENDENT SERVICES ---

export const requestAddDependent = async (clientId: string, dependentData: Omit<Dependent, 'id' | 'status' | 'registrationDate' | 'inactivationDate'>): Promise<Client | null> => {
    try {
        const newId = generateUUID();
        const { error: depError } = await supabase.from('dependents').insert({
            id: newId,
            client_id: clientId,
            name: dependentData.name,
            relationship: dependentData.relationship,
            cpf: dependentData.cpf,
            birth_date: dependentData.birthDate,
            status: 'pending', 
            registration_date: new Date().toISOString()
        });
        if (depError) throw depError;
        const client = await getClientById(clientId);
        if (client) {
            await supabase.from('update_requests').insert({
                id: generateUUID(),
                client_id: clientId,
                client_name: client.name,
                requested_at: new Date().toISOString(),
                status: 'pending',
                request_type: 'new_dependent',
                current_data: { phone: client.phone, whatsapp: client.whatsapp, address: client.address, addressNumber: client.addressNumber, neighborhood: client.neighborhood, city: client.city },
                updates: {}, 
                new_dependent_data: { ...dependentData, dependentId: newId }
            });
        }
        return getClientById(clientId) as Promise<Client>;
    } catch (error: any) {
        showFeedback("Erro na solicitação de dependente: " + error.message, 'error');
        return null;
    }
};

export const addDependent = async (clientId: string, dependentData: Omit<Dependent, 'id' | 'inactivationDate'>): Promise<Client | null> => {
    try {
        const { error } = await supabase.from('dependents').insert({
            id: generateUUID(),
            client_id: clientId,
            name: dependentData.name,
            relationship: dependentData.relationship,
            cpf: dependentData.cpf,
            birth_date: dependentData.birthDate,
            status: dependentData.status || 'active',
            registration_date: dependentData.registrationDate || new Date().toISOString()
        });
        if (error) throw error;
        return getClientById(clientId) as Promise<Client>;
    } catch (error: any) {
        showFeedback("Erro ao adicionar dependente: " + error.message, 'error');
        return null;
    }
};

export const updateDependent = async (clientId: string, dependentId: string, data: Partial<Omit<Dependent, 'id'>>): Promise<Client | null> => {
    try {
        const dbData: any = { ...data };
        if (data.birthDate) dbData.birth_date = data.birthDate;
        delete dbData.birthDate;
        const { error } = await supabase.from('dependents').update(dbData).eq('id', dependentId);
        if (error) throw error;
        return getClientById(clientId) as Promise<Client>;
    } catch (error: any) {
        showFeedback("Erro ao atualizar dependente: " + error.message, 'error');
        return null;
    }
};

export const resetDependentPassword = async (clientId: string, dependentId: string): Promise<void> => {};

const updateDependentStatusFn = async (clientId: string, dependentId: string, status: Dependent['status']): Promise<Client | null> => {
    try {
        const updates: any = { status };
        updates.inactivation_date = status === 'inactive' ? new Date().toISOString() : null;
        const { error } = await supabase.from('dependents').update(updates).eq('id', dependentId);
        if (error) throw error;
        return getClientById(clientId) as Promise<Client>;
    } catch (error: any) {
        showFeedback(`Erro ao mudar status: ` + error.message, 'error');
        return null;
    }
};

export const approveDependent = async (clientId: string, dependentId: string): Promise<Client | null> => {
    const updated = await updateDependentStatusFn(clientId, dependentId, 'active');
    if (updated) {
        await supabase.from('update_requests').update({ status: 'approved' }).eq('client_id', clientId).eq('request_type', 'new_dependent').eq('status', 'pending');
    }
    return updated;
};

export const rejectDependent = async (clientId: string, dependentId: string): Promise<Client | null> => {
    const updated = await updateDependentStatusFn(clientId, dependentId, 'rejected');
    if (updated) {
        await supabase.from('update_requests').update({ status: 'rejected' }).eq('client_id', clientId).eq('request_type', 'new_dependent').eq('status', 'pending');
    }
    return updated;
};

export const inactivateDependent = async (clientId: string, dependentId: string): Promise<Client | null> => updateDependentStatusFn(clientId, dependentId, 'inactive');
export const reactivateDependent = async (clientId: string, dependentId: string): Promise<Client | null> => updateDependentStatusFn(clientId, dependentId, 'active');

// --- PAYMENT SERVICES ---

export const getPaymentsByClientId = async (clientId: string): Promise<Payment[]> => {
    const { data } = await supabase.from('payments').select('*').eq('client_id', clientId);
    return (data || []).map(p => ({
        id: p.id, clientId: p.client_id, amount: p.amount, month: p.month, year: p.year, dueDate: p.due_date, status: p.status, observation: p.observation
    }));
};

export const getAllPayments = async (): Promise<Payment[]> => {
    const { data } = await supabase.from('payments').select('*');
    return (data || []).map(p => ({
        id: p.id, clientId: p.client_id, amount: p.amount, month: p.month, year: p.year, dueDate: p.due_date, status: p.status, observation: p.observation
    }));
};

export const generateNewInvoice = async (data: any): Promise<Payment> => {
    const newId = generateUUID();
    const payload = {
        id: newId,
        client_id: data.clientId,
        amount: data.amount,
        month: data.month,
        year: data.year,
        due_date: data.dueDate || new Date().toISOString(),
        status: 'pending',
        observation: data.observation || ''
    };
    const { data: inserted, error } = await supabase.from('payments').insert(payload).select().single();
    if (error) throw error;
    return {
        id: inserted.id, clientId: inserted.client_id, amount: inserted.amount, month: inserted.month, year: inserted.year, dueDate: inserted.due_date, status: inserted.status, observation: inserted.observation
    };
};

export const updatePaymentStatus = async (id: string, status: string) => {
    const { data, error } = await supabase.from('payments').update({ status }).eq('id', id).select().single();
    if (error) throw error;
    return data;
};

export const updatePayment = async (id: string, updates: any) => {
    const { data, error } = await supabase.from('payments').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
};

export const deletePayment = async (id: string) => {
    const { error } = await supabase.from('payments').delete().eq('id', id);
    if (error) throw error;
};

export const updatePaymentInvoiceStatus = async (id: string, status: string) => {
    await supabase.from('payments').update({ invoice_status: status }).eq('id', id);
};

export const generateAnnualCarnet = async (data: any) => {
    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const startIndex = months.indexOf(data.startMonth || "Janeiro");
    const carnetMonths = months.slice(startIndex === -1 ? 0 : startIndex);
    
    const inserts = carnetMonths.map((m, i) => ({
        id: generateUUID(),
        client_id: data.clientId,
        amount: data.amount,
        month: m,
        year: data.year,
        due_date: new Date(data.year, startIndex + i, data.dueDay || 20).toISOString(),
        status: 'pending',
        observation: data.observation || ''
    }));
    await supabase.from('payments').insert(inserts);
};

// --- DOCTOR SERVICES ---

export const getDoctors = async (): Promise<Doctor[]> => {
    const { data } = await supabase.from('doctors').select('*');
    return (data || []).map(d => ({ ...d, priceWithPlan: d.price_with_plan, priceWithoutPlan: d.price_without_plan }));
};

export const addDoctor = async (d: any) => {
    const { data, error } = await supabase.from('doctors').insert({ ...d, id: generateUUID() }).select().single();
    if (error) throw error;
    return data;
};

export const updateDoctor = async (id: string, d: any) => {
    const { data, error } = await supabase.from('doctors').update(d).eq('id', id).select().single();
    if (error) throw error;
    return data;
};

export const deleteDoctor = async (id: string) => {
    await supabase.from('doctors').delete().eq('id', id);
    return { success: true };
};

// --- OTHER SERVICES ---

export const getAllRatings = async (): Promise<Rating[]> => {
    const { data } = await supabase.from('ratings').select('*, clients(name), doctors(name, specialty)');
    return (data || []).map(r => ({
        id: r.id, clientId: r.client_id, doctorId: r.doctor_id, score: r.score, comment: r.comment, createdAt: r.created_at,
        clientName: r.clients?.name, doctorName: r.doctors?.name, doctorSpecialty: r.doctors?.specialty
    }));
};

export const getRatingsByClientId = async (clientId: string): Promise<Rating[]> => {
    const { data } = await supabase.from('ratings').select('*').eq('client_id', clientId);
    return (data || []).map(r => ({ id: r.id, clientId: r.client_id, doctorId: r.doctor_id, score: r.score, comment: r.comment, createdAt: r.created_at }));
};

export const addRating = async (r: any) => {
    await supabase.from('ratings').insert({ id: generateUUID(), client_id: r.clientId, doctor_id: r.doctorId, score: r.score, comment: r.comment });
};

export const getServiceHistoryByClientId = async (clientId: string): Promise<ServiceHistoryItem[]> => {
    const { data } = await supabase.from('service_history').select('*').eq('client_id', clientId);
    return (data || []);
};

export const getReminders = async (): Promise<Reminder[]> => {
    const { data } = await supabase.from('reminders').select('*');
    return (data || []).map(r => ({ id: r.id, description: r.description, priority: r.priority, status: r.status, clientId: r.client_id, clientName: r.client_name, createdAt: r.created_at }));
};

export const addReminder = async (r: any) => {
    const { data, error } = await supabase.from('reminders').insert({
        id: generateUUID(), description: r.description, priority: r.priority, client_id: r.clientId, client_name: r.clientName, status: 'pending'
    }).select().single();
    if (error) throw error;
    return data;
};

export const updateReminderStatus = async (id: string, status: string) => {
    await supabase.from('reminders').update({ status }).eq('id', id);
};

export const deleteReminder = async (id: string) => {
    await supabase.from('reminders').delete().eq('id', id);
};

export const getUpdateRequests = async (): Promise<UpdateApprovalRequest[]> => {
    const { data } = await supabase.from('update_requests').select('*, clients(name)');
    return (data || []).map(r => ({
        id: r.id, 
        clientId: r.client_id, 
        clientName: r.client_name || (r.clients && (r.clients as any).name) || 'Cliente', 
        requestedAt: r.requested_at, 
        status: r.status, 
        requestType: r.request_type,
        updates: r.updates || {}, 
        currentData: r.current_data || {}, 
        newDependentData: r.new_dependent_data, 
        cardRequestData: r.card_request_data,
        deliveryNote: r.delivery_note, 
        signature: r.signature,        
        cancellationReason: r.new_dependent_data 
    }));
};

export const submitUpdateRequest = async (clientId: string, clientName: string, currentData: any, updates: any, type: string, extra: any, note: any, sig: any) => {
    const payload: any = {
        id: generateUUID(), 
        client_id: clientId, 
        client_name: clientName, 
        requested_at: new Date().toISOString(), 
        status: 'pending', 
        request_type: type,
        current_data: currentData, 
        updates, 
        delivery_note: note, 
        signature: sig
    };
    if (type === 'card_request') payload.card_request_data = extra;
    else if (type === 'new_dependent' || type === 'cancellation') payload.new_dependent_data = extra;
    else payload.new_dependent_data = extra;

    const { error } = await supabase.from('update_requests').insert(payload);
    if (error) {
        showFeedback("Falha ao registrar solicitação: " + error.message, 'error');
        throw error;
    }
};

export const approveUpdateRequest = async (id: string) => {
    await supabase.from('update_requests').update({ status: 'approved' }).eq('id', id);
};

export const rejectUpdateRequest = async (id: string) => {
    await supabase.from('update_requests').update({ status: 'rejected' }).eq('id', id);
};

export const deletePendingRequestByClientId = async (clientId: string) => {
    const { error } = await supabase.from('update_requests').delete().eq('client_id', clientId).eq('status', 'pending');
    if (error) {
        showFeedback("Falha ao reverter ação: " + error.message, 'error');
        throw error;
    }
};

export const getPlanConfig = async (): Promise<PlanConfig> => {
    const { data } = await supabase.from('plan_config').select('*').single();
    return data ? {
        individualPrice: data.individual_price, familySmallPrice: data.family_small_price, familyMediumPrice: data.family_medium_price,
        familyLargePrice: data.family_large_price, extraDependentPrice: data.extra_dependent_price, finePercentage: data.fine_percentage, interestPercentage: data.interest_percentage
    } : DEFAULT_PLAN_CONFIG;
};

export const updatePlanConfig = async (c: PlanConfig) => {
    const db = {
        individual_price: c.individualPrice, family_small_price: c.familySmallPrice, family_medium_price: c.familyMediumPrice,
        family_large_price: c.familyLargePrice, extra_dependent_price: c.extraDependentPrice, fine_percentage: c.finePercentage, interest_percentage: c.interestPercentage
    };
    await supabase.from('plan_config').upsert({ id: 1, ...db });
};

export const getCourierFinancialRecords = async (): Promise<CourierFinancialRecord[]> => {
    const { data } = await supabase.from('courier_records').select('*');
    return (data || []).map(r => ({ id: r.id, date: r.date, deliveriesCount: r.deliveries_count, totalAmount: r.total_amount, status: r.status, paidAt: r.paid_at }));
};

export const createDailyFinancialRecord = async (count: number, price: number) => {
    await supabase.from('courier_records').insert({ id: generateUUID(), date: new Date().toISOString(), deliveries_count: count, total_amount: count * price, status: 'pending' });
};

export const markFinancialRecordAsPaid = async (id: string) => {
    await supabase.from('courier_records').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', id);
};

export const requestDelivery = async (clientId: string, type: string, desc: string): Promise<Client> => {
    const { data, error } = await supabase.from('clients').update({ delivery_status: { pending: true, type, description: desc } }).eq('id', clientId).select().single();
    if (error) throw error;
    return mapClientFromDb(data);
};

export const getNotifications = async (): Promise<AppNotification[]> => {
    const { data, error } = await supabase.from('notifications').select('*');
    if (error) return [];
    return (data || []).map(n => ({
        id: n.id, title: n.title, message: n.message, type: n.type, targetType: n.target_type || 'all',
        targetValue: n.target_value, imageUrl: n.image_url, expiresAt: n.expires_at, createdAt: n.created_at, readBy: n.read_by || []
    }));
};

export const createNotification = async (n: any) => {
    const dbPayload = {
        id: generateUUID(), title: n.title, message: n.message, type: n.type, target_type: n.targetType,
        target_value: n.targetValue, image_url: n.imageUrl, expires_at: n.expiresAt, created_at: new Date().toISOString(), read_by: []
    };
    const { error } = await supabase.from('notifications').insert(dbPayload);
    if(error) throw error;
};

export const updateNotification = async (id: string, updates: Partial<AppNotification>): Promise<void> => {
    const dbUpdates: any = {};
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.message) dbUpdates.message = updates.message;
    if (updates.type) dbUpdates.type = updates.type;
    if (updates.targetType) dbUpdates.target_type = updates.targetType;
    if (updates.targetValue) dbUpdates.target_value = updates.targetValue;
    if (updates.imageUrl) dbUpdates.image_url = updates.imageUrl;
    if (updates.expiresAt) dbUpdates.expires_at = updates.expiresAt;
    const { error } = await supabase.from('notifications').update(dbUpdates).eq('id', id);
    if (error) throw error;
};

export const deleteNotification = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
};

export const markNotificationAsRead = async (id: string, userId: string) => {
    const { data } = await supabase.from('notifications').select('read_by').eq('id', id).single();
    if (data) {
        const current = data.read_by || [];
        if (!current.includes(userId)) await supabase.from('notifications').update({ read_by: [...current, userId] }).eq('id', id);
    }
};
