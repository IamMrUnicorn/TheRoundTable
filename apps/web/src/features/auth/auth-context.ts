import { createContext, useContext } from 'react'

export type AuthIdentity = {
  id: string
  email: string | null
}

export type AuthContextValue = {
  identity: AuthIdentity | null
  isLoading: boolean
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
