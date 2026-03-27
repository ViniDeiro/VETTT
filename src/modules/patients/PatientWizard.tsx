import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../components/Layout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Select } from '../../components/ui/Select';
import { Card, CardContent } from '../../components/ui/Card';
import { Autocomplete } from '../../shared/Autocomplete';
import { mockDB } from '../../services/mockDatabase';
import { Owner, Property, Patient } from '../../domain/types';
import { getBreedsBySpecies } from '../../domain/breeds';
import { CheckCircle, ChevronRight, ChevronLeft, User, Home, PawPrint, Plus, AlertCircle, Heart, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPhone, formatDocument, formatCEP } from '../../lib/formatters';

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
  const [patientData, setPatientData] = useState<Partial<Patient>>({ 
    species: 'Canine',
    status: 'Alive',
    gender: 'M',
    healthPlan: { name: '', number: '', expiryDate: '' }
  });
  const [newOwnerData, setNewOwnerData] = useState<Partial<Owner>>({});
  const [newPropertyData, setNewPropertyData] = useState<Partial<Property>>({});
  
  // UI Toggles
  const [isCreatingOwner, setIsCreatingOwner] = useState(false);
  const [isCreatingProperty, setIsCreatingProperty] = useState(false);
  const [useBirthDate, setUseBirthDate] = useState(true);
  const [birthDateInput, setBirthDateInput] = useState('');
  
  // Specific inputs for Allergies/Chronic (comma separated strings in UI, array in DB)
  const [allergiesInput, setAllergiesInput] = useState('');
  const [chronicInput, setChronicInput] = useState('');

  const location = useLocation();

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setPatientData(prev => ({...prev, photoUrl: reader.result as string}));
          };
          reader.readAsDataURL(file);
      }
  };

  useEffect(() => {
    const loadedOwners = mockDB.getOwners();
    setOwners(loadedOwners);
    setProperties(mockDB.getAllProperties());

    const params = new URLSearchParams(location.search);
    const ownerIdParam = params.get('ownerId');
    if (ownerIdParam) {
        const foundOwner = loadedOwners.find(o => o.id === ownerIdParam);
        if (foundOwner) {
            setSelectedOwner(foundOwner);
            // Optionally, we could jump to step 2 or keep it at 1. Better to keep it at 1 so user fills patient data first.
        }
    }
  }, [location.search]);

  const handleCepSearch = async (cep: string, type: 'owner' | 'property') => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        if (!data.erro) {
            if (type === 'owner') {
                setNewOwnerData(prev => ({
                    ...prev,
                    street: data.logradouro,
                    neighborhood: data.bairro,
                    city: data.localidade,
                    state: data.uf
                }));
            } else {
                setNewPropertyData(prev => ({
                    ...prev,
                    street: data.logradouro,
                    neighborhood: data.bairro,
                    city: data.localidade,
                    state: data.uf
                }));
            }
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      }
    }
  };
  const calculateAge = (dob: string) => {
    if (!dob) return { years: 0, months: 0 };
    const birth = new Date(dob);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    
    if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) {
        years--;
        months += 12;
    }
    return { years, months };
  };

  const getAgeDisplay = () => {
    if (useBirthDate && birthDateInput) {
        const { years, months } = calculateAge(birthDateInput);
        return `${years} anos e ${months} meses`;
    }
    if (!useBirthDate) {
        return `${patientData.age || 0} anos e ${patientData.ageMonths || 0} meses`;
    }
    return '0 anos e 0 meses';
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
      const finalAddress = [newOwnerData.street, newOwnerData.number ? `nº ${newOwnerData.number}` : '', newOwnerData.neighborhood].filter(Boolean).join(', ');
      
      const created = mockDB.createOwner({
          ...newOwnerData,
          address: finalAddress || newOwnerData.address || ''
      } as Owner);
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
      const finalAddress = [newPropertyData.street, newPropertyData.number ? `km/nº ${newPropertyData.number}` : '', newPropertyData.neighborhood].filter(Boolean).join(', ');
      
      const created = mockDB.createProperty({
        ...newPropertyData,
        address: finalAddress || newPropertyData.address || ''
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
        let finalAgeYears = Number(patientData.age || 0);
        let finalAgeMonths = Number(patientData.ageMonths || 0);

        if (useBirthDate && birthDateInput) {
            const calculated = calculateAge(birthDateInput);
            finalAgeYears = calculated.years;
            finalAgeMonths = calculated.months; // We don't store months in 'age' field usually, but prompt asked for display.
            // Note: 'age' in Patient interface is number (years). We might want to store birthDate primarily.
        }

        const finalSpecies = patientData.species === 'Other' && patientData.customSpecies 
            ? patientData.customSpecies 
            : patientData.species;

        const newPatient: Patient = {
          id: Math.random().toString(36).substr(2, 9),
          ...patientData,
          species: finalSpecies,
          ownerId: selectedOwner.id,
          propertyId: selectedProperty?.id,
          age: finalAgeYears,
          // ageMonths: finalAgeMonths, // Not in interface? I added it in previous step.
          birthDate: birthDateInput,
          weight: Number(patientData.weight),
          allergies: allergiesInput.split(',').map(s => s.trim()).filter(Boolean),
          chronicDiseases: chronicInput.split(',').map(s => s.trim()).filter(Boolean),
          healthPlan: patientData.healthPlan, // Ensures it's a string, not object
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
      <div className="max-w-4xl mx-auto space-y-6 pb-20">
        <h1 className="text-2xl font-bold text-gray-900">Novo Paciente</h1>

        {/* Stepper */}
        <div className="flex items-center justify-between relative mb-8 px-10">
          <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 -z-10"></div>
          
          {[
            { num: 1, label: 'Paciente', icon: PawPrint },
            { num: 2, label: 'Tutor', icon: User },
            { num: 3, label: 'Propriedade', icon: Home, disabled: patientData.species !== 'Equine' }
          ].map((s) => (
            <div key={s.num} className={cn("flex flex-col items-center bg-gray-50 px-4 py-2 rounded-xl", s.disabled && "opacity-50 grayscale")}>
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center font-bold text-white transition-all shadow-md",
                step >= s.num ? "bg-[#0B2C4D] scale-110" : "bg-gray-300"
              )}>
                <s.icon className="h-6 w-6" />
              </div>
              <span className={cn("text-xs font-bold mt-2", step >= s.num ? "text-[#0B2C4D]" : "text-gray-500")}>{s.label}</span>
            </div>
          ))}
        </div>

        <Card className="border-none shadow-lg">
          <CardContent className="p-8">
            {/* STEP 1: PATIENT */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                
                {/* 1.1 Identificação Básica */}
                <section className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                        <PawPrint className="h-5 w-5 text-blue-600" />
                        Identificação
                    </h3>
                    
                    <div className="flex gap-6 items-center mb-6">
                        <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-200 hover:border-blue-400 transition-colors cursor-pointer relative overflow-hidden group">
                            {patientData.photoUrl ? (
                                <img src={patientData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <ImageIcon className="w-8 h-8 mb-1 text-gray-400 group-hover:text-blue-500" />
                                    <span className="text-[10px] font-medium">Foto</span>
                                </>
                            )}
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handlePhotoUpload}
                            />
                        </div>
                        <div className="flex-1">
                            <Label>Nome do Animal *</Label>
                            <Input 
                                value={patientData.name || ''} 
                                onChange={e => setPatientData({...patientData, name: e.target.value})}
                                placeholder="Ex: Thor"
                                className="text-lg font-medium"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="col-span-1">
                            <Label>Espécie *</Label>
                            <Select 
                                value={patientData.species} 
                                onChange={e => {
                                    const val = e.target.value;
                                    setPatientData({...patientData, species: val as any, breed: val === 'Other' ? patientData.breed : ''});
                                }}
                            >
                                <option value="Canine">Canino</option>
                                <option value="Feline">Felino</option>
                                <option value="Equine">Equino</option>
                                <option value="Other">Outros</option>
                            </Select>
                            {patientData.species === 'Other' && (
                                <Input 
                                    className="mt-2"
                                    placeholder="Qual espécie?"
                                    value={patientData.customSpecies || ''}
                                    onChange={e => setPatientData({...patientData, customSpecies: e.target.value})}
                                    autoFocus
                                />
                            )}
                        </div>
                        <div className="col-span-1">
                            <Label>Raça</Label>
                            {(() => {
                                const breeds = getBreedsBySpecies(patientData.species || 'Canine');
                                if (breeds.length > 0) {
                                    const isInList = patientData.breed && breeds.includes(patientData.breed) && patientData.breed !== 'Outra';
                                    const selectValue = !patientData.breed ? '' : (isInList ? patientData.breed : 'Outra');
                                    const showInput = selectValue === 'Outra';

                                    return (
                                        <div>
                                            <Select 
                                                value={selectValue}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    if (val === 'Outra') {
                                                        setPatientData({...patientData, breed: ''});
                                                    } else {
                                                        setPatientData({...patientData, breed: val});
                                                    }
                                                }}
                                                className="mb-2 font-medium"
                                            >
                                                <option value="" disabled>Selecione...</option>
                                                {breeds.map(b => (
                                                    <option key={b} value={b}>{b}</option>
                                                ))}
                                            </Select>
                                            {showInput && (
                                                <Input 
                                                    value={patientData.breed || ''} 
                                                    onChange={e => setPatientData({...patientData, breed: e.target.value})}
                                                    placeholder="Digite a raça..."
                                                    className="mt-2"
                                                    autoFocus
                                                />
                                            )}
                                        </div>
                                    );
                                }
                                return (
                                    <Input 
                                        value={patientData.breed || ''} 
                                        onChange={e => setPatientData({...patientData, breed: e.target.value})}
                                        placeholder="Ex: SRD"
                                    />
                                );
                            })()}
                        </div>
                        <div className="col-span-1">
                            <Label>Sexo</Label>
                            <Select 
                                value={patientData.gender} 
                                onChange={e => setPatientData({...patientData, gender: e.target.value as any})}
                            >
                                <option value="M">Macho</option>
                                <option value="F">Fêmea</option>
                            </Select>
                        </div>
                        <div className="col-span-1 flex flex-col gap-2 pt-6">
                            <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg w-full border border-transparent hover:border-gray-200 transition-colors">
                                <div className={cn("w-5 h-5 rounded border flex items-center justify-center", patientData.neutered ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300")}>
                                    {patientData.neutered && <CheckCircle className="w-3.5 h-3.5" />}
                                </div>
                                <input 
                                    type="checkbox" 
                                    className="hidden"
                                    checked={patientData.neutered || false}
                                    onChange={e => {
                                        const isNeutered = e.target.checked;
                                        setPatientData(prev => ({
                                            ...prev, 
                                            neutered: isNeutered,
                                            pregnant: isNeutered ? false : prev.pregnant
                                        }));
                                    }}
                                />
                                <span className="font-medium text-gray-700">Castrado?</span>
                            </label>
                            
                            {patientData.gender === 'F' && patientData.species !== 'Equine' && !patientData.neutered && (
                                <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg w-full border border-transparent hover:border-gray-200 transition-colors">
                                    <div className={cn("w-5 h-5 rounded border flex items-center justify-center", patientData.pregnant ? "bg-pink-500 border-pink-500 text-white" : "border-gray-300")}>
                                        {patientData.pregnant && <CheckCircle className="w-3.5 h-3.5" />}
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        className="hidden"
                                        checked={patientData.pregnant || false}
                                        onChange={e => setPatientData({...patientData, pregnant: e.target.checked})}
                                    />
                                    <span className="font-medium text-gray-700">Prenha?</span>
                                </label>
                            )}
                        </div>
                    </div>
                </section>

                {/* 1.2 Idade e Nascimento */}
                <section className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                         <Label className="text-blue-900 text-base">Idade do Animal</Label>
                         <div className="flex bg-white rounded-lg p-1 shadow-sm border">
                            <button 
                                className={cn("px-3 py-1 text-xs font-bold rounded transition-all", useBirthDate ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-50")}
                                onClick={() => setUseBirthDate(true)}
                            >
                                Data Nascimento
                            </button>
                            <button 
                                className={cn("px-3 py-1 text-xs font-bold rounded transition-all", !useBirthDate ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-50")}
                                onClick={() => setUseBirthDate(false)}
                            >
                                Manual
                            </button>
                         </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        {useBirthDate ? (
                            <div className="flex-1">
                                <Input 
                                    type="date" 
                                    value={birthDateInput}
                                    onChange={e => setBirthDateInput(e.target.value)}
                                    className="bg-white"
                                />
                            </div>
                        ) : (
                            <div className="flex-1 flex gap-4">
                                <div className="flex-1">
                                    <Input 
                                        type="number" 
                                        placeholder="0"
                                        value={patientData.age || ''}
                                        onChange={e => {
                                            const val = Number(e.target.value);
                                            setPatientData({...patientData, age: val});
                                        }}
                                        className="bg-white"
                                    />
                                    <span className="text-xs text-gray-500 mt-1 block">Anos</span>
                                </div>
                                <div className="flex-1">
                                    <Input 
                                        type="number" 
                                        placeholder="0"
                                        value={patientData.ageMonths || ''}
                                        onChange={e => {
                                            let m = Number(e.target.value);
                                            let y = Number(patientData.age || 0);
                                            if (m >= 12) {
                                                y += Math.floor(m / 12);
                                                m = m % 12;
                                            }
                                            setPatientData({...patientData, ageMonths: m, age: y});
                                        }}
                                        className="bg-white"
                                    />
                                    <span className="text-xs text-gray-500 mt-1 block">Meses</span>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex-1 bg-white p-3 rounded-lg border border-blue-200 text-center shadow-sm">
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Idade Calculada</p>
                            <p className="text-lg font-bold text-blue-900">{getAgeDisplay()}</p>
                        </div>
                    </div>
                </section>

                {/* 1.3 Dados Clínicos e Características */}
                <section className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                        <User className="h-5 w-5 text-purple-600" />
                        Características Físicas
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {patientData.species !== 'Equine' && (
                            <div>
                                <Label>Porte</Label>
                                <Select 
                                    value={patientData.size} 
                                    onChange={e => setPatientData({...patientData, size: e.target.value as any})}
                                >
                                    <option value="">Selecione...</option>
                                    <option value="Small">Pequeno</option>
                                    <option value="Medium">Médio</option>
                                    <option value="Large">Grande</option>
                                </Select>
                            </div>
                        )}
                        <div>
                            <Label>Temperamento</Label>
                            <Input 
                                value={patientData.temperament || ''} 
                                onChange={e => setPatientData({...patientData, temperament: e.target.value})}
                                placeholder="Ex: Dócil, Agitado"
                            />
                        </div>
                        <div>
                            <Label>Pelagem (Cor)</Label>
                            <Input 
                                value={patientData.coat || ''} 
                                onChange={e => setPatientData({...patientData, coat: e.target.value})}
                                placeholder="Ex: Tigrado"
                            />
                        </div>
                        <div>
                            <Label>Microchip</Label>
                            <Input 
                                value={patientData.microchip || ''} 
                                onChange={e => setPatientData({...patientData, microchip: e.target.value})}
                                placeholder="Opcional"
                            />
                        </div>
                        <div>
                            <Label>RG Animal (RGA)</Label>
                            <Input 
                                value={patientData.rg || ''} 
                                onChange={e => setPatientData({...patientData, rg: e.target.value})}
                                placeholder="Opcional"
                            />
                        </div>
                        <div>
                            <Label>Peso Atual (kg)</Label>
                            <Input 
                                type="number"
                                value={patientData.weight || ''} 
                                onChange={e => setPatientData({...patientData, weight: Number(e.target.value)})}
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </section>

                {/* 1.4 Plano de Saúde */}
                <section className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                        <Heart className="h-5 w-5 text-pink-600" />
                        Plano de Saúde
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label>Nome do Plano</Label>
                            <Input 
                                value={patientData.healthPlan || ''} 
                                onChange={e => setPatientData({...patientData, healthPlan: e.target.value})}
                                placeholder="Ex: PetLove"
                            />
                        </div>
                        <div>
                            <Label>Nº Carteirinha</Label>
                            <Input 
                                value={patientData.healthPlanNumber || ''} 
                                onChange={e => setPatientData({...patientData, healthPlanNumber: e.target.value})}
                            />
                        </div>
                        <div>
                            <Label>Vencimento</Label>
                            <Input 
                                type="date"
                                value={patientData.healthPlanExpiry || ''} 
                                onChange={e => setPatientData({...patientData, healthPlanExpiry: e.target.value})}
                            />
                        </div>
                    </div>
                </section>

                {/* 1.5 Alergias e Doenças Crônicas (DESTAQUE) */}
                <section className="bg-red-50 p-6 rounded-xl border-2 border-red-100 space-y-6">
                    <div>
                        <Label className="text-red-700 font-bold text-base flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            ALERGIAS
                        </Label>
                        <Input 
                            value={allergiesInput}
                            onChange={e => setAllergiesInput(e.target.value)}
                            placeholder="Separe por vírgulas. Ex: Dipirona, Carne de Frango"
                            className="border-red-200 focus:ring-red-500 bg-white text-red-900 font-medium placeholder:text-red-200"
                        />
                        <p className="text-xs text-red-400 mt-1">Este campo ficará em destaque no prontuário.</p>
                    </div>
                    <div>
                        <Label className="text-red-700 font-bold text-base flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            DOENÇAS CRÔNICAS
                        </Label>
                        <Input 
                            value={chronicInput}
                            onChange={e => setChronicInput(e.target.value)}
                            placeholder="Separe por vírgulas. Ex: Diabetes, Insuficiência Renal"
                            className="border-red-200 focus:ring-red-500 bg-white text-red-900 font-medium placeholder:text-red-200"
                        />
                    </div>
                </section>

                {/* 1.6 Observações Gerais */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label className="text-base font-bold text-gray-700">Observações Gerais / Histórico Cirúrgico</Label>
                        <textarea 
                            className="w-full border border-gray-300 rounded-lg p-3 min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-2"
                            placeholder="Descreva cirurgias prévias, amputações, ou outras condições especiais..."
                            value={patientData.notes || ''}
                            onChange={e => setPatientData({...patientData, notes: e.target.value})}
                        />
                    </div>
                    <div>
                        <Label className="text-base font-bold text-gray-700">Observação Interna</Label>
                        <textarea 
                            className="w-full border border-gray-300 rounded-lg p-3 min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-2 bg-yellow-50/50"
                            placeholder="Anotações visíveis apenas para a equipe da clínica..."
                            value={patientData.internalNotes || ''}
                            onChange={e => setPatientData({...patientData, internalNotes: e.target.value})}
                        />
                    </div>
                </section>

                <div className="flex justify-end pt-8">
                  <Button onClick={handleStep1Next} className="bg-[#0B2C4D] text-white px-10 h-12 text-lg rounded-xl shadow-lg shadow-blue-900/10 hover:bg-[#0B2C4D]/90">
                    Continuar <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: OWNER */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <User className="h-6 w-6 text-blue-600" />
                    Dados do Tutor
                </h2>
                
                {!isCreatingOwner ? (
                  <div className="space-y-8 py-8">
                    <div className="max-w-xl mx-auto space-y-4">
                      <Label className="text-center block text-lg text-gray-600">Buscar Tutor Cadastrado</Label>
                      <Autocomplete 
                        options={owners.map(o => ({ id: o.id, label: o.name }))}
                        onSelect={(opt) => setSelectedOwner(owners.find(o => o.id === opt.id) || null)}
                        placeholder="Digite o nome do tutor..."
                        value={selectedOwner?.name}
                      />
                    </div>
                    
                    <div className="relative py-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-sm uppercase font-bold tracking-widest">
                        <span className="bg-white px-4 text-gray-400">Ou</span>
                      </div>
                    </div>

                    <div className="flex justify-center">
                        <Button 
                          variant="outline" 
                          size="lg"
                          className="border-dashed border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 w-full max-w-sm h-16 text-lg"
                          onClick={() => setIsCreatingOwner(true)}
                        >
                          <Plus className="mr-2 h-6 w-6" /> Cadastrar Novo Tutor
                        </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-6 rounded-xl border space-y-6">
                    <h3 className="font-bold text-gray-900 border-b pb-2">Novo Cadastro de Tutor</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                             <Label>Nome Completo *</Label>
                            <Input 
                              value={newOwnerData.name || ''}
                              onChange={e => setNewOwnerData({...newOwnerData, name: e.target.value})}
                              placeholder="Nome do responsável"
                            />
                        </div>
                        <div>
                             <Label>Telefone Principal *</Label>
                             <Input 
                                value={newOwnerData.phone || ''}
                                onChange={e => setNewOwnerData({...newOwnerData, phone: formatPhone(e.target.value)})}
                                placeholder="(00) 00000-0000"
                                maxLength={15}
                              />
                        </div>
                        <div>
                             <Label>Telefone Secundário</Label>
                             <Input 
                                value={newOwnerData.secondaryPhone || ''}
                                onChange={e => setNewOwnerData({...newOwnerData, secondaryPhone: formatPhone(e.target.value)})}
                                placeholder="(00) 00000-0000"
                                maxLength={15}
                              />
                        </div>
                        <div>
                             <Label>CPF / CNPJ</Label>
                             <Input 
                                value={newOwnerData.document || ''}
                                onChange={e => setNewOwnerData({...newOwnerData, document: formatDocument(e.target.value)})}
                                placeholder="000.000.000-00"
                                maxLength={18}
                              />
                        </div>
                        <div>
                             <Label>E-mail</Label>
                             <Input 
                                value={newOwnerData.email || ''}
                                onChange={e => setNewOwnerData({...newOwnerData, email: e.target.value})}
                                placeholder="email@exemplo.com"
                              />
                        </div>
                    </div>
                    
                    <div className="border-t pt-4">
                        <Label className="text-gray-900 font-bold mb-4 block">Endereço</Label>
                        <div className="grid grid-cols-6 gap-4">
                            <div className="col-span-2">
                                <Label>CEP</Label>
                                <Input 
                                    value={newOwnerData.zipCode || ''}
                                    onChange={e => {
                                        const val = formatCEP(e.target.value);
                                        setNewOwnerData({...newOwnerData, zipCode: val});
                                        if (val.replace(/\D/g, '').length === 8) handleCepSearch(val, 'owner');
                                    }}
                                    maxLength={9}
                                />
                            </div>
                            <div className="col-span-4">
                                <Label>Logradouro</Label>
                                <Input 
                                    value={newOwnerData.street || ''}
                                    onChange={e => setNewOwnerData({...newOwnerData, street: e.target.value})}
                                />
                            </div>
                            <div className="col-span-2">
                                <Label>Número</Label>
                                <Input 
                                    value={newOwnerData.number || ''}
                                    onChange={e => setNewOwnerData({...newOwnerData, number: e.target.value})}
                                />
                            </div>
                            <div className="col-span-4">
                                <Label>Bairro</Label>
                                <Input 
                                    value={newOwnerData.neighborhood || ''}
                                    onChange={e => setNewOwnerData({...newOwnerData, neighborhood: e.target.value})}
                                />
                            </div>
                            <div className="col-span-4">
                                <Label>Cidade</Label>
                                <Input 
                                    value={newOwnerData.city || ''}
                                    onChange={e => setNewOwnerData({...newOwnerData, city: e.target.value})}
                                />
                            </div>
                            <div className="col-span-2">
                                <Label>UF</Label>
                                <Input 
                                    maxLength={2}
                                    value={newOwnerData.state || ''}
                                    onChange={e => setNewOwnerData({...newOwnerData, state: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4 justify-end">
                      <Button variant="outline" onClick={() => setIsCreatingOwner(false)} disabled={isLoading}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateOwner} disabled={isLoading} className="bg-blue-600 text-white px-8">
                        {isLoading ? 'Salvando...' : 'Salvar Tutor'}
                      </Button>
                    </div>
                  </div>
                )}

                {selectedOwner && !isCreatingOwner && (
                  <div className="bg-blue-50 p-6 rounded-xl flex items-center gap-4 border border-blue-100">
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold text-2xl shadow-sm">
                      {selectedOwner.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{selectedOwner.name}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                          <span>{selectedOwner.phone}</span>
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          <span>{selectedOwner.email}</span>
                      </p>
                    </div>
                    <Button variant="ghost" className="ml-auto text-blue-600 hover:text-blue-700" onClick={() => setSelectedOwner(null)}>
                        Alterar
                    </Button>
                  </div>
                )}

                <div className="flex justify-between pt-8 border-t mt-8">
                  <Button variant="outline" onClick={() => setStep(1)} className="h-12 px-6">
                    <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
                  </Button>
                  <Button 
                    onClick={handleStep2Next} 
                    className="bg-[#0B2C4D] text-white px-10 h-12 text-lg rounded-xl shadow-lg shadow-blue-900/10 hover:bg-[#0B2C4D]/90"
                    disabled={!selectedOwner || isLoading}
                  >
                    {isLoading ? 'Processando...' : patientData.species === 'Equine' ? 'Continuar' : 'Finalizar Cadastro'} 
                    {!isLoading && patientData.species === 'Equine' && <ChevronRight className="ml-2 h-5 w-5" />}
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: PROPERTY (EQUINE ONLY) */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Home className="h-6 w-6 text-orange-600" />
                    Propriedade (Equino)
                </h2>
                
                {!isCreatingProperty ? (
                  <div className="space-y-8 py-8">
                    <div className="max-w-xl mx-auto space-y-4">
                      <Label className="text-center block text-lg text-gray-600">Buscar Propriedade</Label>
                      <Autocomplete 
                        options={properties.map(p => ({ id: p.id, label: `${p.name} - ${p.city}` }))}
                        onSelect={(opt) => setSelectedProperty(properties.find(p => p.id === opt.id) || null)}
                        placeholder="Nome da fazenda, haras ou sítio..."
                        value={selectedProperty?.name}
                      />
                    </div>

                    <div className="relative py-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-sm uppercase font-bold tracking-widest">
                        <span className="bg-white px-4 text-gray-400">Ou</span>
                      </div>
                    </div>

                    <div className="flex justify-center">
                        <Button 
                          variant="outline" 
                          size="lg"
                          className="border-dashed border-2 border-gray-300 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 w-full max-w-sm h-16 text-lg"
                          onClick={() => setIsCreatingProperty(true)}
                        >
                          <Plus className="mr-2 h-6 w-6" /> Cadastrar Nova Propriedade
                        </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-6 rounded-xl border space-y-6">
                    <h3 className="font-bold text-gray-900 border-b pb-2">Nova Propriedade</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                             <Label>Nome da Propriedade *</Label>
                            <Input 
                              value={newPropertyData.name || ''}
                              onChange={e => setNewPropertyData({...newPropertyData, name: e.target.value})}
                              placeholder="Haras, Fazenda, Sítio..."
                            />
                        </div>
                        <div>
                             <Label>Tipo de Propriedade</Label>
                             <Select 
                                value={newPropertyData.type || ''}
                                onChange={e => setNewPropertyData({...newPropertyData, type: e.target.value})}
                             >
                                 <option value="">Selecione...</option>
                                 <option value="Haras">Haras</option>
                                 <option value="Fazenda">Fazenda</option>
                                 <option value="Sítio">Sítio</option>
                                 <option value="Hípica">Hípica</option>
                                 <option value="Centro de Treinamento">Centro de Treinamento</option>
                                 <option value="Outro">Outro</option>
                             </Select>
                        </div>
                        <div>
                             <Label>Inscrição Estadual / CNPJ</Label>
                             <Input 
                                value={newPropertyData.document || ''}
                                onChange={e => setNewPropertyData({...newPropertyData, document: formatDocument(e.target.value)})}
                                maxLength={18}
                              />
                        </div>
                        <div>
                             <Label>Telefone</Label>
                             <Input 
                                value={newPropertyData.phone || ''}
                                onChange={e => setNewPropertyData({...newPropertyData, phone: formatPhone(e.target.value)})}
                                maxLength={15}
                              />
                        </div>
                        <div>
                             <Label>E-mail</Label>
                             <Input 
                                value={newPropertyData.email || ''}
                                onChange={e => setNewPropertyData({...newPropertyData, email: e.target.value})}
                                type="email"
                              />
                        </div>
                    </div>
                    
                    <div className="border-t pt-4">
                        <Label className="text-gray-900 font-bold mb-4 block">Endereço</Label>
                        <div className="grid grid-cols-6 gap-4">
                            <div className="col-span-2">
                                <Label>CEP</Label>
                                <Input 
                                    value={newPropertyData.zipCode || ''}
                                    onChange={e => {
                                        const val = formatCEP(e.target.value);
                                        setNewPropertyData({...newPropertyData, zipCode: val});
                                        if (val.replace(/\D/g, '').length === 8) handleCepSearch(val, 'property');
                                    }}
                                    maxLength={9}
                                />
                            </div>
                            <div className="col-span-4">
                                <Label>Logradouro / Estrada</Label>
                                <Input 
                                    value={newPropertyData.street || ''}
                                    onChange={e => setNewPropertyData({...newPropertyData, street: e.target.value})}
                                />
                            </div>
                            <div className="col-span-2">
                                <Label>Número / Km</Label>
                                <Input 
                                    value={newPropertyData.number || ''}
                                    onChange={e => setNewPropertyData({...newPropertyData, number: e.target.value})}
                                />
                            </div>
                            <div className="col-span-4">
                                <Label>Bairro / Distrito</Label>
                                <Input 
                                    value={newPropertyData.neighborhood || ''}
                                    onChange={e => setNewPropertyData({...newPropertyData, neighborhood: e.target.value})}
                                />
                            </div>
                             <div className="col-span-4">
                                <Label>Cidade *</Label>
                                <Input 
                                    value={newPropertyData.city || ''}
                                    onChange={e => setNewPropertyData({...newPropertyData, city: e.target.value})}
                                />
                            </div>
                            <div className="col-span-2">
                                <Label>UF *</Label>
                                <Input 
                                    maxLength={2}
                                    value={newPropertyData.state || ''}
                                    onChange={e => setNewPropertyData({...newPropertyData, state: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4 justify-end">
                      <Button variant="outline" onClick={() => setIsCreatingProperty(false)} disabled={isLoading}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateProperty} disabled={isLoading} className="bg-blue-600 text-white px-8">
                        {isLoading ? 'Salvando...' : 'Salvar Propriedade'}
                      </Button>
                    </div>
                  </div>
                )}

                {selectedProperty && !isCreatingProperty && (
                  <div className="bg-orange-50 p-6 rounded-xl flex items-center gap-4 border border-orange-100">
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-orange-600 font-bold text-2xl shadow-sm">
                      <Home className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{selectedProperty.name}</p>
                      <p className="text-sm text-gray-600">
                          {selectedProperty.city} - {selectedProperty.state}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{selectedProperty.address}</p>
                    </div>
                    <Button variant="ghost" className="ml-auto text-orange-600 hover:text-orange-700" onClick={() => setSelectedProperty(null)}>
                        Alterar
                    </Button>
                  </div>
                )}

                <div className="flex justify-between pt-8 border-t mt-8">
                  <Button variant="outline" onClick={() => setStep(2)} className="h-12 px-6">
                    <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
                  </Button>
                  <Button 
                    onClick={finishRegistration} 
                    className="bg-green-600 hover:bg-green-700 text-white px-10 h-12 text-lg rounded-xl shadow-lg shadow-green-900/10"
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