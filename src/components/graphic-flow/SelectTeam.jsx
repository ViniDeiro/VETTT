import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Select } from '../ui/Select'
import { Label } from '../ui/Label'
import { Input } from '../ui/Input'
import { Stethoscope, Users, Syringe } from 'lucide-react'

export default function SelectTeam({ data, onUpdate }) {
  const [selectedVeterinarian, setSelectedVeterinarian] = useState(data.veterinarian?.id || '')
  const [selectedTeam, setSelectedTeam] = useState(data.team?.members || [])
  const [sedationType, setSedationType] = useState(data.sedation?.type || '')
  const [sedationDosage, setSedationDosage] = useState(data.sedation?.dosage || '')
  const [sedationNotes, setSedationNotes] = useState(data.sedation?.notes || '')

  // Mock data
  const veterinarians = [
    {
      id: 1,
      name: 'Dr. Ana Paula Oliveira',
      crmv: 'CRMV-SP 12345',
      specialty: 'Odontologia Equina'
    },
    {
      id: 2,
      name: 'Dr. Carlos Eduardo Santos',
      crmv: 'CRMV-RJ 67890',
      specialty: 'Cirurgia Equina'
    },
    {
      id: 3,
      name: 'Dra. Fernanda Lima',
      crmv: 'CRMV-MG 11111',
      specialty: 'Clínica Geral Equina'
    }
  ]

  const teamMembers = [
    { id: 1, name: 'João Silva', role: 'Técnico Veterinário' },
    { id: 2, name: 'Maria Santos', role: 'Auxiliar Veterinário' },
    { id: 3, name: 'Pedro Costa', role: 'Anestesista' },
    { id: 4, name: 'Ana Rodrigues', role: 'Técnico em Radiologia' }
  ]

  const sedationTypes = [
    'Detomidina',
    'Xilazina',
    'Romifidina',
    'Acepromazina',
    'Butorfanol',
    'Combinação (especificar nas notas)'
  ]

  const handleVeterinarianChange = (vetId) => {
    setSelectedVeterinarian(vetId)
    const vet = veterinarians.find(v => v.id === parseInt(vetId))
    
    onUpdate({
      veterinarian: vet ? {
        id: vet.id,
        name: vet.name,
        crmv: vet.crmv,
        specialty: vet.specialty
      } : null
    })
  }

  const handleTeamMemberToggle = (memberId) => {
    const member = teamMembers.find(m => m.id === memberId)
    const isSelected = selectedTeam.some(m => m.id === memberId)
    
    let newTeam
    if (isSelected) {
      newTeam = selectedTeam.filter(m => m.id !== memberId)
    } else {
      newTeam = [...selectedTeam, member]
    }
    
    setSelectedTeam(newTeam)
    onUpdate({
      team: {
        members: newTeam,
        count: newTeam.length
      }
    })
  }

  const handleSedationChange = (field, value) => {
    const newSedation = {
      type: field === 'type' ? value : sedationType,
      dosage: field === 'dosage' ? value : sedationDosage,
      notes: field === 'notes' ? value : sedationNotes
    }

    if (field === 'type') setSedationType(value)
    if (field === 'dosage') setSedationDosage(value)
    if (field === 'notes') setSedationNotes(value)

    onUpdate({ sedation: newSedation })
  }

  const selectedVet = veterinarians.find(v => v.id === parseInt(selectedVeterinarian))

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Equipe e Protocolo de Sedação
        </h3>
        <p className="text-gray-600">
          Selecione o veterinário responsável, equipe de apoio e protocolo de sedação
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Veterinarian Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Veterinário Responsável
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="veterinarian">Selecionar Veterinário</Label>
                <Select
                  id="veterinarian"
                  value={selectedVeterinarian}
                  onChange={(e) => handleVeterinarianChange(e.target.value)}
                >
                  <option value="">Selecione um veterinário</option>
                  {veterinarians.map((vet) => (
                    <option key={vet.id} value={vet.id}>
                      {vet.name} - {vet.specialty}
                    </option>
                  ))}
                </Select>
              </div>

              {selectedVet && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">{selectedVet.name}</h4>
                  <p className="text-blue-700 text-sm">{selectedVet.crmv}</p>
                  <p className="text-blue-700 text-sm">{selectedVet.specialty}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Team Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Equipe de Apoio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Label>Selecionar Membros da Equipe</Label>
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={`member-${member.id}`}
                    checked={selectedTeam.some(m => m.id === member.id)}
                    onChange={() => handleTeamMemberToggle(member.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={`member-${member.id}`} className="flex-1 cursor-pointer">
                    <div className="text-sm font-medium text-gray-900">{member.name}</div>
                    <div className="text-xs text-gray-500">{member.role}</div>
                  </label>
                </div>
              ))}

              {selectedTeam.length > 0 && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-900">
                    {selectedTeam.length} membro(s) selecionado(s)
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sedation Protocol */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Syringe className="h-5 w-5" />
            Protocolo de Sedação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="sedationType">Tipo de Sedação</Label>
              <Select
                id="sedationType"
                value={sedationType}
                onChange={(e) => handleSedationChange('type', e.target.value)}
              >
                <option value="">Selecione o tipo</option>
                {sedationTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="sedationDosage">Dosagem</Label>
              <Input
                id="sedationDosage"
                value={sedationDosage}
                onChange={(e) => handleSedationChange('dosage', e.target.value)}
                placeholder="Ex: 0.5 mg/kg IV"
              />
            </div>

            <div>
              <Label htmlFor="sedationNotes">Observações</Label>
              <Input
                id="sedationNotes"
                value={sedationNotes}
                onChange={(e) => handleSedationChange('notes', e.target.value)}
                placeholder="Notas adicionais"
              />
            </div>
          </div>

          {sedationType && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-900">Protocolo Selecionado</h4>
              <div className="text-yellow-700 text-sm space-y-1">
                <p><span className="font-medium">Sedação:</span> {sedationType}</p>
                {sedationDosage && <p><span className="font-medium">Dosagem:</span> {sedationDosage}</p>}
                {sedationNotes && <p><span className="font-medium">Observações:</span> {sedationNotes}</p>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {data.veterinarian && data.team && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-green-500 text-white rounded-full">
                ✓
              </div>
              <div>
                <h4 className="font-semibold text-green-900">Equipe Configurada</h4>
                <p className="text-green-700">
                  Veterinário: <span className="font-medium">{data.veterinarian.name}</span>
                  {data.team.count > 0 && (
                    <span> • Equipe: {data.team.count} membro(s)</span>
                  )}
                  {data.sedation?.type && (
                    <span> • Sedação: {data.sedation.type}</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
