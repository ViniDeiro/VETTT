import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Select } from '../../components/ui/Select';
import { Card, CardContent } from '../../components/ui/Card';
import { Autocomplete } from '../../shared/Autocomplete';
import { mockDB } from '../../services/mockDatabase';
import { Owner, Property, Patient } from '../../domain/types';
import { CheckCircle, ChevronRight, ChevronLeft, User, Home, PawPrint, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export const PatientWizard: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Data
  const [owners, setOwners] = useState<Owner[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);

  // Selection
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Forms
  const [patientData, setPatientData] = useState<Partial<Patient>>({ species: 'Canine' });
  const [newOwnerData, setNewOwnerData] = useState<Partial<Owner>>({});
  const [newPropertyData, setNewPropertyData] = useState<Partial<Property>>({});
  
  // UI Toggles
  const [isCreatingOwner, setIsCreatingOwner] = useState(false);
  const [isCreatingProperty, setIsCreatingProperty] = useState(false);
  const [useBirthDate, setUseBirthDate] = useState(true);
  const [birthDateInput, setBirthDateInput] = useState('');

  useEffect(() => {
    setOwners(mockDB.getOwners());
    setProperties(mockDB.getAllProperties());
  }, []);

  // --- Helpers ---
  const calculateAge = (dob: string) => {
    if (!dob) return 0;
    const birth = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
        age--;
    }
    return age;
  };

  // --- Step 1: Patient Handlers ---
  const handleStep1Next = () => {
    if (!patientData.name) {
      alert('Por favor, informe o nome do paciente.');
      return;
    }
    setStep(2);
  };

  // --- Step 2: Owner Handlers ---
  const handleCreateOwner = () => {
    if (!newOwnerData.name || !newOwnerData.phone) {
      alert('Nome e Telefone são obrigatórios para o tutor.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      const created = mockDB.createOwner(newOwnerData as Owner);
      setOwners(mockDB.getOwners());
      setSelectedOwner(created);
      setIsCreatingOwner(false);
      setIsLoading(false);
    }, 500);
  };

  const handleStep2Next = () => {
    if (!selectedOwner) {
      alert('Selecione um tutor para continuar.');
      return;
    }
    
    if (patientData.species === 'Equine') {
      setStep(3);
    } else {
      finishRegistration();
    }
  };

  // --- Step 3: Property Handlers ---
  const handleCreateProperty = () => {
    if (!newPropertyData.name || !newPropertyData.city || !newPropertyData.state) {
      alert('Nome, Cidade e Estado são obrigatórios.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      const created = mockDB.createProperty({
        ...newPropertyData,
        address: newPropertyData.address || ''
      } as Property);
      setProperties(mockDB.getAllProperties());
      setSelectedProperty(created);
      setIsCreatingProperty(false);
      setIsLoading(false);
    }, 500);
  };

  const finishRegistration = () => {
    if (!selectedOwner) {
        alert('Erro: Tutor não selecionado.');
        return;
    }

    setIsLoading(true);
    
    try {
      setTimeout(() => {
        let finalAge = Number(patientData.age);
        if (useBirthDate && birthDateInput) {
            finalAge = calculateAge(birthDateInput);
        }

        const newPatient = {
          ...patientData,
          ownerId: selectedOwner.id,
          propertyId: selectedProperty?.id,
          age: finalAge,
          birthDate: birthDateInput,
          weight: Number(patientData.weight)
        } as Patient;

        console.log('Salvando paciente:', newPatient);
        mockDB.createPatient(newPatient);
        
        setIsLoading(false);
        alert('Paciente cadastrado com sucesso!');
        navigate('/clients');
      }, 800);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setIsLoading(false);
      alert('Erro ao salvar paciente. Tente novamente.');
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Novo Paciente</h1>

        {/* Stepper */}
        <div className="flex items-center justify-between relative mb-8">
          <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 -z-10"></div>
          
          {[
            { num: 1, label: 'Paciente', icon: PawPrint },
            { num: 2, label: 'Tutor', icon: User },
            { num: 3, label: 'Propriedade', icon: Home, disabled: patientData.species !== 'Equine' }
          ].map((s) => (
            <div key={s.num} className={cn("flex flex-col items-center bg-gray-50 px-2", s.disabled && "opacity-50")}>
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-colors",
                step >= s.num ? "bg-[#0B2C4D]" : "bg-gray-300"
              )}>
                <s.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium mt-2 text-gray-600">{s.label}</span>
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            {/* STEP 1: PATIENT */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-semibold mb-4">Dados do Animal</h2>
                
                <div>
                  <Label>Nome do Paciente *</Label>
                  <Input 
                    value={patientData.name || ''} 
                    onChange={e => setPatientData({...patientData, name: e.target.value})}
                    placeholder="Ex: Thor"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Espécie *</Label>
                    <Select 
                      value={patientData.species} 
                      onChange={e => setPatientData({...patientData, species: e.target.value as any})}
                    >
                      <option value="Canine">Canino</option>
                      <option value="Feline">Felino</option>
                      <option value="Equine">Equino</option>
                      <option value="Bovine">Bovino</option>
                    </Select>
                  </div>
                  <div>
                    <Label>Raça</Label>
                    <Input 
                      value={patientData.breed || ''} 
                      onChange={e => setPatientData({...patientData, breed: e.target.value})}
                      placeholder="Ex: Golden Retriever"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Sexo</Label>
                    <Select 
                      value={patientData.gender} 
                      onChange={e => setPatientData({...patientData, gender: e.target.value as any})}
                    >
                      <option value="">Selecione</option>
                      <option value="M">Macho</option>
                      <option value="F">Fêmea</option>
                    </Select>
                  </div>
                  <div>
                    <Label>Peso (kg)</Label>
                    <Input 
                      type="number"
                      value={patientData.weight || ''} 
                      onChange={e => setPatientData({...patientData, weight: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Pelagem / Cor</Label>
                    <Input 
                      value={patientData.color || ''} 
                      onChange={e => setPatientData({...patientData, color: e.target.value})}
                      placeholder="Ex: Baio, Branco..."
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <input
                      type="checkbox"
                      id="neutered"
                      className="h-4 w-4 rounded border-gray-300 text-[#0B2C4D] focus:ring-[#0B2C4D]"
                      checked={patientData.neutered || false}
                      onChange={e => setPatientData({...patientData, neutered: e.target.checked})}
                    />
                    <Label htmlFor="neutered" className="mb-0 cursor-pointer">Castrado?</Label>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex justify-between mb-2">
                        <Label>Idade / Nascimento</Label>
                        <div className="flex gap-2 text-xs">
                            <button 
                                className={cn("px-2 py-1 rounded", useBirthDate ? "bg-white shadow text-blue-600 font-bold" : "text-gray-500")}
                                onClick={() => setUseBirthDate(true)}
                            >
                                Data Nasc.
                            </button>
                            <button 
                                className={cn("px-2 py-1 rounded", !useBirthDate ? "bg-white shadow text-blue-600 font-bold" : "text-gray-500")}
                                onClick={() => setUseBirthDate(false)}
                            >
                                Idade Manual
                            </button>
                        </div>
                    </div>
                    
                    {useBirthDate ? (
                        <div className="flex gap-4 items-center">
                           <Input 
                              type="date" 
                              value={birthDateInput}
                              onChange={e => setBirthDateInput(e.target.value)}
                           />
                           {birthDateInput && (
                             <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                               = {calculateAge(birthDateInput)} anos
                             </span>
                           )}
                        </div>
                    ) : (
                        <div className="flex gap-2 items-center">
                           <Input 
                              type="number" 
                              placeholder="Anos"
                              value={patientData.age || ''}
                              onChange={e => setPatientData({...patientData, age: Number(e.target.value)})}
                           />
                           <span className="text-sm text-gray-500">anos</span>
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleStep1Next} className="bg-[#0B2C4D] text-white px-8">
                    Continuar <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: OWNER */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-semibold mb-4">Tutor (Proprietário)</h2>
                
                {!isCreatingOwner ? (
                  <div className="space-y-6">
                    <div>
                      <Label>Buscar Tutor Existente</Label>
                      <Autocomplete 
                        options={owners.map(o => ({ id: o.id, label: o.name }))}
                        onSelect={(opt) => setSelectedOwner(owners.find(o => o.id === opt.id) || null)}
                        placeholder="Digite o nome..."
                        value={selectedOwner?.name}
                      />
                    </div>
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">Ou</span>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setIsCreatingOwner(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Cadastrar Novo Tutor
                    </Button>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
                    <h3 className="font-medium">Novo Cadastro</h3>
                    <Input 
                      placeholder="Nome Completo *" 
                      value={newOwnerData.name || ''}
                      onChange={e => setNewOwnerData({...newOwnerData, name: e.target.value})}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input 
                        placeholder="Telefone Principal *" 
                        value={newOwnerData.phone || ''}
                        onChange={e => setNewOwnerData({...newOwnerData, phone: e.target.value})}
                      />
                      <Input 
                        placeholder="Telefone Secundário" 
                        value={newOwnerData.secondaryPhone || ''}
                        onChange={e => setNewOwnerData({...newOwnerData, secondaryPhone: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input 
                        placeholder="CPF/CNPJ" 
                        value={newOwnerData.document || ''}
                        onChange={e => setNewOwnerData({...newOwnerData, document: e.target.value})}
                      />
                      <Input 
                        placeholder="E-mail" 
                        value={newOwnerData.email || ''}
                        onChange={e => setNewOwnerData({...newOwnerData, email: e.target.value})}
                      />
                    </div>
                    
                    <div className="border-t pt-2 mt-2">
                        <Label className="text-xs text-gray-500 mb-2 block">Endereço</Label>
                        <div className="grid grid-cols-3 gap-4 mb-2">
                            <Input 
                                placeholder="CEP" 
                                value={newOwnerData.zipCode || ''}
                                onChange={e => setNewOwnerData({...newOwnerData, zipCode: e.target.value})}
                            />
                            <div className="col-span-2">
                                <Input 
                                    placeholder="Rua / Logradouro" 
                                    value={newOwnerData.street || ''}
                                    onChange={e => setNewOwnerData({...newOwnerData, street: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-2">
                            <Input 
                                placeholder="Número" 
                                value={newOwnerData.number || ''}
                                onChange={e => setNewOwnerData({...newOwnerData, number: e.target.value})}
                            />
                            <div className="col-span-2">
                                <Input 
                                    placeholder="Bairro" 
                                    value={newOwnerData.neighborhood || ''}
                                    onChange={e => setNewOwnerData({...newOwnerData, neighborhood: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2">
                                <Input 
                                    placeholder="Cidade" 
                                    value={newOwnerData.city || ''}
                                    onChange={e => setNewOwnerData({...newOwnerData, city: e.target.value})}
                                />
                            </div>
                            <Input 
                                placeholder="UF" 
                                maxLength={2}
                                value={newOwnerData.state || ''}
                                onChange={e => setNewOwnerData({...newOwnerData, state: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" onClick={() => setIsCreatingOwner(false)} disabled={isLoading}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateOwner} disabled={isLoading} className="bg-blue-600 text-white">
                        {isLoading ? 'Salvando...' : 'Salvar Tutor'}
                      </Button>
                    </div>
                  </div>
                )}

                {selectedOwner && !isCreatingOwner && (
                  <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {selectedOwner.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{selectedOwner.name}</p>
                      <p className="text-xs text-gray-500">{selectedOwner.phone}</p>
                    </div>
                    <CheckCircle className="ml-auto h-5 w-5 text-green-500" />
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t mt-4">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
                  </Button>
                  <Button 
                    onClick={handleStep2Next} 
                    className="bg-[#0B2C4D] text-white px-8"
                    disabled={!selectedOwner || isLoading}
                  >
                    {isLoading ? 'Processando...' : patientData.species === 'Equine' ? 'Continuar' : 'Finalizar Cadastro'} 
                    {!isLoading && patientData.species === 'Equine' && <ChevronRight className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: PROPERTY (EQUINE ONLY) */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-semibold mb-4">Propriedade (Equino)</h2>
                
                {!isCreatingProperty ? (
                  <div className="space-y-6">
                    <div>
                      <Label>Buscar Propriedade Existente</Label>
                      <Autocomplete 
                        options={properties.map(p => ({ id: p.id, label: `${p.name} - ${p.city}` }))}
                        onSelect={(opt) => setSelectedProperty(properties.find(p => p.id === opt.id) || null)}
                        placeholder="Digite o nome..."
                        value={selectedProperty?.name}
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">Ou</span>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setIsCreatingProperty(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Cadastrar Nova Propriedade
                    </Button>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
                    <h3 className="font-medium">Nova Propriedade</h3>
                    <Input 
                      placeholder="Nome da Propriedade *" 
                      value={newPropertyData.name || ''}
                      onChange={e => setNewPropertyData({...newPropertyData, name: e.target.value})}
                    />
                    <Input 
                      placeholder="CNPJ (Opcional)" 
                      value={newPropertyData.document || ''}
                      onChange={e => setNewPropertyData({...newPropertyData, document: e.target.value})}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input 
                        placeholder="Cidade *" 
                        value={newPropertyData.city || ''}
                        onChange={e => setNewPropertyData({...newPropertyData, city: e.target.value})}
                      />
                      <Input 
                        placeholder="Estado (UF) *" 
                        maxLength={2}
                        value={newPropertyData.state || ''}
                        onChange={e => setNewPropertyData({...newPropertyData, state: e.target.value})}
                      />
                    </div>
                    <Input 
                        placeholder="Endereço Completo" 
                        value={newPropertyData.address || ''}
                        onChange={e => setNewPropertyData({...newPropertyData, address: e.target.value})}
                      />
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setIsCreatingProperty(false)} disabled={isLoading}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateProperty} disabled={isLoading} className="bg-blue-600 text-white">
                        {isLoading ? 'Salvando...' : 'Salvar Propriedade'}
                      </Button>
                    </div>
                  </div>
                )}

                {selectedProperty && !isCreatingProperty && (
                  <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      <Home className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{selectedProperty.name}</p>
                      <p className="text-xs text-gray-500">{selectedProperty.city} - {selectedProperty.state}</p>
                    </div>
                    <CheckCircle className="ml-auto h-5 w-5 text-green-500" />
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t mt-4">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
                  </Button>
                  <Button 
                    onClick={finishRegistration} 
                    className="bg-green-600 hover:bg-green-700 text-white px-8"
                    disabled={!selectedProperty || isLoading}
                  >
                    {isLoading ? 'Salvando...' : 'Finalizar Cadastro'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
