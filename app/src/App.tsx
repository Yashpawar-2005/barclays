import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import SignupPage from "./auth/SignupPage"
import LoginPage from "./auth/LoginPage"
export default function App() {
  return (
    
      <Routes>
        <Route path="/" element={<Navigate to="/signup" />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>

  )
}
