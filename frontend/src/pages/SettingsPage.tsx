import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import GlassCard from "../components/ui/GlassCard";
import GradientButton from "../components/ui/GradientButton";
import InputField from "../components/ui/InputField";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import API from "../services/api";
import type { UserProfile } from "../types/health";

function SettingsPage() {
  const { user, logout, refreshUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileForm, setProfileForm] = useState({ name: user?.name || "", email: user?.email || "", phone: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [notifications, setNotifications] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get<UserProfile | null>("/health/profile");
        setProfile(response.data);
        setProfileForm((current) => ({ ...current, phone: response.data?.phone || "" }));
      } catch (requestError) {
        console.error(requestError);
      }
    };

    void fetchProfile();
  }, []);

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    try {
      await API.put("/auth/profile", { name: profileForm.name, email: profileForm.email });
      await API.put("/health/profile", {
        age: profile?.age || null,
        gender: profile?.gender || null,
        phone: profileForm.phone || null,
        weight: profile?.weight || null,
        height_cm: profile?.height_cm || null,
        location: profile?.location || null,
        primary_goal: profile?.primary_goal || null,
        chronic_conditions: profile?.chronic_conditions || [],
        allergies: profile?.allergies || [],
        medications: profile?.medications || [],
      });
      await refreshUser();
      setMessage("Profile updated.");
    } catch (requestError) {
      setMessage("Unable to update profile.");
      console.error(requestError);
    }
  };

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    try {
      const response = await API.post<{ message: string }>("/auth/change-password", passwordForm);
      setMessage(response.data.message);
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (requestError) {
      setMessage(axios.isAxiosError(requestError) ? requestError.response?.data?.message || "Unable to update password." : "Unable to update password.");
    }
  };

  const deleteAccount = async () => {
    const confirmed = window.confirm("Delete this account permanently?");
    if (!confirmed) return;
    await API.delete("/auth/account");
    logout();
    navigate("/");
  };

  return (
    <div className="space-y-8">
      <section className="max-w-3xl">
        <p className="section-heading">Settings</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-900">Manage your CarePath profile, security, and account preferences.</h1>
      </section>

      {message ? <div className="rounded-2xl border border-[var(--color-border)] bg-white/70 px-4 py-3 text-sm text-[var(--color-text)]">{message}</div> : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard className="p-6">
          <h2 className="text-2xl font-semibold text-slate-900">Profile</h2>
          <form onSubmit={saveProfile} className="mt-6 grid gap-4">
            <InputField label="Name" value={profileForm.name} onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))} />
            <InputField label="Email" value={profileForm.email} onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))} />
            <InputField label="Phone" value={profileForm.phone} onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))} />
            <GradientButton type="submit">Save profile</GradientButton>
          </form>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-2xl font-semibold text-slate-900">Security</h2>
          <form onSubmit={changePassword} className="mt-6 grid gap-4">
            <InputField label="Current password" type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))} />
            <InputField label="New password" type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))} />
            <GradientButton type="submit">Change password</GradientButton>
          </form>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-2xl font-semibold text-slate-900">Preferences</h2>
          <div className="mt-6 flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-white/70 px-4 py-4">
            <div>
              <div className="font-semibold text-slate-900">Theme</div>
              <div className="text-sm text-slate-500">Toggle light and dark appearance.</div>
            </div>
            <button type="button" onClick={toggleTheme} className="rounded-xl border border-[var(--color-border)] bg-white/70 px-4 py-2 text-sm text-slate-900">
              {theme === "dark" ? "🌞 Light" : "🌙 Dark"}
            </button>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-white/70 px-4 py-4">
            <div>
              <div className="font-semibold text-slate-900">Notifications</div>
              <div className="text-sm text-slate-500">Medication reminders and weekly health prompts.</div>
            </div>
            <button type="button" onClick={() => setNotifications((current) => !current)} className={`rounded-full px-4 py-2 text-sm ${notifications ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>
              {notifications ? "Enabled" : "Disabled"}
            </button>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-2xl font-semibold text-slate-900">Account</h2>
          <div className="mt-6 space-y-4">
            <button type="button" onClick={handleLogout} className="w-full rounded-2xl border border-[var(--color-border)] bg-white/70 px-4 py-3 text-left text-slate-900">
              Logout
            </button>
            <button type="button" onClick={() => void deleteAccount()} className="w-full rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-left text-rose-700">
              Delete account
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );

  function handleLogout() {
    logout();
    navigate("/");
  }
}

export default SettingsPage;
