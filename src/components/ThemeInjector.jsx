import React, { useEffect } from 'react'
import { mockDB } from '../services/mockDatabase'

const normalizeHex = (hex, fallback) => {
  if (typeof hex !== 'string') return fallback

  const value = hex.trim()
  const expanded = value.length === 4
    ? `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`
    : value

  return /^#[0-9a-f]{6}$/i.test(expanded) ? expanded : fallback
}

const hexToRgb = (hex, fallback) => {
  const normalized = normalizeHex(hex, fallback)
  const raw = normalized.slice(1)

  return {
    r: Number.parseInt(raw.slice(0, 2), 16),
    g: Number.parseInt(raw.slice(2, 4), 16),
    b: Number.parseInt(raw.slice(4, 6), 16)
  }
}

const rgbChannels = (hex, fallback) => {
  const { r, g, b } = hexToRgb(hex, fallback)
  return `${r}, ${g}, ${b}`
}

const hexToHslChannels = (hex, fallback) => {
  const { r, g, b } = hexToRgb(hex, fallback)
  const red = r / 255
  const green = g / 255
  const blue = b / 255
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const delta = max - min

  let hue = 0
  let saturation = 0
  const lightness = (max + min) / 2

  if (delta !== 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1))

    switch (max) {
      case red:
        hue = 60 * (((green - blue) / delta) % 6)
        break
      case green:
        hue = 60 * ((blue - red) / delta + 2)
        break
      default:
        hue = 60 * ((red - green) / delta + 4)
        break
    }
  }

  if (hue < 0) hue += 360

  return `${Math.round(hue)} ${Math.round(saturation * 100)}% ${Math.round(lightness * 100)}%`
}

const getReadableForeground = (hex, fallback) => {
  const { r, g, b } = hexToRgb(hex, fallback)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.62 ? '#111827' : '#FFFFFF'
}

export default function ThemeInjector() {
  useEffect(() => {
    const applyTheme = () => {
      const settings = mockDB.getSettings()
      const root = document.documentElement
      
      if (settings?.appearance) {
        const primaryColor = normalizeHex(settings.appearance.primaryColor, '#0B2C4D')
        const buttonColor = normalizeHex(settings.appearance.buttonColor, '#00BFA5')
        const sidebarColor = normalizeHex(settings.appearance.sidebarColor, '#0B2C4D')

        root.style.setProperty('--clinic-primary', primaryColor)
        root.style.setProperty('--clinic-button', buttonColor)
        root.style.setProperty('--clinic-sidebar', sidebarColor)
        root.style.setProperty('--clinic-primary-rgb', rgbChannels(primaryColor, '#0B2C4D'))
        root.style.setProperty('--clinic-button-rgb', rgbChannels(buttonColor, '#00BFA5'))
        root.style.setProperty('--clinic-primary-foreground', getReadableForeground(primaryColor, '#0B2C4D'))
        root.style.setProperty('--clinic-button-foreground', getReadableForeground(buttonColor, '#00BFA5'))
        root.style.setProperty('--primary', hexToHslChannels(primaryColor, '#0B2C4D'))
        root.style.setProperty('--ring', hexToHslChannels(primaryColor, '#0B2C4D'))

        if (settings.appearance.appIcon) {
          let favicon = document.querySelector("link[rel='icon']")
          if (!favicon) {
            favicon = document.createElement('link')
            favicon.setAttribute('rel', 'icon')
            document.head.appendChild(favicon)
          }
          favicon.setAttribute('href', settings.appearance.appIcon)
        }
      }

      if (settings?.regional?.language) {
        root.setAttribute('lang', settings.regional.language)
      }

      if (settings?.clinic?.fantasyName) {
        document.title = settings.clinic.fantasyName
      }
    }

    applyTheme()
    window.addEventListener('vet-settings-updated', applyTheme)
    return () => window.removeEventListener('vet-settings-updated', applyTheme)
  }, [])

  return null
}
