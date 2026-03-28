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

interface PatientRow {
  id: string;
  name: string;
  email: string;
  created_at: string;
  age?: number;
  gender?: string;
  location?: string;
  primary_goal?: string;
  chronic_conditions?: string[];
  latest_log: {
    weight: number;
    height_cm: number;
    systolic_bp: number;
    diastolic_bp: number;
    sugar_level: number;
    sleep_hours: number;
    created_at: string;
  } | null;
  risk_assessment: {
    riskScore: number;
    prediction: { title: string; summary: string };
    alerts: { label: string; message: string }[];
  };
}

interface ClinicalNote {
  id: string;
  patient_user_id: string;
  note: string;
  created_at: string;
}

function DoctorDashboard() {
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [patientsResponse, notesResponse] = await Promise.all([
        API.get<PatientRow[]>("/doctor/patients"),
        API.get<ClinicalNote[]>("/doctor/notes"),
      ]);
      setPatients(patientsResponse.data);
      setNotes(notesResponse.data);
      setSelectedPatientId((current) => current || patientsResponse.data[0]?.id || "");
      setError("");
    } catch (requestError) {
      setError("Unable to load assigned patients right now.");
      console.error(requestError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === selectedPatientId) ?? patients[0] ?? null,
    [patients, selectedPatientId]
  );

  const patientNotes = useMemo(
    () => notes.filter((note) => note.patient_user_id === selectedPatient?.id),
    [notes, selectedPatient?.id]
  );

  const saveNote = async () => {
    if (!selectedPatient || !noteInput.trim()) return;
    try {
      await API.post("/doctor/notes", {
        patient_user_id: selectedPatient.id,
        note: noteInput.trim(),
      });
      setNoteInput("");
      setModalOpen(false);
      setToast("Clinical note added.");
      await fetchData();
    } catch (requestError) {
      setToast(
        axios.isAxiosError(requestError)
          ? requestError.response?.data?.message || "Unable to save note."
          : "Unable to save note."
      );
    }
  };

  return (
    <div className="space-y-8">
      {toast ? <Toast message={toast} tone={toast.includes("Unable") ? "error" : "success"} /> : null}

      <section className="rounded-[28px] border border-borderLight/80 bg-gradient-to-br from-white via-white to-sky-50/60 p-6 shadow-soft dark:border-borderDark dark:from-slate-950 dark:via-slate-950 dark:to-sky-950/30">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200/70 bg-sky-50/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-200">
              Clinical operations
            </div>
            <p className="section-heading">CarePath for clinicians</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Review assigned patients, follow their health signals, and keep notes in one place.</h1>
          </div>
          <Button type="button" variant="default" onClick={() => setModalOpen(true)} disabled={!selectedPatient} className="w-full rounded-2xl px-5 py-3 sm:w-auto">Add note</Button>
        </div>
      </section>

      {error ? <ErrorState title="Doctor panel unavailable" message={error} actionLabel="Retry" onAction={() => void fetchData()} /> : null}

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <GlassCard className="overflow-hidden p-0">
          <div className="border-b border-borderLight/80 px-6 py-5 dark:border-borderDark">
            <p className="section-heading">Roster</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Assigned patients</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Review current assignments with their latest predictive risk snapshot.</p>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <div className="space-y-3 px-6 py-6">
                {Array.from({ length: 5 }).map((_, index) => <LoadingSkeleton key={index} className="h-16" />)}
              </div>
            ) : patients.length ? (
              patients.map((patient) => (
                <button key={patient.id} type="button" onClick={() => setSelectedPatientId(patient.id)} className={`w-full px-6 py-4 text-left transition duration-300 ${selectedPatient?.id === patient.id ? "bg-cyan-50 dark:bg-cyan-950/25" : "hover:bg-slate-50 dark:hover:bg-slate-900/70"}`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">{patient.name}</div>
                      <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{patient.email}</div>
                    </div>
                    <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">{patient.risk_assessment.riskScore}/100</div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-6 py-8 text-slate-500">No patients have been assigned yet.</div>
            )}
          </div>
        </GlassCard>

        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {loading ? Array.from({ length: 4 }).map((_, index) => <LoadingSkeleton key={index} className="h-32" />) : selectedPatient?.latest_log ? [
              { label: "Weight", value: `${selectedPatient.latest_log.weight} kg`, detail: "Latest entry", accent: "cyan" as const },
              { label: "BP", value: `${selectedPatient.latest_log.systolic_bp}/${selectedPatient.latest_log.diastolic_bp}`, detail: "Latest entry", accent: "red" as const },
              { label: "Sugar", value: `${selectedPatient.latest_log.sugar_level} mg/dL`, detail: "Latest entry", accent: "indigo" as const },
              { label: "Risk Score", value: `${selectedPatient.risk_assessment.riskScore}/100`, detail: selectedPatient.risk_assessment.prediction.title, accent: "yellow" as const },
            ].map((item) => <StatCard key={item.label} {...item} />) : Array.from({ length: 4 }).map((_, index) => <StatCard key={index} label="No data" value="--" detail="Awaiting patient logs" accent="indigo" />)}
          </section>

          <GlassCard className="p-6">
            <p className="section-heading">Patient overview</p>
            {selectedPatient ? (
              <div className="mt-4 space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{selectedPatient.name}</h2>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Member since {new Date(selectedPatient.created_at).toLocaleDateString()}</p>
                </div>
                <div className="rounded-2xl border border-borderLight/80 bg-white/90 p-5 text-sm leading-6 text-slate-600 shadow-sm dark:border-borderDark dark:bg-slate-900/80 dark:text-slate-300">
                  {selectedPatient.age ? `Age ${selectedPatient.age}` : "Age not provided"} · {selectedPatient.gender || "Gender not provided"} · {selectedPatient.location || "Location not provided"}
                </div>
                <div className="rounded-2xl border border-borderLight/80 bg-white/90 p-5 text-sm leading-6 text-slate-600 shadow-sm dark:border-borderDark dark:bg-slate-900/80 dark:text-slate-300">
                  Goal: {selectedPatient.primary_goal || "No primary goal recorded."}
                </div>
                <div className="space-y-3">
                  {(selectedPatient.risk_assessment.alerts.length ? selectedPatient.risk_assessment.alerts : [{ label: "No active alerts", message: "No major alerts are currently active for this patient." }]).map((alert) => (
                    <div key={alert.label} className="rounded-2xl border border-borderLight/80 bg-slate-50 p-4 text-sm leading-6 text-slate-700 dark:border-borderDark dark:bg-slate-900/70 dark:text-slate-200">
                      <div className="font-semibold text-slate-900 dark:text-white">{alert.label}</div>
                      <div className="mt-1">{alert.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-4 text-slate-500 dark:text-slate-400">Select a patient to review health details.</p>
            )}
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="section-heading">Documentation</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Clinical notes</h2>
              </div>
              <Button type="button" variant="outline" onClick={() => setModalOpen(true)} className="w-full rounded-full px-4 py-2 text-sm sm:w-auto">Add note</Button>
            </div>
            <div className="mt-5 space-y-3">
              {patientNotes.length ? patientNotes.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-borderLight/80 bg-white/90 p-4 text-sm leading-6 text-slate-600 shadow-sm dark:border-borderDark dark:bg-slate-900/80 dark:text-slate-300">
                  <div>{entry.note}</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">{new Date(entry.created_at).toLocaleString()}</div>
                </div>
              )) : <div className="rounded-2xl border border-borderLight/80 bg-white/90 p-4 text-sm leading-6 text-slate-500 shadow-sm dark:border-borderDark dark:bg-slate-900/80 dark:text-slate-400">No notes yet for this patient.</div>}
            </div>
          </GlassCard>
        </div>
      </section>

      <Modal open={modalOpen} title="Add clinical note" onClose={() => setModalOpen(false)}>
        <textarea value={noteInput} onChange={(event) => setNoteInput(event.target.value)} rows={5} placeholder="Write a clinical observation, recommendation, or follow-up note..." className="w-full rounded-2xl border border-borderLight/80 bg-white p-4 text-slate-900 outline-none transition duration-300 focus:border-sky-300 dark:border-borderDark dark:bg-slate-900 dark:text-white" />
        <div className="mt-4 flex justify-end">
          <Button type="button" variant="default" onClick={() => void saveNote()} className="rounded-2xl px-5 py-3">Save note</Button>
        </div>
      </Modal>
    </div>
  );
}

export default DoctorDashboard;
