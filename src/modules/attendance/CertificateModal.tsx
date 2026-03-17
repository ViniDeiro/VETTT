import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Patient, Attendance } from '../../domain/types';
import { pdfService } from '../../services/pdfService';
import { FileText, Printer } from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendance: Attendance;
  patient: Patient;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  attendance,
  patient
}) => {
  const [type, setType] = useState<'health' | 'surgery' | 'euthanasia' | 'travel'>('health');
  const [customText, setCustomText] = useState('');

  const handleGenerate = () => {
    // Generate PDF immediately (no need to save to DB for now, as it's a generated doc)
    // In a real app, we might save a log of generated documents.
    pdfService.generateCertificatePdf(patient, 'Tutor (Demo)', type, customText);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-700 text-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-bold">Emitir Documento</h2>
              <p className="text-gray-300 text-sm">Paciente: {patient.name}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-white hover:bg-gray-600">
            Fechar
          </Button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
            
            <div>
                <Label>Tipo de Documento</Label>
                <select 
                    className="w-full border rounded-md p-2 text-sm mt-1"
                    value={type}
                    onChange={e => {
                        setType(e.target.value as any);
                        setCustomText(''); // Reset custom text on change
                    }}
                >
                    <option value="health">Atestado de Saúde</option>
                    <option value="surgery">Termo de Cirurgia / Anestesia</option>
                    <option value="euthanasia">Termo de Eutanásia</option>
                    <option value="travel">Atestado de Viagem</option>
                </select>
            </div>

            <div>
                <Label>Texto Personalizado (Opcional)</Label>
                <p className="text-xs text-gray-500 mb-2">Deixe em branco para usar o modelo padrão.</p>
                <textarea 
                    className="w-full border rounded-md p-2 text-sm min-h-[150px]"
                    value={customText}
                    onChange={e => setCustomText(e.target.value)}
                    placeholder="Digite aqui para substituir o texto padrão..."
                />
            </div>

            <Button onClick={handleGenerate} className="w-full bg-gray-800 hover:bg-gray-900 text-white h-12 text-lg">
                <Printer className="h-4 w-4 mr-2" /> Gerar e Imprimir
            </Button>

        </div>
      </div>
    </div>
  );
};
