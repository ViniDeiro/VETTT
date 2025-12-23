import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { useAuth } from '../App'
import { Modal } from '../components/ui/Modal'
import { Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)

  const validateForm = () => {
    const newErrors = {}
    
    if (!email) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido'
    }
    
    if (!password) {
      newErrors.password = 'Senha é obrigatória'
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      const success = login({ email, password })
      
      if (success) {
        navigate('/dashboard')
      } else {
        setErrors({ general: 'Credenciais inválidas' })
      }
      
      setIsLoading(false)
    }, 1000)
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
                  Acesse sua conta para continuar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <Button className="w-full rounded-xl bg-white text-gray-900 hover:bg-gray-100">Entrar com Google</Button>
                  <Button className="w-full rounded-xl bg-white text-gray-900 hover:bg-gray-100">Entrar com Apple</Button>
                </div>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10"></span>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-card text-white/70">ou</span>
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errors.general && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                      {errors.general}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-2 px-2 text-white/70 hover:text-white"
                        onClick={() => setShowPassword(v => !v)}
                        aria-label="Mostrar senha"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-white/80">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                      />
                      Lembrar-me
                    </label>
                    <button
                      type="button"
                      className="text-sm text-cyan-300 hover:text-cyan-200"
                      onClick={() => setForgotOpen(true)}
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full rounded-xl" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
                <div className="mt-6 p-4 rounded-2xl bg-white/5 ring-1 ring-white/10">
                  <p className="text-sm text-white/80 mb-2">Credenciais de teste:</p>
                  <p className="text-xs text-white/70">Email: admin@vettooth.com</p>
                  <p className="text-xs text-white/70">Senha: 123456</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Modal
        isOpen={forgotOpen}
        onClose={() => { setForgotOpen(false); setResetSent(false); setResetEmail('') }}
        title="Recuperar senha"
        className="bg-white/90 backdrop-blur-xl"
      >
        {resetSent ? (
          <div className="space-y-3">
            <p className="text-sm">Se existir uma conta para <span className="font-medium">{resetEmail}</span>, enviaremos um link de redefinição.</p>
            <Button onClick={() => { setForgotOpen(false); setResetSent(false); setResetEmail('') }}>Fechar</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resetEmail">Email</Label>
              <Input
                id="resetEmail"
                type="email"
                placeholder="seu@email.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => { setForgotOpen(false); setResetEmail('') }}>Cancelar</Button>
              <Button onClick={() => setResetSent(true)}>Enviar link</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
