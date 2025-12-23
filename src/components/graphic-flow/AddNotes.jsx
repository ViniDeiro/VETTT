import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { Modal } from '../ui/Modal'
import { FileText, AlertTriangle, Plus, Edit, Trash2 } from 'lucide-react'

export default function AddNotes({ data, onUpdate }) {
  const [notes, setNotes] = useState(data.notes || [])
  const [problems, setProblems] = useState(data.problems || [])
  const [procedures, setProcedures] = useState(data.procedures || [])
  
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const [isProblemModalOpen, setIsProblemModalOpen] = useState(false)
  const [isProcedureModalOpen, setIsProcedureModalOpen] = useState(false)
  
  const [editingNote, setEditingNote] = useState(null)
  const [editingProblem, setEditingProblem] = useState(null)
  const [editingProcedure, setEditingProcedure] = useState(null)
  
  const [noteForm, setNoteForm] = useState({ title: '', content: '', category: 'general' })
  const [problemForm, setProblemForm] = useState({ tooth: '', problem: '', severity: 'low', description: '' })
  const [procedureForm, setProcedureForm] = useState({ name: '', description: '', cost: '', duration: '' })

  const noteCategories = [
    { id: 'general', name: 'Geral', color: 'bg-blue-100 text-blue-800' },
    { id: 'anesthesia', name: 'Anestesia', color: 'bg-purple-100 text-purple-800' },
    { id: 'behavior', name: 'Comportamento', color: 'bg-green-100 text-green-800' },
    { id: 'complications', name: 'Complicações', color: 'bg-red-100 text-red-800' },
    { id: 'followup', name: 'Acompanhamento', color: 'bg-yellow-100 text-yellow-800' }
  ]

  const commonProblems = [
    'Cárie dental',
    'Fratura dental',
    'Doença periodontal',
    'Tártaro excessivo',
    'Má oclusão',
    'Dente supranumerário',
    'Retenção de dente decíduo',
    'Abscesso dental',
    'Gengivite',
    'Ulceração oral'
  ]

  const commonProcedures = [
    { name: 'Limpeza dental', cost: '200.00', duration: '30 min' },
    { name: 'Extração dental', cost: '350.00', duration: '45 min' },
    { name: 'Tratamento de canal', cost: '800.00', duration: '90 min' },
    { name: 'Restauração dental', cost: '450.00', duration: '60 min' },
    { name: 'Polimento dental', cost: '150.00', duration: '20 min' },
    { name: 'Radiografia dental', cost: '120.00', duration: '15 min' }
  ]

  // Note functions
  const handleAddNote = () => {
    setEditingNote(null)
    setNoteForm({ title: '', content: '', category: 'general' })
    setIsNoteModalOpen(true)
  }

  const handleEditNote = (note) => {
    setEditingNote(note)
    setNoteForm({ title: note.title, content: note.content, category: note.category })
    setIsNoteModalOpen(true)
  }

  const handleSaveNote = () => {
    const newNote = {
      id: editingNote?.id || Date.now(),
      ...noteForm,
      timestamp: editingNote?.timestamp || new Date().toISOString()
    }

    let updatedNotes
    if (editingNote) {
      updatedNotes = notes.map(note => note.id === editingNote.id ? newNote : note)
    } else {
      updatedNotes = [...notes, newNote]
    }

    setNotes(updatedNotes)
    onUpdate({ notes: updatedNotes })
    setIsNoteModalOpen(false)
  }

  const handleDeleteNote = (noteId) => {
    const updatedNotes = notes.filter(note => note.id !== noteId)
    setNotes(updatedNotes)
    onUpdate({ notes: updatedNotes })
  }

  // Problem functions
  const handleAddProblem = () => {
    setEditingProblem(null)
    setProblemForm({ tooth: '', problem: '', severity: 'low', description: '' })
    setIsProblemModalOpen(true)
  }

  const handleEditProblem = (problem) => {
    setEditingProblem(problem)
    setProblemForm({ tooth: problem.tooth, problem: problem.problem, severity: problem.severity, description: problem.description })
    setIsProblemModalOpen(true)
  }

  const handleSaveProblem = () => {
    const newProblem = {
      id: editingProblem?.id || Date.now(),
      ...problemForm
    }

    let updatedProblems
    if (editingProblem) {
      updatedProblems = problems.map(problem => problem.id === editingProblem.id ? newProblem : problem)
    } else {
      updatedProblems = [...problems, newProblem]
    }

    setProblems(updatedProblems)
    onUpdate({ problems: updatedProblems })
    setIsProblemModalOpen(false)
  }

  const handleDeleteProblem = (problemId) => {
    const updatedProblems = problems.filter(problem => problem.id !== problemId)
    setProblems(updatedProblems)
    onUpdate({ problems: updatedProblems })
  }

  // Procedure functions
  const handleAddProcedure = () => {
    setEditingProcedure(null)
    setProcedureForm({ name: '', description: '', cost: '', duration: '' })
    setIsProcedureModalOpen(true)
  }

  const handleEditProcedure = (procedure) => {
    setEditingProcedure(procedure)
    setProcedureForm({ name: procedure.name, description: procedure.description, cost: procedure.cost, duration: procedure.duration })
    setIsProcedureModalOpen(true)
  }

  const handleSaveProcedure = () => {
    const newProcedure = {
      id: editingProcedure?.id || Date.now(),
      ...procedureForm
    }

    let updatedProcedures
    if (editingProcedure) {
      updatedProcedures = procedures.map(procedure => procedure.id === editingProcedure.id ? newProcedure : procedure)
    } else {
      updatedProcedures = [...procedures, newProcedure]
    }

    setProcedures(updatedProcedures)
    onUpdate({ procedures: updatedProcedures })
    setIsProcedureModalOpen(false)
  }

  const handleDeleteProcedure = (procedureId) => {
    const updatedProcedures = procedures.filter(procedure => procedure.id !== procedureId)
    setProcedures(updatedProcedures)
    onUpdate({ procedures: updatedProcedures })
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Notas Clínicas e Problemas Identificados
        </h3>
        <p className="text-gray-600">
          Documente observações, problemas dentais e procedimentos realizados
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clinical Notes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Notas Clínicas
              </CardTitle>
              <Button size="sm" onClick={handleAddNote}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notes.map((note) => {
                const category = noteCategories.find(c => c.id === note.category)
                return (
                  <div key={note.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{note.title}</h4>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => handleEditNote(note)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDeleteNote(note.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{note.content}</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs ${category?.color}`}>
                      {category?.name}
                    </span>
                  </div>
                )
              })}
              {notes.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">
                  Nenhuma nota adicionada
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dental Problems */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Problemas Dentais
              </CardTitle>
              <Button size="sm" onClick={handleAddProblem}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {problems.map((problem) => (
                <div key={problem.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">Dente {problem.tooth}</h4>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleEditProblem(problem)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDeleteProblem(problem.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-800 mb-2">{problem.problem}</p>
                  {problem.description && (
                    <p className="text-xs text-gray-600 mb-2">{problem.description}</p>
                  )}
                  <span className={`inline-block px-2 py-1 rounded text-xs ${getSeverityColor(problem.severity)}`}>
                    {problem.severity === 'low' ? 'Baixa' : problem.severity === 'medium' ? 'Média' : 'Alta'}
                  </span>
                </div>
              ))}
              {problems.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">
                  Nenhum problema identificado
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Procedures */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Procedimentos
              </CardTitle>
              <Button size="sm" onClick={handleAddProcedure}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {procedures.map((procedure) => (
                <div key={procedure.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{procedure.name}</h4>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleEditProcedure(procedure)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDeleteProcedure(procedure.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  {procedure.description && (
                    <p className="text-xs text-gray-600 mb-2">{procedure.description}</p>
                  )}
                  <div className="flex justify-between text-xs">
                    <span>R$ {procedure.cost}</span>
                    <span>{procedure.duration}</span>
                  </div>
                </div>
              ))}
              {procedures.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">
                  Nenhum procedimento adicionado
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {/* Note Modal */}
      <Modal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        title={editingNote ? 'Editar Nota' : 'Nova Nota'}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="noteTitle">Título</Label>
            <Input
              id="noteTitle"
              value={noteForm.title}
              onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
              placeholder="Título da nota"
            />
          </div>
          <div>
            <Label htmlFor="noteCategory">Categoria</Label>
            <select
              id="noteCategory"
              value={noteForm.category}
              onChange={(e) => setNoteForm({ ...noteForm, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {noteCategories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="noteContent">Conteúdo</Label>
            <textarea
              id="noteContent"
              value={noteForm.content}
              onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
              placeholder="Descreva suas observações..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsNoteModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveNote}>
              Salvar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Problem Modal */}
      <Modal
        isOpen={isProblemModalOpen}
        onClose={() => setIsProblemModalOpen(false)}
        title={editingProblem ? 'Editar Problema' : 'Novo Problema'}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="problemTooth">Dente</Label>
            <Input
              id="problemTooth"
              value={problemForm.tooth}
              onChange={(e) => setProblemForm({ ...problemForm, tooth: e.target.value })}
              placeholder="Ex: 101, 203, etc."
            />
          </div>
          <div>
            <Label htmlFor="problemType">Problema</Label>
            <select
              id="problemType"
              value={problemForm.problem}
              onChange={(e) => setProblemForm({ ...problemForm, problem: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione um problema</option>
              {commonProblems.map((problem) => (
                <option key={problem} value={problem}>{problem}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="problemSeverity">Severidade</Label>
            <select
              id="problemSeverity"
              value={problemForm.severity}
              onChange={(e) => setProblemForm({ ...problemForm, severity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
          </div>
          <div>
            <Label htmlFor="problemDescription">Descrição</Label>
            <textarea
              id="problemDescription"
              value={problemForm.description}
              onChange={(e) => setProblemForm({ ...problemForm, description: e.target.value })}
              placeholder="Descrição detalhada do problema..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsProblemModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveProblem}>
              Salvar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Procedure Modal */}
      <Modal
        isOpen={isProcedureModalOpen}
        onClose={() => setIsProcedureModalOpen(false)}
        title={editingProcedure ? 'Editar Procedimento' : 'Novo Procedimento'}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="procedureName">Nome do Procedimento</Label>
            <select
              id="procedureName"
              value={procedureForm.name}
              onChange={(e) => {
                const selected = commonProcedures.find(p => p.name === e.target.value)
                setProcedureForm({
                  ...procedureForm,
                  name: e.target.value,
                  cost: selected?.cost || procedureForm.cost,
                  duration: selected?.duration || procedureForm.duration
                })
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione um procedimento</option>
              {commonProcedures.map((procedure) => (
                <option key={procedure.name} value={procedure.name}>{procedure.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="procedureDescription">Descrição</Label>
            <textarea
              id="procedureDescription"
              value={procedureForm.description}
              onChange={(e) => setProcedureForm({ ...procedureForm, description: e.target.value })}
              placeholder="Descrição do procedimento..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="procedureCost">Custo (R$)</Label>
              <Input
                id="procedureCost"
                value={procedureForm.cost}
                onChange={(e) => setProcedureForm({ ...procedureForm, cost: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="procedureDuration">Duração</Label>
              <Input
                id="procedureDuration"
                value={procedureForm.duration}
                onChange={(e) => setProcedureForm({ ...procedureForm, duration: e.target.value })}
                placeholder="Ex: 30 min"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsProcedureModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveProcedure}>
              Salvar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Summary */}
      {(notes.length > 0 || problems.length > 0 || procedures.length > 0) && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-green-500 text-white rounded-full">
                ✓
              </div>
              <div>
                <h4 className="font-semibold text-green-900">Documentação Completa</h4>
                <p className="text-green-700">
                  {notes.length} nota(s), {problems.length} problema(s), {procedures.length} procedimento(s)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}