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
  FileSpreadsheet,
  File as FileIcon,
  MoreHorizontal,
  Bell
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function FinanceExpenses() {
  const [expensesHistory] = useState([
    {
      id: 1,
      date: '14/06/2024',
      category: 'Insumos',
      desc: 'Compra de Anestésicos',
      value: 'R$ 1.200,00',
      method: 'Boleto',
      status: 'Aprovado',
      statusColor: 'bg-teal-100 text-teal-700'
    },
    {
      id: 2,
      date: '13/06/2024',
      category: 'Manutenção',
      desc: 'Reparo Raio-X',
      value: 'R$ 450,00',
      method: 'Cartão Crédito',
      status: 'Pendente',
      statusColor: 'bg-yellow-100 text-yellow-700'
    },
    {
      id: 3,
      date: '12/06/2024',
      category: 'Equipamentos',
      desc: 'Ultrassom Portátil',
      value: 'R$ 3.500,00',
      method: 'Transferência',
      status: 'Aprovado',
      statusColor: 'bg-teal-100 text-teal-700'
    },
    {
      id: 4,
      date: '11/06/2024',
      category: 'Salários',
      desc: 'Adiantamento Vet',
      value: 'R$ 500,00',
      method: 'PIX',
      status: 'Aprovado',
      statusColor: 'bg-teal-100 text-teal-700'
    },
    {
      id: 5,
      date: '10/06/2024',
      category: 'Manutenção',
      desc: 'Adiantamento Vet',
      value: 'R$ 500,00',
      method: 'PIX',
      status: 'Rejeitado',
      statusColor: 'bg-red-100 text-red-700'
    }
  ])

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
                        <Input placeholder="DD/MM/AAAA" className="pl-10" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Categoria</Label>
                      <Select>
                        <option>Selecione uma categoria</option>
                        <option>Insumos</option>
                        <option>Manutenção</option>
                        <option>Salários</option>
                        <option>Equipamentos</option>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Centro de custo</Label>
                      <Select>
                        <option>Selecione um centro</option>
                        <option>Clínica</option>
                        <option>Administrativo</option>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Descrição</Label>
                    <Input placeholder="Breve descrição do custo" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Valor</Label>
                      <Input placeholder="R$ 0,00" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">Forma de pagamento</Label>
                      <Select>
                        <option>Selecione</option>
                        <option>Cartão Crédito</option>
                        <option>Cartão Débito</option>
                        <option>PIX</option>
                        <option>Dinheiro</option>
                        <option>Boleto</option>
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

                  <Button className="w-full bg-[#00BFA5] hover:bg-[#00BFA5]/90 text-white font-bold h-12 mt-2">
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
                      <TrendingUp className="h-4 w-4 text-[#00BFA5]" />
                    </div>
                    
                    <div className="flex items-end justify-between h-32 gap-2">
                      {/* Bar Chart Simulation */}
                      <div className="flex flex-col items-center gap-1 w-1/4">
                        <span className="text-[10px] text-blue-200 font-bold">R$ 6.000</span>
                        <div className="w-full bg-[#00BFA5] rounded-t-sm h-[80%]"></div>
                        <span className="text-[10px] text-blue-300 truncate w-full text-center">Insumos</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 w-1/4">
                        <span className="text-[10px] text-blue-200 font-bold">R$ 3.500</span>
                        <div className="w-full bg-[#00BFA5] opacity-80 rounded-t-sm h-[50%]"></div>
                        <span className="text-[10px] text-blue-300 truncate w-full text-center">Equipamentos</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 w-1/4">
                        <span className="text-[10px] text-blue-200 font-bold">R$ 2.500</span>
                        <div className="w-full bg-[#00BFA5] opacity-60 rounded-t-sm h-[35%]"></div>
                        <span className="text-[10px] text-blue-300 truncate w-full text-center">Salários</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 w-1/4">
                        <span className="text-[10px] text-blue-200 font-bold">R$ 450</span>
                        <div className="w-full bg-[#00BFA5] opacity-40 rounded-t-sm h-[15%]"></div>
                        <span className="text-[10px] text-blue-300 truncate w-full text-center">Manutenção</span>
                      </div>
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
                  {['Hoje', 'Semana', 'Mês', 'Por categoria'].map((filter, i) => (
                    <button 
                      key={filter} 
                      className={cn(
                        "px-3 py-1 text-xs font-medium rounded-md transition-all",
                        i === 2 ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
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
                    {expensesHistory.map((item) => (
                      <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 pl-2 text-gray-500 font-medium">{item.date}</td>
                        <td className="py-4 text-gray-900">{item.category}</td>
                        <td className="py-4 text-gray-500">{item.desc}</td>
                        <td className="py-4 text-gray-900 font-bold">{item.value}</td>
                        <td className="py-4 text-gray-500">{item.method}</td>
                        <td className="py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.statusColor}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <button className="text-gray-400 hover:text-gray-600">
                            <MoreHorizontal className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
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
              <Bell className="h-5 w-5 text-[#00BFA5]" />
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
          <div className="bg-[#00BFA5] rounded-xl p-6 text-white">
            <h3 className="font-bold text-lg mb-4">Exportar</h3>
            <div className="flex gap-4">
               <button className="flex-1 bg-white/20 hover:bg-white/30 transition-colors rounded-lg p-3 flex flex-col items-center gap-2 border border-white/30">
                 <FileText className="h-6 w-6" />
                 <span className="text-xs font-bold">CSV</span>
               </button>
               <button className="flex-1 bg-white/20 hover:bg-white/30 transition-colors rounded-lg p-3 flex flex-col items-center gap-2 border border-white/30">
                 <FileIcon className="h-6 w-6" />
                 <span className="text-xs font-bold">PDF</span>
               </button>
               <button className="flex-1 bg-white/20 hover:bg-white/30 transition-colors rounded-lg p-3 flex flex-col items-center gap-2 border border-white/30">
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
