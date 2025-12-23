import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from './ui/Button'
import { 
  Home, 
  Users, 
  Heart, 
  UserCheck, 
  FileText, 
  Archive, 
  Settings, 
  Menu, 
  X,
  LogOut
} from 'lucide-react'
import { useAuth } from '../App'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Clientes', href: '/clients', icon: Users },
  { name: 'Cavalos', href: '/horses', icon: Heart },
  { name: 'Veterinários', href: '/veterinarians', icon: UserCheck },
  { name: 'Novo Gráfico', href: '/create-graphic', icon: FileText },
  { name: 'Arquivados', href: '/archived-graphics', icon: Archive },
  { name: 'Configurações', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const { logout, user } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-xl bg-white/10 text-white hover:bg-white/20 backdrop-blur-xl"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl border border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b">
            <h1 className="text-xl font-bold tracking-tight text-gray-900">Vet Tooth</h1>
          </div>

          {/* User info */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-100">
                <span className="text-indigo-700 text-sm font-semibold">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-600">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                    isActive
                      ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start rounded-xl text-gray-700 hover:bg-gray-100"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
