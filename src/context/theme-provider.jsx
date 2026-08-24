import { createContext, useContext, useEffect, useState } from 'react'
import { getCookie, setCookie } from '../lib/cookies'

const ThemeProviderContext = createContext({
  theme: 'light',
  setTheme: () => null,
})

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'vite-ui-theme',
  ...props
}) {
  const [theme, setThemeState] = useState(() => {
    return getCookie(storageKey) || defaultTheme
  })

  useEffect(() => {
    const root = window.document.documentElement
    
    // Remove all previous theme classes
    root.classList.remove('theme-light', 'theme-dark', 'theme-blue', 'theme-orange')
    
    // Add new theme class
    root.classList.add(`theme-${theme}`)
    
    // Set color scheme for browser elements
    if (theme === 'dark' || theme === 'blue' || theme === 'orange') {
      root.style.colorScheme = 'dark'
    } else {
      root.style.colorScheme = 'light'
    }
  }, [theme])

  const setTheme = (newTheme) => {
    setCookie(storageKey, newTheme)
    setThemeState(newTheme)
  }

  return (
    <ThemeProviderContext.Provider
      value={{ theme, setTheme }}
      {...props}
    >
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
