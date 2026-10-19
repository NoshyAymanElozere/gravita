import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const listeners = new Set<(t: Theme) => void>()

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('erp-theme') as Theme) ?? 'system'
  })

  useEffect(() => {
    const root = window.document.documentElement
    const effective = theme === 'system' ? getSystemTheme() : theme
    
    root.classList.remove('light', 'dark')
    root.classList.add(effective)
    
    // Set AG Grid theme variables globally on documentElement
    root.setAttribute('data-ag-theme-mode', effective)
    root.classList.add('ag-theme-mode')
  }, [theme])

  useEffect(() => {
    listeners.add(setThemeState)
    return () => {
      listeners.delete(setThemeState)
    }
  }, [])

  const setTheme = (t: Theme) => {
    localStorage.setItem('erp-theme', t)
    listeners.forEach((listener) => listener(t))
  }

  return { theme, setTheme }
}

