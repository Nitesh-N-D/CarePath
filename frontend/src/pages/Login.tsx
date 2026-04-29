import axios from "axios";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import GlassCard from "../components/ui/GlassCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import GradientButton from "../components/ui/GradientButton";
import InputField from "../components/ui/InputField";
import ErrorState from "../components/ui/ErrorState";
import Separator from "../components/ui/Separator";
import { useAuth } from "../context/AuthContext";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const nextPath = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const finishNavigation = (role: "user" | "doctor" | "admin") => {
    navigate(role === "admin" ? "/admin" : role === "doctor" ? "/doctor" : nextPath, { replace: true });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    const nextFieldErrors: { email?: string; password?: string } = {};

    if (!trimmedEmail) {
      nextFieldErrors.email = "Email is required.";
    } else if (!emailPattern.test(trimmedEmail)) {
      nextFieldErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextFieldErrors.password = "Password is required.";
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
      const user = await login(trimmedEmail, password);
      finishNavigation(user.role);
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        setError(requestError.response?.data?.message || "Unable to sign in.");
      } else if (requestError instanceof Error) {
        setError(requestError.message);
      } else {
        setError("Unable to sign in.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSubmitting(true);
    setError("");
    try {
      const user = await loginWithGoogle();
      finishNavigation(user.role);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Google sign-in failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[78vh] w-full max-w-md items-center px-1 sm:px-0">
      <GlassCard className="w-full overflow-hidden p-6 sm:p-8">
        <div className="mb-8 text-center">
          <Badge tone="accent">Sign in to CarePath</Badge>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-5xl">Welcome back</h1>
          <p className="mt-3 text-slate-600">
            Return to your health journal, disease reference, reminder schedule, and personal care history.
          </p>
        </div>

        {error ? (
          <div className="mb-5">
            <ErrorState title="Sign in failed" message={error} />
          </div>
        ) : null}

        <form onSubmit={submit} className="space-y-4">
          <InputField
            label="Email"
            type="email"
            value={email}
            placeholder="name@example.com"
            autoComplete="email"
            error={fieldErrors.email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError("");
              setFieldErrors((current) => ({ ...current, email: undefined }));
            }}
            required
          />
          <InputField
            label="Password"
            type="password"
            value={password}
            placeholder="Enter your password"
            autoComplete="current-password"
            error={fieldErrors.password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError("");
              setFieldErrors((current) => ({ ...current, password: undefined }));
            }}
            required
          />
          <GradientButton type="submit" disabled={submitting} className="w-full">
            {submitting ? "Signing in..." : "Sign in"}
          </GradientButton>
        </form>

        <div className="my-5">
          <Separator />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => void handleGoogleLogin()}
          disabled={submitting}
          className="w-full rounded-2xl py-3"
        >
          Continue with Google
        </Button>

        <div className="mt-6 flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/forgot-password" className="hover:text-slate-900">
            Forgot password?
          </Link>
          <Link to="/register" className="hover:text-slate-900">
            Create account
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}

export default Login;
