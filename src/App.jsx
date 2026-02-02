import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './modules/auth/AuthContext'
import ErrorBoundary from './components/system/ErrorBoundary'
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

// New Modules
import { PatientWizard } from './modules/patients/PatientWizard'
import { AttendancePage } from './modules/attendance/AttendancePage'
import { InventoryList } from './modules/inventory/InventoryList'
import { ReceivablesList } from './modules/finance/ReceivablesList'

// Re-export useAuth for legacy components that might still reference App
export { useAuth }

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function LoginWrapper() {
  const { user } = useAuth()
  return user ? <Navigate to="/dashboard" /> : <Login />
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<LoginWrapper />} />
            
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            
            {/* New Routes */}
            <Route path="/register" element={<PrivateRoute><PatientWizard /></PrivateRoute>} />
            <Route path="/attendance-new" element={<PrivateRoute><AttendancePage /></PrivateRoute>} />
            <Route path="/inventory-new" element={<PrivateRoute><InventoryList /></PrivateRoute>} />
            <Route path="/finance-receivables" element={<PrivateRoute><ReceivablesList /></PrivateRoute>} />

            {/* Legacy Routes */}
            <Route path="/attendance" element={<PrivateRoute><Attendance /></PrivateRoute>} />
            <Route path="/clients" element={<PrivateRoute><Clients /></PrivateRoute>} />
            <Route path="/horses" element={<PrivateRoute><Horses /></PrivateRoute>} />
            <Route path="/veterinarians" element={<PrivateRoute><Veterinarians /></PrivateRoute>} />
            <Route path="/create-graphic" element={<PrivateRoute><CreateGraphic /></PrivateRoute>} />
            <Route path="/archived-graphics" element={<PrivateRoute><ArchivedGraphics /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            <Route path="/owners/new" element={<PrivateRoute><OwnerCreate /></PrivateRoute>} />
            <Route path="/agenda" element={<PrivateRoute><Agenda /></PrivateRoute>} />
            <Route path="/inventory" element={<PrivateRoute><Inventory /></PrivateRoute>} />
            <Route path="/finance" element={<PrivateRoute><Finance /></PrivateRoute>} />
            <Route path="/finance/revenue" element={<PrivateRoute><FinanceRevenue /></PrivateRoute>} />
            <Route path="/finance/expenses" element={<PrivateRoute><FinanceExpenses /></PrivateRoute>} />
            <Route path="/finance/reports" element={<PrivateRoute><FinanceReports /></PrivateRoute>} />
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
