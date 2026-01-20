import React, { useState } from 'react'
import Layout from '../components/Layout'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Plus, Search } from 'lucide-react'
import ClientDetailsSidebar from '../components/ClientDetailsSidebar'
import { cn } from '@/lib/utils'

export default function Clients() {
  const [clients] = useState([
    {
      id: 1,
      name: 'Maria Silva',
      cpf: '123.456.789-00',
      email: 'maria@email.com',
      phone: '(11) 98765-4321',
      address: 'Rua das Flores, 123',
      city: 'São Paulo, SP',
      pets: [{ name: 'Rex', type: 'Cavalo' }, { name: 'Luna', type: 'Cavalo' }],
      lastVisit: '15/10/2023',
      status: 'active'
    },
    {
      id: 2,
      name: 'João Santos',
      cpf: '987.654.321-11',
      email: 'joao@email.com',
      phone: '(21) 91234-5678',
      address: 'Av. Principal, 456',
      city: 'Rio de Janeiro, RJ',
      pets: [{ name: 'Thor', type: 'Cavalo' }],
      lastVisit: '12/10/2023',
      status: 'active'
    },
    {
      id: 3,
      name: 'Ana Costa',
      cpf: '456.789.123-22',
      email: 'ana@email.com',
      phone: '(31) 99876-5432',
      address: 'Rua do Campo, 789',
      city: 'Belo Horizonte, MG',
      pets: [{ name: 'Bella', type: 'Cavalo' }, { name: 'Max', type: 'Cavalo' }],
      lastVisit: '10/10/2023',
      status: 'overdue' // Inadimplente
    },
    {
      id: 4,
      name: 'Carlos Oliveira',
      cpf: '12.345.678/0001-90',
      email: 'carlos@empresa.com',
      phone: '(41) 3333-4444',
      address: 'Av. Comercial, 1000',
      city: 'Curitiba, PR',
      pets: [{ name: 'Diversos', type: 'Haras' }],
      lastVisit: '05/10/2023',
      status: 'new'
    },
    {
      id: 5,
      name: 'Fernanda Lima',
      cpf: '789.123.456-33',
      email: 'fernanda@email.com',
      phone: '(51) 99123-4567',
      address: 'Rua da Paz, 50',
      city: 'Porto Alegre, RS',
      pets: [{ name: 'Nala', type: 'Cavalo' }],
      lastVisit: '01/10/2023',
      status: 'active'
    }
  ])

  const [selectedClient, setSelectedClient] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('all') // 'all', 'active', 'overdue', 'new'

  // Filter Logic
  const filteredClients = clients.filter(client => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.cpf.includes(searchTerm) ||
      client.city.toLowerCase().includes(searchTerm.toLowerCase())

    if (!matchesSearch) return false

    if (activeFilter === 'all') return true
    if (activeFilter === 'active') return client.status === 'active'
    if (activeFilter === 'overdue') return client.status === 'overdue'
    if (activeFilter === 'new') return client.status === 'new'

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
          <Button className="flex items-center gap-2 bg-[#00BFA5] hover:bg-[#00BFA5]/90 text-white rounded-full px-6">
            <Plus className="h-4 w-4" />
            Novo Cliente
          </Button>
        </div>

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

          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
            <FilterButton
              label="Ativos"
              active={activeFilter === 'active'}
              onClick={() => setActiveFilter(activeFilter === 'active' ? 'all' : 'active')}
              colorClass="bg-[#00BFA5] text-white"
            />
            <FilterButton
              label="Inadimplentes"
              active={activeFilter === 'overdue'}
              onClick={() => setActiveFilter(activeFilter === 'overdue' ? 'all' : 'overdue')}
              colorClass="bg-[#1E3A8A] text-white" // Using a dark blue from the image palette approx
            />
            <FilterButton
              label="Novos"
              active={activeFilter === 'new'}
              onClick={() => setActiveFilter(activeFilter === 'new' ? 'all' : 'new')}
              colorClass="bg-[#B2DFDB] text-[#00695C]"
            />
          </div>
        </div>

        {/* Clients Table */}
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
                    <th className="p-4">Pets</th>
                    <th className="p-4 pr-6">Último atendimento</th>
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
                      <td className="p-4">{client.cpf}</td>
                      <td className="p-4">{client.phone}</td>
                      <td className="p-4">{client.city}</td>
                      <td className="p-4">
                        {client.pets.map(p => p.name).join(', ')}
                      </td>
                      <td className="p-4 pr-6">{client.lastVisit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredClients.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                Nenhum cliente encontrado com os filtros selecionados.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Details Sidebar */}
      <ClientDetailsSidebar
        isOpen={!!selectedClient}
        onClose={() => setSelectedClient(null)}
        client={selectedClient}
      />
    </Layout>
  )
}

function FilterButton({ label, active, onClick, colorClass }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
        active
          ? colorClass
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      )}
    >
      {label}
    </button>
  )
}
