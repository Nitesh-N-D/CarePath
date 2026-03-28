import axios from "axios";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import Button from "../components/ui/Button";
import DiseaseCard from "../components/DiseaseCard";
import GradientButton from "../components/ui/GradientButton";
import GlassCard from "../components/ui/GlassCard";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import type { Disease, SearchResponse } from "../types/disease";

const featureCards = [
  { title: "Disease Library", copy: "Search structured medical references with symptoms, causes, treatment, and prevention in a cleaner format.", icon: "DL" },
  { title: "Health Journal", copy: "Track blood pressure, sugar, sleep, and weight in one timeline with exportable weekly reporting.", icon: "HJ" },
  { title: "AI Assistant", copy: "Get context-aware guidance shaped by your health record, recent trends, and reported conditions.", icon: "AI" },
  { title: "Risk Scoring", copy: "Surface high BP, BMI, glucose, and recovery alerts before they fade into the background.", icon: "RS" },
  { title: "Doctor Recommendations", copy: "Find relevant specialists based on your history and location without leaving the app.", icon: "DR" },
  { title: "Medication Reminders", copy: "Stay on schedule with reminders, notifications, and a more consistent daily routine.", icon: "MR" },
];

const doctorCards = [
  { name: "Dr. Aisha Menon", specialty: "Cardiology", rating: "4.8", tags: ["hypertension", "cardio", "Bengaluru"] },
  { name: "Dr. Rahul Khanna", specialty: "Endocrinology", rating: "4.7", tags: ["diabetes", "metabolic", "Delhi"] },
  { name: "Dr. Meera Kulkarni", specialty: "Pulmonology", rating: "4.6", tags: ["asthma", "respiratory", "Mumbai"] },
  { name: "Dr. Daniel George", specialty: "Neurology", rating: "4.9", tags: ["migraine", "neuro", "Hyderabad"] },
];

const timeline = [
  { title: "Track your health", copy: "Capture daily readings, medications, and symptoms in one place." },
  { title: "Understand your data", copy: "See BMI, charts, alerts, and weekly reporting without manual spreadsheets." },
  { title: "Get AI insights", copy: "Ask questions and receive context-aware guidance grounded in your record." },
  { title: "Take action", copy: "Follow reminders and move directly into suggested doctor options." },
];

