import { createContext, useContext, useState, useEffect } from 'react'
import { darkTheme, lightTheme } from './theme.js'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('roadmaps-theme') || 'light')
  const theme = mode === 'dark' ? darkTheme : lightTheme

  useEffect(() => {
    localStorage.setItem('roadmaps-theme', mode)
  }, [mode])

  const toggle = () => setMode(m => m === 'dark' ? 'light' : 'dark')

  return (
    <ThemeContext.Provider value={{ theme, mode, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
