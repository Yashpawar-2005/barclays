import {  Routes, Route, Navigate } from "react-router-dom"
import HomePage from "./pages/Homepages/HomePage";
import SignupPage from "./pages/auth/SignupPage"
import LoginPage from "./pages/auth/LoginPage"
import { useUserStore } from "./services/auth.service";
import Organisationpage from "./pages/Mainpages/Organisationpage";
import Orgid from "./pages/Organisationpage/Orgid";
import PAGE from "./pages/Organisationpage/PAGE";
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
        path="/termsheet/:id/:termsheetid"
        element={user ?<PAGE/>:<Navigate to="/"/>}
      />
    </Routes>

  )
}
