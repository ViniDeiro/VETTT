import React, { useState, createContext, useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Attendance from './pages/Attendance'
import Clients from './pages/Clients'
import Horses from './pages/Horses'
import Veterinarians from './pages/Veterinarians'
import CreateGraphic from './pages/CreateGraphic'
import ArchivedGraphics from './pages/ArchivedGraphics'
import Settings from './pages/Settings'
import OwnerCreate from './pages/OwnerCreate'
import Agenda from './pages/Agenda'
import Inventory from './pages/Inventory'
import Finance from './pages/Finance'
import FinanceRevenue from './pages/FinanceRevenue'
import FinanceExpenses from './pages/FinanceExpenses'
import FinanceReports from './pages/FinanceReports'

// Authentication Context
const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  const login = (credentials) => {
    // Mock authentication
    if (credentials.email && credentials.password) {
      setIsAuthenticated(true)
      setUser({ email: credentials.email, name: 'Dr. Veterinário' })
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null)
  }

  const authValue = {
    isAuthenticated,
    user,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={authValue}>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route
            path="/login"
            element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/attendance"
            element={isAuthenticated ? <Attendance /> : <Navigate to="/login" />}
          />
          <Route
            path="/clients"
            element={isAuthenticated ? <Clients /> : <Navigate to="/login" />}
          />
          <Route
            path="/horses"
            element={isAuthenticated ? <Horses /> : <Navigate to="/login" />}
          />
          <Route
            path="/veterinarians"
            element={isAuthenticated ? <Veterinarians /> : <Navigate to="/login" />}
          />
          <Route
            path="/create-graphic"
            element={isAuthenticated ? <CreateGraphic /> : <Navigate to="/login" />}
          />
          <Route
            path="/archived-graphics"
            element={isAuthenticated ? <ArchivedGraphics /> : <Navigate to="/login" />}
          />
          <Route
            path="/settings"
            element={isAuthenticated ? <Settings /> : <Navigate to="/login" />}
          />
          <Route
            path="/owners/new"
            element={isAuthenticated ? <OwnerCreate /> : <Navigate to="/login" />}
          />
          <Route
            path="/agenda"
            element={isAuthenticated ? <Agenda /> : <Navigate to="/login" />}
          />
          <Route
            path="/inventory"
            element={isAuthenticated ? <Inventory /> : <Navigate to="/login" />}
          />
          <Route
            path="/finance"
            element={isAuthenticated ? <Finance /> : <Navigate to="/login" />}
          />
          <Route
            path="/finance/revenue"
            element={isAuthenticated ? <FinanceRevenue /> : <Navigate to="/login" />}
          />
          <Route
            path="/finance/expenses"
            element={isAuthenticated ? <FinanceExpenses /> : <Navigate to="/login" />}
          />
          <Route
            path="/finance/reports"
            element={isAuthenticated ? <FinanceReports /> : <Navigate to="/login" />}
          />
          <Route
            path="/"
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
          />
        </Routes>
      </div>
    </AuthContext.Provider>
  )
}

export default App
