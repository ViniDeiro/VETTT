import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Label } from '../components/ui/Label'
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
  CheckCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockDB } from '../services/mockDatabase'

export default function Agenda() {
  const [view, setView] = useState('Semana') // Hoje, Semana, Mês
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [appointments, setAppointments] = useState([]) // Initialize empty, load from DB
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newAppointment, setNewAppointment] = useState({
    patient: '',
    type: 'Canino',
    doctor: 'Dr. Silva',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    procedure: '',
    notes: ''
  })

  useEffect(() => {
    // Load from mockDB on mount
    const loaded = mockDB.getAppointments()
    setAppointments(loaded)
    // Removed automatic selection of the first appointment
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewAppointment(prev => ({ ...prev, [name]: value }))
  }

  const handleConfirmAppointment = () => {
    if (!selectedAppointment) return;
    const updated = mockDB.updateAppointment(selectedAppointment.id, { status: 'confirmado' });
    if (updated) {
        setAppointments(prev => prev.map(a => a.id === updated.id ? updated : a));
        setSelectedAppointment(updated);
        alert('Agendamento confirmado com sucesso!');
    }
  };

  const handleReschedule = () => {
    if (!selectedAppointment) return;
    const start = new Date(selectedAppointment.start);
    const end = new Date(selectedAppointment.end);
    
    setNewAppointment({
        patient: selectedAppointment.patient,
        type: selectedAppointment.type,
        doctor: selectedAppointment.doctor,
        date: start.toISOString().split('T')[0],
        startTime: start.toTimeString().substr(0, 5),
        endTime: end.toTimeString().substr(0, 5),
        procedure: selectedAppointment.procedure.split(' - ')[1] || selectedAppointment.procedure,
        notes: selectedAppointment.notes
    });
    setIsModalOpen(true);
  };

  const handleSendMessage = () => {
    if (!selectedAppointment) return;
    alert(`Mensagem enviada para o tutor de ${selectedAppointment.patient}: "Olá, lembramos do seu agendamento para amanhã."`);
  };

  const handleSaveAppointment = () => {
    if (!newAppointment.patient || !newAppointment.date || !newAppointment.startTime || !newAppointment.endTime) return

    const start = `${newAppointment.date}T${newAppointment.startTime}:00`
    const end = `${newAppointment.date}T${newAppointment.endTime}:00`

    const appointment = {
      title: `${newAppointment.patient} - ${newAppointment.procedure}`,
      patient: newAppointment.patient,
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
    setAppointments([...appointments, created])
    setIsModalOpen(false)
    
    // Reset form
    setNewAppointment({
      patient: '',
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

  const handlePrevWeek = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(selectedDate.getDate() - 7)
    setSelectedDate(newDate)
  }

  const handleNextWeek = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(selectedDate.getDate() + 7)
    setSelectedDate(newDate)
  }

  // Formatar intervalo de data dinâmico
  const formatDateRange = () => {
    const currentDay = selectedDate.getDay()
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay
    const monday = new Date(selectedDate)
    monday.setDate(selectedDate.getDate() + distanceToMonday)
    
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)

    const options = { day: 'numeric', month: 'long' }
    return `${monday.toLocaleDateString('pt-BR', options)} - ${sunday.toLocaleDateString('pt-BR', options)}, ${sunday.getFullYear()}`
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

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-6 overflow-hidden">
        
        {/* Sidebar Esquerda - Filtros e Calendário Pequeno */}
        <div className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-6 overflow-y-auto pr-2">
          {/* Mini Calendário */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <button className="p-1 hover:bg-gray-100 rounded" onClick={handlePrevWeek}><ChevronLeft className="h-4 w-4 text-gray-500" /></button>
              <span className="font-semibold text-gray-900 capitalize">
                {selectedDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
              </span>
              <button className="p-1 hover:bg-gray-100 rounded" onClick={handleNextWeek}><ChevronRight className="h-4 w-4 text-gray-500" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 text-gray-500">
              <span>Do</span><span>Se</span><span>Te</span><span>Qu</span><span>Qu</span><span>Se</span><span>Sa</span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {getDaysInMonth(selectedDate).map(day => {
                const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day)
                const isSelected = date.toDateString() === selectedDate.toDateString()
                const isToday = date.toDateString() === new Date().toDateString()
                
                return (
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
              })}
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-xl shadow-sm p-4 space-y-6">
            <h3 className="font-bold text-lg text-gray-900">Filtros</h3>
            
            {/* Espécie */}
            <div>
              <button className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-2">
                Espécie
                <ChevronRight className="h-4 w-4 rotate-90" />
              </button>
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

            {/* Veterinário */}
            <div>
              <button className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-2">
                Veterinário
                <ChevronRight className="h-4 w-4 rotate-90" />
              </button>
              <div className="space-y-2 ml-1">
                {['silva', 'santos', 'todos'].map(item => (
                  <label key={item} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-[#0B2C4D] focus:ring-[#0B2C4D]"
                      checked={filters.veterinarian[item]}
                      onChange={() => handleFilterChange('veterinarian', item)}
                    />
                    {item === 'todos' ? 'Todos' : item === 'silva' ? 'Dr. Silva' : 'Dra. Santos'}
                  </label>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <button className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-2">
                Status
                <ChevronRight className="h-4 w-4 rotate-90" />
              </button>
              <div className="space-y-2 ml-1">
                {['confirmado', 'pendente', 'cancelado', 'realizado'].map(item => (
                  <label key={item} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-[#0B2C4D] focus:ring-[#0B2C4D]"
                      checked={filters.status[item]}
                      onChange={() => handleFilterChange('status', item)}
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
            
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#00BFA5] hover:bg-[#00BFA5]/90 text-white gap-2 rounded-full px-6"
            >
              <span>+</span> Novo agendamento
            </Button>

            <div className="text-lg font-bold text-gray-900 capitalize">
              {formatDateRange()}
            </div>
          </div>

          {/* Grid do Calendário */}
          <div className="flex-1 overflow-auto">
            <div className="min-w-full">
              {/* Header Dias da Semana */}
              <div className="grid grid-cols-8 border-b border-gray-100 min-h-[50px]">
                <div className="p-4 border-r border-gray-50"></div> {/* Coluna Hora */}
                {daysOfWeek.map((day, index) => {
                  // Calcular a data exata da coluna para exibir (opcional, mas ajuda na orientação)
                  const currentDay = selectedDate.getDay()
                  const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay
                  const date = new Date(selectedDate)
                  date.setDate(selectedDate.getDate() + distanceToMonday + index)
                  const isToday = date.toDateString() === new Date().toDateString()

                  return (
                    <div key={day} className={cn(
                      "p-4 text-center text-sm font-semibold border-r border-gray-50 last:border-r-0 flex items-center justify-center",
                      isToday ? "text-[#00BFA5]" : "text-gray-700"
                    )}>
                      {day} <span className="text-xs font-normal ml-1">{date.getDate()}</span>
                    </div>
                  )
                })}
              </div>

              {/* Linhas de Horário */}
              <div className="relative">
                {hours.map(hour => (
                  <div key={hour} className="grid grid-cols-8 h-32 border-b border-gray-50">
                    <div className="p-2 text-xs text-gray-400 text-right border-r border-gray-50 relative -top-3">
                      {hour}:00
                    </div>
                    {daysOfWeek.map((day, colIndex) => (
                      <div key={`${day}-${hour}`} className="border-r border-gray-50 last:border-r-0 relative group hover:bg-gray-50/50 transition-colors">
                        {/* Renderizar agendamentos aqui */}
                        {appointments.filter(apt => {
                          const aptDate = new Date(apt.start)
                          const aptHour = aptDate.getHours()
                          
                          // --- FILTRAGEM ---
                          
                          // 1. Filtro de Espécie
                          const speciesKey = apt.type.toLowerCase();
                          if (filters.species[speciesKey] === false) return false;
                          if (!['equino', 'canino', 'felino'].includes(speciesKey) && !filters.species.outros && !filters.species[speciesKey]) {
                             // Lógica para 'outros' se não for um dos tipos padrão
                             // Se type não for um dos chaves conhecidos, e 'outros' estiver off, filtra.
                             // Simplificação: assumindo tipos mapeiam direto ou caem em outros.
                             // Vamos assumir mapeamento direto por enquanto baseado no mock.
                          }

                          // 2. Filtro de Veterinário
                          // Mock data doctor names: "Dr. Silva", "Dra. Santos"
                          const docName = apt.doctor || '';
                          if (docName.includes('Silva') && !filters.veterinarian.silva) return false;
                          if (docName.includes('Santos') && !filters.veterinarian.santos) return false;
                          
                          // 3. Filtro de Status
                          // Mock status: 'pendente', 'confirmado'
                          const statusKey = apt.status?.toLowerCase() || 'pendente';
                          if (filters.status[statusKey] === false) return false;


                          // --- LÓGICA DE DATA/HORA ---
                          // Verifica se o agendamento pertence a esta semana e a este dia/hora
                          const currentDay = selectedDate.getDay() // 0-6
                          const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay
                          const weekStart = new Date(selectedDate)
                          weekStart.setDate(selectedDate.getDate() + distanceToMonday)
                          weekStart.setHours(0,0,0,0)

                          const weekEnd = new Date(weekStart)
                          weekEnd.setDate(weekStart.getDate() + 7)

                          // Verifica se está na semana visualizada
                          if (aptDate < weekStart || aptDate >= weekEnd) return false

                          // Verifica o dia da semana (0=Segunda nesta view, pois daysOfWeek começa com Segunda)
                          // aptDate.getDay(): 0=Dom, 1=Seg...
                          // colIndex: 0=Seg, ... 6=Dom
                          const aptDayIndex = aptDate.getDay() === 0 ? 6 : aptDate.getDay() - 1

                          return aptDayIndex === colIndex && aptHour === hour
                        }).map(apt => (
                          <div
                            key={apt.id}
                            onClick={() => setSelectedAppointment(apt)}
                            className={cn(
                              "absolute inset-x-1 p-2 rounded-lg text-xs cursor-pointer hover:opacity-90 transition-opacity overflow-hidden border-l-4 shadow-sm z-10",
                              apt.color
                            )}
                            style={{ 
                              top: '2px', 
                              height: 'calc(100% - 4px)',
                            }}
                          >
                            <div className="font-bold truncate">{apt.type}</div>
                            <div className="truncate font-medium">{apt.patient} ({apt.patientDetails?.split(',')[0] || ''}) -</div>
                            <div className="truncate">{apt.procedure}</div>
                            <div className="truncate opacity-90 mt-1">{apt.doctor}</div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Direita - Detalhes */}
        <div className="hidden xl:flex w-80 bg-white rounded-xl shadow-sm p-6 flex-col h-full overflow-y-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Detalhes do Agendamento</h2>
          
          {selectedAppointment ? (
            <>
              <div className="space-y-6 flex-1">
                {/* Tutor */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-[#0B2C4D]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Tutor:</p>
                    <p className="text-sm text-gray-600">{selectedAppointment.tutor || 'Ana Paula Costa'}</p>
                    <p className="text-sm text-gray-500">{selectedAppointment.tutorPhone || '(11) 98765-4321'}</p>
                  </div>
                </div>

                {/* Paciente */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0">
                    <PawPrint className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Paciente:</p>
                    <p className="text-sm text-gray-600">{selectedAppointment.patient} ({selectedAppointment.patientDetails || 'Cão, Golden Retriever, 5 anos'})</p>
                  </div>
                </div>

                {/* Motivo */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <Stethoscope className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Motivo:</p>
                    <p className="text-sm text-gray-600">{selectedAppointment.procedure}</p>
                  </div>
                </div>

                {/* Local */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Local:</p>
                    <p className="text-sm text-gray-600">{selectedAppointment.room || 'Sala de Cirurgia 2'}</p>
                  </div>
                </div>

                {/* Horário */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Horário:</p>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedAppointment.start).toLocaleDateString('pt-BR')} - {new Date(selectedAppointment.start).getHours()}:00 às {new Date(selectedAppointment.end).getHours()}:00
                    </p>
                  </div>
                </div>

                {/* Observações */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Observações:</p>
                    <p className="text-sm text-gray-600">{selectedAppointment.notes || 'Nenhuma observação registrada.'}</p>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="space-y-3 mt-6 pt-6 border-t border-gray-100">
                <Button 
                    onClick={handleConfirmAppointment}
                    className="w-full bg-[#0B2C4D] hover:bg-[#0B2C4D]/90 text-white rounded-full h-12 text-base"
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Confirmar
                </Button>
                <Button 
                    onClick={handleReschedule}
                    className="w-full bg-[#0B2C4D] hover:bg-[#0B2C4D]/90 text-white rounded-full h-12 text-base"
                >
                  <Clock className="mr-2 h-5 w-5" />
                  Reagendar
                </Button>
                <Button 
                    onClick={handleSendMessage}
                    className="w-full bg-[#00BFA5] hover:bg-[#00BFA5]/90 text-white rounded-full h-12 text-base"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Enviar mensagem
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <CalendarIcon className="h-12 w-12 mb-4 opacity-20" />
              <p>Selecione um agendamento para ver os detalhes</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Agendamento"
        className="max-w-xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Paciente</Label>
              <Input
                name="patient"
                value={newAppointment.patient}
                onChange={handleInputChange}
                placeholder="Nome do paciente"
              />
            </div>
            <div className="space-y-2">
              <Label>Espécie</Label>
              <Select
                name="type"
                value={newAppointment.type}
                onChange={handleInputChange}
              >
                <option value="Canino">Canino</option>
                <option value="Felino">Felino</option>
                <option value="Equino">Equino</option>
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
