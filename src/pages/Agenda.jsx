import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Label } from '../components/ui/Label'
import { Autocomplete } from '../shared/Autocomplete'
import {
  ChevronLeft,
  ChevronRight,
  User,
  PawPrint,
  Stethoscope,
  MapPin,
  Clock,
  FileText,
  MessageCircle,
  Calendar as CalendarIcon,
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockDB } from '../services/mockDatabase'
import PatientDetailsModal from '../components/PatientDetailsModal'

export default function Agenda() {
  const [view, setView] = useState('Semana') // Hoje, Semana, Mês
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [appointments, setAppointments] = useState([]) // Initialize empty, load from DB
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [selectedPatient, setSelectedPatient] = useState(null)
  
  // Appointment details modal
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  // Autocomplete Data
  const [patients, setPatients] = useState([])
  const [owners, setOwners] = useState([])
  const [properties, setProperties] = useState([])
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newAppointment, setNewAppointment] = useState({
    patientId: '',
    patientName: '',
    type: 'Canino',
    doctor: 'Dr. Silva',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    procedure: '',
    notes: ''
  })

  const buildAppointmentDetails = (appointment, sources = {}) => {
    const patientsList = sources.patients || patients
    const ownersList = sources.owners || owners
    const propertiesList = sources.properties || properties

    const patientData = patientsList.find(p => p.id === appointment.patientId) || null
    const ownerData = patientData ? ownersList.find(o => o.id === patientData.ownerId) || null : null
    const propertyData = patientData?.propertyId
      ? propertiesList.find(p => p.id === patientData.propertyId) || null
      : null

    return {
      ...appointment,
      patient: appointment.patient || appointment.patientName || patientData?.name || 'Paciente',
      type: appointment.type || patientData?.species || 'Canino',
      ownerName: ownerData?.name || appointment.ownerName || 'Não informado',
      ownerData,
      propertyData,
      patientData: patientData
        ? {
            ...patientData,
            ownerName: ownerData?.name || 'Não informado',
            ownerData: ownerData || {},
            propertyData: propertyData || {}
          }
        : null
    }
  }

  const handleAppointmentClick = (appointment) => {
    const enriched = buildAppointmentDetails(appointment)
    setSelectedAppointment(enriched)
    setIsDetailsOpen(true)
  }

  useEffect(() => {
    // Load from mockDB on mount
    const loadedPatients = mockDB.getPatients()
    const loadedOwners = mockDB.getOwners()
    const loadedProperties = mockDB.getAllProperties()
    const loadedAppointments = mockDB.getAppointments()

    setPatients(loadedPatients)
    setOwners(loadedOwners)
    setProperties(loadedProperties)
    setAppointments(
      loadedAppointments.map(appointment =>
        buildAppointmentDetails(appointment, {
          patients: loadedPatients,
          owners: loadedOwners,
          properties: loadedProperties
        })
      )
    )
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewAppointment(prev => ({ ...prev, [name]: value }))
  }

  const handlePatientSelect = (item) => {
      const p = patients.find(pat => pat.id === item.id)
      if (p) {
          setNewAppointment(prev => ({
              ...prev,
              patientId: p.id,
              patientName: p.name,
              type: p.species || 'Canino'
          }))
      }
  }

  const handleConfirmAppointment = () => {
    if (!selectedAppointment) return;
    try {
      const updated = mockDB.updateAppointment(selectedAppointment.id, { status: 'confirmado' });
      if (updated) {
          const enrichedUpdated = buildAppointmentDetails(updated);
          setAppointments(prev => prev.map(a => a.id === updated.id ? enrichedUpdated : a));
          setSelectedAppointment(enrichedUpdated);
          alert('Agendamento confirmado com sucesso! Ele já está disponível em Atendimento.');
      } else {
          alert('Erro: Agendamento não encontrado no banco de dados.');
      }
    } catch (e) {
      console.error(e);
      alert('Erro ao confirmar agendamento.');
    }
  };

  const handleReschedule = () => {
    if (!selectedAppointment) return;
    const start = new Date(selectedAppointment.start);
    const end = new Date(selectedAppointment.end);
    
    setNewAppointment({
        patientId: selectedAppointment.patientId,
        patientName: selectedAppointment.patient,
        type: selectedAppointment.type,
        doctor: selectedAppointment.doctor,
        date: start.toISOString().split('T')[0],
        startTime: start.toTimeString().substr(0, 5),
        endTime: end.toTimeString().substr(0, 5),
        procedure: selectedAppointment.procedure?.split(' - ')[1] || selectedAppointment.procedure || '',
        notes: selectedAppointment.notes
    });
    setIsDetailsOpen(false)
    setIsModalOpen(true);
  };

  const handleSendMessage = () => {
    if (!selectedAppointment) return;
    alert(`Mensagem enviada para o tutor de ${selectedAppointment.patient}: "Olá, lembramos do seu agendamento para amanhã."`);
  };

  const handleSaveAppointment = () => {
    if (!newAppointment.patientName || !newAppointment.date || !newAppointment.startTime || !newAppointment.endTime) {
        alert("Preencha os campos obrigatórios");
        return;
    }

    const start = `${newAppointment.date}T${newAppointment.startTime}:00`
    const end = `${newAppointment.date}T${newAppointment.endTime}:00`

    const appointment = {
      title: `${newAppointment.patientName} - ${newAppointment.procedure}`,
      patient: newAppointment.patientName,
      patientId: newAppointment.patientId,
      type: newAppointment.type,
      procedure: newAppointment.procedure,
      doctor: newAppointment.doctor,
      start,
      end,
      notes: newAppointment.notes,
      status: 'pendente',
      color: newAppointment.type === 'Equino' ? 'bg-[#1E3A8A] border-[#1E3A8A] text-white' : 
             newAppointment.type === 'Canino' ? 'bg-[#00BFA5] border-[#00BFA5] text-white' : 
             'bg-[#60A5FA] border-[#60A5FA] text-white'
    }

    const created = mockDB.createAppointment(appointment)
    setAppointments([...appointments, buildAppointmentDetails(created)])
    setIsModalOpen(false)
    
    // Reset form
    setNewAppointment({
      patientId: '',
      patientName: '',
      type: 'Canino',
      doctor: 'Dr. Silva',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      procedure: '',
      notes: ''
    })
  }

  const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
  const hours = Array.from({ length: 11 }, (_, i) => i + 8) // 08:00 as 18:00

  // Filtros
  const [filters, setFilters] = useState({
    species: { equino: true, canino: true, felino: true, outros: false },
    veterinarian: { silva: true, santos: true, todos: false },
    status: { confirmado: true, pendente: true, cancelado: false, realizado: false }
  })

  const handlePrevRange = () => {
    const newDate = new Date(selectedDate)
    if (view === 'Hoje') newDate.setDate(selectedDate.getDate() - 1)
    else if (view === 'Semana') newDate.setDate(selectedDate.getDate() - 7)
    else if (view === 'Mês') newDate.setMonth(selectedDate.getMonth() - 1)
    setSelectedDate(newDate)
  }

  const handleNextRange = () => {
    const newDate = new Date(selectedDate)
    if (view === 'Hoje') newDate.setDate(selectedDate.getDate() + 1)
    else if (view === 'Semana') newDate.setDate(selectedDate.getDate() + 7)
    else if (view === 'Mês') newDate.setMonth(selectedDate.getMonth() + 1)
    setSelectedDate(newDate)
  }

  // Formatar intervalo de data dinâmico
  const formatDateRange = () => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' }
    
    if (view === 'Hoje') return selectedDate.toLocaleDateString('pt-BR', options)
    
    if (view === 'Mês') return selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

    // Semana
    const currentDay = selectedDate.getDay()
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay
    const monday = new Date(selectedDate)
    monday.setDate(selectedDate.getDate() + distanceToMonday)
    
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)

    const optMonth = { day: 'numeric', month: 'long' }
    return `${monday.toLocaleDateString('pt-BR', optMonth)} - ${sunday.toLocaleDateString('pt-BR', optMonth)}, ${sunday.getFullYear()}`
  }

  const handleFilterChange = (category, item) => {
    setFilters(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [item]: !prev[category][item]
      }
    }))
  }

  // Helper para renderizar mini calendário
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return Array.from({ length: daysInMonth }, (_, i) => i + 1)
  }

  // View Calculation
  const getVisibleDays = () => {
      if (view === 'Hoje') return [selectedDate]
      
      if (view === 'Semana') {
        const currentDay = selectedDate.getDay()
        const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay
        const monday = new Date(selectedDate)
        monday.setDate(selectedDate.getDate() + distanceToMonday)
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(monday)
            d.setDate(monday.getDate() + i)
            return d
        })
      }
      
      // Mês - Simplificado para Grid (apenas dias, não time-grid)
      // Para manter layout consistente, Mês pode ser apenas uma lista ou grid diferente.
      // O requisito pede "Mês: range mês inteiro".
      // Vamos retornar os dias do mês, mas o layout grid teria que mudar se fossem 30 dias.
      // A UI atual é TimeGrid (linhas de horas). Renderizar 30 colunas fica ruim.
      // Normalmente Mês é visualização de Células (Month View).
      // Vou manter a lógica de colunas para Hoje/Semana e se for Mês, vamos mudar o render do body.
      return []
  }

  const visibleDays = getVisibleDays()

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-6 overflow-hidden relative">
        
        {/* Sidebar Esquerda - Filtros e Calendário Pequeno */}
        <div className="hidden lg:flex w-64 flex-shrink-0 flex-col gap-6 overflow-y-auto pr-2">
          {/* Mini Calendário */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <button className="p-1 hover:bg-gray-100 rounded" onClick={() => {
                  const d = new Date(selectedDate); d.setMonth(d.getMonth()-1); setSelectedDate(d)
              }}><ChevronLeft className="h-4 w-4 text-gray-500" /></button>
              <span className="font-semibold text-gray-900 capitalize">
                {selectedDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
              </span>
              <button className="p-1 hover:bg-gray-100 rounded" onClick={() => {
                   const d = new Date(selectedDate); d.setMonth(d.getMonth()+1); setSelectedDate(d)
              }}><ChevronRight className="h-4 w-4 text-gray-500" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 text-gray-500">
              <span>Do</span><span>Se</span><span>Te</span><span>Qu</span><span>Qu</span><span>Se</span><span>Sa</span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {(() => {
                const year = selectedDate.getFullYear()
                const month = selectedDate.getMonth()
                const firstDayOfMonth = new Date(year, month, 1).getDay()
                const miniCalendarCells = []

                for (let i = 0; i < firstDayOfMonth; i++) {
                  miniCalendarCells.push(
                    <div key={`mini-empty-${month}-${i}`} className="h-7 w-7" />
                  )
                }

                getDaysInMonth(selectedDate).forEach(day => {
                  const date = new Date(year, month, day)
                  const isSelected = date.toDateString() === selectedDate.toDateString()
                  const isToday = date.toDateString() === new Date().toDateString()

                  miniCalendarCells.push(
                    <button
                      key={day}
                      onClick={() => setSelectedDate(date)}
                      className={cn(
                        "h-7 w-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors",
                        isSelected && "bg-[#00BFA5] text-white hover:bg-[#00BFA5]",
                        isToday && !isSelected && "bg-blue-100 text-blue-700"
                      )}
                    >
                      {day}
                    </button>
                  )
                })

                return miniCalendarCells
              })()}
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-xl shadow-sm p-4 space-y-6">
            <h3 className="font-bold text-lg text-gray-900">Filtros</h3>
            {/* ... Filters UI code same as before ... */}
            {/* Espécie */}
            <div>
              <div className="space-y-2 ml-1">
                {['equino', 'canino', 'felino', 'outros'].map(item => (
                  <label key={item} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-[#0B2C4D] focus:ring-[#0B2C4D]"
                      checked={filters.species[item]}
                      onChange={() => handleFilterChange('species', item)}
                    />
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Central - Calendário */}
        <div className="flex-[3] flex flex-col bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header Calendário */}
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              {['Hoje', 'Semana', 'Mês'].map((v) => (
                <button
                  key={v}
                  onClick={() => {
                    setView(v)
                    if (v === 'Hoje') setSelectedDate(new Date())
                  }}
                  className={cn(
                    "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                    view === v ? "bg-[#0B2C4D] text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
                 <button className="p-2 hover:bg-gray-100 rounded-full md:hidden" onClick={handlePrevRange}><ChevronLeft className="h-4 w-4" /></button>
                 <div className="text-lg font-bold text-gray-900 capitalize text-center w-48">
                  {formatDateRange()}
                </div>
                 <button className="p-2 hover:bg-gray-100 rounded-full md:hidden" onClick={handleNextRange}><ChevronRight className="h-4 w-4" /></button>
            </div>

            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#00BFA5] hover:bg-[#00BFA5]/90 text-white gap-2 rounded-full px-6"
            >
              <span>+</span> Novo
            </Button>
          </div>

          {/* Grid do Calendário */}
          <div className="flex-1 overflow-auto relative">
            {view === 'Mês' ? (
                 <div className="grid grid-cols-7 h-full min-w-[600px]">
                    {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d => (
                        <div key={d} className="p-2 text-center font-bold border-b border-r bg-gray-50">{d}</div>
                    ))}
                    {(() => {
                        const year = selectedDate.getFullYear();
                        const month = selectedDate.getMonth();
                        const firstDay = new Date(year, month, 1).getDay();
                        const daysInMonth = new Date(year, month + 1, 0).getDate();
                        const slots = [];
                        
                        // Empty slots before
                        for(let i=0; i<firstDay; i++) slots.push(<div key={`empty-${i}`} className="border-b border-r bg-gray-50/30"></div>);
                        
                        // Days
                        for(let i=1; i<=daysInMonth; i++) {
                            const date = new Date(year, month, i);
                            const daysAppts = appointments.filter(a => {
                                const ad = new Date(a.start);
                                return ad.getDate() === i && ad.getMonth() === month && ad.getFullYear() === year;
                            });
                            
                            slots.push(
                                <div key={i} className="border-b border-r p-1 min-h-[100px] hover:bg-gray-50 transition-colors" onClick={() => setSelectedDate(date)}>
                                    <span className={cn("text-sm font-semibold p-1 rounded-full w-6 h-6 flex items-center justify-center", date.toDateString() === new Date().toDateString() ? "bg-blue-600 text-white" : "")}>{i}</span>
                                    <div className="mt-1 space-y-1">
                                        {daysAppts.slice(0, 3).map(apt => (
                                            <div key={apt.id} onClick={(e) => { e.stopPropagation(); handleAppointmentClick(apt); }} className={cn("text-[10px] px-1 rounded truncate cursor-pointer", apt.color)}>
                                                {apt.patient}
                                            </div>
                                        ))}
                                        {daysAppts.length > 3 && <div className="text-[10px] text-gray-500 text-center">+{daysAppts.length - 3} mais</div>}
                                    </div>
                                </div>
                            );
                        }
                        return slots;
                    })()}
                 </div>
            ) : (
            <div className="min-w-full">
              {/* Header Dias da Semana */}
              <div className="grid border-b border-gray-100 min-h-[50px]" style={{ gridTemplateColumns: `50px repeat(${visibleDays.length}, 1fr)` }}>
                <div className="p-4 border-r border-gray-50"></div> {/* Coluna Hora */}
                {visibleDays.map((date) => {
                  const isToday = date.toDateString() === new Date().toDateString()
                  const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')

                  return (
                    <div key={date.toString()} className={cn(
                      "p-4 text-center text-sm font-semibold border-r border-gray-50 last:border-r-0 flex flex-col items-center justify-center capitalize",
                      isToday ? "text-[#00BFA5]" : "text-gray-700"
                    )}>
                      <span>{dayName}</span>
                      <span className={cn("text-lg font-bold mt-1 w-8 h-8 flex items-center justify-center rounded-full", isToday ? "bg-[#00BFA5] text-white" : "")}>{date.getDate()}</span>
                    </div>
                  )
                })}
              </div>

              {/* Linhas de Horário */}
              <div className="relative">
                {hours.map(hour => (
                  <div key={hour} className="grid h-24 border-b border-gray-50" style={{ gridTemplateColumns: `50px repeat(${visibleDays.length}, 1fr)` }}>
                    <div className="p-2 text-[10px] font-bold text-gray-400 text-right border-r border-gray-50 relative -top-3">
                      {hour}:00
                    </div>
                    {visibleDays.map((date, colIndex) => (
                      <div 
                        key={`${date}-${hour}`} 
                        className="border-r border-gray-50 last:border-r-0 relative group hover:bg-blue-50/30 transition-colors cursor-pointer"
                            onClick={() => {
                            // Quick Add logic can go here if clicked on empty slot
                            const dStr = date.toISOString().split('T')[0];
                            setNewAppointment(prev => ({
                                ...prev,
                                date: dStr,
                                startTime: `${String(hour).padStart(2, '0')}:00`,
                                endTime: `${String(hour+1).padStart(2, '0')}:00`
                            }));
                            setIsModalOpen(true);
                        }}
                      >
                        {/* Renderizar agendamentos aqui */}
                        {appointments.filter(apt => {
                          const aptDate = new Date(apt.start)
                          const aptHour = aptDate.getHours()
                          
                          // Filtros básicos
                          if (aptDate.getDate() !== date.getDate() || aptDate.getMonth() !== date.getMonth()) return false;
                          if (aptHour !== hour) return false;

                          // Apply other filters (species, vet, status) similar to previous code
                          return true; 
                        }).map(apt => (
                          <div
                            key={apt.id}
                            onClick={(e) => { e.stopPropagation(); handleAppointmentClick(apt); }}
                            className={cn(
                              "absolute inset-x-1 p-2 rounded-lg text-xs cursor-pointer hover:opacity-90 transition-opacity overflow-hidden border-l-4 shadow-sm z-10 flex flex-col justify-between",
                              apt.color || 'bg-blue-100 border-blue-500 text-blue-900'
                            )}
                            style={{ 
                              top: '2px', 
                              height: 'calc(100% - 4px)',
                            }}
                          >
                            <div>
                                <div className="font-bold truncate text-[11px] uppercase tracking-wider opacity-80">{apt.type}</div>
                                <div className="truncate font-bold text-sm mt-0.5">{apt.patient}</div>
                            </div>
                            {apt.procedure && <div className="truncate text-[10px] mt-1 opacity-90">{apt.procedure}</div>}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            )}
          </div>
        </div>

      </div>

      <Modal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false)
          setSelectedAppointment(null)
        }}
        title="Detalhes do Agendamento"
        className="max-w-4xl"
      >
        <div className="max-h-[80vh] overflow-y-auto p-1">
          <AppointmentDetails
            appointment={selectedAppointment}
            onConfirm={handleConfirmAppointment}
            onReschedule={handleReschedule}
            onMessage={handleSendMessage}
            onOpenPatientRecord={() => {
              if (selectedAppointment?.patientData) {
                setSelectedPatient(selectedAppointment.patientData)
                setIsDetailsOpen(false)
              }
            }}
          />
        </div>
      </Modal>

      <PatientDetailsModal
        isOpen={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
        patient={selectedPatient}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Agendamento"
        className="max-w-xl"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Paciente (Busca)</Label>
            <Autocomplete 
                options={patients.map(p => ({ id: p.id, label: `${p.name} (${p.species})` }))}
                onSelect={handlePatientSelect}
                placeholder="Buscar paciente cadastrado..."
                value={newAppointment.patientName}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label>Espécie</Label>
              <Input value={newAppointment.type} readOnly className="bg-gray-50" />
            </div>
             <div className="space-y-2">
              <Label>Veterinário</Label>
              <Select
                name="doctor"
                value={newAppointment.doctor}
                onChange={handleInputChange}
              >
                <option value="Dr. Silva">Dr. Silva</option>
                <option value="Dra. Santos">Dra. Santos</option>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Procedimento</Label>
            <Input
              name="procedure"
              value={newAppointment.procedure}
              onChange={handleInputChange}
              placeholder="Ex: Limpeza, Consulta"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                name="date"
                value={newAppointment.date}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label>Início</Label>
              <Input
                type="time"
                name="startTime"
                value={newAppointment.startTime}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label>Fim</Label>
              <Input
                type="time"
                name="endTime"
                value={newAppointment.endTime}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Input
              name="notes"
              value={newAppointment.notes}
              onChange={handleInputChange}
              placeholder="Detalhes adicionais..."
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveAppointment} className="bg-[#0B2C4D] text-white">
              Salvar Agendamento
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}

function AppointmentDetails({ appointment, onConfirm, onReschedule, onMessage, onOpenPatientRecord }) {
    if (!appointment) return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <CalendarIcon className="h-12 w-12 mb-4 opacity-20" />
            <p>Selecione um agendamento para ver os detalhes</p>
        </div>
    );

    return (
        <>
              <div className="space-y-6 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem
                    icon={CalendarIcon}
                    color="bg-blue-50 text-blue-600"
                    label="Data e Horário"
                    value={`${new Date(appointment.start).toLocaleDateString('pt-BR')} - ${new Date(appointment.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} às ${new Date(appointment.end).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
                  />
                  <InfoItem
                    icon={CheckCircle}
                    color="bg-emerald-50 text-emerald-600"
                    label="Status"
                    value={appointment.status || 'pendente'}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem
                    icon={Stethoscope}
                    color="bg-indigo-50 text-indigo-600"
                    label="Procedimento"
                    value={appointment.procedure || 'Não informado'}
                  />
                  <InfoItem
                    icon={User}
                    color="bg-slate-50 text-slate-700"
                    label="Veterinário"
                    value={appointment.doctor || 'Não informado'}
                  />
                </div>

                {appointment.notes && (
                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="text-sm font-bold text-gray-900 mb-1">Observações do Agendamento</p>
                    <p className="text-sm text-gray-600">{appointment.notes}</p>
                  </div>
                )}

                {/* Tutor */}
                <div className="rounded-xl border border-gray-200 p-4 space-y-3">
                  <p className="text-sm font-bold text-gray-900">Tutor</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem icon={User} color="bg-blue-50 text-[#0B2C4D]" label="Nome" value={appointment.ownerData?.name || appointment.ownerName || 'Desconhecido'} />
                    <InfoItem icon={MessageCircle} color="bg-green-50 text-green-600" label="Telefone" value={appointment.ownerData?.phone || 'Não informado'} />
                    <InfoItem icon={FileText} color="bg-gray-50 text-gray-700" label="CPF/CNPJ" value={appointment.ownerData?.document || 'Não informado'} />
                    <InfoItem icon={MapPin} color="bg-orange-50 text-orange-600" label="Endereço" value={appointment.ownerData?.address || 'Não informado'} />
                  </div>
                  {(appointment.ownerData?.email || appointment.ownerData?.secondaryPhone) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoItem icon={MessageCircle} color="bg-cyan-50 text-cyan-700" label="E-mail" value={appointment.ownerData?.email || 'Não informado'} />
                      <InfoItem icon={MessageCircle} color="bg-cyan-50 text-cyan-700" label="Telefone Secundário" value={appointment.ownerData?.secondaryPhone || 'Não informado'} />
                    </div>
                  )}
                </div>

                {/* Paciente */}
                <div className="rounded-xl border border-gray-200 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-bold text-gray-900">Paciente</p>
                    {appointment.patientData && (
                      <Button variant="outline" onClick={onOpenPatientRecord}>
                        Abrir ficha completa
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem icon={PawPrint} color="bg-teal-50 text-teal-600" label="Nome" value={appointment.patientData?.name || appointment.patient} />
                    <InfoItem icon={PawPrint} color="bg-teal-50 text-teal-600" label="Espécie" value={appointment.patientData?.species || appointment.type || 'Não informado'} />
                    <InfoItem icon={PawPrint} color="bg-teal-50 text-teal-600" label="Raça" value={appointment.patientData?.breed || 'Não informado'} />
                    <InfoItem icon={PawPrint} color="bg-teal-50 text-teal-600" label="Sexo" value={appointment.patientData?.gender === 'M' ? 'Macho' : appointment.patientData?.gender === 'F' ? 'Fêmea' : 'Não informado'} />
                    <InfoItem icon={PawPrint} color="bg-teal-50 text-teal-600" label="Idade" value={appointment.patientData?.age ? `${appointment.patientData.age} anos` : 'Não informado'} />
                    <InfoItem icon={PawPrint} color="bg-teal-50 text-teal-600" label="Peso" value={appointment.patientData?.weight ? `${appointment.patientData.weight} kg` : 'Não informado'} />
                    {appointment.patientData?.species !== 'Equine' && (
                      <InfoItem icon={PawPrint} color="bg-teal-50 text-teal-600" label="Porte" value={appointment.patientData?.size || 'Não informado'} />
                    )}
                    <InfoItem icon={PawPrint} color="bg-teal-50 text-teal-600" label="Pelagem" value={appointment.patientData?.coat || appointment.patientData?.color || 'Não informado'} />
                    <InfoItem icon={PawPrint} color="bg-teal-50 text-teal-600" label="RGA" value={appointment.patientData?.rg || 'Não informado'} />
                    <InfoItem icon={PawPrint} color="bg-teal-50 text-teal-600" label="Microchip" value={appointment.patientData?.microchip || 'Não informado'} />
                    <InfoItem icon={PawPrint} color="bg-teal-50 text-teal-600" label="Temperamento" value={appointment.patientData?.temperament || 'Não informado'} />
                    <InfoItem icon={PawPrint} color="bg-teal-50 text-teal-600" label="Risco Anestésico" value={appointment.patientData?.anestheticRisk || 'Não informado'} />
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <InfoItem icon={FileText} color="bg-red-50 text-red-600" label="Alergias" value={Array.isArray(appointment.patientData?.allergies) && appointment.patientData.allergies.length > 0 ? appointment.patientData.allergies.join(', ') : 'Não informado'} />
                    <InfoItem icon={FileText} color="bg-amber-50 text-amber-700" label="Doenças Crônicas" value={Array.isArray(appointment.patientData?.chronicDiseases) && appointment.patientData.chronicDiseases.length > 0 ? appointment.patientData.chronicDiseases.join(', ') : 'Não informado'} />
                  </div>
                </div>

                {appointment.propertyData && (
                  <div className="rounded-xl border border-gray-200 p-4 space-y-3">
                    <p className="text-sm font-bold text-gray-900">Propriedade</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoItem icon={MapPin} color="bg-violet-50 text-violet-700" label="Nome" value={appointment.propertyData?.name || 'Não informado'} />
                      <InfoItem icon={MapPin} color="bg-violet-50 text-violet-700" label="Tipo" value={appointment.propertyData?.type || 'Não informado'} />
                      <InfoItem icon={MapPin} color="bg-violet-50 text-violet-700" label="Cidade/UF" value={appointment.propertyData?.city ? `${appointment.propertyData.city}${appointment.propertyData.state ? ` - ${appointment.propertyData.state}` : ''}` : 'Não informado'} />
                      <InfoItem icon={MapPin} color="bg-violet-50 text-violet-700" label="Telefone" value={appointment.propertyData?.phone || 'Não informado'} />
                      <InfoItem icon={FileText} color="bg-violet-50 text-violet-700" label="CNPJ/Inscrição" value={appointment.propertyData?.document || 'Não informado'} />
                      <InfoItem icon={MessageCircle} color="bg-violet-50 text-violet-700" label="E-mail" value={appointment.propertyData?.email || 'Não informado'} />
                    </div>
                    <InfoItem icon={MapPin} color="bg-violet-50 text-violet-700" label="Endereço" value={appointment.propertyData?.address || 'Não informado'} />
                  </div>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="space-y-3 mt-6 pt-6 border-t border-gray-100">
                <Button 
                    onClick={onConfirm}
                    className="w-full bg-[#0B2C4D] hover:bg-[#0B2C4D]/90 text-white rounded-full h-12 text-base"
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Confirmar e Enviar para Atendimento
                </Button>
                <Button 
                    onClick={onReschedule}
                    className="w-full bg-[#0B2C4D] hover:bg-[#0B2C4D]/90 text-white rounded-full h-12 text-base"
                >
                  <Clock className="mr-2 h-5 w-5" />
                  Reagendar
                </Button>
                <Button 
                    onClick={onMessage}
                    className="w-full bg-[#00BFA5] hover:bg-[#00BFA5]/90 text-white rounded-full h-12 text-base"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Enviar mensagem
                </Button>
              </div>
        </>
    )
}

function InfoItem({ icon: Icon, color, label, value }) {
  return (
    <div className="flex gap-3">
      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-bold text-gray-900">{label}:</p>
        <p className="text-sm text-gray-600 break-words">{value}</p>
      </div>
    </div>
  )
}
