import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Select } from '../components/ui/Select'
import { Modal } from '../components/ui/Modal'
import { Plus, Search } from 'lucide-react'
import ClientDetailsSidebar from '../components/ClientDetailsSidebar'
import { cn } from '@/lib/utils'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { mockDB } from '../services/mockDatabase'
import { Autocomplete } from '../shared/Autocomplete'

export default function Clients() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Data State
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  
  // Filter State
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  // Modals State
  const [openPatientModal, setOpenPatientModal] = useState(false)
  const [openOwnerModal, setOpenOwnerModal] = useState(false)
  const [openPropertyCreateModal, setOpenPropertyCreateModal] = useState(false)
  
  // Registration Form State (Inside Modal)
  const [owners, setOwners] = useState([])
  const [properties, setProperties] = useState([])
  
  const [selectedOwner, setSelectedOwner] = useState(null)
  const [selectedProperty, setSelectedProperty] = useState(null)
  
  // --- Property Registration Logic ---
  const [newProperty, setNewProperty] = useState({})

  const handleCreateProperty = () => {
    if (newProperty.name && newProperty.city && newProperty.state) {
      const created = mockDB.createProperty({
        ...newProperty,
        address: newProperty.address || ''
      })
      setProperties([...properties, created])
      alert('Propriedade cadastrada com sucesso!')
      setOpenPropertyCreateModal(false)
      setNewProperty({})
    } else {
      alert('Preencha Nome, Cidade e Estado.')
    }
  }

  const [newPatient, setNewPatient] = useState({ species: 'Equine' })
  const [useBirthDate, setUseBirthDate] = useState(true)
  const [birthDateInput, setBirthDateInput] = useState('')

  useEffect(() => {
    // Load data
    const ownersData = mockDB.getOwners()
    setOwners(ownersData)
    setClients(ownersData) // In this mock, clients list is owners list
    setProperties(mockDB.getAllProperties()) // Updated method name

    // Check query params for auto-open
    const params = new URLSearchParams(location.search)
    if (params.get('action') === 'new') {
      setOpenPatientModal(true)
    }
  }, [location.search])

  // --- Registration Logic ---
  const handleCreatePatient = () => {
    if (selectedOwner && newPatient.name) {
       // Validate Equine Property
       if (newPatient.species === 'Equine' && !selectedProperty) {
         alert('Cavalos precisam de uma propriedade vinculada!')
         return
       }

       let finalAge = Number(newPatient.age)
       if (useBirthDate && birthDateInput) {
           const birth = new Date(birthDateInput)
           const now = new Date()
           let age = now.getFullYear() - birth.getFullYear()
           const m = now.getMonth() - birth.getMonth()
           if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
               age--
           }
           finalAge = age
       }

       mockDB.createPatient({
         ...newPatient,
         ownerId: selectedOwner.id,
         propertyId: selectedProperty?.id,
         age: finalAge,
         birthDate: birthDateInput,
         weight: Number(newPatient.weight)
       })

       alert('Paciente cadastrado com sucesso!')
       setOpenPatientModal(false)
       navigate('/attendance-new')
    } else {
      alert('Selecione um tutor e preencha o nome do paciente.')
    }
  }

  // --- Filtering Logic ---
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase())
    if (!matchesSearch) return false
    return true
  })

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0B2C4D]">Clientes</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              className="flex items-center gap-2 bg-[#00BFA5] hover:bg-[#00BFA5]/90 text-white rounded-full px-6"
              onClick={() => setOpenPatientModal(true)}
            >
              <Plus className="h-4 w-4" />
              Cadastro Paciente
            </Button>
            <Link to="/owners/new">
              <Button variant="outline" className="rounded-full px-6">
                Novo Proprietário
              </Button>
            </Link>
            <Button variant="outline" className="rounded-full px-6" onClick={() => setOpenOwnerModal(true)}>
              Alteração de proprietário
            </Button>
            <Button variant="outline" className="rounded-full px-6" onClick={() => setOpenPropertyCreateModal(true)}>
              Cadastro da propriedade
            </Button>
          </div>
        </div>

        {/* --- MODAL CADASTRO PACIENTE (REFACTORED) --- */}
        <Modal
          isOpen={openPatientModal}
          onClose={() => setOpenPatientModal(false)}
          title="Cadastro de Paciente"
          className="max-w-4xl" // Wider to fit everything
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Owner & Property Selection */}
            <div className="space-y-4 border-r pr-4">
                <h3 className="font-semibold text-gray-700">1. Vínculos</h3>
                
                <div>
                    <Label>Proprietário (Tutor)</Label>
                    <Autocomplete 
                        options={owners.map(o => ({ id: o.id, label: o.name }))}
                        onSelect={(opt) => {
                            const o = owners.find(owner => owner.id === opt.id)
                            setSelectedOwner(o || null)
                        }}
                        placeholder="Buscar tutor..."
                        value={selectedOwner?.name}
                    />
                </div>

                <div>
                    <Label>Propriedade (Obrigatório para Equinos)</Label>
                    <Autocomplete 
                        options={properties.map(p => ({ id: p.id, label: `${p.name} - ${p.city}` }))}
                        onSelect={(opt) => {
                            const p = properties.find(prop => prop.id === opt.id)
                            setSelectedProperty(p || null)
                        }}
                        placeholder="Buscar propriedade..."
                        value={selectedProperty?.name}
                    />
                    <p className="text-xs text-gray-500 mt-1">Cães e Gatos herdam endereço do tutor se vazio.</p>
                </div>

                {selectedOwner && (
                    <div className="bg-blue-50 p-3 rounded text-sm">
                        <p><strong>Tutor:</strong> {selectedOwner.name}</p>
                        <p><strong>Propriedade:</strong> {selectedProperty?.name || 'N/A'}</p>
                    </div>
                )}
            </div>

            {/* Right Column: Patient Details */}
            <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">2. Dados do Animal</h3>

                <div>
                  <Label htmlFor="petName">Nome</Label>
                  <Input 
                    id="petName" 
                    placeholder="Ex.: Thor" 
                    onChange={e => setNewPatient({...newPatient, name: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <Label htmlFor="species">Espécie</Label>
                    <Select 
                        id="species" 
                        defaultValue="Equino"
                        onChange={e => setNewPatient({...newPatient, species: e.target.value})}
                    >
                        <option value="Equine">Equino</option>
                        <option value="Canine">Canino</option>
                        <option value="Feline">Felino</option>
                        <option value="Bovine">Bovino</option>
                    </Select>
                    </div>
                    <div>
                    <Label htmlFor="sex">Sexo</Label>
                    <Select id="sex" onChange={e => setNewPatient({...newPatient, gender: e.target.value})}>
                        <option value="M">Macho</option>
                        <option value="F">Fêmea</option>
                    </Select>
                    </div>
                </div>

                <div>
                  <Label htmlFor="breed">Raça</Label>
                  <Input 
                    id="breed" 
                    placeholder="Ex.: Mangalarga" 
                    onChange={e => setNewPatient({...newPatient, breed: e.target.value})}
                  />
                </div>

                {/* Age Logic */}
                <div className="bg-gray-50 p-3 rounded border">
                    <div className="flex justify-between mb-2">
                        <Label>Idade / Nascimento</Label>
                        <div className="text-xs space-x-2">
                            <span 
                                className={`cursor-pointer ${useBirthDate ? 'text-blue-600 font-bold' : 'text-gray-400'}`}
                                onClick={() => setUseBirthDate(true)}
                            >
                                Data
                            </span>
                            <span>|</span>
                            <span 
                                className={`cursor-pointer ${!useBirthDate ? 'text-blue-600 font-bold' : 'text-gray-400'}`}
                                onClick={() => setUseBirthDate(false)}
                            >
                                Manual
                            </span>
                        </div>
                    </div>
                    {useBirthDate ? (
                        <Input type="date" onChange={e => setBirthDateInput(e.target.value)} />
                    ) : (
                        <Input 
                            type="number" 
                            placeholder="Anos" 
                            onChange={e => setNewPatient({...newPatient, age: Number(e.target.value)})}
                        />
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="weight">Peso (kg)</Label>
                        <Input 
                            id="weight" 
                            type="number" 
                            onChange={e => setNewPatient({...newPatient, weight: Number(e.target.value)})}
                        />
                    </div>
                    <div>
                         <Label htmlFor="color">Pelagem</Label>
                         <Input 
                            id="color" 
                            onChange={e => setNewPatient({...newPatient, color: e.target.value})}
                        />
                    </div>
                </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={() => setOpenPatientModal(false)}>Cancelar</Button>
            <Button onClick={handleCreatePatient} className="bg-blue-600 text-white">Salvar e Atender</Button>
          </div>
        </Modal>

        {/* Other Modals (Placeholders for now) */}
        <Modal isOpen={openOwnerModal} onClose={() => setOpenOwnerModal(false)} title="Alteração de Proprietário">
            <p>Formulário de alteração...</p>
        </Modal>
        <Modal isOpen={openPropertyCreateModal} onClose={() => setOpenPropertyCreateModal(false)} title="Cadastro de Propriedade">
            <p>Formulário de propriedade...</p>
        </Modal>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Pesquisar cliente"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-full border-gray-200"
            />
          </div>
        </div>

        {/* Clients Table (Simplified for Mock) */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-sm font-semibold text-gray-900">
                    <th className="p-4 pl-6">Nome do tutor</th>
                    <th className="p-4">CPF/CNPJ</th>
                    <th className="p-4">Telefone</th>
                    <th className="p-4">Cidade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredClients.map((client) => (
                    <tr
                      key={client.id}
                      className={cn(
                        "hover:bg-gray-50 cursor-pointer transition-colors text-sm text-gray-600",
                        selectedClient?.id === client.id ? "bg-blue-50/50" : ""
                      )}
                      onClick={() => setSelectedClient(client)}
                    >
                      <td className="p-4 pl-6 font-medium text-gray-900">{client.name}</td>
                      <td className="p-4">{client.document || '-'}</td>
                      <td className="p-4">{client.phone}</td>
                      <td className="p-4">{client.address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details Sidebar */}
      {selectedClient && (
          <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-lg p-6 transform transition-transform z-50">
              <div className="flex justify-between mb-4">
                  <h2 className="font-bold text-xl">{selectedClient.name}</h2>
                  <button onClick={() => setSelectedClient(null)}>X</button>
              </div>
              <p>Email: {selectedClient.email}</p>
              <p>Telefone: {selectedClient.phone}</p>
              <p>Endereço: {selectedClient.address}</p>
          </div>
      )}
    </Layout>
  )
}
