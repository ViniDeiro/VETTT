import React, { useState } from 'react'
import Layout from '../components/Layout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Select } from '../components/ui/Select'
import { Card, CardContent } from '../components/ui/Card'
import {
  Calendar,
  Plus,
  Paperclip,
  TrendingUp,
  FileText,
  File spreadshet,
  File as FileIcon,
  MoreHorizontal,
  Bell,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockDB } from '../services/mockDatabase'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function FinanceExpenses() {
  const [expensesHistory, setExpensesHistory] = useState([])
  const [activeFilter, setActiveFilter] = useState('Mês')
  const [formData, setFormData] = useState({
    date: new Date().toLocaleDateString(mockDB.getSettings().regional.language || 'pt-BR'),
    category: '',
    center: '',
    desc: '',
    value: '',
    method: 'pix',
  })

  const loadExpensesData = () => {
    const flows = mockDB.getCashFlow()
      .filter(entry => entry.type === 'expense')
      .sort((a, b) => parseFlexibleDate(b.date).getTime() - parseFlexibleDate(a.date).getTime())
    
    setExpensesHistory(flows)
  }

  useState(() => {
    loadExpensesData()
  })

  const parseFlexibleDate = (value) => {
    if (!value) return new Date('')
    if (value.includes('/')) {
      const [day, month, year] = value.split('/')
      return new Date(Number(year), Number(month) - 1, Number(day))
    }
    return new Date(value)
  }

  const extractCurrencyValue = (value) => {
    const normalized = value.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '')
    return Number(normalized || 0)
  }

  const handleDateChange = (e) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 2) value = `${value.slice(0, 2)}/${value.slice(2)}`
    if (value.length > 5) value = `${value.slice(0, 5)}/${value.slice(5, 9)}`
    setFormData(prev => ({ ...prev, date: value }))
  }

  const handleValueChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '')
    const formatted = formatCurrency(Number(digits || 0) / 100)
    setFormData(prev => ({ ...prev, value: formatted }))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveExpense = () => {
    const amount = extractCurrencyValue(formData.value)
    if (!formData.date || !formData.desc || amount <= 0) {
      alert('Preencha os campos obrigatórios do custo.')
      return
    }

    mockDB.createCashFlowEntry({
      date: formData.date,
      type: 'expense',
      category: formData.category || 'Outros',
      amount,
      description: `${formData.center ? `[${formData.center}] ` : ''}${formData.desc}`,
      paymentMethod: formData.method,
      paymentStatus: 'paid'
    })

    loadExpensesData()
    setFormData({
      date: new Date().toLocaleDateString('pt-BR'),
      category: '',
      center: '',
      desc: '',
      value: '',
      method: 'pix',
    })
    alert('Custo registrado com sucesso.')
  }

  const handleDeleteExpense = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este custo?')) {
      // Since it's a mockDB.cashFlow array, we need a delete method there or direct access
      // For now, let's assume mockDB has a way to delete from cashflow or we filter it out 
      // Actually, looking at mockDatabase.ts, there is no deleteCashFlowEntry. 
      // I should add it or just perform it manually if I had access.
      // Let's implement it in mockDatabase.ts first.
    }
  }

  const getFilteredData = () => {
    if (activeFilter === 'Todos' || activeFilter === 'Por categoria') return expensesHistory

    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - 6)

    return expensesHistory.filter(item => {
      const itemDate = parseFlexibleDate(item.date)
      if (activeFilter === 'Hoje') return formatDate(itemDate) === formatDate(now)
      if (activeFilter === 'Semana') return itemDate >= weekStart && itemDate <= now
      if (activeFilter === 'Mês') {
        return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear()
      }
      return true
    })
  }

  const filteredHistory = getFilteredData()

  const currentMonthSummary = React.useMemo(() => {
    const now = new Date()
    const monthEntries = expensesHistory.filter(item => {
      const itemDate = parseFlexibleDate(item.date)
      return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear()
    })

    const total = monthEntries.reduce((sum, item) => sum + item.amount, 0)
    const categories = monthEntries.reduce((acc, item) => {
      const key = item.category || 'Sem categoria'
      acc[key] = (acc[key] || 0) + item.amount
      return acc
    }, {})

    return {
      total,
      categories: Object.entries(categories)
        .map(([name, value]) => ({ name, value }))
        .sort((a,b) => b.value - a.value)
    }
  }, [expensesHistory])

  const paymentMethodLabel = {
    pix: 'Pix',
    cash: 'Dinheiro',
    debit_card: 'Débito',
    credit_card: 'Crédito',
    transfer: 'Transferência',
    boleto: 'Boleto'
  }

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          
          {/* Header Section (Novo Custo Form) */}
          <Card className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Form */}
                <div className="flex-1 space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Novo Custo</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Data</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input 
                          placeholder="DD/MM/AAAA" 
                          className="pl-10" 
                          value={formData.date}
                          onChange={handleDateChange}
                          maxLength={10}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Categoria</Label>
                      <Select name="category" value={formData.category} onChange={handleInputChange}>
                        <option value="">Selecione uma categoria</option>
                        <option value="Insumos">Insumos</option>
                        <option value="Manutenção">Manutenção</option>
                        <option value="Salários">Salários</option>
                        <option value="Equipamentos">Equipamentos</option>
                        <option value="Serviços">Serviços</option>
                        <option value="Outros">Outros</option>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Centro de custo</Label>
                      <Select name="center" value={formData.center} onChange={handleInputChange}>
                        <option value="">Selecione um centro</option>
                        <option value="Clínica">Clínica</option>
                        <option value="Administrativo">Administrativo</option>
                        <option value="Vendas">Vendas</option>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Descrição</Label>
                    <Input 
                      name="desc" 
                      value={formData.desc} 
                      onChange={handleInputChange} 
                      placeholder="Breve descrição do custo" 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Valor</Label>
                      <Input 
                        value={formData.value} 
                        onChange={handleValueChange} 
                        placeholder="R$ 0,00" 
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Forma de pagamento</Label>
                      <Select name="method" value={formData.method} onChange={handleInputChange}>
                        <option value="pix">PIX</option>
                        <option value="cash">Dinheiro</option>
                        <option value="credit_card">Cartão Crédito</option>
                        <option value="debit_card">Cartão Débito</option>
                        <option value="boleto">Boleto</option>
                        <option value="transfer">Transferência</option>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Anexo</Label>
                      <Button variant="outline" className="w-full justify-start text-gray-500 font-normal border-dashed">
                        <Paperclip className="mr-2 h-4 w-4" />
                        Adicionar arquivo...
                      </Button>
                    </div>
                  </div>

                  <Button 
                    onClick={handleSaveExpense}
                    className="w-full bg-[var(--clinic-button)] hover:bg-[var(--clinic-button)]/90 text-white font-bold h-12 mt-2"
                  >
                    <Plus className="mr-2 h-5 w-5" /> Salvar custo
                  </Button>
                </div>

                {/* Mini Dashboard inside Card */}
                <div className="w-full lg:w-72 bg-[#0B2C4D] rounded-xl p-5 text-white flex flex-col justify-between flex-shrink-0">
                  <div>
                    <h3 className="text-sm font-medium text-blue-200 mb-1">Resumo de Custos - Junho 2024</h3>
                    <p className="text-3xl font-bold">R$ 12.450,00</p>
                  </div>
                  
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-semibold">Custos por categoria</p>
                      <TrendingUp className="h-4 w-4 text-[var(--clinic-button)]" />
                    </div>
                    
                    <div className="flex items-end justify-between h-32 gap-2">
                      {/* Bar Chart Simulation */}
                      {currentMonthSummary.categories.slice(0, 4).map((cat, idx) => (
                        <div key={cat.name} className="flex flex-col items-center gap-1 w-1/4">
                          <span className="text-[10px] text-blue-200 font-bold">{formatCurrency(cat.value)}</span>
                          <div 
                            className="w-full bg-[var(--clinic-button)] rounded-t-sm" 
                            style={{ 
                              height: `${currentMonthSummary.total > 0 ? (cat.value / currentMonthSummary.total) * 100 : 0}%`,
                              opacity: 1 - (idx * 0.2)
                            }}
                          ></div>
                          <span className="text-[10px] text-blue-300 truncate w-full text-center">{cat.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* History Table */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <h3 className="text-lg font-bold text-gray-900">Histórico de Custos Recentes</h3>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  {['Hoje', 'Semana', 'Mês', 'Todos'].map((filter) => (
                    <button 
                      key={filter} 
                      onClick={() => setActiveFilter(filter)}
                      className={cn(
                        "px-3 py-1 text-xs font-medium rounded-md transition-all",
                        activeFilter === filter ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                      )}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs text-gray-500 font-semibold border-b border-gray-100">
                      <th className="pb-3 pl-2">Data</th>
                      <th className="pb-3">Categoria</th>
                      <th className="pb-3">Descrição</th>
                      <th className="pb-3">Valor</th>
                      <th className="pb-3">Forma</th>
                      <th className="pb-3 text-center">Status</th>
                      <th className="pb-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredHistory.map((item) => (
                      <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 pl-2 text-gray-500 font-medium">{formatDate(parseFlexibleDate(item.date))}</td>
                        <td className="py-4 text-gray-900">{item.category}</td>
                        <td className="py-4 text-gray-500">{item.description}</td>
                        <td className="py-4 text-gray-900 font-bold">{formatCurrency(item.amount)}</td>
                        <td className="py-4 text-gray-500">{paymentMethodLabel[item.paymentMethod] || item.paymentMethod || '-'}</td>
                        <td className="py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-700`}>
                            Pago
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <button 
                            onClick={() => {
                              if(window.confirm('Excluir este custo?')) {
                                mockDB.deleteCashFlowEntry(item.id);
                                loadExpensesData();
                              }
                            }}
                            className="text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredHistory.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-400">
                          Nenhum custo encontrado para este filtro.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar (Alerts & Export) */}
        <div className="w-full lg:w-80 space-y-6">
          {/* Alerts */}
          <div className="bg-[#0B2C4D] rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Alertas</h3>
              <Bell className="h-5 w-5 text-[var(--clinic-button)]" />
            </div>
            <div className="space-y-3">
              <div className="bg-white text-[#0B2C4D] p-3 rounded-lg text-sm font-medium border-l-4 border-red-500 shadow-sm">
                <p className="font-bold mb-1">Alerta de Custo Alto</p>
                <p className="text-xs opacity-90">R$ 3.500,00 para Equipamento em 12/06</p>
              </div>
              <div className="bg-white text-[#0B2C4D] p-3 rounded-lg text-sm font-medium border-l-4 border-yellow-500 shadow-sm">
                <p className="font-bold mb-1">Alerta de Recorrência</p>
                <p className="text-xs opacity-90">Pagamento de Aluguel pendente</p>
              </div>
            </div>
          </div>

          {/* Export */}
          <div className="bg-[var(--clinic-button)] rounded-xl p-6 text-white">
            <h3 className="font-bold text-lg mb-4">Exportar</h3>
            <div className="flex gap-4">
               <button 
                onClick={() => handleExport('csv')}
                className="flex-1 bg-white/20 hover:bg-white/30 transition-colors rounded-lg p-3 flex flex-col items-center gap-2 border border-white/30"
               >
                 <FileText className="h-6 w-6" />
                 <span className="text-xs font-bold">CSV</span>
               </button>
               <button 
                onClick={() => handleExport('pdf')}
                className="flex-1 bg-white/20 hover:bg-white/30 transition-colors rounded-lg p-3 flex flex-col items-center gap-2 border border-white/30"
               >
                 <FileIcon className="h-6 w-6" />
                 <span className="text-xs font-bold">PDF</span>
               </button>
               <button 
                onClick={() => handleExport('excel')}
                className="flex-1 bg-white/20 hover:bg-white/30 transition-colors rounded-lg p-3 flex flex-col items-center gap-2 border border-white/30"
               >
                 <FileSpreadsheet className="h-6 w-6" />
                 <span className="text-xs font-bold">Excel</span>
               </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
