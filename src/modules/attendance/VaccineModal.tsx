import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Autocomplete } from '../../shared/Autocomplete';
import { VaccineApplication, Patient, Attendance, InventoryItem } from '../../domain/types';
import { supabaseDataService } from '../../services/supabaseDataService';
import { Calendar, Clock, Plus, Syringe, CheckCircle, AlertTriangle } from 'lucide-react';
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
  const [vaccineType, setVaccineType] = useState('V8');
  const [vaccineNameInput, setVaccineNameInput] = useState('');
  const [vaccineDose, setVaccineDose] = useState('1ª Dose');
  const [selectedVaccineToAdd, setSelectedVaccineToAdd] = useState<InventoryItem | null>(null);
  const [vaccineBatch, setVaccineBatch] = useState('');
  const [vaccineManufacturer, setVaccineManufacturer] = useState('');
  const [vaccineManufacturingDate, setVaccineManufacturingDate] = useState('');
  const [vaccineExpiry, setVaccineExpiry] = useState('');
  const [vaccineNotes, setVaccineNotes] = useState('');
  const [nextDoseDate, setNextDoseDate] = useState('');

  useEffect(() => {
    if (isOpen) {
        const loadData = async () => {
            try {
                const [invList, allAttendances] = await Promise.all([
                    supabaseDataService.getInventory(),
                    supabaseDataService.getAttendancesByPatientId(patient.id)
                ]);
                
                setInventory(invList.filter(i => i.category === 'Vaccine'));
                
                const allVaccines: VaccineApplication[] = [];
                allAttendances.forEach(att => {
                    if (att.vaccines && Array.isArray(att.vaccines)) {
                        allVaccines.push(...att.vaccines);
                    }
                });
                
                allVaccines.sort((a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime());
                setHistory(allVaccines);
            } catch (err) {
                console.error('Erro ao carregar vacinas/histórico:', err);
            }
        };
        loadData();
    }
  }, [isOpen, patient.id]);

  useEffect(() => {
    const normalizedInput = vaccineNameInput.trim().toLowerCase();
    if (!normalizedInput) return;

    const stockMatch = inventory.find(item => item.name.trim().toLowerCase() === normalizedInput) || null;
    if (!stockMatch) return;

    setSelectedVaccineToAdd(stockMatch);
    setVaccineManufacturer(current => current || stockMatch.manufacturer || stockMatch.supplier || '');
    setVaccineBatch(current => current || stockMatch.batchNumber || '');
    setVaccineManufacturingDate(current => current || stockMatch.manufacturingDate || '');
    setVaccineExpiry(current => current || stockMatch.expiryDate || stockMatch.validity || '');
  }, [vaccineNameInput, inventory]);

  const handleAddVaccine = async () => {
      const finalName = selectedVaccineToAdd ? selectedVaccineToAdd.name : vaccineNameInput;

      if (finalName && vaccineBatch && vaccineExpiry) {
          const newVaccine: VaccineApplication = {
              id: Math.random().toString(36).substr(2, 9),
              attendanceId: attendance.id,
              patientId: patient.id,
              inventoryItemId: selectedVaccineToAdd?.id || '',
              type: vaccineType,
              name: finalName,
              dose: vaccineDose,
              batch: vaccineBatch,
              manufacturer: vaccineManufacturer || selectedVaccineToAdd?.manufacturer || selectedVaccineToAdd?.supplier || 'Desconhecido',
              manufacturingDate: vaccineManufacturingDate,
              expiryDate: vaccineExpiry,
              applicationDate: new Date().toLocaleDateString('pt-BR'),
              price: selectedVaccineToAdd?.salePrice || 0,
              notes: vaccineNotes,
              nextDoseDate: nextDoseDate || undefined
          };
          
          const currentVaccines = attendance.vaccines || [];
          const updatedAttendance = {
              ...attendance,
              vaccines: [...currentVaccines, newVaccine]
          };

          // Auto-schedule return visit for vaccine
          if (nextDoseDate) {
              const [y, m, d] = nextDoseDate.split('-');
              const returnVisit = {
                  date: new Date(Number(y), Number(m)-1, Number(d)).toISOString(),
                  reason: `Revacina: ${finalName}`,
                  type: 'Vaccine' as const,
                  time: '09:00' // Default time
              };
              updatedAttendance.returnVisit = returnVisit;
          }

          try {
              await supabaseDataService.updateAttendance(attendance.id, { 
                  vaccines: updatedAttendance.vaccines,
                  returnVisit: updatedAttendance.returnVisit 
              });
              onSave(updatedAttendance);
              
              // Add to local history view immediately
              setHistory([newVaccine, ...history]);

              // Reset Form
              setSelectedVaccineToAdd(null);
              setVaccineNameInput('');
              setVaccineManufacturer('');
              setVaccineBatch('');
              setVaccineManufacturingDate('');
              setVaccineExpiry('');
              setVaccineNotes('');
              setNextDoseDate('');
              
              alert(`Vacina ${newVaccine.name} registrada com sucesso!${nextDoseDate ? '\nAgendamento de revacina criado automaticamente.' : ''}`);
          } catch (err) {
              console.error('Erro ao registrar vacina:', err);
              alert('Erro ao salvar vacina no banco de dados.');
          }
      } else {
          alert('Preencha a vacina (nome), lote e validade.');
      }
  };

  const setNextDoseByDays = (days: number) => {
      const d = new Date();
      d.setDate(d.getDate() + days);
      setNextDoseDate(d.toISOString().split('T')[0]);
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
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                  <Label>Tipo de Vacina *</Label>
                                  <select 
                                      className="w-full border rounded-md p-2 mt-1"
                                      value={vaccineType}
                                      onChange={e => setVaccineType(e.target.value)}
                                  >
                                      <option value="V8">V8</option>
                                      <option value="V10">V10</option>
                                      <option value="Raiva">Raiva</option>
                                      <option value="Giardíase">Giardíase</option>
                                      <option value="Garrotilho">Garrotilho</option>
                                      <option value="Gripe">Gripe</option>
                                      <option value="Leishmaniose">Leishmaniose</option>
                                      <option value="Outra">Outra</option>
                                  </select>
                              </div>
                              <div>
                                  <Label>Dose *</Label>
                                  <select 
                                      className="w-full border rounded-md p-2 mt-1"
                                      value={vaccineDose}
                                      onChange={e => setVaccineDose(e.target.value)}
                                  >
                                      <option value="1ª Dose">1ª Dose</option>
                                      <option value="2ª Dose">2ª Dose</option>
                                      <option value="3ª Dose">3ª Dose</option>
                                      <option value="Reforço Anual">Reforço Anual</option>
                                      <option value="Dose Única">Dose Única</option>
                                  </select>
                              </div>
                          </div>

                          <div>
                              <Label>Nome do Produto (Estoque ou Manual) *</Label>
                              <Input 
                                  value={selectedVaccineToAdd ? selectedVaccineToAdd.name : vaccineNameInput}
                                  onChange={e => {
                                      setVaccineNameInput(e.target.value);
                                      setSelectedVaccineToAdd(null);
                                      setVaccineManufacturer('');
                                      setVaccineBatch('');
                                      setVaccineManufacturingDate('');
                                      setVaccineExpiry('');
                                  }}
                                  placeholder="Ex: Rabisin, Lexton Gold..."
                                  list="vaccine-stock-list"
                              />
                              <datalist id="vaccine-stock-list">
                                  {inventory.map(i => <option key={i.id} value={i.name} />)}
                              </datalist>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                  <Label>Nome do Fabricante</Label>
                                  <Input value={vaccineManufacturer} onChange={e => setVaccineManufacturer(e.target.value)} placeholder="Ex: Zoetis, Boehringer..." />
                              </div>
                              <div>
                                  <Label>Lote *</Label>
                                  <Input value={vaccineBatch} onChange={e => setVaccineBatch(e.target.value)} placeholder="Lote do frasco..." />
                              </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                  <Label>Data de Fabricação</Label>
                                  <Input type="date" value={vaccineManufacturingDate} onChange={e => setVaccineManufacturingDate(e.target.value)} />
                              </div>
                              <div>
                                  <Label>Validade (Frasco) *</Label>
                                  <Input type="date" value={vaccineExpiry} onChange={e => setVaccineExpiry(e.target.value)} />
                              </div>
                          </div>

                          <div>
                              <Label>Data da Próxima Dose (Revacina)</Label>
                              <div className="flex gap-2 mb-2">
                                  <button onClick={() => setNextDoseByDays(15)} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200">+15 dias</button>
                                  <button onClick={() => setNextDoseByDays(21)} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200">+21 dias</button>
                                  <button onClick={() => setNextDoseByDays(30)} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200">+30 dias</button>
                                  <button onClick={() => setNextDoseByDays(365)} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200">+1 ano</button>
                              </div>
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
              <div className="space-y-6">
                  {history.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                          <Syringe className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p>Nenhuma vacina registrada no histórico.</p>
                      </div>
                  ) : (
                      <>
                          {/* Categorized Lists */}
                          {['Atrasadas', 'Programadas', 'Aplicadas'].map(category => {
                              const filteredHistory = history.filter(vac => {
                                  const today = new Date();
                                  today.setHours(0,0,0,0);
                                  
                                  if (category === 'Aplicadas') {
                                      // If it doesn't have a next dose, or if it was applied, it goes here.
                                      // Wait, we want to separate "Past Applications" from "Future Reminders".
                                      // Every entry in 'history' IS an application. We just highlight the ones needing return.
                                      // Let's adjust logic: 
                                      return true; // Actually, all of them are "Aplicadas" because they are in the history of applications.
                                  }
                                  return false;
                              });

                              // Better Logic: We show all applied. But we extract "Pending Returns" to the top.
                              return null;
                          })}

                          {/* Vacinas Atrasadas e Programadas (Based on nextDoseDate) */}
                          {(() => {
                              const today = new Date();
                              today.setHours(0,0,0,0);
                              
                              const pendingReturns = history.filter(v => v.nextDoseDate).map(v => ({
                                  ...v,
                                  isDelayed: new Date(v.nextDoseDate!) < today
                              })).sort((a, b) => new Date(a.nextDoseDate!).getTime() - new Date(b.nextDoseDate!).getTime());

                              const delayed = pendingReturns.filter(v => v.isDelayed);
                              const scheduled = pendingReturns.filter(v => !v.isDelayed);

                              return (
                                  <>
                                      {delayed.length > 0 && (
                                          <div className="mb-6">
                                              <h3 className="font-bold text-red-600 mb-3 flex items-center gap-2 border-b border-red-100 pb-2">
                                                  <AlertTriangle className="h-5 w-5" /> Vacinas Atrasadas
                                              </h3>
                                              <div className="space-y-3">
                                                  {delayed.map((vac, idx) => (
                                                      <Card key={`del-${idx}`} className="border-red-200 bg-red-50 shadow-sm">
                                                          <CardContent className="p-4 flex justify-between items-center">
                                                              <div>
                                                                  <div className="flex items-center gap-2 mb-1">
                                                                      <span className="bg-red-200 text-red-800 text-xs font-bold px-2 py-0.5 rounded">{vac.type}</span>
                                                                      <span className="font-bold text-gray-900">{vac.name}</span>
                                                                  </div>
                                                                  <p className="text-sm text-red-700 font-medium">Reforço + (Era para {new Date(vac.nextDoseDate!).toLocaleDateString('pt-BR')})</p>
                                                              </div>
                                                              <Button size="sm" variant="outline" className="bg-white border-red-200 text-red-600 hover:bg-red-100" onClick={() => {
                                                                  setActiveTab('new');
                                                                  setVaccineType(vac.type);
                                                                  setVaccineNameInput(vac.name);
                                                                  setVaccineDose('Reforço Anual');
                                                              }}>
                                                                  Aplicar Agora
                                                              </Button>
                                                          </CardContent>
                                                      </Card>
                                                  ))}
                                              </div>
                                          </div>
                                      )}

                                      {scheduled.length > 0 && (
                                          <div className="mb-6">
                                              <h3 className="font-bold text-blue-600 mb-3 flex items-center gap-2 border-b border-blue-100 pb-2">
                                                  <Clock className="h-5 w-5" /> Vacinas Programadas
                                              </h3>
                                              <div className="space-y-3">
                                                  {scheduled.map((vac, idx) => (
                                                      <Card key={`sch-${idx}`} className="border-blue-200 bg-blue-50/50 shadow-sm">
                                                          <CardContent className="p-4 flex justify-between items-center">
                                                              <div>
                                                                  <div className="flex items-center gap-2 mb-1">
                                                                      <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded">{vac.type}</span>
                                                                      <span className="font-bold text-gray-900">{vac.name}</span>
                                                                  </div>
                                                                  <p className="text-sm text-blue-700 font-medium">Reforço + (Agendado para {new Date(vac.nextDoseDate!).toLocaleDateString('pt-BR')})</p>
                                                              </div>
                                                          </CardContent>
                                                      </Card>
                                                  ))}
                                              </div>
                                          </div>
                                      )}
                                  </>
                              );
                          })()}

                          <div>
                              <h3 className="font-bold text-green-700 mb-3 flex items-center gap-2 border-b border-green-100 pb-2">
                                  <CheckCircle className="h-5 w-5" /> Histórico de Aplicações
                              </h3>
                              <div className="space-y-3">
                                  {history.map((vac, idx) => (
                                      <Card key={vac.id || idx} className="border shadow-sm hover:shadow-md transition-shadow">
                                          <CardContent className="p-4">
                                              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                                  <div>
                                                      <div className="flex items-center gap-2 mb-1">
                                                          <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-0.5 rounded">{vac.type}</span>
                                                          <span className="font-bold text-gray-900 text-lg">{vac.name}</span>
                                                          <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-medium">{vac.dose}</span>
                                                      </div>
                                                      <p className="text-sm text-gray-600">Fabricante: {vac.manufacturer} | Lote: {vac.batch}</p>
                                                      <p className="text-sm text-gray-600">Fabricação: {vac.manufacturingDate || '-'} | Validade: {vac.expiryDate || '-'}</p>
                                                      <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                                          <Calendar className="h-4 w-4" /> Aplicado em: {vac.applicationDate}
                                                      </p>
                                                      {vac.notes && <p className="text-sm text-gray-600 italic mt-1 bg-gray-50 p-2 rounded">"{vac.notes}"</p>}
                                                  </div>
                                                  
                                                  <div className="flex flex-col items-end gap-1 min-w-[150px] bg-gray-50 p-3 rounded-lg border">
                                                      <div className="flex items-center justify-end gap-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                          <Clock className="h-3 w-3" />
                                                          Reforço +
                                                      </div>
                                                      {vac.nextDoseDate ? (
                                                          <div className={`font-bold text-lg ${getStatusColor(vac)}`}>
                                                              {new Date(vac.nextDoseDate).toLocaleDateString('pt-BR')}
                                                          </div>
                                                      ) : (
                                                          <span className="text-sm text-gray-400">Não agendado</span>
                                                      )}
                                                  </div>
                                              </div>
                                          </CardContent>
                                      </Card>
                                  ))}
                              </div>
                          </div>
                      </>
                  )}
              </div>
          )}

        </div>
      </div>
    </div>
  );
};
