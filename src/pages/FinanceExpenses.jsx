import React, { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Select } from '../components/ui/Select'
import { Card, CardContent } from '../components/ui/Card'
import {
  Calendar,
  Plus,
  TrendingUp,
  FileText,
  FileSpreadsheet,
  File as FileIcon,
  Trash2,
  TrendingDown
} from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { mockDB } from '../services/mockDatabase'

const FILTERS = ['Hoje', 'Semana', 'Mes', 'Ano', 'Todos']

const parseFlexibleDate = value => {
  if (!value) return new Date('')
  if (value.includes('/')) {
    const [day, month, year] = value.split('/')
    return new Date(Number(year), Number(month) - 1, Number(day))
  }
  if (value.length === 10 && value.includes('-')) {
    const [year, month, day] = value.split('-')
    return new Date(Number(year), Number(month) - 1, Number(day))
  }
  return new Date(value)
}

const inFilter = (dateValue, filter) => {
  if (filter === 'Todos') return true
  const date = parseFlexibleDate(dateValue)
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(todayStart)
  weekStart.setDate(todayStart.getDate() - 6)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const yearStart = new Date(now.getFullYear(), 0, 1)

  if (filter === 'Hoje') return date >= todayStart
  if (filter === 'Semana') return date >= weekStart
  if (filter === 'Mes') return date >= monthStart
  if (filter === 'Ano') return date >= yearStart
  return true
}

const paymentMethodLabel = {
  pix: 'Pix',
  cash: 'Dinheiro',
  debit_card: 'Debito',
  credit_card: 'Credito',
  transfer: 'Transferencia',
  bank_slip: 'Boleto'
}

