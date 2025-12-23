import React, { useState } from 'react'
import Layout from '../components/Layout'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Modal } from '../components/ui/Modal'
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  Send, 
  Calendar,
  Heart,
  FileText,
  DollarSign,
  MoreVertical,
  Archive,
  Copy
} from 'lucide-react'

export default function ArchivedGraphics() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [selectedGraphic, setSelectedGraphic] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Mock data for archived graphics
  const [graphics, setGraphics] = useState([
    {
      id: 1,
      date: '2024-01-15',
      clientName: 'João Silva',
      horseName: 'Thunder',
      horseBreed: 'Quarto de Milha',
      veterinarian: 'Dr. Maria Santos',
      status: 'completed',
      totalValue: 850.00,
      procedures: ['Limpeza Dental', 'Extração', 'Radiografia'],
      paymentStatus: 'paid',
      notes: 'Procedimento realizado com sucesso. Cavalo cooperativo.',
      createdAt: '2024-01-15T10:30:00'
    },
    {
      id: 2,
      date: '2024-01-12',
      clientName: 'Ana Costa',
      horseName: 'Estrela',
      horseBreed: 'Mangalarga',
      veterinarian: 'Dr. Carlos Lima',
      status: 'completed',
      totalValue: 1200.00,
      procedures: ['Tratamento de Canal', 'Restauração', 'Limpeza'],
      paymentStatus: 'pending',
      notes: 'Necessário acompanhamento em 30 dias.',
      createdAt: '2024-01-12T14:15:00'
    },
    {
      id: 3,
      date: '2024-01-10',
      clientName: 'Pedro Oliveira',
      horseName: 'Relâmpago',
      horseBreed: 'Puro Sangue Inglês',
      veterinarian: 'Dr. Maria Santos',
      status: 'completed',
      totalValue: 650.00,
      procedures: ['Exame Clínico', 'Limpeza Dental'],
      paymentStatus: 'paid',
      notes: 'Exame de rotina. Tudo normal.',
      createdAt: '2024-01-10T09:00:00'
    },
    {
      id: 4,
      date: '2024-01-08',
      clientName: 'Lucia Ferreira',
      horseName: 'Ventania',
      horseBreed: 'Crioulo',
      veterinarian: 'Dr. Carlos Lima',
      status: 'completed',
      totalValue: 950.00,
      procedures: ['Cirurgia Oral', 'Medicação', 'Acompanhamento'],
      paymentStatus: 'partial',
      notes: 'Cirurgia complexa. Recuperação satisfatória.',
      createdAt: '2024-01-08T16:45:00'
    }
  ])

  const filteredGraphics = graphics.filter(graphic => {
    const matchesSearch = 
      graphic.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      graphic.horseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      graphic.veterinarian.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !filterStatus || graphic.paymentStatus === filterStatus
    const matchesDate = !filterDate || graphic.date.startsWith(filterDate)
    
    return matchesSearch && matchesStatus && matchesDate
  })

  const handleView = (graphic) => {
    setSelectedGraphic(graphic)
    setShowViewModal(true)
  }

  const handleEdit = (graphic) => {
    // Navigate to edit mode of CreateGraphic
    alert(`Editando gráfico de ${graphic.horseName} - ${graphic.clientName}`)
  }

  const handleDelete = (graphic) => {
    setSelectedGraphic(graphic)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    setGraphics(prev => prev.filter(g => g.id !== selectedGraphic.id))
    setShowDeleteModal(false)
    setSelectedGraphic(null)
  }

  const handlePrint = async (graphic) => {
    setIsLoading(true)
    // Simulate PDF generation and print
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsLoading(false)
    alert(`Imprimindo gráfico de ${graphic.horseName}`)
  }

  const handleSend = async (graphic) => {
    setIsLoading(true)
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    alert(`Email enviado para o cliente ${graphic.clientName}`)
  }

  const handleDuplicate = (graphic) => {
    const newGraphic = {
      ...graphic,
      id: Math.max(...graphics.map(g => g.id)) + 1,
      date: new Date().toISOString().split('T')[0],
      status: 'draft',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString()
    }
    setGraphics(prev => [newGraphic, ...prev])
    alert(`Gráfico duplicado para ${graphic.horseName}`)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'partial': return 'bg-blue-100 text-blue-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'paid': return 'Pago'
      case 'pending': return 'Pendente'
      case 'partial': return 'Parcial'
      case 'overdue': return 'Vencido'
      default: return status
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gráficos Arquivados</h1>
            <p className="text-gray-600">Gerencie os gráficos dentais finalizados</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Exportar Dados
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por cliente, cavalo ou veterinário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Todos os status</option>
                <option value="paid">Pago</option>
                <option value="pending">Pendente</option>
                <option value="partial">Parcial</option>
                <option value="overdue">Vencido</option>
              </Select>

              <Input
                type="month"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                placeholder="Filtrar por mês"
              />

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setFilterStatus('')
                  setFilterDate('')
                }}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Graphics List */}
        <div className="grid gap-4">
          {filteredGraphics.map((graphic) => (
            <Card key={graphic.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Patient Info */}
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Heart className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{graphic.horseName}</p>
                        <p className="text-sm text-gray-600">{graphic.horseBreed}</p>
                        <p className="text-xs text-gray-500">{graphic.clientName}</p>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">{new Date(graphic.date).toLocaleDateString('pt-BR')}</p>
                        <p className="text-xs text-gray-500">{graphic.veterinarian}</p>
                      </div>
                    </div>

                    {/* Procedures */}
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Procedimentos</p>
                      <div className="space-y-1">
                        {graphic.procedures.slice(0, 2).map((proc, index) => (
                          <p key={index} className="text-xs text-gray-600">{proc}</p>
                        ))}
                        {graphic.procedures.length > 2 && (
                          <p className="text-xs text-gray-500">+{graphic.procedures.length - 2} mais</p>
                        )}
                      </div>
                    </div>

                    {/* Payment */}
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium">R$ {graphic.totalValue.toFixed(2)}</p>
                        <span className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(graphic.paymentStatus)}`}>
                          {getStatusLabel(graphic.paymentStatus)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(graphic)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        Ver
                      </Button>
                      
                      <div className="relative group">
                        <Button size="sm" variant="outline" className="p-2">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                        
                        <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                          <button
                            onClick={() => handleEdit(graphic)}
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 w-full text-left"
                          >
                            <Edit className="h-3 w-3" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDuplicate(graphic)}
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 w-full text-left"
                          >
                            <Copy className="h-3 w-3" />
                            Duplicar
                          </button>
                          <button
                            onClick={() => handlePrint(graphic)}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 w-full text-left"
                          >
                            <Download className="h-3 w-3" />
                            Imprimir
                          </button>
                          <button
                            onClick={() => handleSend(graphic)}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 w-full text-left"
                          >
                            <Send className="h-3 w-3" />
                            Enviar
                          </button>
                          <hr className="my-1" />
                          <button
                            onClick={() => handleDelete(graphic)}
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 w-full text-left text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredGraphics.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum gráfico encontrado
                </h3>
                <p className="text-gray-600">
                  {searchTerm || filterStatus || filterDate 
                    ? 'Tente ajustar os filtros de busca'
                    : 'Ainda não há gráficos arquivados'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* View Modal */}
        {showViewModal && selectedGraphic && (
          <Modal
            isOpen={showViewModal}
            onClose={() => setShowViewModal(false)}
            title={`Gráfico - ${selectedGraphic.horseName}`}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Informações do Paciente</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Cavalo:</span> {selectedGraphic.horseName}</p>
                    <p><span className="font-medium">Raça:</span> {selectedGraphic.horseBreed}</p>
                    <p><span className="font-medium">Proprietário:</span> {selectedGraphic.clientName}</p>
                    <p><span className="font-medium">Veterinário:</span> {selectedGraphic.veterinarian}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Informações Financeiras</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Data:</span> {new Date(selectedGraphic.date).toLocaleDateString('pt-BR')}</p>
                    <p><span className="font-medium">Valor Total:</span> R$ {selectedGraphic.totalValue.toFixed(2)}</p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(selectedGraphic.paymentStatus)}`}>
                        {getStatusLabel(selectedGraphic.paymentStatus)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Procedimentos Realizados</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {selectedGraphic.procedures.map((proc, index) => (
                    <li key={index}>{proc}</li>
                  ))}
                </ul>
              </div>

              {selectedGraphic.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Observações</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    {selectedGraphic.notes}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => handlePrint(selectedGraphic)}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Imprimir
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSend(selectedGraphic)}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Enviar por Email
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedGraphic && (
          <Modal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            title="Confirmar Exclusão"
          >
            <div className="space-y-4">
              <p className="text-gray-700">
                Tem certeza que deseja excluir o gráfico de <strong>{selectedGraphic.horseName}</strong> 
                do cliente <strong>{selectedGraphic.clientName}</strong>?
              </p>
              <p className="text-sm text-red-600">
                Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  )
}
