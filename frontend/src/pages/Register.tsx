import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import GradientButton from "../components/ui/GradientButton";
import InputField from "../components/ui/InputField";
import ErrorState from "../components/ui/ErrorState";
import Separator from "../components/ui/Separator";
import { useAuth, type UserRole } from "../context/AuthContext";

function Register() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user" as UserRole,
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const user = await register(form);
      navigate(user.role === "admin" ? "/admin" : user.role === "doctor" ? "/doctor" : "/dashboard", {
        replace: true,
      });
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        setError(requestError.response?.data?.message || "Unable to create account.");
      } else {
        setError("Unable to create account.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    setSubmitting(true);
    setError("");
    try {
      const user = await loginWithGoogle();
      navigate(user.role === "admin" ? "/admin" : user.role === "doctor" ? "/doctor" : "/dashboard", {
        replace: true,
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Google sign-up failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[78vh] max-w-xl items-center">
      <GlassCard className="w-full overflow-hidden p-6 sm:p-8">
        <div className="mb-8 text-center">
          <Badge tone="accent">Create workspace</Badge>
          <h1 className="mt-4 text-4xl font-semibold text-slate-900">Start with CarePath</h1>
          <p className="mt-3 text-slate-600">
            Create a refined health workspace for patients, doctors, or care operators.
          </p>
        </div>

        {error ? (
          <div className="mb-5">
            <ErrorState title="Registration failed" message={error} />
          </div>
        ) : null}

        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <InputField
            label="Full name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            className="md:col-span-2"
            required
          />
          <InputField
            label="Email"
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className="md:col-span-2"
            required
          />
          <InputField
            label="Password"
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            required
            minLength={8}
          />
          <label className="relative block">
            <span className="pointer-events-none absolute left-4 top-2 text-xs uppercase tracking-[0.18em] text-slate-400">
              Workspace role
            </span>
            <select
              value={form.role}
              onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as UserRole }))}
              className="h-full w-full rounded-2xl border border-slate-200 bg-white/95 px-4 pb-3 pt-6 text-slate-900 outline-none transition duration-300 focus:border-cyan-300 focus:shadow-[0_0_0_4px_rgba(165,243,252,0.24)]"
            >
              <option value="user">Patient / User</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <GradientButton type="submit" disabled={submitting} className="w-full md:col-span-2">
            {submitting ? "Creating account..." : "Create account"}
          </GradientButton>
        </form>

        <div className="my-5">
          <Separator />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => void handleGoogleSignup()}
          disabled={submitting}
          className="w-full rounded-2xl py-3"
        >
          Continue with Google
        </Button>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="text-slate-900 hover:text-cyan-700">
            Sign in
          </Link>
        </p>
      </GlassCard>
    </div>
  );
}

export default Register;
