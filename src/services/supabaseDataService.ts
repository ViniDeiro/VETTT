import { supabase } from '../lib/supabase';
import {
  GeneralSettings,
  InventoryItem,
  Owner,
  Patient,
  Property,
  Attendance,
  Receivable,
  CashRegisterSession,
  CashFlowEntry,
  FinancialRecord,
  ProcedureTemplate,
  TeamMember,
  AccessProfile,
  User,
  AuditLogEntry,
  BackupSnapshot,
  ConsumptionItem,
  VaccineApplication,
  AppliedProcedure
} from '../domain/types';

const todayStart = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const toNumber = (value: unknown, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const mapInventoryItem = (row: any): InventoryItem => {
  const quantity = toNumber(row.quantity);
  const minStock = toNumber(row.min_stock);
  const expiryDate = row.expiry_date || '';
  const isExpired = expiryDate ? new Date(expiryDate) < todayStart() : false;

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    quantity,
    unit: row.unit,
    minStock,
    costPrice: toNumber(row.cost_price),
    salePrice: toNumber(row.sale_price),
    unitCost: toNumber(row.unit_cost, row.package_quantity ? toNumber(row.cost_price) / toNumber(row.package_quantity, 1) : toNumber(row.cost_price)),
    packageQuantity: row.package_quantity == null ? undefined : toNumber(row.package_quantity),
    packageUnit: row.package_unit || undefined,
    allowsFraction: Boolean(row.allows_fraction),
    batchNumber: row.batch_number || '',
    expiryDate,
    validity: expiryDate,
    manufacturingDate: row.manufacturing_date || '',
    manufacturer: row.manufacturer || '',
    supplier: row.supplier || '',
    description: row.description || '',
    image: row.image_url || '',
    status: isExpired ? 'expired' : quantity <= minStock ? 'low' : 'ok'
  };
};

const inventoryPayload = (item: Partial<InventoryItem>) => {
  const packageQuantity = toNumber(item.packageQuantity, toNumber(item.quantity, 1) || 1);
  const costPrice = toNumber(item.costPrice);

  return {
    name: item.name,
    category: item.category,
    quantity: toNumber(item.quantity),
    unit: item.unit,
    min_stock: toNumber(item.minStock),
    cost_price: costPrice,
    unit_cost: packageQuantity > 0 ? Number((costPrice / packageQuantity).toFixed(4)) : costPrice,
    sale_price: toNumber(item.salePrice),
    package_quantity: packageQuantity,
    package_unit: item.packageUnit || item.unit,
    allows_fraction: Boolean(item.allowsFraction),
    batch_number: item.batchNumber || null,
    expiry_date: item.expiryDate || item.validity || null,
    manufacturing_date: item.manufacturingDate || null,
    manufacturer: item.manufacturer || null,
    supplier: item.supplier || null,
    description: item.description || null,
    image_url: item.image || null
  };
};

const mapOwner = (row: any): Owner => ({
  id: row.id,
  name: row.name,
  document: row.document || '',
  phone: row.phone || '',
  secondaryPhone: row.secondary_phone || '',
  email: row.email || '',
  address: row.address || '',
  zipCode: row.zip_code || '',
  street: row.street || '',
  number: row.number || '',
  neighborhood: row.neighborhood || '',
  city: row.city || '',
  state: row.state || ''
});

const ownerPayload = (owner: Partial<Owner>) => ({
  name: owner.name,
  document: owner.document || null,
  phone: owner.phone || null,
  secondary_phone: owner.secondaryPhone || null,
  email: owner.email || null,
  address: owner.address || null,
  zip_code: owner.zipCode || null,
  street: owner.street || null,
  number: owner.number || null,
  neighborhood: owner.neighborhood || null,
  city: owner.city || null,
  state: owner.state || null
});

const mapProperty = (row: any): Property => ({
  id: row.id,
  ownerId: row.owner_id || undefined,
  name: row.name,
  address: row.address || '',
  city: row.city || '',
  state: row.state || '',
  phone: row.phone || '',
  email: row.email || '',
  document: row.document || '',
  registrationNumber: row.registration_number || '',
  type: row.type || '',
  zipCode: row.zip_code || '',
  street: row.street || '',
  number: row.number || '',
  neighborhood: row.neighborhood || ''
});

const propertyPayload = (property: Partial<Property>) => ({
  owner_id: property.ownerId || null,
  name: property.name,
  address: property.address || null,
  city: property.city || null,
  state: property.state || null,
  phone: property.phone || null,
  email: property.email || null,
  document: property.document || null,
  registration_number: property.registrationNumber || null,
  type: property.type || null,
  zip_code: property.zipCode || null,
  street: property.street || null,
  number: property.number || null,
  neighborhood: property.neighborhood || null
});

const mapPatient = (row: any): Patient => ({
  id: row.id,
  name: row.name,
  species: row.species,
  breed: row.breed || '',
  birthDate: row.birth_date || '',
  age: row.age ?? undefined,
  ageMonths: row.age_months ?? undefined,
  ownerId: row.owner_id,
  propertyId: row.property_id || undefined,
  gender: row.gender || 'M',
  neutered: Boolean(row.neutered),
  pregnant: Boolean(row.pregnant),
  weight: row.weight == null ? undefined : toNumber(row.weight),
  photoUrl: row.photo_url || '',
  status: row.status || 'Alive',
  size: row.size || undefined,
  temperament: row.temperament || '',
  coat: row.coat || '',
  color: row.coat || '',
  microchip: row.microchip || '',
  rg: row.rg || '',
  healthPlan: row.health_plan || '',
  healthPlanNumber: row.health_plan_number || '',
  healthPlanExpiry: row.health_plan_expiry || '',
  healthPlanObj: row.health_plan_obj || undefined,
  allergies: row.allergies || [],
  chronicDiseases: row.chronic_diseases || [],
  anestheticRisk: row.anesthetic_risk || undefined,
  notes: row.notes || '',
  internalNotes: row.internal_notes || ''
});

const patientPayload = (patient: Partial<Patient>) => ({
  owner_id: patient.ownerId,
  property_id: patient.propertyId || null,
  name: patient.name,
  species: patient.species,
  custom_species: patient.species === 'Other' ? patient.species : null,
  breed: patient.breed || null,
  birth_date: patient.birthDate || null,
  age: patient.age ?? null,
  age_months: patient.ageMonths ?? null,
  gender: patient.gender || null,
  neutered: Boolean(patient.neutered),
  pregnant: Boolean(patient.pregnant),
  weight: patient.weight ?? null,
  photo_url: patient.photoUrl || null,
  status: patient.status || 'Alive',
  size: patient.size || null,
  temperament: patient.temperament || null,
  coat: patient.coat || patient.color || null,
  microchip: patient.microchip || null,
  rg: patient.rg || null,
  health_plan: patient.healthPlan || null,
  health_plan_number: patient.healthPlanNumber || null,
  health_plan_expiry: patient.healthPlanExpiry || null,
  health_plan_obj: patient.healthPlanObj || null,
  allergies: patient.allergies || [],
  chronic_diseases: patient.chronicDiseases || [],
  anesthetic_risk: patient.anestheticRisk || null,
  notes: patient.notes || null,
  internal_notes: patient.internalNotes || null
});

const mapUser = (row: any): User => ({
  id: row.id,
  name: row.name,
  fullName: row.full_name || row.name,
  role: row.role,
  email: row.email,
  phone: row.phone || '',
  functionTitle: row.function_title || '',
  accessProfileId: row.access_profile_id || undefined,
  status: row.status || 'active',
  createdAt: row.created_at,
  lastAccessAt: row.last_access_at || undefined,
  teamMemberId: row.team_member_id || undefined
});

const userPayload = (usr: Partial<User>) => ({
  name: usr.name,
  full_name: usr.fullName || usr.name,
  role: usr.role,
  email: usr.email,
  phone: usr.phone || null,
  function_title: usr.functionTitle || null,
  access_profile_id: usr.accessProfileId || null,
  status: usr.status || 'active',
  team_member_id: usr.teamMemberId || null
});

const mapTeamMember = (row: any): TeamMember => ({
  id: row.id,
  userId: row.user_id || undefined,
  name: row.name,
  functionTitle: row.function_title,
  specialty: row.specialty || '',
  crmv: row.crmv || '',
  cpf: row.cpf || '',
  phone: row.phone || '',
  email: row.email || '',
  signature: row.signature || '',
  photo: row.photo_url || '',
  status: row.status || 'active',
  createdAt: row.created_at
});

