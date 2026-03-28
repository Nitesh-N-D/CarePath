import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import ChartCard from "../components/ui/ChartCard";
import ErrorState from "../components/ui/ErrorState";
import GlassCard from "../components/ui/GlassCard";
import GradientButton from "../components/ui/GradientButton";
import InputField from "../components/ui/InputField";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import StatCard from "../components/ui/StatCard";
import Toast from "../components/ui/Toast";
import API from "../services/api";
import type { AssistantMessage, DashboardResponse, MedicationReminder, ReminderNotification, UserProfile } from "../types/health";

interface HealthFormState {
  weight: string;
  height_cm: string;
  systolic_bp: string;
  diastolic_bp: string;
  sugar_level: string;
  sleep_hours: string;
  created_at: string;
}

interface ProfileFormState {
  age: string;
  gender: string;
  weight: string;
  height_cm: string;
  location: string;
  primary_goal: string;
  chronic_conditions: string;
  allergies: string;
  medications: string;
}

interface ReminderFormState {
  medication_name: string;
  dosage: string;
  schedule_time: string;
  frequency: string;
  instructions: string;
}

function profileToForm(profile: UserProfile | null): ProfileFormState {
  return {
    age: profile?.age ? String(profile.age) : "",
    gender: profile?.gender || "",
    weight: profile?.weight ? String(profile.weight) : "",
    height_cm: profile?.height_cm ? String(profile.height_cm) : "",
    location: profile?.location || "",
    primary_goal: profile?.primary_goal || "",
    chronic_conditions: profile?.chronic_conditions?.join(", ") || "",
    allergies: profile?.allergies?.join(", ") || "",
    medications: profile?.medications?.join(", ") || "",
  };
}

function Dashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantSending, setAssistantSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);
  const [savingLog, setSavingLog] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingReminder, setSavingReminder] = useState(false);
  const [healthForm, setHealthForm] = useState<HealthFormState>({
    weight: "",
    height_cm: "170",
    systolic_bp: "",
    diastolic_bp: "",
    sugar_level: "",
    sleep_hours: "",
    created_at: new Date().toISOString().slice(0, 16),
  });
  const [profileForm, setProfileForm] = useState<ProfileFormState>(profileToForm(null));
  const [reminderForm, setReminderForm] = useState<ReminderFormState>({
    medication_name: "",
    dosage: "",
    schedule_time: "08:00",
    frequency: "daily",
    instructions: "",
  });

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [dashboardResponse, historyResponse] = await Promise.all([
        API.get<DashboardResponse>("/health/dashboard"),
        API.get<AssistantMessage[]>("/assistant/history"),
      ]);
      setData(dashboardResponse.data);
      setMessages(historyResponse.data);
      setProfileForm(profileToForm(dashboardResponse.data.profile));
      setHealthForm((current) => ({
        ...current,
        weight: dashboardResponse.data.profile?.weight ? String(dashboardResponse.data.profile.weight) : current.weight,
        height_cm: dashboardResponse.data.profile?.height_cm ? String(dashboardResponse.data.profile.height_cm) : current.height_cm,
      }));
      setError("");
    } catch (requestError) {
      setError(
        axios.isAxiosError(requestError)
          ? requestError.response?.data?.message || "Unable to load your health workspace right now."
          : "Unable to load your health workspace right now."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const chartData = useMemo(
    () =>
      (data?.logs || []).map((log) => ({
        ...log,
        label: new Date(log.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      })),
    [data?.logs]
  );

  const latestLog = data?.logs?.[data.logs.length - 1] || null;
  const liveBmi =
    healthForm.weight && healthForm.height_cm
      ? Number((Number(healthForm.weight) / Math.pow(Number(healthForm.height_cm) / 100, 2)).toFixed(1))
      : null;
  const liveBmiCategory =
    liveBmi == null ? "Waiting for inputs" : liveBmi < 18.5 ? "Underweight" : liveBmi < 25 ? "Normal" : liveBmi < 30 ? "Overweight" : "Obese";

  const stats = data
    ? [
        { label: "BMI", value: String(data.riskAssessment.latest?.bmi || data.profile?.bmi || "--"), detail: data.riskAssessment.latest?.bmiCategory || data.profile?.bmiCategory || "No profile yet", accent: "indigo" as const },
        { label: "Blood Pressure", value: latestLog ? `${latestLog.systolic_bp}/${latestLog.diastolic_bp}` : "--", detail: data.riskAssessment.latest?.bloodPressureCategory || "Waiting for first entry", accent: "red" as const },
        { label: "Sugar", value: latestLog ? `${latestLog.sugar_level} mg/dL` : "--", detail: data.riskAssessment.latest?.sugarCategory || "Waiting for first entry", accent: "cyan" as const },
        { label: "Risk Score", value: `${data.riskAssessment.riskScore}/100`, detail: data.riskAssessment.prediction.title, accent: "yellow" as const },
      ]
    : [];

  const showToast = (message: string, tone: "success" | "error") => setToast({ message, tone });

  const saveLog = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingLog(true);
    try {
      await API.post("/health", { ...healthForm, weight: Number(healthForm.weight), height_cm: Number(healthForm.height_cm), systolic_bp: Number(healthForm.systolic_bp), diastolic_bp: Number(healthForm.diastolic_bp), sugar_level: Number(healthForm.sugar_level), sleep_hours: Number(healthForm.sleep_hours) });
      setHealthForm((current) => ({ ...current, systolic_bp: "", diastolic_bp: "", sugar_level: "", sleep_hours: "" }));
      showToast("Health log saved successfully.", "success");
      await loadDashboard();
    } catch (requestError) {
      showToast(axios.isAxiosError(requestError) ? requestError.response?.data?.message || "Unable to save this health log." : "Unable to save this health log.", "error");
    } finally {
      setSavingLog(false);
    }
  };

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingProfile(true);
    try {
      await API.put("/health/profile", {
        age: profileForm.age || null,
        gender: profileForm.gender || null,
        weight: profileForm.weight || null,
        height_cm: profileForm.height_cm || null,
        location: profileForm.location || null,
        primary_goal: profileForm.primary_goal || null,
        chronic_conditions: profileForm.chronic_conditions,
        allergies: profileForm.allergies,
        medications: profileForm.medications,
      });
      showToast("Profile updated successfully.", "success");
      await loadDashboard();
    } catch (requestError) {
      showToast(axios.isAxiosError(requestError) ? requestError.response?.data?.message || "Unable to update profile." : "Unable to update profile.", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const saveReminder = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingReminder(true);
    try {
      await API.post("/health/reminders", reminderForm);
      setReminderForm({ medication_name: "", dosage: "", schedule_time: "08:00", frequency: "daily", instructions: "" });
      showToast("Medication reminder created.", "success");
      await loadDashboard();
    } catch (requestError) {
      showToast(axios.isAxiosError(requestError) ? requestError.response?.data?.message || "Unable to save reminder." : "Unable to save reminder.", "error");
    } finally {
      setSavingReminder(false);
    }
  };

  const toggleReminder = async (reminder: MedicationReminder) => {
    try {
      await API.patch(`/health/reminders/${reminder.id}`, { active: !reminder.active });
      await loadDashboard();
    } catch (requestError) {
      showToast(axios.isAxiosError(requestError) ? requestError.response?.data?.message || "Unable to update reminder." : "Unable to update reminder.", "error");
    }
  };

  const markNotificationRead = async (notification: ReminderNotification) => {
    if (notification.status === "read") return;
    try {
      await API.patch(`/health/notifications/${notification.id}/read`);
      await loadDashboard();
    } catch (requestError) {
      console.error(requestError);
    }
  };

  const sendAssistantMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!assistantInput.trim()) return;
    const content = assistantInput.trim();
    setMessages((current) => [...current, { role: "user", content, created_at: new Date().toISOString() }]);
    setAssistantInput("");
    setAssistantSending(true);
    try {
      const response = await API.post<{ reply: string }>("/assistant/chat", { message: content });
      setMessages((current) => [...current, { role: "assistant", content: response.data.reply, created_at: new Date().toISOString() }]);
    } catch (requestError) {
      showToast(axios.isAxiosError(requestError) ? requestError.response?.data?.message || "Unable to contact the AI assistant right now." : "Unable to contact the AI assistant right now.", "error");
    } finally {
      setAssistantSending(false);
    }
  };

  const exportPdf = async () => {
    if (!data) return;
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
    const pdf = new jsPDF();
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 34, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.text("CarePath Weekly Health Report", 14, 20);
    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(12);
    pdf.text(data.weeklyReport.overview, 14, 46, { maxWidth: 180 });
    autoTable(pdf, { startY: 62, head: [["Metric", "Value"]], body: [["Risk score", `${data.riskAssessment.riskScore}/100`], ["BMI", `${data.riskAssessment.latest?.bmi || data.profile?.bmi || "n/a"} (${data.riskAssessment.latest?.bmiCategory || data.profile?.bmiCategory || "Unavailable"})`], ["Prediction", data.riskAssessment.prediction.summary], ["Suggestion", data.weeklyReport.personalizedSuggestions[0] || "Keep logging consistently."]], headStyles: { fillColor: [14, 165, 233], textColor: 255 }, styles: { fontSize: 10 } });
    const typedPdf = pdf as typeof pdf & { lastAutoTable?: { finalY?: number } };
    autoTable(pdf, { startY: typedPdf.lastAutoTable?.finalY ? typedPdf.lastAutoTable.finalY + 12 : 120, head: [["Date", "Weight", "BP", "Sugar", "Sleep"]], body: data.logs.map((log) => [new Date(log.created_at).toLocaleDateString(), `${log.weight} kg`, `${log.systolic_bp}/${log.diastolic_bp}`, `${log.sugar_level} mg/dL`, `${log.sleep_hours} hrs`]), headStyles: { fillColor: [79, 70, 229], textColor: 255 }, styles: { fontSize: 9 } });
    pdf.save("carepath-weekly-health-report.pdf");
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => <LoadingSkeleton key={index} className="h-32" />)}
        </section>
        <section className="grid gap-6 xl:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => <LoadingSkeleton key={index} className="h-[360px]" />)}
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {toast ? <Toast message={toast.message} tone={toast.tone} /> : null}
      <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="section-heading">Your CarePath journal</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">A more elegant way to follow your health day by day.</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">Record daily readings, read weekly summaries, ask for guidance, manage reminders, and keep your care story together.</p>
        </div>
        <GradientButton onClick={exportPdf} disabled={!data} className="w-full sm:w-auto">Export Weekly PDF</GradientButton>
      </section>
      {error ? <ErrorState title="Dashboard data unavailable" message={error} actionLabel="Retry" onAction={() => void loadDashboard()} /> : null}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => <StatCard key={item.label} {...item} />)}
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <GlassCard className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="section-heading">Risk center</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Real-time feedback from your latest health signals</h2>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left sm:text-right">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Prediction</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">{data?.riskAssessment.prediction.confidence} confidence</div>
            </div>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <div className="text-sm text-slate-500">Weekly report</div>
              <div className="mt-3 text-lg font-semibold text-slate-900">{data?.weeklyReport.overview}</div>
              <div className="mt-4 text-sm leading-6 text-slate-600">{data?.riskAssessment.prediction.summary}</div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <div className="text-sm text-slate-500">Trend snapshot</div>
              <div className="mt-3 grid gap-3">
                <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">Average BP: {data?.riskAssessment.weeklyAverages ? `${data.riskAssessment.weeklyAverages.systolicBp}/${data.riskAssessment.weeklyAverages.diastolicBp}` : "--"}</div>
                <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">Average sugar: {data?.riskAssessment.weeklyAverages ? `${data.riskAssessment.weeklyAverages.sugarLevel} mg/dL` : "--"}</div>
                <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">Average sleep: {data?.riskAssessment.weeklyAverages ? `${data.riskAssessment.weeklyAverages.sleepHours} hrs` : "--"}</div>
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {(data?.riskAssessment.alerts.length ? data.riskAssessment.alerts : [{ level: "low", label: "No acute alerts", message: "Keep logging consistently to maintain a high-quality weekly report.", color: "slate" }]).map((alert) => (
              <div key={alert.label} className={`rounded-2xl border p-4 ${alert.level === "critical" ? "border-rose-200 bg-rose-50 text-rose-700" : alert.level === "high" ? "border-amber-200 bg-amber-50 text-amber-700" : alert.level === "medium" ? "border-yellow-200 bg-yellow-50 text-yellow-700" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
                <div className="font-semibold">{alert.label}</div>
                <div className="mt-1 text-sm leading-6">{alert.message}</div>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard className="p-6">
          <p className="section-heading">Weekly insight engine</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Personalized suggestions and preventive tips</h2>
          <div className="mt-6 space-y-4">
            {data?.weeklyReport.personalizedSuggestions.map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">{item}</div>)}
          </div>
          <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-medium text-slate-500">Prevention</div>
            <div className="mt-3 space-y-3">
              {data?.weeklyReport.preventiveTips.map((tip) => <div key={tip} className="text-sm leading-6 text-slate-700">{tip}</div>)}
            </div>
          </div>
        </GlassCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Blood pressure trend" subtitle="Weekly movement across recent readings.">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid stroke="rgba(148,163,184,0.2)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16 }} />
              <Line type="monotone" dataKey="systolic_bp" stroke="#ef4444" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="diastolic_bp" stroke="#06b6d4" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Weight and sleep stability" subtitle="Two signals that often influence recovery and risk.">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid stroke="rgba(148,163,184,0.2)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16 }} />
              <Area type="monotone" dataKey="weight" stroke="#0ea5e9" fill="rgba(14,165,233,0.14)" strokeWidth={3} />
              <Area type="monotone" dataKey="sleep_hours" stroke="#a855f7" fill="rgba(168,85,247,0.12)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <GlassCard className="p-6">
          <p className="section-heading">Daily log capture</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Add a new health entry</h2>
          <form onSubmit={saveLog} className="mt-6 grid gap-4 sm:grid-cols-2">
            <InputField label="Weight (kg)" type="number" step="0.1" value={healthForm.weight} onChange={(event) => setHealthForm((current) => ({ ...current, weight: event.target.value }))} />
            <InputField label="Height (cm)" type="number" step="0.1" value={healthForm.height_cm} onChange={(event) => setHealthForm((current) => ({ ...current, height_cm: event.target.value }))} />
            <InputField label="Systolic BP" type="number" step="1" value={healthForm.systolic_bp} onChange={(event) => setHealthForm((current) => ({ ...current, systolic_bp: event.target.value }))} />
            <InputField label="Diastolic BP" type="number" step="1" value={healthForm.diastolic_bp} onChange={(event) => setHealthForm((current) => ({ ...current, diastolic_bp: event.target.value }))} />
            <InputField label="Sugar (mg/dL)" type="number" step="0.1" value={healthForm.sugar_level} onChange={(event) => setHealthForm((current) => ({ ...current, sugar_level: event.target.value }))} />
            <InputField label="Sleep (hours)" type="number" step="0.1" value={healthForm.sleep_hours} onChange={(event) => setHealthForm((current) => ({ ...current, sleep_hours: event.target.value }))} />
            <InputField label="Logged at" type="datetime-local" value={healthForm.created_at} onChange={(event) => setHealthForm((current) => ({ ...current, created_at: event.target.value }))} className="sm:col-span-2" />
            <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4 sm:col-span-2">
              <div className="text-xs uppercase tracking-[0.18em] text-cyan-800">BMI auto-calculation</div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">{liveBmi ?? "--"}</div>
              <div className="mt-1 text-sm text-slate-600">{liveBmiCategory}</div>
            </div>
            <GradientButton type="submit" disabled={savingLog} className="w-full sm:col-span-2">{savingLog ? "Saving..." : "Save health log"}</GradientButton>
          </form>
        </GlassCard>

        <GlassCard className="p-6">
          <p className="section-heading">Profile + prediction context</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Keep your health profile current</h2>
          <form onSubmit={saveProfile} className="mt-6 grid gap-4 sm:grid-cols-2">
            <InputField label="Age" type="number" value={profileForm.age} onChange={(event) => setProfileForm((current) => ({ ...current, age: event.target.value }))} />
            <InputField label="Gender" value={profileForm.gender} onChange={(event) => setProfileForm((current) => ({ ...current, gender: event.target.value }))} />
            <InputField label="Weight (kg)" type="number" value={profileForm.weight} onChange={(event) => setProfileForm((current) => ({ ...current, weight: event.target.value }))} />
            <InputField label="Height (cm)" type="number" value={profileForm.height_cm} onChange={(event) => setProfileForm((current) => ({ ...current, height_cm: event.target.value }))} />
            <InputField label="Location" value={profileForm.location} onChange={(event) => setProfileForm((current) => ({ ...current, location: event.target.value }))} />
            <InputField label="Primary health goal" value={profileForm.primary_goal} onChange={(event) => setProfileForm((current) => ({ ...current, primary_goal: event.target.value }))} />
            <InputField label="Chronic conditions" value={profileForm.chronic_conditions} onChange={(event) => setProfileForm((current) => ({ ...current, chronic_conditions: event.target.value }))} className="sm:col-span-2" />
            <InputField label="Allergies" value={profileForm.allergies} onChange={(event) => setProfileForm((current) => ({ ...current, allergies: event.target.value }))} className="sm:col-span-2" />
            <InputField label="Current medications" value={profileForm.medications} onChange={(event) => setProfileForm((current) => ({ ...current, medications: event.target.value }))} className="sm:col-span-2" />
            <GradientButton type="submit" disabled={savingProfile} className="w-full sm:col-span-2">{savingProfile ? "Saving..." : "Save profile"}</GradientButton>
          </form>
        </GlassCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <GlassCard className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="section-heading">AI assistant</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Context-aware health guidance</h2>
            </div>
            <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">Ollama / API ready</div>
          </div>
          <div className="mt-6 h-[320px] space-y-3 overflow-y-auto rounded-3xl border border-slate-200 bg-slate-50 p-4">
            {messages.length ? messages.map((message, index) => (
              <div key={`${message.role}-${index}-${message.created_at || ""}`} className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "assistant" ? "bg-white text-slate-700 shadow-sm" : "ml-auto bg-slate-900 text-white"}`}>
                {message.content}
              </div>
            )) : <div className="text-sm text-slate-500">Ask about your BP, BMI, sugar trends, medications, prevention, or likely next steps.</div>}
            {assistantSending ? <div className="max-w-[85%] rounded-2xl bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">CarePath AI is thinking...</div> : null}
          </div>
          <form onSubmit={sendAssistantMessage} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input value={assistantInput} onChange={(event) => setAssistantInput(event.target.value)} placeholder="Ask a question about your trends, symptoms, prevention, or daily routine" className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-300" />
            <GradientButton type="submit" disabled={assistantSending} className="w-full sm:w-auto">Send</GradientButton>
          </form>
        </GlassCard>

        <GlassCard className="p-6">
          <p className="section-heading">Doctor recommendations</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Suggested specialists based on your profile</h2>
          <div className="mt-6 space-y-4">
            {(data?.doctorRecommendations || []).map((doctor) => (
              <div key={doctor.id} className="rounded-3xl border border-slate-200 bg-white p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">{doctor.name}</div>
                    <div className="mt-1 text-sm text-slate-500">{doctor.specialization} · {doctor.location}</div>
                    <div className="mt-2 text-sm text-slate-600">{doctor.hospital}</div>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">{doctor.rating}/5</div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {doctor.conditions.map((condition) => <span key={condition} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{condition}</span>)}
                </div>
                <div className="mt-4 text-sm text-slate-600">{doctor.experience_years} years experience · {doctor.contact_phone}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <GlassCard className="p-6">
          <p className="section-heading">Medication reminders</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Create reminders and surface notifications</h2>
          <form onSubmit={saveReminder} className="mt-6 grid gap-4 sm:grid-cols-2">
            <InputField label="Medication name" value={reminderForm.medication_name} onChange={(event) => setReminderForm((current) => ({ ...current, medication_name: event.target.value }))} />
            <InputField label="Dosage" value={reminderForm.dosage} onChange={(event) => setReminderForm((current) => ({ ...current, dosage: event.target.value }))} />
            <InputField label="Schedule time" type="time" value={reminderForm.schedule_time} onChange={(event) => setReminderForm((current) => ({ ...current, schedule_time: event.target.value }))} />
            <InputField label="Frequency" value={reminderForm.frequency} onChange={(event) => setReminderForm((current) => ({ ...current, frequency: event.target.value }))} />
            <InputField label="Instructions" value={reminderForm.instructions} onChange={(event) => setReminderForm((current) => ({ ...current, instructions: event.target.value }))} className="sm:col-span-2" />
            <GradientButton type="submit" disabled={savingReminder} className="w-full sm:col-span-2">{savingReminder ? "Saving..." : "Create reminder"}</GradientButton>
          </form>
          <div className="mt-6 space-y-3">
            {(data?.reminders || []).map((reminder) => (
              <div key={reminder.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{reminder.medication_name} · {reminder.dosage}</div>
                  <div className="mt-1 text-sm text-slate-500">{reminder.schedule_time.slice(0, 5)} · {reminder.frequency}</div>
                </div>
                <button type="button" onClick={() => void toggleReminder(reminder)} className={`rounded-full px-3 py-2 text-xs font-semibold ${reminder.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                  {reminder.active ? "Active" : "Inactive"}
                </button>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <p className="section-heading">Notifications</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Reminder activity feed</h2>
          <div className="mt-6 space-y-3">
            {(data?.notifications || []).length ? (
              data?.notifications.map((notification) => (
                <button key={notification.id} type="button" onClick={() => void markNotificationRead(notification)} className={`w-full rounded-2xl border p-4 text-left ${notification.status === "read" ? "border-slate-200 bg-slate-50" : "border-cyan-200 bg-cyan-50"}`}>
                  <div className="font-semibold text-slate-900">{notification.title}</div>
                  <div className="mt-1 text-sm leading-6 text-slate-600">{notification.message}</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">{notification.status} · {new Date(notification.due_at).toLocaleString()}</div>
                </button>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">Notifications will appear here when the reminder scheduler runs at a matching medication time.</div>
            )}
          </div>
        </GlassCard>
      </section>
    </div>
  );
}

export default Dashboard;
