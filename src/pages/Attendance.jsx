import React, { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Autocomplete } from '@/shared/Autocomplete'
import { mockDB } from '@/services/mockDatabase'
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
  User,
  MapPin,
  Play
} from 'lucide-react'
import { cn } from '@/lib/utils'
import PatientDetailsModal from '@/components/PatientDetailsModal'
import { useNavigate } from 'react-router-dom'

export default function Attendance() {
  const navigate = useNavigate()
  const [viewState, setViewState] = useState('dashboard') // dashboard, profile
  const [appointments, setAppointments] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [patients, setPatients] = useState([])

  useEffect(() => {
    // Load appointments
    const allAppts = mockDB.getAppointments()
    const allPatients = mockDB.getPatients()
    const owners = mockDB.getOwners()
    
    // Filter for today (mock logic)
    const today = new Date().toDateString()
    const todaysAppts = allAppts.filter(a => new Date(a.start).toDateString() === today).map(appt => {
        const patient = allPatients.find(p => p.id === appt.patientId)
        const owner = owners.find(o => o.id === patient?.ownerId)
        return {
            ...appt,
            patientName: patient?.name || 'Unknown',
            ownerName: owner?.name || 'Unknown',
            species: patient?.species,
            patient: patient // Keep full patient ref
        }
    })
    
    setAppointments(todaysAppts)
    setPatients(allPatients)
  }, [])

  const handlePatientSelect = (patient) => {
      // Find full patient details including owner name
      const owner = mockDB.getOwners().find(o => o.id === patient.ownerId)
      setSelectedPatient({
          ...patient,
          ownerName: owner?.name || 'Desconhecido'
      })
      setViewState('profile')
  }

  const handleStartAttendance = () => {
      // Navigate to attendance wizard/form
      // For now we assume a route or just log it
      navigate('/attendance-new', { state: { patient: selectedPatient } })
  }

  if (viewState === 'profile' && selectedPatient) {
      return (
        <Layout>
             <div className="mb-4">
                <Button variant="ghost" onClick={() => setViewState('dashboard')}>&larr; Voltar para Painel</Button>
             </div>
             {/* Reusing the Modal Content logic but as a full page or just opening the modal? 
                 The requirement says "abrir uma tela com...". 
                 Let's use the PatientDetailsModal but trigger it or embed it.
                 Actually, reusing the component might be tricky if it's strictly a modal.
                 Let's render a specific Profile View here.
             */}
             
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex items-center gap-6">
                         <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-lg">
                            <img 
                                src={`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${selectedPatient.name}`} 
                                alt={selectedPatient.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-[#0B2C4D]">{selectedPatient.name}</h1>
                            <div className="flex items-center gap-4 text-gray-600 mt-2">
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-bold">{selectedPatient.species}</span>
                                <span className="flex items-center gap-1"><User className="h-4 w-4" /> {selectedPatient.ownerName}</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <Button 
                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg shadow-lg shadow-green-900/20"
                            onClick={handleStartAttendance}
                        >
                            <Play className="mr-2 h-5 w-5" /> Iniciar Atendimento
                        </Button>
                    </div>
                </div>

                {/* History Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-gray-500" />
                                    Último Atendimento (Resumo)
                                </h3>
                                {/* Mock History Data */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-2">
                                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                                        <span>10/05/2026</span>
                                        <span>Dr. Silva</span>
                                    </div>
                                    <p className="font-medium text-gray-900">Queixa: Dor de dente e falta de apetite.</p>
                                    <p className="text-gray-600">Diagnóstico: Periodontite grau 2.</p>
                                    <p className="text-gray-600">Tratamento: Limpeza e antibiótico.</p>
                                </div>
                            </CardContent>
                        </Card>
                        
                        {/* Vitals History Graph Placeholder */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-blue-600" />
                                    Evolução de Peso e Sinais Vitais
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                                            <tr>
                                                <th className="p-3">Data</th>
                                                <th className="p-3">Peso (kg)</th>
                                                <th className="p-3">FC (bpm)</th>
                                                <th className="p-3">Temp (°C)</th>
                                                <th className="p-3">PA</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {/* Mock Data - In real app, map from patient history */}
                                            <tr className="border-b hover:bg-gray-50">
                                                <td className="p-3">10/05/2026</td>
                                                <td className="p-3 font-bold">32.5</td>
                                                <td className="p-3">88</td>
                                                <td className="p-3">38.5</td>
                                                <td className="p-3">120/80</td>
                                            </tr>
                                            <tr className="border-b hover:bg-gray-50">
                                                <td className="p-3">15/04/2026</td>
                                                <td className="p-3 font-bold">31.8</td>
                                                <td className="p-3">92</td>
                                                <td className="p-3">38.7</td>
                                                <td className="p-3">118/78</td>
                                            </tr>
                                            <tr className="border-b hover:bg-gray-50">
                                                <td className="p-3">02/02/2026</td>
                                                <td className="p-3 font-bold">30.2</td>
                                                <td className="p-3">95</td>
                                                <td className="p-3">39.0</td>
                                                <td className="p-3">--</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                         <Card className="bg-blue-50 border-blue-100">
                            <CardContent className="p-6">
                                <h3 className="font-bold text-blue-900 mb-2">Dados Cadastrais</h3>
                                <div className="space-y-2 text-sm text-blue-800">
                                    <p><strong>Raça:</strong> {selectedPatient.breed}</p>
                                    <p><strong>Idade:</strong> {selectedPatient.age} anos</p>
                                    <p><strong>Sexo:</strong> {selectedPatient.gender === 'M' ? 'Macho' : 'Fêmea'}</p>
                                    {selectedPatient.weight && <p><strong>Peso Atual:</strong> {selectedPatient.weight} kg</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
             </div>
        </Layout>
      )
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold text-[#0B2C4D] mb-2">Painel de Atendimentos</h1>
            <p className="text-gray-500">Gerencie os atendimentos do dia e inicie novas consultas.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Schedule */}
            <div className="lg:col-span-2 space-y-6">
                <Card className="border-t-4 border-t-[#00BFA5] shadow-sm">
                    <CardContent className="p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-[#00BFA5]" />
                            Pré-agendados de Hoje
                        </h2>

                        <div className="space-y-4">
                            {appointments.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    Nenhum agendamento encontrado para hoje.
                                </div>
                            ) : (
                                appointments.map(appt => (
                                    <div key={appt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-center justify-center w-16 h-16 bg-white rounded-lg shadow-sm border border-gray-200">
                                                <span className="text-lg font-bold text-gray-900">
                                                    {new Date(appt.start).getHours()}:{new Date(appt.start).getMinutes().toString().padStart(2, '0')}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900">{appt.patientName}</h3>
                                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1"><User className="h-3 w-3" /> {appt.ownerName}</span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Consultório 1</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button 
                                            onClick={() => handlePatientSelect(appt.patient)}
                                            className="bg-[#0B2C4D] text-white hover:bg-[#0B2C4D]/90 shadow-md"
                                        >
                                            <Play className="h-4 w-4 mr-2" /> Atender
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right: Manual Start */}
            <div>
                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 shadow-sm h-full">
                    <CardContent className="p-6">
                        <h2 className="text-xl font-bold text-[#0B2C4D] mb-4 flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            Atendimento Avulso
                        </h2>
                        <p className="text-sm text-gray-600 mb-6">
                            Para pacientes sem agendamento prévio (emergências ou encaixes).
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Buscar Paciente</label>
                                <Autocomplete 
                                    options={patients.map(p => ({ id: p.id, label: p.name }))}
                                    onSelect={(opt) => {
                                        const p = patients.find(pat => pat.id === opt.id)
                                        if (p) handlePatientSelect(p)
                                    }}
                                    placeholder="Nome do paciente..."
                                />
                            </div>
                            
                            <div className="pt-4 border-t border-blue-100">
                                <Button 
                                    variant="outline" 
                                    className="w-full justify-start text-blue-700 border-blue-200 hover:bg-blue-50"
                                    onClick={() => navigate('/register')}
                                >
                                    <Plus className="h-4 w-4 mr-2" /> Cadastrar Novo Paciente
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </Layout>
  )
}