const teamMemberPayload = (mem: Partial<TeamMember>) => ({
  user_id: mem.userId || null,
  name: mem.name,
  function_title: mem.functionTitle,
  specialty: mem.specialty || null,
  crmv: mem.crmv || null,
  cpf: mem.cpf || null,
  phone: mem.phone || null,
  email: mem.email || null,
  signature: mem.signature || null,
  photo_url: mem.photo || null,
  status: mem.status || 'active'
});

const mapAttendance = (row: any): Attendance => ({
  id: row.id,
  patientId: row.patient_id,
  ownerId: row.owner_id || undefined,
  vetUserId: row.vet_user_id || undefined,
  patientName: row.patient_name,
  ownerName: row.owner_name || undefined,
  vetName: row.vet_name || undefined,
  date: row.date,
  reason: row.reason || '',
  anamnesis: row.anamnesis || '',
  diagnosis: row.diagnosis || '',
  consultationType: row.consultation_type || undefined,
  returnDate: row.return_date || undefined,
  notes: row.notes || '',
  status: row.status,
  vitals: row.vitals || {},
  totalCost: toNumber(row.total_cost),
  totalService: toNumber(row.total_service),
  totalTotal: toNumber(row.total_total),
  totalProductsRevenue: toNumber(row.total_products_revenue),
  totalProcedureCost: toNumber(row.total_procedure_cost),
  totalProcedureRevenue: toNumber(row.total_procedure_revenue),
  totalVaccineCost: toNumber(row.total_vaccine_cost),
  totalVaccineRevenue: toNumber(row.total_vaccine_revenue),
  grossProfit: toNumber(row.gross_profit),
  marginPercent: toNumber(row.margin_percent),
  finishedAt: row.finished_at || undefined,
  consumedItems: [],
  vaccines: [],
  procedures: [],
  prescriptions: [],
  examRequests: []
});

const attendancePayload = (att: Partial<Attendance>) => ({
  patient_id: att.patientId,
  owner_id: att.ownerId || null,
  vet_user_id: att.vetUserId || null,
  patient_name: att.patientName,
  owner_name: att.ownerName || null,
  vet_name: att.vetName || null,
  date: att.date || new Date().toISOString(),
  reason: att.reason || null,
  anamnesis: att.anamnesis || null,
  diagnosis: att.diagnosis || null,
  consultation_type: att.consultationType || null,
  return_date: att.returnDate || null,
  notes: att.notes || null,
  status: att.status || 'in_progress',
  vitals: att.vitals || {},
  total_cost: att.totalCost ?? 0,
  total_service: att.totalService ?? 0,
  total_total: att.totalTotal ?? 0,
  total_products_revenue: att.totalProductsRevenue ?? 0,
  total_procedure_cost: att.totalProcedureCost ?? 0,
  total_procedure_revenue: att.totalProcedureRevenue ?? 0,
  total_vaccine_cost: att.totalVaccineCost ?? 0,
  total_vaccine_revenue: att.totalVaccineRevenue ?? 0,
  gross_profit: att.grossProfit ?? 0,
  margin_percent: att.marginPercent ?? 0,
  finished_at: att.finishedAt || null
});

const mapReceivable = (row: any): Receivable => ({
  id: row.id,
  attendanceId: row.attendance_id || undefined,
  patientId: row.patient_id || undefined,
  ownerId: row.owner_id || undefined,
  patientName: row.patient_name,
  ownerName: row.owner_name || '',
  amount: toNumber(row.amount),
  totalCost: toNumber(row.total_cost),
  grossProfit: toNumber(row.gross_profit),
  marginPercent: toNumber(row.margin_percent),
  professionalName: row.professional_name || '',
  dueDate: row.due_date,
  status: row.status,
  paymentDate: row.payment_date || undefined,
  paymentMethod: row.payment_method || undefined,
  paymentDetails: row.payment_details || undefined,
  description: row.description || ''
});

const receivablePayload = (rec: Partial<Receivable>) => ({
  attendance_id: rec.attendanceId || null,
  patient_id: rec.patientId || null,
  owner_id: rec.ownerId || null,
  patient_name: rec.patientName,
  owner_name: rec.ownerName || null,
  amount: rec.amount ?? 0,
  total_cost: rec.totalCost ?? 0,
  gross_profit: rec.grossProfit ?? 0,
  margin_percent: rec.marginPercent ?? 0,
  professional_name: rec.professionalName || null,
  due_date: rec.dueDate,
  status: rec.status || 'pending',
  payment_date: rec.paymentDate || null,
  payment_method: rec.paymentMethod || null,
  payment_details: rec.paymentDetails || null,
  description: rec.description || null
});

const mapCashSession = (row: any): CashRegisterSession => ({
  id: row.id,
  businessDate: row.business_date,
  status: row.status,
  openedAt: row.opened_at,
  closedAt: row.closed_at || undefined,
  openingBalance: toNumber(row.opening_balance),
  closingBalance: row.closing_balance == null ? undefined : toNumber(row.closing_balance),
  notes: row.notes || '',
  summary: row.summary || {
    totalIncome: 0,
    totalExpense: 0,
    netAmount: 0,
    receivedCash: 0,
    receivedPix: 0,
    receivedDebit: 0,
    receivedCredit: 0,
    receivedTransfer: 0,
    receivedBankSlip: 0
  }
});

const cashSessionPayload = (sess: Partial<CashRegisterSession>) => ({
  business_date: sess.businessDate,
  status: sess.status || 'open',
  opened_at: sess.openedAt || new Date().toISOString(),
  closed_at: sess.closedAt || null,
  opening_balance: sess.openingBalance ?? 0,
  closing_balance: sess.closingBalance ?? null,
  notes: sess.notes || null,
  summary: sess.summary || {}
});

const mapCashFlowEntry = (row: any): CashFlowEntry => ({
  id: row.id,
  cashSessionId: row.cash_session_id || undefined,
  attendanceId: row.attendance_id || undefined,
  patientId: row.patient_id || undefined,
  ownerId: row.owner_id || undefined,
  referenceId: row.reference_id || undefined,
  date: row.date,
  businessDate: row.business_date || '',
  type: row.type,
  category: row.category,
  amount: toNumber(row.amount),
  grossAmount: row.gross_amount == null ? undefined : toNumber(row.gross_amount),
  totalCost: row.total_cost == null ? undefined : toNumber(row.total_cost),
  grossProfit: row.gross_profit == null ? undefined : toNumber(row.gross_profit),
  marginPercent: row.margin_percent == null ? undefined : toNumber(row.margin_percent),
  paymentStatus: row.payment_status || undefined,
  paymentMethod: row.payment_method || undefined,
  patientName: row.patient_name || undefined,
  ownerName: row.owner_name || undefined,
  professionalName: row.professional_name || undefined,
  description: row.description || '',
  sourceType: row.source_type || undefined
});

const cashFlowPayload = (entry: Partial<CashFlowEntry>) => ({
  cash_session_id: entry.cashSessionId || null,
  attendance_id: entry.attendanceId || null,
  patient_id: entry.patientId || null,
  owner_id: entry.ownerId || null,
  reference_id: entry.referenceId || null,
  date: entry.date || new Date().toISOString(),
  business_date: entry.businessDate || null,
  type: entry.type,
  category: entry.category,
  amount: entry.amount ?? 0,
  gross_amount: entry.grossAmount ?? null,
  total_cost: entry.totalCost ?? null,
  gross_profit: entry.grossProfit ?? null,
  margin_percent: entry.marginPercent ?? null,
  payment_status: entry.paymentStatus || null,
  payment_method: entry.paymentMethod || null,
  patient_name: entry.patientName || null,
  owner_name: entry.ownerName || null,
  professional_name: entry.professionalName || null,
  description: entry.description || null,
  source_type: entry.sourceType || null
});

const mapFinancialRecord = (row: any): FinancialRecord => ({
  id: row.id,
  attendanceId: row.attendance_id || undefined,
  patientId: row.patient_id || undefined,
  ownerId: row.owner_id || undefined,
  patientName: row.patient_name,
  ownerName: row.owner_name || '',
  professionalName: row.professional_name || '',
  date: row.date,
  grossAmount: toNumber(row.gross_amount),
  totalCost: toNumber(row.total_cost),
  grossProfit: toNumber(row.gross_profit),
  marginPercent: toNumber(row.margin_percent),
  paymentStatus: row.payment_status,
  procedureCount: row.procedure_count,
  description: row.description || ''
});

