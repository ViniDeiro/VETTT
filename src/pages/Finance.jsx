import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import {
  TrendingUp,
  TrendingDown,
  Search,
  FileText,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Finance() {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    setAnimate(true)
  }, [])

  const cards = [
    {
      title: 'Receita',
      value: 'R$ 125.450,00',
      change: '+5.2%',
      isPositive: true,
      period: 'este mês'
    },
    {
      title: 'Despesas',
      value: 'R$ 42.100,00',
      change: '-2.1%',
      isPositive: false, // Inverted for expenses? The image shows red arrow down for expenses.
      // Usually expenses down is good, but visually red arrow down often implies decrease.
      // Let's match the image: Red arrow down.
      trend: 'down', 
      color: 'text-red-500',
      period: 'este mês'
    },
    {
      title: 'Lucro',
      value: 'R$ 83.350,00',
      change: '+8.4%',
      isPositive: true,
      period: 'este mês'
    },
    {
      title: 'Ticket médio',
      value: 'R$ 450,00',
      change: '+1.5%',
      isPositive: true,
      period: '' // Image doesn't show period for ticket medio, just +1.5%
    }
  ]

  const transactions = [
    {
      id: 1,
      date: '15 Jun 2024',
      desc: 'Consulta e Limpeza - Rex',
      category: 'Serviços Clínicos',
      method: 'Cartão de Crédito',
      value: 'R$ 350,00',
      status: 'Concluído',
      statusColor: 'bg-teal-100 text-teal-700'
    },
    {
      id: 2,
      date: '14 Jun 2024',
      desc: 'Compra de Anestésicos',
      category: 'Suprimentos',
      method: 'Transferência Bancária',
      value: 'R$ 1.200,00',
      status: 'Pendente',
      statusColor: 'bg-red-100 text-red-700'
    },
    {
      id: 3,
      date: '14 Jun 2024',
      desc: 'Exame de Imagem - Luna',
      category: 'Diagnóstico',
      method: 'Pix',
      value: 'R$ 580,00',
      status: 'Concluído',
      statusColor: 'bg-teal-100 text-teal-700'
    }
  ]

  return (
    <Layout>
      <div className="space-y-6">
        {/* Top Bar with Search (Visual only to match image) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input 
                    type="text" 
                    placeholder="Search" 
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
            </div>
            {/* User profile is handled by Layout usually, but adding icons here to match image if needed */}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <Card 
              key={index} 
              className={cn(
                "border-none shadow-sm transition-all duration-700 transform",
                animate ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              )}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <p className="text-gray-500 font-medium mb-2">{card.title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{card.value}</h3>
                <div className="flex items-center text-sm">
                  {card.trend === 'down' ? (
                     <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  ) : (
                     <TrendingUp className="h-4 w-4 text-teal-500 mr-1" />
                  )}
                  <span className={card.trend === 'down' ? 'text-red-500 font-medium' : 'text-teal-500 font-medium'}>
                    {card.change}
                  </span>
                  {card.period && <span className="text-gray-400 ml-1">{card.period}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Section */}
          <div className={cn(
            "lg:col-span-2 space-y-6 transition-all duration-1000 delay-300 transform",
            animate ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          )}>
            
            {/* Fluxo de Caixa Chart */}
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Fluxo de caixa</h3>
                  <button className="flex items-center text-sm text-gray-500 hover:text-gray-700 border rounded-lg px-3 py-1">
                    Últimos 6 meses <ChevronDown className="h-4 w-4 ml-2" />
                  </button>
                </div>

                <div className="relative h-64 w-full">
                  {/* Custom SVG Line Chart */}
                  <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                     {/* Gradients */}
                     <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.2" />
                           <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0" />
                        </linearGradient>
                     </defs>

                     {/* Grid Lines */}
                     {[0, 40, 80, 120, 160, 200].map(y => (
                        <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="#f3f4f6" strokeWidth="1" />
                     ))}

                     {/* Y Axis Labels (Mock) */}
                     <text x="0" y="200" className="text-[10px] fill-gray-400">0k</text>
                     <text x="0" y="160" className="text-[10px] fill-gray-400">20k</text>
                     <text x="0" y="120" className="text-[10px] fill-gray-400">40k</text>
                     <text x="0" y="80" className="text-[10px] fill-gray-400">60k</text>
                     <text x="0" y="40" className="text-[10px] fill-gray-400">80k</text>
                     <text x="0" y="0" className="text-[10px] fill-gray-400">100k</text>

                     {/* The Chart Line 
                         Data Points (approx): 
                         Jan: 20k -> y=160
                         Fev: 40k -> y=120
                         Mar: 35k -> y=130
                         Abr: 65k -> y=70
                         Mai: 55k -> y=90
                         Jun: 90k -> y=20
                     */}
                     <path 
                        d="M50,160 L150,120 L250,130 L350,70 L450,90 L550,20" 
                        fill="none" 
                        stroke="#2DD4BF" 
                        strokeWidth="3" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        className="animate-draw-line"
                        style={{ strokeDasharray: 1000, strokeDashoffset: animate ? 0 : 1000, transition: 'stroke-dashoffset 2s ease-out' }}
                     />
                     
                     {/* Area under the line */}
                     <path 
                        d="M50,160 L150,120 L250,130 L350,70 L450,90 L550,20 V200 H50 Z" 
                        fill="url(#chartGradient)" 
                        className={cn("transition-opacity duration-1000", animate ? "opacity-100" : "opacity-0")}
                     />

                     {/* Dots */}
                     <circle cx="550" cy="20" r="4" fill="#2DD4BF" className="animate-ping opacity-75" />
                     <circle cx="550" cy="20" r="4" fill="#2DD4BF" />

                     {/* X Axis Labels */}
                     <text x="50" y="220" textAnchor="middle" className="text-xs fill-gray-500">Jan</text>
                     <text x="150" y="220" textAnchor="middle" className="text-xs fill-gray-500">Fev</text>
                     <text x="250" y="220" textAnchor="middle" className="text-xs fill-gray-500">Mar</text>
                     <text x="350" y="220" textAnchor="middle" className="text-xs fill-gray-500">Abr</text>
                     <text x="450" y="220" textAnchor="middle" className="text-xs fill-gray-500">Mai</text>
                     <text x="550" y="220" textAnchor="middle" className="text-xs fill-gray-500">Jun</text>
                  </svg>
                </div>
              </CardContent>
            </Card>

            {/* Transactions Table */}
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Transações recentes</h3>
                  <button className="flex items-center text-sm text-gray-500 hover:text-gray-700 border rounded-lg px-3 py-1">
                    Este mês <ChevronDown className="h-4 w-4 ml-2" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-xs text-gray-500 font-semibold border-b border-gray-100">
                            <th className="pb-3 pl-2">Data</th>
                            <th className="pb-3">Descrição</th>
                            <th className="pb-3">Categoria</th>
                            <th className="pb-3">Método</th>
                            <th className="pb-3">Valor</th>
                            <th className="pb-3 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {transactions.map((tx) => (
                            <tr key={tx.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                <td className="py-4 pl-2 text-gray-500 font-medium">{tx.date}</td>
                                <td className="py-4 text-gray-900 font-medium">{tx.desc}</td>
                                <td className="py-4 text-gray-500">{tx.category}</td>
                                <td className="py-4 text-gray-500">{tx.method}</td>
                                <td className="py-4 text-gray-900 font-bold">{tx.value}</td>
                                <td className="py-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${tx.statusColor}`}>
                                        {tx.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Donut Chart & Action */}
          <div className={cn(
            "space-y-6 transition-all duration-1000 delay-500 transform",
            animate ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          )}>
            <Card className="border-none shadow-sm h-full">
                <CardContent className="p-6 flex flex-col h-full">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Resumo do mês</h3>
                    
                    {/* Donut Chart Simulation with SVG */}
                    <div className="relative w-48 h-48 mx-auto mb-8">
                        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                            {/* Segments - approx percentages from image */}
                            {/* Equipamentos 35% (Dark Blue) */}
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1E3A8A" strokeWidth="20" strokeDasharray="35 65" strokeDashoffset="0" />
                            {/* Materiais 25% (Medium Blue) */}
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3B82F6" strokeWidth="20" strokeDasharray="25 75" strokeDashoffset="-35" />
                            {/* Salários 20% (Teal) */}
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#00897B" strokeWidth="20" strokeDasharray="20 80" strokeDashoffset="-60" />
                            {/* Marketing 10% (Light Blue) */}
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#93C5FD" strokeWidth="20" strokeDasharray="10 90" strokeDashoffset="-80" />
                            {/* Outros 10% (Light Teal) */}
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#B2DFDB" strokeWidth="20" strokeDasharray="10 90" strokeDashoffset="-90" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-xs text-gray-500">Total</span>
                            <span className="text-sm font-bold text-gray-900">Categorias</span>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 mb-8">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#1E3A8A] rounded-sm"></div> Equipamentos (35%)</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#3B82F6] rounded-sm"></div> Materiais (25%)</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#00897B] rounded-sm"></div> Salários (20%)</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#93C5FD] rounded-sm"></div> Marketing (10%)</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#B2DFDB] rounded-sm"></div> Outros (10%)</div>
                    </div>

                    <div className="mt-auto">
                        <Button className="w-full bg-[#0B2C4D] hover:bg-[#0B2C4D]/90 text-white rounded-lg h-12">
                            <FileText className="mr-2 h-4 w-4" />
                            Gerar relatório PDF
                        </Button>
                    </div>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}
