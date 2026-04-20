import React, { useEffect, useMemo, useState } from 'react'
import Layout from '../../components/Layout'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { Modal } from '../../components/ui/Modal'
import { Select } from '../../components/ui/Select'
import {
  Search,
  Plus,
  Minus,
  Filter,
  Package,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Autocomplete } from '../../shared/Autocomplete'
import { mockDB } from '../../services/mockDatabase'
import { InventoryItem } from '../../domain/types'

const CATEGORY_OPTIONS = [
  { value: 'Medication', label: 'Medicamentos' },
  { value: 'Material', label: 'Materiais' },
  { value: 'Vaccine', label: 'Vacinas' },
  { value: 'Feed', label: 'Alimentacao' },
  { value: 'Other', label: 'Outros' }
]

const UNIT_OPTIONS = [
  { value: 'un', label: 'Unidade' },
  { value: 'unidade', label: 'Unidade detalhada' },
  { value: 'ml', label: 'ml' },
  { value: 'mg', label: 'mg' },
  { value: 'g', label: 'g' },
  { value: 'kg', label: 'kg' },
  { value: 'comprimido', label: 'Comprimido' },
  { value: 'frasco', label: 'Frasco' },
  { value: 'pacote_fracionavel', label: 'Pacote fracionavel' }
]

const EMPTY_FORM: Partial<InventoryItem> = {
  name: '',
  category: 'Medication',
  quantity: 0,
  unit: 'un',
  minStock: 0,
  costPrice: 0,
  salePrice: 0,
  packageQuantity: 1,
  packageUnit: 'un',
  allowsFraction: false,
  batchNumber: '',
  validity: '',
  expiryDate: '',
  supplier: '',
  description: '',
  image: ''
}

