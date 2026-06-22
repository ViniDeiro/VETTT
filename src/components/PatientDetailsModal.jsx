import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { Autocomplete } from '../shared/Autocomplete'
import { EmailInput } from './ui/EmailInput'
import { supabaseDataService } from '../services/supabaseDataService'
import { getBreedsBySpecies } from '../domain/breeds'
import { formatPhone, formatDocument, formatCEP } from '../lib/formatters'
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
  Home,
  Trash2,
  Wallet,
  Syringe
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function PatientDetailsModal({ isOpen, onClose, patient, onPatientUpdated }) {
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

  const buildStructuredAddress = (data) => {
    if (!data) return ''
    if (data.street) {
      return [data.street, data.number ? `nº ${data.number}` : '', data.neighborhood]
        .filter(Boolean)
        .join(', ')
    }
    return data.address || ''
  }

  const formatAddressDisplay = (data) => {
    if (!data) return { line1: 'Não informado', line2: '' }

    const line1 = data.street
      ? `${data.street}${data.number ? `, ${data.number}` : ''}${data.neighborhood ? ` - ${data.neighborhood}` : ''}`
      : (data.address || 'Não informado')

    const cityState = data.city && data.state
      ? `${data.city}/${data.state}`
      : (data.city || data.state || '')

    const line2 = [cityState, data.zipCode ? `CEP: ${data.zipCode}` : '']
      .filter(Boolean)
      .join(' - ')

    return { line1, line2 }
  }

  const formatPatientAge = (patientData) => {
    if (patientData?.birthDate) {
      const birthDate = new Date(`${patientData.birthDate}T00:00:00`)
      const today = new Date()

      if (!Number.isNaN(birthDate.getTime())) {
        let years = today.getFullYear() - birthDate.getFullYear()
        let months = today.getMonth() - birthDate.getMonth()

        if (today.getDate() < birthDate.getDate()) {
          months -= 1
        }

        if (months < 0) {
          years -= 1
          months += 12
        }

        if (years > 0 && months > 0) return `${years} anos e ${months} meses`
        if (years > 0) return `${years} anos`
        return `${Math.max(months, 0)} meses`
      }
    }

    const years = Number(patientData?.age || 0)
    const months = Number(patientData?.ageMonths || 0)

    if (years > 0 && months > 0) return `${years} anos e ${months} meses`
    if (years > 0) return `${years} anos`
    if (months > 0) return `${months} meses`
    return '-'
  }

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(value || 0))
  
  const parseTimelineDate = (value) => {
    if (!value) return new Date(0)
    if (value.includes('/')) {
      const [day, month, year] = value.split('/')
      return new Date(`${year}-${month}-${day}T00:00:00`)
    }
    return new Date(value)
  }

  const handleCepSearch = async (cep, type) => {
    const cleanCep = (cep || '').replace(/\D/g, '')
    if (cleanCep.length !== 8) return

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data = await response.json()
      if (data.erro) return

      if (type === 'owner') {
        setNewOwner(prev => ({
          ...(prev || {}),
          street: data.logradouro || '',
          address: data.logradouro || '',
          neighborhood: data.bairro || '',
          city: data.localidade || '',
          state: data.uf || '',
          isNew: true
        }))
      } else {
        setNewProperty(prev => ({
          ...(prev || {}),
          street: data.logradouro || '',
          address: data.logradouro || '',
          neighborhood: data.bairro || '',
          city: data.localidade || '',
          state: data.uf || '',
          isNew: true
        }))
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
    }
  }

  useEffect(() => {
    if (isOpen) {
        const loadData = async () => {
            try {
                const [loadedOwners, loadedProperties] = await Promise.all([
                    supabaseDataService.getOwners(),
                    supabaseDataService.getProperties()
                ])
                setOwners(loadedOwners)
                setProperties(loadedProperties)
                if (patient) {
                    const owner = loadedOwners.find(o => o.id === patient.ownerId);
                    const prop = loadedProperties.find(p => p.id === patient.propertyId);
                    setEditFormData({
                        ...patient,
                        ownerData: owner || {},
                        propertyData: prop || {}
                    });
                    // Attendances - will be loaded from Supabase when service method is ready
                    setAttendances([]);
                }
            } catch (error) {
                console.error('Erro ao carregar dados do modal:', error)
            }
        }
        loadData()
    }
  }, [isOpen, patient])

  const handlePhotoUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = async () => {
              const base64 = reader.result;
              try {
                  await supabaseDataService.updatePatient(patient.id, { photoUrl: base64 });
                  patient.photoUrl = base64; 
                  setEditFormData({...editFormData, photoUrl: base64}); 
              } catch (error) {
                  console.error('Erro ao atualizar foto:', error)
              }
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSaveEdit = async () => {
    const { ownerData, propertyData, ...patientUpdates } = editFormData;
    let normalizedOwnerData = ownerData;
    if (ownerData) {
      const originalOwner = owners.find(o => o.id === patient.ownerId);
      const addressChanged = !originalOwner || ownerData.address !== originalOwner.address;
      
      normalizedOwnerData = { ...ownerData };
      if (addressChanged) {
        normalizedOwnerData.street = null;
        normalizedOwnerData.number = null;
        normalizedOwnerData.neighborhood = null;
        normalizedOwnerData.address = ownerData.address || '';
      } else {
        normalizedOwnerData.address = buildStructuredAddress(ownerData) || ownerData.address || '';
      }
    }
    const normalizedPropertyData = propertyData
      ? { ...propertyData, address: buildStructuredAddress(propertyData) || propertyData.address || '' }
      : propertyData
    
    if (typeof patientUpdates.allergies === 'string') {
        patientUpdates.allergies = patientUpdates.allergies.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (typeof patientUpdates.chronicDiseases === 'string') {
        patientUpdates.chronicDiseases = patientUpdates.chronicDiseases.split(',').map(s => s.trim()).filter(Boolean);
    }

    try {
      await supabaseDataService.updatePatient(patient.id, patientUpdates);
      
      if (patient.ownerId && normalizedOwnerData) {
          await supabaseDataService.updateOwner(patient.ownerId, normalizedOwnerData);
      }

      if (patient.propertyId && normalizedPropertyData && patient.species === 'Equine') {
          await supabaseDataService.updateProperty(patient.propertyId, normalizedPropertyData);
      }

      Object.assign(patient, patientUpdates);
      if(ownerData) patient.ownerName = ownerData.name;
      onPatientUpdated?.({ ...patient });

      setIsEditing(false);
      alert('Dados atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert(`Erro ao salvar: ${error?.message || error}`)
    }
  };

  if (!patient) return null

  const handleSaveOwnerChange = async () => {
      if (newOwner) {
          try {
              await supabaseDataService.updatePatient(patient.id, { ownerId: newOwner.id });
              patient.ownerId = newOwner.id;
              patient.ownerName = newOwner.name;
              onPatientUpdated?.({ ...patient, ownerId: newOwner.id, ownerName: newOwner.name });
              alert(`Tutor alterado para: ${newOwner.name}`);
          } catch (error) {
              console.error('Erro ao alterar tutor:', error)
              alert(`Erro: ${error?.message || error}`)
          }
          setIsChangingOwner(false);
          setNewOwner(null);
      }
  }

  const handleSavePropertyChange = async () => {
      if (newProperty) {
          try {
              await supabaseDataService.updatePatient(patient.id, { propertyId: newProperty.id });
              patient.propertyId = newProperty.id;
              onPatientUpdated?.({ ...patient, propertyId: newProperty.id });
              alert(`Propriedade alterada para: ${newProperty.name}`);
          } catch (error) {
              console.error('Erro ao alterar propriedade:', error)
              alert(`Erro: ${error?.message || error}`)
          }
          setIsChangingProperty(false);
          setNewProperty(null);
      }
  }

  const tabs = [
    { id: 'overview', label: 'Visão Geral' },
    { id: 'contacts', label: 'Contato/Convenio' },
    { id: 'financial', label: 'Financeiro' },
    ...(patient.species === 'Equine' ? [{ id: 'property', label: 'Propriedade' }] : []),
    { id: 'attendances', label: 'Histórico de Atendimentos' },
    { id: 'odontogram', label: 'Odontograma' },
    { id: 'treatments', label: 'Tratamentos' },
    { id: 'exams', label: 'Exames' },
    { id: 'photos', label: 'Fotos' },
    { id: 'files', label: 'Arquivos' },
    { id: 'notes', label: 'Notas' },
  ]

  const renderPropertySection = () => {
    const property = properties.find(p => p.id === patient.propertyId)

    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4 border-b pb-2">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Home className="h-5 w-5 text-orange-600" />
            Dados da Propriedade
          </h3>
          {patient.status !== 'Deceased' && patient.status !== 'Archived' && (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsChangingProperty(true)} className="text-xs">
                <Edit2 className="h-3 w-3 mr-1" /> Alterar Propriedade
              </Button>
            </div>
          )}
        </div>

        {property ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs text-gray-500 uppercase font-semibold">Nome da Propriedade</label>
              <p className="font-medium text-lg">{property.name}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-semibold">Tipo da Propriedade</label>
              <p className="font-medium text-gray-700">{property.type || 'Não informado'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-semibold">CNPJ / Inscrição</label>
              <p className="font-medium text-gray-700">{property.document || property.registrationNumber || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-semibold">Telefone</label>
              <div className="flex items-center gap-2">
                <p className="font-medium text-lg">{property.phone || 'Não informado'}</p>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-semibold">Email</label>
              <p className="font-medium text-gray-700">{property.email || 'Não informado'}</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500 uppercase font-semibold">Endereço Completo</label>
              {(() => {
                const formattedAddress = formatAddressDisplay(property)
                return (
                  <p className="font-medium text-gray-700">
                    {formattedAddress.line1}
                    {formattedAddress.line2 && (
                      <>
                        <br />
                        {formattedAddress.line2}
                      </>
                    )}
                  </p>
                )
              })()}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <Home className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-600">Nenhuma propriedade vinculada a este paciente.</p>
            <p className="text-sm text-gray-500 mt-1">Vincule uma propriedade para exibir os dados completos nesta ficha.</p>
          </div>
        )}
      </div>
    )
  }

  const patientFinancialRecords = []

  const patientReceivables = []

  const totalGrossRevenue = patientFinancialRecords.reduce((total, record) => total + (record.grossAmount || 0), 0)
  const totalOperationalCost = patientFinancialRecords.reduce((total, record) => total + (record.totalCost || 0), 0)
  const totalGrossProfit = patientFinancialRecords.reduce((total, record) => total + (record.grossProfit || 0), 0)
  const totalPaid = patientReceivables
    .filter(receivable => receivable.status === 'paid')
    .reduce((total, receivable) => total + (receivable.amount || 0), 0)
  const totalPending = patientReceivables
    .filter(receivable => receivable.status !== 'paid')
    .reduce((total, receivable) => total + (receivable.amount || 0), 0)
  const averageTicket = patientFinancialRecords.length > 0 ? totalGrossRevenue / patientFinancialRecords.length : 0

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
                      const nextAppt = null; // TODO: load from supabaseDataService.getAppointments()
                      if (nextAppt) {
                          return <span>Próxima Consulta: {new Date(nextAppt.start).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>;
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
                    <span className="font-medium">
                        {patient.species === 'Equine' 
                            ? (patient.gender === 'F' ? 'Égua' : (patient.neutered ? 'Castrado' : 'Garanhão'))
                            : (patient.gender === 'M' ? 'Macho' : 'Fêmea')
                        }
                    </span>
                    <span>, {formatPatientAge(patient)}</span>
                  </div>
                  {patient.rg && (
                    <>
                      <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-blue-700">RGA: {patient.rg}</span>
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
                {patient.species !== 'Equine' && patient.size && (
                  <>
                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                          Porte: {patient.size === 'Small' ? 'Pequeno' : patient.size === 'Medium' ? 'Médio' : 'Grande'}
                      </span>
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
                {patient.neutered && patient.species !== 'Equine' && (
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
                        const lastAttendance = attendances
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
                        const lastAnamnesis = attendances
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
                        const allProcedures = attendances
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
                        const allExams = attendances
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
                                              {(() => {
                                                  const formattedAddress = formatAddressDisplay(owner)
                                                  return (
                                                    <p className="font-medium text-gray-700">
                                                        {formattedAddress.line1}
                                                        {formattedAddress.line2 && (
                                                          <>
                                                            <br/>
                                                            {formattedAddress.line2}
                                                          </>
                                                        )}
                                                    </p>
                                                  )
                                              })()}
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

                  </div>
              )}
              {activeTab === 'financial' && (
                  <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                              <p className="text-xs text-gray-500 uppercase font-semibold">Receita Total</p>
                              <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(totalGrossRevenue)}</p>
                              <p className="text-xs text-gray-500 mt-2">{patientFinancialRecords.length} atendimento(s) com lançamento</p>
                          </div>
                          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                              <p className="text-xs text-gray-500 uppercase font-semibold">Custo Operacional</p>
                              <p className="text-2xl font-bold text-amber-600 mt-2">{formatCurrency(totalOperationalCost)}</p>
                              <p className="text-xs text-gray-500 mt-2">Soma dos insumos e custos vinculados</p>
                          </div>
                          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                              <p className="text-xs text-gray-500 uppercase font-semibold">Lucro Bruto</p>
                              <p className="text-2xl font-bold text-emerald-600 mt-2">{formatCurrency(totalGrossProfit)}</p>
                              <p className="text-xs text-gray-500 mt-2">Margem consolidada do paciente</p>
                          </div>
                          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                              <p className="text-xs text-gray-500 uppercase font-semibold">Recebido</p>
                              <p className="text-2xl font-bold text-teal-600 mt-2">{formatCurrency(totalPaid)}</p>
                              <p className="text-xs text-gray-500 mt-2">Baixado em contas a receber</p>
                          </div>
                          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                              <p className="text-xs text-gray-500 uppercase font-semibold">Pendente</p>
                              <p className="text-2xl font-bold text-rose-600 mt-2">{formatCurrency(totalPending)}</p>
                              <p className="text-xs text-gray-500 mt-2">Ticket médio: {formatCurrency(averageTicket)}</p>
                          </div>
                      </div>

                      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                          <div className="flex items-center gap-2 mb-4 border-b pb-2">
                              <Wallet className="h-5 w-5 text-emerald-600" />
                              <h3 className="font-bold text-gray-900">Histórico Financeiro do Paciente</h3>
                          </div>

                          {patientFinancialRecords.length === 0 ? (
                              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
                                  <Wallet className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                                  <p className="font-medium text-gray-600">Nenhum lançamento financeiro encontrado para este paciente.</p>
                                  <p className="text-sm text-gray-500 mt-1">Os registros aparecem aqui quando um atendimento é finalizado e gera cobrança automática.</p>
                              </div>
                          ) : (
                              <div className="space-y-4">
                                  {patientFinancialRecords.map(record => {
                                      const linkedReceivable = patientReceivables.find(receivable => receivable.attendanceId === record.attendanceId)
                                      const status = linkedReceivable?.status || record.paymentStatus
                                      const statusLabel = status === 'paid'
                                        ? 'Recebido'
                                        : status === 'overdue'
                                          ? 'Em atraso'
                                          : 'Pendente'

                                      return (
                                          <div key={record.id} className="rounded-xl border border-gray-100 p-4 hover:border-emerald-200 transition-colors">
                                              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                                  <div className="space-y-2">
                                                      <div className="flex flex-wrap items-center gap-2">
                                                          <p className="font-semibold text-gray-900">{record.description}</p>
                                                          <span className={cn(
                                                              'px-2.5 py-1 rounded-full text-xs font-bold',
                                                              status === 'paid'
                                                                ? 'bg-emerald-100 text-emerald-700'
                                                                : status === 'overdue'
                                                                  ? 'bg-rose-100 text-rose-700'
                                                                  : 'bg-amber-100 text-amber-700'
                                                          )}>
                                                              {statusLabel}
                                                          </span>
                                                      </div>
                                                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                                                          <span>Data: {parseTimelineDate(record.date).toLocaleDateString('pt-BR')}</span>
                                                          <span>Profissional: {record.professionalName || 'Não informado'}</span>
                                                          <span>Procedimentos: {record.procedureCount || 0}</span>
                                                          <span>Margem: {(record.marginPercent || 0).toFixed(1)}%</span>
                                                      </div>
                                                      {linkedReceivable && (
                                                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                                                              <span>Vencimento: {parseTimelineDate(linkedReceivable.dueDate).toLocaleDateString('pt-BR')}</span>
                                                              <span>Pagamento: {linkedReceivable.paymentDate ? parseTimelineDate(linkedReceivable.paymentDate).toLocaleDateString('pt-BR') : 'Aguardando'}</span>
                                                              <span>Forma: {linkedReceivable.paymentMethod || 'Não definida'}</span>
                                                          </div>
                                                      )}
                                                  </div>

                                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 min-w-full lg:min-w-[430px]">
                                                      <div className="bg-gray-50 rounded-lg p-3">
                                                          <p className="text-[11px] uppercase font-semibold text-gray-500">Valor Bruto</p>
                                                          <p className="font-bold text-gray-900 mt-1">{formatCurrency(record.grossAmount)}</p>
                                                      </div>
                                                      <div className="bg-amber-50 rounded-lg p-3">
                                                          <p className="text-[11px] uppercase font-semibold text-amber-700">Custo</p>
                                                          <p className="font-bold text-amber-700 mt-1">{formatCurrency(record.totalCost)}</p>
                                                      </div>
                                                      <div className="bg-emerald-50 rounded-lg p-3">
                                                          <p className="text-[11px] uppercase font-semibold text-emerald-700">Lucro</p>
                                                          <p className="font-bold text-emerald-700 mt-1">{formatCurrency(record.grossProfit)}</p>
                                                      </div>
                                                      <div className="bg-teal-50 rounded-lg p-3">
                                                          <p className="text-[11px] uppercase font-semibold text-teal-700">Receber</p>
                                                          <p className="font-bold text-teal-700 mt-1">{formatCurrency(linkedReceivable?.amount || record.grossAmount)}</p>
                                                      </div>
                                                  </div>
                                              </div>
                                          </div>
                                      )
                                  })}
                              </div>
                          )}
                      </div>
                  </div>
              )}
              {activeTab === 'property' && patient.species === 'Equine' && (
                  <div className="space-y-6">
                    {renderPropertySection()}
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
              {activeTab !== 'overview' && activeTab !== 'contacts' && activeTab !== 'financial' && activeTab !== 'attendances' && (
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
                    const vaccines = attendances
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
                    const scheduledReturns = []; // TODO: load from supabaseDataService.getAppointments()
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
                          <label className="text-sm font-medium">Sexo / Categoria</label>
                          {editFormData.species === 'Equine' ? (
                              <select 
                                className="w-full border rounded p-2"
                                value={editFormData.gender === 'F' ? 'F' : (editFormData.neutered ? 'M-C' : 'M-I')}
                                onChange={e => {
                                    const val = e.target.value;
                                    if(val === 'F') setEditFormData({...editFormData, gender: 'F', neutered: false});
                                    else if(val === 'M-C') setEditFormData({...editFormData, gender: 'M', neutered: true});
                                    else setEditFormData({...editFormData, gender: 'M', neutered: false});
                                }}
                              >
                                  <option value="M-I">Garanhão (Macho Inteiro)</option>
                                  <option value="M-C">Castrado (Macho Castrado)</option>
                                  <option value="F">Égua (Fêmea)</option>
                              </select>
                          ) : (
                              <select 
                                className="w-full border rounded p-2"
                                value={editFormData.gender || 'M'} 
                                onChange={e => setEditFormData({...editFormData, gender: e.target.value})} 
                              >
                                  <option value="M">Macho</option>
                                  <option value="F">Fêmea</option>
                              </select>
                          )}
                      </div>
                      <div>
                          <label className="text-sm font-medium">Pelagem/Cor</label>
                          <input 
                            className="w-full border rounded p-2"
                            value={editFormData.coat || editFormData.color || ''} 
                            onChange={e => setEditFormData({...editFormData, coat: e.target.value, color: e.target.value})} 
                          />
                      </div>
                      {(editFormData.species === 'Canine' || editFormData.species === 'Feline') && (
                        <div>
                            <label className="text-sm font-medium">Porte</label>
                            <select
                              className="w-full border rounded p-2"
                              value={editFormData.size || ''}
                              onChange={e => setEditFormData({...editFormData, size: e.target.value})}
                            >
                                <option value="">Selecione...</option>
                                <option value="Small">Pequeno</option>
                                <option value="Medium">Médio</option>
                                <option value="Large">Grande</option>
                            </select>
                        </div>
                      )}
                       <div className="flex items-center pt-6 gap-4">
                           {editFormData.species !== 'Equine' && (
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
                           )}
                           {editFormData.gender === 'F' && !editFormData.neutered && (
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
                                  <label className="text-sm font-medium">RGA</label>
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
                              <EmailInput 
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
                              <label className="text-sm font-medium">Tipo da Propriedade</label>
                              <select
                                className="w-full border rounded p-2"
                                value={editFormData.propertyData?.type || ''}
                                onChange={e => setEditFormData({...editFormData, propertyData: {...editFormData.propertyData, type: e.target.value}})}
                              >
                                <option value="">Selecione...</option>
                                <option value="Haras">Haras</option>
                                <option value="Fazenda">Fazenda</option>
                                <option value="Sítio">Sítio</option>
                                <option value="Centro Equestre">Centro Equestre</option>
                                <option value="Clínica">Clínica</option>
                                <option value="Outro">Outro</option>
                              </select>
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
                              <label className="text-sm font-medium">CEP</label>
                              <input 
                                className="w-full border rounded p-2"
                                value={editFormData.propertyData?.zipCode || ''}
                                onChange={e => setEditFormData({...editFormData, propertyData: {...editFormData.propertyData, zipCode: formatCEP(e.target.value)}})}
                              />
                          </div>
                          <div className="md:col-span-2">
                              <label className="text-sm font-medium">Rua / Endereço</label>
                              <input 
                                className="w-full border rounded p-2"
                                value={editFormData.propertyData?.street || editFormData.propertyData?.address || ''} 
                                onChange={e => setEditFormData({...editFormData, propertyData: {...editFormData.propertyData, street: e.target.value, address: e.target.value}})} 
                              />
                          </div>
                          <div>
                              <label className="text-sm font-medium">Número / Complemento</label>
                              <input 
                                className="w-full border rounded p-2"
                                value={editFormData.propertyData?.number || ''} 
                                onChange={e => setEditFormData({...editFormData, propertyData: {...editFormData.propertyData, number: e.target.value}})} 
                              />
                          </div>
                          <div>
                              <label className="text-sm font-medium">Bairro</label>
                              <input 
                                className="w-full border rounded p-2"
                                value={editFormData.propertyData?.neighborhood || ''} 
                                onChange={e => setEditFormData({...editFormData, propertyData: {...editFormData.propertyData, neighborhood: e.target.value}})} 
                              />
                          </div>
                          <div>
                              <label className="text-sm font-medium">Cidade</label>
                              <input 
                                className="w-full border rounded p-2"
                                value={editFormData.propertyData?.city || ''} 
                                onChange={e => setEditFormData({...editFormData, propertyData: {...editFormData.propertyData, city: e.target.value}})} 
                              />
                          </div>
                          <div>
                              <label className="text-sm font-medium">Estado (UF)</label>
                              <input 
                                className="w-full border rounded p-2"
                                maxLength={2}
                                value={editFormData.propertyData?.state || ''} 
                                onChange={e => setEditFormData({...editFormData, propertyData: {...editFormData.propertyData, state: e.target.value.toUpperCase()}})} 
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
                              <Button onClick={async () => {
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
                                  // TODO: updateAttendance via supabaseDataService when method is ready
                                  
                                  // Update Patient Weight History if weight changed
                                  if (updates.vitals.weight && updates.vitals.weight !== selectedAttendance.vitals?.weight) {
                                      try {
                                          await supabaseDataService.updatePatient(selectedAttendance.patientId, { weight: updates.vitals.weight });
                                          patient.weight = updates.vitals.weight;
                                      } catch (err) { console.error('Erro ao atualizar peso:', err) }
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
                      placeholder="Nome Completo *"
                      value={newOwner?.name || ''}
                      onChange={e => setNewOwner(prev => ({...prev, name: e.target.value, isNew: true}))}
                  />
                  <input 
                      className="border rounded p-2" 
                      placeholder="CPF/Documento"
                      value={newOwner?.document || ''}
                      onChange={e => setNewOwner(prev => ({...prev, document: formatDocument(e.target.value), isNew: true}))}
                  />
                  <input 
                      className="border rounded p-2" 
                      placeholder="Telefone *"
                      value={newOwner?.phone || ''}
                      onChange={e => setNewOwner(prev => ({...prev, phone: formatPhone(e.target.value), isNew: true}))}
                  />
                  <input
                      className="border rounded p-2"
                      placeholder="Telefone Secundário"
                      value={newOwner?.secondaryPhone || ''}
                      onChange={e => setNewOwner(prev => ({...prev, secondaryPhone: formatPhone(e.target.value), isNew: true}))}
                  />
                  <EmailInput
                      className="border rounded p-2"
                      placeholder="Email"
                      value={newOwner?.email || ''}
                      onChange={e => setNewOwner(prev => ({...prev, email: e.target.value, isNew: true}))}
                  />
                  <input 
                      className="border rounded p-2" 
                      placeholder="CEP"
                      value={newOwner?.zipCode || ''}
                      onChange={e => {
                        const val = formatCEP(e.target.value)
                        setNewOwner(prev => ({...prev, zipCode: val, isNew: true}))
                        if (val.replace(/\D/g, '').length === 8) handleCepSearch(val, 'owner')
                      }}
                  />
                  <input 
                      className="border rounded p-2" 
                      placeholder="Endereço / Rua"
                      value={newOwner?.street || newOwner?.address || ''}
                      onChange={e => setNewOwner(prev => ({...prev, street: e.target.value, address: e.target.value, isNew: true}))}
                  />
                  <input 
                      className="border rounded p-2" 
                      placeholder="Número e Complemento"
                      value={newOwner?.number || ''}
                      onChange={e => setNewOwner(prev => ({...prev, number: e.target.value, isNew: true}))}
                  />
                  <input 
                      className="border rounded p-2" 
                      placeholder="Bairro"
                      value={newOwner?.neighborhood || ''}
                      onChange={e => setNewOwner(prev => ({...prev, neighborhood: e.target.value, isNew: true}))}
                  />
                  <input 
                      className="border rounded p-2" 
                      placeholder="Cidade"
                      value={newOwner?.city || ''}
                      onChange={e => setNewOwner(prev => ({...prev, city: e.target.value, isNew: true}))}
                  />
                  <input 
                      className="border rounded p-2" 
                      placeholder="Estado (UF)"
                      maxLength={2}
                      value={newOwner?.state || ''}
                      onChange={e => setNewOwner(prev => ({...prev, state: e.target.value.toUpperCase(), isNew: true}))}
                  />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setIsChangingOwner(false)}>Cancelar</Button>
                  <Button onClick={async () => {
                      if (newOwner?.isNew) {
                          if (!newOwner.name || !newOwner.phone) {
                              alert('Preencha nome e telefone do novo tutor.');
                              return;
                          }
                          try {
                              const finalAddress = [newOwner.street || newOwner.address, newOwner.number ? `nº ${newOwner.number}` : '', newOwner.neighborhood].filter(Boolean).join(', ')
                              const created = await supabaseDataService.createOwner({ ...newOwner, address: finalAddress || newOwner.address || '' });
                              const updatedOwners = await supabaseDataService.getOwners();
                              setOwners(updatedOwners);
                              
                              await supabaseDataService.updatePatient(patient.id, { ownerId: created.id });
                              patient.ownerId = created.id;
                              patient.ownerName = created.name;
                              onPatientUpdated?.({ ...patient, ownerId: created.id, ownerName: created.name });
                              alert(`Tutor cadastrado e alterado para: ${created.name}`);
                          } catch (error) {
                              console.error('Erro ao criar tutor:', error)
                              alert(`Erro: ${error?.message || error}`)
                          }
                      } else {
                          await handleSaveOwnerChange();
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
                      className="border rounded p-2" 
                      placeholder="Nome da Propriedade *"
                      value={newProperty?.name || ''}
                      onChange={e => setNewProperty(prev => ({...prev, name: e.target.value, isNew: true}))}
                  />
                  <select
                      className="border rounded p-2"
                      value={newProperty?.type || ''}
                      onChange={e => setNewProperty(prev => ({...prev, type: e.target.value, isNew: true}))}
                  >
                      <option value="">Tipo de Propriedade</option>
                      <option value="Haras">Haras</option>
                      <option value="Fazenda">Fazenda</option>
                      <option value="Sítio">Sítio</option>
                      <option value="Hípica">Hípica</option>
                      <option value="Centro de Treinamento">Centro de Treinamento</option>
                      <option value="Outro">Outro</option>
                  </select>
                  <input 
                      className="border rounded p-2" 
                      placeholder="CNPJ/Inscrição"
                      value={newProperty?.document || ''}
                      onChange={e => setNewProperty(prev => ({...prev, document: formatDocument(e.target.value), isNew: true}))}
                  />
                  <input 
                      className="border rounded p-2" 
                      placeholder="Telefone"
                      value={newProperty?.phone || ''}
                      onChange={e => setNewProperty(prev => ({...prev, phone: formatPhone(e.target.value), isNew: true}))}
                  />
                  <EmailInput
                      className="border rounded p-2"
                      placeholder="Email"
                      value={newProperty?.email || ''}
                      onChange={e => setNewProperty(prev => ({...prev, email: e.target.value, isNew: true}))}
                  />
                  <input 
                      className="border rounded p-2" 
                      placeholder="CEP"
                      value={newProperty?.zipCode || ''}
                      onChange={e => {
                        const val = formatCEP(e.target.value)
                        setNewProperty(prev => ({...prev, zipCode: val, isNew: true}))
                        if (val.replace(/\D/g, '').length === 8) handleCepSearch(val, 'property')
                      }}
                  />
                  <input 
                      className="border rounded p-2" 
                      placeholder="Endereço / Rua"
                      value={newProperty?.street || newProperty?.address || ''}
                      onChange={e => setNewProperty(prev => ({...prev, street: e.target.value, address: e.target.value, isNew: true}))}
                  />
                  <input 
                      className="border rounded p-2" 
                      placeholder="Número e Complemento"
                      value={newProperty?.number || ''}
                      onChange={e => setNewProperty(prev => ({...prev, number: e.target.value, isNew: true}))}
                  />
                  <input 
                      className="border rounded p-2" 
                      placeholder="Bairro"
                      value={newProperty?.neighborhood || ''}
                      onChange={e => setNewProperty(prev => ({...prev, neighborhood: e.target.value, isNew: true}))}
                  />
                  <input 
                      className="border rounded p-2" 
                      placeholder="Cidade *"
                      value={newProperty?.city || ''}
                      onChange={e => setNewProperty(prev => ({...prev, city: e.target.value, isNew: true}))}
                  />
                  <input 
                      className="border rounded p-2" 
                      placeholder="Estado (UF) *"
                      maxLength={2}
                      value={newProperty?.state || ''}
                      onChange={e => setNewProperty(prev => ({...prev, state: e.target.value.toUpperCase(), isNew: true}))}
                  />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setIsChangingProperty(false)}>Cancelar</Button>
                  <Button onClick={async () => {
                      if (newProperty?.isNew) {
                          if (!newProperty.name || !newProperty.city || !newProperty.state) {
                              alert('Preencha nome, cidade e estado da nova propriedade.');
                              return;
                          }
                          try {
                              const finalAddress = [newProperty.street || newProperty.address, newProperty.number ? `nº ${newProperty.number}` : '', newProperty.neighborhood].filter(Boolean).join(', ')
                              const created = await supabaseDataService.createProperty({ ...newProperty, address: finalAddress || newProperty.address || '' });
                              const updatedProperties = await supabaseDataService.getProperties();
                              setProperties(updatedProperties);
                              
                              await supabaseDataService.updatePatient(patient.id, { propertyId: created.id });
                              patient.propertyId = created.id;
                              onPatientUpdated?.({ ...patient, propertyId: created.id });
                              alert(`Propriedade cadastrada e alterada para: ${created.name}`);
                          } catch (error) {
                              console.error('Erro ao criar propriedade:', error)
                              alert(`Erro: ${error?.message || error}`)
                          }
                      } else {
                          await handleSavePropertyChange();
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
