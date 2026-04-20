import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { mockDB } from "../services/mockDatabase"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date) {
  if (!date) return '-'
  const settings = mockDB.getSettings()
  const format = settings.regional.dateFormat || 'DD/MM/AAAA'
  const lang = settings.regional.language || 'pt-BR'
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return String(date)

  if (format === 'MM/DD/YYYY') {
    return d.toLocaleDateString('en-US')
  }
  
  return d.toLocaleDateString(lang)
}

export function formatTime(date) {
  if (!date) return '-'
  const settings = mockDB.getSettings()
  const format = settings.regional.timeFormat || '24h'
  const lang = settings.regional.language || 'pt-BR'

  const d = new Date(date)
  if (isNaN(d.getTime())) return String(date)

  return d.toLocaleTimeString(lang, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: format === '12h'
  })
}

export function formatCurrency(value) {
  const settings = mockDB.getSettings()
  const currency = settings.regional.currency || 'BRL'
  const lang = settings.regional.language || 'pt-BR'
  
  return new Intl.NumberFormat(lang, {
    style: 'currency',
    currency: currency
  }).format(value || 0)
}