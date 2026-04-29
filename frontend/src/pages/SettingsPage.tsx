import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import GlassCard from "../components/ui/GlassCard";
import GradientButton from "../components/ui/GradientButton";
import InputField from "../components/ui/InputField";
import ThemeToggle from "../components/ui/ThemeToggle";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import { getErrorMessage } from "../utils/errors";

const SETTINGS_NOTIFICATION_KEY = "carepath_notifications_enabled";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function SettingsPage() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [profileForm, setProfileForm] = useState({ name: user?.name || "", email: user?.email || "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [notifications, setNotifications] = useState(() => localStorage.getItem(SETTINGS_NOTIFICATION_KEY) !== "false");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [profileErrors, setProfileErrors] = useState<{ name?: string; email?: string }>({});
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  useEffect(() => {
    localStorage.setItem(SETTINGS_NOTIFICATION_KEY, String(notifications));
  }, [notifications]);

  useEffect(() => {
    if (!successMessage && !errorMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSuccessMessage("");
      setErrorMessage("");
    }, 2600);

    return () => window.clearTimeout(timer);
  }, [errorMessage, successMessage]);

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = profileForm.name.trim();
    const trimmedEmail = profileForm.email.trim().toLowerCase();
    const nextErrors: { name?: string; email?: string } = {};

    if (trimmedName.length < 2) {
      nextErrors.name = "Name must be at least 2 characters.";
    }

    if (!trimmedEmail) {
      nextErrors.email = "Email is required.";
    } else if (!emailPattern.test(trimmedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (Object.keys(nextErrors).length) {
      setProfileErrors(nextErrors);
      setSuccessMessage("");
      setErrorMessage("");
      return;
    }

    try {
      setProfileErrors({});
      setSuccessMessage("");
      setErrorMessage("");
      await API.put("/auth/profile", { name: trimmedName, email: trimmedEmail });
      await refreshUser();
      setSuccessMessage("Profile updated successfully.");
    } catch (requestError) {
      setErrorMessage(getErrorMessage(requestError, "Unable to update profile."));
    }
  };

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};

    if (!passwordForm.currentPassword) {
      nextErrors.currentPassword = "Current password is required.";
    }

    if (!passwordForm.newPassword) {
      nextErrors.newPassword = "New password is required.";
    } else if (passwordForm.newPassword.length < 8) {
      nextErrors.newPassword = "New password must be at least 8 characters.";
    }

    if (!passwordForm.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your new password.";
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(nextErrors).length) {
      setPasswordErrors(nextErrors);
      setSuccessMessage("");
      setErrorMessage("");
      return;
    }

    try {
      setPasswordErrors({});
      setSuccessMessage("");
      setErrorMessage("");
      const response = await API.post<{ message: string }>("/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setSuccessMessage(response.data.message);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (requestError) {
      setErrorMessage(getErrorMessage(requestError, "Unable to update password."));
    }
  };

  const deleteAccount = async () => {
    const confirmed = window.confirm("Delete this account permanently?");
    if (!confirmed) return;

    try {
      setSuccessMessage("");
      setErrorMessage("");
      await API.delete("/auth/account");
      logout();
      navigate("/");
    } catch (requestError) {
      setErrorMessage(getErrorMessage(requestError, "Unable to delete account right now."));
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="space-y-8">
      <section className="max-w-3xl">
        <p className="section-heading">Settings</p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Manage your CarePath profile, security, and account preferences.</h1>
      </section>

      {successMessage ? (
        <div className="rounded-xl border border-borderLight bg-card/90 px-4 py-3 text-sm shadow-sm dark:border-borderDark dark:bg-cardDark/90">
          {successMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard className="p-6">
          <h2 className="text-2xl font-semibold">Profile</h2>
          <form onSubmit={saveProfile} className="mt-6 grid gap-4">
            <InputField
              label="Name"
              value={profileForm.name}
              placeholder="Enter your full name"
              autoComplete="name"
              error={profileErrors.name}
              onChange={(event) => {
                setProfileForm((current) => ({ ...current, name: event.target.value }));
                setProfileErrors((current) => ({ ...current, name: undefined }));
                setErrorMessage("");
              }}
            />
            <InputField
              label="Email"
              type="email"
              value={profileForm.email}
              placeholder="name@example.com"
              autoComplete="email"
              error={profileErrors.email}
              onChange={(event) => {
                setProfileForm((current) => ({ ...current, email: event.target.value }));
                setProfileErrors((current) => ({ ...current, email: undefined }));
                setErrorMessage("");
              }}
            />
            <GradientButton type="submit">Save profile</GradientButton>
          </form>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-2xl font-semibold">Security</h2>
          <form onSubmit={changePassword} className="mt-6 grid gap-4">
            <InputField
              label="Current password"
              type="password"
              value={passwordForm.currentPassword}
              placeholder="Enter your current password"
              autoComplete="current-password"
              error={passwordErrors.currentPassword}
              onChange={(event) => {
                setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }));
                setPasswordErrors((current) => ({ ...current, currentPassword: undefined }));
                setErrorMessage("");
              }}
            />
            <InputField
              label="New password"
              type="password"
              value={passwordForm.newPassword}
              placeholder="Create a new password"
              autoComplete="new-password"
              error={passwordErrors.newPassword}
              onChange={(event) => {
                setPasswordForm((current) => ({ ...current, newPassword: event.target.value }));
                setPasswordErrors((current) => ({ ...current, newPassword: undefined, confirmPassword: undefined }));
                setErrorMessage("");
              }}
            />
            <InputField
              label="Confirm new password"
              type="password"
              value={passwordForm.confirmPassword}
              placeholder="Re-enter your new password"
              autoComplete="new-password"
              error={passwordErrors.confirmPassword}
              onChange={(event) => {
                setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }));
                setPasswordErrors((current) => ({ ...current, confirmPassword: undefined }));
                setErrorMessage("");
              }}
            />
            <GradientButton type="submit">Change password</GradientButton>
          </form>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-2xl font-semibold">Preferences</h2>
          <div className="mt-6 flex flex-col gap-4 rounded-xl border border-borderLight bg-card/90 px-4 py-4 shadow-sm dark:border-borderDark dark:bg-cardDark/90 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-semibold">Theme</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Toggle light and dark appearance.</div>
            </div>
            <ThemeToggle />
          </div>
          <div className="mt-4 flex flex-col gap-4 rounded-xl border border-borderLight bg-card/90 px-4 py-4 shadow-sm dark:border-borderDark dark:bg-cardDark/90 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-semibold">Notifications</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Saved on this device for your CarePath interface preference.</div>
            </div>
            <button
              type="button"
              onClick={() => setNotifications((current) => !current)}
              className={`rounded-full px-4 py-2 text-sm transition-all duration-300 ${
                notifications
                  ? "bg-primary/10 text-primary dark:bg-accent/10 dark:text-accent"
                  : "bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-300"
              }`}
            >
              {notifications ? "Enabled" : "Disabled"}
            </button>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-2xl font-semibold">Account</h2>
          <div className="mt-6 space-y-4">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-xl border border-borderLight bg-card/90 px-4 py-3 text-left shadow-sm transition-all duration-300 hover:scale-[1.01] dark:border-borderDark dark:bg-cardDark/90"
            >
              Logout
            </button>
            <button
              type="button"
              onClick={() => void deleteAccount()}
              className="w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-left text-rose-700 shadow-sm transition-all duration-300 hover:scale-[1.01] dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-300"
            >
              Delete account
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

export default SettingsPage;
