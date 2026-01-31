export type Role = 'vet' | 'secretary' | 'admin';

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
}

export interface Owner {
  id: string;
  name: string;
  document: string; // CPF/CNPJ
  phone: string;
  email: string;
  address: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone?: string;
  document?: string; // CNPJ
  registrationNumber?: string; // IE or similar
  ownerId?: string; // Optional if standalone, but usually linked
}

export interface Patient {
  id: string;
  name: string;
  species: 'Equine' | 'Bovine' | 'Canine' | 'Feline' | 'Other';
  breed: string;
  birthDate?: string; // YYYY-MM-DD
  age?: number; // Calculated or manual
  ownerId: string;
  propertyId?: string; // Required if Equine
  gender: 'M' | 'F';
  color?: string;
  weight?: number;
  photoUrl?: string;
}

export type UnitType = 'ml' | 'un' | 'frasco' | 'g' | 'kg';

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Medication' | 'Material' | 'Vaccine' | 'Feed' | 'Other';
  quantity: number;
  unit: UnitType;
  minStock: number;
  costPrice: number;
  salePrice: number;
  batchNumber?: string;
  expiryDate?: string;
  description?: string;
  image?: string; // Added for UI compatibility
  status?: 'ok' | 'low' | 'expired'; // Added for UI compatibility
  supplier?: string; // Added for UI compatibility
  validity?: string; // Added for UI compatibility
}

export interface ConsumptionItem {
  inventoryItemId: string;
  itemName: string;
  quantityUsed: number;
  unit: UnitType;
  costAtMoment: number;
  priceAtMoment: number;
}

export type AttendanceStatus = 'scheduled' | 'in_progress' | 'finished' | 'canceled';

export interface Attendance {
  id: string;
  patientId: string;
  patientName: string;
  vetId: string;
  date: string;
  reason: string;
  anamnesis?: string;
  diagnosis?: string;
  prescription?: string;
  status: AttendanceStatus;
  consumedItems: ConsumptionItem[];
  totalCost: number; // Cost of materials
  totalService: number; // Vet service fee
  totalTotal: number; // Final price
}

export type PaymentStatus = 'pending' | 'paid' | 'overdue';
export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'pix' | 'transfer';

export interface Receivable {
  id: string;
  attendanceId: string;
  patientName: string;
  ownerName: string;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
  paymentDate?: string;
  paymentMethod?: PaymentMethod;
  description: string;
}

export interface CashFlowEntry {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  referenceId?: string; // e.g., receivableId or purchaseId
}
