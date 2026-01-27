import React, { useState } from 'react'
import Layout from '../components/Layout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Modal } from '../components/ui/Modal'
import { Select } from '../components/ui/Select'
import {
  Search,
  Plus,
  Minus,
  Filter,
  Package,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock de dados para reproduzir a imagem
const INITIAL_INVENTORY = [
  {
    id: 1,
    name: 'Anestésico Lidocaína 2%',
    category: 'Medicamentos',
    stock: 12,
    unit: 'frascos',
    min: 5,
    validity: '15/10/2024',
    supplier: 'Dental Med',
    cost: 'R$ 45,00',
    status: 'ok',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=60'
  },
  {
    id: 2,
    name: 'Luvas Nitrílicas M',
    category: 'Descartáveis',
    stock: 150,
    unit: 'caixas',
    min: 200,
    validity: '01/02/2025',
    supplier: 'MaxiClean',
    cost: 'R$ 22,50',
    status: 'low',
    image: 'https://images.unsplash.com/photo-1584555613497-9ecf9dd06f68?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=60'
  },
  {
    id: 3,
    name: 'Fio Dental Veterinário',
    category: 'Higiene',
    stock: 30,
    unit: 'unidades',
    min: 10,
    validity: '20/11/2024',
    supplier: 'PetCare Supplies',
    cost: 'R$ 12,00',
    status: 'ok',
    image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=60' // Placeholder
  },
  {
    id: 4,
    name: 'Broca Cirúrgica Esférica',
    category: 'Instrumental',
    stock: 5,
    unit: 'unidades',
    min: 2,
    validity: '-',
    supplier: 'OrthoVet',
    cost: 'R$ 85,00',
    status: 'ok',
    image: 'https://images.unsplash.com/photo-1584555613497-9ecf9dd06f68?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=60' // Placeholder
  },
  {
    id: 5,
    name: 'Antibiótico Cefalexina 500mg',
    category: 'Medicamentos',
    stock: 5,
    unit: 'cartelas',
    min: 10,
    validity: '05/07/2024',
    supplier: 'Farmácia Central',
    cost: 'R$ 30,00',
    status: 'expired',
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=60'
  },
  {
    id: 6,
    name: 'Gaze Estéril',
    category: 'Descartáveis',
    stock: 50,
    unit: 'pacotes',
    min: 100,
    validity: '10/09/2025',
    supplier: 'Hospitalar Imports',
    cost: 'R$ 8,90',
    status: 'low',
    image: 'https://images.unsplash.com/photo-1584555613497-9ecf9dd06f68?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=60' // Placeholder
  }
]

export default function Inventory() {
  const [items, setItems] = useState(INITIAL_INVENTORY)
  const [selectedItem, setSelectedItem] = useState(INITIAL_INVENTORY[1]) // Luvas selecionadas por padrão
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState(null) // 'entry', 'exit', 'create', 'edit'
  const [formData, setFormData] = useState({})
  const [movementAmount, setMovementAmount] = useState('')

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenModal = (type, item = null) => {
    setModalType(type)
    if (type === 'create') {
      setFormData({
        name: '', category: 'Medicamentos', stock: 0, unit: 'unidades',
        min: 10, validity: '', supplier: '', cost: '', status: 'ok',
        image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=60'
      })
    } else if (item) {
      setFormData({ ...item })
    } else if (selectedItem) {
      setFormData({ ...selectedItem })
    }
    setMovementAmount('')
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (modalType === 'create') {
      const newItem = {
        ...formData,
        id: Math.max(...items.map(i => i.id), 0) + 1
      }
      setItems([...items, newItem])
      setSelectedItem(newItem)
    } else if (modalType === 'edit') {
      setItems(items.map(i => i.id === formData.id ? formData : i))
      setSelectedItem(formData)
    } else if (modalType === 'entry') {
      const amount = parseInt(movementAmount) || 0
      const updatedItem = { ...formData, stock: formData.stock + amount }
      setItems(items.map(i => i.id === formData.id ? updatedItem : i))
      setSelectedItem(updatedItem)
    } else if (modalType === 'exit') {
      const amount = parseInt(movementAmount) || 0
      const updatedItem = { ...formData, stock: Math.max(0, formData.stock - amount) }
      setItems(items.map(i => i.id === formData.id ? updatedItem : i))
      setSelectedItem(updatedItem)
    }
    setIsModalOpen(false)
  }

  const handleQuickEditChange = (field, value) => {
    setSelectedItem(prev => ({ ...prev, [field]: value }))
  }

  const handleQuickEditSave = () => {
    setItems(items.map(i => i.id === selectedItem.id ? selectedItem : i))
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ok':
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-700">OK</span>
      case 'low':
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">Baixo</span>
      case 'expired':
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Vencendo</span>
      default:
        return null
    }
  }

  return (
    <Layout>
      <div className="flex h-[calc(100vh-8rem)] gap-6">
        
        {/* Lista de Insumos */}
        <div className="flex-1 bg-white rounded-xl shadow-sm flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Insumos</h1>
              <div className="flex gap-3">
                <Button 
                  onClick={() => handleOpenModal('entry')}
                  className="bg-[#00BFA5] hover:bg-[#00BFA5]/90 text-white gap-2"
                >
                  <Plus className="h-4 w-4" /> Entrada
                </Button>
                <Button 
                  onClick={() => handleOpenModal('exit')}
                  className="bg-[#0B2C4D] hover:bg-[#0B2C4D]/90 text-white gap-2"
                >
                  <Minus className="h-4 w-4" /> Saída
                </Button>
                <Button 
                  onClick={() => handleOpenModal('create')}
                  variant="outline" 
                  className="text-[#00BFA5] border-[#00BFA5] hover:bg-teal-50"
                >
                  Cadastrar item
                </Button>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Pesquisar..." 
                  className="pl-10 rounded-lg border-gray-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" className="gap-2 text-gray-600 border-gray-200">
                <Filter className="h-4 w-4" /> Filtro
              </Button>
            </div>
          </div>

          {/* Tabela */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#0B2C4D] text-white text-sm sticky top-0 z-10">
                <tr>
                  <th className="p-4 rounded-tl-lg">Item</th>
                  <th className="p-4">Categoria</th>
                  <th className="p-4">Estoque</th>
                  <th className="p-4">Mínimo</th>
                  <th className="p-4">Validade</th>
                  <th className="p-4">Fornecedor</th>
                  <th className="p-4">Custo</th>
                  <th className="p-4 rounded-tr-lg text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-600">
                {filteredItems.map((item) => (
                  <tr 
                    key={item.id} 
                    className={cn(
                      "hover:bg-gray-50 cursor-pointer transition-colors",
                      selectedItem?.id === item.id && "bg-blue-50/50 border-l-4 border-[#00BFA5]"
                    )}
                    onClick={() => setSelectedItem(item)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                        <span className="font-medium text-gray-900">{item.name}</span>
                      </div>
                    </td>
                    <td className="p-4">{item.category}</td>
                    <td className="p-4 font-medium text-gray-900">{item.stock} {item.unit}</td>
                    <td className="p-4">{item.min} {item.unit}</td>
                    <td className="p-4">{item.validity}</td>
                    <td className="p-4">{item.supplier}</td>
                    <td className="p-4 font-medium text-gray-900">{item.cost}</td>
                    <td className="p-4 text-center">
                      {getStatusBadge(item.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Paginação */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-4 text-sm text-gray-500">
            <span>Mostrando 1-6 de 45 itens</span>
            <div className="flex gap-1">
              <button className="p-1 hover:bg-gray-100 rounded"><ChevronLeft className="h-4 w-4" /></button>
              <button className="px-3 py-1 bg-gray-100 rounded text-gray-900 font-medium">1</button>
              <button className="p-1 hover:bg-gray-100 rounded"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </div>

        {/* Sidebar Direita - Detalhes */}
        <div className="w-80 bg-white rounded-xl shadow-sm p-6 flex flex-col h-full overflow-y-auto flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Detalhes do Item</h2>
          
          {selectedItem ? (
            <>
              <div className="flex flex-col items-center text-center mb-6">
                <img src={selectedItem.image} alt="" className="w-32 h-32 rounded-xl object-cover bg-gray-100 mb-4 shadow-sm" />
                <h3 className="text-lg font-bold text-gray-900">{selectedItem.name}</h3>
                <div className="mt-2">
                  {getStatusBadge(selectedItem.status)}
                </div>
              </div>

              {/* Gráfico Mockado */}
              <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-semibold text-gray-900">Histórico de Estoque</span>
                  <span className="text-xs text-gray-500">30 dias</span>
                </div>
                <div className="h-24 bg-teal-50 rounded-lg relative overflow-hidden flex items-end">
                   {/* Simulação de gráfico de área */}
                   <svg viewBox="0 0 100 40" className="w-full h-full text-[#00BFA5] fill-current opacity-20">
                     <path d="M0 40 L0 10 Q20 5 40 20 T80 25 T100 30 L100 40 Z" />
                   </svg>
                   <svg viewBox="0 0 100 40" className="w-full h-full text-[#00BFA5] stroke-current stroke-2 fill-none absolute inset-0">
                     <path d="M0 10 Q20 5 40 20 T80 25 T100 30" vectorEffect="non-scaling-stroke" />
                   </svg>
                </div>
                <div className="mt-2 space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Última entrada:</span>
                    <span className="font-medium">10/05 (50 un.)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Última saída:</span>
                    <span className="font-medium">25/05 (20 un.)</span>
                  </div>
                </div>
              </div>

              {/* Alerta de Estoque Baixo */}
              {selectedItem.status === 'low' && (
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 mb-6">
                  <p className="text-xs text-orange-800 leading-relaxed">
                    <span className="font-bold">Atenção:</span> Estoque abaixo do mínimo ({selectedItem.stock} &lt; {selectedItem.min}). Recomenda-se reposição.
                  </p>
                </div>
              )}

              {/* Quick Edit Form */}
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900 text-sm">Quick Edit</h4>
                
                <div>
                  <Label className="text-xs text-gray-500">Quantidade Atual</Label>
                  <Input 
                    value={selectedItem.stock} 
                    onChange={(e) => handleQuickEditChange('stock', parseInt(e.target.value) || 0)}
                    className="h-8 mt-1" 
                  />
                </div>
                
                <div>
                  <Label className="text-xs text-gray-500">Mínimo</Label>
                  <Input 
                    value={selectedItem.min} 
                    onChange={(e) => handleQuickEditChange('min', parseInt(e.target.value) || 0)}
                    className="h-8 mt-1" 
                  />
                </div>

                <div>
                  <Label className="text-xs text-gray-500">Validade</Label>
                  <Input 
                    value={selectedItem.validity} 
                    onChange={(e) => handleQuickEditChange('validity', e.target.value)}
                    className="h-8 mt-1" 
                  />
                </div>

                <Button 
                  onClick={handleQuickEditSave}
                  className="w-full bg-[#00BFA5] hover:bg-[#00BFA5]/90 text-white mt-2"
                >
                  Salvar Alterações
                </Button>
                
                <Button 
                  onClick={() => handleOpenModal('edit')}
                  className="w-full bg-[#0B2C4D] hover:bg-[#0B2C4D]/90 text-white"
                >
                  Editar Detalhes
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Package className="h-12 w-12 mb-4 opacity-20" />
              <p>Selecione um item para ver os detalhes</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalType === 'create' ? 'Cadastrar Novo Item' :
          modalType === 'edit' ? 'Editar Item' :
          modalType === 'entry' ? 'Entrada de Estoque' : 'Saída de Estoque'
        }
        className="max-w-xl"
      >
        <div className="space-y-4">
          {(modalType === 'create' || modalType === 'edit') && (
            <>
              <div className="space-y-2">
                <Label>Nome do Item</Label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Anestésico Lidocaína"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select
                    value={formData.category || 'Medicamentos'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Medicamentos">Medicamentos</option>
                    <option value="Descartáveis">Descartáveis</option>
                    <option value="Higiene">Higiene</option>
                    <option value="Instrumental">Instrumental</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Unidade</Label>
                  <Select
                    value={formData.unit || 'unidades'}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  >
                    <option value="unidades">Unidades</option>
                    <option value="caixas">Caixas</option>
                    <option value="frascos">Frascos</option>
                    <option value="pacotes">Pacotes</option>
                    <option value="cartelas">Cartelas</option>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Estoque Inicial</Label>
                  <Input
                    type="number"
                    value={formData.stock || 0}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estoque Mínimo</Label>
                  <Input
                    type="number"
                    value={formData.min || 0}
                    onChange={(e) => setFormData({ ...formData, min: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fornecedor</Label>
                  <Input
                    value={formData.supplier || ''}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Custo Unitário</Label>
                  <Input
                    value={formData.cost || ''}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    placeholder="R$ 0,00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Validade</Label>
                <Input
                  value={formData.validity || ''}
                  onChange={(e) => setFormData({ ...formData, validity: e.target.value })}
                  placeholder="DD/MM/AAAA"
                />
              </div>
            </>
          )}

          {(modalType === 'entry' || modalType === 'exit') && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Selecione o Item</Label>
                <Select
                  value={formData.id || ''}
                  onChange={(e) => {
                    const item = items.find(i => i.id === parseInt(e.target.value))
                    if (item) setFormData({ ...item })
                  }}
                >
                  {items.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </Select>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4 flex justify-between items-center">
                <span className="text-sm text-gray-600">Estoque atual:</span>
                <span className="font-bold text-gray-900">{formData.stock} {formData.unit}</span>
              </div>
              
              <div className="space-y-2">
                <Label>Quantidade de {modalType === 'entry' ? 'Entrada' : 'Saída'}</Label>
                <Input
                  type="number"
                  value={movementAmount}
                  onChange={(e) => setMovementAmount(e.target.value)}
                  placeholder="0"
                  autoFocus
                />
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              className={cn(
                "text-white",
                modalType === 'exit' ? "bg-red-600 hover:bg-red-700" : "bg-[#0B2C4D] hover:bg-[#0B2C4D]/90"
              )}
            >
              {modalType === 'create' ? 'Cadastrar' : 
               modalType === 'edit' ? 'Salvar Alterações' : 'Confirmar'}
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
