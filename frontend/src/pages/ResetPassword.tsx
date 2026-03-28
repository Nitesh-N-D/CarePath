import axios from "axios";
import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import ErrorState from "../components/ui/ErrorState";
import GlassCard from "../components/ui/GlassCard";
import GradientButton from "../components/ui/GradientButton";
import InputField from "../components/ui/InputField";
import API from "../services/api";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const email = useMemo(() => searchParams.get("email") || "", [searchParams]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await API.post<{ message: string }>("/auth/reset-password", {
        token,
        email,
        password,
      });
      setMessage(response.data.message);
      setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        setError(requestError.response?.data?.message || "Unable to reset password.");
      } else {
        setError("Unable to reset password.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!token || !email) {
    return (
      <GlassCard className="mx-auto mt-20 max-w-md p-6 text-center text-slate-600 sm:mt-24 sm:p-8">
        Invalid reset link. Request a new one from the{" "}
        <Link to="/forgot-password" className="text-[var(--color-accent)] hover:opacity-80">
          forgot password page
        </Link>
        .
      </GlassCard>
    );
  }

  return (
    <div className="mx-auto flex min-h-[78vh] w-full max-w-md items-center px-1 sm:px-0">
      <GlassCard className="w-full p-6 sm:p-8">
        <p className="eyebrow">New password</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">Set a fresh CarePath password</h1>
        {message ? <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div> : null}
        {error ? <div className="mt-6"><ErrorState title="Password reset failed" message={error} /></div> : null}
        <form onSubmit={submit} className="mt-6 space-y-4">
          <InputField label="New password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} />
          <GradientButton type="submit" disabled={submitting} className="w-full">
            {submitting ? "Updating..." : "Reset password"}
          </GradientButton>
        </form>
      </GlassCard>
    </div>
  );
}

export default ResetPassword;
