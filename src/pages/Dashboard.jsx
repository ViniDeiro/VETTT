import React from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { 
  Users, 
  Heart, 
  FileText, 
  Archive, 
  TrendingUp,
  DollarSign
} from 'lucide-react'

export default function Dashboard() {
  // Mock data
  const stats = [
    {
      title: 'Total de Clientes',
      value: '156',
      change: '+12%',
      icon: Users,
      color: 'text-blue-400'
    },
    {
      title: 'Cavalos Cadastrados',
      value: '284',
      change: '+8%',
      icon: Heart,
      color: 'text-emerald-400'
    },
    {
      title: 'Gráficos Este Mês',
      value: '42',
      change: '+23%',
      icon: FileText,
      color: 'text-violet-400'
    },
    {
      title: 'Receita Mensal',
      value: 'R$ 18.500',
      change: '+15%',
      icon: DollarSign,
      color: 'text-teal-300'
    }
  ]

  const quickActions = [
    {
      title: 'Criar Novo Gráfico',
      description: 'Iniciar um novo odontograma',
      icon: FileText,
      href: '/create-graphic',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Adicionar Cliente',
      description: 'Cadastrar novo cliente',
      icon: Users,
      href: '/clients',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Cadastrar Cavalo',
      description: 'Adicionar novo cavalo',
      icon: Heart,
      href: '/horses',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Ver Arquivados',
      description: 'Acessar gráficos arquivados',
      icon: Archive,
      href: '/archived-graphics',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'graphic',
      title: 'Odontograma criado para Thunder',
      client: 'João Silva',
      time: '2 horas atrás'
    },
    {
      id: 2,
      type: 'client',
      title: 'Novo cliente cadastrado',
      client: 'Maria Santos',
      time: '4 horas atrás'
    },
    {
      id: 3,
      type: 'horse',
      title: 'Cavalo Relâmpago transferido',
      client: 'Pedro Costa',
      time: '1 dia atrás'
    }
  ]

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Bem-vindo ao sistema de gestão odontológica veterinária
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={`p-3 rounded-full text-white ${action.color}`}>
                        <action.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{action.title}</h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activities and Upcoming */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
              <CardDescription>
                Últimas ações realizadas no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-600">{activity.client}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo Semanal</CardTitle>
              <CardDescription>
                Estatísticas da semana atual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Gráficos criados</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Novos clientes</span>
                  <span className="font-semibold">5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cavalos cadastrados</span>
                  <span className="font-semibold">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Receita gerada</span>
                  <span className="font-semibold">R$ 4.200</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
