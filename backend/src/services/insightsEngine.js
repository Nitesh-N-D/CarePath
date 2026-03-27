function buildWeeklyInsightPack({ profile, riskAssessment, logs }) {
  const alerts = riskAssessment.alerts || [];
  const latest = riskAssessment.latest;
  const weekly = riskAssessment.weeklyAverages;

  const suggestions = [];

  if (latest?.bloodPressureCategory === "High" || latest?.bloodPressureCategory === "Hypertensive crisis") {
    suggestions.push("Reduce sodium-heavy meals this week and aim for 20 to 30 minutes of light movement most days.");
  }

  if (latest?.sugarCategory === "High" || latest?.sugarCategory === "Very high") {
    suggestions.push("Favor steady meals with protein and fiber first, and log glucose at consistent times for better comparisons.");
  }

  if (latest?.bmiCategory === "Overweight" || latest?.bmiCategory === "Obese") {
    suggestions.push("A small calorie deficit, consistent sleep, and walking after meals could improve both BMI and blood pressure trends.");
  }

  if ((weekly?.sleepHours || 0) < 7) {
    suggestions.push("Protect a fixed sleep window for the next 7 days to support recovery, appetite regulation, and blood pressure stability.");
  }

  if (!suggestions.length) {
    suggestions.push("Maintain your current routine, keep logging consistently, and use weekly reports to catch subtle trend changes early.");
  }

  const preventions = [
    "Book a clinician review if elevated readings persist for more than one week.",
    "Keep medications, sleep, movement, and hydration consistent before comparing trends.",
    "Use the disease encyclopedia to understand warning signs, but treat red-flag symptoms as a prompt for medical care.",
  ];

  if (profile?.chronic_conditions?.length) {
    preventions.unshift(
      `Prioritize follow-up plans for: ${profile.chronic_conditions.join(", ")}. Condition-aware monitoring improves early intervention.`
    );
  }

  return {
    title: "Weekly Health Report",
    generatedAt: new Date().toISOString(),
    overview:
      alerts.length > 0
        ? `You have ${alerts.length} active health alert${alerts.length > 1 ? "s" : ""} this week, with an overall risk score of ${riskAssessment.riskScore}/100.`
        : `No major acute alerts were detected this week. Your current risk score is ${riskAssessment.riskScore}/100.`,
    insights: [
      riskAssessment.prediction.summary,
      logs.length >= 7
        ? "Trend confidence improved because at least seven health entries are available."
        : "Trend confidence is still limited because fewer than seven entries are available.",
    ],
    personalizedSuggestions: suggestions,
    preventiveTips: preventions,
  };
}

module.exports = { buildWeeklyInsightPack };