const financialRecordPayload = (rec: Partial<FinancialRecord>) => ({
  attendance_id: rec.attendanceId || null,
  patient_id: rec.patientId || null,
  owner_id: rec.ownerId || null,
  patient_name: rec.patientName,
  owner_name: rec.ownerName || null,
  professional_name: rec.professionalName || null,
  date: rec.date || new Date().toISOString(),
  gross_amount: rec.grossAmount ?? 0,
  total_cost: rec.totalCost ?? 0,
  gross_profit: rec.grossProfit ?? 0,
  margin_percent: rec.marginPercent ?? 0,
  payment_status: rec.paymentStatus || 'pending',
  procedure_count: rec.procedureCount ?? 0,
  description: rec.description || null
});

const mapProcedureTemplate = (row: any): ProcedureTemplate => ({
  id: row.id,
  name: row.name,
  category: row.category || '',
  description: row.description || '',
  baseCost: toNumber(row.base_cost),
  chargePrice: row.charge_price == null ? undefined : toNumber(row.charge_price),
  marginPercent: row.margin_percent == null ? undefined : toNumber(row.margin_percent),
  duration: row.duration || '',
  averageTime: row.average_time || '',
  operationalCost: row.operational_cost == null ? undefined : toNumber(row.operational_cost),
  notes: row.notes || '',
  items: []
});

const procedurePayload = (proc: Partial<ProcedureTemplate>) => ({
  name: proc.name,
  category: proc.category || null,
  description: proc.description || null,
  base_cost: proc.baseCost ?? 0,
  charge_price: proc.chargePrice ?? null,
  margin_percent: proc.marginPercent ?? null,
  duration: proc.duration || null,
  average_time: proc.averageTime || proc.duration || null,
  operational_cost: proc.operationalCost ?? null,
  notes: proc.notes || null
});

const mapAccessProfile = (row: any): AccessProfile => ({
  id: row.id,
  name: row.name,
  description: row.description || '',
  type: row.type || 'custom',
  baseRole: row.base_role || undefined,
  permissions: row.permissions || {},
  restrictions: row.restrictions || {}
});

const accessProfilePayload = (prof: Partial<AccessProfile>) => ({
  name: prof.name,
  description: prof.description || null,
  type: prof.type || 'custom',
  base_role: prof.baseRole || null,
  permissions: prof.permissions || {},
  restrictions: prof.restrictions || {}
});

const mapAuditLog = (row: any): AuditLogEntry => ({
  id: row.id,
  actorUserId: row.actor_user_id || null,
  actorName: row.actor_name,
  entity: row.entity,
  action: row.action,
  changedField: row.changed_field || undefined,
  previousValue: row.previous_value,
  newValue: row.new_value,
  createdAt: row.created_at
});

const mapBackup = (row: any): BackupSnapshot => ({
  id: row.id,
  label: row.label,
  createdBy: row.created_by || undefined,
  data: row.data || {},
  createdAt: row.created_at
});

const mapAppointment = (row: any): any => {
  if (!row) return null;
  return {
    id: row.id,
    patientId: row.patient_id,
    ownerId: row.owner_id,
    doctorUserId: row.doctor_user_id,
    doctor: row.doctor_name,
    title: row.title,
    patient: row.payload?.patient || row.payload?.patientName || row.title,
    patientName: row.payload?.patientName || row.payload?.patient || row.title,
    customType: row.payload?.customType,
    procedure: row.payload?.procedure,
    start: row.start_at,
    end: row.end_at,
    appointmentMode: row.appointment_mode,
    type: row.type,
    status: row.status,
    color: row.color,
    notes: row.notes
  };
};

const assertClient = () => {
  if (!supabase) throw new Error('Supabase nao configurado.');
  return supabase;
};

const getCurrentClinicId = async () => {
  const client = assertClient();
  const { data, error } = await client
    .from('user_profiles')
    .select('clinic_id')
    .eq('id', (await client.auth.getUser()).data.user?.id)
    .single();

  if (error) throw error;
  return data.clinic_id;
};

