import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { AppliedProcedure, Patient, Attendance, ProcedureTemplate } from '../../domain/types';
import { mockDB } from '../../services/mockDatabase';
import { Activity, Plus, Trash2, Calendar, FileText } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';

interface SurgeryModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendance: Attendance;
  patient: Patient;
  onSave: (updatedAttendance: Attendance) => void;
}

export const SurgeryModal: React.FC<SurgeryModalProps> = ({
  isOpen,
  onClose,
  attendance,
  patient,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState<'realizadas' | 'agendar'>('realizadas');
  const [proceduresList, setProceduresList] = useState<ProcedureTemplate[]>(mockDB.getProcedures().filter(p => p.name.toLowerCase().includes('cirurgia') || p.name.toLowerCase().includes('castração') || p.baseCost > 500)); // Simulating filtering for surgeries
  const [selectedProcedureId, setSelectedProcedureId] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [notes, setNotes] = useState('');
  
  // Agendamento State
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('08:00');

  const handleAddSurgery = () => {
    if (!selectedProcedureId) return;

    const template = proceduresList.find(p => p.id === selectedProcedureId);
    if (!template) return;

    const price = customPrice ? Number(customPrice) : template.baseCost;

    const newSurgery: AppliedProcedure = {
      id: Math.random().toString(36).substr(2, 9),
      attendanceId: attendance.id,
      name: `Cirurgia: ${template.name}`,
      price: price,
      notes: notes,
      timestamp: new Date().toISOString()
    };

    const currentProcedures = attendance.procedures || [];
    
    const updatedAttendance = {
      ...attendance,
      procedures: [...currentProcedures, newSurgery]
    };

    mockDB.updateAttendance(attendance.id, { procedures: updatedAttendance.procedures });
    onSave(updatedAttendance);

    setSelectedProcedureId('');
    setCustomPrice('');
    setNotes('');
    
    alert(`Cirurgia ${template.name} registrada com sucesso!`);
  };

  const handleScheduleSurgery = () => {
      if (!selectedProcedureId || !scheduleDate || !scheduleTime) {
          alert('Preencha a cirurgia, data e horário.');
          return;
      }
      
      const template = proceduresList.find(p => p.id === selectedProcedureId);
      
      const [h, m] = scheduleTime.split(':');
      const endHour = String(Number(h) + 2).padStart(2, '0'); // Surgeries take 2 hours default
      const endTime = `${endHour}:${m}`;

      const surgeryAppt = {
          id: Math.random().toString(36).substr(2, 9),
          title: `Cirurgia: ${patient.name} (${template?.name})`,
          start: new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString(),
          end: new Date(`${scheduleDate}T${endTime}:00`).toISOString(),
          patientId: patient.id,
          doctor: attendance.vetId || 'Equipe Cirúrgica',
          type: 'cirurgia',
          status: 'confirmed'
      };
      
      mockDB.appointments.push(surgeryAppt as any);
      mockDB.save('vet_appointments', mockDB.appointments);
      
      alert('Cirurgia agendada com sucesso na agenda geral!');
      
      // Reset
      setSelectedProcedureId('');
      setScheduleDate('');
      setNotes('');
  };

  const handleRemoveSurgery = (id: string) => {
    const currentProcedures = attendance.procedures || [];
    const updatedAttendance = {
      ...attendance,
      procedures: currentProcedures.filter(p => p.id !== id)
    };
    mockDB.updateAttendance(attendance.id, { procedures: updatedAttendance.procedures });
    onSave(updatedAttendance);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-red-600 text-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-bold">Módulo de Cirurgias</h2>
              <p className="text-red-100 text-sm">Paciente: {patient.name}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-white hover:bg-red-700">
            Fechar
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50">
            <button 
                className={`px-6 py-3 font-medium text-sm ${activeTab === 'realizadas' ? 'bg-white border-t-2 border-red-600 text-red-600' : 'text-gray-600 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('realizadas')}
            >
                Cirurgias Realizadas Hoje
            </button>
            <button 
                className={`px-6 py-3 font-medium text-sm ${activeTab === 'agendar' ? 'bg-white border-t-2 border-red-600 text-red-600' : 'text-gray-600 hover:bg-gray-100'}`}
                onClick={() => setActiveTab('agendar')}
            >
                Agendar Nova Cirurgia
            </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Form */}
          <div className="lg:col-span-1 space-y-6 border-r pr-6">
            <div className="bg-red-50 p-6 rounded-xl border border-red-100 space-y-4">
                <h3 className="font-bold text-red-900 mb-2">
                    {activeTab === 'realizadas' ? 'Registrar Cirurgia' : 'Agendar Cirurgia'}
                </h3>
                
                <div>
                    <Label>Selecione a Cirurgia</Label>
                    <select 
                        className="w-full border rounded-md p-2 text-sm mt-1"
                        value={selectedProcedureId}
                        onChange={e => {
                            setSelectedProcedureId(e.target.value);
                            const p = proceduresList.find(proc => proc.id === e.target.value);
                            if(p) setCustomPrice(p.baseCost.toString());
                        }}
                    >
                        <option value="">Selecione...</option>
                        {proceduresList.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                {activeTab === 'realizadas' ? (
                    <>
                        <div>
                            <Label>Valor Cobrado (R$)</Label>
                            <Input 
                                type="number" 
                                value={customPrice} 
                                onChange={e => setCustomPrice(e.target.value)} 
                            />
                        </div>

                        <div>
                            <Label>Relatório Cirúrgico (Resumo)</Label>
                            <textarea 
                                className="w-full border rounded-md p-2 text-sm min-h-[80px]"
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="Tempo de cirurgia, intercorrências, fios utilizados..."
                            />
                        </div>

                        <Button onClick={handleAddSurgery} className="w-full bg-red-600 hover:bg-red-700 text-white">
                            <Plus className="h-4 w-4 mr-2" /> Registrar Realização
                        </Button>
                    </>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label>Data</Label>
                                <Input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} />
                            </div>
                            <div>
                                <Label>Horário</Label>
                                <Input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <Label>Instruções Pré-Operatórias</Label>
                            <textarea 
                                className="w-full border rounded-md p-2 text-sm min-h-[80px]"
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="Ex: Jejum hídrico de 8h..."
                            />
                        </div>

                        <Button onClick={handleScheduleSurgery} className="w-full bg-red-600 hover:bg-red-700 text-white">
                            <Calendar className="h-4 w-4 mr-2" /> Confirmar Agendamento
                        </Button>
                    </>
                )}
            </div>
          </div>

          {/* Right: List */}
          <div className="lg:col-span-2 flex flex-col h-full">
            <h3 className="font-semibold text-gray-700 mb-4">
                {activeTab === 'realizadas' ? 'Histórico de Cirurgias Deste Atendimento' : 'Próximas Cirurgias Agendadas (Geral)'}
            </h3>

            <div className="flex-1 bg-gray-50 rounded-xl border p-4 overflow-y-auto space-y-3">
              {activeTab === 'realizadas' ? (
                  (!attendance.procedures || attendance.procedures.filter(p => p.name.includes('Cirurgia')).length === 0) ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                      <Activity className="h-16 w-16 mb-4" />
                      <p>Nenhuma cirurgia registrada neste atendimento.</p>
                    </div>
                  ) : (
                    attendance.procedures.filter(p => p.name.includes('Cirurgia')).map((proc, idx) => (
                      <Card key={proc.id} className="relative group border border-red-100 shadow-sm hover:shadow-md transition-all">
                        <CardContent className="p-4 flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-800 text-lg">{proc.name}</span>
                                </div>
                                {proc.notes && (
                                    <p className="text-sm text-gray-500 mt-1 italic">"{proc.notes}"</p>
                                )}
                                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                    <FileText className="w-3 h-3"/> Relatório anexado
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-red-600 text-lg">
                                    R$ {proc.price.toFixed(2)}
                                </div>
                                <button 
                                    onClick={() => handleRemoveSurgery(proc.id)}
                                    className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors mt-2"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </CardContent>
                      </Card>
                    ))
                  )
              ) : (
                  // Show scheduled surgeries from the main agenda
                  mockDB.appointments.filter(a => a.patientId === patient.id && a.type === 'cirurgia').length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                        <Calendar className="h-16 w-16 mb-4" />
                        <p>Nenhuma cirurgia agendada para este paciente.</p>
                      </div>
                  ) : (
                      mockDB.appointments.filter(a => a.patientId === patient.id && a.type === 'cirurgia').map(appt => (
                          <Card key={appt.id} className="border border-blue-100 shadow-sm">
                              <CardContent className="p-4 flex justify-between items-center">
                                  <div>
                                      <p className="font-bold text-blue-900">{appt.title}</p>
                                      <p className="text-sm text-gray-600 mt-1">Data: {new Date(appt.start).toLocaleString('pt-BR')}</p>
                                  </div>
                                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold uppercase">Agendada</span>
                              </CardContent>
                          </Card>
                      ))
                  )
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
