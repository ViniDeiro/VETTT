import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { User, Heart, Stethoscope, FileText, AlertTriangle, Clipboard } from 'lucide-react'

export default function Review({ data }) {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const noteCategories = {
    general: { name: 'Geral', color: 'bg-blue-100 text-blue-800' },
    anesthesia: { name: 'Anestesia', color: 'bg-purple-100 text-purple-800' },
    behavior: { name: 'Comportamento', color: 'bg-green-100 text-green-800' },
    complications: { name: 'Complicações', color: 'bg-red-100 text-red-800' },
    followup: { name: 'Acompanhamento', color: 'bg-yellow-100 text-yellow-800' }
  }

  const getOdontogramSummary = () => {
    const conditions = {}
    Object.values(data.odontogram || {}).forEach(tooth => {
      conditions[tooth.condition] = (conditions[tooth.condition] || 0) + 1
    })
    return conditions
  }

  const odontogramSummary = getOdontogramSummary()
  const totalCost = (data.procedures || []).reduce((sum, proc) => sum + parseFloat(proc.cost || 0), 0)

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Revisão do Gráfico Dental
        </h3>
        <p className="text-gray-600">
          Revise todas as informações antes de finalizar o gráfico
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações do Paciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.patient ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Heart className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{data.patient.horseName}</p>
                    <p className="text-sm text-gray-600">
                      {data.patient.horseBreed} • {data.patient.horseAge} anos
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Proprietário</p>
                    <p className="text-sm text-gray-600">{data.patient.clientName}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Nenhum paciente selecionado</p>
            )}
          </CardContent>
        </Card>

        {/* Team Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Equipe e Sedação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.veterinarian && (
                <div>
                  <p className="font-medium text-sm text-gray-700">Veterinário Responsável</p>
                  <p className="text-sm">{data.veterinarian.name}</p>
                  <p className="text-xs text-gray-600">{data.veterinarian.crmv} • {data.veterinarian.specialty}</p>
                </div>
              )}

              {data.team && data.team.count > 0 && (
                <div>
                  <p className="font-medium text-sm text-gray-700">Equipe de Apoio</p>
                  <div className="space-y-1">
                    {data.team.members.map((member) => (
                      <p key={member.id} className="text-sm">
                        {member.name} - <span className="text-gray-600">{member.role}</span>
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {data.sedation && data.sedation.type && (
                <div>
                  <p className="font-medium text-sm text-gray-700">Protocolo de Sedação</p>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Tipo:</span> {data.sedation.type}</p>
                    {data.sedation.dosage && <p><span className="font-medium">Dosagem:</span> {data.sedation.dosage}</p>}
                    {data.sedation.notes && <p><span className="font-medium">Observações:</span> {data.sedation.notes}</p>}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Odontogram Summary */}
      {Object.keys(data.odontogram || {}).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clipboard className="h-5 w-5" />
              Resumo do Odontograma
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(odontogramSummary).map(([condition, count]) => {
                const conditionNames = {
                  normal: 'Normal',
                  caries: 'Cárie',
                  fracture: 'Fratura',
                  missing: 'Ausente',
                  restoration: 'Restauração',
                  extraction: 'Extração',
                  treatment: 'Tratamento',
                  observation: 'Observação'
                }
                
                return (
                  <div key={condition} className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                    <p className="text-sm text-gray-600">{conditionNames[condition] || condition}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clinical Notes */}
        {data.notes && data.notes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Notas Clínicas ({data.notes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {data.notes.map((note) => {
                  const category = noteCategories[note.category]
                  return (
                    <div key={note.id} className="p-3 border rounded-lg">
                      <h4 className="font-medium text-sm mb-1">{note.title}</h4>
                      <p className="text-xs text-gray-600 mb-2">{note.content}</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs ${category?.color}`}>
                        {category?.name}
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dental Problems */}
        {data.problems && data.problems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Problemas Dentais ({data.problems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {data.problems.map((problem) => (
                  <div key={problem.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">Dente {problem.tooth}</h4>
                      <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(problem.severity)}`}>
                        {problem.severity === 'low' ? 'Baixa' : problem.severity === 'medium' ? 'Média' : 'Alta'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-800 mb-1">{problem.problem}</p>
                    {problem.description && (
                      <p className="text-xs text-gray-600">{problem.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Procedures */}
        {data.procedures && data.procedures.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clipboard className="h-5 w-5" />
                Procedimentos ({data.procedures.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {data.procedures.map((procedure) => (
                  <div key={procedure.id} className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm mb-1">{procedure.name}</h4>
                    {procedure.description && (
                      <p className="text-xs text-gray-600 mb-2">{procedure.description}</p>
                    )}
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">R$ {procedure.cost}</span>
                      <span className="text-gray-600">{procedure.duration}</span>
                    </div>
                  </div>
                ))}
                
                {totalCost > 0 && (
                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">Total:</span>
                      <span className="font-bold text-lg text-green-600">
                        R$ {totalCost.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Completion Status */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="text-center">
            <h4 className="font-semibold text-blue-900 mb-2">Gráfico Pronto para Finalização</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div className="text-center">
                <p className="font-medium text-blue-800">Paciente</p>
                <p className="text-blue-600">{data.patient ? '✓' : '✗'}</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-blue-800">Equipe</p>
                <p className="text-blue-600">{data.veterinarian ? '✓' : '✗'}</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-blue-800">Odontograma</p>
                <p className="text-blue-600">{Object.keys(data.odontogram || {}).length > 0 ? '✓' : '✗'}</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-blue-800">Documentação</p>
                <p className="text-blue-600">
                  {(data.notes?.length || 0) + (data.problems?.length || 0) > 0 ? '✓' : '✗'}
                </p>
              </div>
              <div className="text-center">
                <p className="font-medium text-blue-800">Procedimentos</p>
                <p className="text-blue-600">{data.procedures?.length > 0 ? '✓' : '✗'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
