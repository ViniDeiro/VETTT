import { 
  Patient, Owner, Property, InventoryItem, 
  Attendance, Receivable, User, ConsumptionItem,
  ProcedureTemplate, CashFlowEntry
} from '../domain/types';

// Initial Mock Data
const INITIAL_PROCEDURES: ProcedureTemplate[] = [
  { 
    id: '1', 
    name: 'Consulta Simples', 
    baseCost: 150, 
    items: [] 
  },
  { 
    id: '2', 
    name: 'Vacinação V10', 
    baseCost: 80, 
    items: [
      { inventoryItemId: '2', quantity: 1 } // Seringa
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
  { id: '1', name: 'Thunder', species: 'Equine', breed: 'Arabian', age: 5, ownerId: '1', propertyId: '1', gender: 'M' },
];

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: '1', name: 'Dipirona 500mg', category: 'Medication', quantity: 10, unit: 'frasco', minStock: 5, costPrice: 10, salePrice: 25 },
  { id: '2', name: 'Seringa 5ml', category: 'Material', quantity: 100, unit: 'un', minStock: 20, costPrice: 0.5, salePrice: 2 },
  { id: '3', name: 'Antibiótico X', category: 'Medication', quantity: 500, unit: 'ml', minStock: 100, costPrice: 0.2, salePrice: 0.8 }, // Price per ml
];

class MockDatabaseService {
  private owners: Owner[] = [];
  private properties: Property[] = [];
  private patients: Patient[] = [];
  private inventory: InventoryItem[] = [];
  private attendances: Attendance[] = [];
  private receivables: Receivable[] = [];
  private appointments: any[] = [];
  private procedures: ProcedureTemplate[] = [];

  constructor() {
    this.load();
    this.ensureMockAppointments();
    this.ensureMockProcedures();
  }

  private load() {
    const loadedOwners = localStorage.getItem('vet_owners');
    this.owners = loadedOwners ? JSON.parse(loadedOwners) : INITIAL_OWNERS;

    const loadedProperties = localStorage.getItem('vet_properties');
    this.properties = loadedProperties ? JSON.parse(loadedProperties) : INITIAL_PROPERTIES;

    const loadedPatients = localStorage.getItem('vet_patients');
    this.patients = loadedPatients ? JSON.parse(loadedPatients) : INITIAL_PATIENTS;

    const loadedInventory = localStorage.getItem('vet_inventory');
    this.inventory = loadedInventory ? JSON.parse(loadedInventory) : INITIAL_INVENTORY;

    const loadedAttendances = localStorage.getItem('vet_attendances');
    this.attendances = loadedAttendances ? JSON.parse(loadedAttendances) : [];

    const loadedReceivables = localStorage.getItem('vet_receivables');
    this.receivables = loadedReceivables ? JSON.parse(loadedReceivables) : [];

    const loadedAppointments = localStorage.getItem('vet_appointments');
    this.appointments = loadedAppointments ? JSON.parse(loadedAppointments) : [];

    const loadedProcedures = localStorage.getItem('vet_procedures');
    this.procedures = loadedProcedures ? JSON.parse(loadedProcedures) : [];

    const loadedCashFlow = localStorage.getItem('vet_cashflow');
    this.cashFlow = loadedCashFlow ? JSON.parse(loadedCashFlow) : [];
  }

