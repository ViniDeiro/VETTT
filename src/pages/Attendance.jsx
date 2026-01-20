import React, { useState } from 'react'
import Layout from '@/components/Layout'
import PatientProfile from '@/components/attendance/PatientProfile'
import TreatmentKanban from '@/components/attendance/TreatmentKanban'

export default function Attendance() {
    const [activeTab, setActiveTab] = useState('pacientes')

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header & Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
                        <button
                            onClick={() => setActiveTab('pacientes')}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'pacientes'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Pacientes
                        </button>
                        <button
                            onClick={() => setActiveTab('tratamentos')}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'tratamentos'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Tratamentos
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="min-h-[calc(100vh-12rem)]">
                    {activeTab === 'pacientes' ? (
                        <PatientProfile />
                    ) : (
                        <TreatmentKanban />
                    )}
                </div>
            </div>
        </Layout>
    )
}
