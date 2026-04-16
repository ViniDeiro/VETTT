export type Role = 'vet' | 'secretary' | 'admin';

export type UserStatus = 'active' | 'inactive';
export type ProfileType = 'standard' | 'custom';
export type PermissionAction =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'exportPdf'
  | 'accessFinancial'
  | 'accessStock';

export type AppModuleKey =
  | 'settings'
  | 'users'
  | 'branding'
  | 'finance'
  | 'inventory'
  | 'attendance'
  | 'medicalRecords'
  | 'agenda'
  | 'reports'
  | 'documents'
  | 'invoices'
  | 'whatsapp'
  | 'audit'
  | 'patients'
  | 'team';

export interface ModulePermission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  exportPdf: boolean;
  accessFinancial: boolean;
  accessStock: boolean;
}

export interface ProfileRestrictions {
  editAgenda: boolean;
  cancelAttendance: boolean;
  viewValues: boolean;
  sensitiveSettings: boolean;
}

export interface AccessProfile {
  id: string;
  name: string;
  description?: string;
  type: ProfileType;
  baseRole?: Role;
  permissions: Record<AppModuleKey, ModulePermission>;
  restrictions: ProfileRestrictions;
}

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  fullName?: string;
  phone?: string;
  functionTitle?: string;
  accessProfileId?: string;
  status?: UserStatus;
  createdAt?: string;
  lastAccessAt?: string;
  teamMemberId?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  functionTitle: string;
  specialty?: string;
  crmv?: string;
  cpf?: string;
  phone: string;
  email?: string;
  signature?: string;
  photo?: string;
  status: UserStatus;
  createdAt: string;
  userId?: string;
}

export interface ClinicInfo {
  fantasyName: string;
  legalName: string;
  cnpj: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website: string;
  socialMedia: string;
  logo?: string | null;
  documentLogo?: string | null;
}

export interface ClinicAppearance {
  primaryColor: string;
  buttonColor: string;
  sidebarColor: string;
  theme: 'light' | 'dark';
  appIcon?: string | null;
}

export interface DocumentLayoutSettings {
  selectedModel: 'classic' | 'minimal' | 'premium';
  header: string;
  footer: string;
  logoPosition: 'left' | 'center' | 'right';
  fontFamily: string;
  fontSize: number;
  showSignature: boolean;
  autoCrmv: boolean;
  autoCnpj: boolean;
  showAddress: boolean;
  showQrCode: boolean;
  legalNotes: string;
}

export interface ConsultationTemplate {
  id: string;
  name: string;
  speciesFocus: string;
  defaultValue: number;
  duration: string;
  anamnesisText: string;
  checklist: string[];
  requiredFields: string[];
}

export interface DocumentTemplateDefinition {
  id: string;
  type: string;
  title: string;
  content: string;
}

export interface RegionalSettings {
  language: 'pt-BR' | 'en-US' | 'es-ES';
  dateFormat: string;
  timeFormat: string;
  currency: string;
  decimalSeparator: ',' | '.';
}

export interface AutomatedMessageTemplate {
  id: string;
  type: string;
  channel: 'whatsapp' | 'email' | 'sms';
  enabled: boolean;
  template: string;
  variables: string[];
}

export interface WhatsAppSettings {
  connected: boolean;
  provider: string;
  apiUrl: string;
  instanceName: string;
  token: string;
  autoSendMessages: boolean;
  sendPdf: boolean;
  sendReminders: boolean;
  confirmAppointments: boolean;
  chargeNotifications: boolean;
  paymentLink: boolean;
}

export interface FiscalSettings {
  includeCnpjOnAllDocuments: boolean;
  municipalApiUrl: string;
  municipalProvider: string;
  cityCode: string;
  environment: 'homologation' | 'production';
  issueInvoices: boolean;
  issueReceipts: boolean;
  issuePaymentProofs: boolean;
  defaultServiceCode: string;
  defaultTaxRate: number;
  nextInvoiceNumber: number;
}

