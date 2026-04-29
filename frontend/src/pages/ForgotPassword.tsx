import axios from "axios";
import { useState } from "react";

import ErrorState from "../components/ui/ErrorState";
import GlassCard from "../components/ui/GlassCard";
import GradientButton from "../components/ui/GradientButton";
import InputField from "../components/ui/InputField";
import API from "../services/api";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setFieldError("Email is required.");
      setError("");
      setMessage("");
      return;
    }

    if (!emailPattern.test(trimmedEmail)) {
      setFieldError("Enter a valid email address.");
      setError("");
      setMessage("");
      return;
    }

    setSubmitting(true);
    setError("");
    setMessage("");
    setFieldError("");

    try {
      const response = await API.post<{ message: string }>("/auth/forgot-password", { email: trimmedEmail });
      setMessage(response.data.message);
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        setError(requestError.response?.data?.message || "Unable to send reset email.");
      } else {
        setError("Unable to send reset email.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[78vh] w-full max-w-md items-center px-1 sm:px-0">
      <GlassCard className="w-full p-6 sm:p-8">
        <p className="eyebrow">Password recovery</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">Reset your CarePath password</h1>
        <p className="mt-3 text-slate-600">We&apos;ll send a secure link if your CarePath account exists.</p>
        {message ? <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div> : null}
        {error ? <div className="mt-6"><ErrorState title="Reset email failed" message={error} /></div> : null}
        <form onSubmit={submit} className="mt-6 space-y-4">
          <InputField
            label="Email address"
            type="email"
            value={email}
            placeholder="name@example.com"
            autoComplete="email"
            error={fieldError}
            onChange={(event) => {
              setEmail(event.target.value);
              setError("");
              setMessage("");
              setFieldError("");
            }}
            required
          />
          <GradientButton type="submit" disabled={submitting} className="w-full">
            {submitting ? "Sending..." : "Send reset link"}
          </GradientButton>
        </form>
      </GlassCard>
    </div>
  );
}

export default ForgotPassword;
