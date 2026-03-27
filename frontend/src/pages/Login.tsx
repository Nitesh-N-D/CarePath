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

function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const nextPath = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const finishNavigation = (role: "user" | "doctor" | "admin") => {
    navigate(role === "admin" ? "/admin" : role === "doctor" ? "/doctor" : nextPath, { replace: true });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const user = await login(email, password);
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
    <div className="mx-auto flex min-h-[78vh] max-w-md items-center">
      <GlassCard className="w-full overflow-hidden p-6 sm:p-8">
        <div className="mb-8 text-center">
          <Badge tone="accent">Sign in to CarePath</Badge>
          <h1 className="mt-4 text-5xl font-semibold text-slate-900">Welcome back</h1>
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
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <InputField
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
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

        <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
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