export const InventoryList: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'entry' | 'exit' | 'create' | 'edit' | null>(null)
  const [formData, setFormData] = useState<Partial<InventoryItem>>({})
  const [movementAmount, setMovementAmount] = useState('')

  const loadInventory = () => {
    const loaded = [...mockDB.getInventory()]
    setItems(loaded)
    setSelectedItem(currentSelected => {
      if (!loaded.length) return null
      if (!currentSelected) return loaded[0]
      return loaded.find(item => item.id === currentSelected.id) || loaded[0]
    })
  }

  useEffect(() => {
    loadInventory()
  }, [])

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const currentUnitCost = useMemo(() => {
    const costPrice = Number(formData.costPrice) || 0
    const packageQuantity = Number(formData.packageQuantity) || 0
    if (packageQuantity > 0) {
      return Number((costPrice / packageQuantity).toFixed(4))
    }
    return costPrice
  }, [formData.costPrice, formData.packageQuantity])

  const supplierOptions = useMemo(() => {
    const suppliers = items
      .map(item => item.supplier)
      .filter((s): s is string => !!s)
    
    const uniqueSuppliers = Array.from(new Set(suppliers))
    return uniqueSuppliers.map(s => ({ id: s, label: s }))
  }, [items])

  const formatCurrency = (value?: number) => `R$ ${Number(value || 0).toFixed(2)}`

  const handleOpenModal = (type: 'entry' | 'exit' | 'create' | 'edit', item: InventoryItem | null = null) => {
    setModalType(type)
    if (type === 'create') {
      setFormData({ ...EMPTY_FORM })
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
        if (!formData.name || !formData.category || !formData.unit || Number(formData.costPrice) <= 0) {
          alert('Preencha nome, categoria, unidade e valor de compra para cadastrar o item.')
          return
        }

        const createdItem = mockDB.createInventoryItem({
          name: formData.name,
          category: formData.category,
          quantity: Number(formData.quantity) || 0,
          unit: formData.unit,
          minStock: Number(formData.minStock) || 0,
          costPrice: Number(formData.costPrice) || 0,
          salePrice: Number(formData.salePrice) || currentUnitCost,
          packageQuantity: Number(formData.packageQuantity) || Number(formData.quantity) || 1,
          packageUnit: formData.packageUnit || formData.unit,
          allowsFraction: Boolean(formData.allowsFraction),
          batchNumber: formData.batchNumber,
          expiryDate: formData.expiryDate || formData.validity,
          validity: formData.validity || formData.expiryDate,
          description: formData.description,
          image: formData.image,
          supplier: formData.supplier
        })

        loadInventory()
        setSelectedItem(createdItem)
    } else if (modalType === 'edit') {
        if (!formData.id) return

        const updatedItem = mockDB.updateInventoryItem(formData.id, {
          name: formData.name,
          category: formData.category,
          quantity: Number(formData.quantity) || 0,
          unit: formData.unit,
          minStock: Number(formData.minStock) || 0,
          costPrice: Number(formData.costPrice) || 0,
          salePrice: Number(formData.salePrice) || currentUnitCost,
          packageQuantity: Number(formData.packageQuantity) || Number(formData.quantity) || 1,
          packageUnit: formData.packageUnit || formData.unit,
          allowsFraction: Boolean(formData.allowsFraction),
          batchNumber: formData.batchNumber,
          expiryDate: formData.expiryDate || formData.validity,
          validity: formData.validity || formData.expiryDate,
          description: formData.description,
          image: formData.image,
          supplier: formData.supplier
        })

        loadInventory()
        if (updatedItem) setSelectedItem(updatedItem)
    } else if (modalType === 'entry') {
        const amount = Number(movementAmount) || 0
        if (formData.id) {
            mockDB.updateStock(formData.id, amount)
            loadInventory()
        }
    } else if (modalType === 'exit') {
        const amount = Number(movementAmount) || 0
        if (formData.id) {
            mockDB.updateStock(formData.id, -amount)
            loadInventory()
        }
    }
    setIsModalOpen(false)
  }

  const handleQuickEditChange = (field: keyof InventoryItem, value: any) => {
    if (selectedItem) {
        setSelectedItem({ ...selectedItem, [field]: value })
    }
  }

  const handleQuickEditSave = () => {
    if (selectedItem) {
        const updatedItem = mockDB.updateInventoryItem(selectedItem.id, {
          quantity: Number(selectedItem.quantity) || 0,
          minStock: Number(selectedItem.minStock) || 0,
          validity: selectedItem.validity || '',
          expiryDate: selectedItem.expiryDate || selectedItem.validity || '',
          batchNumber: selectedItem.batchNumber || '',
          supplier: selectedItem.supplier || ''
        })
        loadInventory()
        if (updatedItem) setSelectedItem(updatedItem)
    }
  }

  const handleDeleteItem = () => {
    if (!selectedItem) return
    mockDB.deleteInventoryItem(selectedItem.id)
    loadInventory()
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'ok':
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-700">OK</span>
      case 'low':
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">Baixo</span>
      case 'expired':
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Vencendo</span>
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">Unknown</span>
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
                  className="bg-[var(--clinic-button)] hover:bg-[var(--clinic-button)]/90 text-white gap-2"
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
                  className="text-[var(--clinic-button)] border-[var(--clinic-button)] hover:bg-teal-50"
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
                      selectedItem?.id === item.id && "bg-blue-50/50 border-l-4 border-[var(--clinic-button)]"
                    )}
                    onClick={() => setSelectedItem(item)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                            <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" onError={(e) => e.currentTarget.src=''} />
                        ) : (
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                <Package className="h-5 w-5 text-blue-500" />
                            </div>
                        )}
                        <span className="font-medium text-gray-900">{item.name}</span>
                      </div>
                    </td>
                    <td className="p-4">{item.category}</td>
                    <td className="p-4 font-medium text-gray-900">{item.quantity} {item.unit}</td>
                    <td className="p-4">{item.minStock} {item.unit}</td>
                    <td className="p-4">{item.validity || '-'}</td>
                    <td className="p-4">{item.supplier || '-'}</td>
                    <td className="p-4 font-medium text-gray-900">{formatCurrency(item.costPrice)}</td>
                    <td className="p-4 text-center">
                      {getStatusBadge(item.status || 'ok')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Paginação */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-4 text-sm text-gray-500">
            <span>Mostrando {filteredItems.length} itens</span>
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
                {selectedItem.image ? (
                    <img src={selectedItem.image} alt="" className="w-32 h-32 rounded-xl object-cover bg-gray-100 mb-4 shadow-sm" />
                ) : (
                    <div className="w-32 h-32 rounded-xl bg-blue-50 flex items-center justify-center mb-4 shadow-sm">
                        <Package className="h-16 w-16 text-blue-500" />
                    </div>
                )}
                <h3 className="text-lg font-bold text-gray-900">{selectedItem.name}</h3>
                <div className="mt-2">
                  {getStatusBadge(selectedItem.status || 'ok')}
                </div>
              </div>

              <div className="mb-6 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-gray-500">Quantidade total</p>
                  <p className="font-semibold text-gray-900">{selectedItem.quantity} {selectedItem.unit}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-gray-500">Minimo</p>
                  <p className="font-semibold text-gray-900">{selectedItem.minStock} {selectedItem.unit}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-gray-500">Compra do lote</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(selectedItem.costPrice)}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-gray-500">Custo por unidade</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(selectedItem.unitCost)}</p>
                </div>
              </div>

              <div className="mb-6 rounded-lg border p-4 space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Categoria</span>
                  <span className="font-medium text-gray-900">{selectedItem.category}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Lote</span>
                  <span className="font-medium text-gray-900">{selectedItem.batchNumber || '-'}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Validade</span>
                  <span className="font-medium text-gray-900">{selectedItem.validity || selectedItem.expiryDate || '-'}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Fornecedor</span>
                  <span className="font-medium text-gray-900">{selectedItem.supplier || '-'}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Conteudo da embalagem</span>
                  <span className="font-medium text-gray-900">{selectedItem.packageQuantity || 0} {selectedItem.packageUnit || selectedItem.unit}</span>
                </div>
              </div>

              {/* Alerta de Estoque Baixo */}
              {(selectedItem.status === 'low' || selectedItem.quantity <= selectedItem.minStock) && (
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 mb-6">
                  <p className="text-xs text-orange-800 leading-relaxed">
                    <span className="font-bold">Atenção:</span> Estoque abaixo do mínimo ({selectedItem.quantity} &lt; {selectedItem.minStock}). Recomenda-se reposição.
                  </p>
                </div>
              )}

              {/* Quick Edit Form */}
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900 text-sm">Quick Edit</h4>
                
                <div>
                  <Label className="text-xs text-gray-500">Quantidade Atual</Label>
                  <Input 
                    value={selectedItem.quantity} 
                    onChange={(e) => handleQuickEditChange('quantity', Number(e.target.value) || 0)}
                    className="h-8 mt-1" 
                  />
                </div>
                
                <div>
                  <Label className="text-xs text-gray-500">Mínimo</Label>
                  <Input 
                    value={selectedItem.minStock} 
                    onChange={(e) => handleQuickEditChange('minStock', Number(e.target.value) || 0)}
                    className="h-8 mt-1" 
                  />
                </div>

                <div>
                  <Label className="text-xs text-gray-500">Validade</Label>
                  <Input 
                    value={selectedItem.validity || ''} 
                    onChange={(e) => handleQuickEditChange('validity', e.target.value)}
                    className="h-8 mt-1" 
                  />
                </div>

                <div>
                  <Label className="text-xs text-gray-500">Lote</Label>
                  <Input
                    value={selectedItem.batchNumber || ''}
                    onChange={(e) => handleQuickEditChange('batchNumber', e.target.value)}
                    className="h-8 mt-1"
                  />
                </div>

                <Button 
                  onClick={handleQuickEditSave}
                  className="w-full bg-[var(--clinic-button)] hover:bg-[var(--clinic-button)]/90 text-white mt-2"
                >
                  Salvar Alterações
                </Button>
                
                <Button 
                  onClick={() => handleOpenModal('edit')}
                  className="w-full bg-[#0B2C4D] hover:bg-[#0B2C4D]/90 text-white"
                >
                  Editar Detalhes
                </Button>

                <Button
                  variant="outline"
                  onClick={handleDeleteItem}
                  className="w-full text-red-600 hover:text-red-700 border-red-200"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Item
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
                    value={formData.category || 'Medication'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  >
                    {CATEGORY_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Unidade de consumo</Label>
                  <Select
                    value={formData.unit || 'un'}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
                  >
                    {UNIT_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quantidade total</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.001"
                    value={formData.quantity || 0}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estoque Mínimo</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.001"
                    value={formData.minStock || 0}
                    onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) || 0 })}
                  />
                </div>
              </div>

                <div className="space-y-2">
                  <Label>Fornecedor</Label>
                  <Autocomplete
                    options={supplierOptions}
                    onSelect={(item) => setFormData({ ...formData, supplier: item.label })}
                    placeholder="Nome do fornecedor..."
                    value={formData.supplier || ''}
                    onInputChange={(val) => setFormData({ ...formData, supplier: val })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor de compra do lote</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      className="pl-9"
                      value={formData.costPrice || ''}
                      onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                      placeholder="0,00"
                    />
                  </div>
                </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Conteudo da embalagem</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.001"
                    value={formData.packageQuantity || ''}
                    onChange={(e) => setFormData({ ...formData, packageQuantity: Number(e.target.value) || 0 })}
                    placeholder="Ex: 20"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unidade da embalagem</Label>
                  <Select
                    value={formData.packageUnit || formData.unit || 'un'}
                    onChange={(e) => setFormData({ ...formData, packageUnit: e.target.value as any })}
                  >
                    {UNIT_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Lote</Label>
                  <Input
                    value={formData.batchNumber || ''}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Validade</Label>
                  <Input
                    type="date"
                    value={formData.expiryDate || formData.validity || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      expiryDate: e.target.value,
                      validity: e.target.value
                    })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descricao</Label>
                <textarea
                  className="w-full border rounded-md p-3 min-h-[90px] bg-white"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Observacoes do item, apresentacao ou uso"
                />
              </div>

              <div className="rounded-lg bg-teal-50 border border-teal-100 p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-teal-800">Custo unitario automatico</span>
                  <span className="font-bold text-teal-900">{formatCurrency(currentUnitCost)}</span>
                </div>
                <label className="flex items-center gap-2 text-sm text-teal-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.allowsFraction)}
                    onChange={(e) => setFormData({ ...formData, allowsFraction: e.target.checked })}
                  />
                  Permitir consumo fracionado deste item
                </label>
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
                    const item = items.find(i => i.id === e.target.value)
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
                <span className="font-bold text-gray-900">{formData.quantity} {formData.unit}</span>
              </div>
              
              <div className="space-y-2">
                <Label>Quantidade de {modalType === 'entry' ? 'Entrada' : 'Saída'}</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.001"
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
