import { create } from 'zustand'

interface ThemeState {
  isDark: boolean
  toggleTheme: () => void
  setTheme: (isDark: boolean) => void
}

export const useThemeStore = create<ThemeState>((set) => {
  // Initialize from localStorage if available
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('theme-storage')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed.state?.isDark) {
          return {
            isDark: parsed.state.isDark,
            toggleTheme: () => set((state) => {
              const newValue = !state.isDark
              localStorage.setItem('theme-storage', JSON.stringify({ state: { isDark: newValue } }))
              return { isDark: newValue }
            }),
            setTheme: (isDark: boolean) => {
              localStorage.setItem('theme-storage', JSON.stringify({ state: { isDark } }))
              set({ isDark })
            },
          }
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  }

  return {
    isDark: false,
    toggleTheme: () => set((state) => {
      const newValue = !state.isDark
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme-storage', JSON.stringify({ state: { isDark: newValue } }))
      }
      return { isDark: newValue }
    }),
    setTheme: (isDark: boolean) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme-storage', JSON.stringify({ state: { isDark } }))
      }
      set({ isDark })
    },
  }
})

