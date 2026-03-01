import { useEffect, useState, useMemo, useRef } from "react";
import API from "../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface HealthLog {
  id: string;
  weight: number;
  systolic_bp: number;
  diastolic_bp: number;
  sugar_level: number;
  sleep_hours: number;
  created_at: string;
  date?: string;
}

function Dashboard() {
  const reportRef = useRef<HTMLDivElement>(null);

  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    weight: "",
    height: "170",
    systolic_bp: "",
    diastolic_bp: "",
    sugar_level: "",
    sleep_hours: "",
    date: new Date().toISOString().split("T")[0], // calendar default
  });

  useEffect(() => {
    fetchHealthLogs();
  }, []);

  const fetchHealthLogs = async () => {
    try {
      const res = await API.get("/health");

      const sorted = res.data.sort(
        (a: HealthLog, b: HealthLog) =>
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
      );

      const formatted = sorted.map((log: HealthLog) => ({
        ...log,
        date: new Date(log.created_at).toLocaleDateString(),
      }));

      setLogs(formatted);
    } catch {
      setError("Failed to load logs.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();

    await API.post("/health", {
      weight: Number(form.weight),
      systolic_bp: Number(form.systolic_bp),
      diastolic_bp: Number(form.diastolic_bp),
      sugar_level: Number(form.sugar_level),
      sleep_hours: Number(form.sleep_hours),
      date: form.date,
    });

    await fetchHealthLogs();

    setForm({
      ...form,
      weight: "",
      systolic_bp: "",
      diastolic_bp: "",
      sugar_level: "",
      sleep_hours: "",
    });
  };

  const latestLog = logs[logs.length - 1];

  // ---------------------------
  // BMI
  // ---------------------------

  const bmi = useMemo(() => {
    if (!latestLog) return null;
    const heightMeters = Number(form.height) / 100;
    return (latestLog.weight / (heightMeters * heightMeters)).toFixed(1);
  }, [latestLog, form.height]);

  const bmiCategory = () => {
    if (!bmi) return "";
    const value = Number(bmi);
    if (value < 18.5) return "Underweight";
    if (value < 25) return "Normal";
    if (value < 30) return "Overweight";
    return "Obese";
  };

  // ---------------------------
  // Risk Detection
  // ---------------------------

  const riskWarnings = useMemo(() => {
    if (!latestLog) return [];
    const warnings: string[] = [];

    if (latestLog.systolic_bp > 130 || latestLog.diastolic_bp > 85)
      warnings.push("High Blood Pressure detected");

    if (latestLog.sugar_level > 125)
      warnings.push("Elevated Blood Sugar");

    if (latestLog.sleep_hours < 6)
      warnings.push("Poor Sleep Quality");

    return warnings;
  }, [latestLog]);

  // ---------------------------
  // Weekly Summary
  // ---------------------------

  const weeklyAverage = useMemo(() => {
    if (logs.length === 0) return null;

    const last7 = logs.slice(-7);

    const avgWeight =
      last7.reduce((sum, l) => sum + l.weight, 0) / last7.length;

    const avgSugar =
      last7.reduce((sum, l) => sum + l.sugar_level, 0) / last7.length;

    return {
      avgWeight: avgWeight.toFixed(1),
      avgSugar: avgSugar.toFixed(1),
    };
  }, [logs]);

  // ---------------------------
  // Export PDF
  // ---------------------------

const exportPDF = () => {
  const pdf = new jsPDF();

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // -------------------------
  // Title
  // -------------------------
  pdf.setFontSize(20);
  pdf.text("CarePath Health Report", 14, 20);

  pdf.setFontSize(12);
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

  let currentY = 40;

  // -------------------------
  // BMI Section
  // -------------------------
  if (bmi) {
    pdf.setFontSize(14);
    pdf.text("Body Mass Index (BMI)", 14, currentY);
    currentY += 8;

    pdf.setFontSize(12);
    pdf.text(`BMI: ${bmi}`, 14, currentY);
    currentY += 6;

    pdf.text(`Category: ${bmiCategory()}`, 14, currentY);
    currentY += 12;
  }

  // -------------------------
  // Risk Indicators
  // -------------------------
  // -------------------------
// Risk Indicators
// -------------------------
if (riskWarnings.length > 0) {
  pdf.setFontSize(14);
  pdf.text("Risk Alerts", 14, currentY);
  currentY += 8;

  pdf.setFontSize(12);

  riskWarnings.forEach((warning) => {
    // Remove emojis and special symbols
    const cleanText = warning
      .replace(/[^\x00-\x7F]/g, "")   // remove unicode characters
      .replace(/[⚠️]/g, "")           // remove emoji
      .trim();

    // Wrap long lines automatically
    const wrapped = pdf.splitTextToSize(cleanText, 180);

    pdf.text(wrapped, 14, currentY);
    currentY += wrapped.length * 6;
  });

  currentY += 6;
}

  // -------------------------
  // Weekly Summary
  // -------------------------
  if (weeklyAverage) {
    pdf.setFontSize(14);
    pdf.text("Weekly Summary", 14, currentY);
    currentY += 8;

    pdf.setFontSize(12);
    pdf.text(`Average Weight: ${weeklyAverage.avgWeight} kg`, 14, currentY);
    currentY += 6;

    pdf.text(`Average Sugar: ${weeklyAverage.avgSugar} mg/dL`, 14, currentY);
    currentY += 12;
  }

  // -------------------------
  // Health Log Table
  // -------------------------
  const tableData = logs.map((log) => [
    log.date || "",
    log.weight?.toString() || "",
    `${log.systolic_bp}/${log.diastolic_bp}`,
    log.sugar_level?.toString() || "",
    log.sleep_hours?.toString() || "",
  ]);

  autoTable(pdf, {
    startY: currentY,
    head: [["Date", "Weight (kg)", "BP", "Sugar", "Sleep (hrs)"]],
    body: tableData as any,
    styles: { fontSize: 10 },
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
    },
    margin: { bottom: 20 }, // space for footer
  });

  // -------------------------
  // Add Page Numbers (Multi-page Support)
  // -------------------------
  const totalPages = pdf.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);

    pdf.setFontSize(10);

    // Page number centered
    pdf.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );

    // Optional left footer branding
    pdf.text(
      "CarePath Health Report",
      14,
      pageHeight - 10
    );
  }

  pdf.save("carepath-health-report.pdf");
};
  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="space-y-10" ref={reportRef}>
      <h1 className="text-3xl font-semibold">Health Dashboard</h1>

      {/* Calendar-based Entry Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Add Daily Health Log</h2>

        <form onSubmit={handleAddLog} className="grid grid-cols-2 gap-4">

          <input type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="border p-2 rounded"
            required />

          <input placeholder="Weight (kg)"
            value={form.weight}
            onChange={(e) => setForm({ ...form, weight: e.target.value })}
            className="border p-2 rounded" required />

          <input placeholder="Height (cm)"
            value={form.height}
            onChange={(e) => setForm({ ...form, height: e.target.value })}
            className="border p-2 rounded" required />

          <input placeholder="Systolic BP"
            value={form.systolic_bp}
            onChange={(e) => setForm({ ...form, systolic_bp: e.target.value })}
            className="border p-2 rounded" required />

          <input placeholder="Diastolic BP"
            value={form.diastolic_bp}
            onChange={(e) => setForm({ ...form, diastolic_bp: e.target.value })}
            className="border p-2 rounded" required />

          <input placeholder="Sugar Level"
            value={form.sugar_level}
            onChange={(e) => setForm({ ...form, sugar_level: e.target.value })}
            className="border p-2 rounded" required />

          <input placeholder="Sleep Hours"
            value={form.sleep_hours}
            onChange={(e) => setForm({ ...form, sleep_hours: e.target.value })}
            className="border p-2 rounded" required />

          <button className="col-span-2 bg-blue-600 text-white py-2 rounded">
            Save Daily Log
          </button>
        </form>
      </div>

      {/* BMI */}
      {bmi && (
        <div className="bg-green-100 p-4 rounded">
          <strong>BMI:</strong> {bmi} ({bmiCategory()})
        </div>
      )}

      {/* Risk */}
      {riskWarnings.length > 0 && (
        <div className="bg-red-100 p-4 rounded">
          {riskWarnings.map((r, i) => <div key={i}>{r}</div>)}
        </div>
      )}

      {/* Weekly Summary */}
      {weeklyAverage && (
        <div className="bg-yellow-100 p-4 rounded">
          <strong>Weekly Average:</strong><br />
          Weight: {weeklyAverage.avgWeight} kg<br />
          Sugar: {weeklyAverage.avgSugar} mg/dL
        </div>
      )}

      {/* ALL GRAPHS */}

      {logs.length > 0 && (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={logs}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line dataKey="weight" stroke="#2563eb" />
            </LineChart>
          </ResponsiveContainer>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={logs}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line dataKey="systolic_bp" stroke="#dc2626" />
              <Line dataKey="diastolic_bp" stroke="#16a34a" />
            </LineChart>
          </ResponsiveContainer>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={logs}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line dataKey="sugar_level" stroke="#7c3aed" />
            </LineChart>
          </ResponsiveContainer>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={logs}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line dataKey="sleep_hours" stroke="#f59e0b" />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}

      <button
        onClick={exportPDF}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Export Health Report as PDF
      </button>
    </div>
  );
}

export default Dashboard;