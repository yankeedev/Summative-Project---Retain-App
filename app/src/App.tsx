import { Navigate, Route, Routes } from "react-router-dom";
import AdminRoute from "./components/AdminRoute";
import Layout from "./components/Layout";
import Placeholder from "./components/Placeholder";
import ProtectedRoute from "./components/ProtectedRoute";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
// ...
      
export default function App() {
  return (
    <Routes>
      <Route path="/signin" element={<Placeholder title="Sign In" />} />
      <Route path="/signup" element={<Placeholder title="Sign Up" />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Placeholder title="Dashboard" />} />
          <Route path="/expenses" element={<Placeholder title="Expenses" />} />
          <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} /> 
          <Route path="/budget" element={<Placeholder title="Budget" />} />
        </Route>
      </Route>

      <Route element={<AdminRoute />}>
        <Route element={<Layout />}>
          <Route path="/admin" element={<Placeholder title="Admin" />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}