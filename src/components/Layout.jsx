import React from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50 text-foreground">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <TopBar />
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
