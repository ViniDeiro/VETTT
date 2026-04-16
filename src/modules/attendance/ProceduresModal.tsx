import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { AppliedProcedure, Patient, Attendance, ProcedureTemplate } from '../../domain/types';
import { mockDB } from '../../services/mockDatabase';
import { Package, Plus, Trash2, Save, Scissors } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';

interface ProceduresModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendance: Attendance;
  patient: Patient;
  onSave: (updatedAttendance: Attendance) => void;
}

export const ProceduresModal: React.FC<ProceduresModalProps> = ({
  isOpen,
  onClose,
  attendance,
  patient,
  onSave
}) => {
  const [proceduresList, setProceduresList] = useState<ProcedureTemplate[]>(mockDB.getProcedures());
  const [selectedProcedureId, setSelectedProcedureId] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [notes, setNotes] = useState('');

  const handleAddProcedure = () => {
    if (!selectedProcedureId) return;

    const template = proceduresList.find(p => p.id === selectedProcedureId);
    if (!template) return;

    const price = customPrice ? Number(customPrice) : (template.chargePrice ?? template.baseCost);

    const newItems = template.items.map(pItem => {
        const invItem = mockDB.getInventory().find(i => i.id === pItem.inventoryItemId);
        if (invItem) {
            return {
                inventoryItemId: invItem.id,
                itemName: invItem.name,
                quantityUsed: pItem.quantity,
                unit: pItem.unit || invItem.unit,
                costAtMoment: invItem.unitCost ?? invItem.costPrice,
                priceAtMoment: invItem.salePrice
            };
        }
        return null;
    }).filter(Boolean) as any[];

    const procedureCost = Number(
      (template.operationalCost ?? newItems.reduce((acc, item) => acc + (item.costAtMoment * item.quantityUsed), 0)).toFixed(2)
    );
    const procedureMargin = price > 0 ? Number((((price - procedureCost) / price) * 100).toFixed(2)) : 0;

    const newProcedure: AppliedProcedure = {
      id: Math.random().toString(36).substr(2, 9),
      attendanceId: attendance.id,
      procedureTemplateId: template.id,
      name: template.name,
      category: template.category,
      price: price,
      cost: procedureCost,
      marginPercent: procedureMargin,
      consumedItems: newItems,
      notes: notes,
      timestamp: new Date().toISOString()
    };

    const currentProcedures = attendance.procedures || [];

    const currentConsumedItems = attendance.consumedItems || [];
    
    const updatedAttendance = {
      ...attendance,
      procedures: [...currentProcedures, newProcedure],
      consumedItems: [...currentConsumedItems, ...newItems]
    };

    mockDB.updateAttendance(attendance.id, { 
        procedures: updatedAttendance.procedures,
        consumedItems: updatedAttendance.consumedItems 
    });
    onSave(updatedAttendance);

    // Reset
    setSelectedProcedureId('');
    setCustomPrice('');
    setNotes('');
    
    alert(`Procedimento ${newProcedure.name} adicionado!`);
  };

  const handleRemoveProcedure = (id: string) => {
    const currentProcedures = attendance.procedures || [];
    const removedProcedure = currentProcedures.find(p => p.id === id);
    const updatedConsumedItems = [...(attendance.consumedItems || [])];

    if (removedProcedure?.consumedItems?.length) {
      removedProcedure.consumedItems.forEach(removedItem => {
        const itemIndex = updatedConsumedItems.findIndex(item =>
          item.inventoryItemId === removedItem.inventoryItemId &&
          item.quantityUsed === removedItem.quantityUsed &&
          item.unit === removedItem.unit &&
          item.costAtMoment === removedItem.costAtMoment &&
          item.priceAtMoment === removedItem.priceAtMoment
        );

        if (itemIndex !== -1) {
          updatedConsumedItems.splice(itemIndex, 1);
        }
      });
    }

    const updatedAttendance = {
      ...attendance,
      procedures: currentProcedures.filter(p => p.id !== id),
      consumedItems: updatedConsumedItems
    };
    mockDB.updateAttendance(attendance.id, {
      procedures: updatedAttendance.procedures,
      consumedItems: updatedAttendance.consumedItems
    });
    onSave(updatedAttendance);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-orange-600 text-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <Scissors className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-bold">Procedimentos Clínicos</h2>
              <p className="text-orange-100 text-sm">Paciente: {patient.name}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-white hover:bg-orange-700">
            Fechar
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Form */}
          <div className="lg:col-span-1 space-y-6 border-r pr-6">
            <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 space-y-4">
                <h3 className="font-bold text-orange-900 mb-2">Novo Procedimento</h3>
                
                <div>
                    <Label>Procedimento</Label>
                    <select 
                        className="w-full border rounded-md p-2 text-sm mt-1"
                        value={selectedProcedureId}
                        onChange={e => {
                            setSelectedProcedureId(e.target.value);
                            const p = proceduresList.find(proc => proc.id === e.target.value);
                            if(p) setCustomPrice(String(p.chargePrice ?? p.baseCost));
                        }}
                    >
                        <option value="">Selecione...</option>
                        {proceduresList.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <Label>Valor (R$)</Label>
                    <Input 
                        type="number" 
                        value={customPrice} 
                        onChange={e => setCustomPrice(e.target.value)} 
                    />
                </div>

                <div>
                    <Label>Observações</Label>
                    <textarea 
                        className="w-full border rounded-md p-2 text-sm min-h-[80px]"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Detalhes do procedimento..."
                    />
                </div>

                <Button onClick={handleAddProcedure} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                    <Plus className="h-4 w-4 mr-2" /> Adicionar
                </Button>
            </div>
          </div>

          {/* Right: List */}
          <div className="lg:col-span-2 flex flex-col h-full">
            <h3 className="font-semibold text-gray-700 mb-4">Procedimentos Realizados</h3>

            <div className="flex-1 bg-gray-50 rounded-xl border p-4 overflow-y-auto space-y-3">
              {(!attendance.procedures || attendance.procedures.length === 0) ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
                  <Scissors className="h-16 w-16 mb-4" />
                  <p>Nenhum procedimento registrado.</p>
                </div>
              ) : (
                attendance.procedures.map((proc, idx) => (
                  <Card key={proc.id} className="relative group border shadow-sm hover:shadow-md transition-all">
                    <CardContent className="p-4 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-800 text-lg">{proc.name}</span>
                            </div>
                            {proc.notes && (
                                <p className="text-sm text-gray-500 mt-1 italic">"{proc.notes}"</p>
                            )}
                            <p className="text-xs text-gray-400 mt-2">
                                {new Date(proc.timestamp).toLocaleTimeString('pt-BR')}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-orange-600 text-lg">
                                R$ {proc.price.toFixed(2)}
                            </div>
                            <button 
                                onClick={() => handleRemoveProcedure(proc.id)}
                                className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors mt-2"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
