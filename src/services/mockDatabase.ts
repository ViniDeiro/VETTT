import { 
  Patient, Owner, Property, InventoryItem, 
  Attendance, Receivable, User, ConsumptionItem,
  ProcedureTemplate, CashFlowEntry, FinancialRecord, VaccineApplication, AppliedProcedure,
  AccessProfile, AppModuleKey, ModulePermission, TeamMember, GeneralSettings, AuditLogEntry, BackupSnapshot
} from '../domain/types';

// Initial Mock Data
const INITIAL_PROCEDURES: ProcedureTemplate[] = [
  { 
    id: '1', 
    name: 'Consulta Simples', 
    category: 'Consulta',
    description: 'Consulta clinica geral',
    baseCost: 150, 
    chargePrice: 150,
    marginPercent: 100,
    duration: '30 min',
    averageTime: '30 min',
    operationalCost: 0,
    items: [] 
  },
  { 
    id: '2', 
    name: 'Aplicação de Medicação', 
    category: 'Procedimento clínico',
    description: 'Aplicacao de medicacao com seringa e medicamento',
    baseCost: 35,
    chargePrice: 35,
    marginPercent: 52.86,
    duration: '20 min',
    averageTime: '20 min',
    operationalCost: 16.5,
    items: [
      { inventoryItemId: '2', quantity: 1, unit: 'un', itemName: 'Seringa 5ml', costUnit: 0.5 },
      { inventoryItemId: '3', quantity: 5, unit: 'ml', itemName: 'Antibiótico X', costUnit: 0.2 }
    ] 
  }
];

const INITIAL_OWNERS: Owner[] = [
  { id: '1', name: 'John Doe', document: '12345678900', phone: '5511999999999', email: 'john@example.com', address: 'Main St, 1' },
];

const INITIAL_PROPERTIES: Property[] = [
  { id: '1', name: 'Haras Pimbury', address: 'Rural Area 1', city: 'Sorocaba', state: 'SP', registrationNumber: 'IE-123' },
];

const INITIAL_PATIENTS: Patient[] = [
  { id: '1', name: 'Thunder', species: 'Equine', breed: 'Arabian', age: 5, ownerId: '1', ownerName: 'John Doe', propertyId: '1', gender: 'M', status: 'Alive' },
];

const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: '1',
    name: 'Dipirona 500mg',
    category: 'Medication',
    quantity: 10,
    unit: 'frasco',
    minStock: 5,
    costPrice: 10,
    unitCost: 10,
    salePrice: 25,
    packageQuantity: 1,
    packageUnit: 'frasco',
    allowsFraction: false
  },
  {
    id: '2',
    name: 'Seringa 5ml',
    category: 'Material',
    quantity: 100,
    unit: 'un',
    minStock: 20,
    costPrice: 0.5,
    unitCost: 0.5,
    salePrice: 2,
    packageQuantity: 1,
    packageUnit: 'un',
    allowsFraction: false
  },
  {
    id: '3',
    name: 'Antibiótico X',
    category: 'Medication',
    quantity: 500,
    unit: 'ml',
    minStock: 100,
    costPrice: 0.2,
    unitCost: 0.2,
    salePrice: 0.8,
    packageQuantity: 500,
    packageUnit: 'ml',
    allowsFraction: true
  },
];

const MODULE_KEYS: AppModuleKey[] = [
  'settings',
  'users',
  'branding',
  'finance',
  'inventory',
  'attendance',
  'medicalRecords',
  'agenda',
  'reports',
  'documents',
  'invoices',
  'whatsapp',
  'audit',
  'patients',
  'team'
];

const createPermissionSet = (
  overrides: Partial<Record<AppModuleKey, Partial<ModulePermission>>> = {}
): Record<AppModuleKey, ModulePermission> => (
  MODULE_KEYS.reduce((acc, moduleKey) => {
    acc[moduleKey] = {
      view: false,
      create: false,
      edit: false,
      delete: false,
      exportPdf: false,
      accessFinancial: false,
      accessStock: false,
      ...(overrides[moduleKey] || {})
    };
    return acc;
  }, {} as Record<AppModuleKey, ModulePermission>)
);

const INITIAL_PROFILES: AccessProfile[] = [
  {
    id: 'profile-admin',
    name: 'Administrador (ADM)',
    description: 'Acesso total ao sistema e configuracoes sensiveis.',
    type: 'standard',
    baseRole: 'admin',
    permissions: createPermissionSet(
      MODULE_KEYS.reduce((acc, key) => {
        acc[key] = {
          view: true,
          create: true,
          edit: true,
          delete: true,
          exportPdf: true,
          accessFinancial: true,
          accessStock: true
        };
        return acc;
      }, {} as Partial<Record<AppModuleKey, Partial<ModulePermission>>>)
    ),
    restrictions: {
      editAgenda: true,
      cancelAttendance: true,
      viewValues: true,
      sensitiveSettings: true
    }
  },
  {
    id: 'profile-vet',
    name: 'Medico Veterinario',
    description: 'Permissoes clinicas com acesso operacional.',
    type: 'standard',
    baseRole: 'vet',
    permissions: createPermissionSet({
      attendance: { view: true, create: true, edit: true, exportPdf: true },
      medicalRecords: { view: true, create: true, edit: true, exportPdf: true },
      agenda: { view: true, create: true, edit: true },
      patients: { view: true, create: true, edit: true },
      documents: { view: true, create: true, edit: true, exportPdf: true },
      inventory: { view: true, accessStock: true },
      finance: { view: true, accessFinancial: true }
    }),
    restrictions: {
      editAgenda: true,
      cancelAttendance: false,
      viewValues: true,
      sensitiveSettings: false
    }
  },
  {
    id: 'profile-secretary',
    name: 'Secretaria / Recepcao',
    description: 'Permissoes administrativas restritas.',
    type: 'standard',
    baseRole: 'secretary',
    permissions: createPermissionSet({
      agenda: { view: true, create: true, edit: true },
      patients: { view: true, create: true, edit: true },
      attendance: { view: true },
      inventory: { view: true, create: true, edit: true, accessStock: true },
      finance: { view: true, create: true, accessFinancial: true },
      documents: { view: true, exportPdf: true }
    }),
    restrictions: {
      editAgenda: true,
      cancelAttendance: false,
      viewValues: true,
      sensitiveSettings: false
    }
  },
  {
    id: 'profile-anesthetist',
    name: 'Anestesista',
    description: 'Perfil personalizado para apoio clinico.',
    type: 'custom',
    baseRole: 'vet',
    permissions: createPermissionSet({
      attendance: { view: true, create: true, edit: true },
      medicalRecords: { view: true, edit: true },
      agenda: { view: true },
      patients: { view: true },
      documents: { view: true, exportPdf: true }
    }),
    restrictions: {
      editAgenda: false,
      cancelAttendance: false,
      viewValues: false,
      sensitiveSettings: false
    }
  }
];

