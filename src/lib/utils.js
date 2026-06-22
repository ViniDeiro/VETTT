import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

let cachedRegionalSettings = {
  dateFormat: 'DD/MM/AAAA',
  timeFormat: '24h',
  currency: 'BRL',
  language: 'pt-BR',
  decimalSeparator: ','
}

export function syncCachedSettings(settings) {
  if (settings?.regional) {
    cachedRegionalSettings = {
      dateFormat: settings.regional.dateFormat || 'DD/MM/AAAA',
      timeFormat: settings.regional.timeFormat || '24h',
      currency: settings.regional.currency || 'BRL',
      language: settings.regional.language || 'pt-BR',
      decimalSeparator: settings.regional.decimalSeparator || ','
    }
  }
}

export function getRegionalSettings() {
  return cachedRegionalSettings
}

function pad(value) {
  return String(value).padStart(2, '0')
}

function formatNumericParts(parts, decimalSeparator) {
  const groupSeparator = decimalSeparator === ',' ? '.' : ','

  return parts.map(part => {
    if (part.type === 'decimal') return decimalSeparator
    if (part.type === 'group') return groupSeparator
    return part.value
  }).join('')
}

export function formatDate(date) {
  if (!date) return '-'
  const { dateFormat } = getRegionalSettings()
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return String(date)

  if (dateFormat === 'MM/DD/YYYY') {
    return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`
  }
  
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

export function formatTime(date) {
  if (!date) return '-'
  const { timeFormat, language } = getRegionalSettings()

  const d = new Date(date)
  if (isNaN(d.getTime())) return String(date)

  return d.toLocaleTimeString(language, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: timeFormat === '12h'
  })
}

export function formatNumber(value, options = {}) {
  const { language, decimalSeparator } = getRegionalSettings()
  const number = Number(value || 0)

  if (!Number.isFinite(number)) return '0'

  const parts = new Intl.NumberFormat(language, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options
  }).formatToParts(number)

  return formatNumericParts(parts, decimalSeparator)
}

export function formatCurrency(value) {
  const { currency, language, decimalSeparator } = getRegionalSettings()
  const number = Number(value || 0)

  const parts = new Intl.NumberFormat(language, {
    style: 'currency',
    currency: currency
  }).formatToParts(Number.isFinite(number) ? number : 0)

  return formatNumericParts(parts, decimalSeparator)
}
