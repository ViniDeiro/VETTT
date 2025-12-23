import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Select } from '../ui/Select'
import { Label } from '../ui/Label'
import { User, Heart } from 'lucide-react'

export default function SelectPatient({ data, onUpdate }) {
  const [selectedClient, setSelectedClient] = useState(data.patient?.clientId || '')
  const [selectedHorse, setSelectedHorse] = useState(data.patient?.horseId || '')

  // Mock data - in a real app, this would come from your state management
  const clients = [
    { id: 1, name: 'João Silva' },
    { id: 2, name: 'Maria Santos' },
    { id: 3, name: 'Pedro Costa' }
  ]

  const horses = [
    { id: 1, name: 'Thunder', breed: 'Puro Sangue Inglês', age: 5, clientId: 1 },
    { id: 2, name: 'Lightning', breed: 'Quarto de Milha', age: 3, clientId: 1 },
    { id: 3, name: 'Relâmpago', breed: 'Mangalarga', age: 7, clientId: 2 },
    { id: 4, name: 'Estrela', breed: 'Crioulo', age: 4, clientId: 3 }
  ]

  const availableHorses = selectedClient 
    ? horses.filter(horse => horse.clientId === parseInt(selectedClient))
    : []

  const selectedClientData = clients.find(c => c.id === parseInt(selectedClient))
  const selectedHorseData = horses.find(h => h.id === parseInt(selectedHorse))

  const handleClientChange = (clientId) => {
    setSelectedClient(clientId)
    setSelectedHorse('') // Reset horse selection when client changes
    
    if (clientId) {
      const client = clients.find(c => c.id === parseInt(clientId))
      onUpdate({
        patient: {
          clientId: parseInt(clientId),
          clientName: client.name,
          horseId: null,
          horseName: null,
          horseBreed: null,
          horseAge: null
        }
      })
    } else {
      onUpdate({ patient: null })
    }
  }

  const handleHorseChange = (horseId) => {
    setSelectedHorse(horseId)
    
    if (horseId && selectedClient) {
      const client = clients.find(c => c.id === parseInt(selectedClient))
      const horse = horses.find(h => h.id === parseInt(horseId))
      
      onUpdate({
        patient: {
          clientId: parseInt(selectedClient),
          clientName: client.name,
          horseId: parseInt(horseId),
          horseName: horse.name,
          horseBreed: horse.breed,
          horseAge: horse.age
        }
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Selecione o Cliente e o Cavalo
        </h3>
        <p className="text-gray-600">
          Escolha o cliente proprietário e o cavalo que receberá o tratamento dental
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Client Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="client">Selecionar Cliente</Label>
                <Select
                  id="client"
                  value={selectedClient}
                  onChange={(e) => handleClientChange(e.target.value)}
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </Select>
              </div>

              {selectedClientData && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">Cliente Selecionado</h4>
                  <p className="text-blue-700">{selectedClientData.name}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Horse Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Cavalo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="horse">Selecionar Cavalo</Label>
                <Select
                  id="horse"
                  value={selectedHorse}
                  onChange={(e) => handleHorseChange(e.target.value)}
                  disabled={!selectedClient}
                >
                  <option value="">
                    {selectedClient ? 'Selecione um cavalo' : 'Primeiro selecione um cliente'}
                  </option>
                  {availableHorses.map((horse) => (
                    <option key={horse.id} value={horse.id}>
                      {horse.name} - {horse.breed}
                    </option>
                  ))}
                </Select>
              </div>

              {selectedHorseData && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900">Cavalo Selecionado</h4>
                  <div className="text-green-700 space-y-1">
                    <p><span className="font-medium">Nome:</span> {selectedHorseData.name}</p>
                    <p><span className="font-medium">Raça:</span> {selectedHorseData.breed}</p>
                    <p><span className="font-medium">Idade:</span> {selectedHorseData.age} anos</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      {data.patient && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-green-500 text-white rounded-full">
                ✓
              </div>
              <div>
                <h4 className="font-semibold text-green-900">Paciente Selecionado</h4>
                <p className="text-green-700">
                  <span className="font-medium">{data.patient.horseName}</span> 
                  {' '}({data.patient.horseBreed}) - Proprietário: {data.patient.clientName}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
