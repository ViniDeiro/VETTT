import React, { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import {
  Search,
  FileText,
  TrendingUp,
  TrendingDown,
  Wallet,
  CircleDollarSign,
  Clock3,
  Activity,
} from 'lucide-react'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { supabaseDataService } from '../services/supabaseDataService'

const parseFlexibleDate = (value) => {
  if (!value) return new Date('')
  if (value.includes('/')) {
    const [day, month, year] = value.split('/')
    return new Date(Number(year), Number(month) - 1, Number(day))
  }
  return new Date(value)
}

const isSameDay = (left, right) =>
  left.getDate() === right.getDate() &&
  left.getMonth() === right.getMonth() &&
  left.getFullYear() === right.getFullYear()

const getMonthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

export default function Finance() {
  const [animate, setAnimate] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [records, setRecords] = useState([])
  const [receivables, setReceivables] = useState([])
  const [cashFlow, setCashFlow] = useState([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [recordsData, receivablesData, cashFlowData] = await Promise.all([
          supabaseDataService.getFinancialRecords(),
          supabaseDataService.getReceivables(),
          supabaseDataService.getCashFlow()
        ])
        setRecords(recordsData)
        setReceivables(receivablesData)
        setCashFlow(cashFlowData)
      } catch (err) {
        console.error('Error loading financial data:', err)
      } finally {
        setAnimate(true)
      }
    }
    loadData()
  }, [])

  const dashboard = useMemo(() => {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(startOfToday)
    startOfWeek.setDate(startOfToday.getDate() - 6)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const incomeEntries = cashFlow.filter((entry) => entry.type === 'income')
    const incomeToday = incomeEntries.filter((entry) => isSameDay(parseFlexibleDate(entry.date), now))
    const incomeWeek = incomeEntries.filter((entry) => {
      const date = parseFlexibleDate(entry.date)
      return date >= startOfWeek && date <= now
    })
    const incomeMonth = incomeEntries.filter((entry) => {
      const date = parseFlexibleDate(entry.date)
      return date >= startOfMonth && date <= now
    })
    const monthRecords = records.filter((record) => {
      const date = parseFlexibleDate(record.date)
      return date >= startOfMonth && date <= now
    })

    const pendingReceivables = receivables.filter((item) => item.status !== 'paid')
    const paidReceivables = receivables.filter((item) => item.status === 'paid')

    const totalMonthRevenue = monthRecords.reduce((sum, item) => sum + item.grossAmount, 0)
    const totalMonthCost = monthRecords.reduce((sum, item) => sum + item.totalCost, 0)
    const totalMonthProfit = monthRecords.reduce((sum, item) => sum + item.grossProfit, 0)
    const averageMargin = monthRecords.length
      ? monthRecords.reduce((sum, item) => sum + item.marginPercent, 0) / monthRecords.length
      : 0

    const cards = [
      {
        title: 'Total do dia',
        value: formatCurrency(incomeToday.reduce((sum, item) => sum + item.amount, 0)),
        detail: `${incomeToday.length} recebimentos`,
        icon: Wallet,
        tone: 'text-teal-600 bg-teal-50',
      },
      {
        title: 'Total da semana',
        value: formatCurrency(incomeWeek.reduce((sum, item) => sum + item.amount, 0)),
        detail: 'ultimos 7 dias',
        icon: TrendingUp,
        tone: 'text-blue-600 bg-blue-50',
      },
      {
        title: 'Total do mes',
        value: formatCurrency(incomeMonth.reduce((sum, item) => sum + item.amount, 0)),
        detail: `${incomeMonth.length} entradas`,
        icon: CircleDollarSign,
        tone: 'text-emerald-600 bg-emerald-50',
      },
      {
        title: 'Ticket medio',
        value: formatCurrency(monthRecords.length ? totalMonthRevenue / monthRecords.length : 0),
        detail: `${monthRecords.length} atendimentos`,
        icon: Activity,
        tone: 'text-indigo-600 bg-indigo-50',
      },
      {
        title: 'Lucro liquido',
        value: formatCurrency(totalMonthProfit),
        detail: `${averageMargin.toFixed(1)}% de margem media`,
        icon: TrendingUp,
        tone: 'text-green-600 bg-green-50',
      },
      {
        title: 'Custo operacional',
        value: formatCurrency(totalMonthCost),
        detail: formatCurrency(totalMonthRevenue),
        icon: TrendingDown,
        tone: 'text-amber-600 bg-amber-50',
      },
      {
        title: 'Contas recebidas',
        value: formatCurrency(paidReceivables.reduce((sum, item) => sum + item.amount, 0)),
        detail: `${paidReceivables.length} contas pagas`,
        icon: Wallet,
        tone: 'text-cyan-600 bg-cyan-50',
      },
      {
        title: 'Contas pendentes',
        value: formatCurrency(pendingReceivables.reduce((sum, item) => sum + item.amount, 0)),
        detail: `${pendingReceivables.length} em aberto`,
        icon: Clock3,
        tone: 'text-orange-600 bg-orange-50',
      },
    ]

    const lastSixMonths = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
      return {
        label: date.toLocaleDateString('pt-BR', { month: 'short' }),
        key: getMonthKey(date),
        amount: 0,
      }
    })

    const monthlyMap = new Map(lastSixMonths.map((item) => [item.key, item]))
    records.forEach((record) => {
      const key = getMonthKey(parseFlexibleDate(record.date))
      if (monthlyMap.has(key)) {
        monthlyMap.get(key).amount += record.grossAmount
      }
    })

    const chartSeries = Array.from(monthlyMap.values())
    const maxAmount = Math.max(...chartSeries.map((item) => item.amount), 1)
    const chartPoints = chartSeries
      .map((item, index) => {
        const x = 50 + index * 100
        const y = 190 - (item.amount / maxAmount) * 150
        return `${x},${y}`
      })
      .join(' ')
    const chartArea = `${chartPoints} 550,190 50,190`

    const filteredRecords = [...records]
      .sort((a, b) => parseFlexibleDate(b.date).getTime() - parseFlexibleDate(a.date).getTime())
      .filter((record) => {
        const query = searchTerm.trim().toLowerCase()
        if (!query) return true
        return [
          record.patientName,
          record.ownerName,
          record.professionalName,
          record.description,
        ].some((field) => (field || '').toLowerCase().includes(query))
      })

    const patientHistory = Object.values(
      records.reduce((acc, record) => {
        const key = record.patientId
        if (!acc[key]) {
          acc[key] = {
            id: key,
            patientName: record.patientName,
            ownerName: record.ownerName,
            totalGross: 0,
            totalCost: 0,
            totalProfit: 0,
            pendingTotal: 0,
            paidTotal: 0,
            procedures: 0,
          }
        }
        acc[key].totalGross += record.grossAmount
        acc[key].totalCost += record.totalCost
        acc[key].totalProfit += record.grossProfit
        acc[key].procedures += record.procedureCount
        if (record.paymentStatus === 'paid') acc[key].paidTotal += record.grossAmount
        else acc[key].pendingTotal += record.grossAmount
        return acc
      }, {})
    )
      .sort((a, b) => b.totalGross - a.totalGross)
      .slice(0, 6)

    return {
      cards,
      chartSeries,
      chartPoints,
      chartArea,
      filteredRecords,
      patientHistory,
      paymentSummary: {
        pending: receivables.filter((item) => item.status === 'pending').length,
        overdue: receivables.filter((item) => item.status === 'overdue').length,
        paid: receivables.filter((item) => item.status === 'paid').length,
      },
    }
  }, [cashFlow, records, receivables, searchTerm])

  const handleExport = async () => {
    const { default: jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text('Resumo Financeiro', 14, 20)
    doc.setFontSize(10)
    doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 14, 28)

    let y = 40
    dashboard.cards.forEach((card) => {
      doc.text(`${card.title}: ${card.value} (${card.detail})`, 14, y)
      y += 8
    })

    y += 6
    doc.setFontSize(12)
    doc.text('Historico por paciente', 14, y)
    y += 8
    doc.setFontSize(10)

    dashboard.patientHistory.forEach((patient) => {
      if (y > 280) {
        doc.addPage()
        y = 20
      }
      doc.text(
        `${patient.patientName} / ${patient.ownerName} - Total ${formatCurrency(patient.totalGross)} - Pendente ${formatCurrency(patient.pendingTotal)}`,
        14,
        y
      )
      y += 8
    })

    doc.save('resumo_financeiro.pdf')
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
            <p className="text-sm text-gray-500">
              Indicadores de caixa, lucratividade e historico por paciente.
            </p>
          </div>
          <div className="flex w-full sm:w-auto gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar paciente, tutor ou profissional"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <Button onClick={handleExport} className="bg-[#0B2C4D] hover:bg-[#0B2C4D]/90 text-white">
              <FileText className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {dashboard.cards.map((card, index) => {
            const Icon = card.icon
            return (
              <Card
                key={card.title}
                className={cn(
                  'border-none shadow-sm transition-all duration-700 transform',
                  animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                )}
                style={{ transitionDelay: `${index * 60}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-2">{card.title}</p>
                      <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
                      <p className="text-sm text-gray-500 mt-2">{card.detail}</p>
                    </div>
                    <div className={cn('rounded-xl p-3', card.tone)}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div
            className={cn(
              'lg:col-span-2 space-y-6 transition-all duration-1000 delay-200 transform',
              animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            )}
          >
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Faturamento dos ultimos 6 meses</h3>
                    <p className="text-sm text-gray-500">Baseado nos atendimentos finalizados.</p>
                  </div>
                </div>

                <div className="relative h-72 w-full">
                  <svg className="w-full h-full" viewBox="0 0 600 220" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="financeArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    {[40, 70, 100, 130, 160, 190].map((y) => (
                      <line key={y} x1="40" y1={y} x2="560" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                    ))}
                    <polyline
                      fill="none"
                      stroke="#14b8a6"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={dashboard.chartPoints}
                    />
                    <polygon fill="url(#financeArea)" points={dashboard.chartArea} />
                    {dashboard.chartSeries.map((item, index) => {
                      const x = 50 + index * 100
                      const maxAmount = Math.max(...dashboard.chartSeries.map((series) => series.amount), 1)
                      const y = 190 - (item.amount / maxAmount) * 150
                      return <circle key={item.key} cx={x} cy={y} r="4" fill="#14b8a6" />
                    })}
                    {dashboard.chartSeries.map((item, index) => (
                      <text
                        key={`${item.key}-label`}
                        x={50 + index * 100}
                        y="210"
                        textAnchor="middle"
                        className="text-xs fill-gray-500"
                      >
                        {item.label}
                      </text>
                    ))}
                  </svg>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Lancamentos recentes</h3>
                    <p className="text-sm text-gray-500">
                      Bruto, custo, lucro e status por atendimento.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-xs text-gray-500 font-semibold border-b border-gray-100">
                        <th className="pb-3 pl-2">Data</th>
                        <th className="pb-3">Paciente / Tutor</th>
                        <th className="pb-3">Profissional</th>
                        <th className="pb-3">Bruto</th>
                        <th className="pb-3">Custo</th>
                        <th className="pb-3">Lucro</th>
                        <th className="pb-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {dashboard.filteredRecords.slice(0, 8).map((record) => (
                        <tr key={record.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                          <td className="py-4 pl-2 text-gray-500 font-medium">{formatDate(parseFlexibleDate(record.date))}</td>
                          <td className="py-4">
                            <div className="font-medium text-gray-900">{record.patientName}</div>
                            <div className="text-xs text-gray-500">{record.ownerName}</div>
                          </td>
                          <td className="py-4 text-gray-500">{record.professionalName}</td>
                          <td className="py-4 text-gray-900 font-bold">{formatCurrency(record.grossAmount)}</td>
                          <td className="py-4 text-gray-500">{formatCurrency(record.totalCost)}</td>
                          <td className="py-4 text-green-600 font-semibold">{formatCurrency(record.grossProfit)}</td>
                          <td className="py-4 text-center">
                            <span
                              className={cn(
                                'px-3 py-1 rounded-full text-xs font-bold',
                                record.paymentStatus === 'paid'
                                  ? 'bg-teal-100 text-teal-700'
                                  : 'bg-yellow-100 text-yellow-800'
                              )}
                            >
                              {record.paymentStatus === 'paid' ? 'Recebido' : 'Pendente'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {dashboard.filteredRecords.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-400">
                            Nenhum lancamento encontrado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div
            className={cn(
              'space-y-6 transition-all duration-1000 delay-300 transform',
              animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            )}
          >
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Status das contas</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-teal-50 px-4 py-3">
                    <span className="text-sm font-medium text-teal-900">Recebidas</span>
                    <span className="text-lg font-bold text-teal-700">{dashboard.paymentSummary.paid}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-yellow-50 px-4 py-3">
                    <span className="text-sm font-medium text-yellow-900">Pendentes</span>
                    <span className="text-lg font-bold text-yellow-700">{dashboard.paymentSummary.pending}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-red-50 px-4 py-3">
                    <span className="text-sm font-medium text-red-900">Atrasadas</span>
                    <span className="text-lg font-bold text-red-700">{dashboard.paymentSummary.overdue}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Historico por paciente</h3>
                <div className="space-y-4">
                  {dashboard.patientHistory.map((patient) => (
                    <div key={patient.id} className="rounded-xl border border-gray-100 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-900">{patient.patientName}</p>
                          <p className="text-xs text-gray-500">{patient.ownerName}</p>
                        </div>
                        <span className="text-xs font-bold text-[#0B2C4D] bg-slate-100 px-2 py-1 rounded-full">
                          {patient.procedures} procedimentos
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">Total acumulado</p>
                          <p className="font-bold text-gray-900">{formatCurrency(patient.totalGross)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Lucro</p>
                          <p className="font-bold text-green-600">{formatCurrency(patient.totalProfit)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Recebido</p>
                          <p className="font-medium text-teal-700">{formatCurrency(patient.paidTotal)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Pendente</p>
                          <p className="font-medium text-orange-600">{formatCurrency(patient.pendingTotal)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {dashboard.patientHistory.length === 0 && (
                    <p className="text-sm text-gray-400">Nenhum historico financeiro disponivel ainda.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}
