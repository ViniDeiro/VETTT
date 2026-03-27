import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { Autocomplete } from '../shared/Autocomplete'
import { mockDB } from '../services/mockDatabase'
import { getBreedsBySpecies } from '../domain/breeds'
import { 
  Heart, 
  Activity, 
  FileText, 
  Clock, 
  Paperclip, 
  AlertCircle, 
  Stethoscope, 
  File, 
  Image as ImageIcon, 
  StickyNote,
  User,
  MoreVertical,
  Mail,
  Printer,
  Plus,
  Edit2,
  Home
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function PatientDetailsModal({ isOpen, onClose, patient }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview')
  const [isChangingOwner, setIsChangingOwner] = useState(false)
  const [isChangingProperty, setIsChangingProperty] = useState(false)
  const [isEditing, setIsEditing] = useState(false) // Edit Mode
  const [owners, setOwners] = useState([])
  const [properties, setProperties] = useState([])
  const [newOwner, setNewOwner] = useState(null)
  const [newProperty, setNewProperty] = useState(null)
  
  // Attendances State
  const [attendances, setAttendances] = useState([])
  const [selectedAttendance, setSelectedAttendance] = useState(null)
  const [isEditingAttendance, setIsEditingAttendance] = useState(false)
  
  // Edit Form State
  const [editFormData, setEditFormData] = useState({})

  useEffect(() => {
    if (isOpen) {
        setOwners(mockDB.getOwners())
        setProperties(mockDB.getAllProperties())
        // Initialize edit form
        if (patient) {
            const owner = mockDB.getOwners().find(o => o.id === patient.ownerId);
            const prop = mockDB.getAllProperties().find(p => p.id === patient.propertyId);
            setEditFormData({
                ...patient,
                ownerData: owner || {},
                propertyData: prop || {}
            });
            
            // Load Attendances
            setAttendances(mockDB.getAttendancesByPatientId(patient.id));
        }
    }
  }, [isOpen, patient])

  const handlePhotoUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64 = reader.result;
              mockDB.updatePatient(patient.id, { photoUrl: base64 });
              // Force update UI (hacky since patient is prop, better if parent updates)
              // But for now we assume parent might re-render or we update local
              patient.photoUrl = base64; 
              // Trigger re-render
              setEditFormData({...editFormData, photoUrl: base64}); 
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSaveEdit = () => {
    // Save Patient
    const { ownerData, propertyData, ...patientUpdates } = editFormData;
    
    // Convert allergies/chronicDiseases back to array if they are strings
    if (typeof patientUpdates.allergies === 'string') {
        patientUpdates.allergies = patientUpdates.allergies.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (typeof patientUpdates.chronicDiseases === 'string') {
        patientUpdates.chronicDiseases = patientUpdates.chronicDiseases.split(',').map(s => s.trim()).filter(Boolean);
    }

    mockDB.updatePatient(patient.id, patientUpdates);
    
    // Save Owner
    if (patient.ownerId && ownerData) {
        mockDB.updateOwner(patient.ownerId, ownerData);
    }

    // Save Property
    if (patient.propertyId && propertyData && patient.species === 'Equine') {
        mockDB.updateProperty(patient.propertyId, propertyData);
    }

    // Update local 'patient' prop reference for immediate UI feedback (React won't re-render parent automatically here without callback)
    Object.assign(patient, patientUpdates);
    if(ownerData) patient.ownerName = ownerData.name; // Sync name

    setIsEditing(false);
    alert('Dados atualizados com sucesso!');
  };

  if (!patient) return null

  const handleSaveOwnerChange = () => {
      if (newOwner) {
          patient.ownerId = newOwner.id;
          patient.ownerName = newOwner.name;
          mockDB.updatePatient(patient.id, { ownerId: newOwner.id, ownerName: newOwner.name });
          alert(`Tutor alterado para: ${newOwner.name}`);
          setIsChangingOwner(false);
          setNewOwner(null);
      }
  }

  const handleSavePropertyChange = () => {
      if (newProperty) {
          patient.propertyId = newProperty.id;
          mockDB.updatePatient(patient.id, { propertyId: newProperty.id });
          alert(`Propriedade alterada para: ${newProperty.name}`);
          setIsChangingProperty(false);
          setNewProperty(null);
      }
  }

  const tabs = [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'contacts', label: 'Contatos & Local' },
    { id: 'attendances', label: 'Histórico de Atendimentos' },
    { id: 'odontogram', label: 'Odontograma' },
    { id: 'treatments', label: 'Tratamentos' },
    { id: 'exams', label: 'Exames' },
    { id: 'photos', label: 'Fotos' },
    { id: 'files', label: 'Arquivos' },
    { id: 'notes', label: 'Notas' },
  ]

  const handleAction = async (action) => {
    console.log('Action clicked:', action);
    try {
      switch (action) {
        case 'odontogram':
          setActiveTab('odontogram');
          break;
        case 'new-procedure':
          navigate(`/attendance-new`, { state: { patient: patient } });
          break;
        case 'pdf':
          console.log('Generating PDF...');
          try {
            const { default: jsPDF } = await import('jspdf');
            const doc = new jsPDF();
            doc.setFontSize(20);
            doc.text(`Prontuário: ${patient.name}`, 10, 20);
            doc.setFontSize(12);
            doc.text(`Tutor: ${patient.ownerName}`, 10, 30);
            doc.text(`Espécie: ${patient.species}`, 10, 40);
            doc.text(`Data: ${new Date().toLocaleDateString()}`, 10, 50);
            doc.save(`prontuario_${patient.name}.pdf`);
            console.log('PDF Generated');
          } catch (err) {
            console.error('PDF Error:', err);
            alert('Erro ao gerar PDF. Verifique o console.');
          }
          break;
        case 'email':
          window.alert(`Email enviado para o tutor de ${patient.name} com sucesso!`);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('HandleAction Error:', error);
    }
  };

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300",
      isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
    )}>
      <div 
        className={cn(
          "bg-white rounded-xl shadow-2xl w-[95vw] h-[90vh] flex flex-col overflow-hidden transform transition-all duration-300",
          isOpen ? "scale-100" : "scale-95"
        )}
      >
        {/* Header */}
        <div className="bg-white border-b p-6 flex items-start justify-between shrink-0">
          <div className="flex gap-6">
            <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden shrink-0 border-4 border-white shadow-lg relative group">
              <img 
                src={patient.photoUrl || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${patient.name}`} 
                alt={patient.name}
                className="w-full h-full object-cover"
              />
              {/* Photo Upload Overlay */}
              <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <ImageIcon className="h-8 w-8 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold text-gray-900">{patient.name}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  {(() => {
                      const nextAppt = mockDB.appointments.find(a => a.patientId === patient.id && new Date(a.start) > new Date());
                      if (nextAppt) {
                          return <span>Próxima Consulta: {new Date(nextAppt.start).toLocaleString('pt-BR')}</span>;
                      }
                      return <span className="italic">Sem consultas futuras</span>;
                  })()}
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-gray-600 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{patient.species || 'Canino'} {patient.breed && `- ${patient.breed}`}</span>
                </div>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{patient.gender === 'M' ? 'Macho' : 'Fêmea'}</span>
                    {patient.age && <span>, {patient.age} anos</span>}
                  </div>
                  {patient.rg && (
                    <>
                      <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-blue-700">RG: {patient.rg}</span>
                      </div>
                    </>
                  )}
                  {patient.microchip && (
                    <>
                      <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-purple-700">Microchip: {patient.microchip}</span>
                      </div>
                    </>
                  )}
                  {patient.weight && (
                  <>
                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{patient.weight} kg</span>
                    </div>
                  </>
                )}
                {patient.coat && (
                  <>
                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Pelagem: {patient.coat}</span>
                    </div>
                  </>
                )}
                {patient.temperament && (
                  <>
                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-orange-600">Comportamento: {patient.temperament}</span>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-4 text-gray-600 flex-wrap mt-1">
                <div className="flex items-center gap-2 group relative">
                  <User className="h-4 w-4" />
                  <span>Tutor: {patient.ownerName || 'Ana Souza'}</span>
                  <button 
                    onClick={() => setIsChangingOwner(true)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded text-blue-600"
                    title="Alterar Tutor"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                </div>
                {patient.species === 'Equine' && (
                  <>
                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    <div className="flex items-center gap-2 group relative">
                      <Home className="h-4 w-4" />
                      <span>Propriedade: {properties.find(p => p.id === patient.propertyId)?.name || 'N/A'}</span>
                      <button 
                        onClick={() => setIsChangingProperty(true)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded text-blue-600"
                        title="Alterar Propriedade"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                    </div>
                  </>
                )}
                
                {/* Edit Button */}
                {patient.status !== 'Deceased' && patient.status !== 'Archived' ? (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-auto text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        onClick={() => setIsEditing(true)}
                    >
                        <Edit2 className="h-4 w-4 mr-2" /> Editar Dados
                    </Button>
                ) : (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-auto text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        onClick={() => {
                            if(confirm('Este paciente está bloqueado. Deseja reabrir a ficha para edição?')) {
                                setIsEditing(true);
                            }
                        }}
                    >
                        <Edit2 className="h-4 w-4 mr-2" /> Ficha Bloqueada
                    </Button>
                )}
              </div>

              <div className="flex gap-2 mt-2 flex-wrap">
                {patient.status === 'Deceased' && (
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
                        Óbito
                    </span>
                )}
                {patient.status === 'Archived' && (
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">
                        Arquivado
                    </span>
                )}
                {patient.healthPlan && (
                    <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border",
                        patient.healthPlanExpiry && new Date(patient.healthPlanExpiry) < new Date() 
                            ? "bg-red-50 text-red-700 border-red-200" 
                            : "bg-green-50 text-green-700 border-green-200"
                    )}>
                        <Heart className="h-3 w-3" />
                        Convênio: {patient.healthPlan}
                        {patient.healthPlanExpiry && new Date(patient.healthPlanExpiry) < new Date() && " (Vencido)"}
                    </span>
                )}
                {patient.allergies && patient.allergies.length > 0 && (
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-red-200">
                        <AlertCircle className="h-3 w-3" />
                        Alergias: {Array.isArray(patient.allergies) ? patient.allergies.join(', ') : patient.allergies}
                    </span>
                )}
                {patient.anestheticRisk && (
                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-orange-200">
                        <Activity className="h-3 w-3" />
                        Risco: {patient.anestheticRisk}
                    </span>
                )}
                {patient.neutered && (
                     <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                        Castrado
                    </span>
                )}
                {patient.pregnant && (
                     <span className="bg-pink-50 text-pink-700 px-3 py-1 rounded-full text-xs font-bold border border-pink-200">
                        Prenha
                    </span>
                )}
              </div>
            </div>
          </div>

          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <span className="sr-only">Fechar</span>
            <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden bg-gray-50">
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="bg-white border-b px-6 flex items-center gap-1 overflow-x-auto shrink-0">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                    activeTab === tab.id
                      ? "border-[#00BFA5] text-[#00BFA5]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Observações Gerais */}
                  {(patient.notes || (patient.chronicDiseases && patient.chronicDiseases.length > 0)) && (
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 col-span-1 md:col-span-2 lg:col-span-3">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="h-5 w-5 text-purple-600" />
                        <h3 className="font-bold text-gray-900">Observações</h3>
                      </div>
                      
                      {patient.chronicDiseases && patient.chronicDiseases.length > 0 && (
                          <div className="mb-4">
                              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Doenças Crônicas</p>
                              <div className="flex flex-wrap gap-2">
                                  {patient.chronicDiseases.map((disease, idx) => (
                                      <span key={idx} className="bg-red-50 text-red-700 px-2 py-1 rounded text-sm border border-red-100">
                                          {disease}
                                      </span>
                                  ))}
                              </div>
                          </div>
                      )}
                      
                      {patient.notes && (
                          <div>
                              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Observações Gerais</p>
                              <p className="text-sm text-gray-800 whitespace-pre-wrap">{patient.notes}</p>
                          </div>
                      )}
                    </div>
                  )}

                  {/* Sinais Vitais */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="h-5 w-5 text-[#00BFA5]" />
                      <h3 className="font-bold text-gray-900">Sinais Vitais</h3>
                    </div>
                    {(() => {
                        const lastAttendance = mockDB.getAttendancesByPatientId(patient.id)
                            .filter(a => a.vitals && Object.keys(a.vitals).length > 0)
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                            
                        if (!lastAttendance || !lastAttendance.vitals) {
                            return <p className="text-sm text-gray-500 italic">Nenhum registro de sinais vitais encontrado.</p>;
                        }
                        
                        const v = lastAttendance.vitals;
                        return (
                            <>
                                <span className="text-xs text-gray-400 block mb-3">Última medição: {lastAttendance.date}</span>
                                <div className="grid grid-cols-2 gap-4">
                                  {v.heartRate && (
                                      <div>
                                        <p className="text-xs text-gray-500">Freq. Cardíaca</p>
                                        <p className="text-xl font-bold text-gray-900">{v.heartRate} bpm</p>
                                      </div>
                                  )}
                                  {v.temperature && (
                                      <div>
                                        <p className="text-xs text-gray-500">Temperatura</p>
                                        <p className="text-xl font-bold text-gray-900">{v.temperature} °C</p>
                                      </div>
                                  )}
                                  {v.respiratoryRate && (
                                      <div>
                                        <p className="text-xs text-gray-500">Freq. Respiratória</p>
                                        <p className="text-xl font-bold text-gray-900">{v.respiratoryRate} rpm</p>
                                      </div>
                                  )}
                                  {v.weight && (
                                      <div>
                                        <p className="text-xs text-gray-500">Peso Medido</p>
                                        <p className="text-xl font-bold text-gray-900">{v.weight} kg</p>
                                      </div>
                                  )}
                                </div>
                            </>
                        );
                    })()}
                  </div>

                  {/* Convênio */}
                  {patient.healthPlan && (
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 col-span-1">
                      <div className="flex items-center gap-2 mb-4">
                        <Heart className="h-5 w-5 text-pink-500" />
                        <h3 className="font-bold text-gray-900">Convênio</h3>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm"><strong>Plano:</strong> {patient.healthPlan}</p>
                        <p className="text-sm"><strong>Carteirinha:</strong> {patient.healthPlanNumber || 'N/A'}</p>
                        {(() => {
                            if (!patient.healthPlanExpiry) return null;
                            const isExpired = new Date(patient.healthPlanExpiry) < new Date();
                            return (
                                <p className={cn("text-sm font-bold", isExpired ? "text-red-600" : "text-green-600")}>
                                    Vencimento: {new Date(patient.healthPlanExpiry).toLocaleDateString('pt-BR')}
                                    {isExpired && ' (Vencida)'}
                                </p>
                            );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Anamnese */}
                  <div className="bg-[#0B2C4D] p-5 rounded-xl shadow-sm text-white col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                      <Stethoscope className="h-5 w-5 text-[#00BFA5]" />
                      <h3 className="font-bold">Anamnese</h3>
                    </div>
                    {(() => {
                        const lastAnamnesis = mockDB.getAttendancesByPatientId(patient.id)
                            .filter(a => a.anamnesis)
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                            
                        if (!lastAnamnesis) {
                            return <p className="text-sm text-blue-200 italic">Nenhuma anamnese registrada recentemente.</p>;
                        }
                        
                        return (
                            <>
                                <p className="text-xs text-blue-300 mb-2 border-b border-blue-800 pb-2">Registrada em: {lastAnamnesis.date}</p>
                                <p className="text-sm text-blue-50 leading-relaxed whitespace-pre-wrap">
                                  {lastAnamnesis.anamnesis}
                                </p>
                            </>
                        );
                    })()}
                  </div>

                  {/* Procedimentos Recentes */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <h3 className="font-bold text-gray-900">Procedimentos Recentes</h3>
                    </div>
                    {(() => {
                        const allProcedures = mockDB.getAttendancesByPatientId(patient.id)
                            .flatMap(a => (a.procedures || []).map(p => ({...p, date: a.date, vet: a.vetId})))
                            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                            .slice(0, 3); // Take last 3
                            
                        if (allProcedures.length === 0) {
                            return <p className="text-sm text-gray-500 italic">Nenhum procedimento registrado ainda.</p>;
                        }
                        
                        return (
                            <div className="space-y-4">
                              {allProcedures.map((proc, idx) => (
                                  <div key={idx} className="border-l-2 border-blue-500 pl-3">
                                    <p className="text-xs text-gray-500">{proc.date}</p>
                                    <p className="font-medium text-gray-900">{proc.name}</p>
                                    <p className="text-xs text-gray-400">({proc.vet || 'Dr. Vet'})</p>
                                  </div>
                              ))}
                            </div>
                        );
                    })()}
                    <Button variant="outline" className="w-full mt-4 text-xs h-8" onClick={() => setActiveTab('history')}>Ver histórico completo</Button>
                  </div>

                  {/* Notas Clínicas Livres */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                      <StickyNote className="h-5 w-5 text-yellow-500" />
                      <h3 className="font-bold text-gray-900">Notas Clínicas</h3>
                    </div>
                    {patient.internalNotes ? (
                        <p className="text-sm text-gray-800 whitespace-pre-wrap bg-yellow-50 p-3 rounded border border-yellow-100">
                          {patient.internalNotes}
                        </p>
                    ) : (
                        <p className="text-sm text-gray-400 italic">Nenhuma nota interna registrada. (Edite a ficha para adicionar)</p>
                    )}
                  </div>

                  {/* Últimos Exames */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                      <File className="h-5 w-5 text-teal-500" />
                      <h3 className="font-bold text-gray-900">Últimos Exames Solicitados</h3>
                    </div>
                    {(() => {
                        const allExams = mockDB.getAttendancesByPatientId(patient.id)
                            .flatMap(a => (a.examRequests || []).map(e => ({...e, date: a.date})))
                            .slice(0, 3); // Take last 3
                            
                        if (allExams.length === 0) {
                            return <p className="text-sm text-gray-400 italic">Nenhum exame solicitado recentemente.</p>;
                        }
                        
                        return (
                            <div className="space-y-2">
                                {allExams.map((exam, idx) => (
                                    <div key={idx} className="flex items-center justify-between border-b border-gray-50 pb-2">
                                        <p className="text-sm text-gray-800 font-medium">{exam.examName}</p>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{exam.date}</span>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                  </div>

                  {/* Anexos */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                      <Paperclip className="h-5 w-5 text-gray-500" />
                      <h3 className="font-bold text-gray-900">Anexos Recentes</h3>
                    </div>
                    <div className="text-center py-4">
                        <p className="text-sm text-gray-400 italic mb-2">Nenhum arquivo anexado.</p>
                        <Button variant="outline" size="sm" className="text-xs" onClick={() => setActiveTab('files')}>Ir para Arquivos</Button>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'contacts' && (
                  <div className="space-y-6">
                      {/* Tutor Contacts */}
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                          <div className="flex justify-between items-center mb-4 border-b pb-2">
                              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                  <User className="h-5 w-5 text-blue-600" />
                                  Contatos do Tutor
                              </h3>
                              {patient.status !== 'Deceased' && patient.status !== 'Archived' && (
                                  <Button variant="outline" size="sm" onClick={() => setIsChangingOwner(true)} className="text-xs">
                                      <Edit2 className="h-3 w-3 mr-1" /> Alterar Tutor
                                  </Button>
                              )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                  <label className="text-xs text-gray-500 uppercase font-semibold">Nome Completo</label>
                                  <p className="font-medium text-lg">{patient.ownerName}</p>
                              </div>
                              {(() => {
                                  const owner = owners.find(o => o.id === patient.ownerId);
                                  return owner ? (
                                      <>
                                          <div>
                                              <label className="text-xs text-gray-500 uppercase font-semibold">CPF/CNPJ</label>
                                              <p className="font-medium text-gray-700">{owner.document || 'Não informado'}</p>
                                          </div>
                                          <div>
                                              <label className="text-xs text-gray-500 uppercase font-semibold">Telefone Principal</label>
                                              <div className="flex items-center gap-2">
                                                  <p className="font-medium text-lg">{owner.phone}</p>
                                                  <button className="text-green-600 hover:text-green-700 text-sm font-bold bg-green-50 px-2 py-1 rounded">WhatsApp</button>
                                              </div>
                                          </div>
                                          <div>
                                              <label className="text-xs text-gray-500 uppercase font-semibold">Telefone Secundário</label>
                                              <p className="font-medium text-gray-700">{owner.secondaryPhone || 'Não informado'}</p>
                                          </div>
                                          <div className="md:col-span-2">
                                              <label className="text-xs text-gray-500 uppercase font-semibold">Email</label>
                                              <p className="font-medium text-gray-700">{owner.email || 'Não informado'}</p>
                                          </div>
                                          <div className="md:col-span-2">
                                              <label className="text-xs text-gray-500 uppercase font-semibold">Endereço Completo</label>
                                              <p className="font-medium text-gray-700">
                                                  {owner.address || owner.street} {owner.number && `, ${owner.number}`} {owner.neighborhood && `- ${owner.neighborhood}`}
                                                  <br/>
                                                  {owner.city && `${owner.city}/${owner.state}`} {owner.zipCode && `- CEP: ${owner.zipCode}`}
                                              </p>
                                          </div>
                                       </>
                                   ) : (
                                       <p className="text-red-500">Dados do tutor não encontrados.</p>
                                   )
                               })()}
                           </div>
                       </div>

                       {/* Convênio no Contatos */}
                       {patient.healthPlan && (
                           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                               <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                                   <Heart className="h-5 w-5 text-pink-500" />
                                   Dados do Convênio / Plano de Saúde
                               </h3>
                               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                   <div>
                                       <label className="text-xs text-gray-500 uppercase font-semibold">Nome do Plano</label>
                                       <p className="font-medium text-gray-900">{patient.healthPlan}</p>
                                   </div>
                                   <div>
                                       <label className="text-xs text-gray-500 uppercase font-semibold">Carteirinha</label>
                                       <p className="font-medium text-gray-900">{patient.healthPlanNumber || 'N/A'}</p>
                                   </div>
                                   <div>
                                       <label className="text-xs text-gray-500 uppercase font-semibold">Vencimento</label>
                                       {(() => {
                                           if (!patient.healthPlanExpiry) return <p className="font-medium text-gray-700">N/A</p>;
                                           const isExpired = new Date(patient.healthPlanExpiry) < new Date();
                                           return (
                                               <p className={cn("font-medium", isExpired ? "text-red-600 font-bold" : "text-green-600")}>
                                                   {new Date(patient.healthPlanExpiry).toLocaleDateString('pt-BR')}
                                                   {isExpired && ' (Vencida)'}
                                               </p>
                                           );
                                       })()}
                                   </div>
                               </div>
                           </div>
                       )}

                      {/* Property Contacts (Equine) */}
                      {patient.species === 'Equine' && (
                           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-4 border-b pb-2">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                        <Home className="h-5 w-5 text-orange-600" />
                                        Dados da Propriedade
                                    </h3>
                                    {patient.status !== 'Deceased' && patient.status !== 'Archived' && (
                                        <Button variant="outline" size="sm" onClick={() => setIsChangingProperty(true)} className="text-xs">
                                            <Edit2 className="h-3 w-3 mr-1" /> Alterar Propriedade
                                        </Button>
                                    )}
                                </div>
                                {(() => {
                                  const prop = properties.find(p => p.id === patient.propertyId);
                                  return prop ? (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                          <div>
                                              <label className="text-xs text-gray-500 uppercase font-semibold">Nome da Propriedade</label>
                                              <p className="font-medium text-lg">{prop.name}</p>
                                          </div>
                                          <div>
                                              <label className="text-xs text-gray-500 uppercase font-semibold">CNPJ / Inscrição</label>
                                              <p className="font-medium text-gray-700">{prop.document || prop.registrationNumber || '-'}</p>
                                          </div>
                                          <div>
                                              <label className="text-xs text-gray-500 uppercase font-semibold">Telefone</label>
                                              <div className="flex items-center gap-2">
                                                  <p className="font-medium text-lg">{prop.phone || 'Não informado'}</p>
                                              </div>
                                          </div>
                                          <div>
                                              <label className="text-xs text-gray-500 uppercase font-semibold">Email</label>
                                              <p className="font-medium text-gray-700">{prop.email || 'Não informado'}</p>
                                          </div>
                                          <div className="md:col-span-2">
                                              <label className="text-xs text-gray-500 uppercase font-semibold">Endereço Completo</label>
                                              <p className="font-medium text-gray-700">
                                                  {prop.address || prop.street} {prop.number && `, ${prop.number}`} {prop.neighborhood && `- ${prop.neighborhood}`}
                                                  <br/>
                                                  {prop.city && `${prop.city}/${prop.state}`} {prop.zipCode && `- CEP: ${prop.zipCode}`}
                                              </p>
                                          </div>
                                      </div>
                                  ) : (
                                    <p className="text-gray-500">Nenhuma propriedade vinculada.</p>
                                  )
                                })()}
                           </div>
                      )}
                  </div>
              )}
              {activeTab === 'attendances' && (
                  <div className="space-y-4">
                      {attendances.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                              <FileText className="h-12 w-12 mb-4 text-gray-300" />
                              <p>Nenhum atendimento registrado para este paciente.</p>
                          </div>
                      ) : (
                          attendances.map(att => {
                              // Ensure date parsing works correctly for DD/MM/YYYY or ISO strings
                              let parsedDate;
                              if (att.date.includes('/')) {
                                  const [d, m, y] = att.date.split('/');
                                  parsedDate = new Date(`${y}-${m}-${d}`);
                              } else {
                                  parsedDate = new Date(att.date);
                              }
                              
                              return (
                              <div 
                                key={att.id} 
                                onClick={() => setSelectedAttendance(att)} 
                                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all group"
                              >
                                  <div className="flex justify-between items-start mb-2">
                                      <div>
                                          <div className="flex items-center gap-2">
                                              <p className="font-bold text-gray-900 text-lg">{att.reason || 'Consulta Geral'}</p>
                                              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                                                {isNaN(parsedDate.getTime()) ? att.date : parsedDate.toLocaleDateString('pt-BR')}
                                              </span>
                                          </div>
                                          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                              <User className="h-3 w-3" /> Vet: {att.vetId}
                                          </p>
                                      </div>
                                      <div className="flex flex-col items-end gap-1">
                                          <span className={cn("px-3 py-1 rounded-full text-xs font-bold", att.status === 'finished' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700')}>
                                              {att.status === 'finished' ? 'Finalizado' : 'Em Andamento'}
                                          </span>
                                      </div>
                                  </div>
                                  
                                  {/* Resumo */}
                                  <div className="text-sm text-gray-500 line-clamp-2 border-t pt-2 mt-2">
                                      <span className="font-semibold text-gray-700">Diagnóstico: </span>
                                      {att.diagnosis || 'Não informado'}
                                  </div>
                                  
                                  <div className="mt-3 flex gap-2">
                                      {att.vitals?.weight && (
                                          <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded border">Peso: {att.vitals.weight}kg</span>
                                      )}
                                      {att.vitals?.temperature && (
                                          <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded border">Temp: {att.vitals.temperature}°C</span>
                                      )}
                                  </div>
                              </div>
                          )})
                      )}
                  </div>
              )}
              {activeTab !== 'overview' && activeTab !== 'contacts' && activeTab !== 'attendances' && (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  Conteúdo da aba {tabs.find(t => t.id === activeTab)?.label} em desenvolvimento.
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar (Actions) */}
          <div className="w-80 bg-white border-l p-6 space-y-6 hidden xl:block overflow-y-auto">
            <div className="space-y-3">
              <h3 className="font-bold text-gray-900">Ações Rápidas</h3>
              {patient.status !== 'Deceased' && patient.status !== 'Archived' && (
                  <>
                      <Button 
                        onClick={() => handleAction('odontogram')}
                        className="w-full bg-[#00BFA5] hover:bg-[#00BFA5]/90 text-white justify-start"
                      >
                        <Activity className="mr-2 h-4 w-4" /> Abrir Odontograma
                      </Button>
                      <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction('new-procedure');
                }}
                className="w-full bg-[#0B2C4D] hover:bg-[#0B2C4D]/90 text-white justify-start relative z-10 cursor-pointer"
              >
                        <Plus className="mr-2 h-4 w-4" /> Nova Consulta
                      </Button>
                  </>
              )}
              <Button 
                onClick={() => handleAction('pdf')}
                className="w-full bg-[#0B2C4D] hover:bg-[#0B2C4D]/90 text-white justify-start"
              >
                <Printer className="mr-2 h-4 w-4" /> Gerar PDF do Prontuário
              </Button>
              <Button 
                onClick={() => handleAction('email')}
                className="w-full bg-[#0B2C4D] hover:bg-[#0B2C4D]/90 text-white justify-start"
              >
                <Mail className="mr-2 h-4 w-4" /> Enviar ao Tutor (E-mail)
              </Button>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <h3 className="font-bold">Alertas</h3>
              </div>
              <div className="space-y-3">
                {(() => {
                    const patientAlerts = [];
                    
                    // Vaccine Expiry Alerts
                    const vaccines = mockDB.getAttendancesByPatientId(patient.id)
                        .flatMap(a => a.vaccines || [])
                        .filter(v => v.nextDoseDate);
                        
                    vaccines.forEach(v => {
                        const nextDose = new Date(v.nextDoseDate);
                        const diffDays = Math.ceil((nextDose.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        
                        if (diffDays < 0) {
                            patientAlerts.push({
                                date: nextDose.toLocaleDateString('pt-BR'),
                                text: `Vacina ${v.type} em atraso!`,
                                urgent: true
                            });
                        } else if (diffDays <= 30) {
                            patientAlerts.push({
                                date: nextDose.toLocaleDateString('pt-BR'),
                                text: `Reforço da vacina ${v.type} próximo.`,
                                urgent: false
                            });
                        }
                    });

                    // Return Visit Alerts
                    const scheduledReturns = mockDB.appointments.filter(a => a.patientId === patient.id && new Date(a.start) >= new Date());
                    scheduledReturns.forEach(r => {
                         patientAlerts.push({
                            date: new Date(r.start).toLocaleDateString('pt-BR'),
                            text: `${r.title} agendado para as ${new Date(r.start).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}.`,
                            urgent: false
                        });
                    });

                    if (patientAlerts.length === 0) {
                        return <p className="text-xs text-gray-500 italic">Nenhum alerta pendente no momento.</p>;
                    }

                    return patientAlerts.sort((a,b) => b.urgent ? 1 : -1).map((alert, idx) => (
                        <div key={idx} className={cn("pt-2", idx > 0 && "border-t border-red-100")}>
                          <p className={cn("text-xs font-bold", alert.urgent ? "text-red-700" : "text-gray-700")}>{alert.date}</p>
                          <p className="text-xs text-gray-600">{alert.text}</p>
                        </div>
                    ));
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Patient Modal */}
      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="Editar Dados Cadastrais" className="max-w-4xl">
          <div className="space-y-6 max-h-[70vh] overflow-y-auto p-1">
              {/* Patient Data */}
              <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Dados do Paciente</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="col-span-2">
                          <label className="text-sm font-medium">Nome</label>
                          <input 
                            className="w-full border rounded p-2"
                            value={editFormData.name || ''} 
                            onChange={e => setEditFormData({...editFormData, name: e.target.value})} 
                          />
                      </div>
                      <div>
                          <label className="text-sm font-medium">Espécie</label>
                          <input 
                            className="w-full border rounded p-2 bg-gray-50"
                            value={editFormData.species || ''} 
                            readOnly
                          />
                      </div>
                      <div>
                          <label className="text-sm font-medium">Raça</label>
                          {(() => {
                              const breeds = getBreedsBySpecies(editFormData.species || 'Equine');
                              if (breeds.length > 0) {
                                  const isInList = editFormData.breed && breeds.includes(editFormData.breed) && editFormData.breed !== 'Outra';
                                  const selectValue = !editFormData.breed ? '' : (isInList ? editFormData.breed : 'Outra');
                                  const showInput = selectValue === 'Outra';

                                  return (
                                      <div>
                                          <select 
                                              className="w-full border rounded p-2 mb-2"
                                              value={selectValue}
                                              onChange={e => {
                                                  const val = e.target.value;
                                                  if (val === 'Outra') {
                                                      setEditFormData({...editFormData, breed: ''});
                                                  } else {
                                                      setEditFormData({...editFormData, breed: val});
                                                  }
                                              }}
                                          >
                                              <option value="" disabled>Selecione...</option>
                                              {breeds.map(b => (
                                                  <option key={b} value={b}>{b}</option>
                                              ))}
                                          </select>
                                          {showInput && (
                                              <input 
                                                  className="w-full border rounded p-2"
                                                  placeholder="Digite a raça..."
                                                  value={editFormData.breed || ''} 
                                                  onChange={e => setEditFormData({...editFormData, breed: e.target.value})} 
                                                  autoFocus
                                              />
                                          )}
                                      </div>
                                  );
                              }
                              return (
                                  <input 
                                    className="w-full border rounded p-2"
                                    value={editFormData.breed || ''} 
                                    onChange={e => setEditFormData({...editFormData, breed: e.target.value})} 
                                  />
                              );
                          })()}
                      </div>
                      <div>
                          <label className="text-sm font-medium">Idade (anos)</label>
                          <input 
                            type="number"
                            className="w-full border rounded p-2"
                            value={editFormData.age || ''} 
                            onChange={e => setEditFormData({...editFormData, age: Number(e.target.value)})} 
                          />
                      </div>
                      <div className="col-span-2 md:col-span-4">
                          <label className="text-sm font-medium text-red-600 font-bold">Status do Paciente</label>
                          <select 
                            className={cn("w-full border rounded p-2 font-bold", editFormData.status === 'Deceased' ? "bg-red-50 text-red-700 border-red-200" : editFormData.status === 'Archived' ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-green-50 text-green-700 border-green-200")}
                            value={editFormData.status || 'Alive'} 
                            onChange={e => setEditFormData({...editFormData, status: e.target.value})} 
                          >
                              <option value="Alive">Vivo (Ativo)</option>
                              <option value="Deceased">Óbito</option>
                              <option value="Archived">Arquivado</option>
                          </select>
                          {editFormData.status !== 'Alive' && (
                              <p className="text-xs text-red-500 mt-1">Atenção: Ao salvar como Óbito ou Arquivado, a ficha do paciente ficará bloqueada para novos atendimentos.</p>
                          )}
                      </div>
                      <div>
                          <label className="text-sm font-medium">Sexo</label>
                          <select 
                            className="w-full border rounded p-2"
                            value={editFormData.gender || 'M'} 
                            onChange={e => setEditFormData({...editFormData, gender: e.target.value})} 
                          >
                              <option value="M">Macho</option>
                              <option value="F">Fêmea</option>
                          </select>
                      </div>
                      <div>
                          <label className="text-sm font-medium">Pelagem/Cor</label>
                          <input 
                            className="w-full border rounded p-2"
                            value={editFormData.coat || editFormData.color || ''} 
                            onChange={e => setEditFormData({...editFormData, coat: e.target.value, color: e.target.value})} 
                          />
                      </div>
                       <div className="flex items-center pt-6 gap-4">
                           <label className="flex items-center gap-2 cursor-pointer">
                               <input 
                                  type="checkbox"
                                  checked={editFormData.neutered || false}
                                  disabled={patient.neutered} // If already neutered, cannot un-neuter
                                  onChange={e => {
                                      const isNeutered = e.target.checked;
                                      setEditFormData({...editFormData, neutered: isNeutered, pregnant: isNeutered ? false : editFormData.pregnant})
                                  }}
                               />
                               <span className={cn("text-sm font-medium", patient.neutered ? "text-gray-400" : "")}>Castrado?</span>
                           </label>
                           {editFormData.gender === 'F' && editFormData.species !== 'Equine' && !editFormData.neutered && (
                               <label className="flex items-center gap-2 cursor-pointer">
                                   <input 
                                      type="checkbox"
                                      checked={editFormData.pregnant || false}
                                      onChange={e => setEditFormData({...editFormData, pregnant: e.target.checked})}
                                   />
                                   <span className="text-sm font-medium">Prenha?</span>
                               </label>
                           )}
                       </div>
                      <div className="col-span-2 md:col-span-4 border-t pt-4 mt-2">
                          <h4 className="text-sm font-bold text-gray-700 mb-2">Identificação Animal</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                  <label className="text-sm font-medium">RG Animal</label>
                                  <input 
                                    className="w-full border rounded p-2"
                                    placeholder="Ex: 12.345.678"
                                    value={editFormData.rg || ''} 
                                    onChange={e => setEditFormData({...editFormData, rg: e.target.value})} 
                                  />
                              </div>
                              <div>
                                  <label className="text-sm font-medium">Microchip</label>
                                  <input 
                                    className="w-full border rounded p-2"
                                    placeholder="Ex: 982000000000000"
                                    value={editFormData.microchip || ''} 
                                    onChange={e => setEditFormData({...editFormData, microchip: e.target.value})} 
                                  />
                              </div>
                          </div>
                      </div>

                      <div className="col-span-2 md:col-span-4 border-t pt-4 mt-2">
                          <h4 className="text-sm font-bold text-gray-700 mb-2">Comportamento</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                  <label className="text-sm font-medium">Temperamento</label>
                                  <input 
                                    className="w-full border rounded p-2"
                                    placeholder="Ex: Dócil, Agressivo, Assustado"
                                    value={editFormData.temperament || ''} 
                                    onChange={e => setEditFormData({...editFormData, temperament: e.target.value})} 
                                  />
                              </div>
                          </div>
                      </div>
                      
                      <div className="col-span-2 md:col-span-4 border-t pt-4 mt-2">
                          <h4 className="text-sm font-bold text-gray-700 mb-2">Convênio / Plano de Saúde</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                  <label className="text-sm font-medium">Nome do Plano</label>
                                  <input 
                                    className="w-full border rounded p-2"
                                    value={editFormData.healthPlan || ''} 
                                    onChange={e => setEditFormData({...editFormData, healthPlan: e.target.value})} 
                                  />
                              </div>
                              <div>
                                  <label className="text-sm font-medium">Carteirinha</label>
                                  <input 
                                    className="w-full border rounded p-2"
                                    value={editFormData.healthPlanNumber || ''} 
                                    onChange={e => setEditFormData({...editFormData, healthPlanNumber: e.target.value})} 
                                  />
                              </div>
                              <div>
                                  <label className="text-sm font-medium">Validade</label>
                                  <input 
                                    type="date"
                                    className="w-full border rounded p-2"
                                    value={editFormData.healthPlanExpiry || ''} 
                                    onChange={e => setEditFormData({...editFormData, healthPlanExpiry: e.target.value})} 
                                  />
                              </div>
                          </div>
                      </div>

                      {/* Clinical Alerts Edit Section */}
                      <div className="col-span-2 md:col-span-4 border-t pt-4 mt-2">
                          <h4 className="text-sm font-bold text-gray-700 mb-2">Alertas Clínicos</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                  <label className="text-sm font-medium text-red-600">Alergias (separar por vírgula)</label>
                                  <input 
                                    className="w-full border rounded p-2 border-red-100 bg-red-50"
                                    placeholder="Ex: Penicilina, Dipirona"
                                    value={editFormData.allergies ? editFormData.allergies.join(', ') : ''} 
                                    onChange={e => setEditFormData({...editFormData, allergies: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} 
                                  />
                              </div>
                              <div>
                                  <label className="text-sm font-medium text-red-600">Doenças Crônicas</label>
                                  <input 
                                    className="w-full border rounded p-2 border-red-100 bg-red-50"
                                    placeholder="Ex: Diabetes, Insuficiência Renal"
                                    value={editFormData.chronicDiseases ? editFormData.chronicDiseases.join(', ') : ''} 
                                    onChange={e => setEditFormData({...editFormData, chronicDiseases: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} 
                                  />
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Owner Data */}
              <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Dados do Tutor</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label className="text-sm font-medium">Nome Completo</label>
                          <input 
                            className="w-full border rounded p-2"
                            value={editFormData.ownerData?.name || ''} 
                            onChange={e => setEditFormData({...editFormData, ownerData: {...editFormData.ownerData, name: e.target.value}})} 
                          />
                      </div>
                       <div>
                          <label className="text-sm font-medium">CPF/Documento</label>
                          <input 
                            className="w-full border rounded p-2"
                            value={editFormData.ownerData?.document || ''} 
                            onChange={e => setEditFormData({...editFormData, ownerData: {...editFormData.ownerData, document: e.target.value}})} 
                          />
                      </div>
                      <div>
                          <label className="text-sm font-medium">Telefone</label>
                          <input 
                            className="w-full border rounded p-2"
                            value={editFormData.ownerData?.phone || ''} 
                            onChange={e => setEditFormData({...editFormData, ownerData: {...editFormData.ownerData, phone: e.target.value}})} 
                          />
                      </div>
                      <div>
                          <label className="text-sm font-medium">Email</label>
                          <input 
                            className="w-full border rounded p-2"
                            value={editFormData.ownerData?.email || ''} 
                            onChange={e => setEditFormData({...editFormData, ownerData: {...editFormData.ownerData, email: e.target.value}})} 
                          />
                      </div>
                      <div className="md:col-span-2">
                          <label className="text-sm font-medium">Endereço Completo</label>
                          <input 
                            className="w-full border rounded p-2"
                            value={editFormData.ownerData?.address || ''} 
                            onChange={e => setEditFormData({...editFormData, ownerData: {...editFormData.ownerData, address: e.target.value}})} 
                          />
                      </div>
                      <div>
                          <label className="text-sm font-medium">Telefone Secundário</label>
                          <input 
                            className="w-full border rounded p-2"
                            value={editFormData.ownerData?.secondaryPhone || ''} 
                            onChange={e => setEditFormData({...editFormData, ownerData: {...editFormData.ownerData, secondaryPhone: e.target.value}})} 
                          />
                      </div>
                  </div>
              </div>

              {/* Property Data (Equine Only) */}
              {editFormData.species === 'Equine' && (
                  <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Dados da Propriedade</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                              <label className="text-sm font-medium">Nome da Propriedade</label>
                              <input 
                                className="w-full border rounded p-2"
                                value={editFormData.propertyData?.name || ''} 
                                onChange={e => setEditFormData({...editFormData, propertyData: {...editFormData.propertyData, name: e.target.value}})} 
                              />
                          </div>
                          <div>
                              <label className="text-sm font-medium">CNPJ/Inscrição</label>
                              <input 
                                className="w-full border rounded p-2"
                                value={editFormData.propertyData?.document || editFormData.propertyData?.registrationNumber || ''} 
                                onChange={e => setEditFormData({...editFormData, propertyData: {...editFormData.propertyData, document: e.target.value}})} 
                              />
                          </div>
                          <div>
                              <label className="text-sm font-medium">Telefone da Propriedade</label>
                              <input 
                                className="w-full border rounded p-2"
                                value={editFormData.propertyData?.phone || ''} 
                                onChange={e => setEditFormData({...editFormData, propertyData: {...editFormData.propertyData, phone: e.target.value}})} 
                              />
                          </div>
                          <div>
                              <label className="text-sm font-medium">Email da Propriedade</label>
                              <input 
                                className="w-full border rounded p-2"
                                value={editFormData.propertyData?.email || ''} 
                                onChange={e => setEditFormData({...editFormData, propertyData: {...editFormData.propertyData, email: e.target.value}})} 
                              />
                          </div>
                          <div className="md:col-span-2">
                              <label className="text-sm font-medium">Endereço da Propriedade</label>
                              <input 
                                className="w-full border rounded p-2"
                                value={editFormData.propertyData?.address || ''} 
                                onChange={e => setEditFormData({...editFormData, propertyData: {...editFormData.propertyData, address: e.target.value}})} 
                              />
                          </div>
                      </div>
                  </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
                  <Button onClick={handleSaveEdit} className="bg-[#0B2C4D] text-white">Salvar Alterações</Button>
              </div>
          </div>
      </Modal>

      {/* Attendance Details Modal */}
      <Modal isOpen={!!selectedAttendance} onClose={() => { setSelectedAttendance(null); setIsEditingAttendance(false); }} title="Detalhes do Atendimento" className="max-w-4xl">
          {selectedAttendance && (
              <div className="space-y-6 max-h-[70vh] overflow-y-auto p-2">
                  {/* Header Status */}
                  <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                      <div>
                          <h3 className="font-bold text-lg">{selectedAttendance.reason || 'Consulta Geral'}</h3>
                          <p className="text-sm text-gray-500">{new Date(selectedAttendance.date).toLocaleDateString()} - {new Date(selectedAttendance.date).toLocaleTimeString()}</p>
                      </div>
                      <div className="text-right">
                          <span className={cn("px-3 py-1 rounded-full text-xs font-bold block mb-1", selectedAttendance.status === 'finished' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700')}>
                              {selectedAttendance.status === 'finished' ? 'Finalizado' : 'Em Andamento'}
                          </span>
                          <p className="text-xs text-gray-500">Vet: {selectedAttendance.vetId}</p>
                      </div>
                  </div>

                  {/* Content - Read Only or Edit Mode */}
                  <div className="space-y-4">
                      {/* Anamnese & Diagnosis */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white border rounded-lg p-4">
                              <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Anamnese</label>
                              {isEditingAttendance ? (
                                  <textarea 
                                      className="w-full border rounded p-2 text-sm" 
                                      rows={6}
                                      defaultValue={selectedAttendance.anamnesis}
                                      id="edit-anamnesis"
                                  />
                              ) : (
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedAttendance.anamnesis || '-'}</p>
                              )}
                          </div>
                          <div className="bg-white border rounded-lg p-4">
                              <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Diagnóstico</label>
                              {isEditingAttendance ? (
                                  <textarea 
                                      className="w-full border rounded p-2 text-sm" 
                                      rows={6}
                                      defaultValue={selectedAttendance.diagnosis}
                                      id="edit-diagnosis"
                                  />
                              ) : (
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedAttendance.diagnosis || '-'}</p>
                              )}
                          </div>
                      </div>

                      {/* Vitals */}
                      <div className="bg-white border rounded-lg p-4">
                          <label className="text-xs font-bold text-gray-500 uppercase mb-4 block flex items-center gap-2">
                              <Activity className="h-4 w-4" /> Sinais Vitais
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                               <div>
                                  <span className="text-xs text-gray-500 block">Peso (kg)</span>
                                  {isEditingAttendance ? (
                                      <input type="number" defaultValue={selectedAttendance.vitals?.weight} className="border rounded w-full p-1" id="edit-weight" />
                                  ) : (
                                      <span className="font-bold">{selectedAttendance.vitals?.weight || '-'}</span>
                                  )}
                               </div>
                               <div>
                                  <span className="text-xs text-gray-500 block">Temp (°C)</span>
                                  {isEditingAttendance ? (
                                      <input type="number" defaultValue={selectedAttendance.vitals?.temperature} className="border rounded w-full p-1" id="edit-temp" />
                                  ) : (
                                      <span className="font-bold">{selectedAttendance.vitals?.temperature || '-'}</span>
                                  )}
                               </div>
                               <div>
                                  <span className="text-xs text-gray-500 block">Freq. Cardíaca</span>
                                  {isEditingAttendance ? (
                                      <input type="number" defaultValue={selectedAttendance.vitals?.heartRate} className="border rounded w-full p-1" id="edit-hr" />
                                  ) : (
                                      <span className="font-bold">{selectedAttendance.vitals?.heartRate || '-'}</span>
                                  )}
                               </div>
                               <div>
                                  <span className="text-xs text-gray-500 block">Freq. Resp.</span>
                                  {isEditingAttendance ? (
                                      <input type="number" defaultValue={selectedAttendance.vitals?.respiratoryRate} className="border rounded w-full p-1" id="edit-rr" />
                                  ) : (
                                      <span className="font-bold">{selectedAttendance.vitals?.respiratoryRate || '-'}</span>
                                  )}
                               </div>
                               <div>
                                  <span className="text-xs text-gray-500 block">TPC (seg)</span>
                                  {isEditingAttendance ? (
                                      <input type="number" defaultValue={selectedAttendance.vitals?.tpc} className="border rounded w-full p-1" id="edit-tpc" />
                                  ) : (
                                      <span className="font-bold">{selectedAttendance.vitals?.tpc || '-'}</span>
                                  )}
                               </div>
                               <div>
                                  <span className="text-xs text-gray-500 block">Pressão</span>
                                  {isEditingAttendance ? (
                                      <div className="flex gap-1 items-center">
                                          <input type="number" defaultValue={selectedAttendance.vitals?.pressureSystolic} className="border rounded w-12 p-1 text-xs" id="edit-bp-sys" placeholder="Sys" />
                                          /
                                          <input type="number" defaultValue={selectedAttendance.vitals?.pressureDiastolic} className="border rounded w-12 p-1 text-xs" id="edit-bp-dia" placeholder="Dia" />
                                      </div>
                                  ) : (
                                      <span className="font-bold">
                                          {selectedAttendance.vitals?.pressureSystolic ? `${selectedAttendance.vitals.pressureSystolic}/${selectedAttendance.vitals.pressureDiastolic}` : '-'}
                                      </span>
                                  )}
                               </div>
                          </div>

                          {/* Equine Specific Vitals Display */}
                          {patient.species === 'Equine' && selectedAttendance.vitals?.motility && (
                              <div className="mt-4 pt-4 border-t">
                                  <span className="text-xs font-bold text-gray-500 uppercase block mb-2">Motilidade Intestinal (Equinos)</span>
                                  <div className="grid grid-cols-4 gap-2 text-center text-sm">
                                      <div className="bg-gray-50 p-2 rounded border">
                                          <span className="block text-xs text-gray-400">Sup. Esq.</span>
                                          <span className="font-bold">{selectedAttendance.vitals.motility.upperLeft}</span>
                                      </div>
                                      <div className="bg-gray-50 p-2 rounded border">
                                          <span className="block text-xs text-gray-400">Sup. Dir.</span>
                                          <span className="font-bold">{selectedAttendance.vitals.motility.upperRight}</span>
                                      </div>
                                      <div className="bg-gray-50 p-2 rounded border">
                                          <span className="block text-xs text-gray-400">Inf. Esq.</span>
                                          <span className="font-bold">{selectedAttendance.vitals.motility.lowerLeft}</span>
                                      </div>
                                      <div className="bg-gray-50 p-2 rounded border">
                                          <span className="block text-xs text-gray-400">Inf. Dir.</span>
                                          <span className="font-bold">{selectedAttendance.vitals.motility.lowerRight}</span>
                                      </div>
                                  </div>
                              </div>
                          )}
                      </div>
                      
                      {/* Prescriptions / Treatments (ReadOnly for now in edit mode as they are complex) */}
                      <div className="bg-white border rounded-lg p-4">
                          <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Prescrição / Tratamento</label>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedAttendance.prescription || 'Nenhuma prescrição registrada.'}</p>
                      </div>

                      {/* Consumed Items (ReadOnly) */}
                      {selectedAttendance.consumedItems?.length > 0 && (
                          <div className="bg-gray-50 border rounded-lg p-4">
                              <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Materiais Consumidos</label>
                              <ul className="text-sm space-y-1">
                                  {selectedAttendance.consumedItems.map((item, idx) => (
                                      <li key={idx} className="flex justify-between text-gray-600">
                                          <span>{item.itemName}</span>
                                          <span>{item.quantityUsed} {item.unit}</span>
                                      </li>
                                  ))}
                              </ul>
                          </div>
                      )}

                      {/* Vaccines (ReadOnly) */}
                      {selectedAttendance.vaccines?.length > 0 && (
                          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                              <label className="text-xs font-bold text-blue-700 uppercase mb-2 block flex items-center gap-2">
                                  <Syringe className="h-3 w-3" /> Vacinas Aplicadas
                              </label>
                              <ul className="text-sm space-y-2">
                                  {selectedAttendance.vaccines.map((vac, idx) => (
                                      <li key={idx} className="bg-white p-2 rounded border border-blue-100">
                                          <div className="flex justify-between font-medium text-blue-900">
                                              <span>{vac.name}</span>
                                              <span>{vac.applicationDate}</span>
                                          </div>
                                          <div className="text-xs text-blue-600 flex gap-2 mt-1">
                                              <span>Lote: {vac.batch || '-'}</span>
                                              <span>Val: {vac.expiryDate || '-'}</span>
                                          </div>
                                      </li>
                                  ))}
                              </ul>
                          </div>
                      )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t">
                      {isEditingAttendance ? (
                          <>
                              <Button variant="outline" onClick={() => setIsEditingAttendance(false)}>Cancelar Edição</Button>
                              <Button onClick={() => {
                                  // Collect data and save
                                  const updates = {
                                      anamnesis: document.getElementById('edit-anamnesis').value,
                                      diagnosis: document.getElementById('edit-diagnosis').value,
                                      vitals: {
                                          ...selectedAttendance.vitals,
                                          weight: Number(document.getElementById('edit-weight').value),
                                          temperature: Number(document.getElementById('edit-temp').value),
                                          heartRate: Number(document.getElementById('edit-hr').value),
                                          respiratoryRate: Number(document.getElementById('edit-rr').value),
                                          tpc: Number(document.getElementById('edit-tpc').value),
                                          pressureSystolic: Number(document.getElementById('edit-bp-sys').value),
                                          pressureDiastolic: Number(document.getElementById('edit-bp-dia').value),
                                      }
                                  };
                                  mockDB.updateAttendance(selectedAttendance.id, updates, 'Current Vet');
                                  
                                  // Update Patient Weight History if weight changed
                                  if (updates.vitals.weight && updates.vitals.weight !== selectedAttendance.vitals?.weight) {
                                      mockDB.updatePatient(selectedAttendance.patientId, { weight: updates.vitals.weight });
                                      // Update local patient prop for immediate feedback
                                      patient.weight = updates.vitals.weight;
                                  }

                                  // Update local list
                                  setAttendances(prev => prev.map(a => a.id === selectedAttendance.id ? {...a, ...updates} : a));
                                  setSelectedAttendance(prev => ({...prev, ...updates}));
                                  setIsEditingAttendance(false);
                                  alert('Atendimento atualizado com sucesso!');
                              }} className="bg-blue-600 text-white">Salvar Alterações</Button>
                          </>
                      ) : (
                          <>
                              <Button variant="outline" onClick={() => { setSelectedAttendance(null); setIsEditingAttendance(false); }}>Fechar</Button>
                              <Button onClick={() => setIsEditingAttendance(true)} className="bg-[#0B2C4D] text-white">
                                  <Edit2 className="h-4 w-4 mr-2" /> Editar Atendimento
                              </Button>
                          </>
                      )}
                  </div>
              </div>
          )}
      </Modal>

      {/* Change Owner Modal */}
      <Modal isOpen={isChangingOwner} onClose={() => { setIsChangingOwner(false); setNewOwner(null); }} title="Alterar Tutor">
          <div className="space-y-4 p-1">
              <p className="text-sm text-gray-500">Selecione o novo tutor para este paciente.</p>
              <Autocomplete 
                  options={owners.map(o => ({ id: o.id, label: o.name }))}
                  onSelect={(opt) => {
                      const o = owners.find(owner => owner.id === opt.id)
                      setNewOwner(o || null)
                  }}
                  placeholder="Buscar novo tutor..."
                  value={newOwner?.name}
              />
              
              <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm uppercase font-bold tracking-widest">
                      <span className="bg-white px-4 text-gray-400">Ou Cadastre Novo</span>
                  </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                      className="border rounded p-2" 
                      placeholder="Nome Completo"
                      onChange={e => setNewOwner(prev => ({...prev, name: e.target.value, isNew: true}))}
                  />
                  <input 
                      className="border rounded p-2" 
                      placeholder="Telefone"
                      onChange={e => setNewOwner(prev => ({...prev, phone: e.target.value, isNew: true}))}
                  />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setIsChangingOwner(false)}>Cancelar</Button>
                  <Button onClick={() => {
                      if (newOwner?.isNew) {
                          if (!newOwner.name || !newOwner.phone) {
                              alert('Preencha nome e telefone do novo tutor.');
                              return;
                          }
                          const created = mockDB.createOwner(newOwner);
                          setOwners(mockDB.getOwners());
                          setNewOwner(created);
                          
                          patient.ownerId = created.id;
                          patient.ownerName = created.name;
                          alert(`Tutor cadastrado e alterado para: ${created.name}`);
                      } else {
                          handleSaveOwnerChange();
                      }
                      setIsChangingOwner(false);
                      setNewOwner(null);
                  }} disabled={!newOwner?.name}>Salvar Alteração</Button>
              </div>
          </div>
      </Modal>

      {/* Change Property Modal */}
      <Modal isOpen={isChangingProperty} onClose={() => { setIsChangingProperty(false); setNewProperty(null); }} title="Alterar Propriedade">
          <div className="space-y-4 p-1">
              <p className="text-sm text-gray-500">Selecione a nova propriedade para este paciente.</p>
              <Autocomplete 
                  options={properties.map(p => ({ id: p.id, label: `${p.name} - ${p.city}` }))}
                  onSelect={(opt) => {
                      const p = properties.find(prop => prop.id === opt.id)
                      setNewProperty(p || null)
                  }}
                  placeholder="Buscar nova propriedade..."
                  value={newProperty?.name}
              />

              <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm uppercase font-bold tracking-widest">
                      <span className="bg-white px-4 text-gray-400">Ou Cadastre Nova</span>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                      className="border rounded p-2 md:col-span-2" 
                      placeholder="Nome da Propriedade"
                      onChange={e => setNewProperty(prev => ({...prev, name: e.target.value, isNew: true}))}
                  />
                  <input 
                      className="border rounded p-2" 
                      placeholder="Cidade"
                      onChange={e => setNewProperty(prev => ({...prev, city: e.target.value, isNew: true}))}
                  />
                  <input 
                      className="border rounded p-2" 
                      placeholder="Estado (UF)"
                      maxLength={2}
                      onChange={e => setNewProperty(prev => ({...prev, state: e.target.value, isNew: true}))}
                  />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setIsChangingProperty(false)}>Cancelar</Button>
                  <Button onClick={() => {
                      if (newProperty?.isNew) {
                          if (!newProperty.name || !newProperty.city || !newProperty.state) {
                              alert('Preencha nome, cidade e estado da nova propriedade.');
                              return;
                          }
                          const created = mockDB.createProperty(newProperty);
                          setProperties(mockDB.getAllProperties());
                          setNewProperty(created);
                          
                          patient.propertyId = created.id;
                          alert(`Propriedade cadastrada e alterada para: ${created.name}`);
                      } else {
                          handleSavePropertyChange();
                      }
                      setIsChangingProperty(false);
                      setNewProperty(null);
                  }} disabled={!newProperty?.name}>Salvar Alteração</Button>
              </div>
          </div>
      </Modal>
    </div>
  )
}