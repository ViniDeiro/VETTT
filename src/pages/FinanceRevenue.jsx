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
  Wallet,
  ArrowDownCircle,
} from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { mockDB } from '../services/mockDatabase'

const FILTERS = ['Hoje', 'Semana', 'Mes', 'Ano', 'Todos']

const parseFlexibleDate = (value) => {
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

const paymentMethodLabel = {
  cash: 'Dinheiro',
  pix: 'Pix',
  debit_card: 'Cartao de debito',
  credit_card: 'Cartao de credito',
  transfer: 'Transferencia',
  bank_slip: 'Boleto',
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

export default function FinanceRevenue() {
  const [revenueHistory, setRevenueHistory] = useState([])
  const [activeFilter, setActiveFilter] = useState('Mes')
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    category: '',
    center: '',
    desc: '',
    value: '',
    method: 'pix',
    entryType: 'income',
  })

  const loadRevenueData = () => {
    const flows = mockDB
      .getCashFlow()
      .filter(entry => entry.type === 'income')
      .sort((a, b) => parseFlexibleDate(b.date).getTime() - parseFlexibleDate(a.date).getTime())

    setRevenueHistory(flows)
  }

  useEffect(() => {
    loadRevenueData()
  }, [])

  const handleInputChange = event => {
    const { name, value } = event.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveRevenue = () => {
    const amount = Number(formData.value)

    if (!formData.date || !formData.desc || !Number.isFinite(amount) || amount <= 0) {
      alert('Preencha os campos obrigatorios da receita.')
      return
    }

    const normalizedAmount = formData.entryType === 'reversal' ? -amount : amount
    mockDB.createCashFlowEntry({
      date: formData.date,
      businessDate: formData.date,
      type: 'income',
      category: formData.category || 'Receita avulsa',
      amount: normalizedAmount,
      grossAmount: normalizedAmount,
      totalCost: 0,
      grossProfit: normalizedAmount,
      marginPercent: 100,
      paymentStatus: 'paid',
      paymentMethod: formData.method,
      description: `${formData.center ? `[${formData.center}] ` : ''}${formData.desc}`,
      sourceType: formData.entryType === 'reversal' ? 'revenue_adjustment' : 'manual_revenue',
    })

    loadRevenueData()
    setFormData({
      date: new Date().toISOString().slice(0, 10),
      category: '',
      center: '',
      desc: '',
      value: '',
      method: 'pix',
      entryType: 'income',
    })

    alert(formData.entryType === 'reversal' ? 'Baixa registrada com sucesso.' : 'Receita registrada com sucesso.')
  }

  const filteredHistory = useMemo(() => {
    return revenueHistory.filter(item => inFilter(item.date, activeFilter))
  }, [activeFilter, revenueHistory])

  const summary = useMemo(() => {
    const total = filteredHistory.reduce((sum, item) => sum + item.amount, 0)
    const manualCount = filteredHistory.filter(item => !item.attendanceId).length
    const automaticCount = filteredHistory.filter(item => item.attendanceId).length
    const byMethod = filteredHistory.reduce((acc, item) => {
      const key = item.paymentMethod || 'cash'
      acc[key] = (acc[key] || 0) + item.amount
      return acc
    }, {})
    const categories = filteredHistory.reduce((acc, item) => {
      const key = item.category || 'Sem categoria'
      acc[key] = (acc[key] || 0) + item.amount
      return acc
    }, {})

    return {
      total,
      manualCount,
      automaticCount,
      methods: Object.entries(byMethod).map(([name, value]) => ({ name, value })),
      categories: Object.entries(categories)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
        .slice(0, 5),
    }
  }, [filteredHistory])

  const handleExport = async type => {
    const rows = [
      ['Data', 'Categoria', 'Descricao', 'Valor', 'Origem', 'Forma'],
      ...filteredHistory.map(item => [
        item.date,
        item.category,
        item.description,
        item.amount,
        item.attendanceId ? 'Atendimento' : 'Manual',
        paymentMethodLabel[item.paymentMethod] || item.paymentMethod || '-',
      ]),
    ]

    try {
      if (type === 'csv' || type === 'excel') {
        const csvContent = `data:text/csv;charset=utf-8,${rows.map(row => row.join(',')).join('\n')}`
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement('a')
        link.setAttribute('href', encodedUri)
        link.setAttribute('download', `relatorio_receitas.${type === 'excel' ? 'xls' : 'csv'}`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        const { default: jsPDF } = await import('jspdf')
        const doc = new jsPDF()
        doc.setFontSize(16)
        doc.text('Relatorio de Receitas', 14, 20)
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
        doc.save('relatorio_receitas.pdf')
      }
    } catch (error) {
      console.error('Erro ao exportar receitas', error)
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
                    <h2 className="text-xl font-bold text-gray-900">Entrada ou baixa de receita</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Registre entradas manuais e baixas/estornos que nao vieram automaticamente do atendimento.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Data</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input name="date" type="date" value={formData.date} onChange={handleInputChange} className="pl-10" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Movimento</Label>
                      <Select name="entryType" value={formData.entryType} onChange={handleInputChange}>
                        <option value="income">Entrada</option>
                        <option value="reversal">Baixa / Estorno</option>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Forma de recebimento</Label>
                      <Select name="method" value={formData.method} onChange={handleInputChange}>
                        <option value="pix">Pix</option>
                        <option value="cash">Dinheiro</option>
                        <option value="debit_card">Cartao debito</option>
                        <option value="credit_card">Cartao credito</option>
                        <option value="transfer">Transferencia</option>
                        <option value="bank_slip">Boleto</option>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Categoria</Label>
                      <Select name="category" value={formData.category} onChange={handleInputChange}>
                        <option value="">Selecione uma categoria</option>
                        <option value="Consultas">Consultas</option>
                        <option value="Procedimentos">Procedimentos</option>
                        <option value="Exames">Exames</option>
                        <option value="Vendas">Vendas</option>
                        <option value="Outros">Outros</option>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Centro de receita</Label>
                      <Select name="center" value={formData.center} onChange={handleInputChange}>
                        <option value="">Selecione um centro</option>
                        <option value="Clinica">Clinica</option>
                        <option value="Internacao">Internacao</option>
                        <option value="Pet Shop">Pet Shop</option>
                        <option value="Laboratorio">Laboratorio</option>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Descricao</Label>
                    <Input name="desc" value={formData.desc} onChange={handleInputChange} placeholder="Descreva a movimentacao" />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Valor</Label>
                    <Input name="value" type="number" min={0} step="0.01" value={formData.value} onChange={handleInputChange} placeholder="0.00" />
                  </div>

                  <Button onClick={handleSaveRevenue} className="w-full bg-[var(--clinic-button)] hover:bg-[var(--clinic-button)]/90 text-white font-bold h-12 mt-2">
                    {formData.entryType === 'reversal' ? <ArrowDownCircle className="mr-2 h-5 w-5" /> : <Plus className="mr-2 h-5 w-5" />}
                    {formData.entryType === 'reversal' ? 'Registrar baixa' : 'Salvar receita'}
                  </Button>
                </div>

                <div className="w-full lg:w-80 bg-[#0B2C4D] rounded-xl p-5 text-white flex flex-col gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-blue-200 mb-1">Resumo do filtro atual</h3>
                    <p className="text-3xl font-bold">{formatCurrency(summary.total)}</p>
                  </div>

                  <div className="rounded-xl bg-white/10 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold">Top categorias</p>
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
                              className="h-full bg-[var(--clinic-button)]"
                              style={{ width: `${summary.total ? Math.min(100, (Math.abs(item.value) / Math.abs(summary.total || 1)) * 100) : 0}%` }}
                            />
                          </div>
                        </div>
                      ))}
                      {summary.categories.length === 0 && (
                        <p className="text-xs text-blue-200">Nenhuma movimentacao registrada neste filtro.</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl bg-white/10 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                      <Wallet className="h-4 w-4 text-[var(--clinic-button)]" />
                      Automatico x manual
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-blue-200">Automatico</p>
                        <p className="font-bold">{summary.automaticCount}</p>
                      </div>
                      <div>
                        <p className="text-blue-200">Manual</p>
                        <p className="font-bold">{summary.manualCount}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Historico de Receitas</h3>
                  <p className="text-sm text-gray-500">Visualize receita diaria, semanal, mensal, anual ou geral.</p>
                </div>
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
                      <th className="pb-3">Origem</th>
                      <th className="pb-3">Forma</th>
                      <th className="pb-3">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredHistory.map(item => (
                      <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 pl-2 text-gray-500 font-medium">{formatDate(parseFlexibleDate(item.date))}</td>
                        <td className="py-4 text-gray-900">{item.category}</td>
                        <td className="py-4 text-gray-500">{item.description}</td>
                        <td className="py-4 text-gray-500">{item.attendanceId ? 'Atendimento' : 'Manual'}</td>
                        <td className="py-4 text-gray-500">{paymentMethodLabel[item.paymentMethod] || item.paymentMethod || '-'}</td>
                        <td className={cn('py-4 font-bold', item.amount < 0 ? 'text-red-600' : 'text-emerald-600')}>
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                    {filteredHistory.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-400">
                          Nenhuma receita encontrada para este filtro.
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
              <h3 className="font-bold text-lg">Formas de recebimento</h3>
              <Wallet className="h-5 w-5 text-[var(--clinic-button)]" />
            </div>
            <div className="space-y-3">
              {summary.methods.map(item => (
                <div key={item.name} className="bg-white/10 p-3 rounded-lg text-sm">
                  <div className="flex items-center justify-between">
                    <span>{paymentMethodLabel[item.name] || item.name}</span>
                    <span className="font-bold">{formatCurrency(item.value)}</span>
                  </div>
                </div>
              ))}
              {summary.methods.length === 0 && (
                <div className="bg-white/10 p-3 rounded-lg text-sm text-blue-100">
                  Nenhum recebimento encontrado para o filtro atual.
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
