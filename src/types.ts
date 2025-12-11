
// types.ts

export interface ActivityLog {
  id: string;
  action: 'create' | 'update' | 'status_change' | 'dependent_action' | 'password_reset' | 'delivery_request' | 'delivery_attempt';
  description: string;
  details?: string[]; // Array of specific changes (e.g. "Name: Old -> New")
  timestamp: string; // ISO String
  author: string; // "Admin", "Sistema", or specific user name
}

export interface User {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  role: 'admin' | 'client' | 'entregador';
  clientId?: string; // Only for clients
}

export interface Dependent {
  id: string;
  name:string;
  relationship: string;
  cpf: string;
  birthDate: string; // ISO string
  status: 'active' | 'pending' | 'inactive';
  registrationDate: string; // ISO string
  inactivationDate?: string; // ISO string
}

export interface Client {
  id: string;
  contractNumber: string;
  name: string;
  cpf: string;
  birthDate: string; // ISO string
  gender: string;
  phone: string;
  whatsapp: string;
  email: string;
  cep?: string; // Added field
  address: string;
  addressNumber: string;
  neighborhood: string;
  city: string;
  plan: string;
  monthlyFee: number;
  registrationFee: number;
  paymentDueDateDay: number;
  promotion: boolean;
  salesRep: string;
  status: 'active' | 'pending' | 'inactive';
  dependents: Dependent[];
  annotations?: string;
  deliveryStatus?: {
      pending: boolean;
      type: 'new_contract' | 'carnet' | 'card' | 'other';
      description?: string;
  };
  logs?: ActivityLog[]; // New field for history
}

export interface Payment {
  id: string;
  clientId: string;
  amount: number;
  month: string;
  year: number;
  dueDate: string; // ISO string
  status: 'paid' | 'pending' | 'overdue';
  invoiceStatus?: 'pending' | 'generated';
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  address: string;
  city: string;
  phone: string;
  whatsapp?: string;
}

export interface Rating {
  id: string;
  clientId: string;
  doctorId: string;
  score: number; // 1-5
  comment?: string;
}

export interface ServiceHistoryItem {
  id: string;
  clientId: string;
  date: string; // ISO string
  procedure: string;
  doctorName: string;
  specialty: string;
}

export interface Reminder {
  id: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed';
  clientId?: string;
  clientName?: string;
  createdAt: string; // ISO string
}

export interface UpdateApprovalRequest {
    id: string;
    clientId: string;
    clientName: string;
    requestedAt: string; // ISO string
    status: 'pending' | 'approved' | 'rejected';
    requestType: 'update' | 'cancellation' | 'new_dependent' | 'card_request' | 'delivery_failed'; 
    cancellationReason?: string;
    deliveryNote?: string; // Courier observations
    signature?: string; // Base64 signature image
    
    // Data for contact/address updates
    updates: {
        phone?: string;
        whatsapp?: string;
        address?: string;
        addressNumber?: string;
        neighborhood?: string;
        city?: string;
    };
    currentData: {
        phone: string;
        whatsapp: string;
        address: string;
        addressNumber: string;
        neighborhood: string;
        city: string;
    };

    // Data for new dependent request
    newDependentData?: {
        name: string;
        cpf: string;
        birthDate: string;
        relationship: string;
    };

    // Data for card request
    cardRequestData?: {
        personName: string;
        role: 'Titular' | 'Dependente';
    };
}

export interface PlanConfig {
    individualPrice: number;      // 0 dependentes
    familySmallPrice: number;     // 1 a 3 dependentes
    familyMediumPrice: number;    // 4 dependentes
    familyLargePrice: number;     // 5 dependentes
    extraDependentPrice: number;  // Custo por dependente acima de 5
}

export interface CourierFinancialRecord {
    id: string;
    date: string; // ISO string (Day of work)
    deliveriesCount: number;
    totalAmount: number;
    status: 'pending' | 'paid';
    paidAt?: string; // ISO string
}
