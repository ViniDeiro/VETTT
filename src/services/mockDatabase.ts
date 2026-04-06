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
      this.inventory = loadedInventory ? JSON.parse(loadedInventory) : INITIAL_INVENTORY;
    } catch (e) {
      console.error('Error loading inventory', e);
      this.inventory = INITIAL_INVENTORY;
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
      this.procedures = loadedProcedures ? JSON.parse(loadedProcedures) : [];
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
    this.properties = this.properties.filter(p => p.id !== id);
    this.save('vet_properties', this.properties);

    this.patients = this.patients.map(patient =>
      patient.propertyId === id ? { ...patient, propertyId: undefined } : patient
    );
    this.save('vet_patients', this.patients);
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

  getAttendancesByPatientId(patientId: string) {
    return this.attendances.filter(a => a.patientId === patientId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  updateAttendance(id: string, updates: Partial<Attendance>) {
    const index = this.attendances.findIndex(a => a.id === id);
    if (index !== -1) {
      this.attendances[index] = { 
        ...this.attendances[index], 
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.save('vet_attendances', this.attendances);
      return this.attendances[index];
    }
    return null;
  }

  finishAttendance(attendanceId: string, serviceFee: number, items: ConsumptionItem[], vaccines: any[] = [], procedures: any[] = [], returnVisit?: any) {
    const attendanceIndex = this.attendances.findIndex(a => a.id === attendanceId);
    if (attendanceIndex === -1) throw new Error('Attendance not found');

    const attendance = this.attendances[attendanceIndex];
    
    // 1. Calculate Costs
    const materialsCost = items.reduce((acc, item) => acc + (item.costAtMoment * item.quantityUsed), 0);
    const materialsPrice = items.reduce((acc, item) => acc + (item.priceAtMoment * item.quantityUsed), 0);
    const vaccinesPrice = vaccines.reduce((acc, vac) => acc + vac.price, 0);
    const proceduresPrice = procedures.reduce((acc, proc) => acc + proc.price, 0);

    const total = serviceFee + materialsPrice + vaccinesPrice + proceduresPrice;

    // 2. Update Attendance
    attendance.status = 'finished';
    attendance.consumedItems = items;
    attendance.vaccines = vaccines;
    attendance.procedures = procedures;
    attendance.returnVisit = returnVisit;
    attendance.totalCost = materialsCost; // Note: Vaccine/Procedure cost not tracked separately here yet
    attendance.totalService = serviceFee + proceduresPrice; // Add procedure price to service? Or keep separate?
    attendance.totalTotal = total;
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

    // 5. Schedule Return (Create Appointment)
    if (returnVisit) {
        const time = returnVisit.time || '09:00';
        // end time: start + 1 hour
        const [h, m] = time.split(':');
        const endHour = String(Number(h) + 1).padStart(2, '0');
        const endTime = `${endHour}:${m}`;

        const returnAppt = {
            id: Math.random().toString(36).substr(2, 9),
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

      // Create CashFlow Entry (Income)
      const entry: CashFlowEntry = {
          id: Math.random().toString(36).substr(2, 9),
          date: new Date().toLocaleDateString('pt-BR'), 
          type: 'income',
          category: 'Serviços Veterinários',
          amount: rec.amount, // Gross Income
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
}

export const mockDB = new MockDatabaseService();
