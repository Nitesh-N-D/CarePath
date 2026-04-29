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

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Register() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user" as UserRole,
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim().toLowerCase();
    const nextFieldErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (trimmedName.length < 2) {
      nextFieldErrors.name = "Enter your full name.";
    }

    if (!trimmedEmail) {
      nextFieldErrors.email = "Email is required.";
    } else if (!emailPattern.test(trimmedEmail)) {
      nextFieldErrors.email = "Enter a valid email address.";
    }

    if (!form.password) {
      nextFieldErrors.password = "Password is required.";
    } else if (form.password.length < 8) {
      nextFieldErrors.password = "Password must be at least 8 characters.";
    }

    if (!form.confirmPassword) {
      nextFieldErrors.confirmPassword = "Please confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      nextFieldErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(nextFieldErrors).length) {
      setFieldErrors(nextFieldErrors);
      setError("");
      return;
    }

    setSubmitting(true);
    setError("");
    setFieldErrors({});

    try {
      const user = await register({
        name: trimmedName,
        email: trimmedEmail,
        password: form.password,
        role: form.role,
      });
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
    <div className="mx-auto flex min-h-[78vh] w-full max-w-xl items-center px-1 sm:px-0">
      <GlassCard className="w-full overflow-hidden p-6 sm:p-8">
        <div className="mb-8 text-center">
          <Badge tone="accent">Join CarePath</Badge>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-5xl">Create your CarePath account</h1>
          <p className="mt-3 text-slate-600">
            Start a more organized way to follow your health, review conditions, and stay connected with care guidance.
          </p>
        </div>

        {error ? (
          <div className="mb-5">
            <ErrorState title="Registration failed" message={error} />
          </div>
        ) : null}

        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <InputField
            label="Full name"
            value={form.name}
            placeholder="Enter your full name"
            autoComplete="name"
            error={fieldErrors.name}
            onChange={(event) => {
              setForm((current) => ({ ...current, name: event.target.value }));
              setError("");
              setFieldErrors((current) => ({ ...current, name: undefined }));
            }}
            className="sm:col-span-2"
            required
          />
          <InputField
            label="Email"
            type="email"
            value={form.email}
            placeholder="name@example.com"
            autoComplete="email"
            error={fieldErrors.email}
            onChange={(event) => {
              setForm((current) => ({ ...current, email: event.target.value }));
              setError("");
              setFieldErrors((current) => ({ ...current, email: undefined }));
            }}
            className="sm:col-span-2"
            required
          />
          <InputField
            label="Password"
            type="password"
            value={form.password}
            placeholder="Create a strong password"
            autoComplete="new-password"
            error={fieldErrors.password}
            onChange={(event) => {
              setForm((current) => ({ ...current, password: event.target.value }));
              setError("");
              setFieldErrors((current) => ({ ...current, password: undefined, confirmPassword: undefined }));
            }}
            required
            minLength={8}
          />
          <InputField
            label="Confirm password"
            type="password"
            value={form.confirmPassword}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            error={fieldErrors.confirmPassword}
            onChange={(event) => {
              setForm((current) => ({ ...current, confirmPassword: event.target.value }));
              setError("");
              setFieldErrors((current) => ({ ...current, confirmPassword: undefined }));
            }}
            required
            minLength={8}
          />
          <label className="relative block">
            <span className="pointer-events-none absolute left-4 top-2 text-xs uppercase tracking-[0.18em] text-[var(--color-text-soft)]">
              Workspace role
            </span>
            <select
              value={form.role}
              onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as UserRole }))}
              className="field-shell h-full w-full rounded-2xl px-4 pb-3 pt-6 outline-none transition duration-300 focus:border-[rgba(49,88,79,0.4)] focus:shadow-[0_0_0_4px_rgba(49,88,79,0.12)]"
            >
              <option value="user">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <GradientButton type="submit" disabled={submitting} className="w-full sm:col-span-2">
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
