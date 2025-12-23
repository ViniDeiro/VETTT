import React, { useState } from 'react'
import Layout from '../components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Modal } from '../components/ui/Modal'
import { Plus, Search, Edit, Trash2, Phone, Mail, MapPin } from 'lucide-react'

export default function Veterinarians() {
  const [veterinarians, setVeterinarians] = useState([
    {
      id: 1,
      name: 'Dr. Ana Paula Oliveira',
      crmv: 'CRMV-SP 12345',
      specialty: 'Odontologia Equina',
      phone: '(11) 99999-1111',
      email: 'ana.oliveira@email.com',
      address: 'São Paulo, SP',
      registrationDate: '2023-01-10'
    },
    {
      id: 2,
      name: 'Dr. Carlos Eduardo Santos',
      crmv: 'CRMV-RJ 67890',
      specialty: 'Cirurgia Equina',
      phone: '(21) 99999-2222',
      email: 'carlos.santos@email.com',
      address: 'Rio de Janeiro, RJ',
      registrationDate: '2023-02-15'
    },
    {
      id: 3,
      name: 'Dra. Fernanda Lima',
      crmv: 'CRMV-MG 11111',
      specialty: 'Clínica Geral Equina',
      phone: '(31) 99999-3333',
      email: 'fernanda.lima@email.com',
      address: 'Belo Horizonte, MG',
      registrationDate: '2023-03-20'
    }
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVeterinarian, setEditingVeterinarian] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    crmv: '',
    specialty: '',
    phone: '',
    email: '',
    address: ''
  })

  const specialties = [
    'Odontologia Equina',
    'Cirurgia Equina',
    'Clínica Geral Equina',
    'Ortopedia Equina',
    'Reprodução Equina',
    'Cardiologia Equina',
    'Dermatologia Equina',
    'Oftalmologia Equina',
    'Neurologia Equina',
    'Anestesiologia Equina'
  ]

  const filteredVeterinarians = veterinarians.filter(vet =>
    vet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vet.crmv.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vet.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenModal = (veterinarian = null) => {
    if (veterinarian) {
      setEditingVeterinarian(veterinarian)
      setFormData({
        name: veterinarian.name,
        crmv: veterinarian.crmv,
        specialty: veterinarian.specialty,
        phone: veterinarian.phone,
        email: veterinarian.email,
        address: veterinarian.address
      })
    } else {
      setEditingVeterinarian(null)
      setFormData({
        name: '',
        crmv: '',
        specialty: '',
        phone: '',
        email: '',
        address: ''
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingVeterinarian(null)
    setFormData({
      name: '',
      crmv: '',
      specialty: '',
      phone: '',
      email: '',
      address: ''
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (editingVeterinarian) {
      // Update existing veterinarian
      setVeterinarians(veterinarians.map(vet =>
        vet.id === editingVeterinarian.id
          ? { ...vet, ...formData }
          : vet
      ))
    } else {
      // Add new veterinarian
      const newVeterinarian = {
        id: Date.now(),
        ...formData,
        registrationDate: new Date().toISOString().split('T')[0]
      }
      setVeterinarians([...veterinarians, newVeterinarian])
    }
    
    handleCloseModal()
  }

  const handleDelete = (veterinarianId) => {
    if (window.confirm('Tem certeza que deseja excluir este veterinário?')) {
      setVeterinarians(veterinarians.filter(vet => vet.id !== veterinarianId))
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Veterinários</h1>
            <p className="text-gray-600 mt-2">Gerencie os veterinários e suas especialidades</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Veterinário
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar veterinários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Veterinarians Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVeterinarians.map((veterinarian) => (
            <Card key={veterinarian.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{veterinarian.name}</CardTitle>
                <p className="text-sm text-blue-600 font-medium">{veterinarian.crmv}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-blue-50 px-3 py-2 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">{veterinarian.specialty}</p>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{veterinarian.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{veterinarian.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{veterinarian.address}</span>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500">
                      Cadastrado em {new Date(veterinarian.registrationDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenModal(veterinarian)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(veterinarian.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredVeterinarians.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">Nenhum veterinário encontrado</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingVeterinarian ? 'Editar Veterinário' : 'Novo Veterinário'}
        className="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Dr. Nome Sobrenome"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="crmv">CRMV</Label>
            <Input
              id="crmv"
              value={formData.crmv}
              onChange={(e) => setFormData({ ...formData, crmv: e.target.value })}
              placeholder="CRMV-SP 12345"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="specialty">Especialidade</Label>
            <select
              id="specialty"
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecione uma especialidade</option>
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(11) 99999-9999"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="veterinario@email.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Cidade, Estado"
              required
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingVeterinarian ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}