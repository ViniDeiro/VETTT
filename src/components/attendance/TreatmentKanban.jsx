import React, { useState } from 'react'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import {
    MoreVertical,
    CheckCircle,
    X,
    Mail,
    FileDown
} from 'lucide-react'

export default function TreatmentKanban() {
    const [selectedTreatment, setSelectedTreatment] = useState(null)

    const columns = [
        {
            id: 'planned',
            title: 'Planejado',
            count: 3,
            color: 'bg-blue-100 text-blue-700',
            items: [
                {
                    id: 1,
                    title: 'Profilaxia',
                    tooth: 'Geral',
                    price: 'R$ 350,00',
                    status: 'Pendente',
                    statusColor: 'text-blue-600 bg-blue-50'
                },
                {
                    id: 2,
                    title: 'Raspagem de tártaro',
                    tooth: '104, 105, 106',
                    price: 'R$ 450,00',
                    status: 'Pendente',
                    statusColor: 'text-blue-600 bg-blue-50'
                },
                {
                    id: 3,
                    title: 'Exodontia Simples',
                    tooth: '208',
                    price: 'R$ 150,00',
                    status: 'Pendente',
                    statusColor: 'text-blue-600 bg-blue-50'
                }
            ]
        },
        {
            id: 'in_progress',
            title: 'Em andamento',
            count: 2,
            color: 'bg-orange-100 text-orange-700',
            items: [
                {
                    id: 4,
                    title: 'Extração dente 108',
                    tooth: '108',
                    price: 'R$ 200,00',
                    status: 'Em Andamento',
                    statusColor: 'text-orange-600 bg-orange-50',
                    description: 'Remoção do dente 108 devido a fratura coronária.',
                    responsible: 'Dra. Mariana',
                    startDate: '26/10/2023'
                },
                {
                    id: 5,
                    title: 'Polimento',
                    tooth: 'Geral',
                    price: 'R$ 120,00',
                    status: 'Em Andamento',
                    statusColor: 'text-orange-600 bg-orange-50'
                }
            ]
        },
        {
            id: 'completed',
            title: 'Concluído',
            count: 1,
            color: 'bg-green-100 text-green-700',
            items: [
                {
                    id: 6,
                    title: 'Consulta Inicial',
                    tooth: 'Geral',
                    price: 'R$ 100,00',
                    status: 'Concluído',
                    statusColor: 'text-green-600 bg-green-50',
                    completedDate: '26/10/2023'
                }
            ]
        }
    ]

    return (
        <div className="flex gap-6 h-full relative">
            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto">
                <div className="flex gap-6 min-w-[800px]">
                    {columns.map((column) => (
                        <div key={column.id} className="flex-1 min-w-[300px]">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`px-4 py-1 rounded-full text-sm font-medium ${column.color}`}>
                                    {column.title}
                                </div>
                                <span className="text-gray-400 text-sm">{column.count} itens</span>
                            </div>

                            <div className="space-y-4">
                                {column.items.map((item) => (
                                    <Card
                                        key={item.id}
                                        className={`border-none shadow-sm cursor-pointer transition-all hover:shadow-md ${selectedTreatment?.id === item.id ? 'ring-2 ring-blue-500' : ''
                                            }`}
                                        onClick={() => setSelectedTreatment(item)}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-gray-100 rounded-lg">
                                                        {/* Tooth Icon Placeholder */}
                                                        <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
                                                    </div>
                                                    <span className="font-semibold text-gray-900">{item.title}</span>
                                                </div>
                                                <button className="text-gray-400 hover:text-gray-600">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="space-y-1 text-sm">
                                                <p className="text-gray-600">Dente: <span className="font-medium text-gray-900">{item.tooth}</span></p>
                                                <p className="font-bold text-gray-900">{item.price}</p>
                                            </div>

                                            <div className={`mt-3 inline-block px-2 py-1 rounded text-xs font-medium ${item.statusColor}`}>
                                                Status: {item.status}
                                            </div>

                                            {item.completedDate && (
                                                <p className="text-xs text-gray-400 mt-2">Completada: {item.completedDate}</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail Sidebar (Overlay) */}
            {selectedTreatment && (
                <div className="w-96 bg-white shadow-2xl border-l border-gray-200 p-6 absolute right-0 top-0 bottom-0 z-10 overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">{selectedTreatment.title}</h2>
                        <button onClick={() => setSelectedTreatment(null)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Procedimento</p>
                            <p className="text-base text-gray-900">{selectedTreatment.title}</p>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-gray-500">Dente Alvo</p>
                            <p className="text-base text-gray-900">{selectedTreatment.tooth}</p>
                        </div>

                        {selectedTreatment.description && (
                            <div>
                                <p className="text-sm font-medium text-gray-500">Descrição</p>
                                <p className="text-sm text-gray-700 mt-1">{selectedTreatment.description}</p>
                            </div>
                        )}

                        <div>
                            <p className="text-sm font-medium text-gray-500">Custo Estimado</p>
                            <p className="text-lg font-bold text-gray-900">{selectedTreatment.price}</p>
                        </div>

                        {selectedTreatment.responsible && (
                            <div>
                                <p className="text-sm font-medium text-gray-500">Responsável</p>
                                <p className="text-base text-gray-900">{selectedTreatment.responsible}</p>
                            </div>
                        )}

                        {selectedTreatment.startDate && (
                            <div>
                                <p className="text-sm font-medium text-gray-500">Data Início</p>
                                <p className="text-base text-gray-900">{selectedTreatment.startDate}</p>
                            </div>
                        )}

                        <div>
                            <p className="text-sm font-medium text-gray-500">Status</p>
                            <p className="text-base text-gray-900">{selectedTreatment.status}</p>
                        </div>

                        <div className="space-y-3 pt-4">
                            <Button className="w-full bg-[#0B2C4D] hover:bg-[#164B78] text-white">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Marcar como concluído
                            </Button>
                            <Button variant="outline" className="w-full text-teal-600 border-teal-600 hover:bg-teal-50">
                                <Mail className="w-4 h-4 mr-2" />
                                Enviar orientação ao tutor
                            </Button>
                            <Button variant="outline" className="w-full text-gray-700 border-gray-300 hover:bg-gray-50">
                                <FileDown className="w-4 h-4 mr-2" />
                                Gerar orçamento PDF
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
