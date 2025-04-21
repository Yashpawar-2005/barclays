import {  Routes, Route, Navigate } from "react-router-dom"
import HomePage from "./pages/Homepages/HomePage";
import SignupPage from "./pages/auth/SignupPage"
import LoginPage from "./pages/auth/LoginPage"
import { useUserStore } from "./services/auth.service";
import Organisationpage from "./pages/Mainpages/Organisationpage";
import Orgid from "./pages/Organisationpage/Orgid";
import PAGE from "./pages/Organisationpage/PAGE";
import AdminDashboard from "./components/comps/admin/Adminpage";
import { TeamMemberSidebar } from "./components/comps/Rightsidebars/termsheetinputs/teammembers";
export default function App() {
  const { user} = useUserStore();
  return (
    
    <Routes>
      <Route path="/" element={!user ? <HomePage /> : <Organisationpage/>} />
      <Route
        path="/signup"
        element={!user ? <SignupPage /> : <Navigate to="/" />}
      />
      <Route
        path="/login"
        element={!user ? <LoginPage /> : <Navigate to="/" />}
      />
      <Route
        path="/org/:id"
        element={user ?<Orgid/>:<Navigate to="/"/>}
      />
        <Route
        path="/termsheet/:orgid"
        element={user ?<PAGE/>:<Navigate to="/"/>}
      />
      <Route
        path="/admin/:orgid"
        element={user?<><AdminDashboard/></>:<Navigate to="/"/>}
        />
        <Route
        path="/:role/:orgid"
        element={user?<></>:<Navigate to="/"/>}
  />
  <Route
        path="/role/termsheet/:orgid"
        element={user?<PAGE/>:<Navigate to="/"/>}
  />

      <Route
        path="/admin/termsheet/:orgid"
        element={user?<PAGE/>:<Navigate to="/"/>}
        />
    </Routes>

  )
}
