import React, { useState } from 'react'
import { Search, Bell, ChevronDown, User, LogOut, Settings } from 'lucide-react'
import { Button } from './ui/Button'
import { useAuth } from '../modules/auth/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

export default function TopBar() {
    const { logout, user } = useAuth()
    const navigate = useNavigate()
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [isNotifOpen, setIsNotifOpen] = useState(false)

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className="h-16 px-8 flex items-center justify-between bg-white border-b border-gray-200 sticky top-0 z-40">
            {/* Search */}
            <div className="flex-1 max-w-xl">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar paciente, tutor, ID..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4 ml-4 relative">
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
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                            <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="font-semibold text-sm">Notificações</h3>
                                <span className="text-xs text-blue-600 cursor-pointer">Marcar todas como lidas</span>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0">
                                    <p className="text-sm font-medium text-gray-900">Consulta Confirmada</p>
                                    <p className="text-xs text-gray-500 mt-1">Thor (Cão) - Amanhã às 14:00</p>
                                </div>
                                <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0">
                                    <p className="text-sm font-medium text-gray-900">Estoque Baixo</p>
                                    <p className="text-xs text-gray-500 mt-1">Anestésico Lidocaína (2 un)</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* User Profile */}
                <div className="relative">
                    <div 
                        className="flex items-center gap-3 pl-4 border-l border-gray-200 cursor-pointer"
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                    >
                        <div className="flex flex-col items-end hidden md:flex">
                            <span className="text-sm font-semibold text-gray-900">{user?.name || 'Dra. Sofia Silva'}</span>
                            <span className="text-xs text-gray-500">{user?.role === 'admin' ? 'Administradora' : 'Veterinária'}</span>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                            <img
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia"
                                alt="Avatar"
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                            <Link 
                                to="/settings" 
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                onClick={() => setIsProfileOpen(false)}
                            >
                                <User className="h-4 w-4" /> Perfil
                            </Link>
                            <Link 
                                to="/settings" 
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                onClick={() => setIsProfileOpen(false)}
                            >
                                <Settings className="h-4 w-4" /> Configurações
                            </Link>
                            <div className="h-px bg-gray-100 my-1"></div>
                            <button 
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                                <LogOut className="h-4 w-4" /> Sair
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
