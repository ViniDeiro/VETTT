import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { ExamRequest, ExamItem, Patient, Attendance } from '../../domain/types';
import { supabaseDataService } from '../../services/supabaseDataService';
import { pdfService } from '../../services/pdfService';
import { Plus, Trash2, Printer, Save, FileText, Activity } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';

interface ExamRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendance: Attendance;
  patient: Patient;
  onSave: (updatedAttendance: Attendance) => void;
}

const COMMON_EXAMS = [
    { name: 'Hemograma Completo', type: 'laboratory' },
    { name: 'Bioquímico (Renal/Hepático)', type: 'laboratory' },
    { name: 'Raio-X Tórax', type: 'imaging' },
    { name: 'Ultrassom Abdominal', type: 'imaging' },
    { name: 'Ecocardiograma', type: 'cardiology' },
    { name: 'Urinálise', type: 'laboratory' },
    { name: 'Coprocultura', type: 'laboratory' }
];

export const ExamRequestModal: React.FC<ExamRequestModalProps> = ({
  isOpen,
  onClose,
  attendance,
  patient,
  onSave
}) => {
  const [items, setItems] = useState<ExamItem[]>([]);
  
  // Form State
  const [clinicalIndication, setClinicalIndication] = useState('');
  const [priority, setPriority] = useState<'routine' | 'urgent'>('routine');
  
  const [examName, setExamName] = useState('');
  const [examType, setExamType] = useState<'laboratory' | 'imaging' | 'cardiology' | 'other'>('laboratory');
  const [instructions, setInstructions] = useState('');

  // When exam name changes, try to auto-fill type and instructions if it matches a common exam
  const handleExamNameChange = (name: string) => {
      setExamName(name);
      const common = COMMON_EXAMS.find(e => e.name.toLowerCase() === name.toLowerCase());
      if (common) {
          setExamType(common.type as any);
          if (common.type === 'imaging' && !instructions) {
              setInstructions('Jejum alimentar de 8h');
          }
      }
  };

  const handleAddExam = () => {
      if (!examName) return;
      const newItem: ExamItem = {
          id: Math.random().toString(36).substr(2, 9),
          name: examName,
          type: examType,
          instructions: instructions
      };
      setItems([...items, newItem]);
      setExamName('');
      setInstructions('');
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleSave = async (print: boolean = false) => {
    if (items.length === 0) {
      alert('Adicione pelo menos um exame à solicitação.');
      return;
    }

    const newRequest: ExamRequest = {
      id: Math.random().toString(36).substr(2, 9),
      attendanceId: attendance.id,
      date: new Date().toLocaleDateString('pt-BR'),
      items: items,
      clinicalIndication,
      priority
    };

    // Update Attendance
    const currentRequests = attendance.examRequests || [];
    const updatedRequests = [...currentRequests, newRequest];
    const updatedAttendance = {
      ...attendance,
      examRequests: updatedRequests
    };

    try {
      // Save to DB
      await supabaseDataService.updateAttendance(attendance.id, { examRequests: updatedRequests });
      
      // Notify Parent
      onSave(updatedAttendance);

      if (print) {
        const ownersList = await supabaseDataService.getOwners();
        const owner = ownersList.find(item => item.id === patient.ownerId);
        const ownerName = owner?.name || attendance.ownerName || patient.ownerName || 'Tutor não informado';
        await pdfService.generateExamRequestPdf(patient, newRequest, ownerName);
      } else {
        alert('Solicitação de exames salva com sucesso!');
      }
      
      // Clear and Close
      setItems([]);
      setClinicalIndication('');
      onClose();
    } catch (err) {
      console.error('Erro ao salvar solicitação de exames:', err);
      alert('Erro ao salvar solicitação de exames no banco de dados.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-teal-600 text-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-bold">Solicitar Exames</h2>
              <p className="text-teal-100 text-sm">Paciente: {patient.name}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-white hover:bg-teal-700">
            Fechar
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Form */}
          <div className="lg:col-span-1 space-y-6 border-r pr-6">
            
            <div>
                <Label className="mb-2 block">Prioridade</Label>
                <div className="flex gap-2">
                    <button
                        className={`flex-1 py-2 px-3 text-sm rounded-lg border transition-colors ${priority === 'routine' ? 'bg-green-100 border-green-300 text-green-800 font-medium' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        onClick={() => setPriority('routine')}
                    >
                        Rotina
                    </button>
                    <button
                        className={`flex-1 py-2 px-3 text-sm rounded-lg border transition-colors ${priority === 'urgent' ? 'bg-red-100 border-red-300 text-red-800 font-medium' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        onClick={() => setPriority('urgent')}
                    >
                        Urgente
                    </button>
                </div>
            </div>

            <div>
                <Label>Indicação Clínica / Suspeita</Label>
                <textarea 
                    className="w-full border rounded-md p-2 text-sm min-h-[80px]"
                    value={clinicalIndication}
                    onChange={e => setClinicalIndication(e.target.value)}
                    placeholder="Ex: Suspeita de corpo estranho, vômitos há 2 dias..."
                />
            </div>

            <hr className="border-gray-200" />

            <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Adicionar Exame</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
                    <div>
                        <Label>Nome do Exame *</Label>
                        <Input 
                            value={examName} 
                            onChange={e => handleExamNameChange(e.target.value)} 
                            placeholder="Digite ou selecione da lista..." 
                            className="bg-white mt-1"
                            list="common-exams-list"
                        />
                        <datalist id="common-exams-list">
                            {COMMON_EXAMS.map(e => <option key={e.name} value={e.name} />)}
                        </datalist>
                    </div>

                    <div>
                        <Label>Categoria</Label>
                        <select 
                            className="w-full border rounded-md p-2 text-sm bg-white mt-1"
                            value={examType}
                            onChange={e => setExamType(e.target.value as any)}
                        >
                            <option value="laboratory">Laboratorial</option>
                            <option value="imaging">Imagem</option>
                            <option value="cardiology">Cardio</option>
                            <option value="other">Outros</option>
                        </select>
                    </div>

                    <div>
                        <Label>Instruções de Preparo (Opcional)</Label>
                        <Input 
                            value={instructions} 
                            onChange={e => setInstructions(e.target.value)} 
                            placeholder="Ex: Jejum 8h..." 
                            className="bg-white mt-1"
                        />
                    </div>

                    <Button onClick={handleAddExam} disabled={!examName} className="w-full bg-teal-600 hover:bg-teal-700 text-white mt-2">
                        <Plus className="h-4 w-4 mr-2" /> Adicionar Exame
                    </Button>
                </div>
            </div>

          </div>

          {/* Right: Preview List */}
          <div className="lg:col-span-2 flex flex-col h-full">
            <h3 className="font-semibold text-gray-700 mb-4 flex justify-between items-center">
              <span>Exames Solicitados ({items.length})</span>
            </h3>

            <div className="flex-1 bg-gray-50 rounded-xl border p-4 overflow-y-auto space-y-3">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                  <Activity className="h-16 w-16 mb-4" />
                  <p>Nenhum exame adicionado ainda.</p>
                </div>
              ) : (
                items.map((item, idx) => (
                  <Card key={item.id} className="relative group border shadow-sm">
                    <CardContent className="p-4 flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-800">{idx + 1}. {item.name}</span>
                                <span className="text-xs px-2 py-0.5 bg-gray-200 rounded-full text-gray-600 uppercase font-bold">{item.type}</span>
                            </div>
                            {item.instructions && (
                                <p className="text-sm text-gray-500 mt-1">Preparo: {item.instructions}</p>
                            )}
                        </div>
                        <button 
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Footer Actions */}
            <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
               <Button 
                variant="outline" 
                onClick={() => handleSave(false)}
                className="border-teal-200 text-teal-700 hover:bg-teal-50"
              >
                <Save className="h-4 w-4 mr-2" /> Salvar (Sem Imprimir)
              </Button>
              <Button 
                onClick={() => handleSave(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-900/20"
              >
                <Printer className="h-4 w-4 mr-2" /> Salvar e Imprimir PDF
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
