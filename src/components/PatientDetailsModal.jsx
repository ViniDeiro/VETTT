import React, { useState, useEffect } from 'react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { Autocomplete } from '../shared/Autocomplete'
import { mockDB } from '../services/mockDatabase'
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
  const [activeTab, setActiveTab] = useState('overview')
  const [isChangingOwner, setIsChangingOwner] = useState(false)
  const [isChangingProperty, setIsChangingProperty] = useState(false)
  const [owners, setOwners] = useState([])
  const [properties, setProperties] = useState([])
  const [newOwner, setNewOwner] = useState(null)
  const [newProperty, setNewProperty] = useState(null)

  useEffect(() => {
    if (isOpen) {
        setOwners(mockDB.getOwners())
        setProperties(mockDB.getAllProperties())
    }
  }, [isOpen])

  if (!patient) return null

  const handleSaveOwnerChange = () => {
      if (newOwner) {
          // In a real app, we would call an API to update the patient
          // For now, we simulate updating the local patient object (which is a prop, so this is a bit hacky but works for UI feedback in this session)
          patient.ownerId = newOwner.id;
          patient.ownerName = newOwner.name;
          alert(`Tutor alterado para: ${newOwner.name}`);
          setIsChangingOwner(false);
          setNewOwner(null);
      }
  }

  const handleSavePropertyChange = () => {
      if (newProperty) {
          patient.propertyId = newProperty.id;
          // Assuming patient object has propertyName or we just rely on ID in backend
          alert(`Propriedade alterada para: ${newProperty.name}`);
          setIsChangingProperty(false);
          setNewProperty(null);
      }
  }

  const tabs = [
    { id: 'overview', label: 'Visão Geral' },
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
          window.alert('Funcionalidade de Novo Procedimento: Abriria um modal de cadastro.');
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
            <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden shrink-0 border-4 border-white shadow-lg">
              <img 
                src={`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${patient.name}`} 
                alt={patient.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold text-gray-900">{patient.name}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>Próxima Consulta: 15/11/2026 - 10:30</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-gray-600 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{patient.species || 'Canino'}</span>
                </div>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
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
              </div>

              <div className="flex gap-2 mt-2">
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  Alergias: Penicilina
                </span>
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  Risco Anestésico: ASA III
                </span>
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
                  {/* Sinais Vitais */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="h-5 w-5 text-[#00BFA5]" />
                      <h3 className="font-bold text-gray-900">Sinais Vitais</h3>
                      <span className="text-xs text-gray-400 ml-auto">Última medição: 10/05/2026</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Freq. Cardíaca</p>
                        <p className="text-xl font-bold text-gray-900">110 bpm</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Pressão Arterial</p>
                        <p className="text-xl font-bold text-gray-900">130/80 mmHg</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Freq. Respiratória</p>
                        <p className="text-xl font-bold text-gray-900">24 rpm</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Temperatura</p>
                        <p className="text-xl font-bold text-gray-900">38.5 °C</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Peso</p>
                        <p className="text-xl font-bold text-gray-900">{patient.weight || 25.4} kg</p>
                      </div>
                    </div>
                  </div>

                  {/* Anamnese */}
                  <div className="bg-[#0B2C4D] p-5 rounded-xl shadow-sm text-white col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                      <Stethoscope className="h-5 w-5 text-[#00BFA5]" />
                      <h3 className="font-bold">Anamnese</h3>
                    </div>
                    <p className="text-sm text-blue-100 leading-relaxed">
                      Queixa Principal: Halitose intensa, relutância em mastigar.<br/>
                      Histórico: Diagnosticado com doença periodontal estágio 2 há 6 meses.<br/>
                      Alimentação: Ração seca.<br/>
                      Comportamento: Apatia leve, sensibilidade oral.
                    </p>
                  </div>

                  {/* Procedimentos Recentes */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <h3 className="font-bold text-gray-900">Procedimentos Recentes</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="border-l-2 border-green-500 pl-3">
                        <p className="text-xs text-gray-500">25/04/2026</p>
                        <p className="font-medium text-gray-900">Consulta de Retorno</p>
                        <span className="text-xs text-green-600 font-bold">Concluído</span>
                        <p className="text-xs text-gray-400">(Dra. Ana Lima)</p>
                      </div>
                      <div className="border-l-2 border-yellow-500 pl-3">
                        <p className="text-xs text-gray-500">10/04/2026</p>
                        <p className="font-medium text-gray-900">Exame de Sangue</p>
                        <span className="text-xs text-green-600 font-bold">Resultado Disponível</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-4 text-xs h-8">Ver todos</Button>
                  </div>

                  {/* Deuanto / Notas */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                      <StickyNote className="h-5 w-5 text-yellow-500" />
                      <h3 className="font-bold text-gray-900">Notas Clínicas</h3>
                    </div>
                    <p className="text-sm text-gray-600 italic">
                      "Paciente apresentou melhora significativa após a medicação. Recomendo retorno em 15 dias para reavaliação da gengiva."
                    </p>
                  </div>

                  {/* Plano Terapêutico */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                      <Heart className="h-5 w-5 text-red-500" />
                      <h3 className="font-bold text-gray-900">Plano Terapêutico</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      <strong>Curto prazo:</strong> Profilaxia dental completa sob anestesia geral.<br/>
                      <strong>Longo prazo:</strong> Escovação diária, dieta odontológica, acompanhamento trimestral.
                    </p>
                  </div>

                  {/* Anexos */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                      <Paperclip className="h-5 w-5 text-gray-500" />
                      <h3 className="font-bold text-gray-900">Anexos</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-100 rounded p-2 flex flex-col items-center justify-center text-center">
                        <File className="h-8 w-8 text-red-500 mb-1" />
                        <span className="text-xs truncate w-full">Exame_Sangue.pdf</span>
                      </div>
                      <div className="bg-gray-100 rounded p-2 flex flex-col items-center justify-center text-center">
                        <ImageIcon className="h-8 w-8 text-blue-500 mb-1" />
                        <span className="text-xs truncate w-full">Raio-X_Caninos.jpg</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab !== 'overview' && (
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
              <Button 
                onClick={() => handleAction('odontogram')}
                className="w-full bg-[#00BFA5] hover:bg-[#00BFA5]/90 text-white justify-start"
              >
                <Activity className="mr-2 h-4 w-4" /> Abrir Odontograma
              </Button>
              <Button 
                onClick={(e) => {
                  console.log('Button Clicked directly');
                  e.stopPropagation();
                  handleAction('new-procedure');
                }}
                className="w-full bg-[#0B2C4D] hover:bg-[#0B2C4D]/90 text-white justify-start relative z-10 cursor-pointer"
              >
                <Plus className="mr-2 h-4 w-4" /> Novo Procedimento
              </Button>
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
                <div>
                  <p className="text-xs font-bold text-gray-700">Hoje, 09:15</p>
                  <p className="text-xs text-gray-600">Confirmação pendente para cirurgia de 15/11/2026.</p>
                </div>
                <div className="border-t border-red-100 pt-2">
                  <p className="text-xs font-bold text-gray-700">Ontem, 14:30</p>
                  <p className="text-xs text-gray-600">Resultado de exame de sangue liberado.</p>
                </div>
                <div className="border-t border-red-100 pt-2">
                  <p className="text-xs font-bold text-gray-700">28/04/2026</p>
                  <p className="text-xs text-gray-600">Vencimento da vacina antirrábica em 15/05/2026.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Change Owner Modal */}
      <Modal isOpen={isChangingOwner} onClose={() => setIsChangingOwner(false)} title="Alterar Tutor">
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
              <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setIsChangingOwner(false)}>Cancelar</Button>
                  <Button onClick={handleSaveOwnerChange} disabled={!newOwner}>Salvar Alteração</Button>
              </div>
          </div>
      </Modal>

      {/* Change Property Modal */}
      <Modal isOpen={isChangingProperty} onClose={() => setIsChangingProperty(false)} title="Alterar Propriedade">
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
              <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setIsChangingProperty(false)}>Cancelar</Button>
                  <Button onClick={handleSavePropertyChange} disabled={!newProperty}>Salvar Alteração</Button>
              </div>
          </div>
      </Modal>
    </div>
  )
}