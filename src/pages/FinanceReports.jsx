import React, { useMemo, useState } from 'react'
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
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { mockDB } from '../services/mockDatabase'

const parseFlexibleDate = (value) => {
  if (!value) return new Date('')
  if (value.includes('/')) {
    const [day, month, year] = value.split('/')
    return new Date(Number(year), Number(month) - 1, Number(day))
  }
  return new Date(value)
}

const percentDiff = (current, previous) => {
  if (!previous && !current) return '0%'
  if (!previous) return '+100%'
  const value = ((current - previous) / previous) * 100
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}

const getPeriodRange = (period) => {
  const now = new Date()
  if (period === 'last30') {
    return {
      title: 'Ultimos 30 dias',
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29),
      end: now,
    }
  }

  if (period === 'currentMonth') {
    return {
      title: 'Mes atual',
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: now,
    }
  }

  if (period === 'lastMonth') {
    return {
      title: 'Mes anterior',
      start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59),
    }
  }

  return {
    title: 'Ano atual',
    start: new Date(now.getFullYear(), 0, 1),
    end: now,
  }
}

const getPreviousRange = (period, currentRange) => {
  if (period === 'last30') {
    return {
      start: new Date(currentRange.start.getFullYear(), currentRange.start.getMonth(), currentRange.start.getDate() - 30),
      end: new Date(currentRange.start.getFullYear(), currentRange.start.getMonth(), currentRange.start.getDate() - 1, 23, 59, 59),
    }
  }

  if (period === 'currentMonth') {
    return {
      start: new Date(currentRange.start.getFullYear(), currentRange.start.getMonth() - 1, 1),
      end: new Date(currentRange.start.getFullYear(), currentRange.start.getMonth(), 0, 23, 59, 59),
    }
  }

  if (period === 'lastMonth') {
    return {
      start: new Date(currentRange.start.getFullYear(), currentRange.start.getMonth() - 1, 1),
      end: new Date(currentRange.start.getFullYear(), currentRange.start.getMonth(), 0, 23, 59, 59),
    }
  }

  return {
    start: new Date(currentRange.start.getFullYear() - 1, 0, 1),
    end: new Date(currentRange.start.getFullYear() - 1, 11, 31, 23, 59, 59),
  }
}