export default function FinanceExpenses() {
  const [expensesHistory, setExpensesHistory] = useState([])
  const [activeFilter, setActiveFilter] = useState('Mes')
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
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

  useEffect(() => {
    loadExpensesData()
  }, [])

  const handleInputChange = event => {
    const { name, value } = event.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveExpense = () => {
    const amount = Number(formData.value)
    if (!formData.date || !formData.desc || !Number.isFinite(amount) || amount <= 0) {
      alert('Preencha os campos obrigatorios do custo.')
      return
    }

    mockDB.createCashFlowEntry({
      date: formData.date,
      businessDate: formData.date,
      type: 'expense',
      category: formData.category || 'Outros',
      amount,
      description: `${formData.center ? `[${formData.center}] ` : ''}${formData.desc}`,
      paymentMethod: formData.method,
      paymentStatus: 'paid',
      sourceType: 'operational_cost'
    })

    loadExpensesData()
    setFormData({
      date: new Date().toISOString().slice(0, 10),
      category: '',
      center: '',
      desc: '',
      value: '',
      method: 'pix',
    })
    alert('Custo registrado com sucesso.')
  }

  const filteredHistory = useMemo(() => {
    return expensesHistory.filter(item => inFilter(item.date, activeFilter))
  }, [activeFilter, expensesHistory])

  const summary = useMemo(() => {
    const total = filteredHistory.reduce((sum, item) => sum + item.amount, 0)
    const categories = filteredHistory.reduce((acc, item) => {
      const key = item.category || 'Sem categoria'
      acc[key] = (acc[key] || 0) + item.amount
      return acc
    }, {})

    return {
      total,
      average: filteredHistory.length ? total / filteredHistory.length : 0,
      categories: Object.entries(categories)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6)
    }
  }, [filteredHistory])

  const handleExport = async type => {
    const rows = [
      ['Data', 'Categoria', 'Descricao', 'Valor', 'Forma'],
      ...filteredHistory.map(item => [
        item.date,
        item.category,
        item.description,
        item.amount,
        paymentMethodLabel[item.paymentMethod] || item.paymentMethod || '-'
      ])
    ]

    try {
      if (type === 'csv' || type === 'excel') {
        const csvContent = `data:text/csv;charset=utf-8,${rows.map(row => row.join(',')).join('\n')}`
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement('a')
        link.setAttribute('href', encodedUri)
        link.setAttribute('download', `relatorio_custos.${type === 'excel' ? 'xls' : 'csv'}`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        const { default: jsPDF } = await import('jspdf')
        const doc = new jsPDF()
        doc.setFontSize(16)
        doc.text('Relatorio de Custos', 14, 20)
        doc.setFontSize(10)
        doc.text(`Filtro: ${activeFilter}`, 14, 28)
        doc.text(`Total: ${formatCurrency(summary.total)}`, 14, 34)
        let y = 46
        filteredHistory.forEach(item => {
          if (y > 280) {
            doc.addPage()
            y = 20
          }
          doc.text(`${formatDate(parseFlexibleDate(item.date))} - ${item.category} - ${formatCurrency(item.amount)}`, 14, y)
          y += 8
        })
        doc.save('relatorio_custos.pdf')
      }
    } catch (error) {
      console.error('Erro ao exportar custos', error)
      alert('Nao foi possivel exportar o relatorio.')
    }
  }

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Novo custo operacional</h2>
                    <p className="text-sm text-gray-500">Registre contas como luz, agua, aluguel, impostos, folha, compras de insumos e manutencao.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Data</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input name="date" type="date" className="pl-10" value={formData.date} onChange={handleInputChange} />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Categoria</Label>
                      <Select name="category" value={formData.category} onChange={handleInputChange}>
                        <option value="">Selecione uma categoria</option>
                        <option value="Luz">Luz</option>
                        <option value="Agua">Agua</option>
                        <option value="Aluguel">Aluguel</option>
                        <option value="Impostos">Impostos</option>
                        <option value="Folha de pagamento">Folha de pagamento</option>
                        <option value="Insumos">Insumos</option>
                        <option value="Manutencao">Manutencao</option>
                        <option value="Outros">Outros</option>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Centro de custo</Label>
                      <Select name="center" value={formData.center} onChange={handleInputChange}>
                        <option value="">Selecione um centro</option>
                        <option value="Clinica">Clinica</option>
                        <option value="Administrativo">Administrativo</option>
                        <option value="Vendas">Vendas</option>
                        <option value="Laboratorio">Laboratorio</option>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Descricao</Label>
                    <Input name="desc" value={formData.desc} onChange={handleInputChange} placeholder="Breve descricao do custo" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Valor</Label>
                      <Input name="value" type="number" min={0} step="0.01" value={formData.value} onChange={handleInputChange} placeholder="0.00" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Forma de pagamento</Label>
                      <Select name="method" value={formData.method} onChange={handleInputChange}>
                        <option value="pix">Pix</option>
                        <option value="cash">Dinheiro</option>
                        <option value="credit_card">Cartao credito</option>
                        <option value="debit_card">Cartao debito</option>
                        <option value="bank_slip">Boleto</option>
                        <option value="transfer">Transferencia</option>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={handleSaveExpense} className="w-full bg-[var(--clinic-button)] hover:bg-[var(--clinic-button)]/90 text-white font-bold h-12 mt-2">
                    <Plus className="mr-2 h-5 w-5" /> Salvar custo
                  </Button>
                </div>

                <div className="w-full lg:w-72 bg-[#0B2C4D] rounded-xl p-5 text-white flex flex-col justify-between flex-shrink-0">
                  <div>
                    <h3 className="text-sm font-medium text-blue-200 mb-1">Resumo do filtro atual</h3>
                    <p className="text-3xl font-bold">{formatCurrency(summary.total)}</p>
                    <p className="text-sm text-blue-200 mt-2">Custo medio: {formatCurrency(summary.average)}</p>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-semibold">Custos por categoria</p>
                      <TrendingUp className="h-4 w-4 text-[var(--clinic-button)]" />
                    </div>

                    <div className="space-y-3">
                      {summary.categories.map(item => (
                        <div key={item.name}>
                          <div className="flex items-center justify-between text-xs text-blue-100 mb-1">
                            <span>{item.name}</span>
                            <span>{formatCurrency(item.value)}</span>
                          </div>
                          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full bg-red-300"
                              style={{ width: `${summary.total ? (item.value / summary.total) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      ))}
                      {summary.categories.length === 0 && (
                        <p className="text-xs text-blue-200">Nenhum custo registrado neste filtro.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <h3 className="text-lg font-bold text-gray-900">Historico de custos operacionais</h3>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  {FILTERS.map(filter => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={cn(
                        'px-3 py-1 text-xs font-medium rounded-md transition-all',
                        activeFilter === filter ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
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
                      <th className="pb-3">Descricao</th>
                      <th className="pb-3">Valor</th>
                      <th className="pb-3">Forma</th>
                      <th className="pb-3 text-center">Acao</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredHistory.map(item => (
                      <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 pl-2 text-gray-500 font-medium">{formatDate(parseFlexibleDate(item.date))}</td>
                        <td className="py-4 text-gray-900">{item.category}</td>
                        <td className="py-4 text-gray-500">{item.description}</td>
                        <td className="py-4 text-red-600 font-bold">{formatCurrency(item.amount)}</td>
                        <td className="py-4 text-gray-500">{paymentMethodLabel[item.paymentMethod] || item.paymentMethod || '-'}</td>
                        <td className="py-4 text-center">
                          <button
                            onClick={() => {
                              if (window.confirm('Excluir este custo?')) {
                                mockDB.deleteCashFlowEntry(item.id)
                                loadExpensesData()
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
                        <td colSpan={6} className="py-8 text-center text-gray-400">
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

        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-[#0B2C4D] rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Leitura rapida</h3>
              <TrendingDown className="h-5 w-5 text-red-300" />
            </div>
            <div className="space-y-3">
              {summary.categories.slice(0, 4).map(item => (
                <div key={item.name} className="bg-white/10 p-3 rounded-lg text-sm">
                  <div className="flex items-center justify-between">
                    <span>{item.name}</span>
                    <span className="font-bold">{formatCurrency(item.value)}</span>
                  </div>
                </div>
              ))}
              {summary.categories.length === 0 && (
                <div className="bg-white/10 p-3 rounded-lg text-sm text-blue-100">
                  Nenhum custo encontrado no filtro atual.
                </div>
              )}
            </div>
          </div>

          <div className="bg-[var(--clinic-button)] rounded-xl p-6 text-white">
            <h3 className="font-bold text-lg mb-4">Exportar</h3>
            <div className="flex gap-4">
              <button onClick={() => handleExport('csv')} className="flex-1 bg-white/20 hover:bg-white/30 transition-colors rounded-lg p-3 flex flex-col items-center gap-2 border border-white/30">
                <FileText className="h-6 w-6" />
                <span className="text-xs font-bold">CSV</span>
              </button>
              <button onClick={() => handleExport('pdf')} className="flex-1 bg-white/20 hover:bg-white/30 transition-colors rounded-lg p-3 flex flex-col items-center gap-2 border border-white/30">
                <FileIcon className="h-6 w-6" />
                <span className="text-xs font-bold">PDF</span>
              </button>
              <button onClick={() => handleExport('excel')} className="flex-1 bg-white/20 hover:bg-white/30 transition-colors rounded-lg p-3 flex flex-col items-center gap-2 border border-white/30">
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
