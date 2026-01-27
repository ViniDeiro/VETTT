import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Stethoscope, Syringe, Activity, Calendar, FileText } from 'lucide-react'

export default function Attendance() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('clinico')
    const [openClinicoConsulta, setOpenClinicoConsulta] = useState(false)
    const [openClinicoPrescricao, setOpenClinicoPrescricao] = useState(false)
    const [openVacinaRegistrar, setOpenVacinaRegistrar] = useState(false)
    const [openVacinaAgendar, setOpenVacinaAgendar] = useState(false)
    const [openOdontoProcedimento, setOpenOdontoProcedimento] = useState(false)

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header & Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
                        <button
                            onClick={() => setActiveTab('clinico')}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'pacientes'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Clínico
                        </button>
                        <button
                            onClick={() => setActiveTab('vacinacao')}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'tratamentos'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Vacinação
                        </button>
                        <button
                            onClick={() => setActiveTab('odontologico')}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'odontologico'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Odontológico
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="min-h-[calc(100vh-12rem)]">
                    {activeTab === 'clinico' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="border-none shadow-sm">
                                <div className="p-4 border-b border-gray-100 bg-blue-50 rounded-t-xl flex items-center gap-2">
                                    <Stethoscope className="w-5 h-5 text-blue-600" />
                                    <h3 className="font-semibold text-blue-900">Atendimento Clínico</h3>
                                </div>
                                <CardContent className="p-6 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="motivo">Motivo da consulta</Label>
                                            <Input id="motivo" placeholder="Ex.: claudicação, inapetência..." />
                                        </div>
                                        <div>
                                            <Label htmlFor="data">Data</Label>
                                            <Input id="data" type="date" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label htmlFor="obs">Observações</Label>
                                            <Input id="obs" placeholder="Notas clínicas" />
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Button onClick={() => setOpenClinicoConsulta(true)} className="bg-[#0B2C4D] text-white">Nova consulta</Button>
                                        <Button variant="outline" onClick={() => setOpenClinicoPrescricao(true)}>Prescrever medicamento</Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm">
                                <div className="p-4 border-b border-gray-100 bg-indigo-50 rounded-t-xl flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-indigo-600" />
                                    <h3 className="font-semibold text-indigo-900">Sinais vitais</h3>
                                </div>
                                <CardContent className="p-6 grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>FC (bpm)</Label>
                                        <Input />
                                    </div>
                                    <div>
                                        <Label>FR (rpm)</Label>
                                        <Input />
                                    </div>
                                    <div>
                                        <Label>Temp (°C)</Label>
                                        <Input />
                                    </div>
                                    <div>
                                        <Label>TPR outros</Label>
                                        <Input />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'vacinacao' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="border-none shadow-sm">
                                <div className="p-4 border-b border-gray-100 bg-green-50 rounded-t-xl flex items-center gap-2">
                                    <Syringe className="w-5 h-5 text-green-600" />
                                    <h3 className="font-semibold text-green-900">Vacinações</h3>
                                </div>
                                <CardContent className="p-6 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="vacina">Vacina</Label>
                                            <Select id="vacina">
                                                <option>Antirrábica</option>
                                                <option>Tétano</option>
                                                <option>Influenza Equina</option>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="dose">Dose</Label>
                                            <Select id="dose">
                                                <option>1ª dose</option>
                                                <option>2ª dose</option>
                                                <option>Reforço</option>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="dataVac">Data</Label>
                                            <Input id="dataVac" type="date" />
                                        </div>
                                        <div>
                                            <Label htmlFor="lote">Lote</Label>
                                            <Input id="lote" placeholder="Ex.: L1234" />
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Button className="bg-[#0B2C4D] text-white" onClick={() => setOpenVacinaRegistrar(true)}>Registrar vacina</Button>
                                        <Button variant="outline" onClick={() => setOpenVacinaAgendar(true)}><Calendar className="h-4 w-4 mr-2" />Agendar dose</Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm">
                                <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-gray-600" />
                                    <h3 className="font-semibold text-gray-900">Histórico</h3>
                                </div>
                                <CardContent className="p-6 space-y-3 text-sm text-gray-700">
                                    <p>• Antirrábica — 15/05/2024 — Lote L1234</p>
                                    <p>• Tétano — 01/03/2024 — Lote T5678</p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'odontologico' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="border-none shadow-sm">
                                <div className="p-4 border-b border-gray-100 bg-cyan-50 rounded-t-xl flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-cyan-600" />
                                    <h3 className="font-semibold text-cyan-900">Atendimento Odontológico</h3>
                                </div>
                                <CardContent className="p-6 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="proc">Procedimento</Label>
                                            <Select id="proc">
                                                <option>Profilaxia</option>
                                                <option>Raspagem</option>
                                                <option>Exodontia</option>
                                                <option>Restauração</option>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="tooth">Dente</Label>
                                            <Input id="tooth" placeholder="Ex.: 108" />
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Button className="bg-[#0B2C4D] text-white" onClick={() => navigate('/create-graphic')}>Abrir odontograma</Button>
                                        <Button variant="outline" onClick={() => setOpenOdontoProcedimento(true)}>Registrar procedimento</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
            {/* Modais */}
            <Modal isOpen={openClinicoConsulta} onClose={() => setOpenClinicoConsulta(false)} title="Nova consulta clínica">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="clinReason">Motivo</Label>
                        <Input id="clinReason" />
                    </div>
                    <div>
                        <Label htmlFor="clinNotes">Notas</Label>
                        <Input id="clinNotes" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpenClinicoConsulta(false)}>Cancelar</Button>
                    <Button onClick={() => setOpenClinicoConsulta(false)}>Salvar</Button>
                </div>
            </Modal>

            <Modal isOpen={openClinicoPrescricao} onClose={() => setOpenClinicoPrescricao(false)} title="Prescrição de medicamento">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="drug">Medicamento</Label>
                        <Input id="drug" />
                    </div>
                    <div>
                        <Label htmlFor="doseMed">Dose</Label>
                        <Input id="doseMed" />
                    </div>
                    <div className="md:col-span-2">
                        <Label htmlFor="freq">Frequência</Label>
                        <Input id="freq" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpenClinicoPrescricao(false)}>Cancelar</Button>
                    <Button onClick={() => setOpenClinicoPrescricao(false)}>Salvar</Button>
                </div>
            </Modal>

            <Modal isOpen={openVacinaRegistrar} onClose={() => setOpenVacinaRegistrar(false)} title="Registrar vacina">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="vacName">Vacina</Label>
                        <Select id="vacName">
                            <option>Antirrábica</option>
                            <option>Tétano</option>
                            <option>Influenza Equina</option>
                        </Select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="vacDose">Dose</Label>
                            <Select id="vacDose">
                                <option>1ª dose</option>
                                <option>2ª dose</option>
                                <option>Reforço</option>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="vacDate">Data</Label>
                            <Input id="vacDate" type="date" />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="vacLot">Lote</Label>
                        <Input id="vacLot" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpenVacinaRegistrar(false)}>Cancelar</Button>
                    <Button onClick={() => setOpenVacinaRegistrar(false)}>Salvar</Button>
                </div>
            </Modal>

            <Modal isOpen={openVacinaAgendar} onClose={() => setOpenVacinaAgendar(false)} title="Agendar dose">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="vacAgType">Vacina</Label>
                        <Select id="vacAgType">
                            <option>Antirrábica</option>
                            <option>Tétano</option>
                            <option>Influenza Equina</option>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="vacAgDate">Data</Label>
                        <Input id="vacAgDate" type="date" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpenVacinaAgendar(false)}>Cancelar</Button>
                    <Button onClick={() => setOpenVacinaAgendar(false)}>Agendar</Button>
                </div>
            </Modal>

            <Modal isOpen={openOdontoProcedimento} onClose={() => setOpenOdontoProcedimento(false)} title="Registrar procedimento odontológico">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="odProc">Procedimento</Label>
                        <Select id="odProc">
                            <option>Profilaxia</option>
                            <option>Raspagem</option>
                            <option>Exodontia</option>
                            <option>Restauração</option>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="odTooth">Dente</Label>
                        <Input id="odTooth" placeholder="Ex.: 108" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpenOdontoProcedimento(false)}>Cancelar</Button>
                    <Button onClick={() => setOpenOdontoProcedimento(false)}>Salvar</Button>
                </div>
            </Modal>
        </Layout>
    )
}