function Home() {
  const { user } = useAuth();
  const [diseasePreview, setDiseasePreview] = useState<Disease[]>([]);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 160, damping: 18 });
  const smoothY = useSpring(mouseY, { stiffness: 160, damping: 18 });
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-8, 8]);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const glowY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  const dashboardPath = useMemo(() => {
    if (!user) return "/register";
    if (user.role === "admin") return "/admin";
    if (user.role === "doctor") return "/doctor";
    return "/dashboard";
  }, [user]);

  const reveal = {
    hidden: { opacity: 0, y: 24 },
    visible: (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay } }),
  };

  useEffect(() => {
    const fetchDiseasePreview = async () => {
      try {
        const response = await API.get<SearchResponse>("/diseases/search", { params: { limit: 3 } });
        setDiseasePreview(response.data.results);
      } catch (requestError) {
        if (axios.isAxiosError(requestError)) {
          console.error(requestError.response?.data?.message || requestError.message);
        } else {
          console.error(requestError);
        }
      }
    };

    void fetchDiseasePreview();
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 pb-8 sm:gap-20 sm:px-6 lg:gap-24">
      <section id="hero" className="relative overflow-hidden pt-4 sm:pt-8">
        <motion.div style={{ y: glowY }} className="absolute left-1/2 top-8 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-3xl" />
        <motion.div style={{ y: glowY }} className="absolute right-0 top-24 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.08fr]">
          <motion.div variants={reveal} initial="hidden" animate="visible">
            <div className="eyebrow">Modern healthcare tracking</div>
            <h1 className="mt-6 text-4xl font-semibold leading-[0.96] text-slate-900 sm:text-5xl md:text-6xl xl:text-7xl">
              Your entire health story, <span className="gradient-text">intelligently connected.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              CarePath brings health tracking, AI guidance, disease understanding, doctor recommendations, and medication reminders into one calm, premium experience.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <GradientButton to={dashboardPath} className="w-full sm:w-auto">Get Started</GradientButton>
              <Button to="/#ai-showcase" variant="outline" className="w-full sm:w-auto">View Demo</Button>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ["Health timelines", "24/7 visibility"],
                ["Weekly reports", "Exportable PDFs"],
                ["Smart guidance", "Context-aware AI"],
              ].map(([label, value]) => (
                <GlassCard key={label} className="p-4">
                  <div className="text-sm text-slate-500">{label}</div>
                  <div className="mt-2 text-xl font-semibold text-slate-900">{value}</div>
                </GlassCard>
              ))}
            </div>
          </motion.div>

          <motion.div
            style={{ y: heroY, rotateX, rotateY }}
            onMouseMove={(event) => {
              const bounds = event.currentTarget.getBoundingClientRect();
              mouseX.set((event.clientX - bounds.left) / bounds.width - 0.5);
              mouseY.set((event.clientY - bounds.top) / bounds.height - 0.5);
            }}
            onMouseLeave={() => {
              mouseX.set(0);
              mouseY.set(0);
            }}
            className="relative w-full [perspective:1200px]"
          >
            <div className="absolute inset-10 rounded-full bg-cyan-400/20 blur-3xl" />
            <GlassCard className="relative overflow-hidden border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.94),rgba(17,24,39,0.84))] p-6 text-white">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>CarePath overview</span>
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-300">Stable this week</span>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  ["BMI", "22.1"],
                  ["Risk Score", "32/100"],
                  ["AI Insight", "Reduce sodium"],
                ].map(([label, value]) => (
                  <motion.div key={label} whileHover={{ y: -4 }} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</div>
                    <div className="mt-3 text-2xl font-semibold text-white">{value}</div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="text-sm text-slate-300">Blood pressure trend</div>
                  <div className="mt-6 flex h-40 items-end gap-3">
                    {[40, 56, 62, 58, 74, 69, 81].map((height, index) => (
                      <motion.div
                        key={`${height}-${index}`}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ duration: 0.7, delay: 0.1 * index }}
                        className="flex-1 rounded-t-2xl bg-[linear-gradient(180deg,#22d3ee_0%,#0f766e_100%)]"
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <motion.div whileHover={{ x: 6 }} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-sm text-slate-300">AI note</div>
                    <div className="mt-3 text-sm leading-6 text-white">Based on your BP trend, consider reducing sodium intake and maintaining a consistent sleep schedule this week.</div>
                  </motion.div>
                  <motion.div whileHover={{ x: 6 }} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-sm text-slate-300">Weekly report</div>
                    <div className="mt-3 text-sm leading-6 text-white">Sleep improved 12%. Sugar remained stable. Weight trend is unchanged.</div>
                  </motion.div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["Built for modern healthcare tracking", "From disease understanding to reminders and doctor follow-up."],
          ["18k+", "health records organized"],
          ["42k+", "reports generated"],
          ["96%", "weekly consistency rate"],
        ].map(([title, copy], index) => (
          <motion.div key={title} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={reveal} custom={index * 0.05}>
            <GlassCard className="h-full p-6">
              <div className={`${index === 0 ? "text-base font-semibold text-slate-900" : "text-4xl font-semibold text-slate-900"}`}>{title}</div>
              <div className="mt-3 text-sm leading-6 text-slate-600">{copy}</div>
            </GlassCard>
          </motion.div>
        ))}
      </section>

      <section id="features" className="space-y-8">
        <div className="max-w-3xl">
          <div className="eyebrow">Core features</div>
          <h2 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">Everything you need to understand, monitor, and act on your health.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featureCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
              whileHover={{ y: -8 }}
            >
              <GlassCard className="h-full p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f766e_0%,#0891b2_100%)] text-sm font-semibold text-white">{card.icon}</div>
                <div className="mt-5 text-2xl font-semibold text-slate-900">{card.title}</div>
                <div className="mt-3 text-sm leading-7 text-slate-600">{card.copy}</div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="disease-library" className="space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="eyebrow">Disease library</div>
            <h2 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">Explore the encyclopedia directly from the landing page.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Browse structured condition profiles with symptoms, causes, treatment, and prevention before you even sign in.
            </p>
          </div>
          <Button to="/diseases" variant="outline" className="w-full sm:w-auto">Open Disease Library</Button>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {diseasePreview.map((disease, index) => (
            <motion.div
              key={disease.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
            >
              <DiseaseCard disease={disease} />
            </motion.div>
          ))}
          {!diseasePreview.length ? (
            <GlassCard className="p-6 md:col-span-2 xl:col-span-3">
              <div className="text-lg font-semibold text-slate-900">Disease library preview unavailable</div>
              <div className="mt-2 text-sm text-slate-600">
                The full encyclopedia is still available. Use the button above to open the complete disease library.
              </div>
            </GlassCard>
          ) : null}
        </div>
      </section>

      <section id="insights" className="grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr]">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={reveal}>
          <div className="eyebrow">See your health evolve</div>
          <h2 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">Charts that feel as thoughtful as the decisions they support.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">CarePath turns BP, BMI, and risk into a visual story you can actually use, rather than another wall of numbers.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.25 }}>
          <GlassCard className="p-6">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { label: "BP trend", values: [48, 58, 50, 68, 62, 72] },
                { label: "BMI", values: [55, 57, 59, 58, 60, 61] },
                { label: "Risk score", values: [34, 37, 33, 29, 28, 25] },
              ].map((chart, groupIndex) => (
                <div key={chart.label} className="min-w-0 rounded-2xl border border-[var(--color-border)] bg-white/70 p-4">
                  <div className="text-sm text-slate-500">{chart.label}</div>
                  <div className="mt-6 flex h-32 items-end gap-2">
                    {chart.values.map((height, index) => (
                      <motion.div
                        key={`${chart.label}-${height}`}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${height}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: groupIndex * 0.08 + index * 0.05, duration: 0.5 }}
                        className="flex-1 rounded-t-xl bg-[linear-gradient(180deg,#38bdf8_0%,#0f766e_100%)]"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </section>

      <section id="ai-showcase" className="grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr]">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={reveal}>
          <div className="eyebrow">AI guidance</div>
          <h2 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">A real assistant interface, not a generic chatbot box.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">CarePath AI can read your trend lines, recent logs, and stored profile context before suggesting next steps, preventive habits, or when to seek medical support.</p>
        </motion.div>
        <GlassCard className="p-6">
          <div className="space-y-3">
            <div className="max-w-[85%] rounded-2xl bg-white p-4 text-sm text-slate-700 shadow-sm">My blood pressure has been rising this week. What should I pay attention to?</div>
            <div className="ml-auto max-w-[85%] rounded-2xl bg-slate-900 p-4 text-sm leading-6 text-white">Based on your BP trend, consider reducing sodium intake, keeping hydration steady, and taking readings at the same time daily. If the elevation continues, plan a clinician review.</div>
          </div>
        </GlassCard>
      </section>

      <section id="doctors" className="space-y-8">
        <div className="max-w-3xl">
          <div className="eyebrow">Doctor recommendations</div>
          <h2 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">Relevant specialists, presented like part of the product instead of an afterthought.</h2>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-2">
          {doctorCards.map((doctor, index) => (
            <motion.div
              key={doctor.name}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
            className="min-w-[280px] sm:min-w-[320px]"
          >
              <GlassCard className="h-full p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xl font-semibold text-slate-900">{doctor.name}</div>
                    <div className="mt-1 text-sm text-slate-500">{doctor.specialty}</div>
                  </div>
                  <div className="rounded-full bg-cyan-50 px-3 py-1 text-sm text-cyan-700">{doctor.rating}</div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {doctor.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-[var(--color-border)] bg-white/70 px-3 py-1 text-xs text-[var(--color-text-soft)]">
                      {tag}
                    </span>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="workflow" className="space-y-8">
        <div className="max-w-3xl">
          <div className="eyebrow">Workflow</div>
          <h2 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">A clearer flow from data capture to action.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-4">
          {timeline.map((step, index) => (
            <motion.div key={step.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }}>
              <GlassCard className="relative h-full p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f766e_0%,#0891b2_100%)] text-sm font-semibold text-white">
                  {index + 1}
                </div>
                <div className="mt-5 text-2xl font-semibold text-slate-900">{step.title}</div>
                <div className="mt-3 text-sm leading-7 text-slate-600">{step.copy}</div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="cta">
        <GlassCard className="overflow-hidden p-6 text-center sm:p-8 lg:p-10">
          <div className="mx-auto max-w-3xl">
            <div className="eyebrow">Start here</div>
            <h2 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl lg:text-5xl">Start managing your health like a system.</h2>
            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">CarePath helps you move from scattered readings and generic advice to a connected health story with real follow-through.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <GradientButton to={dashboardPath} className="w-full sm:w-auto">Start Free</GradientButton>
              <Button to="/#features" variant="outline" className="w-full sm:w-auto">Explore Features</Button>
            </div>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}

export default Home;
