import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminRoute from './components/AdminRoute.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

import './index.css'
import App from './App.jsx'
import Login from './components/auth/Login.jsx'
import Register from './components/auth/Register.jsx'

// Admin pages
import AdminLayout from './pages/Admin/AdminLayout.jsx'
import Dashboard from './pages/Admin/Dashboard.jsx'
import EventManagement from './pages/Admin/Event.jsx'
import UsersManagement from './pages/Admin/Users.jsx'
import ProductManagement from './pages/Admin/Product.jsx'
import ProjectManagement from './pages/Admin/ProjectAdmin.jsx'
import SettingsManagement from './pages/Admin/Settings.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Public/Protected App (single-page scroll design) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <App />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />

          {/* Admin Dashboard Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <ErrorBoundary>
                  <AdminLayout />
                </ErrorBoundary>
              </AdminRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="events" element={<EventManagement />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="store" element={<ProductManagement />} />
            <Route path="projects" element={<ProjectManagement />} />
            <Route path="settings" element={<SettingsManagement />} />
            {/* Future admin sub-routes will go here:
              <Route path="donations" element={<ManageDonations />} />
              <Route path="analytics" element={<ManageAnalytics />} />
              etc.
            */}
          </Route>

          {/* Fallback: redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
