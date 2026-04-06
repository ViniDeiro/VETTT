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
  Syringe,
  Scissors,
  Trash2,
  Printer
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { pdfService } from '../../services/pdfService';
import { useLocation } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Select } from '../../components/ui/Select';
import { PrescriptionModal } from './PrescriptionModal';
import { ExamRequestModal } from './ExamRequestModal';
import { VaccineModal } from './VaccineModal';
import { ProceduresModal } from './ProceduresModal';
import { ReturnVisitModal } from './ReturnVisitModal';
import { CertificateModal } from './CertificateModal';
import { SurgeryModal } from './SurgeryModal';
import PatientDetailsModal from '../../components/PatientDetailsModal';

export const AttendancePage: React.FC = () => {
  const location = useLocation();
  const initialPatient = location.state?.patient as Patient | null;

  const parseAttendanceDate = (dateValue?: string) => {
    if (!dateValue) return 0;
    if (dateValue.includes('/')) {
      const [day, month, year] = dateValue.split('/');
      return new Date(`${year}-${month}-${day}T00:00:00`).getTime();
    }
    return new Date(dateValue).getTime();
  };

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
  const [confirmedAppointments, setConfirmedAppointments] = useState<any[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  
  // State
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(initialPatient);
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardTab, setDashboardTab] = useState('confirmed');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historySubTab, setHistorySubTab] = useState('Geral');
  
  // Attendance Form State
  const [currentAttendance, setCurrentAttendance] = useState<Attendance | null>(null);
  const [anamnesis, setAnamnesis] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [serviceFee, setServiceFee] = useState(150);
  const [consumedItems, setConsumedItems] = useState<ConsumptionItem[]>([]);
  const [selectedItemToAdd, setSelectedItemToAdd] = useState<InventoryItem | null>(null);
  const [qtyToAdd, setQtyToAdd] = useState(0);
  const [selectedProcedureId, setSelectedProcedureId] = useState('');
  const [procedureCustomPrice, setProcedureCustomPrice] = useState('');
  const [procedureNotes, setProcedureNotes] = useState('');

  // Vaccines State
  const [vaccines, setVaccines] = useState<any[]>([]);
  const [selectedVaccineToAdd, setSelectedVaccineToAdd] = useState<InventoryItem | null>(null);
  const [vaccineBatch, setVaccineBatch] = useState('');
  const [vaccineExpiry, setVaccineExpiry] = useState('');
  const [vaccineNotes, setVaccineNotes] = useState('');
  const [isVaccineOpen, setIsVaccineOpen] = useState(false); // Collapsible state

  // Modal States
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isExamRequestModalOpen, setIsExamRequestModalOpen] = useState(false);
  const [isVaccineModalOpen, setIsVaccineModalOpen] = useState(false);
  const [isProceduresModalOpen, setIsProceduresModalOpen] = useState(false);
  const [isSurgeryModalOpen, setIsSurgeryModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);

  // Vitals State
  const [vitals, setVitals] = useState<Vitals>({});

  const allProperties = mockDB.getAllProperties();
  const patientProperty = allProperties.find(p => p.id === selectedPatient?.propertyId);

  useEffect(() => {
    const loadedPatients = mockDB.getPatients();
    const loadedOwners = mockDB.getOwners();
    const loadedAppointments = mockDB.getAppointments();
    const loadedAttendances = mockDB.getAttendances();
    setPatients(loadedPatients);
    setInventory(mockDB.getInventory());
    setProcedures(mockDB.getProcedures());

    const today = new Date().toDateString();
    const todaysConfirmedAppointments = loadedAppointments
      .filter(appt => {
        const appointmentDate = new Date(appt.start).toDateString();
        const status = String(appt.status || '').toLowerCase();
        return appointmentDate === today && (status === 'confirmado' || status === 'confirmed');
      })
      .map(appt => {
        const patient = loadedPatients.find(p => p.id === appt.patientId) || null;
        const owner = patient ? loadedOwners.find(o => o.id === patient.ownerId) || null : null;

        return {
          ...appt,
          patient,
          patientName: patient?.name || appt.patientName || 'Paciente',
          ownerName: owner?.name || appt.ownerName || 'Não informado',
        };
      })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    setConfirmedAppointments(todaysConfirmedAppointments);

    const finishedAttendances = loadedAttendances
      .filter(att => att.status === 'finished')
      .map(att => {
        const patient = loadedPatients.find(p => p.id === att.patientId) || null;
        const owner = patient ? loadedOwners.find(o => o.id === patient.ownerId) || null : null;

        return {
          ...att,
          patient,
          patientName: patient?.name || att.patientName || 'Paciente',
          ownerName: owner?.name || patient?.ownerName || 'Não informado'
        };
      })
      .sort((a, b) => {
        const dateA = new Date(a.finishedAt || a.updatedAt || parseAttendanceDate(a.date)).getTime();
        const dateB = new Date(b.finishedAt || b.updatedAt || parseAttendanceDate(b.date)).getTime();
        return dateB - dateA;
      });

    setAttendanceHistory(finishedAttendances);
    
    let targetPatient = initialPatient;

    if (!targetPatient) {
        const searchParams = new URLSearchParams(location.search);
        const patientId = searchParams.get('patientId');
        if (patientId) {
            targetPatient = loadedPatients.find(p => p.id === patientId) || null;
        }
    }

    if (targetPatient) {
        // Find fresh patient data to get owner details properly
        const freshPatient = loadedPatients.find(p => p.id === targetPatient?.id);
        setSelectedPatient(freshPatient || targetPatient);
    }
  }, [initialPatient, location.search]);

  // Consultation Type State
  const [showConsultationTypes, setShowConsultationTypes] = useState(false);
  const consultationTypes = [
    { id: 'clinica', label: 'Clínica Geral', icon: Activity },
    { id: 'odonto', label: 'Odontológica', icon: Plus }, // Icon placeholder
    { id: 'dermato', label: 'Dermatológica', icon: Search },
    { id: 'retorno', label: 'Retorno', icon: Clock },
    { id: 'outras', label: 'Outras', icon: FileText }
  ];

  const handleStartAttendanceCheck = () => {
    setShowConsultationTypes(true);
  };

  const resetProcedureForm = () => {
    setSelectedProcedureId('');
    setProcedureCustomPrice('');
    setProcedureNotes('');
  };

  const syncAttendanceState = (updatedAttendance: Attendance) => {
    setCurrentAttendance(updatedAttendance);
    setConsumedItems(updatedAttendance.consumedItems || []);
    setVaccines(updatedAttendance.vaccines || []);
  };

  const handleSelectConsultationType = (typeId: string, label: string) => {
    setShowConsultationTypes(false);
    if (selectedPatient) {
      const isRetorno = typeId === 'retorno';
      
      // Ensure we have the actual owner name dynamically, falling back to what's on the patient, or 'Desconhecido'
      const actualOwner = mockDB.getOwners().find(o => o.id === selectedPatient.ownerId);
      const ownerName = actualOwner ? actualOwner.name : (selectedPatient.ownerName || 'Desconhecido');
      
      const newAttendance = mockDB.createAttendance({
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        vetId: 'current-vet-id',
        date: new Date().toLocaleDateString('pt-BR'),
        reason: isRetorno ? 'Retorno' : '', // Pre-fill Retorno, otherwise empty
        consultationType: typeId,
        consumedItems: [],
        vitals: {}
      });
      setCurrentAttendance(newAttendance);
      setConsumedItems([]);
      setVaccines([]);
      resetProcedureForm();
      if (isRetorno) {
          setServiceFee(0); // Retorno is free by default
      } else {
          setServiceFee(150); // Default fee for other types
      }
      setActiveTab('attendance_active');
    }
  };

  const handleAddProcedure = () => {
      if (!currentAttendance || !selectedProcedureId) return;

      const template = procedures.find(proc => proc.id === selectedProcedureId);
      if (!template) return;

      const price = procedureCustomPrice ? Number(procedureCustomPrice) : template.baseCost;

      const newProcedure = {
          id: Math.random().toString(36).substr(2, 9),
          attendanceId: currentAttendance.id,
          name: template.name,
          price,
          notes: procedureNotes,
          timestamp: new Date().toISOString()
      };

      const autoConsumedItems: ConsumptionItem[] = template.items
          .map(pItem => {
              const invItem = inventory.find(i => i.id === pItem.inventoryItemId);
              if (!invItem) return null;

              return {
                  inventoryItemId: invItem.id,
                  itemName: invItem.name,
                  quantityUsed: pItem.quantity,
                  unit: invItem.unit,
                  costAtMoment: invItem.costPrice,
                  priceAtMoment: invItem.salePrice
              };
          })
          .filter(Boolean) as ConsumptionItem[];

      const updatedProcedures = [...(currentAttendance.procedures || []), newProcedure];
      const updatedConsumedItems = [...consumedItems, ...autoConsumedItems];
      const updatedAttendance = {
          ...currentAttendance,
          procedures: updatedProcedures,
          consumedItems: updatedConsumedItems
      };

      mockDB.updateAttendance(currentAttendance.id, {
          procedures: updatedProcedures,
          consumedItems: updatedConsumedItems
      });

      syncAttendanceState(updatedAttendance);
      resetProcedureForm();
      alert(`Procedimento "${template.name}" adicionado com sucesso.`);
  };

  const handleRemoveProcedure = (procedureId: string) => {
      if (!currentAttendance) return;

      const updatedProcedures = (currentAttendance.procedures || []).filter(proc => proc.id !== procedureId);
      const updatedAttendance = {
          ...currentAttendance,
          procedures: updatedProcedures
      };

      mockDB.updateAttendance(currentAttendance.id, { procedures: updatedProcedures });
      setCurrentAttendance(updatedAttendance);
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
        currentAttendance.anamnesis = anamnesis; // Attach anamnesis
        currentAttendance.diagnosis = diagnosis; // Attach diagnosis
        
        mockDB.finishAttendance(
            currentAttendance.id, 
            serviceFee, 
            consumedItems, 
            vaccines, 
            currentAttendance.procedures || [],
            currentAttendance.returnVisit
        );
        
        // Update patient weight if a new weight was recorded in vitals
        let updatedPatient = { ...selectedPatient };
        let hasPatientUpdates = false;

        if (vitals.weight) {
            updatedPatient.weight = vitals.weight;
            hasPatientUpdates = true;
        }
        
        // Update patient anesthetic risk if recorded in vitals
        if (vitals.anestheticRisk) {
            updatedPatient.anestheticRisk = vitals.anestheticRisk;
            hasPatientUpdates = true;
        }

        if (hasPatientUpdates) {
            mockDB.updatePatient(selectedPatient.id, { 
                weight: updatedPatient.weight,
                anestheticRisk: updatedPatient.anestheticRisk
            });
            // Update local state to reflect the new data immediately without F5
            setSelectedPatient(updatedPatient);
        }

        // Also update the local state record of the attendance directly so the UI sees it immediately
        mockDB.updateAttendance(currentAttendance.id, {
            vitals: vitals,
            anamnesis: anamnesis,
            diagnosis: diagnosis
        });

        alert('Atendimento finalizado com sucesso!');
        const owner = mockDB.getOwners().find(o => o.id === selectedPatient.ownerId);
        setAttendanceHistory(prev => [
          {
            ...currentAttendance,
            status: 'finished',
            diagnosis,
            anamnesis,
            vitals,
            patient: selectedPatient,
            patientName: selectedPatient.name,
            ownerName: owner?.name || selectedPatient.ownerName || 'Não informado',
            finishedAt: new Date().toISOString()
          },
          ...prev
        ]);
        setCurrentAttendance(null);
        setConsumedItems([]);
        setVaccines([]);
        setVitals({});
        setAnamnesis('');
        setDiagnosis('');
        setActiveTab('overview');
      } catch (e: any) {
        console.error('Erro ao finalizar:', e);
        alert('Erro ao finalizar atendimento: ' + (e?.message || 'Erro desconhecido'));
      }
    }
  };

  const handleActionClick = (actionId: string) => {
      let activeAttendance = currentAttendance;
      if (!activeAttendance) {
          // Create a quick attendance if none exists
          if (confirm('Nenhum atendimento em andamento. Deseja iniciar um novo atendimento rápido para esta ação?')) {
              activeAttendance = mockDB.createAttendance({
                  patientId: selectedPatient!.id,
                  patientName: selectedPatient!.name,
                  vetId: 'current-vet-id',
                  date: new Date().toLocaleDateString('pt-BR'),
                  reason: 'Atendimento Rápido',
                  consultationType: 'outras',
                  consumedItems: [],
                  vitals: {}
              });
              setCurrentAttendance(activeAttendance);
              setConsumedItems([]);
              setVaccines([]);
              resetProcedureForm();
              setActiveTab('attendance_active');
          } else {
              return;
          }
      }

      // Save current state first
      activeAttendance.vitals = vitals;
      activeAttendance.anamnesis = anamnesis;
      activeAttendance.diagnosis = diagnosis;
      
      if (actionId === 'prescricao') setIsPrescriptionModalOpen(true);
      else if (actionId === 'exames') setIsExamRequestModalOpen(true);
      else if (actionId === 'vacinas') setIsVaccineModalOpen(true);
      else if (actionId === 'procedimentos') setIsProceduresModalOpen(true);
      else if (actionId === 'cirurgia') setIsSurgeryModalOpen(true);
      else if (actionId === 'retorno') setIsReturnModalOpen(true);
      else if (actionId === 'termos') setIsCertificateModalOpen(true);
  };

  // --- VIEW: SELECT PATIENT ---
  if (!selectedPatient) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-8rem)] bg-gray-50 py-8">
          <div className="mx-auto w-full max-w-5xl space-y-6 px-4">
            <Card className="border-none shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Iniciar Atendimento</h2>
                <p className="text-gray-500 mb-8">Busque um paciente para acessar o prontuário e iniciar o procedimento.</p>
                
                <div className="text-left">
                  <Autocomplete 
                    options={(patients || []).map(p => ({ id: p.id, label: `${p.name} (${p.species})` }))}
                    onSelect={(opt) => {
                      const p = patients.find(pat => pat.id === opt.id);
                      if (p) setSelectedPatient(p);
                    }}
                    placeholder="Digite o nome do paciente..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Central de Atendimento</h3>
                    <p className="text-sm text-gray-500">Acompanhe a fila do dia e o histórico recente dos atendimentos.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium border border-green-100">
                      {confirmedAppointments.length} na fila
                    </span>
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
                      {attendanceHistory.length} finalizados
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 border-b pb-3 mb-6 overflow-x-auto">
                  {[
                    { id: 'confirmed', label: 'Confirmados de Hoje' },
                    { id: 'history', label: 'Histórico de Atendimentos' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setDashboardTab(tab.id)}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                        dashboardTab === tab.id
                          ? 'bg-[#0B2C4D] text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {dashboardTab === 'confirmed' && confirmedAppointments.length === 0 && (
                  <div className="text-center py-10 text-gray-400 border border-dashed border-gray-200 rounded-xl">
                    Nenhum agendamento confirmado para hoje.
                  </div>
                )}

                {dashboardTab === 'confirmed' && confirmedAppointments.length > 0 && (
                  <div className="space-y-3">
                    {confirmedAppointments.map(appt => (
                      <div key={appt.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-16 w-16 flex-col items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm">
                            <span className="text-lg font-bold text-gray-900">
                              {new Date(appt.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <p className="font-bold text-gray-900">{appt.patientName}</p>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                              <span>{appt.ownerName}</span>
                              <span className="text-gray-300">•</span>
                              <span>{appt.doctor || 'Veterinário não informado'}</span>
                              {appt.procedure && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span>{appt.procedure}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={() => appt.patient && setSelectedPatient(appt.patient)}
                          className="bg-[#0B2C4D] text-white hover:bg-[#0B2C4D]/90"
                          disabled={!appt.patient}
                        >
                          Abrir Atendimento
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {dashboardTab === 'history' && attendanceHistory.length === 0 && (
                  <div className="text-center py-10 text-gray-400 border border-dashed border-gray-200 rounded-xl">
                    Nenhum atendimento finalizado ainda.
                  </div>
                )}

                {dashboardTab === 'history' && attendanceHistory.length > 0 && (
                  <div className="space-y-3">
                    {attendanceHistory.slice(0, 12).map(att => (
                      <div key={att.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-bold text-gray-900">{att.patientName}</p>
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                              {att.status === 'finished' ? 'Finalizado' : 'Em andamento'}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                            <span>{att.date}</span>
                            <span className="text-gray-300">•</span>
                            <span>{att.ownerName}</span>
                            <span className="text-gray-300">•</span>
                            <span>{att.reason || 'Consulta Geral'}</span>
                          </div>
                          {att.diagnosis && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              Diagnóstico: {att.diagnosis}
                            </p>
                          )}
                        </div>

                        <Button
                          onClick={() => {
                            if (att.patient) {
                              setSelectedPatient(att.patient);
                              setActiveTab('history');
                              setHistorySubTab('Geral');
                            }
                          }}
                          className="bg-[#0B2C4D] text-white hover:bg-[#0B2C4D]/90"
                          disabled={!att.patient}
                        >
                          Abrir Histórico
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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
            { id: 'attendance_active', label: 'Em Atendimento' },
            { id: 'history', label: 'Histórico' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                activeTab === tab.id 
                  ? "bg-[#0B2C4D] text-white shadow-md" 
                  : "bg-white text-gray-600 hover:bg-gray-50 shadow-sm"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Global Action Toolbar */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
            {[
                { id: 'prescricao', label: 'Prescrição', icon: FileText, color: 'bg-blue-600 hover:bg-blue-700' },
                { id: 'exames', label: 'Exames', icon: Activity, color: 'bg-teal-600 hover:bg-teal-700' },
                { id: 'vacinas', label: 'Vacinas', icon: Syringe, color: 'bg-purple-600 hover:bg-purple-700' },
                { id: 'procedimentos', label: 'Procedimentos', icon: Package, color: 'bg-orange-600 hover:bg-orange-700' },
                { id: 'cirurgia', label: 'Cirurgia', icon: Activity, color: 'bg-red-600 hover:bg-red-700' },
                { id: 'retorno', label: 'Retorno', icon: Calendar, color: 'bg-green-600 hover:bg-green-700' },
                { id: 'termos', label: 'Docs/Termos', icon: FileText, color: 'bg-gray-600 hover:bg-gray-700' },
            ].map(action => (
                <Button
                    key={action.id}
                    className={`${action.color} text-white h-12 flex flex-row items-center justify-center gap-2 shadow-sm transition-all`}
                    onClick={() => handleActionClick(action.id)}
                >
                    <action.icon className="h-4 w-4" />
                    <span className="text-xs font-semibold">{action.label}</span>
                </Button>
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
                                            <p className="text-gray-900 font-medium">{patientProperty ? patientProperty.name : 'Não vinculada'}</p> 
                                        </div>
                                    )}
                                    {selectedPatient.healthPlan && (
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Convênio</p>
                                            <p className="text-gray-900 font-medium flex items-center gap-2">
                                                {selectedPatient.healthPlan}
                                                {selectedPatient.healthPlanNumber && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">Nº {selectedPatient.healthPlanNumber}</span>}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Status / Características</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold border">
                                                {selectedPatient.gender === 'M' ? 'Macho' : 'Fêmea'}
                                            </span>
                                            {selectedPatient.neutered && (
                                                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-200">
                                                    Castrado
                                                </span>
                                            )}
                                            {selectedPatient.pregnant && (
                                                <span className="bg-pink-50 text-pink-700 px-2 py-1 rounded text-xs font-bold border border-pink-200">
                                                    Prenha
                                                </span>
                                            )}
                                            {selectedPatient.status === 'Deceased' && (
                                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold border border-red-200">
                                                    Óbito
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Alertas de Saúde</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold border border-red-200">
                                                    Alergia: {Array.isArray(selectedPatient.allergies) ? selectedPatient.allergies.join(', ') : selectedPatient.allergies}
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
                            
                            {selectedPatient.internalNotes && (
                                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-xs text-yellow-800 uppercase font-bold mb-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> Observação Interna
                                    </p>
                                    <p className="text-sm text-yellow-900 whitespace-pre-wrap">{selectedPatient.internalNotes}</p>
                                </div>
                            )}
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
                            {(() => {
                                const lastAttendanceWithVitals = mockDB.getAttendancesByPatientId(selectedPatient.id)
                                    .filter(a => a.vitals && Object.keys(a.vitals).length > 0)
                                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                                
                                if (!lastAttendanceWithVitals || !lastAttendanceWithVitals.vitals) {
                                    return <p className="text-sm text-gray-500 italic">Nenhum registro encontrado.</p>;
                                }
                                
                                const v = lastAttendanceWithVitals.vitals;
                                return (
                                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Freq. Cardíaca</p>
                                            <span className="text-2xl font-bold text-gray-900">{v.heartRate ? `${v.heartRate} bpm` : '--'}</span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Temperatura</p>
                                            <span className="text-2xl font-bold text-gray-900">{v.temperature ? `${v.temperature}°C` : '--'}</span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Peso</p>
                                            <span className="text-lg font-bold text-gray-900">{v.weight ? `${v.weight} kg` : '--'}</span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Freq. Resp.</p>
                                            <span className="text-lg font-bold text-gray-900">{v.respiratoryRate ? `${v.respiratoryRate} rpm` : '--'}</span>
                                        </div>
                                    </div>
                                );
                            })()}
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm bg-blue-50/30 md:col-span-2 lg:col-span-1">
                            <CardContent className="p-6 h-full">
                            <div className="flex items-center gap-2 mb-4">
                                <Stethoscope className="h-5 w-5 text-blue-600" />
                                <h3 className="font-bold text-gray-900">Última Anamnese</h3>
                            </div>
                            {(() => {
                                const lastAttendanceWithAnamnesis = mockDB.getAttendancesByPatientId(selectedPatient.id)
                                    .filter(a => a.anamnesis)
                                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                                
                                if (!lastAttendanceWithAnamnesis) {
                                    return <p className="text-gray-600 text-sm italic">Nenhum registro recente.</p>;
                                }
                                
                                return (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-2 border-b border-blue-100 pb-2">{lastAttendanceWithAnamnesis.date}</p>
                                        <p className="text-sm text-gray-800 whitespace-pre-wrap line-clamp-4">{lastAttendanceWithAnamnesis.anamnesis}</p>
                                    </div>
                                );
                            })()}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {activeTab === 'attendance_active' && currentAttendance && (
                <div className="space-y-6">
                    
                    {/* HEADER: CONSULTATION INFO */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500 flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500">Atendimento Iniciado em {currentAttendance.date}</p>
                            <h2 className="text-xl font-bold text-gray-900">{currentAttendance.reason}</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                Em Andamento
                            </span>
                        </div>
                    </div>

                    {/* 1. SINAIS VITAIS (EXPANDABLE) */}
                    <Card className="border-none shadow-sm">
                        <CardContent className="p-6">
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-red-500" />
                                    Sinais Vitais
                                </h3>
                            </div>
                            
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
                                    <Label>Freq. Respiratória (m)</Label>
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
                                    <Label>Mucosa</Label>
                                    <Select 
                                        value={vitals.mucousMembrane || ''}
                                        onChange={e => setVitals({...vitals, mucousMembrane: e.target.value})}
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="Normocorada">Normocorada</option>
                                        <option value="Hipocorada">Hipocorada</option>
                                        <option value="Congesta">Congesta</option>
                                        <option value="Ictérica">Ictérica</option>
                                        <option value="Cianótica">Cianótica</option>
                                    </Select>
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
                                    <Label>Risco Anestésico</Label>
                                    <Select 
                                        value={vitals.anestheticRisk || ''}
                                        onChange={e => setVitals({...vitals, anestheticRisk: e.target.value as any})}
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="I - Baixo">Grau I - Baixo Risco</option>
                                        <option value="II - Moderado">Grau II - Risco Moderado</option>
                                        <option value="III - Alto">Grau III - Alto Risco</option>
                                        <option value="IV - Muito Alto">Grau IV - Risco Muito Alto</option>
                                        <option value="V - Extremo">Grau V - Risco Extremo</option>
                                    </Select>
                                </div>
                            </div>

                            {/* Equine Specific: Motility */}
                            {selectedPatient.species === 'Equine' && (
                                <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-100">
                                    <h4 className="font-semibold text-orange-800 mb-3 text-sm uppercase">Motilidade Intestinal (Equinos)</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                        </CardContent>
                    </Card>

                    {/* 2. DOCUMENTO CLÍNICO (CONTINUOUS TEXT) */}
                    <Card className="border-none shadow-sm">
                        <CardContent className="p-8 space-y-8">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    Registro Clínico
                                </h3>
                                
                                <div className="space-y-6">
                                    <div>
                                        <Label className="text-base font-semibold text-gray-700 mb-2 block">Motivo da Consulta / Queixa Principal</Label>
                                        <Input 
                                            className="w-full text-lg p-4 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                            value={currentAttendance.reason}
                                            onChange={e => setCurrentAttendance({...currentAttendance, reason: e.target.value})}
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-base font-semibold text-gray-700 mb-2 block">Anamnese e Histórico</Label>
                                        <textarea 
                                            className="w-full min-h-[150px] p-4 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all resize-y text-gray-700 leading-relaxed"
                                            placeholder="Descreva o histórico do paciente, evolução dos sintomas, alimentação, etc..."
                                            value={anamnesis}
                                            onChange={e => setAnamnesis(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-base font-semibold text-gray-700 mb-2 block">Exame Físico e Diagnóstico</Label>
                                        <textarea 
                                            className="w-full min-h-[150px] p-4 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all resize-y text-gray-700 leading-relaxed"
                                            placeholder="Descreva os achados do exame físico e a conclusão diagnóstica..."
                                            value={diagnosis}
                                            onChange={e => setDiagnosis(e.target.value)}
                                        />
                                    </div>
                                </div>
                                {historySubTab === 'Procedimentos' && (
                                    <div className="space-y-4">
                                        {mockDB.getAttendancesByPatientId(selectedPatient.id).flatMap(a => (a.procedures || []).map(p => ({...p, date: a.date}))).map((proc: any, i) => (
                                            <div key={i} className="p-4 border rounded-lg bg-orange-50">
                                                <div className="flex justify-between mb-2">
                                                    <span className="font-bold text-orange-900">{proc.name}</span>
                                                    <span className="text-sm text-orange-700">{proc.date}</span>
                                                </div>
                                                {proc.notes && <p className="text-sm text-orange-800 mt-2">{proc.notes}</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Prescriptions List (Feedback) */}
                    {currentAttendance.prescriptions && currentAttendance.prescriptions.length > 0 && (
                        <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Prescrições Geradas neste Atendimento
                            </h4>
                            <div className="space-y-2">
                                {currentAttendance.prescriptions.map((p, idx) => (
                                    <div key={p.id} className="flex justify-between items-center bg-white p-3 rounded shadow-sm">
                                        <div>
                                            <span className="font-semibold text-gray-700">Receita #{idx + 1}</span>
                                            <span className="text-xs text-gray-500 ml-2">({p.items.length} itens)</span>
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => pdfService.generatePrescriptionPdf(selectedPatient, p, 'Tutor (Demo)')}>
                                            <Printer className="h-4 w-4 mr-1" /> Re-imprimir
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Exams List (Feedback) */}
                    {currentAttendance.examRequests && currentAttendance.examRequests.length > 0 && (
                        <div className="mt-6 bg-teal-50 p-4 rounded-lg border border-teal-100">
                            <h4 className="font-bold text-teal-900 mb-2 flex items-center gap-2">
                                <Activity className="h-4 w-4" />
                                Solicitações de Exames
                            </h4>
                            <div className="space-y-2">
                                {currentAttendance.examRequests.map((req, idx) => (
                                    <div key={req.id} className="flex justify-between items-center bg-white p-3 rounded shadow-sm">
                                        <div>
                                            <span className="font-semibold text-gray-700">Solicitação #{idx + 1}</span>
                                            <span className="text-xs text-gray-500 ml-2">({req.items.length} exames) - {req.priority === 'urgent' ? 'URGENTE' : 'Rotina'}</span>
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-teal-600" onClick={() => pdfService.generateExamRequestPdf(selectedPatient, req, 'Tutor (Demo)')}>
                                            <Printer className="h-4 w-4 mr-1" /> Re-imprimir
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Vaccines List (Feedback) */}
                    {currentAttendance.vaccines && currentAttendance.vaccines.length > 0 && (
                        <div className="mt-6 bg-purple-50 p-4 rounded-lg border border-purple-100">
                            <h4 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                                <Syringe className="h-4 w-4" />
                                Vacinas Aplicadas Hoje
                            </h4>
                            <div className="space-y-2">
                                {currentAttendance.vaccines.map((vac, idx) => (
                                    <div key={vac.id || idx} className="flex justify-between items-center bg-white p-3 rounded shadow-sm">
                                        <div>
                                            <span className="font-semibold text-gray-700">{vac.name}</span>
                                            <span className="text-xs text-gray-500 ml-2">Lote: {vac.batch}</span>
                                        </div>
                                        <span className="text-sm font-bold text-purple-700">Aplicada</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <Card className="border-none shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <Scissors className="h-5 w-5 text-orange-600" />
                                        Procedimentos
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Adicione procedimentos realizados neste atendimento e registre os materiais consumidos automaticamente.
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="border-orange-200 text-orange-700 hover:bg-orange-50"
                                    onClick={() => setIsProceduresModalOpen(true)}
                                >
                                    <Package className="h-4 w-4 mr-2" />
                                    Abrir modal completo
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                <div className="xl:col-span-1 space-y-4 bg-orange-50 border border-orange-100 rounded-xl p-5">
                                    <div>
                                        <Label>Procedimento</Label>
                                        <select
                                            className="w-full border rounded-md p-2 text-sm mt-1 bg-white"
                                            value={selectedProcedureId}
                                            onChange={e => {
                                                const nextId = e.target.value;
                                                setSelectedProcedureId(nextId);
                                                const selectedTemplate = procedures.find(proc => proc.id === nextId);
                                                setProcedureCustomPrice(selectedTemplate ? selectedTemplate.baseCost.toString() : '');
                                            }}
                                        >
                                            <option value="">Selecione...</option>
                                            {procedures.map(proc => (
                                                <option key={proc.id} value={proc.id}>
                                                    {proc.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <Label>Valor (R$)</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={procedureCustomPrice}
                                            onChange={e => setProcedureCustomPrice(e.target.value)}
                                            placeholder="0,00"
                                        />
                                    </div>

                                    <div>
                                        <Label>Observações</Label>
                                        <textarea
                                            className="w-full border rounded-md p-3 text-sm min-h-[100px] bg-white"
                                            value={procedureNotes}
                                            onChange={e => setProcedureNotes(e.target.value)}
                                            placeholder="Detalhes do procedimento realizado..."
                                        />
                                    </div>

                                    {selectedProcedureId && (
                                        <div className="rounded-lg bg-white border border-orange-100 p-3">
                                            <p className="text-xs font-semibold text-orange-800 uppercase tracking-wide mb-2">
                                                Materiais vinculados
                                            </p>
                                            <div className="space-y-2">
                                                {(procedures.find(proc => proc.id === selectedProcedureId)?.items || []).length > 0 ? (
                                                    (procedures.find(proc => proc.id === selectedProcedureId)?.items || []).map((item, index) => {
                                                        const inventoryItem = inventory.find(inv => inv.id === item.inventoryItemId);
                                                        return (
                                                            <div key={`${item.inventoryItemId}-${index}`} className="flex justify-between text-sm text-gray-600">
                                                                <span>{inventoryItem?.name || 'Item não encontrado'}</span>
                                                                <span>{item.quantity} {inventoryItem?.unit || ''}</span>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <p className="text-sm text-gray-500">Sem materiais vinculados a este procedimento.</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        <Button onClick={handleAddProcedure} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Adicionar
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={resetProcedureForm}
                                            className="border-gray-200"
                                        >
                                            Limpar
                                        </Button>
                                    </div>
                                </div>

                                <div className="xl:col-span-2 border border-gray-100 rounded-xl p-5 bg-gray-50">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-semibold text-gray-800">Procedimentos do atendimento</h4>
                                        <span className="text-sm text-gray-500">
                                            {(currentAttendance.procedures || []).length} item(ns)
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        {(currentAttendance.procedures || []).length === 0 ? (
                                            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-400">
                                                <Scissors className="h-10 w-10 mx-auto mb-3" />
                                                <p className="font-medium text-gray-500">Nenhum procedimento registrado neste atendimento.</p>
                                                <p className="text-sm mt-1">Selecione um procedimento ao lado para começar.</p>
                                            </div>
                                        ) : (
                                            currentAttendance.procedures!.map(proc => (
                                                <div key={proc.id} className="flex items-start justify-between gap-4 rounded-xl bg-white border border-gray-100 p-4 shadow-sm">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-gray-800">{proc.name}</span>
                                                            <span className="text-xs text-gray-400">
                                                                {new Date(proc.timestamp).toLocaleTimeString('pt-BR', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </span>
                                                        </div>
                                                        {proc.notes && (
                                                            <p className="text-sm text-gray-500 mt-1">"{proc.notes}"</p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-bold text-orange-700 whitespace-nowrap">
                                                            R$ {proc.price.toFixed(2)}
                                                        </span>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-500 hover:bg-red-50 hover:text-red-600"
                                                            onClick={() => handleRemoveProcedure(proc.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Procedures List (Feedback) */}
                    {currentAttendance.procedures && currentAttendance.procedures.length > 0 && (
                        <div className="mt-6 bg-orange-50 p-4 rounded-lg border border-orange-100">
                            <h4 className="font-bold text-orange-900 mb-2 flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Procedimentos Realizados
                            </h4>
                            <div className="space-y-2">
                                {currentAttendance.procedures.map((proc, idx) => (
                                    <div key={proc.id} className="flex justify-between items-center bg-white p-3 rounded shadow-sm">
                                        <div>
                                            <span className="font-semibold text-gray-700">{proc.name}</span>
                                            {proc.notes && <span className="text-xs text-gray-500 ml-2">"{proc.notes}"</span>}
                                        </div>
                                        <span className="text-sm font-bold text-orange-700">R$ {proc.price.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Return Visit (Feedback) */}
                    {currentAttendance.returnVisit && (
                        <div className="mt-6 bg-green-50 p-4 rounded-lg border border-green-100">
                            <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Retorno Agendado
                            </h4>
                            <div className="bg-white p-3 rounded shadow-sm flex justify-between items-center">
                                <div>
                                    <span className="font-semibold text-gray-700">
                                        {new Date(currentAttendance.returnVisit.date).toLocaleDateString('pt-BR')}
                                    </span>
                                    <span className="text-xs text-gray-500 ml-2">
                                        ({currentAttendance.returnVisit.type}) - {currentAttendance.returnVisit.reason}
                                    </span>
                                </div>
                                <span className="text-sm font-bold text-green-700">Confirmado</span>
                            </div>
                        </div>
                    )}

                    {/* Financial Summary */}
                    <div className="mt-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <h4 className="font-bold text-gray-900 mb-4">Resumo Financeiro</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Total Materiais:</span>
                                <span className="font-medium">R$ {consumedItems.reduce((acc, i) => acc + (i.priceAtMoment * i.quantityUsed), 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Total Vacinas:</span>
                                <span className="font-medium">R$ {vaccines.reduce((acc, v) => acc + v.price, 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Total Procedimentos:</span>
                                <span className="font-medium">R$ {(currentAttendance.procedures || []).reduce((acc, p) => acc + p.price, 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Honorários Veterinários:</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400 text-sm">R$</span>
                                    <input 
                                        type="number" 
                                        className="border-b border-gray-300 w-20 text-right font-medium focus:outline-none focus:border-blue-500 bg-transparent"
                                        value={serviceFee}
                                        onChange={e => setServiceFee(Number(e.target.value))}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-xl font-bold text-[#0B2C4D] pt-4 border-t border-gray-300">
                                <span>Total Final:</span>
                                <span>R$ {(
                                    serviceFee + 
                                    consumedItems.reduce((acc, i) => acc + (i.priceAtMoment * i.quantityUsed), 0) + 
                                    vaccines.reduce((acc, v) => acc + v.price, 0) +
                                    (currentAttendance.procedures || []).reduce((acc, p) => acc + p.price, 0)
                                ).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between pt-6 border-t">
                        <Button 
                            variant="ghost" 
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => {
                                if(confirm('Tem certeza que deseja cancelar? Dados não salvos serão perdidos.')) {
                                    setCurrentAttendance(null);
                                    setActiveTab('overview');
                                }
                            }}
                        >
                            Cancelar Atendimento
                        </Button>
                        
                        <Button 
                            className="bg-gray-800 text-white px-8"
                            onClick={handleFinish}
                        >
                            Salvar e Finalizar (Sem Ações Extras)
                        </Button>
                    </div>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="space-y-6">
                    <Card className="border-none shadow-sm">
                        <CardContent className="p-6">
                            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2 mb-6">
                                <FileText className="h-5 w-5 text-blue-600" />
                                Histórico do Paciente
                            </h3>
                            
                            {/* History Sub-tabs */}
                            <div className="flex overflow-x-auto gap-2 border-b pb-2 mb-6">
                                {['Geral', 'Consultas', 'Peso e Sinais Vitais', 'Vacinas', 'Exames', 'Procedimentos'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setHistorySubTab(tab)}
                                        className={cn(
                                            "px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors focus:outline-none",
                                            historySubTab === tab 
                                                ? "border-blue-600 text-blue-600 bg-blue-50/50" 
                                                : "border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900"
                                        )}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            
                            <div className="py-4">
                                {historySubTab === 'Geral' && (
                                    <div className="space-y-4">
                                        {mockDB.getAttendancesByPatientId(selectedPatient.id).map(att => (
                                            <div key={att.id} className="flex gap-4 items-center p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                <div className="w-24 shrink-0 text-sm font-bold text-gray-500">{att.date}</div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-800">{att.reason || 'Consulta Geral'}</p>
                                                    <p className="text-xs text-gray-500 flex gap-2 mt-1">
                                                        {att.vaccines && att.vaccines.length > 0 && <span className="bg-purple-100 text-purple-700 px-2 rounded">Vacina</span>}
                                                        {att.examRequests && att.examRequests.length > 0 && <span className="bg-teal-100 text-teal-700 px-2 rounded">Exame</span>}
                                                        {att.procedures && att.procedures.length > 0 && <span className="bg-orange-100 text-orange-700 px-2 rounded">Procedimento</span>}
                                                    </p>
                                                </div>
                                                <Button variant="ghost" size="sm" onClick={() => setIsHistoryOpen(true)} className="text-blue-600 hover:bg-blue-50">
                                                    Abrir Ficha
                                                </Button>
                                            </div>
                                        ))}
                                        {mockDB.getAttendancesByPatientId(selectedPatient.id).length === 0 && (
                                            <div className="text-center py-8 text-gray-500">
                                                <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                                <p>Nenhum registro encontrado para este paciente.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {historySubTab === 'Consultas' && (
                                    <div className="space-y-4">
                                        {mockDB.getAttendancesByPatientId(selectedPatient.id).map(att => (
                                            <div 
                                                key={att.id} 
                                                className="p-4 border rounded-lg bg-gray-50 hover:bg-white hover:shadow-md transition-all cursor-pointer group"
                                                onClick={() => {
                                                    // Trigger opening the full details modal in the parent context if possible, 
                                                    // or at least show a simple alert/expansion for now.
                                                    setIsHistoryOpen(true);
                                                    // Ideally we would pass the specific attendance ID to the modal
                                                }}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-bold text-gray-800">{att.date} - {att.reason || 'Consulta Geral'}</span>
                                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{att.status === 'finished' ? 'Finalizado' : 'Em Andamento'}</span>
                                                </div>
                                                {att.diagnosis && <p className="text-sm text-gray-600 mb-2"><span className="font-semibold">Diagnóstico:</span> {att.diagnosis}</p>}
                                                {att.anamnesis && <p className="text-sm text-gray-500 line-clamp-2"><span className="font-semibold">Anamnese:</span> {att.anamnesis}</p>}
                                                <div className="mt-2 text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Clique para abrir ficha completa
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {historySubTab === 'Peso e Sinais Vitais' && (
                                    <div className="space-y-4">
                                        {mockDB.getAttendancesByPatientId(selectedPatient.id).filter(a => a.vitals && Object.keys(a.vitals).length > 0).map(att => (
                                            <div key={att.id} className="p-4 border rounded-lg bg-gray-50 flex flex-col md:flex-row gap-4 md:gap-6">
                                                <span className="font-bold text-gray-600 w-24 shrink-0">{att.date}</span>
                                                <div className="flex flex-wrap gap-4 text-sm">
                                                    {att.vitals?.weight && <span><span className="font-semibold">Peso:</span> {att.vitals.weight}kg</span>}
                                                    {att.vitals?.temperature && <span><span className="font-semibold">Temp:</span> {att.vitals.temperature}°C</span>}
                                                    {att.vitals?.heartRate && <span><span className="font-semibold">FC:</span> {att.vitals.heartRate}bpm</span>}
                                                    {att.vitals?.respiratoryRate && <span><span className="font-semibold">FR:</span> {att.vitals.respiratoryRate}rpm</span>}
                                                    {att.vitals?.mucousMembrane && <span><span className="font-semibold">Mucosa:</span> {att.vitals.mucousMembrane}</span>}
                                                    {att.vitals?.tpc && <span><span className="font-semibold">TPC:</span> {att.vitals.tpc}s</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {historySubTab === 'Vacinas' && (
                                    <div className="space-y-4">
                                        {mockDB.getAttendancesByPatientId(selectedPatient.id).flatMap(a => a.vaccines || []).map((vac, i) => (
                                            <div key={i} className="p-4 border rounded-lg bg-purple-50">
                                                <div className="flex justify-between">
                                                    <span className="font-bold text-purple-900">{vac.name}</span>
                                                    <span className="text-sm text-purple-700">{vac.applicationDate}</span>
                                                </div>
                                                <p className="text-xs text-purple-600 mt-1">Lote: {vac.batch} | Próx. Dose: {vac.nextDoseDate ? new Date(vac.nextDoseDate).toLocaleDateString('pt-BR') : 'Não agendada'}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {historySubTab === 'Exames' && (
                                    <div className="space-y-4">
                                        {mockDB.getAttendancesByPatientId(selectedPatient.id).flatMap(a => a.examRequests || []).map((req, i) => (
                                            <div key={i} className="p-4 border rounded-lg bg-teal-50">
                                                <div className="flex justify-between mb-2">
                                                    <span className="font-bold text-teal-900">Solicitação em {req.date}</span>
                                                    <span className="text-xs font-bold uppercase text-teal-700">{req.priority === 'urgent' ? 'Urgente' : 'Rotina'}</span>
                                                </div>
                                                <ul className="list-disc list-inside text-sm text-teal-800 ml-2">
                                                    {req.items.map((item, j) => <li key={j}>{item.name} {item.instructions ? `(${item.instructions})` : ''}</li>)}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
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
                        type="button"
                        onClick={handleStartAttendanceCheck}
                        className="w-full bg-[#00BFA5] hover:bg-[#00BFA5]/90 text-white border-none justify-center h-12 text-base font-semibold shadow-lg shadow-teal-900/20"
                      >
                        Nova Consulta / Procedimento
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
      
      {/* Consultation Type Modal */}
      {showConsultationTypes && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-white shadow-xl">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Selecione o Tipo de Consulta</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {consultationTypes.map((type) => (
                  <Button
                    key={type.id}
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-200 transition-all"
                    onClick={() => handleSelectConsultationType(type.id, type.label)}
                  >
                    <type.icon className="h-8 w-8 text-blue-600" />
                    <span className="font-medium text-gray-700">{type.label}</span>
                  </Button>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <Button variant="ghost" onClick={() => setShowConsultationTypes(false)}>Cancelar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Prescription Modal */}
      {currentAttendance && selectedPatient && (
        <PrescriptionModal
            isOpen={isPrescriptionModalOpen}
            onClose={() => setIsPrescriptionModalOpen(false)}
            attendance={currentAttendance}
            patient={selectedPatient}
            onSave={syncAttendanceState}
        />
      )}

      {/* Exam Request Modal */}
      {currentAttendance && selectedPatient && (
        <ExamRequestModal
            isOpen={isExamRequestModalOpen}
            onClose={() => setIsExamRequestModalOpen(false)}
            attendance={currentAttendance}
            patient={selectedPatient}
            onSave={syncAttendanceState}
        />
      )}

      {/* Vaccine Modal */}
      {currentAttendance && selectedPatient && (
        <VaccineModal
            isOpen={isVaccineModalOpen}
            onClose={() => setIsVaccineModalOpen(false)}
            attendance={currentAttendance}
            patient={selectedPatient}
            onSave={syncAttendanceState}
        />
      )}

      {/* Procedures Modal */}
      {currentAttendance && selectedPatient && (
        <ProceduresModal
            isOpen={isProceduresModalOpen}
            onClose={() => setIsProceduresModalOpen(false)}
            attendance={currentAttendance}
            patient={selectedPatient}
            onSave={syncAttendanceState}
        />
      )}

      {/* Return Visit Modal */}
      {currentAttendance && selectedPatient && (
        <ReturnVisitModal
            isOpen={isReturnModalOpen}
            onClose={() => setIsReturnModalOpen(false)}
            attendance={currentAttendance}
            patient={selectedPatient}
            onSave={syncAttendanceState}
        />
      )}

      {/* Certificate Modal */}
      {currentAttendance && selectedPatient && (
        <CertificateModal
            isOpen={isCertificateModalOpen}
            onClose={() => setIsCertificateModalOpen(false)}
            attendance={currentAttendance}
            patient={selectedPatient}
        />
      )}

      {/* Surgery Modal */}
      {currentAttendance && selectedPatient && (
        <SurgeryModal
            isOpen={isSurgeryModalOpen}
            onClose={() => setIsSurgeryModalOpen(false)}
            attendance={currentAttendance}
            patient={selectedPatient}
            onSave={syncAttendanceState}
        />
      )}

      <PatientDetailsModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} patient={selectedPatient} />
    </Layout>
  );
};
