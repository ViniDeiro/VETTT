import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Select } from '../components/ui/Select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { useAuth } from '../modules/auth/AuthContext'
import { Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [clinicName, setClinicName] = useState('')
  const [role, setRole] = useState('admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const switchMode = (nextMode) => {
    setMode(nextMode)
    setError('')
    setSuccessMessage('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setIsLoading(true)

    try {
      if (mode === 'register') {
        if (!name.trim()) {
          setError('Informe seu nome para criar a conta.')
          return
        }

        const result = await register({
          name: name.trim(),
          clinicName: clinicName.trim(),
          role,
          email: email.trim(),
          password
        })

        if (result.success && !result.needsEmailConfirmation) {
          navigate('/dashboard')
          return
        }

        if (result.success) {
          setSuccessMessage(result.message || 'Cadastro criado. Agora voce ja pode entrar.')
          setMode('login')
          return
        }

        setError(result.message || 'Nao foi possivel criar a conta.')
        return
      }

      const success = await login(email.trim(), password)
      if (success) {
        navigate('/dashboard')
      } else {
        setError('Credenciais invalidas ou usuario inativo.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 font-sans">
      <div className="grid lg:grid-cols-2 min-h-screen">
        <div className="hidden lg:block relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-cyan-800/20 to-teal-700/20"></div>
          <div className="absolute inset-0 opacity-30" style={{backgroundImage:'radial-gradient(circle at 20% 20%, rgba(255,255,255,.1) 0, transparent 40%), radial-gradient(circle at 80% 30%, rgba(255,255,255,.07) 0, transparent 45%)'}}></div>
          <div className="relative z-10 h-full flex items-center px-12">
            <div className="max-w-xl space-y-6">
              <h1 className="text-5xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-200 bg-clip-text text-transparent italic">Vet Tooth</span>
              </h1>
              <p className="text-white/80 text-xl font-medium tracking-wide">Plataforma moderna de gestao odontologica veterinaria</p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur-xl p-6 border border-white/5 shadow-2xl">
                  <p className="text-white text-sm font-bold uppercase tracking-widest opacity-60">Odontograma</p>
                  <p className="text-white/90 text-sm mt-2">Visao 3D e acompanhamento clinico detalhado</p>
                </div>
                <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur-xl p-6 border border-white/5 shadow-2xl">
                  <p className="text-white text-sm font-bold uppercase tracking-widest opacity-60">Operacoes</p>
                  <p className="text-white/90 text-sm mt-2">Faturamento inteligente e agenda unificada</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8 lg:hidden">
              <h1 className="text-4xl font-bold mb-2 tracking-tight">
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-200 bg-clip-text text-transparent italic">Vet Tooth</span>
              </h1>
              <p className="text-white/70">Gestao Odontologica Veterinaria</p>
            </div>

            <Card className="border-white/5 bg-slate-900/50 backdrop-blur-md shadow-2xl ring-1 ring-white/10">
              <CardHeader className="space-y-4">
                <div className="grid grid-cols-2 rounded-lg bg-slate-950/70 p-1 ring-1 ring-white/10">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className={`h-9 rounded-md text-sm font-semibold transition-colors ${mode === 'login' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    Entrar
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className={`h-9 rounded-md text-sm font-semibold transition-colors ${mode === 'register' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    Criar conta
                  </button>
                </div>
                <div>
                  <CardTitle className="text-2xl text-white font-bold">
                    {mode === 'login' ? 'Entrar' : 'Criar conta'}
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    {mode === 'login' ? 'Digite suas credenciais para acessar o sistema' : 'Crie o primeiro acesso da sua clinica'}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium animate-in fade-in slide-in-from-top-1">
                      {error}
                    </div>
                  )}

                  {successMessage && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium animate-in fade-in slide-in-from-top-1">
                      {successMessage}
                    </div>
                  )}

                  {mode === 'register' && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-slate-300">Nome</Label>
                        <Input
                          type="text"
                          placeholder="Seu nome"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-300">Clinica</Label>
                        <Input
                          type="text"
                          placeholder="Nome da clinica"
                          value={clinicName}
                          onChange={(e) => setClinicName(e.target.value)}
                          className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-300">Tipo de acesso</Label>
                        <Select
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="bg-slate-950/50 border-white/10 text-white focus:ring-blue-500"
                        >
                          <option value="admin">Administrador</option>
                          <option value="vet">Veterinario</option>
                          <option value="secretary">Secretaria</option>
                        </Select>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label className="text-slate-300">E-mail</Label>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-slate-300">Senha</Label>
                    </div>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 pr-10 focus:ring-blue-500"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold h-11 shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98]"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processando...' : mode === 'login' ? 'Acessar Sistema' : 'Criar conta'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

