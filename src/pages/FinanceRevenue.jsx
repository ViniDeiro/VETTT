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
  Bell,
  Wallet,
} from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { mockDB } from '../services/mockDatabase'

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

const paymentMethodLabel = {
  cash: 'Dinheiro',
  pix: 'Pix',
  debit_card: 'Cartao de Debito',
  credit_card: 'Cartao de Credito',
  transfer: 'Transferencia',
  boleto: 'Boleto',
}

export default function FinanceRevenue() {
  const [revenueHistory, setRevenueHistory] = useState([])
  const [receivables, setReceivables] = useState([])
  const [activeFilter, setActiveFilter] = useState('Mês')
  const [formData, setFormData] = useState({
    date: new Date().toLocaleDateString('pt-BR'),
    category: '',
    center: '',
    desc: '',
    value: '',
    method: 'pix',
  })

  const loadRevenueData = () => {
    const flows = mockDB
      .getCashFlow()
      .filter((entry) => entry.type === 'income')
      .sort((a, b) => parseFlexibleDate(b.date).getTime() - parseFlexibleDate(a.date).getTime())

    setRevenueHistory(flows)
    setReceivables(mockDB.getReceivables())
  }

  useEffect(() => {
    loadRevenueData()
  }, [])

  const handleDateChange = (event) => {
    let value = event.target.value.replace(/\D/g, '')
    if (value.length > 2) value = `${value.slice(0, 2)}/${value.slice(2)}`
    if (value.length > 5) value = `${value.slice(0, 5)}/${value.slice(5, 9)}`
    setFormData((prev) => ({ ...prev, date: value }))
  }

  const handleValueChange = (event) => {
    const digits = event.target.value.replace(/\D/g, '')
    const formatted = (Number(digits || 0) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
    setFormData((prev) => ({ ...prev, value: formatted }))
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveRevenue = () => {
    const amount = extractCurrencyValue(formData.value)

    if (!formData.date || !formData.desc || amount <= 0) {
      alert('Preencha os campos obrigatorios da receita.')
      return
    }

    mockDB.createCashFlowEntry({
      date: formData.date,
      type: 'income',
      category: formData.category || 'Receita avulsa',
      amount,
      grossAmount: amount,
      totalCost: 0,
      grossProfit: amount,
      marginPercent: 100,
      paymentStatus: 'paid',
      description: `${formData.center ? `[${formData.center}] ` : ''}${formData.desc} (${paymentMethodLabel[formData.method] || formData.method})`,
    })

    loadRevenueData()
    setFormData({
      date: new Date().toLocaleDateString('pt-BR'),
      category: '',
      center: '',
      desc: '',
      value: '',
      method: 'pix',
    })

    alert('Receita registrada com sucesso.')
  }

  const getFilteredData = () => {
    if (activeFilter === 'Todos') return revenueHistory

    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - 6)

    return revenueHistory.filter((item) => {
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

  const currentMonthSummary = useMemo(() => {
    const now = new Date()
    const monthEntries = revenueHistory.filter((item) => {
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
        .sort((a, b) => b.value - a.value)
        .slice(0, 4),
    }
  }, [revenueHistory])

  const alerts = useMemo(() => {
    return receivables
      .filter((item) => item.status !== 'paid')
      .sort((a, b) => parseFlexibleDate(a.dueDate).getTime() - parseFlexibleDate(b.dueDate).getTime())
      .slice(0, 3)
  }, [receivables])

  const handleExport = async (type) => {
    const rows = [
      ['Data', 'Categoria', 'Descricao', 'Valor', 'Origem', 'Status'],
      ...filteredHistory.map((item) => [
        item.date,
        item.category,
        item.description,
        formatCurrency(item.amount),
        item.attendanceId ? 'Atendimento' : 'Manual',
        item.paymentStatus === 'paid' ? 'Recebido' : 'Pendente',
      ]),
    ]

    try {
      if (type === 'csv' || type === 'excel') {
        const csvContent = `data:text/csv;charset=utf-8,${rows.map((row) => row.join(',')).join('\n')}`
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement('a')
        link.setAttribute('href', encodedUri)
        link.setAttribute('download', `relatorio_receitas.${type === 'excel' ? 'xls' : 'csv'}`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else if (type === 'pdf') {
        const { default: jsPDF } = await import('jspdf')
        const doc = new jsPDF()
        doc.setFillColor(11, 44, 77)
        doc.rect(0, 0, 210, 20, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(16)
        doc.text('Relatorio de Receitas', 10, 13)
        doc.setFontSize(10)
        doc.text(`Filtro: ${activeFilter}`, 150, 13)

        let y = 30
        doc.setTextColor(0, 0, 0)
        filteredHistory.forEach((item) => {
          if (y > 280) {
            doc.addPage()
            y = 20
          }
          doc.text(
            `${item.date} - ${item.category} - ${formatCurrency(item.amount)} - ${item.attendanceId ? 'Atendimento' : 'Manual'}`,
            10,
            y
          )
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
                    <h2 className="text-xl font-bold text-gray-900">Nova Receita Avulsa</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Use esta tela apenas para entradas que nao vieram automaticamente do atendimento.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Data</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          value={formData.date}
                          onChange={handleDateChange}
                          maxLength={10}
                          placeholder="DD/MM/AAAA"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Categoria</Label>
                      <Select name="category" value={formData.category} onChange={handleInputChange}>
                        <option value="">Selecione uma categoria</option>
                        <option value="Consultas">Consultas</option>
                        <option value="Vacinas">Vacinas</option>
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
                    <Input
                      name="desc"
                      value={formData.desc}
                      onChange={handleInputChange}
                      placeholder="Descreva a receita avulsa"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Valor</Label>
                      <Input value={formData.value} onChange={handleValueChange} placeholder="R$ 0,00" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Forma de recebimento</Label>
                      <Select name="method" value={formData.method} onChange={handleInputChange}>
                        <option value="pix">Pix</option>
                        <option value="cash">Dinheiro</option>
                        <option value="debit_card">Cartao Debito</option>
                        <option value="credit_card">Cartao Credito</option>
                        <option value="transfer">Transferencia</option>
                        <option value="boleto">Boleto</option>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={handleSaveRevenue}
                    className="w-full bg-[#00BFA5] hover:bg-[#00BFA5]/90 text-white font-bold h-12 mt-2"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Salvar receita
                  </Button>
                </div>

                <div className="w-full lg:w-80 bg-[#0B2C4D] rounded-xl p-5 text-white flex flex-col gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-blue-200 mb-1">Resumo de Receitas do Mes</h3>
                    <p className="text-3xl font-bold">{formatCurrency(currentMonthSummary.total)}</p>
                  </div>

                  <div className="rounded-xl bg-white/10 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold">Top categorias</p>
                      <TrendingUp className="h-4 w-4 text-[#00BFA5]" />
                    </div>
                    <div className="space-y-3">
                      {currentMonthSummary.categories.map((item) => (
                        <div key={item.name}>
                          <div className="flex items-center justify-between text-xs text-blue-100 mb-1">
                            <span>{item.name}</span>
                            <span>{formatCurrency(item.value)}</span>
                          </div>
                          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full bg-[#00BFA5]"
                              style={{
                                width: `${currentMonthSummary.total ? (item.value / currentMonthSummary.total) * 100 : 0}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                      {currentMonthSummary.categories.length === 0 && (
                        <p className="text-xs text-blue-200">Nenhuma entrada registrada neste mes.</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl bg-white/10 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                      <Wallet className="h-4 w-4 text-[#00BFA5]" />
                      Automatico x manual
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-blue-200">Automatico</p>
                        <p className="font-bold">
                          {revenueHistory.filter((item) => item.attendanceId).length}
                        </p>
                      </div>
                      <div>
                        <p className="text-blue-200">Manual</p>
                        <p className="font-bold">
                          {revenueHistory.filter((item) => !item.attendanceId).length}
                        </p>
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
                  <p className="text-sm text-gray-500">Entradas de caixa recebidas e integradas ao financeiro.</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  {['Hoje', 'Semana', 'Mês', 'Todos'].map((filter) => (
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
                      <th className="pb-3">Valor</th>
                      <th className="pb-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredHistory.map((item) => (
                      <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 pl-2 text-gray-500 font-medium">{formatDate(parseFlexibleDate(item.date))}</td>
                        <td className="py-4 text-gray-900">{item.category}</td>
                        <td className="py-4 text-gray-500">{item.description}</td>
                        <td className="py-4 text-gray-500">{item.attendanceId ? 'Atendimento' : 'Manual'}</td>
                        <td className="py-4 text-gray-900 font-bold">{formatCurrency(item.amount)}</td>
                        <td className="py-4 text-center">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-700">
                            {item.paymentStatus === 'paid' ? 'Recebido' : 'Pendente'}
                          </span>
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
              <h3 className="font-bold text-lg">Alertas</h3>
              <Bell className="h-5 w-5 text-[#00BFA5]" />
            </div>
            <div className="space-y-3">
              {alerts.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    'bg-white text-[#0B2C4D] p-3 rounded-lg text-sm font-medium border-l-4 shadow-sm',
                    item.status === 'overdue' ? 'border-red-500' : 'border-[#00BFA5]'
                  )}
                >
                  <p className="font-bold mb-1">
                    {item.status === 'overdue' ? 'Conta em atraso' : 'Recebimento pendente'}
                  </p>
                  <p className="text-xs opacity-90">
                    {item.patientName} / {item.ownerName} - {formatCurrency(item.amount)}
                  </p>
                </div>
              ))}
              {alerts.length === 0 && (
                <div className="bg-white/10 p-3 rounded-lg text-sm text-blue-100">
                  Nenhum alerta de recebimento pendente no momento.
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#00BFA5] rounded-xl p-6 text-white">
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
