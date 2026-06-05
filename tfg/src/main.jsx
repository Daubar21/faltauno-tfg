// Punto de entrada de la aplicación. Monta el árbol de componentes React
// sobre el elemento <div id="root"> del index.html.
// AuthProvider envuelve toda la app para que cualquier componente pueda
// acceder a la sesión del usuario a través del contexto.
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <App />
  </AuthProvider>
)