export interface AuditSettings {
  enabled: boolean;
  retainDays: number;
  logSensitiveActions: boolean;
}

export interface BackupSecuritySettings {
  dailyAutoBackup: boolean;
  manualBackupEnabled: boolean;
  restoreEnabled: boolean;
  twoFactorEnabled: boolean;
  passwordResetEnabled: boolean;
  sessionTimeoutMinutes: number;
  backupRetentionDays: number;
  lastBackupAt?: string;
}

export interface DashboardSettings {
  enabledIndicators: string[];
}

export interface ClinicUnit {
  id: string;
  name: string;
  type: 'matriz' | 'filial' | 'atendimento_movel' | 'hospital_parceiro';
  city: string;
  state: string;
  address: string;
  active: boolean;
}

export interface ClinicalReminderTemplate {
  id: string;
  name: string;
  daysAfter: number;
  message: string;
  active: boolean;
}

export interface AuditLogEntry {
  id: string;
  actorUserId?: string | null;
  actorName: string;
  entity: string;
  action: 'create' | 'update' | 'delete' | 'restore' | 'backup' | 'login' | 'logout';
  changedField?: string;
  previousValue?: unknown;
  newValue?: unknown;
  createdAt: string;
}

export interface BackupSnapshot {
  id: string;
  label: string;
  createdAt: string;
  createdBy: string;
  data: Record<string, unknown>;
}

export interface GeneralSettings {
  clinic: ClinicInfo;
  appearance: ClinicAppearance;
  documents: DocumentLayoutSettings;
  regional: RegionalSettings;
  consultationTemplates: ConsultationTemplate[];
  documentTemplates: DocumentTemplateDefinition[];
  automatedMessages: AutomatedMessageTemplate[];
  whatsapp: WhatsAppSettings;
  fiscal: FiscalSettings;
  audit: AuditSettings;
  security: BackupSecuritySettings;
  dashboard: DashboardSettings;
  units: ClinicUnit[];
  clinicalReminders: ClinicalReminderTemplate[];
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
  email?: string;
  document?: string; // CNPJ
  registrationNumber?: string; // IE or similar
  ownerId?: string; // Optional if standalone, but usually linked
  type?: string;
  zipCode?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
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
  ownerName?: string;
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
  
  healthPlanObj?: {
    name: string;
    number: string;
    expiryDate: string;
  };
  
  allergies?: string[]; // List of allergies
  chronicDiseases?: string[]; // Doenças crônicas
  
  anestheticRisk?: 'ASA I' | 'ASA II' | 'ASA III' | 'ASA IV' | 'ASA V'; // Risk classification
  color?: string; // Legacy alias for coat
  
  notes?: string; // General notes (Surgeries, etc.)
  internalNotes?: string; // Internal notes
  pregnant?: boolean; // If pregnant
  healthPlan?: string; // Convênio
  healthPlanNumber?: string; // Carteirinha
  healthPlanExpiry?: string; // Validade da carteirinha
}

export type UnitType =
  | 'un'
  | 'unidade'
  | 'ml'
  | 'mg'
  | 'g'
  | 'kg'
  | 'comprimido'
  | 'frasco'
  | 'pacote_fracionavel';

export type InventoryCategory = 'Medication' | 'Material' | 'Vaccine' | 'Feed' | 'Other';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  quantity: number; // Current available amount in the consumption unit
  unit: UnitType; // Consumption unit
  minStock: number;
  costPrice: number; // Total purchase cost
  salePrice: number; // Sale price per consumption unit
  unitCost?: number; // Calculated purchase cost per consumption unit
  packageQuantity?: number; // Original package content
  packageUnit?: UnitType; // Package content unit
  allowsFraction?: boolean;
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
  costAtMoment: number; // Unit cost at the moment of use
  priceAtMoment: number; // Unit sale price at the moment of use
}

export type AttendanceStatus = 'scheduled' | 'in_progress' | 'finished' | 'canceled';

