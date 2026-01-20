import React from 'react'
import { Search, Bell, ChevronDown } from 'lucide-react'
import { Button } from './ui/Button'

export default function TopBar() {
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
            <div className="flex items-center gap-4 ml-4">
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-gray-700">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
                </Button>

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                    <div className="flex flex-col items-end hidden md:flex">
                        <span className="text-sm font-semibold text-gray-900">Dra. Sofia Silva</span>
                        <span className="text-xs text-gray-500">Veterinária</span>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia"
                            alt="Avatar"
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400 cursor-pointer" />
                </div>
            </div>
        </div>
    )
}
