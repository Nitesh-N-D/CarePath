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
  latest_log: {
    weight: number;
    height_cm: number;
    systolic_bp: number;
    diastolic_bp: number;
    sugar_level: number;
    sleep_hours: number;
    created_at: string;
  } | null;
}

function DoctorDashboard() {
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<Record<string, string[]>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    void fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await API.get<PatientRow[]>("/doctor/patients");
      setPatients(response.data);
      if (response.data[0]) {
        setSelectedPatientId(response.data[0].id);
      }
      setError("");
    } catch (requestError) {
      console.error(requestError);
      setError("Unable to load assigned patients right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === selectedPatientId) ?? patients[0] ?? null,
    [patients, selectedPatientId]
  );

  const saveNote = () => {
    if (!selectedPatient || !note.trim()) {
      return;
    }

    setNotes((current) => ({
      ...current,
      [selectedPatient.id]: [note.trim(), ...(current[selectedPatient.id] || [])],
    }));
    setNote("");
    setModalOpen(false);
    setToast("Clinical note added.");
  };

  return (
    <div className="space-y-8">
      {toast ? <Toast message={toast} /> : null}

      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-sky-700">Doctor panel</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Patient monitoring with clearer medical workflows.</h1>
        </div>
        <Button type="button" variant="default" onClick={() => setModalOpen(true)} disabled={!selectedPatient} className="rounded-2xl px-5 py-3">
          Add Note
        </Button>
      </section>

      {error ? <ErrorState title="Doctor panel unavailable" message={error} actionLabel="Retry" onAction={() => void fetchPatients()} /> : null}

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <GlassCard className="overflow-hidden p-0">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-xl font-semibold text-slate-900">Assigned patients</h2>
            <p className="mt-2 text-sm text-slate-500">Review the latest linked patients and move directly into their current context.</p>
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="space-y-3 px-6 py-6">
                {Array.from({ length: 5 }).map((_, index) => <LoadingSkeleton key={index} className="h-16" />)}
              </div>
            ) : patients.length ? (
              patients.map((patient) => (
                <Button
                  key={patient.id}
                  type="button"
                  variant="ghost"
                  onClick={() => setSelectedPatientId(patient.id)}
                  className={`h-auto w-full justify-start rounded-none px-6 py-4 text-left shadow-none transition duration-300 ${
                    selectedPatient?.id === patient.id ? "bg-cyan-50 text-slate-900" : "hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <div className="font-medium text-slate-900">{patient.name}</div>
                    <div className="mt-1 text-sm text-slate-500">{patient.email}</div>
                  </div>
                </Button>
              ))
            ) : (
              <div className="px-6 py-8 text-slate-500">No patients have been assigned yet.</div>
            )}
          </div>
        </GlassCard>

        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => <LoadingSkeleton key={index} className="h-32" />)
              : selectedPatient?.latest_log
                ? [
                    { label: "Weight", value: `${selectedPatient.latest_log.weight} kg`, detail: "Latest entry", accent: "cyan" as const },
                    { label: "BP", value: `${selectedPatient.latest_log.systolic_bp}/${selectedPatient.latest_log.diastolic_bp}`, detail: "Latest entry", accent: "red" as const },
                    { label: "Sugar", value: `${selectedPatient.latest_log.sugar_level} mg/dL`, detail: "Latest entry", accent: "indigo" as const },
                    { label: "Sleep", value: `${selectedPatient.latest_log.sleep_hours} hrs`, detail: "Latest entry", accent: "yellow" as const },
                  ].map((item) => <StatCard key={item.label} {...item} />)
                : Array.from({ length: 4 }).map((_, index) => (
                    <StatCard key={index} label="No data" value="--" detail="Awaiting patient logs" accent="indigo" />
                  ))}
          </section>

          <GlassCard className="p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-sky-700">Patient overview</p>
            {selectedPatient ? (
              <div className="mt-4 space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">{selectedPatient.name}</h2>
                  <p className="mt-2 text-sm text-slate-500">Member since {new Date(selectedPatient.created_at).toLocaleDateString()}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Health trend snapshot</span>
                    <span className="text-sm text-sky-700">Latest signal</span>
                  </div>
                  <div className="mt-5 flex h-40 items-end gap-3">
                    {[52, 64, 48, 76, 58, 88, 66].map((height, index) => (
                      <div
                        key={height}
                        className={`flex-1 rounded-t-2xl bg-gradient-to-t ${
                          index % 2 === 0 ? "from-sky-500 to-indigo-500" : "from-teal-400 to-sky-500"
                        }`}
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-slate-500">Select a patient to review health details.</p>
            )}
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Clinical notes</h2>
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(true)}
                className="rounded-full px-4 py-2 text-sm"
              >
                Add note
              </Button>
            </div>
            <div className="mt-5 space-y-3">
              {(selectedPatient && notes[selectedPatient.id]?.length
                ? notes[selectedPatient.id]
                : ["No notes yet for this patient."]).map((entry) => (
                <div key={entry} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
                  {entry}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </section>

      <Modal open={modalOpen} title="Add clinical note" onClose={() => setModalOpen(false)}>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={5}
          placeholder="Write a clinical observation, recommendation, or follow-up note..."
          className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 outline-none transition duration-300 focus:border-sky-300"
        />
        <div className="mt-4 flex justify-end">
          <Button type="button" variant="default" onClick={saveNote} className="rounded-2xl px-5 py-3">
            Save note
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default DoctorDashboard;