export interface Vitals {
  weight?: number;
  temperature?: number;
  heartRate?: number;
  respiratoryRate?: number;
  mucousMembrane?: string;
  tpc?: number; // Tempo de preenchimento capilar
  motility?: {
    upperLeft: number;
    upperRight: number;
    lowerLeft: number;
    lowerRight: number;
  }; // Equine specific
}

export interface Attendance {
  id: string;
  patientId: string;
  patientName: string;
  vetId: string;
  ownerId?: string;
  ownerName?: string;
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
  returnDate?: string; // If scheduling a return
  notes?: string; // Unified notes if needed
  status: AttendanceStatus;
  consumedItems: ConsumptionItem[];
  totalCost: number; // Total operational cost
  totalService: number; // Revenue from professional fees and procedures
  totalTotal: number; // Final charged amount
  totalProductsRevenue?: number;
  totalProcedureCost?: number;
  totalProcedureRevenue?: number;
  totalVaccineCost?: number;
  totalVaccineRevenue?: number;
  grossProfit?: number;
  marginPercent?: number;
  financialRecordId?: string;
  vitals?: Vitals;
  updatedAt?: string;
  updatedBy?: string;
  finishedAt?: string;
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
  patientId?: string;
  ownerId?: string;
  patientName: string;
  ownerName: string;
  amount: number;
  totalCost?: number;
  grossProfit?: number;
  marginPercent?: number;
  professionalName?: string;
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
  grossAmount?: number;
  totalCost?: number;
  grossProfit?: number;
  marginPercent?: number;
  paymentStatus?: PaymentStatus;
  attendanceId?: string;
  patientId?: string;
  patientName?: string;
  ownerId?: string;
  ownerName?: string;
  professionalName?: string;
  description: string;
  referenceId?: string; // e.g., receivableId or purchaseId
}

export interface ProcedureTemplateItem {
  inventoryItemId: string;
  quantity: number;
  unit?: UnitType;
  itemName?: string;
  costUnit?: number;
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
    type: string; // V8, V10, Raiva, etc.
    name: string; // Rabisin, Lexton Gold, etc.
    dose: string; // e.g., '1ª Dose', 'Reforço', 'Dose Única'
    batch: string;
    manufacturer: string;
    manufacturingDate?: string;
    expiryDate: string;
    applicationDate: string;
    price: number;
    notes?: string;
    nextDoseDate?: string; // Scheduled next dose
}

export interface AppliedProcedure {
  id: string;
  attendanceId: string;
  procedureTemplateId?: string;
  name: string;
  category?: string;
  price: number;
  cost?: number;
  marginPercent?: number;
  consumedItems?: ConsumptionItem[];
  notes?: string;
  timestamp: string;
}

export interface ReturnVisit {
  id: string;
  attendanceId: string;
  date: string;
  time?: string;
  type: 'consulta' | 'vacina' | 'exame' | 'pos-cirurgico' | 'outros';
  reason: string;
  notes?: string;
}

export interface PrescriptionItem {
  id: string;
  type: 'industrialized' | 'compounded'; // Industrializado / Manipulado
  name: string; // Nome do fármaco ou fórmula
  concentration?: string; // e.g. 50mg, 10%
  formula?: string; // Multiline formula for compounded
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
  category?: string;
  description?: string;
  baseCost: number; // Legacy field used by current UI
  chargePrice?: number; // Suggested charged amount
  marginPercent?: number;
  duration?: string;
  averageTime?: string;
  notes?: string;
  operationalCost?: number;
  items: ProcedureTemplateItem[];
}

export interface FinancialRecord {
  id: string;
  attendanceId: string;
  patientId: string;
  patientName: string;
  ownerId?: string;
  ownerName: string;
  professionalName: string;
  date: string;
  grossAmount: number;
  totalCost: number;
  grossProfit: number;
  marginPercent: number;
  paymentStatus: PaymentStatus;
  procedureCount: number;
  description: string;
}
