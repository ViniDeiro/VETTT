import React, { useEffect, useMemo, useState } from 'react'
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
import { supabaseDataService } from '../services/supabaseDataService'
import { useAuth } from '../modules/auth/AuthContext'

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

const getShortPersonName = (value) => {
  const name = String(value || '').trim().replace(/\s+/g, ' ')
  if (!name) return ''
  const parts = name.split(' ')
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1]}`
}

const formatVetDisplayName = (value) => {
  const shortName = getShortPersonName(value)
  return shortName ? `M.V. ${shortName}` : ''
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let mounted = true

    const loadDashboard = async () => {
      try {
        const data = await supabaseDataService.getDashboardData()
        if (mounted) setDashboardData(data)
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error)
        if (mounted) setLoadError('Nao foi possivel carregar os dados do dashboard.')
      }
    }

    loadDashboard()

    return () => {
      mounted = false
    }
  }, [])

  const dashboard = dashboardData?.settings?.dashboard

  const liveStats = useMemo(() => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(start.getDate() + 1)

    const isToday = (value) => {
      const date = new Date(value)
      return date >= start && date < end
    }

    const attendancesToday = (dashboardData?.attendances || []).filter(item => isToday(item.date || item.created_at))
    const financialToday = (dashboardData?.financialRecords || []).filter(item => isToday(item.date || item.created_at))
    const cashToday = (dashboardData?.cashFlow || []).filter(item => isToday(item.date || item.created_at))
    const revenue = financialToday.reduce((sum, item) => sum + Number(item.gross_amount || 0), 0)
      || cashToday.filter(item => item.type === 'income').reduce((sum, item) => sum + Number(item.amount || 0), 0)
    const profit = financialToday.reduce((sum, item) => sum + Number(item.gross_profit || 0), 0)
    const procedureCount = financialToday.reduce((sum, item) => sum + Number(item.procedure_count || 0), 0)
    const lowStockCount = (dashboardData?.inventory || []).filter(item => item.status === 'low' || item.status === 'expired').length
    const ticketAverage = attendancesToday.length > 0 ? revenue / attendancesToday.length : 0

    return {
      attendancesToday,
      revenue,
      profit,
      procedureCount,
      lowStockCount,
      ticketAverage
    }
  }, [dashboardData])

  const statsMap = {
    numero_atendimentos: {
      title: 'Atendimentos hoje',
      value: String(liveStats.attendancesToday.length),
      change: 'Dados do banco',
      icon: Calendar,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      changeColor: 'text-green-500'
    },
    retorno: {
      title: 'Procedimentos',
      value: String(liveStats.procedureCount),
      change: 'Dados do banco',
      icon: Activity,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      changeColor: 'text-green-500'
    },
    faturamento: {
      title: 'Receita',
      value: liveStats.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      change: 'Hoje',
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      changeColor: 'text-green-500'
    },
    lucro: {
      title: 'Lucro',
      value: liveStats.profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      change: 'Hoje',
      icon: Calculator,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      changeColor: 'text-green-500'
    },
    ticket_medio: {
      title: 'Ticket médio',
      value: liveStats.ticketAverage.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      change: 'Hoje',
      icon: DollarSign,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      changeColor: 'text-green-500'
    },
    estoque_critico: {
      title: 'Estoque crítico',
      value: `${liveStats.lowStockCount} itens`,
      change: 'Exige reposição',
      icon: Box,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      changeColor: 'text-red-500'
    }
  }

  const stats = (dashboard?.enabledIndicators || ['faturamento', 'numero_atendimentos', 'lucro', 'estoque_critico'])
    .map(key => statsMap[key])
    .filter(Boolean)

  const { nextAppointments, alerts } = useMemo(() => {
    const currentUserVetLabel = formatVetDisplayName(user?.fullName || user?.name)
    const hasVetProfile = user?.role === 'vet' || String(user?.functionTitle || '').toLowerCase().includes('veterin')
    const now = new Date()
    const endRange = new Date(now)
    endRange.setDate(now.getDate() + 7)

    const allAppointments = (dashboardData?.appointments || [])
      .filter(appointment => {
        const start = new Date(appointment.start)
        return start >= new Date(now.getFullYear(), now.getMonth(), now.getDate()) && start <= endRange
      })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

    const userAppointments = hasVetProfile
      ? allAppointments.filter(appointment => appointment.doctor === currentUserVetLabel)
      : []

    const visibleAppointments = userAppointments.length > 0 ? userAppointments : allAppointments

    const upcomingAppointments = visibleAppointments.slice(0, 6).map(appointment => ({
      id: appointment.id,
      name: appointment.patient || appointment.patientName || appointment.customType || 'Agendamento',
      type: appointment.procedure || appointment.type || 'Agendamento',
      time: new Date(appointment.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      date: new Date(appointment.start).toLocaleDateString('pt-BR'),
      color: appointment.color || 'bg-blue-500',
      doctor: appointment.doctor || 'Nao informado'
    }))

    const notifications = visibleAppointments.slice(0, 5).map(appointment => {
      const start = new Date(appointment.start)
      const isToday = start.toDateString() === now.toDateString()
      const title = isToday
        ? `Hoje: ${appointment.patient || appointment.customType || 'Agendamento'} às ${start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
        : `${start.toLocaleDateString('pt-BR')}: ${appointment.patient || appointment.customType || 'Agendamento'}`
      return {
        title: `${title} com ${appointment.doctor || 'veterinario'}`,
        type: 'appointment'
      }
    })

    if (notifications.length === 0) {
      notifications.push({ title: 'Nenhum agendamento proximo para este usuario.', type: 'info' })
    }

    return {
      nextAppointments: upcomingAppointments,
      alerts: notifications
    }
  }, [user, dashboardData])

  return (
    <Layout>
      <div className="space-y-6">
        {loadError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {loadError}
          </div>
        )}
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                if (stat.title.includes('Atendimentos')) navigate('/agenda');
                else if (stat.title.includes('Procedimentos')) navigate('/attendance-new');
                else if (stat.title.includes('Receita') || stat.title.includes('Ticket') || stat.title.includes('Lucro')) navigate('/finance/revenue');
                else if (stat.title.includes('Estoque')) navigate('/inventory-new');
              }}
            >
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
              <h3 className="text-lg font-bold text-gray-900 mb-4">Próximos Agendamentos</h3>
              <div className="space-y-4">
                {nextAppointments.map((apt, index) => (
                  <div 
                    key={apt.id || index} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => navigate('/agenda')}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${apt.color?.split(' ')[0] || 'bg-blue-500'}`}></div>
                      <div>
                        <span className="font-bold text-gray-900">{apt.name}</span>
                        <span className="text-gray-500 ml-2">({apt.type})</span>
                        <p className="text-xs text-gray-500 mt-1">{apt.date} • {apt.doctor}</p>
                      </div>
                    </div>
                    <div className="font-semibold text-gray-700 bg-white px-3 py-1 rounded-lg shadow-sm">
                      {apt.time}
                    </div>
                  </div>
                ))}
                {nextAppointments.length === 0 && (
                  <div className="text-sm text-gray-400">Nenhum agendamento encontrado para os proximos dias.</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Notificações de Agendamento</h3>
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
