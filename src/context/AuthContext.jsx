// Contexto de autenticación — proporciona la sesión del usuario a toda la app.
// Cualquier componente puede llamar a useAuth() para obtener session, isAdmin,
// signIn, signUp y signOut sin necesidad de pasar props manualmente.
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

// Consulta la tabla profiles para comprobar si el usuario es administrador
async function resolveRole(session) {
  if (!session) return false
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()
  return data?.role === 'admin'
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false)

  useEffect(() => {
    let timeoutId = setTimeout(() => setLoading(false), 5000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        clearTimeout(timeoutId)
        setSession(session)
        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true)
        } else if (event === 'SIGNED_OUT') {
          setIsPasswordRecovery(false)
        }
        setIsAdmin(await resolveRole(session).catch(() => false))
        setLoading(false)
      }
    )

    return () => {
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    session,
    loading,
    isAdmin,
    isPasswordRecovery,
    signIn: (email, password) =>
      supabase.auth.signInWithPassword({ email, password }),
    signUp: (email, password) =>
      supabase.auth.signUp({ email, password }),
    signOut: () => supabase.auth.signOut(),
    resetPassword: (email) =>
      supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin }),
    updatePassword: async (password) => {
      const result = await supabase.auth.updateUser({ password })
      if (!result.error) setIsPasswordRecovery(false)
      return result
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
