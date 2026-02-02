import React, { useState } from 'react'
import Layout from '../components/Layout'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Select'
import { Label } from '../components/ui/Label'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart,
  Download,
  Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function FinanceReports() {
  const [period, setPeriod] = useState('last30')

  // Mock Data for different periods
  const reportData = {
    'last30': {
      title: 'Últimos 30 dias',
      revenue: '45.280,00',
      expense: '12.450,00',
      profit: '32.830,00',
      growth: { rev: '+12%', exp: '-5%', prof: '+28%' },
      chartData: [40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95],
      topExpenses: [
        { name: 'Fornecedor Dental Med', value: 'R$ 2.450,00', date: '12/06' },
        { name: 'Aluguel Clínica', value: 'R$ 3.500,00', date: '05/06' },
        { name: 'Folha de Pagamento', value: 'R$ 4.200,00', date: '05/06' }
      ]
    },
    'currentMonth': {
      title: 'Mês Atual',
      revenue: '18.500,00',
      expense: '5.200,00',
      profit: '13.300,00',
      growth: { rev: '+5%', exp: '+2%', prof: '+8%' },
      chartData: [0, 0, 0, 0, 0, 30, 0, 0, 0, 0, 0, 0], // Just June
      topExpenses: [
        { name: 'Conta de Luz', value: 'R$ 850,00', date: '10/06' },
        { name: 'Internet', value: 'R$ 200,00', date: '05/06' }
      ]
    },
    'lastMonth': {
      title: 'Mês Anterior',
      revenue: '42.100,00',
      expense: '11.800,00',
      profit: '30.300,00',
      growth: { rev: '-2%', exp: '-1%', prof: '-3%' },
      chartData: [0, 0, 0, 0, 60, 0, 0, 0, 0, 0, 0, 0], // Just May
      topExpenses: [
        { name: 'Manutenção Ar Cond.', value: 'R$ 1.200,00', date: '20/05' },
        { name: 'Compra Estoque', value: 'R$ 3.000,00', date: '15/05' }
      ]
    },
    'currentYear': {
      title: 'Ano Atual',
      revenue: '245.000,00',
      expense: '85.000,00',
      profit: '160.000,00',
      growth: { rev: '+15%', exp: '+10%', prof: '+18%' },
      chartData: [40, 55, 45, 60, 55, 65, 0, 0, 0, 0, 0, 0],
      topExpenses: [
        { name: 'Equipamento Raio-X', value: 'R$ 15.000,00', date: '10/02' },
        { name: 'Reforma Recepção', value: 'R$ 8.500,00', date: '15/03' }
      ]
    }
  }

  const currentData = reportData[period]

  const handleExport = () => {
    import('jspdf').then(({ default: jsPDF }) => {
        const doc = new jsPDF();
        
        // Header
        doc.setFillColor(11, 44, 77); // #0B2C4D
        doc.rect(0, 0, 210, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.text('Relatório Financeiro', 10, 20);
        doc.setFontSize(10);
        doc.text(`Período: ${currentData.title}`, 10, 26);
        
        // Summary
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text('Resumo', 10, 45);
        
        doc.setFontSize(12);
        doc.text(`Receita Total: R$ ${currentData.revenue}`, 10, 55);
        doc.text(`Despesas Totais: R$ ${currentData.expense}`, 10, 62);
        doc.text(`Lucro Líquido: R$ ${currentData.profit}`, 10, 69);
        
        // Top Expenses
        doc.setFontSize(14);
        doc.text('Maiores Despesas', 10, 85);
        
        let y = 95;
        doc.setFontSize(10);
        currentData.topExpenses.forEach((item, index) => {
            doc.text(`${index + 1}. ${item.name} (${item.date}) - ${item.value}`, 10, y);
            y += 7;
        });

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Gerado em ${new Date().toLocaleDateString()} pelo VetTooth`, 10, 280);

        doc.save(`relatorio_financeiro_${period}.pdf`);
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Relatórios Financeiros</h1>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select 
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="pl-10 h-10 rounded-lg border-gray-200 text-sm focus:ring-[#0B2C4D] focus:border-[#0B2C4D]"
              >
                <option value="last30">Últimos 30 dias</option>
                <option value="currentMonth">Mês atual</option>
                <option value="lastMonth">Mês anterior</option>
                <option value="currentYear">Ano atual</option>
              </select>
            </div>
            <Button onClick={handleExport} className="bg-[#0B2C4D] hover:bg-[#0B2C4D]/90 text-white gap-2">
              <Download className="h-4 w-4" /> Exportar Relatório (PDF)
            </Button>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-sm bg-teal-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-teal-100 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-teal-600" />
                </div>
                <span className="text-xs font-bold text-teal-700 bg-teal-100 px-2 py-1 rounded-full">{currentData.growth.rev}</span>
              </div>
              <p className="text-sm text-gray-600 font-medium">Receita Total</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">R$ {currentData.revenue}</h3>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
                <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded-full">{currentData.growth.exp}</span>
              </div>
              <p className="text-sm text-gray-600 font-medium">Despesas Totais</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">R$ {currentData.expense}</h3>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">{currentData.growth.prof}</span>
              </div>
              <p className="text-sm text-gray-600 font-medium">Lucro Líquido</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">R$ {currentData.profit}</h3>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Evolução (Simulado) */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Evolução Financeira</h3>
                <BarChart className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className="h-64 flex items-end justify-between gap-2 px-2">
                {currentData.chartData.map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end gap-1 group">
                    <div className="w-full bg-[#00BFA5] rounded-t-sm opacity-80 group-hover:opacity-100 transition-opacity" style={{ height: `${h}%` }}></div>
                    <div className="w-full bg-red-300 rounded-t-sm opacity-80 group-hover:opacity-100 transition-opacity" style={{ height: `${h * 0.4}%` }}></div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-xs text-gray-500 font-medium px-2">
                <span>Jan</span><span>Fev</span><span>Mar</span><span>Abr</span><span>Mai</span><span>Jun</span>
                <span>Jul</span><span>Ago</span><span>Set</span><span>Out</span><span>Nov</span><span>Dez</span>
              </div>
              
              <div className="flex items-center justify-center gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#00BFA5] rounded-full"></div>
                  <span className="text-sm text-gray-600">Receitas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-300 rounded-full"></div>
                  <span className="text-sm text-gray-600">Despesas</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Categorias */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Despesas por Categoria</h3>
                <PieChart className="h-5 w-5 text-gray-400" />
              </div>

              <div className="space-y-4">
                {[
                  { name: 'Insumos e Medicamentos', value: 45, color: 'bg-blue-500' },
                  { name: 'Pessoal e Salários', value: 30, color: 'bg-teal-500' },
                  { name: 'Infraestrutura', value: 15, color: 'bg-orange-400' },
                  { name: 'Marketing', value: 10, color: 'bg-purple-500' }
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">{item.name}</span>
                      <span className="font-bold text-gray-900">{item.value}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${item.value}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 mb-4">Maiores Despesas do Mês</h4>
                <div className="space-y-3">
                  {currentData.topExpenses.map((expense, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold text-xs">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{expense.name}</p>
                          <p className="text-xs text-gray-500">{expense.date}</p>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900">{expense.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
