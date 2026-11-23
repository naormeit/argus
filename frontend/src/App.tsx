import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import CookieBanner from './components/CookieBanner'
import RouteMeta from './components/RouteMeta'
import SiteFooter from './components/SiteFooter'
import Landing from './pages/Landing'
import Audit from './pages/Audit'
import ReportPage from './pages/Report'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Pricing from './pages/Pricing'
import Success from './pages/Success'
import GitHub from './pages/GitHub'
import Admin from './pages/Admin'
import About from './pages/About'
import Contact from './pages/Contact'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import NotFound from './pages/NotFound'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])
  return null
}

function AppShell() {
  const { pathname } = useLocation()
  const hasOwnFooter = pathname === '/'

  return (
    <>
      <RouteMeta />
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/"              element={<Landing />} />
        <Route path="/audit"         element={<Audit />} />
        <Route path="/report/:id"    element={<ReportPage />} />
        <Route path="/login"         element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard"     element={<Dashboard />} />
        <Route path="/pricing"       element={<Pricing />} />
        <Route path="/success"       element={<Success />} />
        <Route path="/github"        element={<GitHub />} />
        <Route path="/admin"         element={<Admin />} />
        <Route path="/about"         element={<About />} />
        <Route path="/contact"       element={<Contact />} />
        <Route path="/privacy"       element={<Privacy />} />
        <Route path="/terms"         element={<Terms />} />
        <Route path="/404"           element={<NotFound />} />
        <Route path="*"              element={<NotFound />} />
      </Routes>
      {!hasOwnFooter && <SiteFooter />}
      <CookieBanner />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  )
}
