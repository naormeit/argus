import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Audit from './pages/Audit'
import ReportPage from './pages/Report'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/"          element={<Landing />} />
          <Route path="/audit"     element={<Audit />} />
          <Route path="/report/:id" element={<ReportPage />} />
          <Route path="/login"     element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*"          element={<Landing />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
