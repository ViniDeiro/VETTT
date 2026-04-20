import React, { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import {
  Building,
  Download,
  Eye,
  FileText,
  Loader2,
  MessageSquare,
  Palette,
  Plus,
  Save,
  Search,
  Settings as SettingsIcon,
  Shield,
  Trash2,
  Users,
  Workflow
} from 'lucide-react'
import { Modal } from '../components/ui/Modal'
import { mockDB } from '../services/mockDatabase'
import { pdfService } from '../services/pdfService'

const MODULES = [
  ['settings', 'Configurações'],
  ['users', 'Usuários'],
  ['branding', 'Branding'],
  ['finance', 'Financeiro'],
  ['inventory', 'Estoque'],
  ['attendance', 'Atendimento'],
  ['medicalRecords', 'Prontuários'],
  ['agenda', 'Agenda'],
  ['reports', 'Relatórios'],
  ['documents', 'Documentos'],
  ['invoices', 'Notas fiscais'],
  ['whatsapp', 'WhatsApp'],
  ['audit', 'Auditoria'],
  ['patients', 'Pacientes'],
  ['team', 'Equipe']
]

const ACTIONS = [
  ['view', 'Visualizar'],
  ['create', 'Criar'],
  ['edit', 'Editar'],
  ['delete', 'Excluir'],
  ['exportPdf', 'PDF'],
  ['accessFinancial', 'Financeiro'],
  ['accessStock', 'Estoque']
]

const DASHBOARD_INDICATORS = [
  ['faturamento', 'Faturamento'],
  ['ticket_medio', 'Ticket médio'],
  ['lucro', 'Lucro'],
  ['numero_atendimentos', 'Número de atendimentos'],
  ['retorno', 'Retorno'],
  ['estoque_critico', 'Estoque crítico']
]

const PDF_FONT_OPTIONS = [
  ['helvetica', 'Helvetica'],
  ['times', 'Times'],
  ['courier', 'Courier'],
  ['arial', 'Arial'],
  ['times-new-roman', 'Times New Roman'],
  ['courier-new', 'Courier New'],
  ['verdana', 'Verdana'],
  ['georgia', 'Georgia'],
  ['tahoma', 'Tahoma'],
  ['trebuchet-ms', 'Trebuchet MS']
]

const EMPTY_PROCEDURE_FORM = {
  name: '',
  category: '',
  description: '',
  chargePrice: '',
  marginPercent: '',
  duration: '',
  notes: '',
  items: []
}

const EMPTY_USER_FORM = {
  name: '',
  email: '',
  phone: '',
  functionTitle: '',
  role: 'secretary',
  accessProfileId: '',
  status: 'active',
  password: ''
}

const EMPTY_TEAM_FORM = {
  name: '',
  functionTitle: '',
  specialty: '',
  crmv: '',
  cpf: '',
  phone: '',
  email: '',
  signature: '',
  photo: '',
  status: 'active'
}

const EMPTY_CONSULTATION_FORM = {
  name: '',
  speciesFocus: '',
  defaultValue: '',
  duration: '',
  anamnesisText: '',
  checklist: '',
  requiredFields: ''
}

const EMPTY_DOCUMENT_TEMPLATE = {
  type: '',
  title: '',
  content: ''
}

const EMPTY_MESSAGE_TEMPLATE = {
  type: '',
  channel: 'whatsapp',
  template: '',
  variables: '',
  enabled: true
}

const EMPTY_PROFILE_FORM = {
  name: '',
  description: '',
  baseRole: 'secretary'
}

const EMPTY_UNIT_FORM = {
  name: '',
  type: 'filial',
  city: '',
  state: '',
  address: '',
  active: true
}

const EMPTY_REMINDER_FORM = {
  name: '',
  daysAfter: '7',
  message: '',
  active: true
}

const EMPTY_SEDATION_FORM = {
  name: '',
  dosage: '',
  notes: ''
}

const formatCurrency = value => `R$ ${Number(value || 0).toFixed(2)}`
const formatDateTime = value => value ? new Date(value).toLocaleString('pt-BR') : 'Nunca'

const formatRegionalPartsPreview = (parts, decimalSeparator) => {
  const groupSeparator = decimalSeparator === ',' ? '.' : ','

  return parts.map(part => {
    if (part.type === 'decimal') return decimalSeparator
    if (part.type === 'group') return groupSeparator
    return part.value
  }).join('')
}

// Mask Utilities
const maskCNPJ = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 14)
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

const maskCPF = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

const maskPhone = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }
  return digits
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}

const maskCEP = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  return digits.replace(/^(\d{5})(\d)/, '$1-$2')
}

const createBlankPermissions = () => (
  MODULES.reduce((acc, [moduleKey]) => {
    acc[moduleKey] = {
      view: false,
      create: false,
      edit: false,
      delete: false,
      exportPdf: false,
      accessFinancial: false,
      accessStock: false
    }
    return acc
  }, {})
)

