import React, { useState } from 'react'
import Layout from '../components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Select } from '../components/ui/Select'
import { Modal } from '../components/ui/Modal'
import { Plus, Search, Edit, Trash2, ArrowRightLeft } from 'lucide-react'

export default function Horses() {
  const [horses, setHorses] = useState([
    {
      id: 1,
      name: 'Thunder',
      breed: 'Puro Sangue Inglês',
      age: 5,
      color: 'Castanho',
      clientId: 1,
      clientName: 'João Silva',
      registrationDate: '2023-01-15'
    },
    {
      id: 2,
      name: 'Lightning',
      breed: 'Quarto de Milha',
      age: 3,
      color: 'Alazão',
      clientId: 1,
      clientName: 'João Silva',
      registrationDate: '2023-02-20'
    },
    {
      id: 3,
      name: 'Relâmpago',
      breed: 'Mangalarga',
      age: 7,
      color: 'Tordilho',
      clientId: 2,
      clientName: 'Maria Santos',
      registrationDate: '2023-03-10'
    },
    {
      id: 4,
      name: 'Estrela',
      breed: 'Crioulo',
      age: 4,
      color: 'Baio',
      clientId: 3,
      clientName: 'Pedro Costa',
      registrationDate: '2023-04-05'
    }
  ])

  const [clients] = useState([
    { id: 1, name: 'João Silva' },
    { id: 2, name: 'Maria Santos' },
    { id: 3, name: 'Pedro Costa' }
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [editingHorse, setEditingHorse] = useState(null)
  const [transferringHorse, setTransferringHorse] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
    color: '',
    clientId: ''
  })

  const breeds = [
    'Puro Sangue Inglês',
    'Quarto de Milha',
    'Mangalarga',
    'Crioulo',
    'Árabe',
    'Appaloosa',
    'Paint Horse',
    'Campolina',
    'Outro'
  ]

  const filteredHorses = horses.filter(horse =>
    horse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    horse.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
    horse.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenModal = (horse = null) => {
    if (horse) {
      setEditingHorse(horse)
      setFormData({
        name: horse.name,
        breed: horse.breed,
        age: horse.age.toString(),
        color: horse.color,
        clientId: horse.clientId.toString()
      })
    } else {
      setEditingHorse(null)
      setFormData({
        name: '',
        breed: '',
        age: '',
        color: '',
        clientId: ''
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingHorse(null)
    setFormData({
      name: '',
      breed: '',
      age: '',
      color: '',
      clientId: ''
    })
  }

  const handleOpenTransferModal = (horse) => {
    setTransferringHorse(horse)
    setIsTransferModalOpen(true)
  }

  const handleCloseTransferModal = () => {
    setIsTransferModalOpen(false)
    setTransferringHorse(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const clientName = clients.find(c => c.id === parseInt(formData.clientId))?.name || ''
    
    if (editingHorse) {
      // Update existing horse
      setHorses(horses.map(horse =>
        horse.id === editingHorse.id
          ? { 
              ...horse, 
              ...formData, 
              age: parseInt(formData.age),
              clientId: parseInt(formData.clientId),
              clientName
            }
          : horse
      ))
    } else {
      // Add new horse
      const newHorse = {
        id: Date.now(),
        ...formData,
        age: parseInt(formData.age),
        clientId: parseInt(formData.clientId),
        clientName,
        registrationDate: new Date().toISOString().split('T')[0]
      }
      setHorses([...horses, newHorse])
    }
    
    handleCloseModal()
  }

  const handleTransfer = (newClientId) => {
    const newClientName = clients.find(c => c.id === parseInt(newClientId))?.name || ''
    
    setHorses(horses.map(horse =>
      horse.id === transferringHorse.id
        ? { 
            ...horse, 
            clientId: parseInt(newClientId),
            clientName: newClientName
          }
        : horse
    ))
    
    handleCloseTransferModal()
  }

  const handleDelete = (horseId) => {
    if (window.confirm('Tem certeza que deseja excluir este cavalo?')) {
      setHorses(horses.filter(horse => horse.id !== horseId))
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cavalos</h1>
            <p className="text-gray-600 mt-2">Gerencie os cavalos e suas informações</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Cavalo
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar cavalos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Horses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHorses.map((horse) => (
            <Card key={horse.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{horse.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Raça:</span> {horse.breed}</p>
                  <p><span className="font-medium">Idade:</span> {horse.age} anos</p>
                  <p><span className="font-medium">Cor:</span> {horse.color}</p>
                  <p><span className="font-medium">Proprietário:</span> {horse.clientName}</p>
                  <p><span className="font-medium">Cadastro:</span> {new Date(horse.registrationDate).toLocaleDateString('pt-BR')}</p>
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenTransferModal(horse)}
                    title="Transferir cavalo"
                  >
                    <ArrowRightLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenModal(horse)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(horse.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredHorses.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">Nenhum cavalo encontrado</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingHorse ? 'Editar Cavalo' : 'Novo Cavalo'}
        className="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="breed">Raça</Label>
            <Select
              id="breed"
              value={formData.breed}
              onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
              required
            >
              <option value="">Selecione uma raça</option>
              {breeds.map((breed) => (
                <option key={breed} value={breed}>{breed}</option>
              ))}
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="age">Idade</Label>
            <Input
              id="age"
              type="number"
              min="0"
              max="50"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="color">Cor</Label>
            <Input
              id="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="clientId">Proprietário</Label>
            <Select
              id="clientId"
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              required
            >
              <option value="">Selecione um cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </Select>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingHorse ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Transfer Modal */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={handleCloseTransferModal}
        title={`Transferir ${transferringHorse?.name}`}
        className="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Selecione o novo proprietário para {transferringHorse?.name}:
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="newClientId">Novo Proprietário</Label>
            <Select
              id="newClientId"
              onChange={(e) => {
                if (e.target.value) {
                  handleTransfer(e.target.value)
                }
              }}
            >
              <option value="">Selecione um cliente</option>
              {clients
                .filter(client => client.id !== transferringHorse?.clientId)
                .map((client) => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
            </Select>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseTransferModal}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}