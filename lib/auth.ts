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
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

// Mock users database
const MOCK_USERS: (User & { password: string })[] = [
  {
    id: "1",
    email: "admin@fabnest3d.com",
    password: "admin123",
    name: "Admin User",
    role: "admin",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    email: "user@example.com",
    password: "user123",
    name: "John Doe",
    role: "user",
    createdAt: new Date().toISOString(),
  },
]

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        const user = MOCK_USERS.find((u) => u.email === email && u.password === password)

        if (user) {
          const { password: _, ...userWithoutPassword } = user
          set({ user: userWithoutPassword, isAuthenticated: true })
          return { success: true }
        }

        return { success: false, error: "Invalid email or password" }
      },
      signup: async (email: string, password: string, name: string) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Check if user already exists
        const existingUser = MOCK_USERS.find((u) => u.email === email)
        if (existingUser) {
          return { success: false, error: "Email already registered" }
        }

        // Create new user
        const newUser: User = {
          id: String(MOCK_USERS.length + 1),
          email,
          name,
          role: "user",
          createdAt: new Date().toISOString(),
        }

        MOCK_USERS.push({ ...newUser, password })
        set({ user: newUser, isAuthenticated: true })
        return { success: true }
      },
      logout: () => {
        set({ user: null, isAuthenticated: false })
      },
    }),
    {
      name: "auth-storage",
    },
  ),
)
