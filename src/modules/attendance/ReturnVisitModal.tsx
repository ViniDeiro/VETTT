import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { ReturnVisit, Patient, Attendance } from '../../domain/types';
import { mockDB } from '../../services/mockDatabase';
import { Calendar, Save } from 'lucide-react';

interface ReturnVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendance: Attendance;
  patient: Patient;
  onSave: (updatedAttendance: Attendance) => void;
}

export const ReturnVisitModal: React.FC<ReturnVisitModalProps> = ({
  isOpen,
  onClose,
  attendance,
  patient,
  onSave
}) => {
  const [date, setDate] = useState('');
  const [type, setType] = useState<'consulta' | 'vacina' | 'exame' | 'pos-cirurgico' | 'outros'>('consulta');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (!date || !reason) {
        alert('Preencha a data e o motivo do retorno.');
        return;
    }

    const newReturn: ReturnVisit = {
      id: Math.random().toString(36).substr(2, 9),
      attendanceId: attendance.id,
      date: date,
      type: type,
      reason: reason,
      notes: notes
    };

    const updatedAttendance = {
      ...attendance,
      returnVisit: newReturn
    };

    mockDB.updateAttendance(attendance.id, { returnVisit: newReturn });
    onSave(updatedAttendance);
    
    alert(`Retorno agendado para ${new Date(date).toLocaleDateString('pt-BR')}!`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-green-600 text-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-bold">Agendar Retorno</h2>
              <p className="text-green-100 text-sm">Paciente: {patient.name}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-white hover:bg-green-700">
            Fechar
          </Button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
            
            <div>
                <Label>Data do Retorno</Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>

            <div>
                <Label>Tipo de Retorno</Label>
                <select 
                    className="w-full border rounded-md p-2 text-sm mt-1"
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                >
                    <option value="consulta">Consulta de Rotina</option>
                    <option value="vacina">Vacinação</option>
                    <option value="exame">Exames</option>
                    <option value="pos-cirurgico">Pós-Cirúrgico</option>
                    <option value="outros">Outros</option>
                </select>
            </div>

            <div>
                <Label>Motivo</Label>
                <Input 
                    value={reason} 
                    onChange={e => setReason(e.target.value)} 
                    placeholder="Ex: Retirada de pontos, Reavaliação..." 
                />
            </div>

            <div>
                <Label>Observações</Label>
                <textarea 
                    className="w-full border rounded-md p-2 text-sm min-h-[80px]"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Instruções para o retorno..."
                />
            </div>

            <Button onClick={handleSave} className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-lg">
                <Save className="h-4 w-4 mr-2" /> Confirmar Agendamento
            </Button>

        </div>
      </div>
    </div>
  );
};
