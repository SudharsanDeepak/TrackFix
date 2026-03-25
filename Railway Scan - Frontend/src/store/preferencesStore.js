import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const usePreferencesStore = create(
  persist(
    set => ({
      language: 'en',
      theme: 'light',
      notificationsEnabled: true,

      setLanguage: language => set({ language }),
      setTheme: theme => set({ theme }),
      setNotificationsEnabled: enabled => set({ notificationsEnabled: enabled }),

      updatePreferences: preferences => set(preferences),

      resetPreferences: () =>
        set({
          language: 'en',
          theme: 'light',
          notificationsEnabled: true,
        }),
    }),
    {
      name: 'railtrack-preferences',
    }
  )
)
