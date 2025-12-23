import React from 'react'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-sky-50 via-indigo-50 to-white text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-auto lg:ml-0">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