const INITIAL_GENERAL_SETTINGS: GeneralSettings = {
  clinic: {
    fantasyName: 'Clinica Veterinaria VetTooth',
    legalName: 'VetTooth Servicos Veterinarios LTDA',
    cnpj: '12.345.678/0001-99',
    cpf: '',
    address: 'Rua das Flores',
    number: '123',
    complement: '',
    neighborhood: 'Centro',
    city: 'Sao Paulo',
    state: 'SP',
    zipCode: '01234-567',
    phone: '(11) 99999-9999',
    email: 'contato@vettooth.com.br',
    website: 'www.vettooth.com.br',
    socialMedia: '@vettooth',
    logo: null,
    documentLogo: null
  },
  appearance: {
    primaryColor: '#0B2C4D',
    buttonColor: '#0F766E',
    sidebarColor: '#0B2C4D',
    theme: 'light',
    appIcon: null
  },
  documents: {
    selectedModel: 'classic',
    header: 'Clinica Veterinaria VetTooth',
    footer: 'Atendimento odontologico veterinario especializado',
    logoPosition: 'left',
    fontFamily: 'helvetica',
    fontSize: 11,
    showSignature: true,
    autoCrmv: true,
    autoCnpj: true,
    showAddress: true,
    showQrCode: false,
    legalNotes: 'Documento emitido conforme as configuracoes da clinica.'
  },
  regional: {
    language: 'pt-BR',
    dateFormat: 'DD/MM/AAAA',
    timeFormat: '24h',
    currency: 'BRL',
    decimalSeparator: ','
  },
  payment: {
    enabledMethods: ['cash', 'pix', 'debit', 'credit'],
    allowInstallments: true,
    maxInstallments: 6,
    installmentInterestRate: 0,
    installmentRates: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0
    },
    installmentInterestType: 'simple'
  },
  consultationTemplates: [
    {
      id: 'consult-1',
      name: 'Consulta clinica',
      speciesFocus: 'Caes',
      defaultValue: 180,
      duration: '30 min',
      icon: '🩺',
      anamnesisText: 'Queixa principal, alimentacao, uso de medicamentos e historico recente.',
      physicalExamText: 'Paciente em bom estado geral. Nódulos linfáticos normais. Ausculta cardiopulmonar sem alterações.',
      diagnosisText: 'Exame clínico dentro da normalidade. Sugerido acompanhamento anual.',
      checklist: ['Peso', 'Temperatura', 'Avaliacao oral'],
      physicalExamChecklist: ['Inspecao geral', 'Mucosas', 'Palpacao abdominal'],
      diagnosisChecklist: ['Hipotese principal', 'Diferenciais', 'Plano inicial'],
      requiredFields: ['Queixa principal', 'Diagnostico']
    },
    {
      id: 'consult-2',
      name: 'Odontologia veterinaria',
      speciesFocus: 'Felinos',
      defaultValue: 260,
      duration: '50 min',
      icon: '🦷',
      anamnesisText: 'Odor oral, sangramento gengival, dor, alimentacao e higiene oral.',
      physicalExamText: 'Halitose presente. Presença de cálculo dentário. Gengivite.',
      diagnosisText: 'Doença periodontal grau 2. Indicado profilaxia dentária.',
      checklist: ['Odontograma', 'Anestesia', 'Termo assinado'],
      physicalExamChecklist: ['Avaliacao oral completa', 'Dor a palpacao', 'Sangramento gengival'],
      diagnosisChecklist: ['Doenca periodontal', 'Fraturas dentarias', 'Plano odontologico'],
      requiredFields: ['Odontograma', 'Plano terapeutico']
    },
    {
      id: 'consult-3',
      name: 'Cirurgia',
      speciesFocus: 'Equinos',
      defaultValue: 500,
      duration: '90 min',
      icon: '✂️',
      anamnesisText: 'Jejum, risco anestesico, hemograma e autorizacoes.',
      physicalExamText: 'Apto para procedimento cirúrgico. Risco cirúrgico classificado.',
      diagnosisText: 'Indicado procedimento cirúrgico conforme avaliação.',
      checklist: ['Hemograma', 'Assinatura', 'Checklist pre-operatorio'],
      physicalExamChecklist: ['Avaliacao cardiaca', 'Avaliacao respiratoria', 'Acesso venoso'],
      diagnosisChecklist: ['Indicacao cirurgica', 'Risco anestesico', 'Planejamento cirurgico'],
      requiredFields: ['Consentimento', 'Plano anestesico']
    }
  ],
  documentTemplates: [
    {
      id: 'doc-1',
      type: 'receita',
      title: 'Receita padrao',
      content: 'Paciente: {nome_paciente}\nTutor: {nome_tutor}\nPrescricao: {conteudo}',
      isDefault: true,
      useInAttendance: true,
      includePatientName: true,
      includeOwnerName: true,
      includeVetName: true,
      includeVetCrmv: true
    },
    {
      id: 'doc-2',
      type: 'atestado',
      title: 'Atestado clinico',
      content: 'Atesto para os devidos fins que {nome_paciente} foi atendido em {data}.',
      useInAttendance: true,
      includePatientName: true,
      includeOwnerName: true,
      includeVetName: true,
      includeVetCrmv: true
    },
    {
      id: 'doc-3',
      type: 'alta medica',
      title: 'Alta padrao',
      content: 'Paciente liberado com orientacoes de retorno e observacao domiciliar.',
      useInAttendance: true,
      includePatientName: true,
      includeOwnerName: true,
      includeVetName: true
    }
  ],
  automatedMessages: [
    {
      id: 'msg-1',
      type: 'confirmacao de agendamento',
      channel: 'whatsapp',
      enabled: true,
      template: 'Ola, {nome_tutor}, o atendimento de {nome_paciente} esta agendado para {data} as {hora}.',
      variables: ['nome_tutor', 'nome_paciente', 'data', 'hora']
    },
    {
      id: 'msg-2',
      type: 'lembrete de consulta',
      channel: 'whatsapp',
      enabled: true,
      template: 'Lembrete: {nome_paciente} sera atendido em {data} as {hora}.',
      variables: ['nome_paciente', 'data', 'hora']
    },
    {
      id: 'msg-3',
      type: 'cobranca pendente',
      channel: 'email',
      enabled: false,
      template: 'Ola, {nome_tutor}. Identificamos uma cobranca pendente no valor de {valor}.',
      variables: ['nome_tutor', 'valor']
    }
  ],
  whatsapp: {
    connected: false,
    provider: 'Meta Cloud API',
    apiUrl: '',
    instanceName: 'vettooth-principal',
    token: '',
    autoSendMessages: true,
    sendPdf: true,
    sendReminders: true,
    confirmAppointments: true,
    chargeNotifications: true,
    paymentLink: true
  },
  fiscal: {
    includeCnpjOnAllDocuments: true,
    municipalApiUrl: '',
    municipalProvider: 'API municipal',
    cityCode: '3550308',
    environment: 'homologation',
    issueInvoices: true,
    issueReceipts: true,
    issuePaymentProofs: true,
    defaultServiceCode: 'VET-001',
    defaultTaxRate: 5,
    nextInvoiceNumber: 1
  },
  audit: {
    enabled: true,
    retainDays: 180,
    logSensitiveActions: true
  },
  security: {
    dailyAutoBackup: true,
    manualBackupEnabled: true,
    restoreEnabled: true,
    twoFactorEnabled: false,
    passwordResetEnabled: true,
    sessionTimeoutMinutes: 120,
    backupRetentionDays: 30,
    lastBackupAt: undefined
  },
  dashboard: {
    enabledIndicators: ['faturamento', 'ticket_medio', 'lucro', 'numero_atendimentos', 'retorno', 'estoque_critico']
  },
  units: [
    {
      id: 'unit-1',
      name: 'VetTooth Matriz',
      type: 'matriz',
      zipCode: '01234-567',
      city: 'Sao Paulo',
      state: 'SP',
      address: 'Rua das Flores, 123',
      neighborhood: 'Centro',
      number: '123',
      complement: 'Sala 2',
      phone: '(11) 3333-4444',
      contact: 'contato@vettooth.com',
      responsibleName: 'Dra. Mariana Costa',
      attendantName: 'Ana Souza',
      active: true
    }
  ],
  clinicalReminders: [
    {
      id: 'reminder-1',
      name: 'Retorno em 7 dias',
      daysAfter: 7,
      message: 'Agendar retorno clinico em 7 dias para reavaliacao.',
      active: true
    },
    {
      id: 'reminder-2',
      name: 'Reavaliacao odontologica',
      daysAfter: 180,
      message: 'Recomendamos reavaliacao odontologica semestral.',
      active: true
    },
    {
      id: 'reminder-3',
      name: 'Revacinacao',
      daysAfter: 365,
      message: 'Paciente em janela de revacinacao preventiva.',
      active: true
    }
  ]
};

