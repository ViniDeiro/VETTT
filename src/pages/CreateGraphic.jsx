import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'

// Step components
import SelectPatient from '../components/graphic-flow/SelectPatient'
import SelectTeam from '../components/graphic-flow/SelectTeam'
import Odontogram from '../components/graphic-flow/Odontogram'
import AddNotes from '../components/graphic-flow/AddNotes'
import Review from '../components/graphic-flow/Review'
import Billing from '../components/graphic-flow/Billing'

const steps = [
  { id: 1, title: 'Selecionar Paciente', component: SelectPatient },
  { id: 2, title: 'Equipe e Veterinário', component: SelectTeam },
  { id: 3, title: 'Odontograma', component: Odontogram },
  { id: 4, title: 'Notas e Problemas', component: AddNotes },
  { id: 5, title: 'Revisão', component: Review },
  { id: 6, title: 'Finalização e Cobrança', component: Billing }
]

export default function CreateGraphic() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [graphicData, setGraphicData] = useState({
    patient: null,
    team: null,
    veterinarian: null,
    sedation: null,
    odontogram: {},
    notes: [],
    problems: [],
    procedures: [],
    totalCost: 0,
    isCompleted: false
  })

  const currentStepData = steps.find(step => step.id === currentStep)
  const CurrentStepComponent = currentStepData.component

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepClick = (stepId) => {
    setCurrentStep(stepId)
  }

  const updateGraphicData = (newData) => {
    setGraphicData(prev => ({ ...prev, ...newData }))
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return graphicData.patient !== null
      case 2:
        return graphicData.team !== null && graphicData.veterinarian !== null
      case 3:
        return Object.keys(graphicData.odontogram).length > 0
      case 4:
        return graphicData.notes.length > 0 || graphicData.problems.length > 0
      case 5:
        return true // Review step is always valid
      case 6:
        return true // Billing step is always valid
      default:
        return false
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Criar Novo Gráfico</h1>
          <p className="text-gray-600 mt-2">Siga os passos para criar um novo gráfico dental</p>
        </div>

        {/* Progress Steps */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => handleStepClick(step.id)}
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                      step.id === currentStep
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : step.id < currentStep
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-gray-300 bg-white text-gray-500'
                    }`}
                  >
                    {step.id < currentStep ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </button>
                  
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-medium ${
                      step.id === currentStep
                        ? 'text-blue-600'
                        : step.id < currentStep
                        ? 'text-green-600'
                        : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={`hidden sm:block w-12 h-0.5 mx-4 ${
                      step.id < currentStep ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white text-sm font-medium">
                {currentStep}
              </span>
              {currentStepData.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <CurrentStepComponent
              data={graphicData}
              onUpdate={updateGraphicData}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          
          <div className="flex gap-2">
            {currentStep < steps.length ? (
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="flex items-center gap-2"
              >
                Próximo
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={() => {
                  // Handle completion
                  updateGraphicData({ isCompleted: true })
                  alert('Gráfico criado com sucesso!')
                  // Redirect to dashboard
                  navigate('/dashboard')
                }}
                disabled={!isStepValid()}
                className="bg-green-600 hover:bg-green-700"
              >
                Finalizar
              </Button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}