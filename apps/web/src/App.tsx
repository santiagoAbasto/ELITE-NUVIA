import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import PropiedadesPage from './pages/PropiedadesPage'
import PropiedadDetailPage from './pages/PropiedadDetailPage'
import AgentePage from './pages/AgentePage'
import ServiciosPage from './pages/ServiciosPage'
import NosotrosPage from './pages/NosotrosPage'
import ContactoPage from './pages/ContactoPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/propiedades" element={<PropiedadesPage />} />
        <Route path="/propiedades/:slug" element={<PropiedadDetailPage />} />
        <Route path="/agentes/:slug" element={<AgentePage />} />
        <Route path="/servicios" element={<ServiciosPage />} />
        <Route path="/nosotros" element={<NosotrosPage />} />
        <Route path="/contacto" element={<ContactoPage />} />
      </Route>
    </Routes>
  )
}
