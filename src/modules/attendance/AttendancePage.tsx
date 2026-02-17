import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Autocomplete } from '../../shared/Autocomplete';
import { mockDB } from '../../services/mockDatabase';
import { Patient, Attendance, InventoryItem, ConsumptionItem, Vitals, ProcedureTemplate } from '../../domain/types';
import { 
  Calendar, 
  Activity, 
  Stethoscope, 
  AlertCircle, 
  FileText, 
  Mail, 
  Plus, 
  Clock,
  Thermometer,
  Heart,
  Wind,
  Search,
  ArrowLeft,
  Package,
  Weight,
  Syringe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { pdfService } from '../../services/pdfService';
import { useLocation } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Select } from '../../components/ui/Select';
import PatientDetailsModal from '../../components/PatientDetailsModal';

export const AttendancePage: React.FC = () => {
  const location = useLocation();
  const initialPatient = location.state?.patient as Patient | null;

  const handlePrintRecord = () => {
    if (currentAttendance && selectedPatient) {
      pdfService.generateMedicalRecord(selectedPatient, currentAttendance, 'Tutor (Demo)'); // Ideally get real owner name
    } else {
      alert('Nenhum atendimento ativo para imprimir.');
    }
  };

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [procedures, setProcedures] = useState<ProcedureTemplate[]>([]);
  
  // State
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(initialPatient);
  const [activeTab, setActiveTab] = useState('overview');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // Attendance Form State
  const [currentAttendance, setCurrentAttendance] = useState<Attendance | null>(null);
  const [anamnesis, setAnamnesis] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [serviceFee, setServiceFee] = useState(150);
  const [consumedItems, setConsumedItems] = useState<ConsumptionItem[]>([]);
  const [selectedItemToAdd, setSelectedItemToAdd] = useState<InventoryItem | null>(null);
  const [qtyToAdd, setQtyToAdd] = useState(0);

  // Vaccines State
  const [vaccines, setVaccines] = useState<any[]>([]);
  const [selectedVaccineToAdd, setSelectedVaccineToAdd] = useState<InventoryItem | null>(null);
  const [vaccineBatch, setVaccineBatch] = useState('');
  const [vaccineExpiry, setVaccineExpiry] = useState('');
  const [vaccineNotes, setVaccineNotes] = useState('');
  const [isVaccineOpen, setIsVaccineOpen] = useState(false); // Collapsible state

  // Vitals State
  const [vitals, setVitals] = useState<Vitals>({});

  useEffect(() => {
    setPatients(mockDB.getPatients());
    setInventory(mockDB.getInventory());
    setProcedures(mockDB.getProcedures());
    if (initialPatient) {
        setSelectedPatient(initialPatient);
    }
  }, [initialPatient]);

  const handleStartAttendance = () => {
    if (selectedPatient) {
      const newAttendance = mockDB.createAttendance({
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        vetId: 'current-vet-id',
        date: new Date().toLocaleDateString('pt-BR'),
        reason: 'Consulta',
        consumedItems: [],
        vitals: {} // Initialize
      });
      setCurrentAttendance(newAttendance);
      setActiveTab('attendance_active');
    }
  };

  const handleSelectProcedure = (procId: string) => {
      const proc = procedures.find(p => p.id === procId);
      if (proc) {
          // Set Fee
          setServiceFee(proc.baseCost);
          
          // Add Items
          const newItems: ConsumptionItem[] = [];
          proc.items.forEach(pItem => {
              const invItem = inventory.find(i => i.id === pItem.inventoryItemId);
              if (invItem) {
                  newItems.push({
                      inventoryItemId: invItem.id,
                      itemName: invItem.name,
                      quantityUsed: pItem.quantity,
                      unit: invItem.unit,
                      costAtMoment: invItem.costPrice,
                      priceAtMoment: invItem.salePrice
                  });
              }
          });
          
          // Merge or Replace? Let's append but check for duplicates? 
          // For simplicity, we'll append.
          setConsumedItems(prev => [...prev, ...newItems]);
          alert(`Procedimento "${proc.name}" aplicado! Honorários e materiais atualizados.`);
      }
  };


  const handleAddItem = () => {
    if (selectedItemToAdd && qtyToAdd > 0) {
      if (qtyToAdd > selectedItemToAdd.quantity) {
        alert(`Estoque insuficiente! Disponível: ${selectedItemToAdd.quantity} ${selectedItemToAdd.unit}`);
        return;
      }

      const newItem: ConsumptionItem = {
        inventoryItemId: selectedItemToAdd.id,
        itemName: selectedItemToAdd.name,
        quantityUsed: qtyToAdd,
        unit: selectedItemToAdd.unit,
        costAtMoment: selectedItemToAdd.costPrice,
        priceAtMoment: selectedItemToAdd.salePrice
      };

      setConsumedItems([...consumedItems, newItem]);
      setSelectedItemToAdd(null);
      setQtyToAdd(0);
    }
  };

  const handleAddVaccine = () => {
      if (selectedVaccineToAdd && vaccineBatch && vaccineExpiry) {
          const newVaccine = {
              inventoryItemId: selectedVaccineToAdd.id,
              name: selectedVaccineToAdd.name,
              batch: vaccineBatch,
              manufacturer: selectedVaccineToAdd.supplier || 'Unknown',
              expiryDate: vaccineExpiry,
              applicationDate: new Date().toLocaleDateString('pt-BR'),
              price: selectedVaccineToAdd.salePrice, // Auto price
              notes: vaccineNotes
          };
          
          setVaccines([...vaccines, newVaccine]);
          
          // Reset
          setSelectedVaccineToAdd(null);
          setVaccineBatch('');
          setVaccineExpiry('');
          setVaccineNotes('');
          
          alert(`Vacina ${newVaccine.name} adicionada! Valor R$ ${newVaccine.price.toFixed(2)} incluído.`);
      } else {
          alert('Preencha a vacina, lote e validade.');
      }
  };

  const handleFinish = () => {
    if (currentAttendance) {
      try {
        currentAttendance.vitals = vitals; // Attach vitals before finishing
        mockDB.finishAttendance(currentAttendance.id, serviceFee, consumedItems, vaccines);
        alert('Atendimento finalizado com sucesso!');
        setCurrentAttendance(null);
        setConsumedItems([]);
        setVaccines([]);
        setVitals({});
        setActiveTab('overview');
      } catch (e) {
        alert('Erro ao finalizar atendimento.');
      }
    }
  };

  // --- VIEW: SELECT PATIENT ---
  if (!selectedPatient) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] bg-gray-50">
          <Card className="w-full max-w-md border-none shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Iniciar Atendimento</h2>
              <p className="text-gray-500 mb-8">Busque um paciente para acessar o prontuário e iniciar o procedimento.</p>
              
              <div className="text-left">
                <Autocomplete 
                  options={patients.map(p => ({ id: p.id, label: `${p.name} (${p.species})` }))}
                  onSelect={(opt) => {
                    const p = patients.find(pat => pat.id === opt.id);
                    if (p) setSelectedPatient(p);
                  }}
                  placeholder="Digite o nome do paciente..."
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // --- VIEW: PATIENT PROFILE (THOR STYLE) ---
  return (
    <Layout>
      <div className="space-y-6">
        {/* Top Navigation / Back */}
        <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" onClick={() => setSelectedPatient(null)} className="text-gray-500">
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
            </Button>
            <div className="h-6 w-px bg-gray-300"></div>
            <span className="font-semibold text-gray-700">Prontuário Eletrônico</span>
        </div>

        {/* Patient Header Card */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden border-4 border-white shadow-sm">
                <img 
                  src={selectedPatient.photoUrl || "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80"} 
                  alt={selectedPatient.name} 
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <h1 className="text-3xl font-bold text-gray-900">{selectedPatient.name}</h1>
                  <div className="flex items-center gap-2 text-gray-500 text-sm bg-gray-50 px-3 py-1 rounded-full">
                    <Calendar className="h-4 w-4" />
                    <span>Idade: {selectedPatient.age} anos</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="font-medium">{selectedPatient.species}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span>Raça: {selectedPatient.breed}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span>Sexo: {selectedPatient.gender}</span>
                </div>

                <div className="flex gap-2 pt-1">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                    Peso: {selectedPatient.weight || '--'} kg
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inner Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-2 md:pb-0">
          {[
            { id: 'overview', label: 'Visão Geral' },
            { id: 'attendance_active', label: 'Em Atendimento', disabled: !currentAttendance },
            { id: 'history', label: 'Histórico' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              disabled={tab.disabled}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                activeTab === tab.id 
                  ? "bg-[#0B2C4D] text-white shadow-md" 
                  : tab.disabled ? "bg-gray-100 text-gray-300 cursor-not-allowed" : "bg-white text-gray-600 hover:bg-gray-50 shadow-sm"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENT AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Patient Summary Card */}
                    <Card className="border-none shadow-sm bg-white">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    Resumo do Paciente
                                </h3>
                                <Button variant="outline" size="sm" onClick={() => setIsHistoryOpen(true)}>
                                    Ver Histórico Completo
                                </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Tutor</p>
                                        <p className="text-gray-900 font-medium">{selectedPatient.ownerName || 'Desconhecido'}</p>
                                    </div>
                                    {selectedPatient.species === 'Equine' && (
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Propriedade</p>
                                            <p className="text-gray-900 font-medium">Haras Pimbury (Mock)</p> 
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Alertas</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold border border-red-200">
                                                    Alergia: {selectedPatient.allergies.join(', ')}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Sem alergias registradas</span>
                                            )}
                                            
                                            {selectedPatient.anestheticRisk ? (
                                                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold border border-orange-200">
                                                    Risco: {selectedPatient.anestheticRisk}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic ml-2">Risco não avaliado</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-none shadow-sm bg-teal-50/30 md:col-span-2 lg:col-span-1">
                            <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-teal-600" />
                                <h3 className="font-bold text-gray-900">Sinais Vitais (Recente)</h3>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Freq. Cardíaca</p>
                                    <span className="text-2xl font-bold text-gray-900">--</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Temperatura</p>
                                    <span className="text-2xl font-bold text-gray-900">--</span>
                                </div>
                            </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm bg-blue-50/30 md:col-span-2 lg:col-span-1">
                            <CardContent className="p-6 h-full">
                            <div className="flex items-center gap-2 mb-4">
                                <Stethoscope className="h-5 w-5 text-blue-600" />
                                <h3 className="font-bold text-gray-900">Última Anamnese</h3>
                            </div>
                            <p className="text-gray-600 text-sm">Nenhum registro recente.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {activeTab === 'attendance_active' && currentAttendance && (
                <div className="space-y-6">
                    
                    {/* 1. Sinais Vitais & Pré-Atendimento (TOPO) */}
                    <Card className="border-none shadow-sm">
                        <CardContent className="p-6">
                             <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Activity className="h-5 w-5 text-red-500" />
                                Sinais Vitais & Pré-Atendimento
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <Label>Peso (kg)</Label>
                                    <div className="relative">
                                        <Input 
                                            type="number" 
                                            placeholder="0.0"
                                            value={vitals.weight || ''}
                                            onChange={e => setVitals({...vitals, weight: Number(e.target.value)})}
                                            className="pl-8"
                                        />
                                        <Weight className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                                <div>
                                    <Label>Freq. Cardíaca (bpm)</Label>
                                    <div className="relative">
                                        <Input 
                                            type="number" 
                                            placeholder="0"
                                            value={vitals.heartRate || ''}
                                            onChange={e => setVitals({...vitals, heartRate: Number(e.target.value)})}
                                            className="pl-8"
                                        />
                                        <Heart className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                                <div>
                                    <Label>Freq. Respiratória (rpm)</Label>
                                    <div className="relative">
                                        <Input 
                                            type="number" 
                                            placeholder="0"
                                            value={vitals.respiratoryRate || ''}
                                            onChange={e => setVitals({...vitals, respiratoryRate: Number(e.target.value)})}
                                            className="pl-8"
                                        />
                                        <Wind className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                                <div>
                                    <Label>Temperatura (°C)</Label>
                                    <div className="relative">
                                        <Input 
                                            type="number" 
                                            placeholder="0.0"
                                            value={vitals.temperature || ''}
                                            onChange={e => setVitals({...vitals, temperature: Number(e.target.value)})}
                                            className="pl-8"
                                        />
                                        <Thermometer className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                                <div>
                                    <Label>TPC (seg)</Label>
                                    <Input 
                                        type="number" 
                                        placeholder="Ex: 2"
                                        value={vitals.tpc || ''}
                                        onChange={e => setVitals({...vitals, tpc: Number(e.target.value)})}
                                    />
                                </div>
                                <div>
                                    <Label>Pressão Sistólica</Label>
                                    <Input 
                                        type="number" 
                                        placeholder="Ex: 120"
                                        value={vitals.pressureSystolic || ''}
                                        onChange={e => setVitals({...vitals, pressureSystolic: Number(e.target.value)})}
                                    />
                                </div>
                                <div>
                                    <Label>Pressão Diastólica</Label>
                                    <Input 
                                        type="number" 
                                        placeholder="Ex: 80"
                                        value={vitals.pressureDiastolic || ''}
                                        onChange={e => setVitals({...vitals, pressureDiastolic: Number(e.target.value)})}
                                    />
                                </div>
                            </div>

                            {/* Equine Specific: Motility */}
                            {selectedPatient.species === 'Equine' && (
                                <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-100">
                                    <h4 className="font-semibold text-orange-800 mb-3 text-sm uppercase">Motilidade Intestinal (Equinos)</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-xs">Superior Esq.</Label>
                                            <Input 
                                                type="number" 
                                                placeholder="0-4"
                                                value={vitals.motility?.upperLeft || ''}
                                                onChange={e => setVitals({...vitals, motility: {...(vitals.motility || { upperRight:0, lowerLeft:0, lowerRight:0 }), upperLeft: Number(e.target.value)}})}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Superior Dir.</Label>
                                            <Input 
                                                type="number" 
                                                placeholder="0-4"
                                                value={vitals.motility?.upperRight || ''}
                                                onChange={e => setVitals({...vitals, motility: {...(vitals.motility || { upperLeft:0, lowerLeft:0, lowerRight:0 }), upperRight: Number(e.target.value)}})}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Inferior Esq.</Label>
                                            <Input 
                                                type="number" 
                                                placeholder="0-4"
                                                value={vitals.motility?.lowerLeft || ''}
                                                onChange={e => setVitals({...vitals, motility: {...(vitals.motility || { upperLeft:0, upperRight:0, lowerRight:0 }), lowerLeft: Number(e.target.value)}})}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Inferior Dir.</Label>
                                            <Input 
                                                type="number" 
                                                placeholder="0-4"
                                                value={vitals.motility?.lowerRight || ''}
                                                onChange={e => setVitals({...vitals, motility: {...(vitals.motility || { upperLeft:0, upperRight:0, lowerLeft:0 }), lowerRight: Number(e.target.value)}})}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex justify-end mt-4">
                                <Button 
                                    variant="outline" 
                                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                    onClick={() => {
                                        if (currentAttendance) {
                                            currentAttendance.vitals = vitals;
                                            alert("Pré-atendimento salvo! Sinais vitais registrados.");
                                        }
                                    }}
                                >
                                    Salvar Pré-atendimento
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. Dados Clínicos */}
                    <Card className="border-none shadow-sm">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                                Dados Clínicos
                            </h3>
                            <textarea 
                                className="w-full border p-3 rounded-lg mb-4 h-32 bg-gray-50 focus:bg-white transition-colors" 
                                placeholder="Anamnese e Histórico..."
                                value={anamnesis}
                                onChange={e => setAnamnesis(e.target.value)}
                            />
                            <textarea 
                                className="w-full border p-3 rounded-lg h-32 bg-gray-50 focus:bg-white transition-colors" 
                                placeholder="Diagnóstico e Procedimentos..."
                                value={diagnosis}
                                onChange={e => setDiagnosis(e.target.value)}
                            />
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Syringe className="h-5 w-5 text-blue-600" />
                                    Vacinas
                                </h3>
                                <Button variant="outline" size="sm" onClick={() => setIsVaccineOpen(!isVaccineOpen)}>
                                    {isVaccineOpen ? 'Ocultar' : 'Adicionar Vacina'}
                                </Button>
                            </div>
                            
                            {isVaccineOpen && (
                                <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-100">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="lg:col-span-1">
                                            <Label>Vacina (Estoque)</Label>
                                            <Autocomplete 
                                                options={inventory.filter(i => i.category === 'Vaccine').map(i => ({ id: i.id, label: `${i.name} (R$ ${i.salePrice})` }))}
                                                onSelect={(opt) => {
                                                    const item = inventory.find(i => i.id === opt.id);
                                                    if (item) setSelectedVaccineToAdd(item);
                                                }}
                                                placeholder="Selecione a vacina..."
                                                value={selectedVaccineToAdd?.name}
                                            />
                                        </div>
                                        <div>
                                            <Label>Lote</Label>
                                            <Input value={vaccineBatch} onChange={e => setVaccineBatch(e.target.value)} placeholder="Lote..." />
                                        </div>
                                        <div>
                                            <Label>Validade</Label>
                                            <Input type="date" value={vaccineExpiry} onChange={e => setVaccineExpiry(e.target.value)} />
                                        </div>
                                        <div className="lg:col-span-3">
                                            <Label>Observações</Label>
                                            <div className="flex gap-2">
                                                <Input value={vaccineNotes} onChange={e => setVaccineNotes(e.target.value)} placeholder="Ex: Reforço anual..." className="flex-1" />
                                                <Button onClick={handleAddVaccine} className="bg-blue-600 text-white">Adicionar</Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* List Vaccines */}
                            {vaccines.length > 0 ? (
                                <div className="space-y-2">
                                    {vaccines.map((vac, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-3 bg-white border rounded-lg shadow-sm">
                                            <div>
                                                <p className="font-medium text-gray-900">{vac.name}</p>
                                                <p className="text-xs text-gray-500">Lote: {vac.batch} | Val: {vac.expiryDate}</p>
                                            </div>
                                            <span className="font-bold text-gray-900">R$ {vac.price.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic">Nenhuma vacina aplicada neste atendimento.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* 3. Procedimento, Consumo e Custos (FINAL) */}
                    <Card className="border-none shadow-sm bg-gray-50/50 border-t-2 border-t-purple-100">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-purple-800">
                                <Syringe className="h-5 w-5" />
                                Procedimentos & Fechamento
                            </h3>
                            
                            {/* Seleção de Pacote */}
                            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-purple-100">
                                <div className="flex gap-4 items-end">
                                    <div className="flex-1">
                                        <Label>Aplicar Procedimento Padrão (Pacote)</Label>
                                        <Select 
                                            onChange={(e) => {
                                                if (e.target.value) handleSelectProcedure(e.target.value);
                                            }}
                                        >
                                            <option value="">Selecione para preencher automaticamente...</option>
                                            {procedures.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} - R$ {p.baseCost}</option>
                                            ))}
                                        </Select>
                                    </div>
                                    <div className="text-xs text-gray-500 pb-2">
                                        *Preenche honorários e materiais.
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-100">
                                <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                                    <Package className="h-4 w-4 text-teal-600" />
                                    Consumo de Materiais
                                </h4>
                                
                                <div className="flex gap-2 mb-4">
                                    <div className="flex-1">
                                        <Autocomplete 
                                            options={inventory.map(i => ({ id: i.id, label: `${i.name} (${i.quantity} ${i.unit})` }))}
                                            onSelect={(opt) => {
                                                const item = inventory.find(i => i.id === opt.id);
                                                if (item) setSelectedItemToAdd(item);
                                            }}
                                            placeholder="Buscar item avulso..."
                                            value={selectedItemToAdd?.name}
                                        />
                                    </div>
                                    <input 
                                        type="number" 
                                        className="w-24 border p-2 rounded-lg"
                                        placeholder="Qtd"
                                        value={qtyToAdd || ''}
                                        onChange={e => setQtyToAdd(Number(e.target.value))}
                                    />
                                    <Button onClick={handleAddItem} className="bg-teal-600 hover:bg-teal-700 text-white">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* List of Consumed Items */}
                                <div className="mb-2">
                                    {consumedItems.length === 0 ? (
                                        <p className="text-sm text-gray-400 italic text-center py-4 bg-gray-50 rounded-lg">Nenhum item adicionado.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {consumedItems.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 border rounded-lg">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{item.itemName}</p>
                                                        <p className="text-xs text-gray-500">{item.quantityUsed} {item.unit} x R$ {item.priceAtMoment.toFixed(2)}</p>
                                                    </div>
                                                    <span className="font-bold text-gray-900">R$ {(item.priceAtMoment * item.quantityUsed).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="border-t pt-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Total Materiais:</span>
                                    <span className="font-medium">R$ {consumedItems.reduce((acc, i) => acc + (i.priceAtMoment * i.quantityUsed), 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Total Vacinas:</span>
                                    <span className="font-medium">R$ {vaccines.reduce((acc, v) => acc + v.price, 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Honorários Veterinários:</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400 text-sm">R$</span>
                                        <input 
                                            type="number" 
                                            className="border-b border-gray-300 w-20 text-right font-medium focus:outline-none focus:border-blue-500"
                                            value={serviceFee}
                                            onChange={e => setServiceFee(Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-xl font-bold text-[#0B2C4D] pt-4 border-t">
                                    <span>Total Final:</span>
                                    <span>R$ {(serviceFee + consumedItems.reduce((acc, i) => acc + (i.priceAtMoment * i.quantityUsed), 0) + vaccines.reduce((acc, v) => acc + v.price, 0)).toFixed(2)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                         <Button 
                            variant="outline" 
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => {
                                if(confirm('Cancelar atendimento?')) {
                                    setCurrentAttendance(null);
                                    setActiveTab('overview');
                                }
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button 
                            className="bg-green-600 hover:bg-green-700 text-white px-8"
                            onClick={handleFinish}
                        >
                            Finalizar e Cobrar
                        </Button>
                    </div>
                </div>
            )}

          </div>

          {/* Right Column (Sidebar Actions) */}
          <div className="space-y-6">
            
            {/* Ações Rápidas */}
            <Card className="border-none shadow-sm bg-[#0B2C4D] text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Activity className="w-24 h-24" />
              </div>
              <CardContent className="p-6 relative z-10">
                <h3 className="text-lg font-bold mb-6">Ações Rápidas</h3>
                
                <div className="space-y-3">
                  {!currentAttendance ? (
                      <Button 
                        onClick={handleStartAttendance}
                        className="w-full bg-[#00BFA5] hover:bg-[#00BFA5]/90 text-white border-none justify-center h-12 text-base font-semibold shadow-lg shadow-teal-900/20"
                      >
                        Novo Procedimento
                      </Button>
                  ) : (
                      <div className="bg-white/10 p-3 rounded-lg text-center text-sm">
                          Atendimento em andamento
                      </div>
                  )}
                  
                  <Button 
                    onClick={handlePrintRecord}
                    className="w-full bg-white/10 hover:bg-white/20 text-white border-none justify-center h-10 backdrop-blur-sm"
                  >
                    <FileText className="mr-2 h-4 w-4" /> Imprimir Prontuário
                  </Button>
                  <Button className="w-full bg-white/10 hover:bg-white/20 text-white border-none justify-center h-10 backdrop-blur-sm">
                    <Mail className="mr-2 h-4 w-4" /> Enviar ao Tutor
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Alertas */}
            <Card className="border-none shadow-sm bg-red-50 border-l-4 border-red-400">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <h3 className="font-bold text-red-900">Alertas</h3>
                </div>
                <div className="space-y-3">
                  <div className="text-sm text-red-800">
                    <p className="opacity-90 leading-relaxed">
                      Nenhum alerta crítico.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
      <PatientDetailsModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} patient={selectedPatient} />
    </Layout>
  );
};
