import React, { useState } from 'react'
import Layout from '@/components/Layout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Calendar, 
  Activity, 
  Stethoscope, 
  AlertCircle, 
  FileText, 
  Mail, 
  Plus, 
  Clock,
  Thermometer,
  Heart,
  Wind,
  Search
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Attendance() {
  const [activeTab, setActiveTab] = useState('overview') // overview, odontogram, treatments, exams, photos
  const [mainTab, setMainTab] = useState('patients') // patients, treatments

  return (
    <Layout>
      <div className="space-y-6">
        {/* Top Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMainTab('patients')}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-medium transition-all",
              mainTab === 'patients' ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Pacientes
          </button>
          <button
            onClick={() => setMainTab('treatments')}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-medium transition-all",
              mainTab === 'treatments' ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Tratamentos
          </button>
        </div>

        {/* Patient Header Card */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden border-4 border-white shadow-sm">
                <img 
                  src="https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80" 
                  alt="Thor" 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <h1 className="text-3xl font-bold text-gray-900">Thor</h1>
                  <div className="flex items-center gap-2 text-gray-500 text-sm bg-gray-50 px-3 py-1 rounded-full">
                    <Calendar className="h-4 w-4" />
                    <span>Próxima Consulta: 15/11/2024 - 10:30</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="font-medium">Canino</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span>Tutor: Ana Souza</span>
                </div>

                <div className="flex gap-2 pt-1">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                    Alergias: Penicilina
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
                    Risco Anestésico: ASA III
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inner Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-2 md:pb-0">
          {[
            { id: 'overview', label: 'Visão Geral' },
            { id: 'odontogram', label: 'Odontograma' },
            { id: 'treatments', label: 'Tratamentos' },
            { id: 'exams', label: 'Exames' },
            { id: 'photos', label: 'Fotos' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                activeTab === tab.id 
                  ? "bg-[#0B2C4D] text-white shadow-md" 
                  : "bg-white text-gray-600 hover:bg-gray-50 shadow-sm"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Sinais Vitais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-none shadow-sm bg-teal-50/30 md:col-span-2 lg:col-span-1">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-teal-600" />
                      <h3 className="font-bold text-gray-900">Sinais Vitais</h3>
                    </div>
                    <span className="text-xs text-teal-600 font-medium">(Última medição: 10/05/2024)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Freq. Cardíaca</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-gray-900">110</span>
                        <span className="text-sm text-gray-500">bpm</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Pressão Arterial</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-gray-900">130/80</span>
                        <span className="text-sm text-gray-500">mmHg</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Freq. Respiratória</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-gray-900">24</span>
                        <span className="text-sm text-gray-500">rpm</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Temperatura</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-gray-900">38.5</span>
                        <span className="text-sm text-gray-500">°C</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Anamnese */}
              <Card className="border-none shadow-sm bg-blue-50/30 md:col-span-2 lg:col-span-1">
                <CardContent className="p-6 h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <Stethoscope className="h-5 w-5 text-blue-600" />
                    <h3 className="font-bold text-gray-900">Anamnese</h3>
                  </div>
                  
                  <div className="space-y-4 text-sm">
                    <div>
                      <span className="font-bold text-gray-900 block mb-1">Queixa Principal:</span>
                      <p className="text-gray-600 leading-relaxed">Halitose intensa, relutância em mastigar.</p>
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 block mb-1">Histórico:</span>
                      <p className="text-gray-600 leading-relaxed">Diagnosticado com doença periodontal estágio 2 há 6 meses.</p>
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 block mb-1">Alimentação:</span>
                      <p className="text-gray-600">Ração seca.</p>
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 block mb-1">Comportamento:</span>
                      <p className="text-gray-600">Apatia leve, sensibilidade oral.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column (Sidebar Actions) */}
          <div className="space-y-6">
            
            {/* Ações Rápidas */}
            <Card className="border-none shadow-sm bg-[#0B2C4D] text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Activity className="w-24 h-24" />
              </div>
              <CardContent className="p-6 relative z-10">
                <h3 className="text-lg font-bold mb-6">Ações Rápidas</h3>
                
                <div className="space-y-3">
                  <Button className="w-full bg-[#00BFA5] hover:bg-[#00BFA5]/90 text-white border-none justify-center h-12 text-base font-semibold shadow-lg shadow-teal-900/20">
                    Abrir Odontograma
                  </Button>
                  <Button className="w-full bg-white/10 hover:bg-white/20 text-white border-none justify-center h-10 backdrop-blur-sm">
                    Novo Procedimento
                  </Button>
                  <Button className="w-full bg-white/10 hover:bg-white/20 text-white border-none justify-center h-10 backdrop-blur-sm">
                    <FileText className="mr-2 h-4 w-4" /> Gerar PDF do Prontuário
                  </Button>
                  <Button className="w-full bg-white/10 hover:bg-white/20 text-white border-none justify-center h-10 backdrop-blur-sm">
                    <Mail className="mr-2 h-4 w-4" /> Enviar ao Tutor (E-mail)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Alertas */}
            <Card className="border-none shadow-sm bg-red-50 border-l-4 border-red-400">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <h3 className="font-bold text-red-900">Alertas</h3>
                </div>
                <div className="space-y-3">
                  <div className="text-sm text-red-800">
                    <p className="font-semibold mb-1">Hoje, 09:15</p>
                    <p className="opacity-90 leading-relaxed">
                      Confirmação pendente para cirurgia de 15/11/2024.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </Layout>
  )
}