const INITIAL_TEAM: TeamMember[] = [
  {
    id: 'team-admin',
    name: 'Mariana Costa',
    functionTitle: 'Administradora',
    specialty: 'Gestao',
    cpf: '111.222.333-44',
    phone: '(11) 98888-0001',
    email: 'admin@vettooth.com.br',
    status: 'active',
    createdAt: '2026-01-03T09:00:00.000Z'
  },
  {
    id: 'team-vet',
    name: 'Dr. Lucas Ferreira',
    functionTitle: 'Medico Veterinario',
    specialty: 'Odontologia Veterinaria',
    crmv: 'CRMV-SP 12345',
    cpf: '222.333.444-55',
    phone: '(11) 98888-0002',
    email: 'vet@vettooth.com.br',
    signature: 'Assinado digitalmente por Dr. Lucas Ferreira',
    status: 'active',
    createdAt: '2026-01-04T10:00:00.000Z'
  },
  {
    id: 'team-secretary',
    name: 'Paula Mendes',
    functionTitle: 'Secretaria / Recepcao',
    specialty: 'Atendimento e Agenda',
    cpf: '333.444.555-66',
    phone: '(11) 98888-0003',
    email: 'secretary@vettooth.com.br',
    status: 'active',
    createdAt: '2026-01-05T11:00:00.000Z'
  }
];

const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Mariana Costa',
    fullName: 'Mariana Costa',
    role: 'admin',
    email: 'admin@vettooth.com.br',
    phone: '(11) 98888-0001',
    functionTitle: 'Administradora',
    accessProfileId: 'profile-admin',
    status: 'active',
    createdAt: '2026-01-03T09:00:00.000Z',
    lastAccessAt: '2026-04-16T08:30:00.000Z',
    teamMemberId: 'team-admin'
  },
  {
    id: 'user-vet',
    name: 'Dr. Lucas Ferreira',
    fullName: 'Dr. Lucas Ferreira',
    role: 'vet',
    email: 'vet@vettooth.com.br',
    phone: '(11) 98888-0002',
    functionTitle: 'Medico Veterinario',
    accessProfileId: 'profile-vet',
    status: 'active',
    createdAt: '2026-01-04T10:00:00.000Z',
    lastAccessAt: '2026-04-16T09:00:00.000Z',
    teamMemberId: 'team-vet'
  },
  {
    id: 'user-secretary',
    name: 'Paula Mendes',
    fullName: 'Paula Mendes',
    role: 'secretary',
    email: 'secretary@vettooth.com.br',
    phone: '(11) 98888-0003',
    functionTitle: 'Secretaria / Recepcao',
    accessProfileId: 'profile-secretary',
    status: 'active',
    createdAt: '2026-01-05T11:00:00.000Z',
    lastAccessAt: '2026-04-16T09:15:00.000Z',
    teamMemberId: 'team-secretary'
  }
];

