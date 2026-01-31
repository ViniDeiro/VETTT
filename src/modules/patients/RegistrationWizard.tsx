import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockDB } from '../../services/mockDatabase';
import { Owner, Property, Patient } from '../../domain/types';
import { Autocomplete } from '../../shared/Autocomplete';

export const RegistrationWizard: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  // New Entry States
  const [newOwner, setNewOwner] = useState<Partial<Owner>>({});
  const [newProperty, setNewProperty] = useState<Partial<Property>>({});
  const [newPatient, setNewPatient] = useState<Partial<Patient>>({ species: 'Equine' });

  // Age Calculation State
  const [useBirthDate, setUseBirthDate] = useState(true);
  const [birthDateInput, setBirthDateInput] = useState('');

  useEffect(() => {
    setOwners(mockDB.getOwners());
    setProperties(mockDB.getAllProperties());
  }, []);

  // --- Step 1: Owner ---
  const handleOwnerSelect = (option: { id: string }) => {
    const owner = owners.find(o => o.id === option.id);
    if (owner) {
      setSelectedOwner(owner);
      setStep(2);
    }
  };

  const handleCreateOwner = () => {
    if (newOwner.name && newOwner.phone) {
      const created = mockDB.createOwner(newOwner as Owner);
      setSelectedOwner(created);
      setStep(2);
    }
  };

  // --- Step 2: Property (Standalone or Linked) ---
  const handlePropertySelect = (option: { id: string }) => {
    const prop = properties.find(p => p.id === option.id);
    if (prop) {
      setSelectedProperty(prop);
      setStep(3);
    }
  };

  const handleCreateProperty = () => {
    if (newProperty.name && newProperty.city && newProperty.state) {
      const created = mockDB.createProperty({
        ...newProperty,
        address: newProperty.address || ''
      } as Property);
      setSelectedProperty(created);
      setStep(3);
    } else {
        alert('Preencha Nome, Cidade e Estado da propriedade.');
    }
  };

  // --- Step 3: Patient ---
  const calculateAge = (dob: string) => {
    const birth = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
        age--;
    }
    return age;
  };

  const handleCreatePatient = () => {
    if (selectedOwner && newPatient.name) {
      // Validate Logic: If Equine, Property is required
      if (newPatient.species === 'Equine' && !selectedProperty) {
        alert('Cavalos precisam de uma propriedade vinculada!');
        return;
      }

      let finalAge = Number(newPatient.age);
      if (useBirthDate && birthDateInput) {
          finalAge = calculateAge(birthDateInput);
      }

      mockDB.createPatient({
        ...newPatient,
        ownerId: selectedOwner.id,
        propertyId: selectedProperty?.id,
        age: finalAge,
        birthDate: birthDateInput,
        weight: Number(newPatient.weight)
      } as Patient);

      alert('Paciente cadastrado com sucesso!');
      navigate('/attendance-new');
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Cadastro Unificado</h2>
      
      {/* Progress Bar */}
      <div className="flex mb-6">
        <div className={`flex-1 text-center border-b-4 ${step >= 1 ? 'border-blue-500' : 'border-gray-200'}`}>1. Tutor</div>
        <div className={`flex-1 text-center border-b-4 ${step >= 2 ? 'border-blue-500' : 'border-gray-200'}`}>2. Propriedade</div>
        <div className={`flex-1 text-center border-b-4 ${step >= 3 ? 'border-blue-500' : 'border-gray-200'}`}>3. Paciente</div>
      </div>

      {/* STEP 1: OWNER */}
      {step === 1 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Tutor (Proprietário)</h3>
          <Autocomplete 
            label="Buscar Tutor Existente"
            options={owners.map(o => ({ id: o.id, label: o.name }))}
            onSelect={handleOwnerSelect}
            placeholder="Digite o nome..."
          />
          
          <div className="border-t my-4 pt-4">
            <h4 className="font-medium mb-2">Novo Tutor</h4>
            <div className="grid grid-cols-1 gap-4">
              <input 
                className="border p-2 rounded" 
                placeholder="Nome Completo"
                onChange={e => setNewOwner({...newOwner, name: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                    className="border p-2 rounded" 
                    placeholder="Telefone"
                    onChange={e => setNewOwner({...newOwner, phone: e.target.value})}
                />
                <input 
                    className="border p-2 rounded" 
                    placeholder="CPF"
                    onChange={e => setNewOwner({...newOwner, document: e.target.value})}
                />
              </div>
              <button 
                className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                onClick={handleCreateOwner}
              >
                Cadastrar Tutor e Avançar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: PROPERTY */}
      {step === 2 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Propriedade</h3>
          <p className="text-sm text-gray-500 mb-4">Obrigatória para Equinos. Cães e Gatos herdam endereço do tutor.</p>
          
          <Autocomplete 
             label="Selecionar Propriedade Existente"
             options={properties.map(p => ({ id: p.id, label: `${p.name} - ${p.city}/${p.state}` }))}
             onSelect={handlePropertySelect}
             placeholder="Buscar propriedade..."
           />

          <div className="border-t my-4 pt-4">
            <h4 className="font-medium mb-2">Nova Propriedade</h4>
            <div className="grid grid-cols-1 gap-4">
              <input 
                className="border p-2 rounded" 
                placeholder="Nome da Propriedade (Haras, Sítio...)"
                onChange={e => setNewProperty({...newProperty, name: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                    className="border p-2 rounded" 
                    placeholder="Cidade"
                    onChange={e => setNewProperty({...newProperty, city: e.target.value})}
                />
                <input 
                    className="border p-2 rounded" 
                    placeholder="Estado (UF)"
                    maxLength={2}
                    onChange={e => setNewProperty({...newProperty, state: e.target.value})}
                />
              </div>
              <input 
                className="border p-2 rounded" 
                placeholder="Endereço Completo"
                onChange={e => setNewProperty({...newProperty, address: e.target.value})}
              />
               <div className="grid grid-cols-2 gap-4">
                <input 
                    className="border p-2 rounded" 
                    placeholder="CNPJ (Opcional)"
                    onChange={e => setNewProperty({...newProperty, document: e.target.value})}
                />
                <input 
                    className="border p-2 rounded" 
                    placeholder="Inscrição Estadual (Opcional)"
                    onChange={e => setNewProperty({...newProperty, registrationNumber: e.target.value})}
                />
              </div>
              <div className="flex gap-2 mt-2">
                 <button 
                  className="bg-gray-400 text-white p-2 rounded flex-1 hover:bg-gray-500"
                  onClick={() => { setSelectedProperty(null); setStep(3); }}
                >
                  Pular (Sem Propriedade)
                </button>
                <button 
                  className="bg-blue-600 text-white p-2 rounded flex-1 hover:bg-blue-700"
                  onClick={handleCreateProperty}
                >
                  Cadastrar e Avançar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: PATIENT */}
      {step === 3 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Dados do Paciente</h3>
          
          {/* Summary Card */}
          <div className="bg-gray-50 p-4 rounded-lg border mb-6 text-sm grid grid-cols-2 gap-4">
            <div>
                <p className="text-gray-500">Tutor Responsável</p>
                <p className="font-bold">{selectedOwner?.name}</p>
            </div>
            <div>
                <p className="text-gray-500">Propriedade Vinculada</p>
                <p className={`font-bold ${!selectedProperty ? 'text-gray-400' : ''}`}>
                    {selectedProperty ? selectedProperty.name : 'Nenhuma (Endereço do Tutor)'}
                </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Paciente</label>
                <input 
                className="border p-2 rounded w-full" 
                placeholder="Ex: Thunder"
                onChange={e => setNewPatient({...newPatient, name: e.target.value})}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Espécie</label>
                <select 
                className="border p-2 rounded w-full"
                value={newPatient.species}
                onChange={e => setNewPatient({...newPatient, species: e.target.value as any})}
                >
                <option value="Equine">Equino</option>
                <option value="Bovine">Bovino</option>
                <option value="Canine">Canino</option>
                <option value="Feline">Felino</option>
                </select>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Raça</label>
                <input 
                className="border p-2 rounded w-full" 
                placeholder="Ex: Mangalarga"
                onChange={e => setNewPatient({...newPatient, breed: e.target.value})}
                />
            </div>
            
            <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-blue-900">Idade / Nascimento</label>
                    <div className="flex bg-white rounded border overflow-hidden">
                        <button 
                            className={`px-3 py-1 text-xs ${useBirthDate ? 'bg-blue-100 text-blue-700 font-bold' : 'text-gray-500'}`}
                            onClick={() => setUseBirthDate(true)}
                        >
                            Data Nasc.
                        </button>
                        <button 
                            className={`px-3 py-1 text-xs ${!useBirthDate ? 'bg-blue-100 text-blue-700 font-bold' : 'text-gray-500'}`}
                            onClick={() => setUseBirthDate(false)}
                        >
                            Idade Manual
                        </button>
                    </div>
                </div>
                
                {useBirthDate ? (
                    <div>
                        <input 
                            type="date" 
                            className="border p-2 rounded w-full"
                            onChange={e => setBirthDateInput(e.target.value)}
                        />
                        {birthDateInput && (
                            <p className="text-xs text-blue-600 mt-1 text-right">
                                Idade calculada: <strong>{calculateAge(birthDateInput)} anos</strong>
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <input 
                            type="number" 
                            className="border p-2 rounded w-full"
                            placeholder="Ex: 5"
                            onChange={e => setNewPatient({...newPatient, age: Number(e.target.value)})}
                        />
                        <span className="text-gray-500">anos</span>
                    </div>
                )}
            </div>

            <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                 <select 
                    className="border p-2 rounded w-full"
                    onChange={e => setNewPatient({...newPatient, gender: e.target.value as any})}
                >
                    <option value="">Selecione</option>
                    <option value="M">Macho</option>
                    <option value="F">Fêmea</option>
                </select>
            </div>

            <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
                 <input 
                    type="number" 
                    className="border p-2 rounded w-full"
                    placeholder="Opcional"
                    onChange={e => setNewPatient({...newPatient, weight: Number(e.target.value)})}
                />
            </div>
          </div>

          <button 
            className="mt-6 w-full bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 shadow-md transition-all"
            onClick={handleCreatePatient}
          >
            Finalizar Cadastro
          </button>
        </div>
      )}
    </div>
  );
};
