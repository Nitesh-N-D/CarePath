import axios from "axios";
import { useEffect, useMemo, useState } from "react";

import Button from "../components/ui/Button";
import ErrorState from "../components/ui/ErrorState";
import GlassCard from "../components/ui/GlassCard";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import Modal from "../components/ui/Modal";
import StatCard from "../components/ui/StatCard";
import Toast from "../components/ui/Toast";
import API from "../services/api";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "doctor" | "admin";
  created_at: string;
  doctor_id: string | null;
}

interface Analytics {
  totalUsers: number;
  totalHealthLogs: number;
  totalDoctors: number;
  totalAssignments: number;
  totalReminders: number;
  totalAiMessages: number;
}

function AdminDashboard() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string>("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersResponse, analyticsResponse] = await Promise.all([
        API.get<AdminUser[]>("/admin/users"),
        API.get<Analytics>("/admin/analytics"),
      ]);

      setUsers(usersResponse.data);
      setAnalytics(analyticsResponse.data);
      setError("");
    } catch (requestError) {
      console.error(requestError);
      setError("Unable to load admin analytics right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const doctors = useMemo(() => users.filter((user) => user.role === "doctor"), [users]);
  const patients = useMemo(() => users.filter((user) => user.role === "user"), [users]);

  const assignDoctor = async (userId: string, doctorId: string) => {
    setSaving(userId);
    try {
      await API.put("/admin/assign-doctor", { userId, doctorId });
      await fetchData();
      setToast("Doctor assigned successfully.");
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        setToast(requestError.response?.data?.message || "Unable to assign doctor.");
      }
    } finally {
      setSaving("");
    }
  };

  return (
    <div className="space-y-8">
      {toast ? <Toast message={toast} tone={toast.includes("Unable") ? "error" : "success"} /> : null}

      <section className="rounded-[28px] border border-borderLight/80 bg-gradient-to-br from-white via-white to-emerald-50/60 p-6 shadow-soft dark:border-borderDark dark:from-slate-950 dark:via-slate-950 dark:to-emerald-950/30">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
          Operations control
        </div>
        <p className="section-heading">CarePath administration</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Oversee members, clinician assignments, reminders, and care activity.</h1>
      </section>

      {error ? <ErrorState title="Admin panel unavailable" message={error} actionLabel="Retry" onAction={() => void fetchData()} /> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => <LoadingSkeleton key={index} className="h-32" />)
          : analytics
            ? [
                { label: "Users", value: analytics.totalUsers.toString(), detail: "Registered members", accent: "indigo" as const },
                { label: "Health logs", value: analytics.totalHealthLogs.toString(), detail: "Submitted entries", accent: "cyan" as const },
                { label: "Doctors", value: analytics.totalDoctors.toString(), detail: "Active clinicians", accent: "yellow" as const },
                { label: "Assignments", value: analytics.totalAssignments.toString(), detail: "Doctor-patient links", accent: "red" as const },
              ].map((item) => <StatCard key={item.label} {...item} />)
            : null}
      </section>

      {!loading && analytics ? (
        <section className="grid gap-4 sm:grid-cols-2">
          <GlassCard className="p-5">
            <div className="text-sm uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Automation</div>
            <div className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{analytics.totalReminders}</div>
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">Medication reminders configured across the platform.</div>
          </GlassCard>
          <GlassCard className="p-5">
            <div className="text-sm uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">AI engagement</div>
            <div className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{analytics.totalAiMessages}</div>
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">AI chat messages recorded for patient guidance and follow-up.</div>
          </GlassCard>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <GlassCard className="overflow-hidden p-0">
          <div className="border-b border-borderLight/80 px-6 py-5 dark:border-borderDark">
            <p className="section-heading">Assignments</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">Assign doctors to patients</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Keep patient routing and clinician ownership organized from one place.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[680px] text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-500 dark:bg-slate-900/80 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Doctor</th>
                </tr>
              </thead>
              <tbody>
                {patients.length ? patients.map((patient) => (
                  <tr key={patient.id} className="border-t border-slate-100 transition duration-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/70">
                    <td className="px-6 py-4">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setSelectedUser(patient)}
                        className="h-auto px-0 py-0 font-medium text-slate-900 shadow-none hover:bg-transparent hover:text-cyan-700 dark:text-white"
                      >
                        {patient.name}
                      </Button>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{patient.email}</td>
                    <td className="px-6 py-4">
                      <select
                        defaultValue={patient.doctor_id || ""}
                        onChange={(event) => {
                          if (event.target.value) {
                            void assignDoctor(patient.id, event.target.value);
                          }
                        }}
                        className="min-w-[220px] rounded-xl border border-borderLight/80 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-cyan-300 focus:outline-none dark:border-borderDark dark:bg-slate-900 dark:text-white"
                        disabled={saving === patient.id}
                      >
                        <option value="">Select doctor</option>
                        {doctors.map((doctor) => (
                          <option key={doctor.doctor_id || doctor.id} value={doctor.doctor_id || doctor.id}>
                            {doctor.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-10 text-center text-slate-500">
                      No patients are available for assignment yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <p className="section-heading">User overview</p>
          {selectedUser ? (
            <div className="mt-4 space-y-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{selectedUser.name}</h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400">{selectedUser.email}</p>
              </div>
              <div className="rounded-2xl border border-borderLight/80 bg-white/90 p-4 text-sm leading-6 text-slate-600 shadow-sm dark:border-borderDark dark:bg-slate-900/80 dark:text-slate-300">
                Role: {selectedUser.role}
              </div>
              <div className="rounded-2xl border border-borderLight/80 bg-white/90 p-4 text-sm leading-6 text-slate-600 shadow-sm dark:border-borderDark dark:bg-slate-900/80 dark:text-slate-300">
                Joined: {new Date(selectedUser.created_at).toLocaleDateString()}
              </div>
              <div className="rounded-2xl border border-borderLight/80 bg-white/90 p-4 text-sm leading-6 text-slate-600 shadow-sm dark:border-borderDark dark:bg-slate-900/80 dark:text-slate-300">
                Assignment status: {selectedUser.doctor_id ? "Assigned to doctor" : "Awaiting assignment"}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-slate-500 dark:text-slate-400">Select a patient from the table to preview account details.</p>
          )}
        </GlassCard>
      </section>

      <Modal open={Boolean(selectedUser)} title="User profile" onClose={() => setSelectedUser(null)}>
        {selectedUser ? (
          <div className="space-y-4 text-slate-600 dark:text-slate-300">
            <div className="text-xl font-semibold text-slate-900 dark:text-white">{selectedUser.name}</div>
            <div>{selectedUser.email}</div>
            <div>Role: {selectedUser.role}</div>
            <div>Created: {new Date(selectedUser.created_at).toLocaleString()}</div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export default AdminDashboard;
