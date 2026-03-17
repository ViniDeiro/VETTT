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
  secondaryPhone?: string;
  email: string;
  address: string;
  zipCode?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
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
  age?: number; // Calculated or manual (Years)
  ageMonths?: number; // Manual (Months)
  ownerId: string;
  propertyId?: string; // Required if Equine
  gender: 'M' | 'F';
  neutered?: boolean;
  weight?: number;
  photoUrl?: string;
  
  // New Fields
  status: 'Alive' | 'Deceased'; // Vivo / Óbito
  size?: 'Small' | 'Medium' | 'Large'; // Porte
  temperament?: string;
  coat?: string; // Pelagem (replaces color or alias)
  microchip?: string;
  rg?: string;
  
  healthPlan?: {
    name: string;
    number: string;
    expiryDate: string;
  };
  
  allergies?: string[]; // List of allergies
  chronicDiseases?: string[]; // Doenças crônicas
  
  anestheticRisk?: 'ASA I' | 'ASA II' | 'ASA III' | 'ASA IV' | 'ASA V'; // Risk classification
  color?: string; // Legacy alias for coat
  
  notes?: string; // General notes (Surgeries, etc.)
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

export interface Vitals {
  heartRate?: number; // bpm
  respiratoryRate?: number; // rpm
  temperature?: number; // Celsius
  tpc?: number; // seconds
  pressureSystolic?: number;
  pressureDiastolic?: number;
  weight?: number; // kg
  // Equine specific
  motility?: {
    upperLeft: number;
    upperRight: number;
    lowerLeft: number;
    lowerRight: number;
  };
  hydration?: 'Normal' | 'Dehydrated'; // Added for completeness
  mucousMembranes?: 'Normal' | 'Pale' | 'Cyanotic' | 'Icteric'; // Added for completeness
  capillaryRefillTime?: number; // TPC alias
}

export interface Attendance {
  id: string;
  patientId: string;
  patientName: string;
  vetId: string;
  date: string; // ISO Date for start
  reason: string;
  anamnesis?: string;
  diagnosis?: string;
  prescriptions: Prescription[]; // Structured prescriptions
  examRequests: ExamRequest[]; // Structured exam requests
  vaccines: VaccineApplication[]; // Unified vaccine structure
  procedures: AppliedProcedure[]; // Clinical procedures
  returnVisit?: ReturnVisit; // Scheduled return
  consultationType?: string; // e.g. 'Clínica', 'Odontológica'
  returnVisit?: boolean; // Is this a return visit?
  returnDate?: string; // If scheduling a return
  notes?: string; // Unified notes if needed
  status: AttendanceStatus;
  consumedItems: ConsumptionItem[];
  vaccines?: {
      inventoryItemId: string;
      name: string;
      batch?: string;
      manufacturer?: string;
      expiryDate?: string;
      applicationDate: string;
      price: number;
      notes?: string;
  }[];
  totalCost: number; // Cost of materials
  totalService: number; // Vet service fee
  totalTotal: number; // Final price
  vitals?: Vitals;
  updatedAt?: string;
  updatedBy?: string;
}

export type PaymentStatus = 'pending' | 'paid' | 'overdue';
export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'pix' | 'transfer';

export interface PaymentDetails {
  method: PaymentMethod;
  installments?: number; // 1-12
  taxRate?: number; // %
  netValue?: number; // Value after tax
}

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
  paymentDetails?: PaymentDetails; // Detailed info
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

export interface ExamItem {
  id: string;
  name: string; // Hemograma, Bioquímico, Raio-X, etc.
  type: 'laboratory' | 'imaging' | 'cardiology' | 'other';
  instructions?: string; // Jejum 12h, etc.
}

export interface ExamRequest {
  id: string;
  attendanceId: string;
  patientId: string;
  date: string;
  items: ExamItem[];
  clinicalIndication: string; // Motivo / Suspeita
  priority: 'routine' | 'urgent';
}

export interface VaccineApplication {
    id: string;
    attendanceId: string;
    patientId: string;
    inventoryItemId: string;
    name: string;
    batch: string;
    manufacturer: string;
    expiryDate: string;
    applicationDate: string;
    price: number;
    notes?: string;
    nextDoseDate?: string; // Scheduled next dose
}

export interface AppliedProcedure {
    id: string;
    attendanceId: string;
    name: string;
    price: number;
    notes?: string;
    timestamp: string;
}

export interface ReturnVisit {
    id: string;
    attendanceId: string;
    date: string;
    reason: string;
    type: 'consulta' | 'vacina' | 'exame' | 'pos-cirurgico' | 'outros';
    notes?: string;
}

export interface PrescriptionItem {
  id: string;
  type: 'industrialized' | 'compounded'; // Industrializado / Manipulado
  name: string; // Nome do fármaco ou fórmula
  concentration?: string; // e.g. 50mg, 10%
  quantity: string; // e.g. 1 caixa, 30 cápsulas
  dosage: string; // e.g. 1 comprimido
  frequency: string; // e.g. a cada 12 horas
  duration: string; // e.g. por 7 dias
  route?: string; // Via de administração (oral, tópico)
  instructions?: string; // Observações adicionais
}

export interface Prescription {
  id: string;
  attendanceId: string;
  date: string;
  items: PrescriptionItem[];
  digitalSignature?: boolean; // Placeholder for digital signature
  signatureHash?: string; // Placeholder for future blockchain/crypto
}

export interface ProcedureTemplate {
  id: string;
  name: string;
  baseCost: number; // Suggested service fee
  duration?: string;
  items: {
    inventoryItemId: string;
    quantity: number;
  }[];
}
