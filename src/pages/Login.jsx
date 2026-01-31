import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { useAuth } from '../modules/auth/AuthContext'
import { Modal } from '../components/ui/Modal'
import { Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = (role) => {
    login(role)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div className="grid lg:grid-cols-2 min-h-screen">
        <div className="hidden lg:block relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-cyan-800/20 to-teal-700/20"></div>
          <div className="absolute inset-0 opacity-30" style={{backgroundImage:'radial-gradient(circle at 20% 20%, rgba(255,255,255,.1) 0, transparent 40%), radial-gradient(circle at 80% 30%, rgba(255,255,255,.07) 0, transparent 45%)'}}></div>
          <div className="relative z-10 h-full flex items-center px-12">
            <div className="max-w-xl space-y-6">
              <h1 className="text-5xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-200 bg-clip-text text-transparent">Vet Tooth</span>
              </h1>
              <p className="text-white/80 text-lg">Plataforma moderna de gestão odontológica veterinária</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur-xl p-4">
                  <p className="text-white text-sm font-medium">Odontograma interativo</p>
                  <p className="text-white/70 text-xs mt-1">Ferramentas avançadas e visão de incisivos</p>
                </div>
                <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur-xl p-4">
                  <p className="text-white text-sm font-medium">Documentação e cobrança</p>
                  <p className="text-white/70 text-xs mt-1">Notas, revisão e faturamento integrado</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center px-6">
          <div className="w-full max-w-md">
            <div className="text-center mb-8 lg:hidden">
              <h1 className="text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-200 bg-clip-text text-transparent">Vet Tooth</span>
              </h1>
              <p className="text-white/70">Sistema de Gestão Odontológica Veterinária</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Entrar</CardTitle>
                <CardDescription>
                  Selecione seu perfil para acessar (Demo)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <Button onClick={() => handleLogin('vet')} className="w-full bg-blue-600 hover:bg-blue-700">
                    Entrar como Veterinário
                  </Button>
                  <Button onClick={() => handleLogin('secretary')} className="w-full bg-green-600 hover:bg-green-700">
                    Entrar como Secretária
                  </Button>
                  <Button onClick={() => handleLogin('admin')} className="w-full bg-purple-600 hover:bg-purple-700">
                    Entrar como Admin
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