const INITIAL_GENERAL_SETTINGS: GeneralSettings = {
  clinic: {
    fantasyName: 'Clinica Veterinaria VetTooth',
    legalName: 'VetTooth Servicos Veterinarios LTDA',
    cnpj: '12.345.678/0001-99',
    address: 'Rua das Flores, 123',
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
  consultationTemplates: [
    {
      id: 'consult-1',
      name: 'Consulta clinica',
      speciesFocus: 'Caes',
      defaultValue: 180,
      duration: '30 min',
      anamnesisText: 'Queixa principal, alimentacao, uso de medicamentos e historico recente.',
      checklist: ['Peso', 'Temperatura', 'Avaliacao oral'],
      requiredFields: ['Queixa principal', 'Diagnostico']
    },
    {
      id: 'consult-2',
      name: 'Odontologia veterinaria',
      speciesFocus: 'Felinos',
      defaultValue: 260,
      duration: '50 min',
      anamnesisText: 'Odor oral, sangramento gengival, dor, alimentacao e higiene oral.',
      checklist: ['Odontograma', 'Anestesia', 'Termo assinado'],
      requiredFields: ['Odontograma', 'Plano terapeutico']
    },
    {
      id: 'consult-3',
      name: 'Cirurgia',
      speciesFocus: 'Equinos',
      defaultValue: 500,
      duration: '90 min',
      anamnesisText: 'Jejum, risco anestesico, hemograma e autorizacoes.',
      checklist: ['Hemograma', 'Assinatura', 'Checklist pre-operatorio'],
      requiredFields: ['Consentimento', 'Plano anestesico']
    }
  ],
  documentTemplates: [
    {
      id: 'doc-1',
      type: 'receita',
      title: 'Receita padrao',
      content: 'Paciente: {nome_paciente}\nTutor: {nome_tutor}\nPrescricao: {conteudo}'
    },
    {
      id: 'doc-2',
      type: 'atestado',
      title: 'Atestado clinico',
      content: 'Atesto para os devidos fins que {nome_paciente} foi atendido em {data}.'
    },
    {
      id: 'doc-3',
      type: 'alta medica',
      title: 'Alta padrao',
      content: 'Paciente liberado com orientacoes de retorno e observacao domiciliar.'
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
      city: 'Sao Paulo',
      state: 'SP',
      address: 'Rua das Flores, 123',
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

class MockDatabaseService {
  private owners: Owner[] = [];
  private properties: Property[] = [];
  private patients: Patient[] = [];
  private inventory: InventoryItem[] = [];
  private attendances: Attendance[] = [];
  private receivables: Receivable[] = [];
  private appointments: any[] = [];
  private procedures: ProcedureTemplate[] = [];
  private financialRecords: FinancialRecord[] = [];
  private profiles: AccessProfile[] = [];
  private users: User[] = [];
  private teamMembers: TeamMember[] = [];
  private settings: GeneralSettings = INITIAL_GENERAL_SETTINGS;
  private auditLogs: AuditLogEntry[] = [];
  private backups: BackupSnapshot[] = [];
  private currentUserId: string | null = null;

  constructor() {
    this.load();
    this.ensureMockAppointments();
    this.ensureMockProcedures();
    this.ensureRBACSeed();
    this.ensureSettingsSeed();
    this.applyAppearanceSettings();
  }

  private load() {
    try {
      const loadedOwners = localStorage.getItem('vet_owners');
      this.owners = loadedOwners ? JSON.parse(loadedOwners) : INITIAL_OWNERS;
    } catch (e) {
      console.error('Error loading owners', e);
      this.owners = INITIAL_OWNERS;
    }

    try {
      const loadedProperties = localStorage.getItem('vet_properties');
      this.properties = loadedProperties ? JSON.parse(loadedProperties) : INITIAL_PROPERTIES;
    } catch (e) {
      console.error('Error loading properties', e);
      this.properties = INITIAL_PROPERTIES;
    }

    try {
      const loadedPatients = localStorage.getItem('vet_patients');
      this.patients = loadedPatients ? JSON.parse(loadedPatients) : INITIAL_PATIENTS;
    } catch (e) {
      console.error('Error loading patients', e);
      this.patients = INITIAL_PATIENTS;
    }

    try {
      const loadedInventory = localStorage.getItem('vet_inventory');
      const parsedInventory = loadedInventory ? JSON.parse(loadedInventory) : INITIAL_INVENTORY;
      this.inventory = parsedInventory.map((item: InventoryItem) => this.normalizeInventoryItem(item));
    } catch (e) {
      console.error('Error loading inventory', e);
      this.inventory = INITIAL_INVENTORY.map(item => this.normalizeInventoryItem(item));
    }

    try {
      const loadedAttendances = localStorage.getItem('vet_attendances');
      this.attendances = loadedAttendances ? JSON.parse(loadedAttendances) : [];
    } catch (e) {
      console.error('Error loading attendances', e);
      this.attendances = [];
    }

    try {
      const loadedReceivables = localStorage.getItem('vet_receivables');
      this.receivables = loadedReceivables ? JSON.parse(loadedReceivables) : [];
    } catch (e) {
      console.error('Error loading receivables', e);
      this.receivables = [];
    }

    try {
      const loadedAppointments = localStorage.getItem('vet_appointments');
      this.appointments = loadedAppointments ? JSON.parse(loadedAppointments) : [];
    } catch (e) {
      console.error('Error loading appointments', e);
      this.appointments = [];
    }

    try {
      const loadedProcedures = localStorage.getItem('vet_procedures');
      const parsedProcedures = loadedProcedures ? JSON.parse(loadedProcedures) : [];
      this.procedures = parsedProcedures.map((proc: ProcedureTemplate) => this.enrichProcedure(proc));
    } catch (e) {
      console.error('Error loading procedures', e);
      this.procedures = [];
    }

    try {
      const loadedCashFlow = localStorage.getItem('vet_cashflow');
      this.cashFlow = loadedCashFlow ? JSON.parse(loadedCashFlow) : [];
    } catch (e) {
      console.error('Error loading cashflow', e);
      this.cashFlow = [];
    }

    try {
      const loadedFinancialRecords = localStorage.getItem('vet_financial_records');
      this.financialRecords = loadedFinancialRecords ? JSON.parse(loadedFinancialRecords) : [];
    } catch (e) {
      console.error('Error loading financial records', e);
      this.financialRecords = [];
    }

    try {
      const loadedProfiles = localStorage.getItem('vet_profiles');
      this.profiles = loadedProfiles ? JSON.parse(loadedProfiles) : INITIAL_PROFILES;
    } catch (e) {
      console.error('Error loading profiles', e);
      this.profiles = INITIAL_PROFILES;
    }

    try {
      const loadedUsers = localStorage.getItem('vet_users');
      this.users = loadedUsers ? JSON.parse(loadedUsers) : INITIAL_USERS;
    } catch (e) {
      console.error('Error loading users', e);
      this.users = INITIAL_USERS;
    }

    try {
      const loadedTeamMembers = localStorage.getItem('vet_team_members');
      this.teamMembers = loadedTeamMembers ? JSON.parse(loadedTeamMembers) : INITIAL_TEAM;
    } catch (e) {
      console.error('Error loading team members', e);
      this.teamMembers = INITIAL_TEAM;
    }

    try {
      const loadedSettings = localStorage.getItem('vet_general_settings');
      this.settings = loadedSettings ? this.normalizeSettings(JSON.parse(loadedSettings)) : INITIAL_GENERAL_SETTINGS;
    } catch (e) {
      console.error('Error loading general settings', e);
      this.settings = INITIAL_GENERAL_SETTINGS;
    }

    try {
      const loadedAuditLogs = localStorage.getItem('vet_audit_logs');
      this.auditLogs = loadedAuditLogs ? JSON.parse(loadedAuditLogs) : [];
    } catch (e) {
      console.error('Error loading audit logs', e);
      this.auditLogs = [];
    }

    try {
      const loadedBackups = localStorage.getItem('vet_backup_versions');
      this.backups = loadedBackups ? JSON.parse(loadedBackups) : [];
    } catch (e) {
      console.error('Error loading backups', e);
      this.backups = [];
    }

    try {
      this.currentUserId = localStorage.getItem('vet_current_user_id');
    } catch (e) {
      console.error('Error loading current user', e);
      this.currentUserId = null;
    }
  }

  public save(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  private createId() {
    return Math.random().toString(36).substr(2, 9);
  }

  private normalizeSettings(settings?: Partial<GeneralSettings> | null): GeneralSettings {
    return {
      ...INITIAL_GENERAL_SETTINGS,
      ...settings,
      clinic: { ...INITIAL_GENERAL_SETTINGS.clinic, ...(settings?.clinic || {}) },
      appearance: { ...INITIAL_GENERAL_SETTINGS.appearance, ...(settings?.appearance || {}) },
      documents: { ...INITIAL_GENERAL_SETTINGS.documents, ...(settings?.documents || {}) },
      regional: { ...INITIAL_GENERAL_SETTINGS.regional, ...(settings?.regional || {}) },
      whatsapp: { ...INITIAL_GENERAL_SETTINGS.whatsapp, ...(settings?.whatsapp || {}) },
      fiscal: { ...INITIAL_GENERAL_SETTINGS.fiscal, ...(settings?.fiscal || {}) },
      audit: { ...INITIAL_GENERAL_SETTINGS.audit, ...(settings?.audit || {}) },
      security: { ...INITIAL_GENERAL_SETTINGS.security, ...(settings?.security || {}) },
      dashboard: { ...INITIAL_GENERAL_SETTINGS.dashboard, ...(settings?.dashboard || {}) },
      consultationTemplates: settings?.consultationTemplates || INITIAL_GENERAL_SETTINGS.consultationTemplates,
      documentTemplates: settings?.documentTemplates || INITIAL_GENERAL_SETTINGS.documentTemplates,
      automatedMessages: settings?.automatedMessages || INITIAL_GENERAL_SETTINGS.automatedMessages,
      units: settings?.units || INITIAL_GENERAL_SETTINGS.units,
      clinicalReminders: settings?.clinicalReminders || INITIAL_GENERAL_SETTINGS.clinicalReminders
    };
  }

  private getCurrentActorName() {
    const currentUser = this.getCurrentUser();
    return currentUser?.fullName || currentUser?.name || 'Sistema';
  }

  private logAudit(
    action: AuditLogEntry['action'],
    entity: string,
    changedField?: string,
    previousValue?: unknown,
    newValue?: unknown
  ) {
    if (!this.settings?.audit?.enabled) return;

    const currentUser = this.getCurrentUser();
    const entry: AuditLogEntry = {
      id: this.createId(),
      actorUserId: currentUser?.id || null,
      actorName: currentUser?.fullName || currentUser?.name || 'Sistema',
      entity,
      action,
      changedField,
      previousValue,
      newValue,
      createdAt: new Date().toISOString()
    };

    const retentionStart = new Date();
    retentionStart.setDate(retentionStart.getDate() - (this.settings.audit.retainDays || 180));

    this.auditLogs = [entry, ...this.auditLogs].filter(log => new Date(log.createdAt) >= retentionStart);
    this.save('vet_audit_logs', this.auditLogs);
  }

  private ensureRBACSeed() {
    if (this.profiles.length === 0) {
      this.profiles = INITIAL_PROFILES;
      this.save('vet_profiles', this.profiles);
    }

    if (this.teamMembers.length === 0) {
      this.teamMembers = INITIAL_TEAM;
      this.save('vet_team_members', this.teamMembers);
    }

    if (this.users.length === 0) {
      this.users = INITIAL_USERS;
      this.save('vet_users', this.users);
    }
  }

  private ensureSettingsSeed() {
    this.settings = this.normalizeSettings(this.settings);
    this.save('vet_general_settings', this.settings);
  }

  public applyAppearanceSettings() {
    if (typeof document === 'undefined') return;

    const appearance = this.settings?.appearance || INITIAL_GENERAL_SETTINGS.appearance;
    document.documentElement.style.setProperty('--vet-primary-color', appearance.primaryColor);
    document.documentElement.style.setProperty('--vet-button-color', appearance.buttonColor);
    document.documentElement.style.setProperty('--vet-sidebar-color', appearance.sidebarColor);

    if (appearance.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  private normalizeInventoryItem(item: InventoryItem): InventoryItem {
    const packageQuantity = item.packageQuantity && item.packageQuantity > 0 ? item.packageQuantity : item.quantity || 1;
    const unitCost = typeof item.unitCost === 'number'
      ? item.unitCost
      : item.packageQuantity && item.packageQuantity > 0
        ? item.costPrice / item.packageQuantity
        : item.costPrice;
    const hasExpiry = Boolean(item.expiryDate || item.validity);
    const expiryValue = item.expiryDate || item.validity;
    const isExpired = hasExpiry && expiryValue
      ? new Date(expiryValue).getTime() < new Date(new Date().toDateString()).getTime()
      : false;
    const status = isExpired
      ? 'expired'
      : item.quantity <= item.minStock
        ? 'low'
        : 'ok';

    return {
      ...item,
      packageQuantity,
      packageUnit: item.packageUnit || item.unit,
      unitCost,
      status,
      allowsFraction: typeof item.allowsFraction === 'boolean'
        ? item.allowsFraction
        : ['ml', 'mg', 'g', 'kg', 'pacote_fracionavel'].includes(item.unit)
    };
  }

  private getInventoryItem(itemId: string) {
    return this.inventory.find(item => item.id === itemId);
  }

  private enrichProcedure(proc: ProcedureTemplate): ProcedureTemplate {
    const items = (proc.items || []).map(item => {
      const inventoryItem = this.getInventoryItem(item.inventoryItemId);
      return {
        ...item,
        unit: item.unit || inventoryItem?.unit,
        itemName: item.itemName || inventoryItem?.name,
        costUnit: typeof item.costUnit === 'number' ? item.costUnit : inventoryItem?.unitCost ?? inventoryItem?.costPrice ?? 0
      };
    });

    const operationalCost = items.reduce((total, item) => total + ((item.costUnit || 0) * item.quantity), 0);
    const chargePrice = typeof proc.chargePrice === 'number'
      ? proc.chargePrice
      : typeof proc.baseCost === 'number'
        ? proc.baseCost
        : operationalCost;

    const derivedChargePrice = chargePrice > 0
      ? chargePrice
      : typeof proc.marginPercent === 'number' && proc.marginPercent < 100
        ? operationalCost / (1 - (proc.marginPercent / 100))
        : operationalCost;

    const marginPercent = derivedChargePrice > 0
      ? Number((((derivedChargePrice - operationalCost) / derivedChargePrice) * 100).toFixed(2))
      : 0;

    return {
      ...proc,
      items,
      chargePrice: Number(derivedChargePrice.toFixed(2)),
      baseCost: Number(derivedChargePrice.toFixed(2)),
      marginPercent,
      operationalCost: Number(operationalCost.toFixed(2)),
      averageTime: proc.averageTime || proc.duration
    };
  }

  private getPatientById(patientId: string) {
    return this.patients.find(patient => patient.id === patientId);
  }

  private getOwnerByPatient(patientId: string) {
    const patient = this.getPatientById(patientId);
    if (!patient) return null;
    return this.owners.find(owner => owner.id === patient.ownerId) || null;
  }

  getSettings() {
    return this.settings;
  }

  saveSettings(settings: GeneralSettings) {
    const previousSettings = this.settings;
    this.settings = this.normalizeSettings(settings);
    this.save('vet_general_settings', this.settings);
    this.applyAppearanceSettings();
    this.logAudit('update', 'settings', 'general_settings', previousSettings, this.settings);

    if (this.settings.security.dailyAutoBackup) {
      this.createBackup('Backup automatico diario');
    }

    return this.settings;
  }

  getAuditLogs() {
    return this.auditLogs;
  }

  getBackups() {
    return this.backups;
  }

  createBackup(label = 'Backup manual') {
    const snapshot: BackupSnapshot = {
      id: this.createId(),
      label,
      createdAt: new Date().toISOString(),
      createdBy: this.getCurrentActorName(),
      data: {
        owners: this.owners,
        properties: this.properties,
        patients: this.patients,
        inventory: this.inventory,
        attendances: this.attendances,
        receivables: this.receivables,
        appointments: this.appointments,
        procedures: this.procedures,
        financialRecords: this.financialRecords,
        profiles: this.profiles,
        users: this.users,
        teamMembers: this.teamMembers,
        settings: this.settings
      }
    };

    this.backups = [snapshot, ...this.backups].slice(0, Math.max(this.settings.security.backupRetentionDays, 1));
    this.settings = {
      ...this.settings,
      security: {
        ...this.settings.security,
        lastBackupAt: snapshot.createdAt
      }
    };
    this.save('vet_general_settings', this.settings);
    this.save('vet_backup_versions', this.backups);
    this.logAudit('backup', 'backup', label, null, { id: snapshot.id, createdAt: snapshot.createdAt });
    return snapshot;
  }

  restoreBackup(backupId: string) {
    const snapshot = this.backups.find(item => item.id === backupId);
    if (!snapshot || !this.settings.security.restoreEnabled) return false;

    const data = snapshot.data || {};
    this.owners = Array.isArray(data.owners) ? (data.owners as Owner[]) : this.owners;
    this.properties = Array.isArray(data.properties) ? (data.properties as Property[]) : this.properties;
    this.patients = Array.isArray(data.patients) ? (data.patients as Patient[]) : this.patients;
    this.inventory = Array.isArray(data.inventory)
      ? (data.inventory as InventoryItem[]).map(item => this.normalizeInventoryItem(item))
      : this.inventory;
    this.attendances = Array.isArray(data.attendances) ? (data.attendances as Attendance[]) : this.attendances;
    this.receivables = Array.isArray(data.receivables) ? (data.receivables as Receivable[]) : this.receivables;
    this.appointments = Array.isArray(data.appointments) ? data.appointments : this.appointments;
    this.procedures = Array.isArray(data.procedures)
      ? (data.procedures as ProcedureTemplate[]).map(item => this.enrichProcedure(item))
      : this.procedures;
    this.financialRecords = Array.isArray(data.financialRecords) ? (data.financialRecords as FinancialRecord[]) : this.financialRecords;
    this.profiles = Array.isArray(data.profiles) ? (data.profiles as AccessProfile[]) : this.profiles;
    this.users = Array.isArray(data.users) ? (data.users as User[]) : this.users;
    this.teamMembers = Array.isArray(data.teamMembers) ? (data.teamMembers as TeamMember[]) : this.teamMembers;
    this.settings = this.normalizeSettings((data.settings as GeneralSettings) || this.settings);

    this.save('vet_owners', this.owners);
    this.save('vet_properties', this.properties);
    this.save('vet_patients', this.patients);
    this.save('vet_inventory', this.inventory);
    this.save('vet_attendances', this.attendances);
    this.save('vet_receivables', this.receivables);
    this.save('vet_appointments', this.appointments);
    this.save('vet_procedures', this.procedures);
    this.save('vet_financial_records', this.financialRecords);
    this.save('vet_profiles', this.profiles);
    this.save('vet_users', this.users);
    this.save('vet_team_members', this.teamMembers);
    this.save('vet_general_settings', this.settings);
    this.applyAppearanceSettings();
    this.logAudit('restore', 'backup', snapshot.label, null, { id: snapshot.id, createdAt: snapshot.createdAt });
    return true;
  }

  getProfiles() {
    return this.profiles;
  }

  createProfile(profile: Omit<AccessProfile, 'id'>) {
    const newProfile = { ...profile, id: this.createId() };
    this.profiles.push(newProfile);
    this.save('vet_profiles', this.profiles);
    this.logAudit('create', 'profile', newProfile.name, null, newProfile);
    return newProfile;
  }

  updateProfile(id: string, updates: Partial<AccessProfile>) {
    const index = this.profiles.findIndex(profile => profile.id === id);
    if (index === -1) return null;
    const previousProfile = this.profiles[index];
    this.profiles[index] = { ...this.profiles[index], ...updates };
    this.save('vet_profiles', this.profiles);
    this.logAudit('update', 'profile', this.profiles[index].name, previousProfile, this.profiles[index]);
    return this.profiles[index];
  }

  deleteProfile(id: string) {
    const isStandard = INITIAL_PROFILES.some(profile => profile.id === id);
    const hasLinkedUsers = this.users.some(user => user.accessProfileId === id);
    if (isStandard || hasLinkedUsers) return false;

    const deletedProfile = this.profiles.find(profile => profile.id === id);
    this.profiles = this.profiles.filter(profile => profile.id !== id);
    this.save('vet_profiles', this.profiles);
    this.logAudit('delete', 'profile', deletedProfile?.name, deletedProfile, null);
    return true;
  }

  getUsers() {
    return this.users;
  }

  createUser(user: Omit<User, 'id' | 'createdAt' | 'lastAccessAt'>) {
    const timestamp = new Date().toISOString();
    const newUser: User = {
      ...user,
      id: this.createId(),
      createdAt: timestamp,
      lastAccessAt: timestamp
    };
    this.users.push(newUser);
    this.save('vet_users', this.users);
    this.logAudit('create', 'user', newUser.email, null, newUser);
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>) {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return null;
    const previousUser = this.users[index];
    this.users[index] = { ...this.users[index], ...updates };
    this.save('vet_users', this.users);
    this.logAudit('update', 'user', this.users[index].email, previousUser, this.users[index]);
    return this.users[index];
  }

  deleteUser(id: string) {
    const deletedUser = this.users.find(user => user.id === id);
    this.users = this.users.filter(user => user.id !== id);
    this.save('vet_users', this.users);
    this.logAudit('delete', 'user', deletedUser?.email, deletedUser, null);
    return true;
  }

  getTeamMembers() {
    return this.teamMembers;
  }

  createTeamMember(member: Omit<TeamMember, 'id' | 'createdAt'>) {
    const newMember: TeamMember = {
      ...member,
      id: this.createId(),
      createdAt: new Date().toISOString()
    };
    this.teamMembers.push(newMember);
    this.save('vet_team_members', this.teamMembers);
    this.logAudit('create', 'team_member', newMember.name, null, newMember);
    return newMember;
  }

  updateTeamMember(id: string, updates: Partial<TeamMember>) {
    const index = this.teamMembers.findIndex(member => member.id === id);
    if (index === -1) return null;
    const previousMember = this.teamMembers[index];
    this.teamMembers[index] = { ...this.teamMembers[index], ...updates };
    this.save('vet_team_members', this.teamMembers);
    this.logAudit('update', 'team_member', this.teamMembers[index].name, previousMember, this.teamMembers[index]);
    return this.teamMembers[index];
  }

  deleteTeamMember(id: string) {
    const linkedUser = this.users.some(user => user.teamMemberId === id);
    if (linkedUser) return false;

    const deletedMember = this.teamMembers.find(member => member.id === id);
    this.teamMembers = this.teamMembers.filter(member => member.id !== id);
    this.save('vet_team_members', this.teamMembers);
    this.logAudit('delete', 'team_member', deletedMember?.name, deletedMember, null);
    return true;
  }

  getCurrentUser() {
    if (!this.currentUserId) return null;
    return this.users.find(user => user.id === this.currentUserId) || null;
  }

  setCurrentUser(userId: string | null) {
    this.currentUserId = userId;
    if (userId) {
      localStorage.setItem('vet_current_user_id', userId);
    } else {
      localStorage.removeItem('vet_current_user_id');
    }
  }

  loginByRole(role: User['role']) {
    const matchedUser = this.users.find(user => user.role === role && user.status !== 'inactive');
    if (!matchedUser) return null;

    const updatedUser = {
      ...matchedUser,
      lastAccessAt: new Date().toISOString()
    };
    this.users = this.users.map(user => user.id === matchedUser.id ? updatedUser : user);
    this.save('vet_users', this.users);
    this.setCurrentUser(updatedUser.id);
    return updatedUser;
  }

  logout() {
    this.setCurrentUser(null);
  }

  getProfileById(profileId?: string) {
    return this.profiles.find(profile => profile.id === profileId) || null;
  }

  getPermission(userOrProfile: User | string | null | undefined, moduleKey: AppModuleKey) {
    const profile = typeof userOrProfile === 'string'
      ? this.getProfileById(userOrProfile)
      : this.getProfileById(userOrProfile?.accessProfileId);
    return profile?.permissions?.[moduleKey] || null;
  }

  canUserAccess(user: User | null | undefined, moduleKey: AppModuleKey, action: keyof ModulePermission = 'view') {
    if (!user) return false;
    if (user.role === 'admin') return true;
    const permission = this.getPermission(user, moduleKey);
    return Boolean(permission?.[action]);
  }

  getLinkedTeamMember(user: User | null | undefined) {
    if (!user?.teamMemberId) return null;
    return this.teamMembers.find(member => member.id === user.teamMemberId) || null;
  }

  // --- Owners ---
  getOwners() { return this.owners; }
  createOwner(owner: Omit<Owner, 'id'>) {
    const newOwner = { ...owner, id: this.createId() };
    this.owners.push(newOwner);
    this.save('vet_owners', this.owners);
    return newOwner;
  }

  // --- Properties ---
  getAllProperties() {
    return this.properties;
  }
  
  createProperty(property: Omit<Property, 'id'>) {
    const newProperty = { ...property, id: this.createId() };
    this.properties.push(newProperty);
    this.save('vet_properties', this.properties);
    return newProperty;
  }

  // --- Patients ---
  getPatients() { return this.patients; }
  createPatient(patient: Omit<Patient, 'id'>) {
    const owner = this.owners.find(item => item.id === patient.ownerId);
    const newPatient = { ...patient, id: this.createId(), ownerName: patient.ownerName || owner?.name };
    this.patients.push(newPatient);
    this.save('vet_patients', this.patients);
    return newPatient;
  }

  updatePatient(id: string, updates: Partial<Patient>) {
      const index = this.patients.findIndex(p => p.id === id);
      if (index !== -1) {
          this.patients[index] = { ...this.patients[index], ...updates };
          this.save('vet_patients', this.patients);
          return this.patients[index];
      }
      return null;
  }

  deletePatient(id: string) {
    // 1. Delete attendances linked to this patient
    this.attendances = this.attendances.filter(a => a.patientId !== id);
    this.save('vet_attendances', this.attendances);

    // 2. Delete patient
    this.patients = this.patients.filter(p => p.id !== id);
    this.save('vet_patients', this.patients);
  }

  updateOwner(id: string, updates: Partial<Owner>) {
      const index = this.owners.findIndex(o => o.id === id);
      if (index !== -1) {
          this.owners[index] = { ...this.owners[index], ...updates };
          this.save('vet_owners', this.owners);
          return this.owners[index];
      }
      return null;
  }

  deleteOwner(id: string) {
    // Cascade delete
    // 1. Get all patients of this owner
    const ownerPatients = this.patients.filter(p => p.ownerId === id);
    
    // 2. For each patient, delete attendances and the patient itself
    ownerPatients.forEach(patient => {
        this.deletePatient(patient.id);
    });

    // 3. Delete the owner
    this.owners = this.owners.filter(o => o.id !== id);
    this.save('vet_owners', this.owners);
  }
  
  updateProperty(id: string, updates: Partial<Property>) {
      const index = this.properties.findIndex(p => p.id === id);
      if (index !== -1) {
          this.properties[index] = { ...this.properties[index], ...updates };
          this.save('vet_properties', this.properties);
          return this.properties[index];
      }
      return null;
  }

  deleteProperty(id: string) {
    const hasLinkedPatients = this.patients.some(patient => patient.propertyId === id);
    if (hasLinkedPatients) {
      return false;
    }

    this.properties = this.properties.filter(p => p.id !== id);
    this.save('vet_properties', this.properties);
    return true;
  }

  // --- Appointments ---
  getAppointments() {
    return this.appointments;
  }
  
  // Mock appointments if empty for demo
  ensureMockAppointments() {
      if (this.appointments.length === 0) {
          const today = new Date();
          today.setHours(9, 0, 0, 0);
          
          const appt1 = {
              id: 'apt1',
              title: 'Consulta Thor',
              start: today.toISOString(),
              end: new Date(today.getTime() + 60*60*1000).toISOString(),
              patientId: '1',
              doctor: 'Dr. Silva',
              type: 'canino',
              status: 'confirmed'
          };
          this.appointments.push(appt1);
          this.save('vet_appointments', this.appointments);
      }
  }

  createAppointment(appt: any) {
    const newAppt = { ...appt, id: this.createId() };
    this.appointments.push(newAppt);
    this.save('vet_appointments', this.appointments);
    return newAppt;
  }

  updateAppointment(id: string, updates: any) {
    const index = this.appointments.findIndex(a => a.id === id);
    if (index !== -1) {
      this.appointments[index] = { ...this.appointments[index], ...updates };
      this.save('vet_appointments', this.appointments);
      return this.appointments[index];
    }
    return null;
  }

  deleteAppointment(id: string) {
    const index = this.appointments.findIndex(a => a.id === id);
    if (index === -1) return false;

    this.appointments.splice(index, 1);
    this.save('vet_appointments', this.appointments);
    return true;
  }
  // --- Procedures ---
  getProcedures() { return this.procedures; }
  
  ensureMockProcedures() {
      if (this.procedures.length === 0) {
          this.procedures = INITIAL_PROCEDURES.map(proc => this.enrichProcedure(proc));
          this.save('vet_procedures', this.procedures);
      }
  }

  createProcedure(proc: ProcedureTemplate) {
      const enriched = this.enrichProcedure({ ...proc, id: proc.id || this.createId() });
      this.procedures.push(enriched);
      this.save('vet_procedures', this.procedures);
      return enriched;
  }

  updateProcedure(id: string, updates: Partial<ProcedureTemplate>) {
      const index = this.procedures.findIndex(p => p.id === id);
      if (index !== -1) {
          this.procedures[index] = this.enrichProcedure({ ...this.procedures[index], ...updates });
          this.save('vet_procedures', this.procedures);
          return this.procedures[index];
      }
      return null;
  }

  deleteProcedure(id: string) {
      const index = this.procedures.findIndex(proc => proc.id === id);
      if (index === -1) return false;

      this.procedures.splice(index, 1);
      this.save('vet_procedures', this.procedures);
      return true;
  }

  // --- Inventory ---
  getInventory() { return this.inventory; }

  createInventoryItem(item: Omit<InventoryItem, 'id'>) {
    const normalized = this.normalizeInventoryItem({ ...item, id: this.createId() });
    this.inventory.push(normalized);
    this.save('vet_inventory', this.inventory);
    return normalized;
  }

  updateInventoryItem(id: string, updates: Partial<InventoryItem>) {
    const index = this.inventory.findIndex(item => item.id === id);
    if (index === -1) return null;

    this.inventory[index] = this.normalizeInventoryItem({ ...this.inventory[index], ...updates });
    this.save('vet_inventory', this.inventory);
    return this.inventory[index];
  }

  deleteInventoryItem(id: string) {
    const index = this.inventory.findIndex(item => item.id === id);
    if (index === -1) return false;

    this.inventory.splice(index, 1);
    this.save('vet_inventory', this.inventory);
    return true;
  }
  
  updateStock(itemId: string, quantityChange: number) {
    const item = this.inventory.find(i => i.id === itemId);
    if (item) {
      const nextQuantity = Number((item.quantity + quantityChange).toFixed(3));
      if (nextQuantity < 0) {
        throw new Error(`Estoque insuficiente para ${item.name}. Disponivel: ${item.quantity} ${item.unit}.`);
      }

      item.quantity = nextQuantity;
      item.status = item.quantity <= 0
        ? 'expired'
        : item.quantity <= item.minStock
          ? 'low'
          : 'ok';
      this.save('vet_inventory', this.inventory);
    }
  }

  // --- Attendance & Finance Core Logic ---
  createAttendance(attendance: Omit<Attendance, 'id' | 'status' | 'totalCost' | 'totalService' | 'totalTotal'>) {
    const owner = this.getOwnerByPatient(attendance.patientId);
    const newAttendance: Attendance = {
      ...attendance,
      id: this.createId(),
      status: 'in_progress',
      ownerId: owner?.id,
      ownerName: attendance.ownerName || owner?.name,
      totalCost: 0,
      totalService: 0,
      totalTotal: 0,
      totalProductsRevenue: 0,
      totalProcedureCost: 0,
      totalProcedureRevenue: 0,
      totalVaccineCost: 0,
      totalVaccineRevenue: 0,
      grossProfit: 0,
      marginPercent: 0,
      vitals: attendance.vitals || {},
      prescriptions: [],
      examRequests: [],
      vaccines: [],
      procedures: []
    };
    this.attendances.push(newAttendance);
    this.save('vet_attendances', this.attendances);
    return newAttendance;
  }

  getAttendances() {
    return this.attendances;
  }

  getAttendancesByPatientId(patientId: string) {
    return this.attendances.filter(a => a.patientId === patientId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  updateAttendance(id: string, updates: Partial<Attendance>) {
    const index = this.attendances.findIndex(a => a.id === id);
    if (index !== -1) {
      const owner = updates.patientId ? this.getOwnerByPatient(updates.patientId) : null;
      this.attendances[index] = { 
        ...this.attendances[index], 
        ...updates,
        ownerId: updates.ownerId || this.attendances[index].ownerId || owner?.id,
        ownerName: updates.ownerName || this.attendances[index].ownerName || owner?.name,
        updatedAt: new Date().toISOString()
      };
      this.save('vet_attendances', this.attendances);
      return this.attendances[index];
    }
    return null;
  }

  finishAttendance(
    attendanceId: string,
    serviceFee: number,
    items: ConsumptionItem[],
    vaccines: VaccineApplication[] = [],
    procedures: AppliedProcedure[] = [],
    returnVisit?: any
  ) {
    const attendanceIndex = this.attendances.findIndex(a => a.id === attendanceId);
    if (attendanceIndex === -1) throw new Error('Attendance not found');

    const attendance = this.attendances[attendanceIndex];
    const patient = this.getPatientById(attendance.patientId);
    const owner = this.getOwnerByPatient(attendance.patientId);
    
    items.forEach(item => {
      const inventoryItem = this.getInventoryItem(item.inventoryItemId);
      if (!inventoryItem) {
        throw new Error(`Item de estoque nao encontrado: ${item.itemName}`);
      }
      if (inventoryItem.quantity < item.quantityUsed) {
        throw new Error(`Estoque insuficiente para ${inventoryItem.name}. Disponivel: ${inventoryItem.quantity} ${inventoryItem.unit}.`);
      }
    });

    vaccines.forEach(vaccine => {
      const inventoryItem = this.getInventoryItem(vaccine.inventoryItemId);
      if (!inventoryItem) {
        throw new Error(`Vacina nao encontrada no estoque: ${vaccine.name}`);
      }
      if (inventoryItem.quantity < 1) {
        throw new Error(`Estoque insuficiente para ${inventoryItem.name}.`);
      }
    });

    const materialsCost = Number(items.reduce((acc, item) => acc + (item.costAtMoment * item.quantityUsed), 0).toFixed(2));
    const materialsPrice = Number(items.reduce((acc, item) => acc + (item.priceAtMoment * item.quantityUsed), 0).toFixed(2));
    const vaccineSummaries = vaccines.map(vaccine => {
      const inventoryItem = this.getInventoryItem(vaccine.inventoryItemId);
      const unitCost = inventoryItem?.unitCost ?? inventoryItem?.costPrice ?? 0;
      return {
        price: vaccine.price,
        cost: unitCost
      };
    });
    const vaccinesCost = Number(vaccineSummaries.reduce((acc, vaccine) => acc + vaccine.cost, 0).toFixed(2));
    const vaccinesPrice = Number(vaccineSummaries.reduce((acc, vaccine) => acc + vaccine.price, 0).toFixed(2));
    const proceduresCost = Number(procedures.reduce((acc, procedure) => acc + (procedure.cost || 0), 0).toFixed(2));
    const proceduresPrice = Number(procedures.reduce((acc, procedure) => acc + procedure.price, 0).toFixed(2));

    const totalRevenue = Number((serviceFee + materialsPrice + vaccinesPrice + proceduresPrice).toFixed(2));
    const totalCost = Number((materialsCost + vaccinesCost + proceduresCost).toFixed(2));
    const grossProfit = Number((totalRevenue - totalCost).toFixed(2));
    const marginPercent = totalRevenue > 0 ? Number(((grossProfit / totalRevenue) * 100).toFixed(2)) : 0;

    // 2. Update Attendance
    attendance.status = 'finished';
    attendance.ownerId = owner?.id || attendance.ownerId;
    attendance.ownerName = owner?.name || attendance.ownerName;
    attendance.consumedItems = items;
    attendance.vaccines = vaccines;
    attendance.procedures = procedures;
    attendance.returnVisit = returnVisit;
    attendance.totalCost = totalCost;
    attendance.totalService = Number((serviceFee + proceduresPrice).toFixed(2));
    attendance.totalTotal = totalRevenue;
    attendance.totalProductsRevenue = Number((materialsPrice + vaccinesPrice).toFixed(2));
    attendance.totalProcedureCost = proceduresCost;
    attendance.totalProcedureRevenue = proceduresPrice;
    attendance.totalVaccineCost = vaccinesCost;
    attendance.totalVaccineRevenue = vaccinesPrice;
    attendance.grossProfit = grossProfit;
    attendance.marginPercent = marginPercent;
    attendance.updatedAt = new Date().toISOString();
    attendance.finishedAt = new Date().toISOString();
    this.attendances[attendanceIndex] = attendance;
    this.save('vet_attendances', this.attendances);

    // 3. Deduct Stock
    items.forEach(item => {
      this.updateStock(item.inventoryItemId, -item.quantityUsed);
    });
    // Deduct Vaccines Stock
    vaccines.forEach(vac => {
        this.updateStock(vac.inventoryItemId, -1);
    });

    // 4. Create Receivable
    const receivable: Receivable = {
      id: this.createId(),
      attendanceId: attendance.id,
      patientId: attendance.patientId,
      ownerId: owner?.id,
      patientName: attendance.patientName,
      ownerName: owner?.name || this.getOwnerNameByPatient(attendance.patientId),
      amount: totalRevenue,
      totalCost,
      grossProfit,
      marginPercent,
      professionalName: attendance.vetId,
      dueDate: new Date().toISOString().split('T')[0], // Due today
      status: 'pending',
      description: `Atendimento ${attendance.date} - ${attendance.patientName}`
    };
    this.receivables.push(receivable);
    this.save('vet_receivables', this.receivables);

    const financialRecord: FinancialRecord = {
      id: this.createId(),
      attendanceId: attendance.id,
      patientId: attendance.patientId,
      patientName: attendance.patientName,
      ownerId: owner?.id,
      ownerName: owner?.name || this.getOwnerNameByPatient(attendance.patientId),
      professionalName: attendance.vetId,
      date: attendance.finishedAt || new Date().toISOString(),
      grossAmount: totalRevenue,
      totalCost,
      grossProfit,
      marginPercent,
      paymentStatus: 'pending',
      procedureCount: procedures.length,
      description: `Atendimento finalizado - ${attendance.patientName}`
    };
    this.financialRecords.push(financialRecord);
    this.save('vet_financial_records', this.financialRecords);

    attendance.financialRecordId = financialRecord.id;
    this.attendances[attendanceIndex] = attendance;
    this.save('vet_attendances', this.attendances);

    // 5. Schedule Return (Create Appointment)
    if (returnVisit) {
        const time = returnVisit.time || '09:00';
        // end time: start + 1 hour
        const [h, m] = time.split(':');
        const endHour = String(Number(h) + 1).padStart(2, '0');
        const endTime = `${endHour}:${m}`;

        const returnAppt = {
            id: this.createId(),
            title: `Retorno: ${attendance.patientName} (${returnVisit.type})`,
            start: new Date(`${returnVisit.date}T${time}:00`).toISOString(),
            end: new Date(`${returnVisit.date}T${endTime}:00`).toISOString(),
            patientId: attendance.patientId,
            doctor: attendance.vetId || 'Dr. Vet',
            type: attendance.consultationType || 'retorno',
            status: 'confirmed'
        };
        this.appointments.push(returnAppt);
        this.save('vet_appointments', this.appointments);
    }

    return attendance;
  }

  private getOwnerNameByPatient(patientId: string): string {
    const patient = this.patients.find(p => p.id === patientId);
    if (!patient) return 'Unknown';
    const owner = this.owners.find(o => o.id === patient.ownerId);
    return owner ? owner.name : 'Unknown';
  }

  getReceivables() { return this.receivables; }
  
  payReceivable(id: string, details: { method: any, installments?: number, taxRate?: number }) {
    const recIndex = this.receivables.findIndex(r => r.id === id);
    if (recIndex !== -1) {
      const rec = this.receivables[recIndex];
      rec.status = 'paid';
      // paymentDate must be ISO string or formatted date string? 
      // Receivables uses ISO usually but for UI display we often use locale.
      rec.paymentDate = new Date().toISOString();
      rec.paymentMethod = details.method;
      
      const taxAmount = details.taxRate ? rec.amount * (details.taxRate / 100) : 0;
      const netValue = rec.amount - taxAmount;
      
      rec.paymentDetails = {
          method: details.method,
          installments: details.installments || 1,
          taxRate: details.taxRate || 0,
          netValue: netValue
      };

      this.receivables[recIndex] = rec;
      this.save('vet_receivables', this.receivables);

      const linkedFinancialRecord = this.financialRecords.find(record => record.attendanceId === rec.attendanceId);
      if (linkedFinancialRecord) {
        linkedFinancialRecord.paymentStatus = 'paid';
        this.save('vet_financial_records', this.financialRecords);
      }

      // Create CashFlow Entry (Income)
      const entry: CashFlowEntry = {
          id: this.createId(),
          date: new Date().toLocaleDateString('pt-BR'), 
          type: 'income',
          category: 'Serviços Veterinários',
          amount: rec.amount,
          grossAmount: rec.amount,
          totalCost: rec.totalCost,
          grossProfit: rec.grossProfit,
          marginPercent: rec.marginPercent,
          paymentStatus: rec.status,
          attendanceId: rec.attendanceId,
          patientId: rec.patientId,
          patientName: rec.patientName,
          ownerId: rec.ownerId,
          ownerName: rec.ownerName,
          professionalName: rec.professionalName,
          description: `Recebimento: ${rec.description} (${details.method})`,
          referenceId: rec.id
      };
      this.cashFlow.push(entry);

      // If there is tax/fee, create Expense entry? 
      // For now, let's keep it simple: Just register the Income.
      // Or maybe register the net value if it's "Cash Flow".
      // Let's stick to Gross Amount for Revenue report and Net for Cash Flow if we were sophisticated.
      // But `FinanceRevenue` displays `value`. 

      this.save('vet_cashflow', this.cashFlow);
      return rec;
    }
    return null;
  }

  // --- Cash Flow ---
  private cashFlow: CashFlowEntry[] = [];
  
  getCashFlow() {
      return this.cashFlow;
  }

  createCashFlowEntry(entry: Omit<CashFlowEntry, 'id'>) {
      const newEntry: CashFlowEntry = {
          ...entry,
          id: this.createId(),
          amount: Number(entry.amount.toFixed(2)),
          grossAmount: typeof entry.grossAmount === 'number' ? Number(entry.grossAmount.toFixed(2)) : undefined,
          totalCost: typeof entry.totalCost === 'number' ? Number(entry.totalCost.toFixed(2)) : undefined,
          grossProfit: typeof entry.grossProfit === 'number' ? Number(entry.grossProfit.toFixed(2)) : undefined,
          marginPercent: typeof entry.marginPercent === 'number' ? Number(entry.marginPercent.toFixed(2)) : undefined
      };

      this.cashFlow.push(newEntry);
      this.save('vet_cashflow', this.cashFlow);
      return newEntry;
  }

  getFinancialRecords() {
      return this.financialRecords;
  }

  getFinancialRecordsByPatientId(patientId: string) {
      return this.financialRecords.filter(record => record.patientId === patientId);
  }
}

export const mockDB = new MockDatabaseService();
