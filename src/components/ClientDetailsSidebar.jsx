import React from 'react'
import { X, Phone, MapPin, Calendar, Clock, FileText, Download, MessageCircle } from 'lucide-react'
import { Button } from './ui/Button'
import { cn } from '@/lib/utils'

export default function ClientDetailsSidebar({ isOpen, onClose, client }) {
    if (!client) return null

    return (
        <>
            {/* Overlay */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Sidebar Panel */}
            <div className={cn(
                "fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out font-sans",
                isOpen ? "translate-x-0" : "translate-x-full"
            )}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex items-start justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Detalhes do Cliente</h2>
                            <p className="text-lg font-medium text-gray-700 mt-1">{client.name}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto">

                        {/* Contact Info */}
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-4">Informações de Contato</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        <Phone className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <span className="block text-xs text-gray-400">Telefone</span>
                                        <span className="text-sm font-medium">{client.phone}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        <div className="h-4 w-4 text-blue-600 font-bold text-xs flex items-center justify-center">@</div>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-gray-400">Email</span>
                                        <span className="text-sm font-medium">{client.email}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        <div className="h-4 w-4 text-blue-600 font-bold text-xs flex items-center justify-center">ID</div>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-gray-400">CPF/CNPJ</span>
                                        <span className="text-sm font-medium">{client.cpf}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-4">Endereço</h3>
                            <div className="flex items-start gap-3 text-gray-600">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <span className="block text-xs text-gray-400">Endereço Completo</span>
                                    <span className="text-sm font-medium block">{client.address}</span>
                                    <span className="text-sm font-medium block">{client.city}</span>
                                </div>
                            </div>
                        </div>

                        {/* Pets History */}
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-4">Histórico de Pets</h3>
                            <div className="space-y-3">
                                {client.pets && client.pets.map((pet, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                                                {pet.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{pet.name}</p>
                                                <p className="text-xs text-gray-500">{pet.type || 'Cavalo'}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-400">Ver ficha</span>
                                    </div>
                                ))}
                                {!client.pets?.length && <p className="text-sm text-gray-500 italic">Nenhum pet registrado.</p>}
                            </div>
                        </div>

                        {/* Recent Attendance */}
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-4">Atendimentos Recentes</h3>
                            <div className="space-y-4">
                                {/* Mock Item */}
                                <div className="relative pl-4 border-l-2 border-blue-100">
                                    <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-blue-500"></div>
                                    <p className="text-sm font-medium text-gray-900">Limpeza Dental</p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                        <Calendar className="h-3 w-3" /> 15/10/2023
                                        <span className="mx-1">•</span>
                                        <Clock className="h-3 w-3" /> 14:30
                                    </p>
                                </div>
                                <div className="relative pl-4 border-l-2 border-gray-100">
                                    <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-gray-300"></div>
                                    <p className="text-sm font-medium text-gray-900">Consulta de Rotina</p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                        <Calendar className="h-3 w-3" /> 10/08/2023
                                        <span className="mx-1">•</span>
                                        <Clock className="h-3 w-3" /> 09:00
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Observations */}
                        <div className="p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Observações</h3>
                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                                <p className="text-sm text-yellow-800 flex items-start gap-2">
                                    <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    Cliente prefere atendimento no período da manhã.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-3">
                        <Button variant="outline" className="w-full justify-center gap-2 bg-white border-gray-200 text-gray-700 hover:bg-gray-50">
                            <Download className="h-4 w-4" /> Exportar CSV
                        </Button>
                        <Button className="w-full justify-center gap-2 bg-[#0B2C4D] hover:bg-[#0B2C4D]/90 text-white">
                            <MessageCircle className="h-4 w-4" /> Enviar WhatsApp
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}
