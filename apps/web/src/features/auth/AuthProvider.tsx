import { useCallback, useEffect, useMemo, useState } from 'react'

import { supabase } from '../../lib/supabase'
import {
  AuthContext,
  type AuthContextValue,
  type AuthIdentity,
} from './auth-context'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [identity, setIdentity] = useState<AuthIdentity | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshIdentity = useCallback(async () => {
    const { data, error } = await supabase.auth.getClaims()

    if (error || !data?.claims?.sub) {
      setIdentity(null)
    } else {
      setIdentity({
        id: data.claims.sub,
        email: typeof data.claims.email === 'string' ? data.claims.email : null,
      })
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    void refreshIdentity()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refreshIdentity()
    })

    return () => subscription.unsubscribe()
  }, [refreshIdentity])

  const value = useMemo<AuthContextValue>(
    () => ({
      identity,
      isLoading,
      signOut: async () => {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        setIdentity(null)
      },
    }),
    [identity, isLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
