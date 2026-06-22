import React, { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart,
  Download,
  Calendar,
  Users,
  Wallet,
  Package,
  Activity,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { supabaseDataService } from '../services/supabaseDataService'

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

const getRange = period => {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (period === 'Hoje') {
    return { title: 'Hoje', start: todayStart, end: now }
  }
  if (period === 'Semana') {
    const start = new Date(todayStart)
    start.setDate(todayStart.getDate() - 6)
    return { title: 'Ultimos 7 dias', start, end: now }
  }
  if (period === 'Mes') {
    return { title: 'Mes atual', start: new Date(now.getFullYear(), now.getMonth(), 1), end: now }
  }
  return { title: 'Ano atual', start: new Date(now.getFullYear(), 0, 1), end: now }
}

const isInRange = (dateValue, start, end) => {
  const date = parseFlexibleDate(dateValue)
  return date >= start && date <= end
}

export default function FinanceReports() {
  const [period, setPeriod] = useState('Mes')
  const [records, setRecords] = useState([])
  const [receivables, setReceivables] = useState([])
  const [inventory, setInventory] = useState([])
  const [cashFlow, setCashFlow] = useState([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [recordsData, receivablesData, inventoryData, cashFlowData] = await Promise.all([
          supabaseDataService.getFinancialRecords(),
          supabaseDataService.getReceivables(),
          supabaseDataService.getInventory(),
          supabaseDataService.getCashFlow()
        ])
        setRecords(recordsData)
        setReceivables(receivablesData)
        setInventory(inventoryData)
        setCashFlow(cashFlowData)
      } catch (error) {
        console.error('Error loading report data:', error)
      }
    }
    loadData()
  }, [])

  const report = useMemo(() => {
    const currentRange = getRange(period)
    const currentRecords = records.filter(record => isInRange(record.date, currentRange.start, currentRange.end))
    const incomeEntries = cashFlow.filter(entry => entry.type === 'income' && isInRange(entry.date, currentRange.start, currentRange.end))
    const expenseEntries = cashFlow.filter(entry => entry.type === 'expense' && isInRange(entry.date, currentRange.start, currentRange.end))
    const currentReceivables = receivables.filter(item => isInRange(item.dueDate, currentRange.start, currentRange.end))

    const cashRevenue = incomeEntries.reduce((sum, item) => sum + item.amount, 0)
    const clinicalCost = currentRecords.reduce((sum, item) => sum + item.totalCost, 0)
    const operationalCost = expenseEntries.reduce((sum, item) => sum + item.amount, 0)
    const totalCost = clinicalCost + operationalCost
    const profit = cashRevenue - totalCost

    const uniqueDays = new Set(
      [...incomeEntries, ...expenseEntries].map(item => parseFlexibleDate(item.date).toISOString().slice(0, 10))
    ).size || 1

    const bestMonths = Array.from({ length: 12 }, (_, index) => {
      const start = new Date(new Date().getFullYear(), index, 1)
      const end = new Date(new Date().getFullYear(), index + 1, 0, 23, 59, 59)
      return {
        label: start.toLocaleDateString('pt-BR', { month: 'short' }),
        revenue: cashFlow
          .filter(entry => entry.type === 'income' && isInRange(entry.date, start, end))
          .reduce((sum, item) => sum + item.amount, 0),
        expense: cashFlow
          .filter(entry => entry.type === 'expense' && isInRange(entry.date, start, end))
          .reduce((sum, item) => sum + item.amount, 0),
      }
    })

    const salesByDescription = currentRecords.reduce((acc, record) => {
      const key = record.description || 'Sem descricao'
      if (!acc[key]) {
        acc[key] = { name: key, value: 0, count: 0 }
      }
      acc[key].value += record.grossAmount
      acc[key].count += 1
      return acc
    }, {})

    const costByCategory = expenseEntries.reduce((acc, entry) => {
      const key = entry.category || 'Sem categoria'
      acc[key] = (acc[key] || 0) + entry.amount
      return acc
    }, {})

    return {
      title: currentRange.title,
      cashRevenue,
      clinicalCost,
      operationalCost,
      totalCost,
      profit,
      averageCostPerDay: totalCost / uniqueDays,
      averageRevenuePerDay: cashRevenue / uniqueDays,
      paidCount: currentReceivables.filter(item => item.status === 'paid').length,
      pendingCount: currentReceivables.filter(item => item.status !== 'paid').length,
      bestMonths: bestMonths.sort((a, b) => b.revenue - a.revenue).slice(0, 4),
      chartData: period === 'Ano' ? bestMonths : bestMonths.slice(Math.max(bestMonths.length - 6, 0)),
      bestSales: Object.values(salesByDescription).sort((a, b) => b.value - a.value).slice(0, 5),
      costCategories: Object.entries(costByCategory)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5),
      expensiveProducts: [...inventory]
        .sort((a, b) => (b.salePrice || 0) - (a.salePrice || 0))
        .slice(0, 5),
      patientHistory: Object.values(
        currentRecords.reduce((acc, record) => {
          if (!acc[record.patientId]) {
            acc[record.patientId] = {
              id: record.patientId,
              patientName: record.patientName,
              ownerName: record.ownerName,
              totalGross: 0,
              totalProfit: 0,
              count: 0,
            }
          }
          acc[record.patientId].totalGross += record.grossAmount
          acc[record.patientId].totalProfit += record.grossProfit
          acc[record.patientId].count += 1
          return acc
        }, {})
      ).sort((a, b) => b.totalGross - a.totalGross).slice(0, 5)
    }
  }, [cashFlow, inventory, period, receivables, records])

  const handleExport = () => {
    import('jspdf').then(({ default: jsPDF }) => {
      const doc = new jsPDF()
      doc.setFontSize(18)
      doc.text('Relatorio Financeiro Consolidado', 14, 20)
      doc.setFontSize(10)
      doc.text(`Periodo: ${report.title}`, 14, 28)
      doc.text(`Receita: ${formatCurrency(report.cashRevenue)}`, 14, 36)
      doc.text(`Custos totais: ${formatCurrency(report.totalCost)}`, 14, 42)
      doc.text(`Lucro / Prejuizo: ${formatCurrency(report.profit)}`, 14, 48)
      doc.text(`Custo medio por dia: ${formatCurrency(report.averageCostPerDay)}`, 14, 54)

      let y = 66
      doc.setFontSize(12)
      doc.text('Melhores vendas', 14, y)
      y += 8
      doc.setFontSize(10)
      report.bestSales.forEach(item => {
        doc.text(`${item.name} - ${formatCurrency(item.value)} (${item.count}x)`, 14, y)
        y += 7
      })

      y += 6
      doc.setFontSize(12)
      doc.text('Categorias de custo', 14, y)
      y += 8
      doc.setFontSize(10)
      report.costCategories.forEach(item => {
        doc.text(`${item.name} - ${formatCurrency(item.value)}`, 14, y)
        y += 7
      })

      doc.save(`relatorio_financeiro_${period.toLowerCase()}.pdf`)
    })
  }

  const maxChartValue = Math.max(...report.chartData.map(item => Math.max(item.revenue, item.expense)), 1)

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Relatorios Financeiros</h1>
            <p className="text-sm text-gray-500">Receita, custos, lucro, melhores meses, melhores vendas e produtos mais caros.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={period}
                onChange={event => setPeriod(event.target.value)}
                className="pl-10 h-10 rounded-lg border-gray-200 text-sm focus:ring-[#0B2C4D] focus:border-[#0B2C4D]"
              >
                <option value="Hoje">Hoje</option>
                <option value="Semana">Semana</option>
                <option value="Mes">Mes</option>
                <option value="Ano">Ano</option>
              </select>
            </div>
            <Button onClick={handleExport} className="bg-[#0B2C4D] hover:bg-[#0B2C4D]/90 text-white gap-2">
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="border-none shadow-sm bg-teal-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-teal-100 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-teal-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 font-medium">Receita do periodo</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(report.cashRevenue)}</h3>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 font-medium">Custos totais</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(report.totalCost)}</h3>
            </CardContent>
          </Card>

          <Card className={cn('border-none shadow-sm', report.profit >= 0 ? 'bg-blue-50' : 'bg-orange-50')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn('p-3 rounded-xl', report.profit >= 0 ? 'bg-blue-100' : 'bg-orange-100')}>
                  <DollarSign className={cn('h-6 w-6', report.profit >= 0 ? 'text-blue-600' : 'text-orange-600')} />
                </div>
              </div>
              <p className="text-sm text-gray-600 font-medium">Lucro / Prejuizo</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(report.profit)}</h3>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-slate-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-slate-100 rounded-xl">
                  <Activity className="h-6 w-6 text-slate-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 font-medium">Custo medio por dia</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(report.averageCostPerDay)}</h3>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-none shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 text-teal-600" />
                <div>
                  <p className="text-sm text-gray-500">Receita media por dia</p>
                  <p className="font-bold text-gray-900">{formatCurrency(report.averageRevenuePerDay)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Contas pagas</p>
                  <p className="font-bold text-gray-900">{report.paidCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <TrendingDown className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-500">Contas pendentes</p>
                  <p className="font-bold text-gray-900">{report.pendingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-500">Produtos caros</p>
                  <p className="font-bold text-gray-900">{report.expensiveProducts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Evolucao financeira</h3>
                <BarChart className="h-5 w-5 text-gray-400" />
              </div>

              <div className="h-64 flex items-end justify-between gap-3 px-2">
                {report.chartData.map(item => (
                  <div key={item.label} className="flex-1 flex items-end gap-1 h-full">
                    <div className="flex-1 flex flex-col justify-end items-center gap-2 h-full">
                      <div className="w-full bg-[var(--clinic-button)] rounded-t-sm opacity-80" style={{ height: `${(item.revenue / maxChartValue) * 100}%` }} />
                    </div>
                    <div className="flex-1 flex flex-col justify-end items-center gap-2 h-full">
                      <div className="w-full bg-red-300 rounded-t-sm opacity-80" style={{ height: `${(item.expense / maxChartValue) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-[11px] text-gray-500 font-medium gap-2">
                {report.chartData.map(item => (
                  <span key={`${item.label}-axis`} className="truncate">{item.label}</span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Melhores vendas</h3>
                <TrendingUp className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {report.bestSales.map(item => (
                  <div key={item.name} className="rounded-xl border border-gray-100 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.count} venda(s)</p>
                      </div>
                      <span className="font-bold text-gray-900">{formatCurrency(item.value)}</span>
                    </div>
                  </div>
                ))}
                {report.bestSales.length === 0 && (
                  <p className="text-sm text-gray-400">Nenhuma venda registrada neste periodo.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Melhores meses</h3>
              <div className="space-y-3">
                {report.bestMonths.map(item => (
                  <div key={item.label} className="rounded-lg bg-gray-50 p-4 flex items-center justify-between">
                    <span className="font-medium text-gray-900">{item.label}</span>
                    <span className="font-bold text-emerald-600">{formatCurrency(item.revenue)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Custos por categoria</h3>
              <div className="space-y-3">
                {report.costCategories.map(item => (
                  <div key={item.name} className="rounded-lg bg-gray-50 p-4 flex items-center justify-between">
                    <span className="font-medium text-gray-900">{item.name}</span>
                    <span className="font-bold text-red-600">{formatCurrency(item.value)}</span>
                  </div>
                ))}
                {report.costCategories.length === 0 && (
                  <p className="text-sm text-gray-400">Nenhum custo operacional no periodo.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Produtos mais caros</h3>
              <div className="space-y-3">
                {report.expensiveProducts.map(item => (
                  <div key={item.id} className="rounded-lg bg-gray-50 p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.category}</p>
                    </div>
                    <span className="font-bold text-gray-900">{formatCurrency(item.salePrice || 0)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Historico por paciente</h3>
            <div className="space-y-4">
              {report.patientHistory.map(patient => (
                <div key={patient.id} className="rounded-xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{patient.patientName}</p>
                      <p className="text-xs text-gray-500">{patient.ownerName}</p>
                    </div>
                    <span className="font-bold text-gray-900">{formatCurrency(patient.totalGross)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                    <div>
                      <p className="text-gray-500">Atendimentos</p>
                      <p className="font-medium text-gray-900">{patient.count}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Lucro</p>
                      <p className="font-medium text-green-600">{formatCurrency(patient.totalProfit)}</p>
                    </div>
                  </div>
                </div>
              ))}
              {report.patientHistory.length === 0 && (
                <p className="text-sm text-gray-400">Nenhum registro financeiro encontrado neste periodo.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
