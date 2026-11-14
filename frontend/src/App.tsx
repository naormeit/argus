import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import CookieBanner from './components/CookieBanner'
import Landing from './pages/Landing'
import Audit from './pages/Audit'
import ReportPage from './pages/Report'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Pricing from './pages/Pricing'
import Success from './pages/Success'
import GitHub from './pages/GitHub'
import Admin from './pages/Admin'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/"           element={<Landing />} />
          <Route path="/audit"      element={<Audit />} />
          <Route path="/report/:id" element={<ReportPage />} />
          <Route path="/login"      element={<Login />} />
          <Route path="/dashboard"  element={<Dashboard />} />
          <Route path="/pricing"    element={<Pricing />} />
          <Route path="/success"    element={<Success />} />
          <Route path="/github"     element={<GitHub />} />
          <Route path="/admin"      element={<Admin />} />
          <Route path="/privacy"    element={<Privacy />} />
          <Route path="/terms"      element={<Terms />} />
          <Route path="*"           element={<Landing />} />
        </Routes>
        <CookieBanner />
      </AuthProvider>
    </BrowserRouter>
  )
}
