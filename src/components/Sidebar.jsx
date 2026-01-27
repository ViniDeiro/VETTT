import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from './ui/Button'
import {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  Package,
  CreditCard,
  Settings,
  Bot,
  Menu,
  X,
  LogOut,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { useAuth } from '../App'

const navigation = [
  { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Pacientes', href: '/clients', icon: Users },
  { name: 'Atendimento', href: '/attendance', icon: Stethoscope },
  { name: 'Agendamento', href: '/agenda', icon: Calendar },
  { name: 'Estoque', href: '/inventory', icon: Package },
  { 
    name: 'Financeiro', 
    href: '/finance', 
    icon: CreditCard,
    submenu: [
      { name: 'Receitas', href: '/finance/revenue' },
      { name: 'Custos', href: '/finance/expenses' },
      { name: 'Relatórios', href: '/finance/reports' },
    ]
  },
  { name: 'Configurações', href: '/settings', icon: Settings },
  { name: 'IA', href: '/ai-assistant', icon: Bot },
]

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [financeOpen, setFinanceOpen] = useState(false)
  const location = useLocation()
  const { logout } = useAuth()

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
        "fixed inset-y-0 left-0 z-50 w-64 bg-[#0B2C4D] shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full text-white">
          {/* Logo */}
          <div className="flex items-center h-20 px-6 border-b border-white/10">
            <div className="flex items-center gap-2">
              {/* Simple Logo Placeholder */}
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#0B2C4D] font-bold">
                V
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">VETTOOTH</h1>
                <p className="text-xs text-blue-300 font-medium tracking-wider">PRO</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || (item.submenu && location.pathname.startsWith(item.href))
              
              if (item.submenu) {
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => setFinanceOpen(!financeOpen)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-white/10 text-white shadow-sm"
                          : "text-blue-100 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <div className="flex items-center">
                        <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-blue-300" : "text-blue-200")} />
                        {item.name}
                      </div>
                      {financeOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                    
                    {financeOpen && (
                      <div className="ml-12 mt-1 space-y-1 border-l border-white/10 pl-2">
                        {item.submenu.map((subItem) => {
                           const isSubActive = location.pathname === subItem.href
                           return (
                             <Link
                               key={subItem.name}
                               to={subItem.href}
                               onClick={() => setIsOpen(false)}
                               className={cn(
                                 "flex items-center px-4 py-2 rounded-lg text-sm transition-all duration-200",
                                 isSubActive
                                   ? "text-white font-medium"
                                   : "text-blue-200 hover:text-white"
                               )}
                             >
                               {/* Bullet point for submenu items */}
                               <div className={cn("w-1.5 h-1.5 rounded-full mr-2", isSubActive ? "bg-blue-300" : "bg-blue-200/50")}></div>
                               {subItem.name}
                             </Link>
                           )
                        })}
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-blue-100 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-blue-300" : "text-blue-200")} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-white/10">
            <Button
              variant="ghost"
              className="w-full justify-start rounded-lg text-blue-100 hover:bg-white/5 hover:text-white"
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
