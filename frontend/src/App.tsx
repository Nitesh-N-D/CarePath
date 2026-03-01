import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import DiseaseDetail from "./pages/DiseaseDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Layout>
      <Routes>

        {/* ---------------- PUBLIC ROUTES ---------------- */}
        <Route path="/" element={<Home />} />
        <Route path="/disease/:slug" element={<DiseaseDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ---------------- PROTECTED ROUTES ---------------- */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* ---------------- 404 FALLBACK ---------------- */}
        <Route
          path="*"
          element={
            <div className="text-center mt-20">
              <h1 className="text-3xl font-semibold">404 - Page Not Found</h1>
            </div>
          }
        />

      </Routes>
    </Layout>
  );
}

export default App;