export default function FinanceReports() {
  const [period, setPeriod] = useState('last30')
  const records = mockDB.getFinancialRecords()
  const receivables = mockDB.getReceivables()
  const incomeEntries = mockDB.getCashFlow().filter((entry) => entry.type === 'income')

  const report = useMemo(() => {
    const currentRange = getPeriodRange(period)
    const previousRange = getPreviousRange(period, currentRange)

    const isInRange = (value, start, end) => {
      const date = parseFlexibleDate(value)
      return date >= start && date <= end
    }

    const currentRecords = records.filter((record) => isInRange(record.date, currentRange.start, currentRange.end))
    const previousRecords = records.filter((record) => isInRange(record.date, previousRange.start, previousRange.end))
    const currentIncome = incomeEntries.filter((entry) => isInRange(entry.date, currentRange.start, currentRange.end))
    const currentReceivables = receivables.filter((item) => isInRange(item.dueDate, currentRange.start, currentRange.end))

    const revenue = currentRecords.reduce((sum, item) => sum + item.grossAmount, 0)
    const expense = currentRecords.reduce((sum, item) => sum + item.totalCost, 0)
    const profit = currentRecords.reduce((sum, item) => sum + item.grossProfit, 0)
    const previousRevenue = previousRecords.reduce((sum, item) => sum + item.grossAmount, 0)
    const previousExpense = previousRecords.reduce((sum, item) => sum + item.totalCost, 0)
    const previousProfit = previousRecords.reduce((sum, item) => sum + item.grossProfit, 0)

    const bucketCount = period === 'currentYear' ? 12 : 6
    const chartData = Array.from({ length: bucketCount }, (_, index) => {
      if (period === 'currentYear') {
        const start = new Date(currentRange.start.getFullYear(), index, 1)
        const end = new Date(currentRange.start.getFullYear(), index + 1, 0, 23, 59, 59)
        return {
          label: start.toLocaleDateString('pt-BR', { month: 'short' }),
          revenue: currentRecords
            .filter((record) => isInRange(record.date, start, end))
            .reduce((sum, item) => sum + item.grossAmount, 0),
          expense: currentRecords
            .filter((record) => isInRange(record.date, start, end))
            .reduce((sum, item) => sum + item.totalCost, 0),
        }
      }

      const totalMs = currentRange.end.getTime() - currentRange.start.getTime()
      const chunkMs = totalMs / bucketCount
      const start = new Date(currentRange.start.getTime() + chunkMs * index)
      const end = new Date(
        index === bucketCount - 1 ? currentRange.end.getTime() : currentRange.start.getTime() + chunkMs * (index + 1)
      )
      return {
        label: formatDate(start),
        revenue: currentRecords
          .filter((record) => isInRange(record.date, start, end))
          .reduce((sum, item) => sum + item.grossAmount, 0),
        expense: currentRecords
          .filter((record) => isInRange(record.date, start, end))
          .reduce((sum, item) => sum + item.totalCost, 0),
      }
    })

    const patientHistory = Object.values(
      currentRecords.reduce((acc, record) => {
        const key = record.patientId
        if (!acc[key]) {
          acc[key] = {
            id: key,
            patientName: record.patientName,
            ownerName: record.ownerName,
            totalGross: 0,
            totalProfit: 0,
            count: 0,
            lastDate: record.date,
          }
        }
        acc[key].totalGross += record.grossAmount
        acc[key].totalProfit += record.grossProfit
        acc[key].count += 1
        if (parseFlexibleDate(record.date) > parseFlexibleDate(acc[key].lastDate)) {
          acc[key].lastDate = record.date
        }
        return acc
      }, {})
    ).sort((a, b) => b.totalGross - a.totalGross)

    return {
      title: currentRange.title,
      revenue,
      expense,
      profit,
      growth: {
        rev: percentDiff(revenue, previousRevenue),
        exp: percentDiff(expense, previousExpense),
        prof: percentDiff(profit, previousProfit),
      },
      chartData,
      patientHistory: patientHistory.slice(0, 6),
      receivedAmount: currentIncome.reduce((sum, item) => sum + item.amount, 0),
      paidCount: currentReceivables.filter((item) => item.status === 'paid').length,
      pendingCount: currentReceivables.filter((item) => item.status !== 'paid').length,
      averageMargin: currentRecords.length
        ? currentRecords.reduce((sum, item) => sum + item.marginPercent, 0) / currentRecords.length
        : 0,
    }
  }, [incomeEntries, period, receivables, records])

  const handleExport = () => {
    import('jspdf').then(({ default: jsPDF }) => {
      const doc = new jsPDF()

      doc.setFillColor(11, 44, 77)
      doc.rect(0, 0, 210, 30, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(20)
      doc.text('Relatorio Financeiro', 10, 20)
      doc.setFontSize(10)
      doc.text(`Periodo: ${report.title}`, 10, 26)

      doc.setTextColor(0, 0, 0)
      doc.setFontSize(14)
      doc.text('Resumo', 10, 45)
      doc.setFontSize(11)
      doc.text(`Receita total: ${formatCurrency(report.revenue)}`, 10, 55)
      doc.text(`Custo operacional: ${formatCurrency(report.expense)}`, 10, 62)
      doc.text(`Lucro bruto: ${formatCurrency(report.profit)}`, 10, 69)
      doc.text(`Recebido em caixa: ${formatCurrency(report.receivedAmount)}`, 10, 76)
      doc.text(`Margem media: ${report.averageMargin.toFixed(1)}%`, 10, 83)

      let y = 98
      doc.setFontSize(13)
      doc.text('Historico por paciente', 10, y)
      y += 8
      doc.setFontSize(10)

      report.patientHistory.forEach((item, index) => {
        doc.text(
          `${index + 1}. ${item.patientName} / ${item.ownerName} - ${formatCurrency(item.totalGross)} - ${item.count} atendimentos`,
          10,
          y
        )
        y += 7
      })

      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} pelo VetTooth`, 10, 280)
      doc.save(`relatorio_financeiro_${period}.pdf`)
    })
  }

  const maxChartValue = Math.max(...report.chartData.map((item) => Math.max(item.revenue, item.expense)), 1)

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Relatorios Financeiros</h1>
            <p className="text-sm text-gray-500">Periodo calculado em cima dos atendimentos e recebimentos reais.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
                className="pl-10 h-10 rounded-lg border-gray-200 text-sm focus:ring-[#0B2C4D] focus:border-[#0B2C4D]"
              >
                <option value="last30">Ultimos 30 dias</option>
                <option value="currentMonth">Mes atual</option>
                <option value="lastMonth">Mes anterior</option>
                <option value="currentYear">Ano atual</option>
              </select>
            </div>
            <Button onClick={handleExport} className="bg-[#0B2C4D] hover:bg-[#0B2C4D]/90 text-white gap-2">
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-sm bg-teal-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-teal-100 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-teal-600" />
                </div>
                <span className="text-xs font-bold text-teal-700 bg-teal-100 px-2 py-1 rounded-full">{report.growth.rev}</span>
              </div>
              <p className="text-sm text-gray-600 font-medium">Receita Total</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(report.revenue)}</h3>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
                <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded-full">{report.growth.exp}</span>
              </div>
              <p className="text-sm text-gray-600 font-medium">Custo Operacional</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(report.expense)}</h3>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">{report.growth.prof}</span>
              </div>
              <p className="text-sm text-gray-600 font-medium">Lucro Bruto</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(report.profit)}</h3>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-none shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 text-teal-600" />
                <div>
                  <p className="text-sm text-gray-500">Recebido em caixa</p>
                  <p className="font-bold text-gray-900">{formatCurrency(report.receivedAmount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Pacientes faturados</p>
                  <p className="font-bold text-gray-900">{report.patientHistory.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Evolucao Financeira</h3>
                <BarChart className="h-5 w-5 text-gray-400" />
              </div>

              <div className="h-64 flex items-end justify-between gap-3 px-2">
                {report.chartData.map((item) => (
                  <div key={item.label} className="flex-1 flex items-end gap-1 h-full">
                    <div className="flex-1 flex flex-col justify-end items-center gap-2 h-full">
                      <div
                        className="w-full bg-[var(--clinic-button)] rounded-t-sm opacity-80"
                        style={{ height: `${(item.revenue / maxChartValue) * 100}%` }}
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-end items-center gap-2 h-full">
                      <div
                        className="w-full bg-red-300 rounded-t-sm opacity-80"
                        style={{ height: `${(item.expense / maxChartValue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-[11px] text-gray-500 font-medium gap-2">
                {report.chartData.map((item) => (
                  <span key={`${item.label}-axis`} className="truncate">
                    {item.label}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-center gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[var(--clinic-button)] rounded-full" />
                  <span className="text-sm text-gray-600">Receita</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-300 rounded-full" />
                  <span className="text-sm text-gray-600">Custo</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Historico por Paciente</h3>
                <Users className="h-5 w-5 text-gray-400" />
              </div>

              <div className="space-y-4">
                {report.patientHistory.map((patient, index) => (
                  <div key={patient.id} className="rounded-xl border border-gray-100 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{patient.patientName}</p>
                          <p className="text-xs text-gray-500">{patient.ownerName}</p>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900">{formatCurrency(patient.totalGross)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-3 text-sm">
                      <div>
                        <p className="text-gray-500">Atendimentos</p>
                        <p className="font-medium text-gray-900">{patient.count}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Lucro</p>
                        <p className="font-medium text-green-600">{formatCurrency(patient.totalProfit)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Ultimo</p>
                        <p className="font-medium text-gray-900">{formatDate(parseFlexibleDate(patient.lastDate))}</p>
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
      </div>
    </Layout>
  )
}