export default function Settings() {
  const [settings, setSettings] = useState(() => mockDB.getSettings())
  const [profiles, setProfiles] = useState(() => mockDB.getProfiles())
  const [users, setUsers] = useState(() => mockDB.getUsers())
  const [teamMembers, setTeamMembers] = useState(() => mockDB.getTeamMembers())
  const [auditLogs, setAuditLogs] = useState(() => mockDB.getAuditLogs())
  const [backups, setBackups] = useState(() => mockDB.getBackups())
  const [procedures, setProcedures] = useState([])
  const [inventoryItems, setInventoryItems] = useState([])
  const [selectedInventoryItemId, setSelectedInventoryItemId] = useState('')
  const [selectedInventoryQuantity, setSelectedInventoryQuantity] = useState('1')
  const [newProcedure, setNewProcedure] = useState(EMPTY_PROCEDURE_FORM)
  const [userForm, setUserForm] = useState(EMPTY_USER_FORM)
  const [teamForm, setTeamForm] = useState(EMPTY_TEAM_FORM)
  const [consultationForm, setConsultationForm] = useState(EMPTY_CONSULTATION_FORM)
  const [documentTemplateForm, setDocumentTemplateForm] = useState(EMPTY_DOCUMENT_TEMPLATE)
  const [messageTemplateForm, setMessageTemplateForm] = useState(EMPTY_MESSAGE_TEMPLATE)
  const [profileForm, setProfileForm] = useState(EMPTY_PROFILE_FORM)
  const [unitForm, setUnitForm] = useState(EMPTY_UNIT_FORM)
  const [reminderForm, setReminderForm] = useState(EMPTY_REMINDER_FORM)
  const [selectedProfileId, setSelectedProfileId] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [sedationTypes, setSedationTypes] = useState([
    { id: 1, name: 'Xilazina', dosage: '1.1 mg/kg IV', notes: 'Sedação leve a moderada' },
    { id: 2, name: 'Detomidina', dosage: '0.01-0.02 mg/kg IV', notes: 'Sedação profunda' },
    { id: 3, name: 'Acepromazina', dosage: '0.03-0.1 mg/kg IM', notes: 'Tranquilização' }
  ])
  const [newSedation, setNewSedation] = useState(EMPTY_SEDATION_FORM)
  const [previewModel, setPreviewModel] = useState(null)
  const [isFetchingCep, setIsFetchingCep] = useState(false)
  const [cepStatusMessage, setCepStatusMessage] = useState('')

  const actionButtonLabel = isSaving ? 'Salvando...' : 'Salvar Configurações'
  const regionalPreview = useMemo(() => {
    const sampleDate = new Date('2026-04-20T14:35:00')
    const date = settings.regional.dateFormat === 'MM/DD/YYYY'
      ? `${String(sampleDate.getMonth() + 1).padStart(2, '0')}/${String(sampleDate.getDate()).padStart(2, '0')}/${sampleDate.getFullYear()}`
      : `${String(sampleDate.getDate()).padStart(2, '0')}/${String(sampleDate.getMonth() + 1).padStart(2, '0')}/${sampleDate.getFullYear()}`

    const time = sampleDate.toLocaleTimeString(settings.regional.language, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: settings.regional.timeFormat === '12h'
    })

    const number = formatRegionalPartsPreview(
      new Intl.NumberFormat(settings.regional.language, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).formatToParts(12345.67),
      settings.regional.decimalSeparator
    )

    const currency = formatRegionalPartsPreview(
      new Intl.NumberFormat(settings.regional.language, {
        style: 'currency',
        currency: settings.regional.currency
      }).formatToParts(12345.67),
      settings.regional.decimalSeparator
    )

    return { date, time, number, currency }
  }, [
    settings.regional.currency,
    settings.regional.dateFormat,
    settings.regional.decimalSeparator,
    settings.regional.language,
    settings.regional.timeFormat
  ])

  useEffect(() => {
    mockDB.ensureMockProcedures()
    setProcedures([...mockDB.getProcedures()])
    setInventoryItems([...mockDB.getInventory()])
    setAuditLogs([...mockDB.getAuditLogs()])
    setBackups([...mockDB.getBackups()])
  }, [])

  useEffect(() => {
    if (!selectedProfileId && profiles.length > 0) {
      setSelectedProfileId(profiles[0].id)
    }
  }, [profiles, selectedProfileId])

  useEffect(() => {
    if (!userForm.accessProfileId && profiles.length > 0) {
      const defaultProfile = profiles.find(profile => profile.baseRole === 'secretary') || profiles[0]
      setUserForm(prev => ({ ...prev, accessProfileId: defaultProfile.id }))
    }
  }, [profiles, userForm.accessProfileId])

  const selectedProfile = useMemo(
    () => profiles.find(profile => profile.id === selectedProfileId) || null,
    [profiles, selectedProfileId]
  )

  const procedureOperationalCost = useMemo(() => (
    Number(newProcedure.items.reduce((total, item) => total + ((item.costUnit || 0) * item.quantity), 0).toFixed(2))
  ), [newProcedure.items])

  const procedureChargePrice = useMemo(() => {
    const directPrice = Number(newProcedure.chargePrice)
    const marginBasedPrice = Number(newProcedure.marginPercent)

    if (directPrice > 0) return Number(directPrice.toFixed(2))
    if (procedureOperationalCost > 0 && Number.isFinite(marginBasedPrice) && marginBasedPrice >= 0 && marginBasedPrice < 100) {
      return Number((procedureOperationalCost / (1 - (marginBasedPrice / 100))).toFixed(2))
    }

    return 0
  }, [newProcedure.chargePrice, newProcedure.marginPercent, procedureOperationalCost])

  const procedureMargin = useMemo(() => {
    if (procedureChargePrice <= 0) return 0
    return Number((((procedureChargePrice - procedureOperationalCost) / procedureChargePrice) * 100).toFixed(2))
  }, [procedureChargePrice, procedureOperationalCost])

  const updateSettingsGroup = (group, field, value) => {
    let finalValue = value
    if (field === 'cnpj') finalValue = maskCNPJ(value)
    if (field === 'phone') finalValue = maskPhone(value)
    if (field === 'zipCode') {
      finalValue = maskCEP(value)
      setCepStatusMessage('')
    }

    setSettings(prev => ({
      ...prev,
      [group]: {
        ...prev[group],
        [field]: finalValue
      }
    }))
  }

  const fetchAddressByZipCode = async (rawZipCode = settings.clinic.zipCode) => {
    const zipCodeDigits = String(rawZipCode || '').replace(/\D/g, '').slice(0, 8)

    if (zipCodeDigits.length !== 8) {
      setCepStatusMessage('Informe um CEP com 8 dígitos para buscar o endereço.')
      return
    }

    setIsFetchingCep(true)
    setCepStatusMessage('')

    try {
      const response = await fetch(`https://viacep.com.br/ws/${zipCodeDigits}/json/`)

      if (!response.ok) {
        throw new Error('Falha ao consultar CEP')
      }

      const data = await response.json()

      if (data.erro) {
        setCepStatusMessage('CEP não encontrado.')
        return
      }

      setSettings(prev => ({
        ...prev,
        clinic: {
          ...prev.clinic,
          zipCode: maskCEP(zipCodeDigits),
          address: data.logradouro || prev.clinic.address || '',
          neighborhood: data.bairro || prev.clinic.neighborhood || '',
          city: data.localidade || prev.clinic.city || '',
          state: data.uf || prev.clinic.state || '',
          complement: data.complemento || prev.clinic.complement || ''
        }
      }))

      setCepStatusMessage('Endereço preenchido automaticamente pelo CEP.')
    } catch (error) {
      setCepStatusMessage('Não foi possível consultar o CEP agora. Tente novamente.')
    } finally {
      setIsFetchingCep(false)
    }
  }

  const handleImageUpload = (group, field) => (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 2MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result
      if (base64) {
        updateSettingsGroup(group, field, base64)
      }
    }
    reader.readAsDataURL(file)
  }

  const updateProfileState = updatedProfile => {
    setProfiles(prev => prev.map(profile => profile.id === updatedProfile.id ? updatedProfile : profile))
    mockDB.updateProfile(updatedProfile.id, updatedProfile)
    setAuditLogs([...mockDB.getAuditLogs()])
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 400))
    mockDB.saveSettings(settings)
    setSettings(mockDB.getSettings())
    setAuditLogs([...mockDB.getAuditLogs()])
    setBackups([...mockDB.getBackups()])
    localStorage.setItem('vet_settings', JSON.stringify({
      clinic: {
        name: settings.clinic.fantasyName
      }
    }))
    window.dispatchEvent(new Event('vet-settings-updated'))
    setIsSaving(false)
    alert('Configurações salvas com sucesso.')
  }

  const exportData = () => {
    const data = {
      settings,
      profiles,
      users,
      teamMembers,
      procedures,
      sedationTypes,
      exportDate: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'vettooth-configuracoes.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const handleProcedureFieldChange = (field, value) => {
    setNewProcedure(prev => ({ ...prev, [field]: value }))
  }

  const addProcedureItem = () => {
    const inventoryItem = inventoryItems.find(item => item.id === selectedInventoryItemId)
    const quantity = Number(selectedInventoryQuantity)

    if (!inventoryItem || quantity <= 0) {
      alert('Selecione um insumo e informe uma quantidade valida.')
      return
    }

    setNewProcedure(prev => {
      const existingItem = prev.items.find(item => item.inventoryItemId === inventoryItem.id)

      if (existingItem) {
        return {
          ...prev,
          items: prev.items.map(item => item.inventoryItemId === inventoryItem.id
            ? { ...item, quantity: Number((item.quantity + quantity).toFixed(3)) }
            : item
          )
        }
      }

      return {
        ...prev,
        items: [...prev.items, {
          inventoryItemId: inventoryItem.id,
          quantity,
          unit: inventoryItem.unit,
          itemName: inventoryItem.name,
          costUnit: inventoryItem.unitCost ?? inventoryItem.costPrice
        }]
      }
    })

    setSelectedInventoryItemId('')
    setSelectedInventoryQuantity('1')
  }

  const removeProcedureItem = inventoryItemId => {
    setNewProcedure(prev => ({
      ...prev,
      items: prev.items.filter(item => item.inventoryItemId !== inventoryItemId)
    }))
  }

  const addProcedure = () => {
    const hasRequiredFields = (
      newProcedure.name &&
      newProcedure.category &&
      newProcedure.description &&
      newProcedure.duration &&
      newProcedure.notes &&
      newProcedure.items.length > 0
    )

    if (!hasRequiredFields) {
      alert('Preencha nome, categoria, descricao, tempo medio, observacoes e vincule ao menos um insumo.')
      return
    }

    if (procedureChargePrice <= 0) {
      alert('Informe um valor de cobranca ou uma margem valida.')
      return
    }

    const savedProcedure = mockDB.createProcedure({
      id: '',
      name: newProcedure.name,
      category: newProcedure.category,
      description: newProcedure.description,
      baseCost: procedureChargePrice,
      chargePrice: procedureChargePrice,
      marginPercent: procedureMargin,
      duration: newProcedure.duration,
      averageTime: newProcedure.duration,
      notes: newProcedure.notes,
      operationalCost: procedureOperationalCost,
      items: newProcedure.items
    })

    setProcedures(prev => [...prev, savedProcedure])
    setNewProcedure(EMPTY_PROCEDURE_FORM)
    setSelectedInventoryItemId('')
    setSelectedInventoryQuantity('1')
  }

  const removeProcedure = id => {
    mockDB.deleteProcedure(id)
    setProcedures(prev => prev.filter(item => item.id !== id))
  }

  const addUser = () => {
    if (!userForm.name || !userForm.email || !userForm.phone || !userForm.functionTitle || !userForm.accessProfileId) {
      alert('Preencha nome, email, telefone, funcao e perfil.')
      return
    }

    const newUser = mockDB.createUser({
      ...userForm,
      name: userForm.name,
      fullName: userForm.name
    })

    setUsers(prev => [...prev, newUser])
    setAuditLogs([...mockDB.getAuditLogs()])
    setUserForm({
      ...EMPTY_USER_FORM,
      accessProfileId: userForm.accessProfileId
    })
  }

  const updateUserField = (userId, field, value) => {
    const updated = mockDB.updateUser(userId, { [field]: value })
    if (!updated) return
    setUsers(prev => prev.map(user => user.id === userId ? updated : user))
    setAuditLogs([...mockDB.getAuditLogs()])
  }

  const removeUser = userId => {
    mockDB.deleteUser(userId)
    setUsers(prev => prev.filter(user => user.id !== userId))
    setAuditLogs([...mockDB.getAuditLogs()])
  }

  const addTeamMember = () => {
    if (!teamForm.name || !teamForm.functionTitle || !teamForm.phone) {
      alert('Preencha nome, funcao e telefone.')
      return
    }

    const newMember = mockDB.createTeamMember(teamForm)
    setTeamMembers(prev => [...prev, newMember])
    setAuditLogs([...mockDB.getAuditLogs()])
    setTeamForm(EMPTY_TEAM_FORM)
  }

  const updateTeamMemberField = (memberId, field, value) => {
    const updated = mockDB.updateTeamMember(memberId, { [field]: value })
    if (!updated) return
    setTeamMembers(prev => prev.map(member => member.id === memberId ? updated : member))
    setAuditLogs([...mockDB.getAuditLogs()])
  }

  const removeTeamMember = memberId => {
    const removed = mockDB.deleteTeamMember(memberId)
    if (!removed) {
      alert('Nao e possivel excluir um membro vinculado a usuario do sistema.')
      return
    }
    setTeamMembers(prev => prev.filter(member => member.id !== memberId))
    setAuditLogs([...mockDB.getAuditLogs()])
  }

  const addConsultationTemplate = () => {
    if (!consultationForm.name || !consultationForm.duration || !consultationForm.anamnesisText) {
      alert('Preencha nome, duracao e anamnese padrao.')
      return
    }

    const nextTemplate = {
      id: `consult-${Date.now()}`,
      name: consultationForm.name,
      speciesFocus: consultationForm.speciesFocus || 'Geral',
      defaultValue: Number(consultationForm.defaultValue || 0),
      duration: consultationForm.duration,
      anamnesisText: consultationForm.anamnesisText,
      checklist: consultationForm.checklist.split(',').map(item => item.trim()).filter(Boolean),
      requiredFields: consultationForm.requiredFields.split(',').map(item => item.trim()).filter(Boolean)
    }

    setSettings(prev => ({
      ...prev,
      consultationTemplates: [...prev.consultationTemplates, nextTemplate]
    }))
    setConsultationForm(EMPTY_CONSULTATION_FORM)
  }

  const removeConsultationTemplate = templateId => {
    setSettings(prev => ({
      ...prev,
      consultationTemplates: prev.consultationTemplates.filter(template => template.id !== templateId)
    }))
  }

  const addDocumentTemplate = () => {
    if (!documentTemplateForm.type || !documentTemplateForm.title || !documentTemplateForm.content) {
      alert('Preencha tipo, titulo e conteudo do modelo.')
      return
    }

    setSettings(prev => ({
      ...prev,
      documentTemplates: [...prev.documentTemplates, {
        id: `doc-${Date.now()}`,
        ...documentTemplateForm
      }]
    }))
    setDocumentTemplateForm(EMPTY_DOCUMENT_TEMPLATE)
  }

  const removeDocumentTemplate = templateId => {
    setSettings(prev => ({
      ...prev,
      documentTemplates: prev.documentTemplates.filter(template => template.id !== templateId)
    }))
  }

  const addMessageTemplate = () => {
    if (!messageTemplateForm.type || !messageTemplateForm.template) {
      alert('Preencha o tipo e o texto da mensagem.')
      return
    }

    setSettings(prev => ({
      ...prev,
      automatedMessages: [...prev.automatedMessages, {
        id: `msg-${Date.now()}`,
        type: messageTemplateForm.type,
        channel: messageTemplateForm.channel,
        enabled: messageTemplateForm.enabled,
        template: messageTemplateForm.template,
        variables: messageTemplateForm.variables.split(',').map(item => item.trim()).filter(Boolean)
      }]
    }))
    setMessageTemplateForm(EMPTY_MESSAGE_TEMPLATE)
  }

  const removeMessageTemplate = messageId => {
    setSettings(prev => ({
      ...prev,
      automatedMessages: prev.automatedMessages.filter(message => message.id !== messageId)
    }))
  }

  const addProfile = () => {
    if (!profileForm.name) {
      alert('Informe o nome do perfil personalizado.')
      return
    }

    const newProfile = mockDB.createProfile({
      name: profileForm.name,
      description: profileForm.description,
      type: 'custom',
      baseRole: profileForm.baseRole,
      permissions: createBlankPermissions(),
      restrictions: {
        editAgenda: false,
        cancelAttendance: false,
        viewValues: false,
        sensitiveSettings: false
      }
    })

    setProfiles(prev => [...prev, newProfile])
    setSelectedProfileId(newProfile.id)
    setAuditLogs([...mockDB.getAuditLogs()])
    setProfileForm(EMPTY_PROFILE_FORM)
  }

  const toggleProfilePermission = (moduleKey, action) => {
    if (!selectedProfile) return

    updateProfileState({
      ...selectedProfile,
      permissions: {
        ...selectedProfile.permissions,
        [moduleKey]: {
          ...selectedProfile.permissions[moduleKey],
          [action]: !selectedProfile.permissions[moduleKey][action]
        }
      }
    })
  }

  const toggleProfileRestriction = restrictionKey => {
    if (!selectedProfile) return

    updateProfileState({
      ...selectedProfile,
      restrictions: {
        ...selectedProfile.restrictions,
        [restrictionKey]: !selectedProfile.restrictions[restrictionKey]
      }
    })
  }

  const setAllPermissions = (value) => {
    if (!selectedProfile) return
    const newPermissions = {}
    MODULES.forEach(([moduleKey]) => {
      newPermissions[moduleKey] = {}
      ACTIONS.forEach(([actionKey]) => {
        newPermissions[moduleKey][actionKey] = value
      })
    })
    updateProfileState({ ...selectedProfile, permissions: newPermissions })
  }

  const setModuleAll = (moduleKey, value) => {
    if (!selectedProfile) return
    updateProfileState({
      ...selectedProfile,
      permissions: {
        ...selectedProfile.permissions,
        [moduleKey]: ACTIONS.reduce((acc, [actionKey]) => {
          acc[actionKey] = value
          return acc
        }, {})
      }
    })
  }

  const setActionAll = (actionKey, value) => {
    if (!selectedProfile) return
    const newPermissions = { ...selectedProfile.permissions }
    MODULES.forEach(([moduleKey]) => {
      newPermissions[moduleKey] = {
        ...(newPermissions[moduleKey] || {}),
        [actionKey]: value
      }
    })
    updateProfileState({ ...selectedProfile, permissions: newPermissions })
  }

  const removeProfile = profileId => {
    const removed = mockDB.deleteProfile(profileId)
    if (!removed) {
      alert('Perfis padrao ou vinculados a usuarios nao podem ser removidos.')
      return
    }
    const nextProfiles = profiles.filter(profile => profile.id !== profileId)
    setProfiles(nextProfiles)
    setSelectedProfileId(nextProfiles[0]?.id || '')
    setAuditLogs([...mockDB.getAuditLogs()])
  }

  const toggleDashboardIndicator = indicator => {
    setSettings(prev => {
      const current = prev.dashboard.enabledIndicators || []
      const enabledIndicators = current.includes(indicator)
        ? current.filter(item => item !== indicator)
        : [...current, indicator]

      return {
        ...prev,
        dashboard: {
          ...prev.dashboard,
          enabledIndicators
        }
      }
    })
  }

  const addClinicUnit = () => {
    if (!unitForm.name || !unitForm.city || !unitForm.state) {
      alert('Preencha nome, cidade e estado da unidade.')
      return
    }

    setSettings(prev => ({
      ...prev,
      units: [...prev.units, { id: `unit-${Date.now()}`, ...unitForm }]
    }))
    setUnitForm(EMPTY_UNIT_FORM)
  }

  const removeClinicUnit = unitId => {
    setSettings(prev => ({
      ...prev,
      units: prev.units.filter(unit => unit.id !== unitId)
    }))
  }

  const addClinicalReminder = () => {
    if (!reminderForm.name || !reminderForm.message) {
      alert('Preencha nome e mensagem do lembrete.')
      return
    }

    setSettings(prev => ({
      ...prev,
      clinicalReminders: [...prev.clinicalReminders, {
        id: `reminder-${Date.now()}`,
        name: reminderForm.name,
        daysAfter: Number(reminderForm.daysAfter || 0),
        message: reminderForm.message,
        active: reminderForm.active
      }]
    }))
    setReminderForm(EMPTY_REMINDER_FORM)
  }

  const removeClinicalReminder = reminderId => {
    setSettings(prev => ({
      ...prev,
      clinicalReminders: prev.clinicalReminders.filter(reminder => reminder.id !== reminderId)
    }))
  }

  const createManualBackup = () => {
    mockDB.createBackup('Backup manual criado em Configuracoes')
    setBackups([...mockDB.getBackups()])
    setSettings(mockDB.getSettings())
    setAuditLogs([...mockDB.getAuditLogs()])
    alert('Backup manual criado com sucesso.')
  }

  const restoreBackup = backupId => {
    const restored = mockDB.restoreBackup(backupId)
    if (!restored) {
      alert('Nao foi possivel restaurar o backup.')
      return
    }

    setSettings(mockDB.getSettings())
    setProfiles(mockDB.getProfiles())
    setUsers(mockDB.getUsers())
    setTeamMembers(mockDB.getTeamMembers())
    setProcedures([...mockDB.getProcedures()])
    setAuditLogs([...mockDB.getAuditLogs()])
    setBackups([...mockDB.getBackups()])
    alert('Backup restaurado com sucesso.')
  }

  const importBackupFile = event => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'))
        if (parsed?.settings) {
          mockDB.saveSettings(parsed.settings)
        }
        alert('Arquivo importado. Se quiser restaurar tudo, utilize os backups internos do sistema.')
      } catch (error) {
        alert('Arquivo inválido para restauração.')
      }
      event.target.value = ''
    }
    reader.readAsText(file)
  }

  const emitFiscalInvoice = () => {
    pdfService.generateFiscalInvoice({
      ownerName: 'Cliente Demonstracao',
      patientName: 'Paciente Demonstracao',
      description: 'Atendimento odontologico veterinario',
      amount: 250,
      city: settings.clinic.city
    })
  }

  const emitReceipt = () => {
    pdfService.generateReceipt({
      id: `rcb-${Date.now()}`,
      patientId: 'demo',
      patientName: 'Paciente Demonstracao',
      ownerName: 'Cliente Demonstracao',
      description: 'Consulta odontologica',
      amount: 250,
      dueDate: new Date().toISOString(),
      paid: true
    })
  }

  const emitPaymentProof = () => {
    pdfService.generatePaymentProof({
      ownerName: 'Cliente Demonstracao',
      patientName: 'Paciente Demonstracao',
      description: 'Pagamento de consulta odontologica',
      amount: 250,
      method: 'Pix',
      transactionId: `TX-${Date.now()}`
    })
  }

  const addSedation = () => {
    if (!newSedation.name || !newSedation.dosage) return
    setSedationTypes(prev => [...prev, { id: Date.now(), ...newSedation }])
    setNewSedation(EMPTY_SEDATION_FORM)
  }

  const removeSedation = sedationId => {
    setSedationTypes(prev => prev.filter(item => item.id !== sedationId))
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="sticky top-0 z-20 -mx-4 lg:-mx-8 border-b border-gray-200 bg-gray-50/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-gray-50/80 lg:px-8">
          <div className="mx-auto flex max-w-[1920px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Configurações Gerais</h1>
              <p className="text-sm text-gray-500">
                Parametrize clínica, permissões, documentos, equipe, mensagens automáticas e integrações.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={exportData} className="gap-2">
                <Download className="h-4 w-4" />
                Exportar Dados
              </Button>
              <Button onClick={handleSaveSettings} disabled={isSaving} className="gap-2">
                <Save className="h-4 w-4" />
                {actionButtonLabel}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Personalização da Clínica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome fantasia</Label>
                  <Input value={settings.clinic.fantasyName} onChange={event => updateSettingsGroup('clinic', 'fantasyName', event.target.value)} />
                </div>
                <div>
                  <Label>Razão social</Label>
                  <Input value={settings.clinic.legalName} onChange={event => updateSettingsGroup('clinic', 'legalName', event.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>CNPJ</Label>
                  <Input value={settings.clinic.cnpj} onChange={event => updateSettingsGroup('clinic', 'cnpj', event.target.value)} />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input value={settings.clinic.phone} onChange={event => updateSettingsGroup('clinic', 'phone', event.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>E-mail</Label>
                  <Input value={settings.clinic.email} onChange={event => updateSettingsGroup('clinic', 'email', event.target.value)} />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input value={settings.clinic.website} onChange={event => updateSettingsGroup('clinic', 'website', event.target.value)} />
                </div>
              </div>
              <div>
                <Label>Logradouro</Label>
                <Input
                  value={settings.clinic.address}
                  onChange={event => updateSettingsGroup('clinic', 'address', event.target.value)}
                  placeholder="Rua, avenida, alameda..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Número</Label>
                  <Input
                    value={settings.clinic.number || ''}
                    onChange={event => updateSettingsGroup('clinic', 'number', event.target.value)}
                    placeholder="123"
                  />
                </div>
                <div>
                  <Label>Complemento</Label>
                  <Input
                    value={settings.clinic.complement || ''}
                    onChange={event => updateSettingsGroup('clinic', 'complement', event.target.value)}
                    placeholder="Sala, bloco, conjunto..."
                  />
                </div>
                <div>
                  <Label>Bairro</Label>
                  <Input
                    value={settings.clinic.neighborhood || ''}
                    onChange={event => updateSettingsGroup('clinic', 'neighborhood', event.target.value)}
                    placeholder="Centro"
                  />
                </div>
                <div>
                  <Label>CEP</Label>
                  <div className="flex gap-2">
                    <Input
                      value={settings.clinic.zipCode}
                      onChange={event => updateSettingsGroup('clinic', 'zipCode', event.target.value)}
                      onBlur={() => fetchAddressByZipCode()}
                      placeholder="00000-000"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="shrink-0"
                      onClick={() => fetchAddressByZipCode()}
                      disabled={isFetchingCep}
                    >
                      {isFetchingCep ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                  </div>
                  {cepStatusMessage && (
                    <p className="mt-1 text-xs text-gray-500">{cepStatusMessage}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Cidade</Label>
                  <Input value={settings.clinic.city} onChange={event => updateSettingsGroup('clinic', 'city', event.target.value)} />
                </div>
                <div>
                  <Label>Estado</Label>
                  <Input value={settings.clinic.state} onChange={event => updateSettingsGroup('clinic', 'state', event.target.value)} />
                </div>
                <div>
                  <Label>Redes sociais</Label>
                  <Input value={settings.clinic.socialMedia} onChange={event => updateSettingsGroup('clinic', 'socialMedia', event.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Logo da clínica</Label>
                  <div className="flex gap-2">
                    <Input value={settings.clinic.logo || ''} onChange={event => updateSettingsGroup('clinic', 'logo', event.target.value)} placeholder="URL do logo..." className="flex-1" />
                    <Button variant="outline" size="icon" className="shrink-0" onClick={() => document.getElementById('logo-upload').click()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                    <input type="file" id="logo-upload" className="hidden" accept="image/*" onChange={handleImageUpload('clinic', 'logo')} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Logo dos documentos</Label>
                  <div className="flex gap-2">
                    <Input value={settings.clinic.documentLogo || ''} onChange={event => updateSettingsGroup('clinic', 'documentLogo', event.target.value)} placeholder="URL do logo..." className="flex-1" />
                    <Button variant="outline" size="icon" className="shrink-0" onClick={() => document.getElementById('doc-logo-upload').click()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                    <input type="file" id="doc-logo-upload" className="hidden" accept="image/*" onChange={handleImageUpload('clinic', 'documentLogo')} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Visual e Formatação Regional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Cor principal</Label>
                  <Input type="color" value={settings.appearance.primaryColor} onChange={event => updateSettingsGroup('appearance', 'primaryColor', event.target.value)} className="h-11" />
                </div>
                <div>
                  <Label>Cor dos botões</Label>
                  <Input type="color" value={settings.appearance.buttonColor} onChange={event => updateSettingsGroup('appearance', 'buttonColor', event.target.value)} className="h-11" />
                </div>
                <div>
                  <Label>Cor do menu lateral</Label>
                  <Input type="color" value={settings.appearance.sidebarColor} onChange={event => updateSettingsGroup('appearance', 'sidebarColor', event.target.value)} className="h-11" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Tema</Label>
                  <select className="mt-1 w-full px-3 py-2 rounded-md border border-input bg-background" value={settings.appearance.theme} onChange={event => updateSettingsGroup('appearance', 'theme', event.target.value)}>
                    <option value="light">Claro</option>
                    <option value="dark">Escuro</option>
                  </select>
                </div>
                <div>
                  <Label>Ícone do app</Label>
                  <div className="flex gap-2">
                    <Input
                      value={settings.appearance.appIcon || ''}
                      onChange={event => updateSettingsGroup('appearance', 'appIcon', event.target.value)}
                      placeholder="URL ou upload do ícone da clínica"
                      className="flex-1"
                    />
                    <Button variant="outline" size="icon" className="shrink-0" onClick={() => document.getElementById('app-icon-upload').click()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                    <input type="file" id="app-icon-upload" className="hidden" accept="image/*" onChange={handleImageUpload('appearance', 'appIcon')} />
                  </div>
                  {settings.appearance.appIcon && (
                    <div className="mt-2 flex items-center gap-3 rounded-lg border border-gray-200 p-2">
                      <img src={settings.appearance.appIcon} alt="Prévia do ícone do app" className="h-8 w-8 rounded object-cover" />
                      <span className="text-xs text-gray-500">Esse ícone será aplicado como favicon do sistema após salvar.</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Idioma</Label>
                  <select className="mt-1 w-full px-3 py-2 rounded-md border border-input bg-background" value={settings.regional.language} onChange={event => updateSettingsGroup('regional', 'language', event.target.value)}>
                    <option value="pt-BR">Português</option>
                    <option value="en-US">English</option>
                    <option value="es-ES">Español</option>
                  </select>
                </div>
                <div>
                  <Label>Formato de data</Label>
                  <select className="mt-1 w-full px-3 py-2 rounded-md border border-input bg-background" value={settings.regional.dateFormat} onChange={event => updateSettingsGroup('regional', 'dateFormat', event.target.value)}>
                    <option value="DD/MM/AAAA">DD/MM/AAAA</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  </select>
                </div>
                <div>
                  <Label>Formato de hora</Label>
                  <select className="mt-1 w-full px-3 py-2 rounded-md border border-input bg-background" value={settings.regional.timeFormat} onChange={event => updateSettingsGroup('regional', 'timeFormat', event.target.value)}>
                    <option value="24h">24 horas</option>
                    <option value="12h">12 horas</option>
                  </select>
                </div>
                <div>
                  <Label>Separador decimal</Label>
                  <select className="mt-1 w-full px-3 py-2 rounded-md border border-input bg-background" value={settings.regional.decimalSeparator} onChange={event => updateSettingsGroup('regional', 'decimalSeparator', event.target.value)}>
                    <option value=",">Vírgula</option>
                    <option value=".">Ponto</option>
                  </select>
                </div>
              </div>
              <div>
                <Label>Moeda</Label>
                <select className="mt-1 w-full px-3 py-2 rounded-md border border-input bg-background" value={settings.regional.currency} onChange={event => updateSettingsGroup('regional', 'currency', event.target.value)}>
                  <option value="BRL">BRL</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="rounded-lg border p-4" style={{ backgroundColor: `${settings.appearance.sidebarColor}15` }}>
                  <p className="text-sm font-semibold text-gray-900">Pré-visualização visual</p>
                  <div className="mt-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold" style={{ color: settings.appearance.primaryColor }}>Cor principal aplicada</p>
                        <p className="text-xs text-gray-500">Títulos, destaques e links seguem essa cor.</p>
                      </div>
                      <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: `${settings.appearance.primaryColor}20`, color: settings.appearance.primaryColor }}>
                        Destaque
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between rounded-lg p-4 text-white" style={{ backgroundColor: settings.appearance.sidebarColor }}>
                      <span className="font-bold">{settings.clinic.fantasyName}</span>
                      <button type="button" className="rounded-md px-4 py-2 text-sm font-medium" style={{ backgroundColor: settings.appearance.buttonColor }}>
                        Botão global
                      </button>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <Button type="button">Botão padrão</Button>
                      <Button type="button" variant="outline">Outline</Button>
                      <button type="button" className="text-sm font-medium" style={{ color: settings.appearance.primaryColor }}>
                        Link principal
                      </button>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-900">Pré-visualização regional</p>
                  <p className="mt-1 text-xs text-gray-500">A prévia abaixo muda em tempo real conforme idioma, data, hora, moeda e separador decimal.</p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-md border bg-white p-3">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Data</p>
                      <p className="mt-1 font-semibold text-gray-900">{regionalPreview.date}</p>
                    </div>
                    <div className="rounded-md border bg-white p-3">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Hora</p>
                      <p className="mt-1 font-semibold text-gray-900">{regionalPreview.time}</p>
                    </div>
                    <div className="rounded-md border bg-white p-3">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Número</p>
                      <p className="mt-1 font-semibold text-gray-900">{regionalPreview.number}</p>
                    </div>
                    <div className="rounded-md border bg-white p-3">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Moeda</p>
                      <p className="mt-1 font-semibold text-gray-900">{regionalPreview.currency}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentos Fiscais e Assinatura
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input placeholder="API municipal" value={settings.fiscal.municipalApiUrl} onChange={event => updateSettingsGroup('fiscal', 'municipalApiUrl', event.target.value)} />
                <Input placeholder="Provedor/API" value={settings.fiscal.municipalProvider} onChange={event => updateSettingsGroup('fiscal', 'municipalProvider', event.target.value)} />
                <Input placeholder="Código da cidade" value={settings.fiscal.cityCode} onChange={event => updateSettingsGroup('fiscal', 'cityCode', event.target.value)} />
                <Input placeholder="Código do serviço" value={settings.fiscal.defaultServiceCode} onChange={event => updateSettingsGroup('fiscal', 'defaultServiceCode', event.target.value)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label>Ambiente</Label>
                  <select className="mt-1 w-full px-3 py-2 rounded-md border border-input bg-background" value={settings.fiscal.environment} onChange={event => updateSettingsGroup('fiscal', 'environment', event.target.value)}>
                    <option value="homologation">Homologação</option>
                    <option value="production">Produção</option>
                  </select>
                </div>
                <div>
                  <Label>Alíquota padrão (%)</Label>
                  <Input type="number" value={settings.fiscal.defaultTaxRate} onChange={event => updateSettingsGroup('fiscal', 'defaultTaxRate', Number(event.target.value))} />
                </div>
                <div>
                  <Label>Próxima nota</Label>
                  <Input type="number" value={settings.fiscal.nextInvoiceNumber} onChange={event => updateSettingsGroup('fiscal', 'nextInvoiceNumber', Number(event.target.value))} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  ['includeCnpjOnAllDocuments', 'Incluir CNPJ em todos os documentos'],
                  ['issueInvoices', 'Emitir nota fiscal'],
                  ['issueReceipts', 'Emitir recibo'],
                  ['issuePaymentProofs', 'Emitir comprovante']
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 rounded-md border p-3 text-sm">
                    <input type="checkbox" checked={Boolean(settings.fiscal[key])} onChange={event => updateSettingsGroup('fiscal', key, event.target.checked)} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              <div className="rounded-lg border bg-gray-50 p-4 space-y-3">
                <p className="font-semibold text-gray-900">Emissão rápida de demonstração</p>
                <p className="text-sm text-gray-500">Gera PDF interno com CNPJ da clínica, assinatura digital configurada e dados fiscais básicos.</p>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" onClick={emitFiscalInvoice}>Emitir nota fiscal</Button>
                  <Button type="button" variant="outline" onClick={emitReceipt}>Emitir recibo</Button>
                  <Button type="button" variant="outline" onClick={emitPaymentProof}>Emitir comprovante</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Backup e Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  ['dailyAutoBackup', 'Backup automático diário'],
                  ['manualBackupEnabled', 'Permitir backup manual'],
                  ['restoreEnabled', 'Permitir restauração'],
                  ['twoFactorEnabled', 'Autenticação em dois fatores'],
                  ['passwordResetEnabled', 'Redefinição de senha']
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 rounded-md border p-3 text-sm">
                    <input type="checkbox" checked={Boolean(settings.security[key])} onChange={event => updateSettingsGroup('security', key, event.target.checked)} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label>Expiração de sessão (min)</Label>
                  <Input type="number" value={settings.security.sessionTimeoutMinutes} onChange={event => updateSettingsGroup('security', 'sessionTimeoutMinutes', Number(event.target.value))} />
                </div>
                <div>
                  <Label>Retenção de backups</Label>
                  <Input type="number" value={settings.security.backupRetentionDays} onChange={event => updateSettingsGroup('security', 'backupRetentionDays', Number(event.target.value))} />
                </div>
                <div>
                  <Label>Último backup</Label>
                  <Input value={formatDateTime(settings.security.lastBackupAt)} readOnly />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={createManualBackup} disabled={!settings.security.manualBackupEnabled}>Backup manual</Button>
                <label className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm cursor-pointer">
                  <span>Importar JSON</span>
                  <input type="file" accept="application/json" className="hidden" onChange={importBackupFile} />
                </label>
              </div>
              <div className="space-y-2">
                {backups.slice(0, 5).map(backup => (
                  <div key={backup.id} className="flex flex-col gap-3 rounded-lg border p-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{backup.label}</p>
                      <p className="text-xs text-gray-500">{formatDateTime(backup.createdAt)} • {backup.createdBy}</p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => restoreBackup(backup.id)} disabled={!settings.security.restoreEnabled}>
                      Restaurar versão
                    </Button>
                  </div>
                ))}
                {backups.length === 0 && (
                  <p className="text-sm text-gray-500">Nenhum backup interno disponível.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Dashboard Configurável
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">Defina quais indicadores aparecem no dashboard principal para o administrador.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {DASHBOARD_INDICATORS.map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 rounded-md border p-3 text-sm">
                    <input type="checkbox" checked={settings.dashboard.enabledIndicators.includes(key)} onChange={() => toggleDashboardIndicator(key)} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Unidades Veterinárias
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input placeholder="Nome da unidade" value={unitForm.name} onChange={event => setUnitForm(prev => ({ ...prev, name: event.target.value }))} />
                <select className="w-full px-3 py-2 rounded-md border border-input bg-background" value={unitForm.type} onChange={event => setUnitForm(prev => ({ ...prev, type: event.target.value }))}>
                  <option value="matriz">Matriz</option>
                  <option value="filial">Filial</option>
                  <option value="atendimento_movel">Atendimento móvel</option>
                  <option value="hospital_parceiro">Hospital parceiro</option>
                </select>
                <Input placeholder="Cidade" value={unitForm.city} onChange={event => setUnitForm(prev => ({ ...prev, city: event.target.value }))} />
                <Input placeholder="Estado" value={unitForm.state} onChange={event => setUnitForm(prev => ({ ...prev, state: event.target.value }))} />
                <Input placeholder="Endereço" value={unitForm.address} onChange={event => setUnitForm(prev => ({ ...prev, address: event.target.value }))} />
                <Button type="button" onClick={addClinicUnit}>Adicionar unidade</Button>
              </div>
              <div className="space-y-2">
                {settings.units.map(unit => (
                  <div key={unit.id} className="flex flex-col gap-3 rounded-lg border p-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{unit.name}</p>
                      <p className="text-xs text-gray-500">{unit.type} • {unit.city}/{unit.state} • {unit.address || 'Sem endereço'}</p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => removeClinicUnit(unit.id)} className="text-red-600">
                      Remover
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5" />
                Lembretes Clínicos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input placeholder="Nome do lembrete" value={reminderForm.name} onChange={event => setReminderForm(prev => ({ ...prev, name: event.target.value }))} />
                <Input placeholder="Dias após atendimento" type="number" value={reminderForm.daysAfter} onChange={event => setReminderForm(prev => ({ ...prev, daysAfter: event.target.value }))} />
                <label className="flex items-center gap-2 rounded-md border p-3 text-sm">
                  <input type="checkbox" checked={reminderForm.active} onChange={event => setReminderForm(prev => ({ ...prev, active: event.target.checked }))} />
                  <span>Lembrete ativo</span>
                </label>
              </div>
              <textarea className="w-full border rounded-md p-3 min-h-[96px]" placeholder="Mensagem padrão do lembrete" value={reminderForm.message} onChange={event => setReminderForm(prev => ({ ...prev, message: event.target.value }))} />
              <Button type="button" onClick={addClinicalReminder}>Adicionar lembrete</Button>
              <div className="space-y-2">
                {settings.clinicalReminders.map(reminder => (
                  <div key={reminder.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{reminder.name}</p>
                        <p className="text-xs text-gray-500">{reminder.daysAfter} dias • {reminder.active ? 'Ativo' : 'Inativo'}</p>
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={() => removeClinicalReminder(reminder.id)} className="text-red-600">
                        Remover
                      </Button>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{reminder.message}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Auditoria
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  ['enabled', 'Auditoria ativa'],
                  ['logSensitiveActions', 'Log de ações sensíveis']
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 rounded-md border p-3 text-sm">
                    <input type="checkbox" checked={Boolean(settings.audit[key])} onChange={event => updateSettingsGroup('audit', key, event.target.checked)} />
                    <span>{label}</span>
                  </label>
                ))}
                <div>
                  <Label>Retenção (dias)</Label>
                  <Input type="number" value={settings.audit.retainDays} onChange={event => updateSettingsGroup('audit', 'retainDays', Number(event.target.value))} />
                </div>
              </div>
              <div className="space-y-2 max-h-[360px] overflow-y-auto">
                {auditLogs.map(log => (
                  <div key={log.id} className="rounded-lg border p-3 text-sm">
                    <p className="font-medium text-gray-900">{log.actorName} • {log.action} • {log.entity}</p>
                    <p className="text-xs text-gray-500">{formatDateTime(log.createdAt)} • Campo: {log.changedField || 'geral'}</p>
                    <p className="mt-2 text-xs text-gray-600">Anterior: {JSON.stringify(log.previousValue ?? null)}</p>
                    <p className="text-xs text-gray-600">Novo: {JSON.stringify(log.newValue ?? null)}</p>
                  </div>
                ))}
                {auditLogs.length === 0 && (
                  <p className="text-sm text-gray-500">Nenhum evento auditado até o momento.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              RBAC, Perfis e Usuários
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-6">
              <div className="space-y-4">
                <div className="rounded-lg border p-4 space-y-3">
                  <p className="font-semibold text-gray-900">Perfis cadastrados</p>
                  <div className="space-y-2">
                    {profiles.map(profile => (
                      <button
                        key={profile.id}
                        type="button"
                        onClick={() => setSelectedProfileId(profile.id)}
                        className={`w-full rounded-lg border px-3 py-3 text-left ${selectedProfileId === profile.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                      >
                        <p className="font-medium text-gray-900">{profile.name}</p>
                        <p className="text-xs text-gray-500">{profile.type === 'standard' ? 'Padrão' : 'Personalizado'}</p>
                      </button>
                    ))}
                  </div>
                  <div className="border-t pt-3 space-y-3">
                    <Input placeholder="Novo perfil personalizado" value={profileForm.name} onChange={event => setProfileForm(prev => ({ ...prev, name: event.target.value }))} />
                    <Input placeholder="Descrição" value={profileForm.description} onChange={event => setProfileForm(prev => ({ ...prev, description: event.target.value }))} />
                    <select className="w-full px-3 py-2 rounded-md border border-input bg-background" value={profileForm.baseRole} onChange={event => setProfileForm(prev => ({ ...prev, baseRole: event.target.value }))}>
                      <option value="admin">Administrador</option>
                      <option value="vet">Veterinário</option>
                      <option value="secretary">Secretária</option>
                    </select>
                    <Button type="button" onClick={addProfile} className="w-full gap-2">
                      <Plus className="h-4 w-4" />
                      Criar Perfil
                    </Button>
                    {selectedProfile?.type === 'custom' && (
                      <Button type="button" variant="outline" onClick={() => removeProfile(selectedProfile.id)} className="w-full text-red-600">
                        Remover Perfil Selecionado
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {selectedProfile && (
                  <>
                    <div className="rounded-lg border p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{selectedProfile.name}</p>
                          <p className="text-sm text-gray-500">{selectedProfile.description || 'Sem descrição informada.'}</p>
                        </div>
                        <div className="text-xs text-gray-500">
                          Base: {selectedProfile.baseRole || 'custom'}
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                        {[
                          ['editAgenda', 'Pode editar agenda'],
                          ['cancelAttendance', 'Pode cancelar atendimento'],
                          ['viewValues', 'Pode visualizar valores'],
                          ['sensitiveSettings', 'Configurações sensíveis']
                        ].map(([key, label]) => (
                          <label key={key} className="flex items-center gap-2 rounded-md border p-3 text-sm">
                            <input type="checkbox" checked={Boolean(selectedProfile.restrictions[key])} onChange={() => toggleProfileRestriction(key)} />
                            <span>{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">Permissões por módulo</p>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => setAllPermissions(true)}>Marcar tudo</Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => setAllPermissions(false)}>Limpar tudo</Button>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-lg border">
                      <table className="w-full border-collapse text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="p-3 text-left">Módulo</th>
                            {ACTIONS.map(([actionKey, label]) => (
                               <th key={label} className="p-3 text-center whitespace-nowrap">
                                 <div className="flex flex-col items-center gap-1">
                                   <span>{label}</span>
                                   <input 
                                     type="checkbox" 
                                     className="h-3 w-3"
                                     title={`Selecionar ${label} para todos`}
                                     onChange={(e) => setActionAll(actionKey, e.target.checked)}
                                   />
                                 </div>
                               </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {MODULES.map(([moduleKey, label]) => (
                            <tr key={moduleKey} className="border-t hover:bg-gray-50">
                              <td className="p-3 font-medium text-gray-900">
                                <div className="flex items-center gap-2">
                                  <span>{label}</span>
                                  <input 
                                    type="checkbox" 
                                    className="h-3 w-3" 
                                    title={`Selecionar tudo em ${label}`}
                                    onChange={(e) => setModuleAll(moduleKey, e.target.checked)}
                                  />
                                </div>
                              </td>
                              {ACTIONS.map(([actionKey]) => (
                                <td key={`${moduleKey}-${actionKey}`} className="p-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(selectedProfile.permissions[moduleKey]?.[actionKey])}
                                    onChange={() => toggleProfilePermission(moduleKey, actionKey)}
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="rounded-lg border p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900">Usuários do sistema</p>
                <span className="text-xs text-gray-500">Campos obrigatórios de acesso, status, cadastro e último acesso</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3">
                <Input placeholder="Nome completo" value={userForm.name} onChange={event => setUserForm(prev => ({ ...prev, name: event.target.value }))} />
                <Input placeholder="E-mail" value={userForm.email} onChange={event => setUserForm(prev => ({ ...prev, email: event.target.value }))} />
                <Input placeholder="Telefone" value={userForm.phone} onChange={event => setUserForm(prev => ({ ...prev, phone: maskPhone(event.target.value) }))} />
                <Input placeholder="Função" value={userForm.functionTitle} onChange={event => setUserForm(prev => ({ ...prev, functionTitle: event.target.value }))} />
                <Input placeholder="Senha" type="password" value={userForm.password} onChange={event => setUserForm(prev => ({ ...prev, password: event.target.value }))} />
                <select className="w-full px-3 py-2 rounded-md border border-input bg-background" value={userForm.accessProfileId} onChange={event => setUserForm(prev => ({ ...prev, accessProfileId: event.target.value }))}>
                  {profiles.map(profile => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
                </select>
                <div className="flex gap-2">
                  <Button type="button" onClick={addUser} className="flex-1 gap-2">
                    <Plus className="h-4 w-4" />
                    Adicionar
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="p-3 text-left">Nome</th>
                      <th className="p-3 text-left">Contato</th>
                      <th className="p-3 text-left">Função</th>
                      <th className="p-3 text-left">Perfil</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Cadastro</th>
                      <th className="p-3 text-left">Último acesso</th>
                      <th className="p-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className="border-b last:border-0">
                        <td className="p-3">
                          <div className="font-medium text-gray-900">{user.fullName || user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </td>
                        <td className="p-3">{user.phone || '-'}</td>
                        <td className="p-3">{user.functionTitle || '-'}</td>
                        <td className="p-3">
                          <select className="w-full px-2 py-2 rounded-md border border-input bg-background" value={user.accessProfileId || ''} onChange={event => updateUserField(user.id, 'accessProfileId', event.target.value)}>
                            {profiles.map(profile => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
                          </select>
                        </td>
                        <td className="p-3">
                          <select className="w-full px-2 py-2 rounded-md border border-input bg-background" value={user.status || 'active'} onChange={event => updateUserField(user.id, 'status', event.target.value)}>
                            <option value="active">Ativo</option>
                            <option value="inactive">Inativo</option>
                          </select>
                        </td>
                        <td className="p-3 text-xs text-gray-500">{formatDateTime(user.createdAt)}</td>
                        <td className="p-3 text-xs text-gray-500">{formatDateTime(user.lastAccessAt)}</td>
                        <td className="p-3 text-right">
                          <Button type="button" variant="outline" size="sm" onClick={() => removeUser(user.id)} className="text-red-600">
                            Remover
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Configuração da Equipe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
              <Input placeholder="Nome" value={teamForm.name} onChange={event => setTeamForm(prev => ({ ...prev, name: event.target.value }))} />
              <Input placeholder="Função" value={teamForm.functionTitle} onChange={event => setTeamForm(prev => ({ ...prev, functionTitle: event.target.value }))} />
              <Input placeholder="Especialidade" value={teamForm.specialty} onChange={event => setTeamForm(prev => ({ ...prev, specialty: event.target.value }))} />
              <Input placeholder="CRMV" value={teamForm.crmv} onChange={event => setTeamForm(prev => ({ ...prev, crmv: event.target.value }))} />
              <Input placeholder="CPF" value={teamForm.cpf} onChange={event => setTeamForm(prev => ({ ...prev, cpf: maskCPF(event.target.value) }))} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
              <Input placeholder="Telefone" value={teamForm.phone} onChange={event => setTeamForm(prev => ({ ...prev, phone: maskPhone(event.target.value) }))} />
              <Input placeholder="E-mail" value={teamForm.email} onChange={event => setTeamForm(prev => ({ ...prev, email: event.target.value }))} />
              <Input placeholder="Assinatura" value={teamForm.signature} onChange={event => setTeamForm(prev => ({ ...prev, signature: event.target.value }))} />
              <div className="flex gap-1">
                <Input placeholder="Foto URL" value={teamForm.photo} onChange={event => setTeamForm(prev => ({ ...prev, photo: event.target.value }))} className="flex-1" />
                <Button variant="outline" size="icon" onClick={() => document.getElementById('team-photo-upload').click()}>
                  <Plus className="h-4 w-4" />
                </Button>
                <input 
                  type="file" 
                  id="team-photo-upload" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = (re) => setTeamForm(prev => ({ ...prev, photo: re.target?.result }))
                      reader.readAsDataURL(file)
                    }
                  }} 
                />
              </div>
              <Button type="button" onClick={addTeamMember} className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar membro
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {teamMembers.map(member => (
                <div key={member.id} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.functionTitle}</p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => removeTeamMember(member.id)} className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <Input value={member.specialty || ''} onChange={event => updateTeamMemberField(member.id, 'specialty', event.target.value)} placeholder="Especialidade" />
                    <Input value={member.crmv || ''} onChange={event => updateTeamMemberField(member.id, 'crmv', event.target.value)} placeholder="CRMV" />
                    <Input value={member.phone || ''} onChange={event => updateTeamMemberField(member.id, 'phone', event.target.value)} placeholder="Telefone" />
                    <Input value={member.email || ''} onChange={event => updateTeamMemberField(member.id, 'email', event.target.value)} placeholder="E-mail" />
                    <Input value={member.signature || ''} onChange={event => updateTeamMemberField(member.id, 'signature', event.target.value)} placeholder="Assinatura digital" />
                    <select className="w-full px-3 py-2 rounded-md border border-input bg-background" value={member.status} onChange={event => updateTeamMemberField(member.id, 'status', event.target.value)}>
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                    </select>
                  </div>
                  <p className="text-xs text-gray-500">Cadastro: {formatDateTime(member.createdAt)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentos e PDF
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  ['classic', 'Modelo 1', 'Profissional clássico'],
                  ['minimal', 'Modelo 2', 'Clínico minimalista'],
                  ['premium', 'Modelo 3', 'Premium / personalizado']
                ].map(([value, title, description]) => (
                  <div key={value} className="relative group">
                    <button
                      type="button"
                      onClick={() => updateSettingsGroup('documents', 'selectedModel', value)}
                      className={`w-full rounded-lg border p-4 text-left transition-all ${settings.documents.selectedModel === value ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <p className="font-semibold text-gray-900">{title}</p>
                      <p className="text-xs text-gray-500">{description}</p>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setPreviewModel(value)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-white border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
                      title="Ver prévia visual"
                    >
                      <Eye size={14} className="text-blue-600" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Cabeçalho</Label>
                  <Input value={settings.documents.header} onChange={event => updateSettingsGroup('documents', 'header', event.target.value)} />
                </div>
                <div>
                  <Label>Rodapé</Label>
                  <Input value={settings.documents.footer} onChange={event => updateSettingsGroup('documents', 'footer', event.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Posição da logo</Label>
                  <select className="mt-1 w-full px-3 py-2 rounded-md border border-input bg-background" value={settings.documents.logoPosition} onChange={event => updateSettingsGroup('documents', 'logoPosition', event.target.value)}>
                    <option value="left">Esquerda</option>
                    <option value="center">Centro</option>
                    <option value="right">Direita</option>
                  </select>
                </div>
                <div>
                  <Label>Fonte</Label>
                  <select className="mt-1 w-full px-3 py-2 rounded-md border border-input bg-background" value={settings.documents.fontFamily} onChange={event => updateSettingsGroup('documents', 'fontFamily', event.target.value)}>
                    {PDF_FONT_OPTIONS.map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    As opções acima são compatibilizadas com geração de PDF.
                  </p>
                </div>
                <div>
                  <Label>Tamanho do texto</Label>
                  <Input type="number" value={settings.documents.fontSize} onChange={event => updateSettingsGroup('documents', 'fontSize', Number(event.target.value))} />
                </div>
                <div>
                  <Label>Observações legais</Label>
                  <Input value={settings.documents.legalNotes} onChange={event => updateSettingsGroup('documents', 'legalNotes', event.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {[
                  ['showSignature', 'Assinatura'],
                  ['autoCrmv', 'CRMV automático'],
                  ['autoCnpj', 'CNPJ automático'],
                  ['showAddress', 'Endereço'],
                  ['showQrCode', 'QR code']
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 rounded-md border p-3 text-sm">
                    <input type="checkbox" checked={Boolean(settings.documents[key])} onChange={event => updateSettingsGroup('documents', key, event.target.checked)} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5" />
                Tipos de Consulta e Anamnese
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input placeholder="Tipo de consulta" value={consultationForm.name} onChange={event => setConsultationForm(prev => ({ ...prev, name: event.target.value }))} />
                <Input placeholder="Espécie/foco" value={consultationForm.speciesFocus} onChange={event => setConsultationForm(prev => ({ ...prev, speciesFocus: event.target.value }))} />
                <Input placeholder="Valor padrão" type="number" value={consultationForm.defaultValue} onChange={event => setConsultationForm(prev => ({ ...prev, defaultValue: event.target.value }))} />
                <Input placeholder="Duração" value={consultationForm.duration} onChange={event => setConsultationForm(prev => ({ ...prev, duration: event.target.value }))} />
              </div>
              <textarea className="w-full border rounded-md p-3 min-h-[90px]" placeholder="Texto padrão de anamnese" value={consultationForm.anamnesisText} onChange={event => setConsultationForm(prev => ({ ...prev, anamnesisText: event.target.value }))} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input placeholder="Checklist prévio separado por vírgula" value={consultationForm.checklist} onChange={event => setConsultationForm(prev => ({ ...prev, checklist: event.target.value }))} />
                <Input placeholder="Campos obrigatórios separados por vírgula" value={consultationForm.requiredFields} onChange={event => setConsultationForm(prev => ({ ...prev, requiredFields: event.target.value }))} />
              </div>
              <Button type="button" onClick={addConsultationTemplate} className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar modelo
              </Button>
              <div className="space-y-3">
                {settings.consultationTemplates.map(template => (
                  <div key={template.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{template.name}</p>
                        <p className="text-sm text-gray-500">{template.speciesFocus} • {template.duration} • {formatCurrency(template.defaultValue)}</p>
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={() => removeConsultationTemplate(template.id)} className="text-red-600">
                        Remover
                      </Button>
                    </div>
                    <p className="mt-3 text-sm text-gray-600">{template.anamnesisText}</p>
                    <p className="mt-2 text-xs text-gray-500">Checklist: {template.checklist.join(', ') || 'Não informado'}</p>
                    <p className="text-xs text-gray-500">Obrigatórios: {template.requiredFields.join(', ') || 'Não informado'}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Procedimentos e Valores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Nome do procedimento" value={newProcedure.name} onChange={event => handleProcedureFieldChange('name', event.target.value)} />
                <Input placeholder="Categoria" value={newProcedure.category} onChange={event => handleProcedureFieldChange('category', event.target.value)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <textarea className="w-full border rounded-md p-3 min-h-[96px] bg-white" placeholder="Descrição" value={newProcedure.description} onChange={event => handleProcedureFieldChange('description', event.target.value)} />
                <textarea className="w-full border rounded-md p-3 min-h-[96px] bg-white" placeholder="Observações" value={newProcedure.notes} onChange={event => handleProcedureFieldChange('notes', event.target.value)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input placeholder="Valor" type="number" value={newProcedure.chargePrice} onChange={event => handleProcedureFieldChange('chargePrice', event.target.value)} />
                <Input placeholder="Margem %" type="number" value={newProcedure.marginPercent} onChange={event => handleProcedureFieldChange('marginPercent', event.target.value)} />
                <Input placeholder="Tempo médio" value={newProcedure.duration} onChange={event => handleProcedureFieldChange('duration', event.target.value)} />
                <div className="rounded-lg border bg-white px-3 py-2 text-sm">
                  <p className="text-xs text-gray-500">Custo calculado</p>
                  <p className="font-semibold">{formatCurrency(procedureOperationalCost)}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_130px_140px] gap-3">
                <select className="w-full border rounded-md p-2 bg-white" value={selectedInventoryItemId} onChange={event => setSelectedInventoryItemId(event.target.value)}>
                  <option value="">Selecione um insumo...</option>
                  {inventoryItems.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} - {formatCurrency(item.unitCost ?? item.costPrice)}/{item.unit}
                    </option>
                  ))}
                </select>
                <Input type="number" min="0.001" step="0.001" value={selectedInventoryQuantity} onChange={event => setSelectedInventoryQuantity(event.target.value)} />
                <Button type="button" onClick={addProcedureItem} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Vincular insumo
                </Button>
              </div>
              <div className="space-y-2">
                {newProcedure.items.map(item => (
                  <div key={item.inventoryItemId} className="flex items-center justify-between rounded-md border bg-white p-3">
                    <div>
                      <p className="font-medium text-gray-900">{item.itemName}</p>
                      <p className="text-sm text-gray-500">{item.quantity} {item.unit} • {formatCurrency(item.costUnit)}</p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => removeProcedureItem(item.inventoryItemId)} className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-lg bg-orange-50 border border-orange-100 p-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-orange-700 font-semibold">Custo</p>
                  <p className="text-lg font-bold text-orange-900">{formatCurrency(procedureOperationalCost)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-orange-700 font-semibold">Valor sugerido</p>
                  <p className="text-lg font-bold text-orange-900">{formatCurrency(procedureChargePrice)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-orange-700 font-semibold">Margem</p>
                  <p className="text-lg font-bold text-orange-900">{procedureMargin.toFixed(2)}%</p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="button" onClick={addProcedure}>Salvar procedimento</Button>
              </div>
            </div>
            <div className="space-y-3">
              {procedures.map(procedure => (
                <div key={procedure.id} className="flex flex-col gap-3 rounded-lg border p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="grid flex-1 grid-cols-1 md:grid-cols-5 gap-3">
                    <div>
                      <p className="font-medium text-gray-900">{procedure.name}</p>
                      <p className="text-sm text-gray-500">{procedure.category || 'Sem categoria'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-500">Cobrança</p>
                      <p>{formatCurrency(procedure.chargePrice ?? procedure.baseCost)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-500">Custo</p>
                      <p>{formatCurrency(procedure.operationalCost)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-500">Margem</p>
                      <p>{Number(procedure.marginPercent || 0).toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-500">Tempo / insumos</p>
                      <p>{procedure.averageTime || procedure.duration || '-'} / {procedure.items.length}</p>
                    </div>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => removeProcedure(procedure.id)} className="text-red-600">
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Modelos de Documentos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input placeholder="Tipo" value={documentTemplateForm.type} onChange={event => setDocumentTemplateForm(prev => ({ ...prev, type: event.target.value }))} />
                <Input placeholder="Título" value={documentTemplateForm.title} onChange={event => setDocumentTemplateForm(prev => ({ ...prev, title: event.target.value }))} />
              </div>
              <textarea className="w-full border rounded-md p-3 min-h-[110px]" placeholder="Texto do modelo" value={documentTemplateForm.content} onChange={event => setDocumentTemplateForm(prev => ({ ...prev, content: event.target.value }))} />
              <Button type="button" onClick={addDocumentTemplate} className="gap-2">
                <Plus className="h-4 w-4" />
                Salvar modelo
              </Button>
              <div className="space-y-3">
                {settings.documentTemplates.map(template => (
                  <div key={template.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{template.title}</p>
                        <p className="text-xs uppercase text-gray-500">{template.type}</p>
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={() => removeDocumentTemplate(template.id)} className="text-red-600">
                        Remover
                      </Button>
                    </div>
                    <pre className="mt-3 whitespace-pre-wrap text-sm text-gray-600 font-sans">{template.content}</pre>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Mensagens Automáticas e WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input placeholder="Tipo de mensagem" value={messageTemplateForm.type} onChange={event => setMessageTemplateForm(prev => ({ ...prev, type: event.target.value }))} />
                <select className="w-full px-3 py-2 rounded-md border border-input bg-background" value={messageTemplateForm.channel} onChange={event => setMessageTemplateForm(prev => ({ ...prev, channel: event.target.value }))}>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">E-mail</option>
                  <option value="sms">SMS</option>
                </select>
                <Input placeholder="Variáveis separadas por vírgula" value={messageTemplateForm.variables} onChange={event => setMessageTemplateForm(prev => ({ ...prev, variables: event.target.value }))} />
              </div>
              <textarea className="w-full border rounded-md p-3 min-h-[110px]" placeholder="Ex: Olá, {nome_tutor}..." value={messageTemplateForm.template} onChange={event => setMessageTemplateForm(prev => ({ ...prev, template: event.target.value }))} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={messageTemplateForm.enabled} onChange={event => setMessageTemplateForm(prev => ({ ...prev, enabled: event.target.checked }))} />
                Mensagem ativa
              </label>
              <Button type="button" onClick={addMessageTemplate} className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar mensagem
              </Button>
              <div className="space-y-3">
                {settings.automatedMessages.map(message => (
                  <div key={message.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{message.type}</p>
                        <p className="text-xs text-gray-500">{message.channel} • {message.enabled ? 'Ativa' : 'Inativa'}</p>
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={() => removeMessageTemplate(message.id)} className="text-red-600">
                        Remover
                      </Button>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{message.template}</p>
                    <p className="mt-1 text-xs text-gray-500">Variáveis: {message.variables.join(', ') || 'Nenhuma'}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border p-4 space-y-4">
                <p className="font-semibold text-gray-900">Integração com WhatsApp</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input placeholder="Provider" value={settings.whatsapp.provider} onChange={event => updateSettingsGroup('whatsapp', 'provider', event.target.value)} />
                  <Input placeholder="API URL" value={settings.whatsapp.apiUrl} onChange={event => updateSettingsGroup('whatsapp', 'apiUrl', event.target.value)} />
                  <Input placeholder="Nome da instância" value={settings.whatsapp.instanceName} onChange={event => updateSettingsGroup('whatsapp', 'instanceName', event.target.value)} />
                  <Input placeholder="Token" value={settings.whatsapp.token} onChange={event => updateSettingsGroup('whatsapp', 'token', event.target.value)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    ['connected', 'Conectado'],
                    ['autoSendMessages', 'Envio automático'],
                    ['sendPdf', 'Envio de PDF'],
                    ['sendReminders', 'Lembretes'],
                    ['confirmAppointments', 'Confirmação de consulta'],
                    ['chargeNotifications', 'Cobrança'],
                    ['paymentLink', 'Link de pagamento']
                  ].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 rounded-md border p-3 text-sm">
                      <input type="checkbox" checked={Boolean(settings.whatsapp[key])} onChange={event => updateSettingsGroup('whatsapp', key, event.target.checked)} />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Protocolos de Sedação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 rounded-lg border bg-gray-50 p-4">
              <Input placeholder="Medicamento" value={newSedation.name} onChange={event => setNewSedation(prev => ({ ...prev, name: event.target.value }))} />
              <Input placeholder="Dosagem" value={newSedation.dosage} onChange={event => setNewSedation(prev => ({ ...prev, dosage: event.target.value }))} />
              <Input placeholder="Observações" value={newSedation.notes} onChange={event => setNewSedation(prev => ({ ...prev, notes: event.target.value }))} />
              <Button type="button" onClick={addSedation}>Adicionar</Button>
            </div>
            <div className="space-y-2">
              {sedationTypes.map(sedation => (
                <div key={sedation.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="grid flex-1 grid-cols-1 md:grid-cols-3 gap-4">
                    <span className="font-medium">{sedation.name}</span>
                    <span className="text-blue-600">{sedation.dosage}</span>
                    <span className="text-gray-600">{sedation.notes}</span>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => removeSedation(sedation.id)} className="text-red-600">
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Document Preview Modal */}
        {previewModel && (
          <Modal isOpen={!!previewModel} onClose={() => setPreviewModel(null)} title={`Prévia do ${previewModel === 'classic' ? 'Modelo Clássico' : previewModel === 'minimal' ? 'Modelo Minimalista' : 'Modelo Premium'}`}>
            <div className="p-8 bg-gray-250 min-h-[600px] flex justify-center overflow-auto rounded-lg">
              <div className="w-[450px] bg-white shadow-2xl min-h-[580px] p-6 relative flex flex-col font-sans">
                
                {/* Header Rendering */}
                {previewModel === 'classic' && (
                  <div className="mb-6">
                    <div className="h-24 bg-[#0B2C4D] -mx-6 -mt-6 p-6 text-white flex items-center justify-between">
                      <div>
                          <div className="text-lg font-bold">Vet Tooth</div>
                          <div className="text-[10px] opacity-80">Odontologia Veterinária Especializada</div>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded flex items-center justify-center text-[10px]">LOGO</div>
                    </div>
                    <div className="mt-6 text-center">
                      <div className="text-sm font-bold border-b-2 inline-block px-4 pb-1">RECEITUÁRIO</div>
                    </div>
                  </div>
                )}

                {previewModel === 'minimal' && (
                  <div className="mb-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-gray-100 flex items-center justify-center text-[10px] border">LOGO</div>
                      <div className="text-right">
                         <div className="text-sm font-bold text-[#0B2C4D]">Vet Tooth</div>
                         <div className="text-[9px] text-gray-500">Clínica Geral</div>
                      </div>
                    </div>
                    <div className="h-[2px] bg-[#0B2C4D] w-full mb-8"></div>
                    <div className="text-center font-bold text-lg mb-8 tracking-tight">Prescrição Médica</div>
                  </div>
                )}

                {previewModel === 'premium' && (
                  <div className="mb-6">
                     <div className="h-1.5 bg-[#0B2C4D] -mx-6 -mt-6"></div>
                     <div className="flex flex-col items-center mt-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-full border flex items-center justify-center text-[9px] mb-2">LOGO</div>
                        <div className="text-xl font-bold uppercase tracking-widest text-slate-800">Vet Tooth</div>
                        <div className="w-24 h-[1px] bg-[#0B2C4D] my-2"></div>
                        <div className="text-[10px] italic text-slate-500 mb-8 underline underline-offset-4">Relatório Clínico Premium</div>
                     </div>
                  </div>
                )}

                {/* Mock Content */}
                <div className="flex-1 space-y-4">
                   <div className="p-3 bg-gray-50 rounded border border-dashed text-[10px] text-gray-400">
                      Dados do paciente e do tutor...
                   </div>
                   <div className="space-y-2">
                      <div className="h-3 w-1/3 bg-gray-100"></div>
                      <div className="h-20 w-full bg-gray-50 border rounded p-2 text-[9px] text-gray-400">Prescrição e orientações detalhadas aqui...</div>
                   </div>
                   <div className="space-y-2">
                      <div className="h-3 w-1/3 bg-gray-100"></div>
                      <div className="h-12 w-full bg-gray-50 border rounded p-2 text-[9px] text-gray-400">Observações legais configuradas.</div>
                   </div>
                </div>

                {/* Footer Rendering */}
                <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between items-end">
                   <div className="space-y-1">
                      <div className="w-32 h-[1px] bg-gray-400 mb-1"></div>
                      <div className="text-[8px] font-bold">Dr. Lucas Ferreira</div>
                      <div className="text-[7px] text-gray-500">CRMV-SP 12345</div>
                   </div>
                   <div className="flex flex-col items-end gap-1">
                      <div className="text-[7px] text-gray-400 max-w-[120px] text-right">Rua das Flores, 123 - Centro, Sorocaba/SP</div>
                      <div className="w-8 h-8 bg-gray-100 border text-[6px] flex items-center justify-center">QR</div>
                   </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => {
                  updateSettingsGroup('documents', 'selectedModel', previewModel)
                  setPreviewModel(null)
                  alert(`Modelo ${previewModel === 'classic' ? 'Clássico' : previewModel === 'minimal' ? 'Minimalista' : 'Premium'} selecionado. Clique em "Salvar Alterações" no topo para aplicar.`)
              }} className="bg-blue-600 text-white">Usar este modelo</Button>
            </div>
          </Modal>
        )}
        <div className="fixed bottom-4 right-4 z-30 flex gap-2 lg:hidden">
          <Button variant="outline" onClick={exportData} className="gap-2 bg-white shadow-lg">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button onClick={handleSaveSettings} disabled={isSaving} className="gap-2 shadow-lg">
            <Save className="h-4 w-4" />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>
    </Layout>
  )
}
