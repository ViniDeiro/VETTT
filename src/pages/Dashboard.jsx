import React from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import {
  Calendar,
  Activity,
  DollarSign,
  Calculator,
  Plus,
  Box,
  AlertCircle,
} from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()

  const stats = [
    {
      title: 'Atendimentos hoje',
      value: '12',
      change: '+2% vs ontem',
      icon: Calendar,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      changeColor: 'text-green-500'
    },
    {
      title: 'Procedimentos',
      value: '28',
      change: '+5% vs ontem',
      icon: Activity, // Using Activity as tooth icon replacement
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      changeColor: 'text-green-500'
    },
    {
      title: 'Receita',
      value: 'R$ 8.500',
      change: '+10% vs ontem',
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      changeColor: 'text-green-500'
    },
    {
      title: 'Custos',
      value: 'R$ 2.100',
      change: '+1% vs ontem',
      icon: Calculator,
      color: 'text-red-600',
      bg: 'bg-red-50',
      changeColor: 'text-red-500'
    }
  ]

  const nextAppointments = [
    { name: 'Luna', type: 'Cão, Limpeza', time: '09:00' },
    { name: 'Thor', type: 'Gato, Extração', time: '10:15' },
    { name: 'Bella', type: 'Cavalo, Exame', time: '11:30' },
    { name: 'Max', type: 'Cão, Retorno', time: '14:00' },
  ]

  const alerts = [
    { title: 'Estoque baixo: Broca Odontológica', type: 'warning' },
    { title: 'Retorno: Fred (Gato) em 2 dias', type: 'info' },
    { title: 'Vacina: Rex (Cão) vencendo', type: 'alert' },
  ]

  return (
    <Layout>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-4 rounded-2xl ${stat.bg}`}>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className={`text-xs font-medium mt-1 ${stat.changeColor}`}>
                      {stat.change}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Next Appointments */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Próximos Atendimentos</h3>
              <div className="space-y-4">
                {nextAppointments.map((apt, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <div>
                        <span className="font-bold text-gray-900">{apt.name}</span>
                        <span className="text-gray-500 ml-2">({apt.type})</span>
                      </div>
                    </div>
                    <div className="font-semibold text-gray-700 bg-white px-3 py-1 rounded-lg shadow-sm">
                      {apt.time}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Alertas</h3>
              <div className="space-y-4">
                {alerts.map((alert, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border-b border-gray-100 last:border-0">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    <span className="font-medium text-gray-700">{alert.title}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card className="border-none shadow-sm h-full">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={() => navigate('/clients?action=new')}
                    className="h-14 text-lg bg-[#0B2C4D] hover:bg-[#0B2C4D]/90 text-white rounded-xl justify-start px-6"
                  >
                    <Plus className="mr-3 h-6 w-6" />
                    Novo paciente
                  </Button>
                  <Button 
                    onClick={() => navigate('/attendance-new')}
                    className="h-14 text-lg bg-[#0B2C4D] hover:bg-[#0B2C4D]/90 text-white rounded-xl justify-start px-6"
                  >
                    <Activity className="mr-3 h-6 w-6" />
                    Abrir atendimento
                  </Button>
                  <Button 
                    onClick={() => navigate('/finance/expenses')}
                    className="h-14 text-lg bg-teal-600 hover:bg-teal-700 text-white rounded-xl justify-start px-6"
                  >
                    <DollarSign className="mr-3 h-6 w-6" />
                    Registrar custo
                  </Button>
                  <Button 
                    onClick={() => navigate('/inventory-new')}
                    className="h-14 text-lg bg-teal-600 hover:bg-teal-700 text-white rounded-xl justify-start px-6"
                  >
                    <Box className="mr-3 h-6 w-6" />
                    Entrada de insumo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue vs Costs Chart */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Receita x Custos (Últimos 7 dias)</h3>
              <div className="flex items-center gap-4 mb-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-1 bg-teal-400 rounded-full"></div>
                  <span className="text-gray-600">Receita</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-1 bg-blue-200 rounded-full"></div>
                  <span className="text-gray-600">Custos</span>
                </div>
              </div>

              {/* CSS-only Area Chart */}
              <div className="relative h-48 w-full flex items-end justify-between gap-1 pt-8">
                {/* Background Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="border-t border-gray-100 w-full h-full"></div>
                  <div className="border-t border-gray-100 w-full h-full"></div>
                  <div className="border-t border-gray-100 w-full h-full"></div>
                </div>

                {/* SVG Chart */}
                <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#BFDBFE" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#BFDBFE" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Revenue Path */}
                  <path
                    d="M0,150 C50,130 100,140 150,135 C200,130 250,100 300,80 L300,192 L0,192 Z"
                    fill="url(#revenueGradient)"
                  />
                  <path
                    d="M0,150 C50,130 100,140 150,135 C200,130 250,100 300,80"
                    fill="none"
                    stroke="#2DD4BF"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Cost Path */}
                  <path
                    d="M0,180 C50,170 100,175 150,160 C200,145 250,150 300,130 L300,192 L0,192 Z"
                    fill="url(#costGradient)"
                  />
                  <path
                    d="M0,180 C50,170 100,175 150,160 C200,145 250,150 300,130"
                    fill="none"
                    stroke="#BFDBFE"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
