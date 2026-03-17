import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Autocomplete } from '../../shared/Autocomplete';
import { VaccineApplication, Patient, Attendance, InventoryItem } from '../../domain/types';
import { mockDB } from '../../services/mockDatabase';
import { Syringe, Plus, Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';

interface VaccineModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendance: Attendance;
  patient: Patient;
  onSave: (updatedAttendance: Attendance) => void;
}

export const VaccineModal: React.FC<VaccineModalProps> = ({
  isOpen,
  onClose,
  attendance,
  patient,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'new'>('history');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [history, setHistory] = useState<VaccineApplication[]>([]);

  // Form State
  const [selectedVaccineToAdd, setSelectedVaccineToAdd] = useState<InventoryItem | null>(null);
  const [vaccineBatch, setVaccineBatch] = useState('');
  const [vaccineExpiry, setVaccineExpiry] = useState('');
  const [vaccineNotes, setVaccineNotes] = useState('');
  const [nextDoseDate, setNextDoseDate] = useState('');

  useEffect(() => {
    if (isOpen) {
        setInventory(mockDB.getInventory().filter(i => i.category === 'Vaccine'));
        
        // Load History
        const allAttendances = mockDB.getAttendancesByPatientId(patient.id);
        const allVaccines: VaccineApplication[] = [];
        allAttendances.forEach(att => {
            if (att.vaccines && Array.isArray(att.vaccines)) {
                allVaccines.push(...att.vaccines);
            }
        });
        // Add current session vaccines too if not saved yet (though they are in attendance state)
        if (attendance.vaccines) {
            // Avoid duplicates if attendance is already in history list (it shouldn't be if we just created it or it's in progress)
            // Actually getAttendancesByPatientId includes current one if it's saved.
            // Let's just use what we found.
        }
        
        // Sort by date desc
        allVaccines.sort((a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime());
        setHistory(allVaccines);
    }
  }, [isOpen, patient.id]);

  const handleAddVaccine = () => {
      if (selectedVaccineToAdd && vaccineBatch && vaccineExpiry) {
          const newVaccine: VaccineApplication = {
              id: Math.random().toString(36).substr(2, 9),
              attendanceId: attendance.id,
              patientId: patient.id,
              inventoryItemId: selectedVaccineToAdd.id,
              name: selectedVaccineToAdd.name,
              batch: vaccineBatch,
              manufacturer: selectedVaccineToAdd.supplier || 'Unknown',
              expiryDate: vaccineExpiry,
              applicationDate: new Date().toLocaleDateString('pt-BR'),
              price: selectedVaccineToAdd.salePrice,
              notes: vaccineNotes,
              nextDoseDate: nextDoseDate || undefined
          };
          
          const currentVaccines = attendance.vaccines || [];
          const updatedAttendance = {
              ...attendance,
              vaccines: [...currentVaccines, newVaccine]
          };

          mockDB.updateAttendance(attendance.id, { vaccines: updatedAttendance.vaccines });
          onSave(updatedAttendance);
          
          // Add to local history view immediately
          setHistory([newVaccine, ...history]);

          // Reset Form
          setSelectedVaccineToAdd(null);
          setVaccineBatch('');
          setVaccineExpiry('');
          setVaccineNotes('');
          setNextDoseDate('');
          
          alert(`Vacina ${newVaccine.name} registrada com sucesso!`);
      } else {
          alert('Preencha a vacina, lote e validade.');
      }
  };

  const getStatusColor = (vac: VaccineApplication) => {
      if (!vac.nextDoseDate) return 'text-gray-500';
      const next = new Date(vac.nextDoseDate);
      const today = new Date();
      if (next < today) return 'text-red-500 font-bold'; // Delayed
      const diffTime = Math.abs(next.getTime() - today.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      if (diffDays <= 7) return 'text-orange-500 font-bold'; // Warning
      return 'text-green-600';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-purple-600 text-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <Syringe className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-bold">Controle de Vacinas</h2>
              <p className="text-purple-100 text-sm">Paciente: {patient.name}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-white hover:bg-purple-700">
            Fechar
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
            <button 
                className={`flex-1 py-4 text-center font-medium ${activeTab === 'history' ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50' : 'text-gray-500 hover:bg-gray-50'}`}
                onClick={() => setActiveTab('history')}
            >
                Histórico e Carteirinha
            </button>
            <button 
                className={`flex-1 py-4 text-center font-medium ${activeTab === 'new' ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50' : 'text-gray-500 hover:bg-gray-50'}`}
                onClick={() => setActiveTab('new')}
            >
                Nova Aplicação
            </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {activeTab === 'new' && (
              <div className="max-w-2xl mx-auto space-y-6">
                  <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                      <h3 className="font-bold text-purple-900 mb-4 flex items-center gap-2">
                          <Plus className="h-5 w-5" />
                          Registrar Aplicação
                      </h3>
                      
                      <div className="space-y-4">
                          <div>
                              <Label>Vacina (Estoque)</Label>
                              <Autocomplete 
                                  options={inventory.map(i => ({ id: i.id, label: `${i.name} (R$ ${i.salePrice.toFixed(2)})` }))}
                                  onSelect={(opt) => {
                                      const item = inventory.find(i => i.id === opt.id);
                                      if (item) setSelectedVaccineToAdd(item);
                                  }}
                                  placeholder="Buscar vacina..."
                                  value={selectedVaccineToAdd?.name}
                              />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                  <Label>Lote</Label>
                                  <Input value={vaccineBatch} onChange={e => setVaccineBatch(e.target.value)} placeholder="Lote..." />
                              </div>
                              <div>
                                  <Label>Validade (Frasco)</Label>
                                  <Input type="date" value={vaccineExpiry} onChange={e => setVaccineExpiry(e.target.value)} />
                              </div>
                          </div>

                          <div>
                              <Label>Data da Próxima Dose (Revacina)</Label>
                              <Input type="date" value={nextDoseDate} onChange={e => setNextDoseDate(e.target.value)} className="border-purple-200 focus:border-purple-500" />
                          </div>

                          <div>
                              <Label>Observações</Label>
                              <Input value={vaccineNotes} onChange={e => setVaccineNotes(e.target.value)} placeholder="Ex: Reforço anual, animal agitado..." />
                          </div>

                          <Button onClick={handleAddVaccine} className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 text-lg">
                              Confirmar Aplicação
                          </Button>
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'history' && (
              <div className="space-y-4">
                  {history.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                          <Syringe className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p>Nenhuma vacina registrada no histórico.</p>
                      </div>
                  ) : (
                      history.map((vac, idx) => (
                          <Card key={vac.id || idx} className="border shadow-sm hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                      <div>
                                          <div className="flex items-center gap-2 mb-1">
                                              <span className="font-bold text-gray-900 text-lg">{vac.name}</span>
                                              <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">Lote: {vac.batch}</span>
                                          </div>
                                          <p className="text-sm text-gray-500 flex items-center gap-2">
                                              <Calendar className="h-4 w-4" /> Aplicado em: {vac.applicationDate}
                                          </p>
                                          {vac.notes && <p className="text-sm text-gray-600 italic mt-1">"{vac.notes}"</p>}
                                      </div>
                                      
                                      <div className="flex flex-col items-end gap-1 min-w-[150px]">
                                          {vac.nextDoseDate ? (
                                              <div className={`text-right ${getStatusColor(vac)}`}>
                                                  <div className="flex items-center justify-end gap-1 text-xs font-semibold uppercase tracking-wider">
                                                      <Clock className="h-3 w-3" />
                                                      Próxima Dose
                                                  </div>
                                                  <div className="font-bold text-lg">
                                                      {new Date(vac.nextDoseDate).toLocaleDateString('pt-BR')}
                                                  </div>
                                              </div>
                                          ) : (
                                              <span className="text-sm text-gray-400">Sem retorno agendado</span>
                                          )}
                                      </div>
                                  </div>
                              </CardContent>
                          </Card>
                      ))
                  )}
              </div>
          )}

        </div>
      </div>
    </div>
  );
};