export const supabaseDataService = {
  async getSettings(): Promise<GeneralSettings> {
    if (!supabase) return INITIAL_GENERAL_SETTINGS;

    const { data, error } = await supabase
      .from('general_settings')
      .select('settings')
      .maybeSingle();

    if (error || !data?.settings || Object.keys(data.settings).length === 0) {
      return INITIAL_GENERAL_SETTINGS;
    }

    return {
      ...INITIAL_GENERAL_SETTINGS,
      ...data.settings
    };
  },

  async saveSettings(settings: GeneralSettings): Promise<GeneralSettings> {
    const client = assertClient();
    const clinicId = await getCurrentClinicId();
    const { data, error } = await client
      .from('general_settings')
      .upsert({ clinic_id: clinicId, settings }, { onConflict: 'clinic_id' })
      .select('settings')
      .single();

    if (error) throw error;
    return {
      ...INITIAL_GENERAL_SETTINGS,
      ...data.settings
    };
  },

  async getInventory(): Promise<InventoryItem[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .order('name');

    if (error) throw error;
    return (data || []).map(mapInventoryItem);
  },

  async createInventoryItem(item: Partial<InventoryItem>): Promise<InventoryItem> {
    const client = assertClient();
    const clinicId = await getCurrentClinicId();
    const { data, error } = await client
      .from('inventory_items')
      .insert({ ...inventoryPayload(item), clinic_id: clinicId })
      .select('*')
      .single();

    if (error) throw error;
    return mapInventoryItem(data);
  },

  async updateInventoryItem(id: string, item: Partial<InventoryItem>): Promise<InventoryItem> {
    const client = assertClient();
    const { data, error } = await client
      .from('inventory_items')
      .update(inventoryPayload(item))
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return mapInventoryItem(data);
  },

  async updateStock(id: string, delta: number): Promise<InventoryItem> {
    const client = assertClient();
    const current = (await this.getInventory()).find(item => item.id === id);
    if (!current) throw new Error('Item de estoque nao encontrado.');
    return this.updateInventoryItem(id, {
      ...current,
      quantity: Math.max(0, toNumber(current.quantity) + delta)
    });
  },

  async deleteInventoryItem(id: string): Promise<void> {
    const client = assertClient();
    const { error } = await client.from('inventory_items').delete().eq('id', id);
    if (error) throw error;
  },

  async getOwners(): Promise<Owner[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('owners').select('*').order('name');
    if (error) throw error;
    return (data || []).map(mapOwner);
  },

  async createOwner(owner: Partial<Owner>): Promise<Owner> {
    const client = assertClient();
    const clinicId = await getCurrentClinicId();
    const { data, error } = await client.from('owners').insert({ ...ownerPayload(owner), clinic_id: clinicId }).select('*').single();
    if (error) throw error;
    return mapOwner(data);
  },

  async getProperties(): Promise<Property[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('properties').select('*').order('name');
    if (error) throw error;
    return (data || []).map(mapProperty);
  },

  async createProperty(property: Partial<Property>): Promise<Property> {
    const client = assertClient();
    const clinicId = await getCurrentClinicId();
    const { data, error } = await client.from('properties').insert({ ...propertyPayload(property), clinic_id: clinicId }).select('*').single();
    if (error) throw error;
    return mapProperty(data);
  },

  async getPatients(): Promise<Patient[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('patients').select('*').order('name');
    if (error) throw error;
    return (data || []).map(mapPatient);
  },

  async createPatient(patient: Partial<Patient>): Promise<Patient> {
    const client = assertClient();
    const clinicId = await getCurrentClinicId();
    const { data, error } = await client.from('patients').insert({ ...patientPayload(patient), clinic_id: clinicId }).select('*').single();
    if (error) throw error;
    return mapPatient(data);
  },

  async updateOwner(id: string, owner: Partial<Owner>): Promise<Owner> {
    const client = assertClient();
    const { data, error } = await client.from('owners').update(ownerPayload(owner)).eq('id', id).select('*').single();
    if (error) throw error;
    return mapOwner(data);
  },

  async deleteOwner(id: string): Promise<void> {
    const client = assertClient();
    const { error } = await client.from('owners').delete().eq('id', id);
    if (error) throw error;
  },

  async updatePatient(id: string, patient: Partial<Patient>): Promise<Patient> {
    const client = assertClient();
    const { data, error } = await client.from('patients').update(patientPayload(patient)).eq('id', id).select('*').single();
    if (error) throw error;
    return mapPatient(data);
  },

  async deletePatient(id: string): Promise<void> {
    const client = assertClient();
    const { error } = await client.from('patients').delete().eq('id', id);
    if (error) throw error;
  },

  async updateProperty(id: string, property: Partial<Property>): Promise<Property> {
    const client = assertClient();
    const { data, error } = await client.from('properties').update(propertyPayload(property)).eq('id', id).select('*').single();
    if (error) throw error;
    return mapProperty(data);
  },

  async deleteProperty(id: string): Promise<void> {
    const client = assertClient();
    const { error } = await client.from('properties').delete().eq('id', id);
    if (error) throw error;
  },

  async getAppointments(): Promise<any[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('start_at', { ascending: true });

    if (error) throw error;
    return (data || []).map(row => mapAppointment(row));
  },

  // --- Appointments ---
  async createAppointment(appt: any): Promise<any> {
    const client = assertClient();
    const clinicId = await getCurrentClinicId();
    const { data, error } = await client.from('appointments').insert({
      clinic_id: clinicId,
      patient_id: appt.patientId || null,
      owner_id: appt.ownerId || null,
      doctor_user_id: appt.doctorUserId || null,
      doctor_name: appt.doctor || null,
      title: appt.title || '',
      start_at: appt.start,
      end_at: appt.end || null,
      appointment_mode: appt.appointmentMode || null,
      type: appt.type || null,
      status: appt.status || 'scheduled',
      color: appt.color || null,
      notes: appt.notes || null,
      payload: {
        patient: appt.patient || appt.patientName || appt.title,
        patientName: appt.patientName || appt.patient || appt.title,
        customType: appt.customType || null,
        procedure: appt.procedure || null
      }
    }).select('*').single();

    if (error) throw error;
    return mapAppointment(data);
  },

  async updateAppointment(id: string, updates: any): Promise<any> {
    const client = assertClient();
    const payload: any = {};
    if (updates.patientId !== undefined) payload.patient_id = updates.patientId;
    if (updates.ownerId !== undefined) payload.owner_id = updates.ownerId;
    if (updates.doctorUserId !== undefined) payload.doctor_user_id = updates.doctorUserId;
    if (updates.doctor !== undefined) payload.doctor_name = updates.doctor;
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.start !== undefined) payload.start_at = updates.start;
    if (updates.end !== undefined) payload.end_at = updates.end;
    if (updates.appointmentMode !== undefined) payload.appointment_mode = updates.appointmentMode;
    if (updates.type !== undefined) payload.type = updates.type;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.color !== undefined) payload.color = updates.color;
    if (updates.notes !== undefined) payload.notes = updates.notes;
    if (updates.patient || updates.patientName || updates.customType || updates.procedure) {
      payload.payload = {
        patient: updates.patient || updates.patientName,
        patientName: updates.patientName || updates.patient,
        customType: updates.customType,
        procedure: updates.procedure
      };
    }

    const { data, error } = await client.from('appointments').update(payload).eq('id', id).select('*').single();
    if (error) throw error;
    return mapAppointment(data);
  },

  async deleteAppointment(id: string): Promise<void> {
    const client = assertClient();
    const { error } = await client.from('appointments').delete().eq('id', id);
    if (error) throw error;
  },

  // --- Attendances ---
  async getAttendances(): Promise<Attendance[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('attendances').select('*').order('date', { ascending: false });
    if (error) throw error;
    const list = (data || []).map(mapAttendance);
    if (list.length === 0) return [];
    return this.populateAttendances(list);
  },

  async getAttendancesByPatientId(patientId: string): Promise<Attendance[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('attendances')
      .select('*')
      .eq('patient_id', patientId)
      .order('date', { ascending: false });

    if (error) throw error;
    const list = (data || []).map(mapAttendance);
    if (list.length === 0) return [];
    return this.populateAttendances(list, patientId);
  },

  async populateAttendances(attendances: Attendance[], patientId?: string): Promise<Attendance[]> {
    if (!supabase || attendances.length === 0) return attendances;
    const attIds = attendances.map(a => a.id);

    // Fetch related records in parallel
    const consumedQuery = supabase.from('attendance_consumed_items').select('*').in('attendance_id', attIds);
    const proceduresQuery = supabase.from('applied_procedures').select('*').in('attendance_id', attIds);
    
    // For vaccines, prescriptions, and exam requests, filter by patient_id if provided, otherwise by attendance_id
    const vaccinesQuery = patientId 
      ? supabase.from('vaccine_applications').select('*').eq('patient_id', patientId)
      : supabase.from('vaccine_applications').select('*').in('attendance_id', attIds);
      
    const prescriptionsQuery = patientId
      ? supabase.from('prescriptions').select('*').eq('patient_id', patientId)
      : supabase.from('prescriptions').select('*').in('attendance_id', attIds);
      
    const examRequestsQuery = patientId
      ? supabase.from('exam_requests').select('*').eq('patient_id', patientId)
      : supabase.from('exam_requests').select('*').in('attendance_id', attIds);

    const [
      { data: consumedData },
      { data: proceduresData },
      { data: vaccinesData },
      { data: prescriptionsData },
      { data: prescriptionItemsData },
      { data: examRequestsData },
      { data: examRequestItemsData }
    ] = await Promise.all([
      consumedQuery,
      proceduresQuery,
      vaccinesQuery,
      prescriptionsQuery,
      supabase.from('prescription_items').select('*'),
      examRequestsQuery,
      supabase.from('exam_request_items').select('*')
    ]);

    // Map consumed items
    const consumedMap: Record<string, any[]> = {};
    (consumedData || []).forEach(row => {
      if (!consumedMap[row.attendance_id]) consumedMap[row.attendance_id] = [];
      consumedMap[row.attendance_id].push({
        inventoryItemId: row.inventory_item_id || undefined,
        itemName: row.item_name,
        quantityUsed: toNumber(row.quantity_used),
        unit: row.unit || undefined,
        costAtMoment: toNumber(row.cost_at_moment),
        priceAtMoment: toNumber(row.price_at_moment)
      });
    });

    // Map applied procedures
    const proceduresMap: Record<string, any[]> = {};
    (proceduresData || []).forEach(row => {
      if (!proceduresMap[row.attendance_id]) proceduresMap[row.attendance_id] = [];
      proceduresMap[row.attendance_id].push({
        id: row.id,
        attendanceId: row.attendance_id,
        procedureTemplateId: row.procedure_template_id || undefined,
        name: row.name,
        category: row.category || undefined,
        price: toNumber(row.price),
        cost: toNumber(row.cost),
        marginPercent: toNumber(row.margin_percent),
        consumedItems: row.consumed_items || [],
        notes: row.notes || '',
        timestamp: row.timestamp
      });
    });

    // Map vaccines
    const vaccinesMap: Record<string, any[]> = {};
    (vaccinesData || []).forEach(row => {
      if (!vaccinesMap[row.attendance_id]) vaccinesMap[row.attendance_id] = [];
      vaccinesMap[row.attendance_id].push({
        id: row.id,
        attendanceId: row.attendance_id,
        inventoryItemId: row.inventory_item_id || undefined,
        type: row.type || undefined,
        name: row.name,
        dose: row.dose || undefined,
        batch: row.batch || undefined,
        manufacturer: row.manufacturer || undefined,
        expiryDate: row.expiry_date || undefined,
        applicationDate: row.application_date,
        price: toNumber(row.price),
        notes: row.notes || '',
        nextDoseDate: row.next_dose_date || undefined
      });
    });

    // Map prescription items by prescription id
    const itemsMap: Record<string, any[]> = {};
    (prescriptionItemsData || []).forEach(row => {
      if (!itemsMap[row.prescription_id]) itemsMap[row.prescription_id] = [];
      itemsMap[row.prescription_id].push({
        id: row.id,
        type: row.type,
        name: row.name,
        concentration: row.concentration || '',
        formula: row.formula || '',
        quantity: row.quantity || '',
        dosage: row.dosage || '',
        frequency: row.frequency || '',
        duration: row.duration || '',
        route: row.route || '',
        instructions: row.instructions || ''
      });
    });

    // Map prescriptions
    const prescriptionsMap: Record<string, any[]> = {};
    (prescriptionsData || []).forEach(row => {
      if (!prescriptionsMap[row.attendance_id]) prescriptionsMap[row.attendance_id] = [];
      prescriptionsMap[row.attendance_id].push({
        id: row.id,
        attendanceId: row.attendance_id,
        date: row.date ? new Date(row.date).toLocaleDateString('pt-BR') : '',
        items: itemsMap[row.id] || [],
        digitalSignature: Boolean(row.digital_signature),
        controlledMedication: Boolean(row.controlled_medication)
      });
    });

    // Map exam request items by request id
    const examItemsMap: Record<string, any[]> = {};
    (examRequestItemsData || []).forEach(row => {
      if (!examItemsMap[row.exam_request_id]) examItemsMap[row.exam_request_id] = [];
      examItemsMap[row.exam_request_id].push({
        id: row.id,
        name: row.name,
        type: row.type,
        instructions: row.instructions || ''
      });
    });

    // Map exam requests
    const examRequestsMap: Record<string, any[]> = {};
    (examRequestsData || []).forEach(row => {
      if (!examRequestsMap[row.attendance_id]) examRequestsMap[row.attendance_id] = [];
      examRequestsMap[row.attendance_id].push({
        id: row.id,
        attendanceId: row.attendance_id,
        date: row.date ? new Date(row.date).toLocaleDateString('pt-BR') : '',
        items: examItemsMap[row.id] || [],
        clinicalIndication: row.clinical_indication || '',
        priority: row.priority || 'routine'
      });
    });

    // Assemble everything back into the attendances list
    attendances.forEach(att => {
      att.consumedItems = consumedMap[att.id] || [];
      att.procedures = proceduresMap[att.id] || [];
      att.vaccines = vaccinesMap[att.id] || [];
      att.prescriptions = prescriptionsMap[att.id] || [];
      att.examRequests = examRequestsMap[att.id] || [];
    });

    return attendances;
  },

  async createAttendance(att: Partial<Attendance>): Promise<Attendance> {
    const client = assertClient();
    const clinicId = await getCurrentClinicId();
    const { data, error } = await client.from('attendances').insert({
      ...attendancePayload(att),
      clinic_id: clinicId
    }).select('*').single();

    if (error) throw error;
    return mapAttendance(data);
  },

  async updateAttendance(id: string, updates: Partial<Attendance>): Promise<Attendance> {
    const client = assertClient();
    const { data, error } = await client.from('attendances').update(attendancePayload(updates)).eq('id', id).select('*').single();
    if (error) throw error;
    return mapAttendance(data);
  },

  async finishAttendance(
    attendanceId: string,
    serviceFee: number,
    items: ConsumptionItem[],
    vaccines: VaccineApplication[] = [],
    procedures: AppliedProcedure[] = [],
    returnVisit?: any
  ): Promise<Attendance> {
    const client = assertClient();

    // 1. Fetch current attendance and patient
    const { data: attendanceRow, error: attError } = await client.from('attendances').select('*').eq('id', attendanceId).single();
    if (attError || !attendanceRow) throw new Error('Atendimento não encontrado');
    const attendance = mapAttendance(attendanceRow);

    const { data: patientRow, error: patError } = await client.from('patients').select('*').eq('id', attendance.patientId).single();
    if (patError || !patientRow) throw new Error('Paciente não encontrado');
    const patient = mapPatient(patientRow);

    // 2. Fetch owner if exists
    let ownerName = 'Desconhecido';
    if (patient.ownerId) {
      const { data: ownerRow } = await client.from('owners').select('name').eq('id', patient.ownerId).maybeSingle();
      if (ownerRow) ownerName = ownerRow.name;
    }

    // Calculate totals
    const materialsCost = Number(items.reduce((acc, item) => acc + (item.costAtMoment * item.quantityUsed), 0).toFixed(2));
    const materialsPrice = Number(items.reduce((acc, item) => acc + (item.priceAtMoment * item.quantityUsed), 0).toFixed(2));
    const vaccinesCost = Number(vaccines.reduce((acc, vac) => acc + (vac.price * 0.4), 0).toFixed(2)); // mock cost as 40% of price
    const vaccinesPrice = Number(vaccines.reduce((acc, vac) => acc + vac.price, 0).toFixed(2));
    const proceduresCost = Number(procedures.reduce((acc, proc) => acc + (proc.cost || 0), 0).toFixed(2));
    const proceduresPrice = Number(procedures.reduce((acc, proc) => acc + proc.price, 0).toFixed(2));

    const totalRevenue = Number((serviceFee + materialsPrice + vaccinesPrice + proceduresPrice).toFixed(2));
    const totalCost = Number((materialsCost + vaccinesCost + proceduresCost).toFixed(2));
    const grossProfit = Number((totalRevenue - totalCost).toFixed(2));
    const marginPercent = totalRevenue > 0 ? Number(((grossProfit / totalRevenue) * 100).toFixed(2)) : 0;

    // Deduct inventory and insert consumed items/vaccines/procedures
    for (const item of items) {
      if (item.inventoryItemId) {
        await this.updateStock(item.inventoryItemId, -item.quantityUsed);
      }
      await client.from('attendance_consumed_items').insert({
        attendance_id: attendanceId,
        inventory_item_id: item.inventoryItemId || null,
        item_name: item.itemName,
        quantity_used: item.quantityUsed,
        unit: item.unit || null,
        cost_at_moment: item.costAtMoment,
        price_at_moment: item.priceAtMoment
      });
    }

    for (const vac of vaccines) {
      if (vac.inventoryItemId) {
        await this.updateStock(vac.inventoryItemId, -1);
      }
      await client.from('vaccine_applications').insert({
        attendance_id: attendanceId,
        patient_id: attendance.patientId,
        inventory_item_id: vac.inventoryItemId || null,
        type: vac.type || null,
        name: vac.name,
        dose: vac.dose || null,
        batch: vac.batch || null,
        manufacturer: vac.manufacturer || null,
        expiry_date: vac.expiryDate || null,
        price: vac.price,
        application_date: vac.applicationDate || new Date().toISOString().split('T')[0],
        next_dose_date: vac.nextDoseDate || null
      });
    }

    for (const proc of procedures) {
      await client.from('applied_procedures').insert({
        attendance_id: attendanceId,
        procedure_template_id: proc.procedureTemplateId || null,
        name: proc.name,
        category: proc.category || null,
        price: proc.price,
        cost: proc.cost || 0,
        margin_percent: proc.marginPercent || null,
        consumed_items: proc.consumedItems || [],
        notes: proc.notes || null
      });
    }

    // Schedule return visit if requested
    if (returnVisit) {
      const time = returnVisit.time || '09:00';
      const [h, m] = time.split(':');
      const endHour = String(Number(h) + 1).padStart(2, '0');
      const endTime = `${endHour}:${m}`;

      const apptCreated = await this.createAppointment({
        title: `Retorno: ${patient.name} (${returnVisit.type})`,
        start: new Date(`${returnVisit.date}T${time}:00`).toISOString(),
        end: new Date(`${returnVisit.date}T${endTime}:00`).toISOString(),
        patientId: attendance.patientId,
        doctor: attendance.vetName || 'Veterinário',
        type: 'retorno',
        status: 'scheduled'
      });

      await client.from('return_visits').insert({
        attendance_id: attendanceId,
        appointment_id: apptCreated.id,
        date: returnVisit.date,
        time: returnVisit.time || null,
        type: returnVisit.type,
        reason: returnVisit.reason || null,
        notes: returnVisit.notes || null
      });
    }

    // Create receivable and financial record
    const clinicId = await getCurrentClinicId();
    await client.from('receivables').insert({
      clinic_id: clinicId,
      attendance_id: attendanceId,
      patient_id: attendance.patientId,
      owner_id: patient.ownerId || null,
      patient_name: patient.name,
      owner_name: ownerName,
      amount: totalRevenue,
      total_cost: totalCost,
      gross_profit: grossProfit,
      margin_percent: marginPercent,
      professional_name: attendance.vetName || 'Veterinário',
      due_date: new Date().toISOString().split('T')[0],
      status: 'pending',
      description: `Atendimento - ${patient.name}`
    });

    await client.from('financial_records').insert({
      clinic_id: clinicId,
      attendance_id: attendanceId,
      patient_id: attendance.patientId,
      owner_id: patient.ownerId || null,
      patient_name: patient.name,
      owner_name: ownerName,
      professional_name: attendance.vetName || 'Veterinário',
      date: new Date().toISOString(),
      gross_amount: totalRevenue,
      total_cost: totalCost,
      gross_profit: grossProfit,
      margin_percent: marginPercent,
      payment_status: 'pending',
      procedure_count: procedures.length,
      description: `Atendimento finalizado - ${patient.name}`
    });

    // Update attendance status to finished
    const { data: finishedAttRow, error: finishErr } = await client.from('attendances').update({
      status: 'finished',
      total_cost: totalCost,
      total_service: serviceFee + proceduresPrice,
      total_total: totalRevenue,
      total_products_revenue: materialsPrice + vaccinesPrice,
      total_procedure_cost: proceduresCost,
      total_procedure_revenue: proceduresPrice,
      total_vaccine_cost: vaccinesCost,
      total_vaccine_revenue: vaccinesPrice,
      gross_profit: grossProfit,
      margin_percent: marginPercent,
      finished_at: new Date().toISOString()
    }).eq('id', attendanceId).select('*').single();

    if (finishErr) throw finishErr;
    return mapAttendance(finishedAttRow);
  },

  // --- Receivables ---
  async getReceivables(): Promise<Receivable[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('receivables').select('*').order('due_date', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapReceivable);
  },

  async payReceivable(id: string, details: any): Promise<Receivable> {
    const client = assertClient();
    const paymentDate = new Date().toISOString();
    const businessDate = details.businessDate || new Date().toISOString().split('T')[0];
    
    // Fetch receivable details
    const { data: recRow, error: recError } = await client.from('receivables').select('*').eq('id', id).single();
    if (recError || !recRow) throw new Error('Recebível não encontrado');
    const rec = mapReceivable(recRow);

    const taxAmount = details.taxRate ? rec.amount * (details.taxRate / 100) : 0;
    const netValue = rec.amount - taxAmount;

    // Update receivable status to paid
    const { data: updatedRecRow, error: payError } = await client.from('receivables').update({
      status: 'paid',
      payment_date: paymentDate,
      payment_method: details.method,
      payment_details: {
        method: details.method,
        installments: details.installments || 1,
        taxRate: details.taxRate || 0,
        netValue: netValue
      }
    }).eq('id', id).select('*').single();

    if (payError) throw payError;

    // Update financial record status
    if (rec.attendanceId) {
      await client.from('financial_records').update({
        payment_status: 'paid'
      }).eq('attendance_id', rec.attendanceId);
    }

    // Get active cash session if available
    let sessionId = null;
    const { data: activeSession } = await client.from('cash_sessions').select('id').eq('business_date', businessDate).eq('status', 'open').maybeSingle();
    if (activeSession) {
      sessionId = activeSession.id;
    }

    // Create cash flow entry
    const clinicId = await getCurrentClinicId();
    await client.from('cash_flow_entries').insert({
      clinic_id: clinicId,
      cash_session_id: sessionId,
      attendance_id: rec.attendanceId || null,
      patient_id: rec.patientId || null,
      owner_id: rec.ownerId || null,
      reference_id: rec.id,
      date: paymentDate,
      business_date: businessDate,
      type: 'income',
      category: 'Serviços Veterinários',
      amount: rec.amount,
      gross_amount: rec.amount,
      total_cost: rec.totalCost || 0,
      gross_profit: rec.grossProfit || 0,
      margin_percent: rec.marginPercent || 0,
      payment_status: 'paid',
      payment_method: details.method,
      patient_name: rec.patientName,
      owner_name: rec.ownerName,
      professional_name: rec.professionalName || null,
      description: `Recebimento: ${rec.description || 'Atendimento'} (${details.method})`,
      source_type: 'receivable_payment'
    });

    return mapReceivable(updatedRecRow);
  },

  // --- Cash Sessions & Cash Flow ---
  async getCashSessions(): Promise<CashRegisterSession[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('cash_sessions').select('*').order('business_date', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapCashSession);
  },

  async getCurrentCashSession(): Promise<CashRegisterSession | null> {
    if (!supabase) return null;
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase.from('cash_sessions').select('*').eq('business_date', today).eq('status', 'open').maybeSingle();
    if (error) return null;
    return data ? mapCashSession(data) : null;
  },

  async getCashSessionEntries(sessionId: string): Promise<CashFlowEntry[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('cash_flow_entries').select('*').eq('cash_session_id', sessionId).order('date', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapCashFlowEntry);
  },

  async openCashSession(payload: { openingBalance?: number; businessDate?: string; notes?: string } = {}): Promise<CashRegisterSession> {
    const client = assertClient();
    const clinicId = await getCurrentClinicId();
    const businessDate = payload.businessDate || new Date().toISOString().split('T')[0];

    const { data, error } = await client.from('cash_sessions').insert({
      clinic_id: clinicId,
      business_date: businessDate,
      status: 'open',
      opening_balance: payload.openingBalance || 0,
      notes: payload.notes || '',
      summary: {
        totalIncome: 0,
        totalExpense: 0,
        netAmount: 0,
        receivedCash: 0,
        receivedPix: 0,
        receivedDebit: 0,
        receivedCredit: 0,
        receivedTransfer: 0,
        receivedBankSlip: 0
      }
    }).select('*').single();

    if (error) throw error;
    return mapCashSession(data);
  },

  async closeCashSession(sessionId: string, payload: { closingBalance?: number; notes?: string } = {}): Promise<CashRegisterSession> {
    const client = assertClient();
    
    // Fetch summary
    const { data: entries } = await client.from('cash_flow_entries').select('*').eq('cash_session_id', sessionId);
    const summary = {
      totalIncome: 0,
      totalExpense: 0,
      netAmount: 0,
      receivedCash: 0,
      receivedPix: 0,
      receivedDebit: 0,
      receivedCredit: 0,
      receivedTransfer: 0,
      receivedBankSlip: 0
    };

    (entries || []).forEach((entry: any) => {
      const val = Number(entry.amount || 0);
      if (entry.type === 'income') {
        summary.totalIncome += val;
        if (entry.payment_method === 'cash') summary.receivedCash += val;
        if (entry.payment_method === 'pix') summary.receivedPix += val;
        if (entry.payment_method === 'debit_card') summary.receivedDebit += val;
        if (entry.payment_method === 'credit_card') summary.receivedCredit += val;
        if (entry.payment_method === 'transfer') summary.receivedTransfer += val;
        if (entry.payment_method === 'bank_slip' || entry.payment_method === 'boleto') summary.receivedBankSlip += val;
      } else if (entry.type === 'expense') {
        summary.totalExpense += val;
      }
    });

    summary.netAmount = summary.totalIncome - summary.totalExpense;

    const { data: sessionData } = await client.from('cash_sessions').select('opening_balance').eq('id', sessionId).single();
    const openingBalance = sessionData ? toNumber(sessionData.opening_balance) : 0;
    const expectedClosing = openingBalance + summary.netAmount;

    const { data, error } = await client.from('cash_sessions').update({
      status: 'closed',
      closed_at: new Date().toISOString(),
      closing_balance: payload.closingBalance ?? expectedClosing,
      notes: payload.notes || null,
      summary: summary
    }).eq('id', sessionId).select('*').single();

    if (error) throw error;
    return mapCashSession(data);
  },

  async getCashFlow(): Promise<CashFlowEntry[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('cash_flow_entries').select('*').order('date', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapCashFlowEntry);
  },

  async createCashFlowEntry(entry: Partial<CashFlowEntry>): Promise<CashFlowEntry> {
    const client = assertClient();
    const clinicId = await getCurrentClinicId();
    const businessDate = entry.businessDate || entry.date?.split('T')[0] || new Date().toISOString().split('T')[0];

    // Find active session
    let sessionId = entry.cashSessionId || null;
    if (!sessionId) {
      const { data: activeSession } = await client.from('cash_sessions').select('id').eq('business_date', businessDate).eq('status', 'open').maybeSingle();
      if (activeSession) sessionId = activeSession.id;
    }

    const { data, error } = await client.from('cash_flow_entries').insert({
      ...cashFlowPayload(entry),
      clinic_id: clinicId,
      cash_session_id: sessionId,
      business_date: businessDate
    }).select('*').single();

    if (error) throw error;
    return mapCashFlowEntry(data);
  },

  async deleteCashFlowEntry(id: string): Promise<void> {
    const client = assertClient();
    const { error } = await client.from('cash_flow_entries').delete().eq('id', id);
    if (error) throw error;
  },

  // --- Financial Records ---
  async getFinancialRecords(): Promise<FinancialRecord[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('financial_records').select('*').order('date', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapFinancialRecord);
  },

  async getFinancialRecordsByPatientId(patientId: string): Promise<FinancialRecord[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('financial_records').select('*').eq('patient_id', patientId).order('date', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapFinancialRecord);
  },

  // --- Procedure Templates ---
  async getProcedures(): Promise<ProcedureTemplate[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('procedure_templates').select('*').order('name');
    if (error) throw error;
    const list = (data || []).map(mapProcedureTemplate);
    
    // Fetch template items
    for (const proc of list) {
      const { data: items } = await supabase.from('procedure_template_items').select('*').eq('procedure_template_id', proc.id);
      proc.items = (items || []).map(item => ({
        id: item.id,
        procedureTemplateId: item.procedure_template_id,
        inventoryItemId: item.inventory_item_id || '',
        quantity: toNumber(item.quantity),
        unit: item.unit || '',
        itemName: item.item_name || '',
        costUnit: toNumber(item.cost_unit)
      }));
    }
    return list;
  },

  async createProcedure(proc: Partial<ProcedureTemplate>): Promise<ProcedureTemplate> {
    const client = assertClient();
    const clinicId = await getCurrentClinicId();
    const { data, error } = await client.from('procedure_templates').insert({
      ...procedurePayload(proc),
      clinic_id: clinicId
    }).select('*').single();

    if (error) throw error;
    
    // Save items
    if (proc.items && proc.items.length > 0) {
      for (const item of proc.items) {
        await client.from('procedure_template_items').insert({
          procedure_template_id: data.id,
          inventory_item_id: item.inventoryItemId || null,
          quantity: item.quantity,
          unit: item.unit || null,
          item_name: item.itemName || null,
          cost_unit: item.costUnit || 0
        });
      }
    }

    return { ...mapProcedureTemplate(data), items: proc.items || [] };
  },

  async updateProcedure(id: string, updates: Partial<ProcedureTemplate>): Promise<ProcedureTemplate> {
    const client = assertClient();
    const { data, error } = await client.from('procedure_templates').update(procedurePayload(updates)).eq('id', id).select('*').single();
    if (error) throw error;

    // Delete existing items and overwrite
    if (updates.items !== undefined) {
      await client.from('procedure_template_items').delete().eq('procedure_template_id', id);
      if (updates.items && updates.items.length > 0) {
        for (const item of updates.items) {
          await client.from('procedure_template_items').insert({
            procedure_template_id: id,
            inventory_item_id: item.inventoryItemId || null,
            quantity: item.quantity,
            unit: item.unit || null,
            item_name: item.itemName || null,
            cost_unit: item.costUnit || 0
          });
        }
      }
    }

    return { ...mapProcedureTemplate(data), items: updates.items || [] };
  },

  async deleteProcedure(id: string): Promise<void> {
    const client = assertClient();
    const { error } = await client.from('procedure_templates').delete().eq('id', id);
    if (error) throw error;
  },

  // --- Users & Team Members ---
  async getTeamMembers(): Promise<TeamMember[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('team_members').select('*').order('name');
    if (error) throw error;
    return (data || []).map(mapTeamMember);
  },

  async createTeamMember(member: Partial<TeamMember>): Promise<TeamMember> {
    const client = assertClient();
    const clinicId = await getCurrentClinicId();
    const { data, error } = await client.from('team_members').insert({
      ...teamMemberPayload(member),
      clinic_id: clinicId
    }).select('*').single();

    if (error) throw error;
    return mapTeamMember(data);
  },

  async updateTeamMember(id: string, updates: Partial<TeamMember>): Promise<TeamMember> {
    const client = assertClient();
    const { data, error } = await client.from('team_members').update(teamMemberPayload(updates)).eq('id', id).select('*').single();
    if (error) throw error;
    return mapTeamMember(data);
  },

  async deleteTeamMember(id: string): Promise<void> {
    const client = assertClient();
    const { error } = await client.from('team_members').delete().eq('id', id);
    if (error) throw error;
  },

  async getLinkedTeamMember(user: User | null | undefined): Promise<TeamMember | null> {
    if (!supabase || !user?.teamMemberId) return null;
    const { data, error } = await supabase.from('team_members').select('*').eq('id', user.teamMemberId).maybeSingle();
    if (error || !data) return null;
    return mapTeamMember(data);
  },

  async getProfiles(): Promise<AccessProfile[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('access_profiles').select('*').order('name');
    if (error) throw error;
    return (data || []).map(mapAccessProfile);
  },

  async createProfile(profile: Partial<AccessProfile>): Promise<AccessProfile> {
    const client = assertClient();
    const clinicId = await getCurrentClinicId();
    const { data, error } = await client.from('access_profiles').insert({
      ...accessProfilePayload(profile),
      clinic_id: clinicId
    }).select('*').single();

    if (error) throw error;
    return mapAccessProfile(data);
  },

  async updateProfile(id: string, updates: Partial<AccessProfile>): Promise<AccessProfile> {
    const client = assertClient();
    const { data, error } = await client.from('access_profiles').update(accessProfilePayload(updates)).eq('id', id).select('*').single();
    if (error) throw error;
    return mapAccessProfile(data);
  },

  async deleteProfile(id: string): Promise<void> {
    const client = assertClient();
    const { error } = await client.from('access_profiles').delete().eq('id', id);
    if (error) throw error;
  },

  async getUsers(): Promise<User[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('user_profiles').select('*').order('name');
    if (error) throw error;
    return (data || []).map(mapUser);
  },

  async createUser(usr: Partial<User>): Promise<User> {
    const client = assertClient();
    const clinicId = await getCurrentClinicId();
    const { data, error } = await client.from('user_profiles').insert({
      ...userPayload(usr),
      clinic_id: clinicId
    }).select('*').single();

    if (error) throw error;
    return mapUser(data);
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const client = assertClient();
    const { data, error } = await client.from('user_profiles').update(userPayload(updates)).eq('id', id).select('*').single();
    if (error) throw error;
    return mapUser(data);
  },

  async deleteUser(id: string): Promise<void> {
    const client = assertClient();
    const { error } = await client.from('user_profiles').delete().eq('id', id);
    if (error) throw error;
  },

  // --- Auditing & Backups ---
  async getAuditLogs(): Promise<AuditLogEntry[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapAuditLog);
  },

  async getBackups(): Promise<BackupSnapshot[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('backup_snapshots').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapBackup);
  },

  async createBackup(label = 'Backup manual'): Promise<BackupSnapshot> {
    const client = assertClient();
    const clinicId = await getCurrentClinicId();
    
    // Dump important tables as JSON for mock backup behavior
    const [owners, patients, inventory, settings] = await Promise.all([
      this.getOwners(),
      this.getPatients(),
      this.getInventory(),
      this.getSettings()
    ]);

    const backupData = { owners, patients, inventory, settings };

    const { data, error } = await client.from('backup_snapshots').insert({
      clinic_id: clinicId,
      label: label,
      data: backupData
    }).select('*').single();

    if (error) throw error;
    return mapBackup(data);
  },

  async restoreBackup(backupId: string): Promise<void> {
    const client = assertClient();
    const { data: backup, error } = await client.from('backup_snapshots').select('*').eq('id', backupId).single();
    if (error || !backup) throw new Error('Backup não encontrado');

    const backupData = backup.data;
    if (backupData?.settings) {
      await this.saveSettings(backupData.settings);
    }
  },

  async getDashboardData() {
    if (!supabase) {
      return {
        settings: {} as any,
        appointments: [],
        inventory: [],
        attendances: [],
        financialRecords: [],
        cashFlow: []
      };
    }

    const [settings, appointments, inventory, attendances, financialRecords, cashFlow] = await Promise.all([
      this.getSettings(),
      this.getAppointments(),
      this.getInventory(),
      this.getAttendances(),
      this.getFinancialRecords(),
      this.getCashFlow()
    ]);

    return {
      settings,
      appointments,
      inventory,
      attendances,
      financialRecords,
      cashFlow
    };
  }
};
