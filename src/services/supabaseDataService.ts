import { supabase } from '../lib/supabase';
import {
  GeneralSettings,
  InventoryItem,
  Owner,
  Patient,
  Property
} from '../domain/types';
import { mockDB } from './mockDatabase';

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

export const supabaseDataService = {
  async getSettings(): Promise<GeneralSettings> {
    if (!supabase) return mockDB.getSettings();

    const { data, error } = await supabase
      .from('general_settings')
      .select('settings')
      .maybeSingle();

    if (error || !data?.settings || Object.keys(data.settings).length === 0) {
      return mockDB.getSettings();
    }

    return {
      ...mockDB.getSettings(),
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
      ...mockDB.getSettings(),
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
    const { data, error } = await client
      .from('inventory_items')
      .insert(inventoryPayload(item))
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
    const { data, error } = await client.from('owners').insert(ownerPayload(owner)).select('*').single();
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
    const { data, error } = await client.from('properties').insert(propertyPayload(property)).select('*').single();
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
    const { data, error } = await client.from('patients').insert(patientPayload(patient)).select('*').single();
    if (error) throw error;
    return mapPatient(data);
  },

  async getAppointments(): Promise<any[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('start_at', { ascending: true });

    if (error) throw error;
    return (data || []).map(row => ({
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
    }));
  },

  async getDashboardData() {
    if (!supabase) {
      return {
        settings: mockDB.getSettings(),
        appointments: [],
        inventory: [],
        attendances: [],
        financialRecords: [],
        cashFlow: []
      };
    }

    const [settings, appointments, inventory, attendancesResult, financialResult, cashFlowResult] = await Promise.all([
      this.getSettings(),
      this.getAppointments(),
      this.getInventory(),
      supabase.from('attendances').select('*'),
      supabase.from('financial_records').select('*'),
      supabase.from('cash_flow_entries').select('*')
    ]);

    if (attendancesResult.error) throw attendancesResult.error;
    if (financialResult.error) throw financialResult.error;
    if (cashFlowResult.error) throw cashFlowResult.error;

    return {
      settings,
      appointments,
      inventory,
      attendances: attendancesResult.data || [],
      financialRecords: financialResult.data || [],
      cashFlow: cashFlowResult.data || []
    };
  }
};
