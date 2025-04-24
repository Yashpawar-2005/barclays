import React from "react"
import { Routes, Route, Navigate } from "react-router-dom"

import HomePage            from "./pages/Homepages/HomePage"
import SignupPage          from "./pages/auth/SignupPage"
import LoginPage           from "./pages/auth/LoginPage"
import OrganisationPage    from "./pages/Mainpages/Organisationpage"
import OrgidPage           from "./pages/Organisationpage/Orgid"
import TermsheetPage       from "./pages/Organisationpage/PAGE"     // detail view
import UploadingTermsheet  from "./pages/Mainpages/UploadingTermsheet"
import AdminDashboard      from "./components/comps/admin/Adminpage"

import { useUserStore } from "./services/auth.service"

export default function App() {
  const { user } = useUserStore()

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/"
        element={!user ? <HomePage /> : <OrganisationPage />}
      />
      <Route
        path="/signup"
        element={!user ? <SignupPage /> : <Navigate to="/" replace />}
      />
      <Route
        path="/login"
        element={!user ? <LoginPage /> : <Navigate to="/" replace />}
      />

      {/* Organization flows */}
      <Route
        path="/org/:orgId"
        element={user ? <OrgidPage /> : <Navigate to="/" replace />}
      />
      <Route
        path="/org/:orgId/upload"
        element={user ? <UploadingTermsheet /> : <Navigate to="/" replace />}
      />

      {/* Termsheet detail under org (read-only) */}
      <Route
        path="/termsheet/:orgId"
        element={user ? <TermsheetPage /> : <Navigate to="/" replace />}
      />
      <Route
        path="/role/termsheet/:orgId"
        element={user ? <TermsheetPage /> : <Navigate to="/" replace />}
      />

      {/* Admin flows */}
      <Route
        path="/admin/:orgId"
        element={user ? <AdminDashboard /> : <Navigate to="/" replace />}
      />
      <Route
    path="/org/:id/upload"
    element={user ? <UploadingTermsheet /> : <Navigate to="/" replace />}
  />
      <Route
        path="/admin/:orgId/termsheet/:termsheetId"
        element={user ? <TermsheetPage /> : <Navigate to="/" replace />}
      />

      {/* Catch-all */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  )
}