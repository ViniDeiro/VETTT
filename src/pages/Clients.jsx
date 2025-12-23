import React, { useState } from 'react'
import Layout from '../components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Modal } from '../components/ui/Modal'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'

export default function Clients() {
  const [clients, setClients] = useState([
    {
      id: 1,
      name: 'João Silva',
      email: 'joao@email.com',
      phone: '(11) 99999-9999',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      horses: ['Thunder', 'Lightning']
    },
    {
      id: 2,
      name: 'Maria Santos',
      email: 'maria@email.com',
      phone: '(11) 88888-8888',
      address: 'Av. Principal, 456',
      city: 'Rio de Janeiro',
      horses: ['Relâmpago']
    },
    {
      id: 3,
      name: 'Pedro Costa',
      email: 'pedro@email.com',
      phone: '(11) 77777-7777',
      address: 'Rua do Campo, 789',
      city: 'Belo Horizonte',
      horses: ['Estrela', 'Cometa', 'Vento']
    }
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: ''
  })

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.city.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenModal = (client = null) => {
    if (client) {
      setEditingClient(client)
      setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        city: client.city
      })
    } else {
      setEditingClient(null)
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: ''
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingClient(null)
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: ''
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (editingClient) {
      // Update existing client
      setClients(clients.map(client =>
        client.id === editingClient.id
          ? { ...client, ...formData }
          : client
      ))
    } else {
      // Add new client
      const newClient = {
        id: Date.now(),
        ...formData,
        horses: []
      }
      setClients([...clients, newClient])
    }
    
    handleCloseModal()
  }

  const handleDelete = (clientId) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      setClients(clients.filter(client => client.id !== clientId))
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
            <p className="text-gray-600 mt-2">Gerencie os clientes e seus dados</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Cliente
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
              {/* icon color adjusted for light mode */}
              <Input
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{client.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Email:</span> {client.email}</p>
                  <p><span className="font-medium">Telefone:</span> {client.phone}</p>
                  <p><span className="font-medium">Cidade:</span> {client.city}</p>
                  <p><span className="font-medium">Cavalos:</span> {client.horses.length}</p>
                  {client.horses.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {client.horses.map((horse, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full"
                        >
                          {horse}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenModal(client)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(client.id)}
                    className="text-red-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredClients.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">Nenhum cliente encontrado</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingClient ? 'Editar Cliente' : 'Novo Cliente'}
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              required
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingClient ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}
