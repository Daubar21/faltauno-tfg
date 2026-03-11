// Cliente de Supabase — se importa en todos los servicios para acceder a la base de datos.
// Las variables de entorno (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) se definen en el
// archivo .env y nunca se suben al repositorio.
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// La opción "lock" evita que múltiples pestañas del navegador escriban el token
// de sesión a la vez, previniendo condiciones de carrera con localStorage.
export const supabase = createClient(url, key, {
  auth: {
    lock: async (_name, _acquireTimeout, fn) => fn(),
  },
})
