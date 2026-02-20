'use client'

import { useEffect, useState } from 'react'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'light') setDark(false)
    else setDark(true)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <html lang="fr" className={dark ? 'dark' : ''}>
      <head>
        <title>FitJournal</title>
        <meta name="description" content="Ton journal d'entraînement social" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#ff4500" />
      </head>
      <body>
        <ThemeContext.Provider value={{ dark, setDark }}>
          {children}
        </ThemeContext.Provider>
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
      </body>
    </html>
  )
}

import { createContext, useContext } from 'react'
export const ThemeContext = createContext<{ dark: boolean; setDark: (d: boolean) => void }>({
  dark: true,
  setDark: () => {},
})
export const useTheme = () => useContext(ThemeContext)