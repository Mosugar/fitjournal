'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'

const ThemeContext = createContext<{
  dark: boolean
  setDark: (d: boolean) => void
}>({
  dark: true,
  setDark: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    setDark(saved !== 'light')
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark, mounted])

  return (
    <ThemeContext.Provider value={{ dark, setDark }}>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--card)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            fontFamily: 'DM Sans, sans-serif',
          },
        }}
      />
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)