import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import GlassCard from "./components/ui/GlassCard";
import LoadingSkeleton from "./components/ui/LoadingSkeleton";

const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DiseaseDetail = lazy(() => import("./pages/DiseaseDetail"));
const DoctorDashboard = lazy(() => import("./pages/DoctorDashboard"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

function RouteFallback() {
  return (
    <div className="space-y-6 py-4">
      <GlassCard className="p-6 sm:p-8">
        <div className="max-w-2xl space-y-4">
          <LoadingSkeleton className="h-4 w-32" />
          <LoadingSkeleton className="h-10 w-72" />
          <LoadingSkeleton className="h-4 w-full" />
          <LoadingSkeleton className="h-4 w-4/5" />
        </div>
      </GlassCard>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <LoadingSkeleton key={index} className="h-32" />
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <Layout>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/diseases/:slug" element={<DiseaseDetail />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["user", "admin"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowedRoles={["doctor", "admin"]}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default App;
