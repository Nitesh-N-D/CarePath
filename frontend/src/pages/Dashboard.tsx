import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ChartCard from "../components/ui/ChartCard";
import ErrorState from "../components/ui/ErrorState";
import GlassCard from "../components/ui/GlassCard";
import GradientButton from "../components/ui/GradientButton";
import InputField from "../components/ui/InputField";
import LoadingSkeleton from "../components/ui/LoadingSkeleton";
import StatCard from "../components/ui/StatCard";
import Toast from "../components/ui/Toast";
import API from "../services/api";

interface HealthLog {
  id: string;
  weight: number;
  height_cm: number;
  systolic_bp: number;
  diastolic_bp: number;
  sugar_level: number;
  sleep_hours: number;
  created_at: string;
}

interface HealthFormState {
  weight: string;
  height_cm: string;
  systolic_bp: string;
  diastolic_bp: string;
  sugar_level: string;
  sleep_hours: string;
  created_at: string;
}

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function toFixedNumber(value: number, digits = 1) {
  return Number(value.toFixed(digits));
}

function Dashboard() {
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);
  const [form, setForm] = useState<HealthFormState>({
    weight: "",
    height_cm: "170",
    systolic_bp: "",
    diastolic_bp: "",
    sugar_level: "",
    sleep_hours: "",
    created_at: new Date().toISOString().slice(0, 16),
  });

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await API.get<HealthLog[]>("/health");
      setLogs(response.data);
      setError("");
    } catch (requestError) {
      const message = axios.isAxiosError(requestError)
        ? requestError.response?.data?.message || "Unable to load your health records right now."
        : "Unable to load your health records right now.";
      setError(message);
      console.error(requestError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchLogs();
  }, []);

  const latestLog = logs[logs.length - 1] ?? null;

  const chartData = useMemo(
    () =>
      logs.map((log) => ({
        ...log,
        label: new Date(log.created_at).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
      })),
    [logs]
  );

  const summary = useMemo(() => {
    if (!latestLog) {
      return null;
    }

    const bmi = latestLog.weight / Math.pow(latestLog.height_cm / 100, 2);
    const recentLogs = logs.slice(-7);

    return {
      bmi: toFixedNumber(bmi),
      bmiCategory:
        bmi < 18.5 ? "Underweight" : bmi < 25 ? "Healthy" : bmi < 30 ? "Overweight" : "Obese",
      weeklyWeight: toFixedNumber(average(recentLogs.map((item) => item.weight))),
      weeklySugar: toFixedNumber(average(recentLogs.map((item) => item.sugar_level))),
      weeklySleep: toFixedNumber(average(recentLogs.map((item) => item.sleep_hours))),
      weeklySystolic: toFixedNumber(average(recentLogs.map((item) => item.systolic_bp))),
      weeklyDiastolic: toFixedNumber(average(recentLogs.map((item) => item.diastolic_bp))),
      alerts: [
        latestLog.systolic_bp >= 140 || latestLog.diastolic_bp >= 90 ? "Elevated blood pressure trend detected." : null,
        latestLog.sugar_level >= 126 ? "Blood glucose is above the healthy fasting range." : null,
        latestLog.sleep_hours < 6 ? "Sleep recovery is below the recommended threshold." : null,
      ].filter(Boolean) as string[],
    };
  }, [latestLog, logs]);

  const exportPdf = async () => {
    if (!summary || !logs.length) {
      return;
    }

    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.setFillColor(248, 250, 252);
    pdf.rect(0, 0, pageWidth, 36, "F");
    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(22);
    pdf.text("CarePath Health Intelligence Report", 14, 20);
    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

    pdf.setFontSize(14);
    pdf.text("Summary", 14, 46);
    pdf.setFontSize(11);
    pdf.text(`BMI: ${summary.bmi} (${summary.bmiCategory})`, 14, 56);
    pdf.text(`Average BP: ${summary.weeklySystolic}/${summary.weeklyDiastolic}`, 14, 64);
    pdf.text(`Average Sugar: ${summary.weeklySugar} mg/dL`, 14, 72);
    pdf.text(`Average Sleep: ${summary.weeklySleep} hrs`, 14, 80);

    let alertsY = 94;
    pdf.setFontSize(14);
    pdf.text("Risk Alerts", 14, alertsY);
    pdf.setFontSize(11);

    const alertLines = summary.alerts.length
      ? summary.alerts
      : ["No acute risk alerts were detected in the latest health review."];

    alertLines.forEach((alert) => {
      const wrapped = pdf.splitTextToSize(alert, 178);
      pdf.text(wrapped, 14, alertsY + 8);
      alertsY += wrapped.length * 6 + 6;
    });

    autoTable(pdf, {
      startY: alertsY + 8,
      head: [["Date", "Weight", "Height", "BP", "Sugar", "Sleep"]],
      body: logs.map((log) => [
        new Date(log.created_at).toLocaleDateString(),
        `${log.weight} kg`,
        `${log.height_cm} cm`,
        `${log.systolic_bp}/${log.diastolic_bp}`,
        `${log.sugar_level} mg/dL`,
        `${log.sleep_hours} hrs`,
      ]),
      headStyles: { fillColor: [79, 70, 229], textColor: 255 },
      styles: { fontSize: 10 },
      margin: { bottom: 18 },
    });

    const totalPages = pdf.getNumberOfPages();
    for (let page = 1; page <= totalPages; page += 1) {
      pdf.setPage(page);
      pdf.setFontSize(10);
      pdf.text(`Page ${page} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: "center" });
    }

    pdf.save("carepath-health-report.pdf");
  };

  const saveLog = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await API.post("/health", {
        weight: Number(form.weight),
        height_cm: Number(form.height_cm),
        systolic_bp: Number(form.systolic_bp),
        diastolic_bp: Number(form.diastolic_bp),
        sugar_level: Number(form.sugar_level),
        sleep_hours: Number(form.sleep_hours),
        created_at: form.created_at,
      });

      setForm((current) => ({
        ...current,
        weight: "",
        systolic_bp: "",
        diastolic_bp: "",
        sugar_level: "",
        sleep_hours: "",
      }));
      setToast({ message: "Health log saved successfully.", tone: "success" });
      await fetchLogs();
    } catch (requestError) {
      const message = axios.isAxiosError(requestError)
        ? requestError.response?.data?.message || "Unable to save this health log."
        : "Unable to save this health log.";
      setError(message);
      setToast({ message, tone: "error" });
    } finally {
      setSaving(false);
    }
  };

  const stats =
    summary && latestLog
      ? [
          { label: "BMI", value: summary.bmi.toString(), detail: summary.bmiCategory, accent: "indigo" as const },
          { label: "Blood Pressure", value: `${latestLog.systolic_bp}/${latestLog.diastolic_bp}`, detail: "Latest reading", accent: "red" as const },
          { label: "Sugar", value: `${latestLog.sugar_level} mg/dL`, detail: "Latest reading", accent: "cyan" as const },
          { label: "Sleep", value: `${latestLog.sleep_hours} hrs`, detail: "Latest reading", accent: "yellow" as const },
        ]
      : [
          { label: "BMI", value: "--", detail: "Waiting for first entry", accent: "indigo" as const },
          { label: "Blood Pressure", value: "--", detail: "Waiting for first entry", accent: "red" as const },
          { label: "Sugar", value: "--", detail: "Waiting for first entry", accent: "cyan" as const },
          { label: "Sleep", value: "--", detail: "Waiting for first entry", accent: "yellow" as const },
        ];

  return (
    <div className="space-y-8">
      {toast ? <Toast message={toast.message} tone={toast.tone} /> : null}

      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-800">My health</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">A clear health workspace for daily monitoring.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Your measurements, weekly summaries, and reports stay visible and understandable on every device.
          </p>
        </div>
        <GradientButton onClick={exportPdf} disabled={!logs.length}>
          Export Report
        </GradientButton>
      </section>

      {error ? <ErrorState title="Dashboard data unavailable" message={error} actionLabel="Retry" onAction={() => void fetchLogs()} /> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => <LoadingSkeleton key={index} className="h-32" />)
          : stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <GlassCard className="p-5 sm:p-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-800">Daily entry</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Add health log</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">This form always stays visible so first-time users never land on an empty page.</p>
          </div>

          <form onSubmit={saveLog} className="mt-6 grid gap-4 sm:grid-cols-2">
            <InputField label="Weight (kg)" type="number" step="0.1" value={form.weight} onChange={(event) => setForm((current) => ({ ...current, weight: event.target.value }))} />
            <InputField label="Height (cm)" type="number" step="0.1" value={form.height_cm} onChange={(event) => setForm((current) => ({ ...current, height_cm: event.target.value }))} />
            <InputField label="Systolic BP" type="number" step="0.1" value={form.systolic_bp} onChange={(event) => setForm((current) => ({ ...current, systolic_bp: event.target.value }))} />
            <InputField label="Diastolic BP" type="number" step="0.1" value={form.diastolic_bp} onChange={(event) => setForm((current) => ({ ...current, diastolic_bp: event.target.value }))} />
            <InputField label="Sugar (mg/dL)" type="number" step="0.1" value={form.sugar_level} onChange={(event) => setForm((current) => ({ ...current, sugar_level: event.target.value }))} />
            <InputField label="Sleep (hours)" type="number" step="0.1" value={form.sleep_hours} onChange={(event) => setForm((current) => ({ ...current, sleep_hours: event.target.value }))} />
            <InputField label="Log time" type="datetime-local" value={form.created_at} onChange={(event) => setForm((current) => ({ ...current, created_at: event.target.value }))} className="sm:col-span-2" />
            <GradientButton type="submit" disabled={saving} className="w-full sm:col-span-2">
              {saving ? "Saving..." : "Save health log"}
            </GradientButton>
          </form>
        </GlassCard>

        <GlassCard className="p-5 sm:p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-800">Weekly summary</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">What matters right now</h2>

          {!summary ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-600">
              Start with your first log to unlock BMI, alerts, weekly averages, and trend analysis.
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  ["Avg BP", `${summary.weeklySystolic}/${summary.weeklyDiastolic}`],
                  ["Avg Sugar", `${summary.weeklySugar} mg/dL`],
                  ["Avg Sleep", `${summary.weeklySleep} hrs`],
                  ["Avg Weight", `${summary.weeklyWeight} kg`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-stone-200 bg-stone-50/80 p-4">
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3">
                {(summary.alerts.length ? summary.alerts : ["No critical alerts in the latest assessment."]).map((alert) => (
                  <div key={alert} className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-700">
                    {alert}
                  </div>
                ))}
              </div>
            </>
          )}
        </GlassCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Blood pressure trend" subtitle="Track systolic and diastolic changes over recent entries.">
          {loading ? (
            <LoadingSkeleton className="h-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid stroke="rgba(148,163,184,0.2)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid rgba(226,232,240,1)",
                    borderRadius: 16,
                    color: "#0f172a",
                  }}
                />
                <Line type="monotone" dataKey="systolic_bp" stroke="#f87171" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="diastolic_bp" stroke="#22d3ee" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {[
          { title: "Weight trend", key: "weight", stroke: "#0ea5e9" },
          { title: "Sugar trend", key: "sugar_level", stroke: "#a855f7" },
          { title: "Sleep trend", key: "sleep_hours", stroke: "#fbbf24" },
        ].map((chart) => (
          <ChartCard key={chart.title} title={chart.title} subtitle="A calmer chart style for daily health tracking.">
            {loading ? (
              <LoadingSkeleton className="h-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid stroke="rgba(148,163,184,0.2)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "#ffffff",
                      border: "1px solid rgba(226,232,240,1)",
                      borderRadius: 16,
                      color: "#0f172a",
                    }}
                  />
                  <Line type="monotone" dataKey={chart.key} stroke={chart.stroke} strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        ))}
      </section>
    </div>
  );
}

export default Dashboard;
