import React, { useState } from 'react'
import { Bell, ChevronDown, User, LogOut, Settings } from 'lucide-react'
import { Button } from './ui/Button'
import { useAuth } from '../modules/auth/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { mockDB } from '../services/mockDatabase'

export default function TopBar() {
    const { logout, user, profile, teamMember } = useAuth()
    const navigate = useNavigate()
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [isNotifOpen, setIsNotifOpen] = useState(false)
    const [uiLanguage, setUiLanguage] = useState('pt-BR')

    const labels = {
        notifications: { 'pt-BR': 'Notificações', 'en-US': 'Notifications', 'es-ES': 'Notificaciones' },
        markRead: { 'pt-BR': 'Marcar todas como lidas', 'en-US': 'Mark all as read', 'es-ES': 'Marcar todas como leidas' },
        confirmed: { 'pt-BR': 'Consulta Confirmada', 'en-US': 'Confirmed Appointment', 'es-ES': 'Consulta Confirmada' },
        lowStock: { 'pt-BR': 'Estoque Baixo', 'en-US': 'Low Stock', 'es-ES': 'Stock Bajo' },
        profile: { 'pt-BR': 'Perfil', 'en-US': 'Profile', 'es-ES': 'Perfil' },
        settings: { 'pt-BR': 'Configurações', 'en-US': 'Settings', 'es-ES': 'Configuracion' },
        logout: { 'pt-BR': 'Sair', 'en-US': 'Logout', 'es-ES': 'Salir' },
        systemProfile: { 'pt-BR': 'Perfil do sistema', 'en-US': 'System profile', 'es-ES': 'Perfil del sistema' }
    }

    React.useEffect(() => {
        const syncSettings = () => {
            const settings = mockDB.getSettings()
            setUiLanguage(settings?.regional?.language || 'pt-BR')
        }

        syncSettings()
        window.addEventListener('vet-settings-updated', syncSettings)
        return () => window.removeEventListener('vet-settings-updated', syncSettings)
    }, [])

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className="h-16 px-8 flex items-center justify-end bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="flex items-center gap-4 relative">
                {/* Notifications */}
                <div className="relative">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="relative text-gray-500 hover:text-gray-700"
                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                    >
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </Button>
                    
                    {isNotifOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-[60] animate-in fade-in zoom-in-95 duration-200">
                            <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="font-semibold text-sm">{labels.notifications[uiLanguage]}</h3>
                                <span className="text-xs text-blue-600 cursor-pointer">{labels.markRead[uiLanguage]}</span>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0">
                                    <p className="text-sm font-medium text-gray-900">{labels.confirmed[uiLanguage]}</p>
                                    <p className="text-xs text-gray-500 mt-1">Thor (Cão) - Amanhã às 14:00</p>
                                </div>
                                <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0">
                                    <p className="text-sm font-medium text-gray-900">{labels.lowStock[uiLanguage]}</p>
                                    <p className="text-xs text-gray-500 mt-1">Anestésico Lidocaína (2 un)</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* User Profile */}
                <div className="relative">
                    <div 
                        className="flex items-center gap-3 pl-4 border-l border-gray-200 cursor-pointer select-none"
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                    >
                        <div className="flex flex-col items-end hidden md:flex">
                            <span className="text-sm font-semibold text-gray-900">{user?.fullName || user?.name || 'Usuario'}</span>
                            <span className="text-xs text-gray-500">{profile?.name || teamMember?.functionTitle || labels.systemProfile[uiLanguage]}</span>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                            <img
                                src={teamMember?.photo || user?.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`}
                                alt="Avatar"
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-[60] animate-in fade-in zoom-in-95 duration-200">
                            <Link 
                                to="/settings" 
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                onClick={() => setIsProfileOpen(false)}
                            >
                                <User className="h-4 w-4" /> {labels.profile[uiLanguage]}
                            </Link>
                            <Link 
                                to="/settings" 
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                onClick={() => setIsProfileOpen(false)}
                            >
                                <Settings className="h-4 w-4" /> {labels.settings[uiLanguage]}
                            </Link>
                            <div className="h-px bg-gray-100 my-1"></div>
                            <button 
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                                <LogOut className="h-4 w-4" /> {labels.logout[uiLanguage]}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
