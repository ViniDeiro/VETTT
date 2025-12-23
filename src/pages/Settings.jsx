import React, { useState } from 'react'
import Layout from '../components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { 
  Building, 
  FileText, 
  Database,
  Save,
  Upload,
  Download,
  Settings as SettingsIcon
} from 'lucide-react'

export default function Settings() {
  const [clinicData, setClinicData] = useState({
    name: 'Clínica Veterinária VetTooth',
    address: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
    phone: '(11) 99999-9999',
    email: 'contato@vettooth.com.br',
    website: 'www.vettooth.com.br',
    crmv: 'CRMV-SP 12345',
    logo: null
  })

  const [procedures, setProcedures] = useState([
    { id: 1, name: 'Limpeza Dental', cost: 150.00, duration: '30 min' },
    { id: 2, name: 'Extração Simples', cost: 200.00, duration: '45 min' },
    { id: 3, name: 'Extração Complexa', cost: 350.00, duration: '90 min' },
    { id: 4, name: 'Tratamento de Canal', cost: 500.00, duration: '120 min' },
    { id: 5, name: 'Radiografia Dental', cost: 80.00, duration: '15 min' },
    { id: 6, name: 'Restauração', cost: 250.00, duration: '60 min' }
  ])

  const [sedationTypes, setSedationTypes] = useState([
    { id: 1, name: 'Xilazina', dosage: '1.1 mg/kg IV', notes: 'Sedação leve a moderada' },
    { id: 2, name: 'Detomidina', dosage: '0.01-0.02 mg/kg IV', notes: 'Sedação profunda' },
    { id: 3, name: 'Acepromazina', dosage: '0.03-0.1 mg/kg IM', notes: 'Tranquilização' },
    { id: 4, name: 'Butorfanol', dosage: '0.1-0.2 mg/kg IV', notes: 'Analgesia e sedação' }
  ])

  const [newProcedure, setNewProcedure] = useState({ name: '', cost: '', duration: '' })
  const [newSedation, setNewSedation] = useState({ name: '', dosage: '', notes: '' })
  const [isSaving, setIsSaving] = useState(false)

  const handleClinicDataChange = (field, value) => {
    setClinicData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    // Simulate saving
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    alert('Configurações salvas com sucesso!')
  }

  const addProcedure = () => {
    if (newProcedure.name && newProcedure.cost) {
      setProcedures(prev => [...prev, {
        id: Math.max(...prev.map(p => p.id)) + 1,
        ...newProcedure,
        cost: parseFloat(newProcedure.cost)
      }])
      setNewProcedure({ name: '', cost: '', duration: '' })
    }
  }

  const removeProcedure = (id) => {
    setProcedures(prev => prev.filter(p => p.id !== id))
  }

  const addSedation = () => {
    if (newSedation.name && newSedation.dosage) {
      setSedationTypes(prev => [...prev, {
        id: Math.max(...prev.map(s => s.id)) + 1,
        ...newSedation
      }])
      setNewSedation({ name: '', dosage: '', notes: '' })
    }
  }

  const removeSedation = (id) => {
    setSedationTypes(prev => prev.filter(s => s.id !== id))
  }

  const exportData = () => {
    const data = {
      clinic: clinicData,
      procedures,
      sedationTypes,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'vettooth-settings.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-600">Gerencie as configurações da clínica e dados predefinidos</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportData} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar Dados
            </Button>
            <Button 
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar Configurações
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Clinic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Informações da Clínica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="clinicName">Nome da Clínica</Label>
                <Input
                  id="clinicName"
                  value={clinicData.name}
                  onChange={(e) => handleClinicDataChange('name', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={clinicData.phone}
                    onChange={(e) => handleClinicDataChange('phone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={clinicData.email}
                    onChange={(e) => handleClinicDataChange('email', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={clinicData.address}
                  onChange={(e) => handleClinicDataChange('address', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={clinicData.city}
                    onChange={(e) => handleClinicDataChange('city', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={clinicData.state}
                    onChange={(e) => handleClinicDataChange('state', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input
                    id="zipCode"
                    value={clinicData.zipCode}
                    onChange={(e) => handleClinicDataChange('zipCode', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={clinicData.website}
                    onChange={(e) => handleClinicDataChange('website', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="crmv">CRMV</Label>
                  <Input
                    id="crmv"
                    value={clinicData.crmv}
                    onChange={(e) => handleClinicDataChange('crmv', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="logo">Logo da Clínica</Label>
                <div className="mt-1 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    {clinicData.logo ? (
                      <img src={clinicData.logo} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Building className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Fazer Upload
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Preferências do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tema da Interface</Label>
                <div className="mt-2 space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="theme" value="light" defaultChecked />
                    <span className="text-sm">Claro</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="theme" value="dark" />
                    <span className="text-sm">Escuro</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="theme" value="auto" />
                    <span className="text-sm">Automático</span>
                  </label>
                </div>
              </div>

              <div>
                <Label>Formato de Data</Label>
                <select className="mt-1 w-full px-3 py-2 rounded-md border border-input bg-background text-foreground">
                  <option value="dd/mm/yyyy">DD/MM/AAAA</option>
                  <option value="mm/dd/yyyy">MM/DD/AAAA</option>
                  <option value="yyyy-mm-dd">AAAA-MM-DD</option>
                </select>
              </div>

              <div>
                <Label>Moeda</Label>
                <select className="mt-1 w-full px-3 py-2 rounded-md border border-input bg-background text-foreground">
                  <option value="BRL">Real Brasileiro (R$)</option>
                  <option value="USD">Dólar Americano ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>

              <div>
                <Label>Idioma</Label>
                <select className="mt-1 w-full px-3 py-2 rounded-md border border-input bg-background text-foreground">
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Notificações</Label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">Notificar sobre novos agendamentos</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">Lembrar de pagamentos pendentes</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  <span className="text-sm">Backup automático diário</span>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Procedures Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Procedimentos Predefinidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Add New Procedure */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <Input
                  placeholder="Nome do procedimento"
                  value={newProcedure.name}
                  onChange={(e) => setNewProcedure(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Custo (R$)"
                  value={newProcedure.cost}
                  onChange={(e) => setNewProcedure(prev => ({ ...prev, cost: e.target.value }))}
                />
                <Input
                  placeholder="Duração"
                  value={newProcedure.duration}
                  onChange={(e) => setNewProcedure(prev => ({ ...prev, duration: e.target.value }))}
                />
                <Button onClick={addProcedure}>Adicionar</Button>
              </div>

              {/* Procedures List */}
              <div className="space-y-2">
                {procedures.map((procedure) => (
                  <div key={procedure.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1 grid grid-cols-3 gap-4">
                      <span className="font-medium">{procedure.name}</span>
                      <span>R$ {procedure.cost.toFixed(2)}</span>
                      <span className="text-gray-600">{procedure.duration}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeProcedure(procedure.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remover
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sedation Types Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Protocolos de Sedação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Add New Sedation */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <Input
                  placeholder="Nome do medicamento"
                  value={newSedation.name}
                  onChange={(e) => setNewSedation(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  placeholder="Dosagem"
                  value={newSedation.dosage}
                  onChange={(e) => setNewSedation(prev => ({ ...prev, dosage: e.target.value }))}
                />
                <Input
                  placeholder="Observações"
                  value={newSedation.notes}
                  onChange={(e) => setNewSedation(prev => ({ ...prev, notes: e.target.value }))}
                />
                <Button onClick={addSedation}>Adicionar</Button>
              </div>

              {/* Sedation List */}
              <div className="space-y-2">
                {sedationTypes.map((sedation) => (
                  <div key={sedation.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1 grid grid-cols-3 gap-4">
                      <span className="font-medium">{sedation.name}</span>
                      <span className="text-blue-600">{sedation.dosage}</span>
                      <span className="text-gray-600">{sedation.notes}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeSedation(sedation.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remover
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
