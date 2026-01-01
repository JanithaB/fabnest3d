"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type User = {
  id: string
  email: string
  name: string
  role: "user" | "admin"
  createdAt: string
}

type AuthState = {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setHasHydrated: (state) => {
        set({
          _hasHydrated: state
        })
      },
      login: async (email: string, password: string) => {
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          })

          let data
          try {
            data = await response.json()
          } catch (parseError) {
            console.error('Failed to parse response:', parseError)
            return { success: false, error: 'Invalid response from server' }
          }

          if (!response.ok) {
            return { success: false, error: data.error || 'Login failed' }
          }

          // Validate response data
          if (!data.user || !data.token) {
            console.error('Invalid response data:', data)
            return { success: false, error: 'Invalid response from server' }
          }

          // Store user and token
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
          })

          return { success: true }
        } catch (error: any) {
          console.error('Login error:', error)
          return { success: false, error: error.message || 'Network error. Please try again.' }
        }
      },
      signup: async (email: string, password: string, name: string) => {
        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, name }),
          })

          const data = await response.json()

          if (!response.ok) {
            return { success: false, error: data.error || 'Registration failed' }
          }

          // Store user and token
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
          })

          return { success: true }
        } catch (error: any) {
          console.error('Registration error:', error)
          return { success: false, error: 'Network error. Please try again.' }
        }
      },
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    },
  ),
)
