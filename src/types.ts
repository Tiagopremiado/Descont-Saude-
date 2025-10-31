// types.ts

export interface User {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  role: 'admin' | 'client';
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
  annotations: string;
}

export interface Payment {
  id: string;
  clientId: string;
  amount: number;
  month: string;
  year: number;
  dueDate: string; // ISO string
  status: 'paid' | 'pending' | 'overdue';
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
