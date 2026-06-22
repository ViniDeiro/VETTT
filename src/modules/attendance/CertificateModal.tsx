import React, { useMemo, useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Patient, Attendance, DocumentTemplateDefinition, Owner, TeamMember, GeneralSettings } from '../../domain/types';
import { pdfService } from '../../services/pdfService';
import { FileText, Printer } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { supabaseDataService } from '../../services/supabaseDataService';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendance: Attendance;
  patient: Patient;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  attendance: _attendance,
  patient
}) => {
  const { user, teamMember: authTeamMember } = useAuth();
  const [settings, setSettings] = useState<GeneralSettings | null>(null);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [type, setType] = useState<'health' | 'surgery' | 'euthanasia' | 'travel'>('health');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [customText, setCustomText] = useState('');

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        const [settingsData, ownersList] = await Promise.all([
          supabaseDataService.getSettings(),
          supabaseDataService.getOwners()
        ]);
        if (!active) return;
        setSettings(settingsData);
        if (patient.ownerId) {
          const matchedOwner = ownersList.find(o => o.id === patient.ownerId) || null;
          setOwner(matchedOwner);
        }
      } catch (err) {
        console.error('Erro ao carregar dados do documento:', err);
      }
    };
    if (isOpen) {
      loadData();
    }
    return () => {
      active = false;
    };
  }, [isOpen, patient.ownerId]);

  const availableTemplates = useMemo(
    () => settings?.documentTemplates?.filter(template => template.useInAttendance !== false) || [],
    [settings?.documentTemplates]
  );
  const selectedTemplate = availableTemplates.find(template => template.id === selectedTemplateId) || null;

  const mapTemplateTypeToCertificateType = (templateType?: string): 'health' | 'surgery' | 'euthanasia' | 'travel' => {
    const normalizedType = String(templateType || '').toLowerCase();
    if (normalizedType.includes('cirurg')) return 'surgery';
    if (normalizedType.includes('eutanas')) return 'euthanasia';
    if (normalizedType.includes('viagem')) return 'travel';
    return 'health';
  };

  const buildTextFromTemplate = (
    template: DocumentTemplateDefinition,
    selectedPatient: Patient,
    selectedOwner: Owner | null,
    selectedVet: TeamMember | null,
    freeText: string
  ) => {
    const now = new Date();
    const ownerAddress = [
      selectedOwner?.street || '',
      selectedOwner?.number || '',
      selectedOwner?.neighborhood || '',
      selectedOwner?.city || '',
      selectedOwner?.state || '',
      selectedOwner?.zipCode || ''
    ].filter(Boolean).join(', ');

    const contentValue = freeText.trim() || 'Sem conteúdo adicional informado.';
    const replacements: Record<string, string> = {
      nome_paciente: selectedPatient.name || 'Não informado',
      especie_paciente: selectedPatient.species || 'Não informado',
      raca_paciente: selectedPatient.breed || 'Não informado',
      nome_tutor: selectedOwner?.name || selectedPatient.ownerName || 'Não informado',
      telefone_tutor: selectedOwner?.phone || 'Não informado',
      endereco_tutor: ownerAddress || selectedOwner?.address || 'Não informado',
      nome_vet: selectedVet?.name || user?.fullName || user?.name || 'Médico Veterinário',
      crmv_vet: selectedVet?.crmv || 'Não informado',
      cpf_vet: selectedVet?.cpf || 'Não informado',
      assinatura_vet: selectedVet?.signature || '____________________________',
      data: now.toLocaleDateString('pt-BR'),
      conteudo: contentValue
    };

    let finalText = template.content || '';
    Object.entries(replacements).forEach(([key, value]) => {
      finalText = finalText.replaceAll(`{${key}}`, value);
    });

    const extraBlocks: string[] = [];
    if (template.includePatientData) {
      extraBlocks.push(`Dados do paciente: ${selectedPatient.name} - ${selectedPatient.species} - ${selectedPatient.breed}`);
    }
    if (template.includeOwnerAddress) {
      extraBlocks.push(`Endereço do tutor: ${replacements.endereco_tutor}`);
    }
    if (template.includeVetName) {
      extraBlocks.push(`Veterinário responsável: ${replacements.nome_vet}`);
    }
    if (template.includeVetCrmv) {
      extraBlocks.push(`CRMV: ${replacements.crmv_vet}`);
    }
    if (template.includeVetCpf) {
      extraBlocks.push(`CPF: ${replacements.cpf_vet}`);
    }
    if (template.includeVetSignature) {
      extraBlocks.push(`Assinatura: ${replacements.assinatura_vet}`);
    }

    const cleanedText = finalText.trim();
    const extras = extraBlocks.join('\n');
    if (cleanedText && extras) return `${cleanedText}\n\n${extras}`;
    return cleanedText || extras || contentValue;
  };

  const handleGenerate = async () => {
    const ownerName = owner?.name || patient.ownerName || 'Desconhecido';

    if (selectedTemplate) {
      const renderedText = buildTextFromTemplate(selectedTemplate, patient, owner, authTeamMember, customText);
      const resolvedType = mapTemplateTypeToCertificateType(selectedTemplate.type);
      await pdfService.generateCertificatePdf(patient, ownerName, resolvedType, renderedText, selectedTemplate.title);
      onClose();
      return;
    }

    await pdfService.generateCertificatePdf(patient, ownerName, type, customText);
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
                        setType(e.target.value as 'health' | 'surgery' | 'euthanasia' | 'travel');
                        setSelectedTemplateId('');
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
                <Label>Modelo salvo em Configurações (opcional)</Label>
                <p className="text-xs text-gray-500 mb-2">Se selecionar, este modelo passa a ser usado no lugar do padrão acima.</p>
                <select
                    className="w-full border rounded-md p-2 text-sm mt-1"
                    value={selectedTemplateId}
                    onChange={e => {
                        setSelectedTemplateId(e.target.value);
                        setCustomText('');
                    }}
                >
                    <option value="">Usar documento padrão rápido</option>
                    {availableTemplates.map(template => (
                        <option key={template.id} value={template.id}>
                            {template.title} ({template.type})
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <Label>Texto Personalizado (Opcional)</Label>
                <p className="text-xs text-gray-500 mb-2">
                  {selectedTemplate ? 'Digite para preencher o campo {conteudo} do modelo selecionado.' : 'Deixe em branco para usar o modelo padrão.'}
                </p>
                <textarea 
                    className="w-full border rounded-md p-2 text-sm min-h-[150px]"
                    value={customText}
                    onChange={e => setCustomText(e.target.value)}
                    placeholder={selectedTemplate ? 'Texto adicional para o modelo selecionado...' : 'Digite aqui para substituir o texto padrão...'}
                />
            </div>

            {selectedTemplate && (
              <div className="rounded-lg border bg-gray-50 p-3">
                <p className="text-xs font-semibold text-gray-700 mb-2">Prévia rápida do modelo selecionado</p>
                <pre className="whitespace-pre-wrap text-xs text-gray-600 font-sans">
                  {buildTextFromTemplate(selectedTemplate, patient, owner, vetMember, customText)}
                </pre>
              </div>
            )}

            <Button onClick={handleGenerate} className="w-full bg-gray-800 hover:bg-gray-900 text-white h-12 text-lg">
                <Printer className="h-4 w-4 mr-2" /> Gerar e Imprimir
            </Button>

        </div>
      </div>
    </div>
  );
};
