import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Select } from '../../components/ui/Select';
import { Prescription, PrescriptionItem, Patient, Attendance } from '../../domain/types';
import { supabaseDataService } from '../../services/supabaseDataService';
import { pdfService } from '../../services/pdfService';
import { Plus, Trash2, Printer, Save, FileText, Share2 } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendance: Attendance;
  patient: Patient;
  onSave: (updatedAttendance: Attendance) => void;
}

export const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  isOpen,
  onClose,
  attendance,
  patient,
  onSave
}) => {
  const [items, setItems] = useState<PrescriptionItem[]>([]);
  
  // Form State
  const [type, setType] = useState<'industrialized' | 'compounded'>('industrialized');
  const [name, setName] = useState('');
  const [concentration, setConcentration] = useState(''); // Also used for vehicle in compounded
  const [formula, setFormula] = useState(''); // Specific for compounded
  const [quantity, setQuantity] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('');
  const [route, setRoute] = useState('Oral');
  const [instructions, setInstructions] = useState('');
  const [controlledMedication, setControlledMedication] = useState(false);

  // Load existing if editing? For now, we always create a new one or just append to list.
  // Requirement says "Reedição", so maybe we should list existing prescriptions too?
  // Let's focus on creating a NEW prescription first.
  
  const handleAddItem = () => {
    if (!name || !quantity || !dosage || !frequency || !duration) {
      alert('Preencha os campos obrigatórios: Nome, Quantidade, Posologia, Frequência e Duração.');
      return;
    }

    const newItem: PrescriptionItem = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      name,
      concentration,
      formula,
      quantity,
      dosage,
      frequency,
      duration,
      route,
      instructions
    };

    setItems([...items, newItem]);
    
    // Reset Form (keep some fields like route?)
    setName('');
    setConcentration('');
    setFormula('');
    setQuantity('');
    setDosage('');
    // setFrequency(''); // Often repeated
    // setDuration(''); // Often repeated
    setInstructions('');
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleSave = async (print: boolean = false) => {
    if (items.length === 0) {
      alert('Adicione pelo menos um item à prescrição.');
      return;
    }

    const newPrescription: Prescription = {
      id: Math.random().toString(36).substr(2, 9),
      attendanceId: attendance.id,
      date: new Date().toLocaleDateString('pt-BR'),
      items: items,
      digitalSignature: true, // Auto-sign for now
      controlledMedication
    };

    // Update Attendance
    const currentPrescriptions = attendance.prescriptions || [];
    const updatedPrescriptions = [...currentPrescriptions, newPrescription];
    const updatedAttendance = {
      ...attendance,
      prescriptions: updatedPrescriptions
    };

    try {
      // Save to DB
      await supabaseDataService.updateAttendance(attendance.id, { prescriptions: updatedPrescriptions });
      
      // Notify Parent
      onSave(updatedAttendance);

      if (print) {
        const ownersList = await supabaseDataService.getOwners();
        const owner = ownersList.find(item => item.id === patient.ownerId);
        const ownerName = owner?.name || attendance.ownerName || patient.ownerName || 'Tutor não informado';
        await pdfService.generatePrescriptionPdf(patient, newPrescription, ownerName);
      } else {
        alert('Prescrição salva com sucesso!');
      }
      
      // Clear and Close
      setItems([]);
      setControlledMedication(false);
      onClose();
    } catch (err) {
      console.error('Erro ao salvar prescrição:', err);
      alert('Erro ao salvar prescrição no banco de dados.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-blue-600 text-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-bold">Nova Prescrição</h2>
              <p className="text-blue-100 text-sm">Paciente: {patient.name}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-white hover:bg-blue-700">
            Fechar
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Form */}
          <div className="lg:col-span-1 space-y-4 border-r pr-6">
            <h3 className="font-semibold text-gray-700 mb-2">Adicionar Item</h3>
            
            <div>
              <Label>Tipo</Label>
              <div className="flex gap-2 mt-1">
                <button
                  className={`flex-1 py-2 px-3 text-sm rounded-lg border transition-colors ${type === 'industrialized' ? 'bg-blue-100 border-blue-300 text-blue-800 font-medium' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  onClick={() => setType('industrialized')}
                >
                  Industrializado
                </button>
                <button
                  className={`flex-1 py-2 px-3 text-sm rounded-lg border transition-colors ${type === 'compounded' ? 'bg-purple-100 border-purple-300 text-purple-800 font-medium' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  onClick={() => setType('compounded')}
                >
                  Manipulado
                </button>
              </div>
            </div>

            {type === 'industrialized' ? (
                <>
                    <div>
                        <Label>Nome do Fármaco *</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Amoxicilina + Clavulanato" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label>Concentração</Label>
                            <Input value={concentration} onChange={e => setConcentration(e.target.value)} placeholder="Ex: 250mg" />
                        </div>
                        <div>
                            <Label>Quantidade *</Label>
                            <Input value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="Ex: 1 cx / 30 caps" />
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div>
                        <Label>Uso (Finalidade / Nome da Fórmula) *</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Pomada Cicatrizante / Uso Interno" />
                    </div>
                    <div>
                        <Label>Componentes da Fórmula *</Label>
                        <textarea 
                            className="w-full border rounded-md p-2 text-sm min-h-[80px]"
                            value={formula}
                            onChange={e => setFormula(e.target.value)}
                            placeholder="Ex: Clorexidina 2%&#10;Cetoconazol 1%"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label>Veículo q.s.p</Label>
                            <Input value={concentration} onChange={e => setConcentration(e.target.value)} placeholder="Ex: 100g (Pomada base)" />
                        </div>
                        <div>
                            <Label>Quantidade Total *</Label>
                            <Input value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="Ex: 1 pote / 30 sachês" />
                        </div>
                    </div>
                </>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                 <Label>Via</Label>
                 <select 
                    className="w-full border rounded-md p-2 text-sm"
                    value={route}
                    onChange={e => setRoute(e.target.value)}
                 >
                    <option>Oral</option>
                    <option>Tópico</option>
                    <option>Oftálmico</option>
                    <option>Otológico</option>
                    <option>Subcutâneo</option>
                    <option>Intramuscular</option>
                    <option>Intravenoso</option>
                 </select>
              </div>
              <div>
                <Label>Posologia *</Label>
                <Input value={dosage} onChange={e => setDosage(e.target.value)} placeholder="Ex: 1 comp / 5ml" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Frequência *</Label>
                <Input value={frequency} onChange={e => setFrequency(e.target.value)} placeholder="Ex: 12/12h" />
              </div>
              <div>
                <Label>Duração *</Label>
                <Input value={duration} onChange={e => setDuration(e.target.value)} placeholder="Ex: 7 dias" />
              </div>
            </div>

            <div>
              <Label>Instruções / Obs</Label>
              <textarea 
                className="w-full border rounded-md p-2 text-sm min-h-[80px]"
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                placeholder="Ex: Dar junto com a comida..."
              />
            </div>

            <label className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <input type="checkbox" checked={controlledMedication} onChange={event => setControlledMedication(event.target.checked)} />
              Medicamento controlado (emitir em 2 vias com dados completos do veterinário)
            </label>

            <Button onClick={handleAddItem} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" /> Adicionar à Receita
            </Button>
          </div>

          {/* Right: Preview List */}
          <div className="lg:col-span-2 flex flex-col h-full">
            <h3 className="font-semibold text-gray-700 mb-4 flex justify-between items-center">
              <span>Itens da Receita ({items.length})</span>
              <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">Prévia</span>
            </h3>

            <div className="flex-1 bg-gray-50 rounded-xl border p-4 overflow-y-auto space-y-3">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                  <FileText className="h-16 w-16 mb-4" />
                  <p>Nenhum item adicionado ainda.</p>
                </div>
              ) : (
                items.map((item, idx) => (
                  <Card key={item.id} className="relative group border shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-800 text-lg">{idx + 1}. {item.name}</span>
                            {item.concentration && <span className="text-gray-600 font-medium">{item.concentration}</span>}
                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${item.type === 'industrialized' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                              {item.type === 'industrialized' ? 'IND' : 'MAN'}
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1 ml-4 border-l-2 border-gray-200 pl-3 mt-2">
                            {item.type === 'compounded' && item.formula && (
                                <div className="mb-2 bg-purple-50 p-2 rounded text-purple-900 font-mono text-xs whitespace-pre-wrap">
                                    {item.formula}
                                    <br/>
                                    {item.concentration && <span className="font-semibold block mt-1">Veículo q.s.p: {item.concentration}</span>}
                                </div>
                            )}
                            <p><span className="font-semibold">Uso:</span> {item.route} - {item.dosage}</p>
                            <p><span className="font-semibold">Frequência:</span> {item.frequency} | <span className="font-semibold">Duração:</span> {item.duration}</p>
                            {item.instructions && <p className="text-gray-500 italic mt-1">"{item.instructions}"</p>}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="bg-gray-100 px-3 py-1 rounded text-sm font-bold text-gray-700 mb-2 inline-block">
                            Qtd: {item.quantity}
                          </div>
                          <br/>
                          <button 
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
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
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Save className="h-4 w-4 mr-2" /> Salvar (Sem Imprimir)
              </Button>
              <Button 
                onClick={() => handleSave(true)}
                className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20"
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
