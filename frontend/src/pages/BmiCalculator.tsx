import { motion } from "framer-motion";
import { useMemo, useState } from "react";

import GlassCard from "../components/ui/GlassCard";
import InputField from "../components/ui/InputField";

function getCategory(bmi: number) {
  if (bmi < 18.5) return { label: "Underweight", tone: "bg-amber-400" };
  if (bmi < 25) return { label: "Normal", tone: "bg-emerald-500" };
  if (bmi < 30) return { label: "Overweight", tone: "bg-orange-500" };
  return { label: "Obese", tone: "bg-rose-500" };
}

function BmiCalculator() {
  const [height, setHeight] = useState("170");
  const [weight, setWeight] = useState("68");

  const bmi = useMemo(() => {
    const parsedHeight = Number(height);
    const parsedWeight = Number(weight);
    if (!parsedHeight || !parsedWeight) return 0;
    return Number((parsedWeight / Math.pow(parsedHeight / 100, 2)).toFixed(1));
  }, [height, weight]);

  const category = getCategory(bmi || 0);
  const progress = Math.min(100, Math.max(8, ((bmi || 0) / 40) * 100));

  return (
    <div className="space-y-8">
      <section className="max-w-3xl">
        <p className="section-heading">BMI Calculator</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">See your body mass index instantly.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">Use CarePath&apos;s dedicated calculator to estimate BMI, understand your category, and spot changes before they become a pattern.</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <GlassCard className="p-6">
          <div className="grid gap-4">
            <InputField label="Height (cm)" type="number" value={height} onChange={(event) => setHeight(event.target.value)} />
            <InputField label="Weight (kg)" type="number" value={weight} onChange={(event) => setWeight(event.target.value)} />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-[var(--color-text-soft)]">Current BMI</p>
              <div className="mt-2 text-5xl font-semibold text-slate-900 sm:text-6xl">{bmi || "--"}</div>
            </div>
            <div className="rounded-full border border-white/10 bg-slate-900 px-4 py-2 text-sm text-white">{category.label}</div>
          </div>

          <div className="mt-8 h-4 overflow-hidden rounded-full bg-slate-200/70">
            <motion.div
              className={`h-full rounded-full ${category.tone}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            {["Underweight", "Normal", "Overweight", "Obese"].map((item) => (
              <div key={item} className={`rounded-xl border p-3 text-center text-sm ${item === category.label ? "border-emerald-400 bg-emerald-50 text-emerald-800" : "border-[var(--color-border)] bg-white/60 text-[var(--color-text-soft)]"}`}>
                {item}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

export default BmiCalculator;
