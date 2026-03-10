// Contexto de autenticacion con Supabase Auth
// Contexto de autenticación con Supabase Auth
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

  useEffect(() => {
    // Timeout de seguridad: si Supabase tarda más de 5 s, dejamos de mostrar el spinner
    let timeoutId = setTimeout(() => setLoading(false), 5000)

    // onAuthStateChange se dispara al cargar la página y cada vez que el usuario
    // inicia o cierra sesión, lo que mantiene la app sincronizada automáticamente
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        clearTimeout(timeoutId)
        setSession(session)
        setIsAdmin(await resolveRole(session).catch(() => false))
        setLoading(false)
      }
    )

    // Limpieza: cancelamos la suscripción al desmontar el proveedor
    return () => {
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    session,
    loading,
    isAdmin,
    signIn: (email, password) =>
      supabase.auth.signInWithPassword({ email, password }),
    signUp: (email, password, name) =>
      supabase.auth.signUp({ email, password, options: { data: { name } } }),
    signOut: () => supabase.auth.signOut(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
