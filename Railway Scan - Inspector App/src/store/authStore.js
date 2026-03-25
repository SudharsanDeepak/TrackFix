import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token, refreshToken) => {
        localStorage.setItem('token', token)
        localStorage.setItem('refreshToken', refreshToken)
        set({ user, token, isAuthenticated: true })
      },

      logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        set({ user: null, token: null, isAuthenticated: false })
      },

      updateUser: (userData) => set({ user: userData }),
      getUser: () => get().user,
    }),
    {
      name: 'inspector-auth',
      partialize: state => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
)
