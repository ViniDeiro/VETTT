import React from 'react'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import {
    Activity,
    FileText,
    Stethoscope,
    Calendar,
    AlertCircle,
    Mail,
    Printer,
    Plus,
    Search
} from 'lucide-react'

export default function PatientProfile() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
                {/* Patient Header Card */}
                <Card className="border-none shadow-sm overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            {/* Patient Photo */}
                            <div className="w-32 h-32 rounded-full border-4 border-blue-50 overflow-hidden flex-shrink-0">
                                <img
                                    src="https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
                                    alt="Thor"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Patient Info */}
                            <div className="flex-1 w-full">
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                                    <h1 className="text-3xl font-bold text-gray-900">Thor</h1>
                                    <div className="flex items-center text-gray-500 text-sm mt-2 md:mt-0 bg-gray-50 px-3 py-1 rounded-lg">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Próxima Consulta: 15/11/2024 - 10:30
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-gray-600 mb-4">
                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                        Canino
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                        Tutor: Ana Souza
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                                        Alergias: Penicilina
                                    </span>
                                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                                        Risco Anestésico: ASA III
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Sub Navigation */}
                <div className="flex overflow-x-auto pb-2 gap-2">
                    {['Visão Geral', 'Odontograma', 'Tratamentos', 'Exames', 'Fotos', 'Arquivos', 'Notas'].map((tab, i) => (
                        <button
                            key={tab}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${i === 0
                                    ? 'bg-[#0B2C4D] text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Vitals */}
                    <Card className="border-none shadow-sm">
                        <div className="p-4 border-b border-gray-100 bg-teal-50 rounded-t-xl flex items-center gap-2">
                            <Activity className="w-5 h-5 text-teal-600" />
                            <h3 className="font-semibold text-teal-900">Sinais Vitais</h3>
                            <span className="text-xs text-teal-600 ml-auto">(Última medição: 10/05/2024)</span>
                        </div>
                        <CardContent className="p-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500">Freq. Cardíaca</p>
                                    <p className="text-lg font-bold text-gray-900">110 bpm</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Pressão Arterial</p>
                                    <p className="text-lg font-bold text-gray-900">130/80 mmHg</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Freq. Respiratória</p>
                                    <p className="text-lg font-bold text-gray-900">24 rpm</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Temperatura</p>
                                    <p className="text-lg font-bold text-gray-900">38.5 °C</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Peso</p>
                                    <p className="text-lg font-bold text-gray-900">25.4 kg</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Anamnesis */}
                    <Card className="border-none shadow-sm">
                        <div className="p-4 border-b border-gray-100 bg-blue-50 rounded-t-xl flex items-center gap-2">
                            <Stethoscope className="w-5 h-5 text-blue-600" />
                            <h3 className="font-semibold text-blue-900">Anamnese</h3>
                        </div>
                        <CardContent className="p-4 text-sm text-gray-600 space-y-2">
                            <p><span className="font-semibold text-gray-900">Queixa Principal:</span> Halitose intensa, relutância em mastigar.</p>
                            <p><span className="font-semibold text-gray-900">Histórico:</span> Diagnosticado com doença periodontal estágio 2 há 6 meses.</p>
                            <p><span className="font-semibold text-gray-900">Alimentação:</span> Ração seca.</p>
                            <p><span className="font-semibold text-gray-900">Comportamento:</span> Apatia leve, sensibilidade oral.</p>
                        </CardContent>
                    </Card>

                    {/* Diagnosis */}
                    <Card className="border-none shadow-sm">
                        <div className="p-4 border-b border-gray-100 bg-indigo-50 rounded-t-xl flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-600" />
                            <h3 className="font-semibold text-indigo-900">Diagnóstico</h3>
                        </div>
                        <CardContent className="p-4 text-sm text-gray-600">
                            <p>Doença Periodontal Estágio 3 (PD3) generalizada. Fratura coronária não complicada no dente 208. Gengivite severa e retração gengival em múltiplos dentes.</p>
                        </CardContent>
                    </Card>

                    {/* Therapeutic Plan */}
                    <Card className="border-none shadow-sm">
                        <div className="p-4 border-b border-gray-100 bg-cyan-50 rounded-t-xl flex items-center gap-2">
                            <Activity className="w-5 h-5 text-cyan-600" />
                            <h3 className="font-semibold text-cyan-900">Plano Terapêutico</h3>
                        </div>
                        <CardContent className="p-4 text-sm text-gray-600 space-y-2">
                            <p><span className="font-semibold text-gray-900">Curto prazo:</span> Profilaxia dental completa sob anestesia geral, extrações dentárias (104, 204, 309) se necessário.</p>
                            <p><span className="font-semibold text-gray-900">Longo prazo:</span> Escovação diária, dieta odontológica, acompanhamento trimestral.</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Recent Procedures */}
                    <Card className="border-none shadow-sm">
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900">Procedimentos Recentes</h3>
                        </div>
                        <CardContent className="p-4 space-y-4">
                            {[
                                { date: '25/04/2024', title: 'Consulta de Retorno', status: 'Concluído', doctor: 'Dra. Ana Lima', color: 'text-green-600 bg-green-50' },
                                { date: '10/04/2024', title: 'Exame de Sangue', status: 'Resultado Disponível', doctor: '-', color: 'text-blue-600 bg-blue-50' },
                                { date: '05/03/2024', title: 'Profilaxia Dental', status: 'Concluído', doctor: 'Dra. Carlos M.', color: 'text-green-600 bg-green-50' },
                            ].map((proc, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500">{proc.date}</p>
                                        <p className="font-medium text-gray-900">{proc.title}</p>
                                        <p className={`text-xs font-medium mt-1 inline-block px-2 py-0.5 rounded ${proc.color}`}>
                                            {proc.status}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">{proc.doctor}</p>
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" className="w-full text-xs">Ver todos</Button>
                        </CardContent>
                    </Card>

                    {/* Attachments Preview */}
                    <Card className="border-none shadow-sm">
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900">Pré-visualização de Anexos</h3>
                        </div>
                        <CardContent className="p-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="aspect-square bg-gray-50 rounded-lg flex flex-col items-center justify-center p-2 text-center hover:bg-gray-100 cursor-pointer transition-colors">
                                    <FileText className="w-8 h-8 text-red-500 mb-2" />
                                    <span className="text-[10px] text-gray-600 line-clamp-2">Resultado_Exame_Sangue.pdf</span>
                                </div>
                                <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden hover:opacity-90 cursor-pointer transition-opacity relative group">
                                    <img src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="X-Ray" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Search className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden hover:opacity-90 cursor-pointer transition-opacity relative group">
                                    <img src="https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="Dog" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Search className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
                {/* Quick Actions */}
                <Card className="border-none shadow-sm bg-[#0B2C4D] text-white">
                    <CardContent className="p-6 space-y-4">
                        <h3 className="font-bold text-lg mb-4">Ações Rápidas</h3>
                        <Button className="w-full justify-start bg-teal-500 hover:bg-teal-600 text-white border-none">
                            <Activity className="w-4 h-4 mr-2" />
                            Abrir Odontograma
                        </Button>
                        <Button className="w-full justify-start bg-[#164B78] hover:bg-[#1E5C91] text-white border-none">
                            <Plus className="w-4 h-4 mr-2" />
                            Novo Procedimento
                        </Button>
                        <Button className="w-full justify-start bg-[#164B78] hover:bg-[#1E5C91] text-white border-none">
                            <Printer className="w-4 h-4 mr-2" />
                            Gerar PDF do Prontuário
                        </Button>
                        <Button className="w-full justify-start bg-[#164B78] hover:bg-[#1E5C91] text-white border-none">
                            <Mail className="w-4 h-4 mr-2" />
                            Enviar ao Tutor (E-mail)
                        </Button>
                    </CardContent>
                </Card>

                {/* Alerts */}
                <Card className="border-none shadow-sm bg-red-50 border-l-4 border-red-500">
                    <div className="p-4 border-b border-red-100 bg-red-100/50 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <h3 className="font-bold text-red-900">Alertas</h3>
                    </div>
                    <CardContent className="p-4 space-y-4">
                        <div>
                            <p className="text-xs font-bold text-gray-900">Hoje, 09:15</p>
                            <p className="text-sm text-gray-700">Confirmação pendente para cirurgia de 15/11/2024.</p>
                        </div>
                        <div className="pt-3 border-t border-red-100">
                            <p className="text-xs font-bold text-gray-900">Ontem, 14:30</p>
                            <p className="text-sm text-gray-700">Resultado de exame de sangue liberado.</p>
                        </div>
                        <div className="pt-3 border-t border-red-100">
                            <p className="text-xs font-bold text-gray-900">28/04/2024</p>
                            <p className="text-sm text-gray-700">Vencimento da vacina antirrábica em 15/05/2024.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
