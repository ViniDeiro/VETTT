import React, { useEffect } from 'react'
import { mockDB } from '../services/mockDatabase'

export default function ThemeInjector() {
  useEffect(() => {
    const applyTheme = () => {
      const settings = mockDB.getSettings()
      const root = document.documentElement
      
      if (settings?.appearance) {
        root.style.setProperty('--clinic-primary', settings.appearance.primaryColor || '#0B2C4D')
        root.style.setProperty('--clinic-button', settings.appearance.buttonColor || '#00BFA5')
        root.style.setProperty('--clinic-sidebar', settings.appearance.sidebarColor || '#0B2C4D')
      }
    }

    applyTheme()
    window.addEventListener('vet-settings-updated', applyTheme)
    return () => window.removeEventListener('vet-settings-updated', applyTheme)
  }, [])

  return null
}