  private save(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // --- Owners ---
  getOwners() { return this.owners; }
  createOwner(owner: Omit<Owner, 'id'>) {
    const newOwner = { ...owner, id: Math.random().toString(36).substr(2, 9) };
    this.owners.push(newOwner);
    this.save('vet_owners', this.owners);
    return newOwner;
  }

  // --- Properties ---
  getAllProperties() {
    return this.properties;
  }
  
  createProperty(property: Omit<Property, 'id'>) {
    const newProperty = { ...property, id: Math.random().toString(36).substr(2, 9) };
    this.properties.push(newProperty);
    this.save('vet_properties', this.properties);
    return newProperty;
  }

  // --- Patients ---
  getPatients() { return this.patients; }
  createPatient(patient: Omit<Patient, 'id'>) {
    const newPatient = { ...patient, id: Math.random().toString(36).substr(2, 9) };
    this.patients.push(newPatient);
    this.save('vet_patients', this.patients);
    return newPatient;
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
    const newAppt = { ...appt, id: Math.random().toString(36).substr(2, 9) };
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
  // --- Procedures ---
  getProcedures() { return this.procedures; }
  
  ensureMockProcedures() {
      if (this.procedures.length === 0) {
          this.procedures = INITIAL_PROCEDURES;
          this.save('vet_procedures', this.procedures);
      }
  }

  createProcedure(proc: ProcedureTemplate) {
      this.procedures.push(proc);
      this.save('vet_procedures', this.procedures);
      return proc;
  }

  updateProcedure(id: string, updates: Partial<ProcedureTemplate>) {
      const index = this.procedures.findIndex(p => p.id === id);
      if (index !== -1) {
          this.procedures[index] = { ...this.procedures[index], ...updates };
          this.save('vet_procedures', this.procedures);
          return this.procedures[index];
      }
      return null;
  }

  // --- Inventory ---
  getInventory() { return this.inventory; }
  
  updateStock(itemId: string, quantityChange: number) {
    const item = this.inventory.find(i => i.id === itemId);
    if (item) {
      item.quantity += quantityChange;
      this.save('vet_inventory', this.inventory);
    }
  }

  // --- Attendance & Finance Core Logic ---
  createAttendance(attendance: Omit<Attendance, 'id' | 'status' | 'totalCost' | 'totalService' | 'totalTotal'>) {
    const newAttendance: Attendance = {
      ...attendance,
      id: Math.random().toString(36).substr(2, 9),
      status: 'in_progress',
      totalCost: 0,
      totalService: 0,
      totalTotal: 0,
      vitals: attendance.vitals || {}
    };
    this.attendances.push(newAttendance);
    this.save('vet_attendances', this.attendances);
    return newAttendance;
  }

  finishAttendance(attendanceId: string, serviceFee: number, items: ConsumptionItem[]) {
    const attendanceIndex = this.attendances.findIndex(a => a.id === attendanceId);
    if (attendanceIndex === -1) throw new Error('Attendance not found');

    const attendance = this.attendances[attendanceIndex];
    
    // 1. Calculate Costs
    const materialsCost = items.reduce((acc, item) => acc + (item.costAtMoment * item.quantityUsed), 0);
    const materialsPrice = items.reduce((acc, item) => acc + (item.priceAtMoment * item.quantityUsed), 0);
    const total = serviceFee + materialsPrice;

    // 2. Update Attendance
    attendance.status = 'finished';
    attendance.consumedItems = items;
    attendance.totalCost = materialsCost;
    attendance.totalService = serviceFee;
    attendance.totalTotal = total;
    this.attendances[attendanceIndex] = attendance;
    this.save('vet_attendances', this.attendances);

    // 3. Deduct Stock
    items.forEach(item => {
      this.updateStock(item.inventoryItemId, -item.quantityUsed);
    });

    // 4. Create Receivable
    const receivable: Receivable = {
      id: Math.random().toString(36).substr(2, 9),
      attendanceId: attendance.id,
      patientName: attendance.patientName,
      ownerName: this.getOwnerNameByPatient(attendance.patientId),
      amount: total,
      dueDate: new Date().toISOString().split('T')[0], // Due today
      status: 'pending',
      description: `Atendimento ${attendance.date} - ${attendance.patientName}`
    };
    this.receivables.push(receivable);
    this.save('vet_receivables', this.receivables);

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
    const rec = this.receivables.find(r => r.id === id);
    if (rec) {
      rec.status = 'paid';
      rec.paymentDate = new Date().toISOString();
      rec.paymentMethod = details.method;
      
      const netValue = details.taxRate ? rec.amount * (1 - (details.taxRate / 100)) : rec.amount;
      
      rec.paymentDetails = {
          method: details.method,
          installments: details.installments || 1,
          taxRate: details.taxRate || 0,
          netValue: netValue
      };

      // Create CashFlow Entry
      const entry: CashFlowEntry = {
          id: Math.random().toString(36).substr(2, 9),
          date: new Date().toLocaleDateString('pt-BR'), // Should match system format
          type: 'income',
          category: 'Serviços Veterinários',
          amount: netValue, // Use net value for cash flow? Or Gross? Usually Gross for revenue, Expense for fees. 
                            // Let's use Net for simple cash flow or Gross + Expense entry.
                            // For simplicity: Gross Income.
          description: `Recebimento: ${rec.description} (${details.method})`,
          referenceId: rec.id
      };
      
      // We don't have a direct cashFlow array in this mockDB, but we have `revenueHistory` in FinanceRevenue page.
      // Ideally we should centralize. I'll push to a new `cashFlow` array if I had one, 
      // but the requirement says "aparece automaticamente em Receitas". 
      // The `FinanceRevenue` page uses `revenueHistory` from a local mock or mockDB?
      // Let's check `FinanceRevenue.jsx`. It seems to have local state `revenueHistory`.
      // I should add a `getCashFlow()` method here and update `FinanceRevenue` to use it.
      
      this.cashFlow.push(entry);
      this.save('vet_cashflow', this.cashFlow);
      this.save('vet_receivables', this.receivables);
    }
  }

  // --- Cash Flow ---
  private cashFlow: CashFlowEntry[] = [];
  
  getCashFlow() {
      return this.cashFlow;
  }
}

export const mockDB = new MockDatabaseService();
