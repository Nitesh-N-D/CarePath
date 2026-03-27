function round(value, digits = 1) {
  return Number(Number(value || 0).toFixed(digits));
}

function calculateBmi(weight, heightCm) {
  if (!weight || !heightCm) {
    return null;
  }

  const bmi = Number(weight) / Math.pow(Number(heightCm) / 100, 2);
  return round(bmi);
}

function getBmiCategory(bmi) {
  if (bmi == null) {
    return "Unavailable";
  }

  if (bmi < 18.5) {
    return "Underweight";
  }

  if (bmi < 25) {
    return "Normal";
  }

  if (bmi < 30) {
    return "Overweight";
  }

  return "Obese";
}

function getBloodPressureCategory(systolic, diastolic) {
  if (!systolic || !diastolic) {
    return "Unavailable";
  }

  if (systolic >= 180 || diastolic >= 120) {
    return "Hypertensive crisis";
  }

  if (systolic >= 140 || diastolic >= 90) {
    return "High";
  }

  if (systolic >= 130 || diastolic >= 80) {
    return "Elevated";
  }

  return "Healthy";
}

function getSugarCategory(sugarLevel) {
  if (!sugarLevel) {
    return "Unavailable";
  }

  if (sugarLevel >= 180) {
    return "Very high";
  }

  if (sugarLevel >= 126) {
    return "High";
  }

  if (sugarLevel <= 70) {
    return "Low";
  }

  return "Healthy";
}

function average(values) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length;
}

function createAlert({ level, label, message, color }) {
  return { level, label, message, color };
}

function buildRiskAssessment(logs) {
  const latest = logs[logs.length - 1] || null;
  const weekly = logs.slice(-7);

  if (!latest) {
    return {
      latest: null,
      weeklyAverages: null,
      alerts: [],
      riskScore: 0,
      prediction: {
        title: "Insufficient data",
        confidence: "Low",
        summary: "Add at least one health log to unlock risk scoring and predictive guidance.",
      },
    };
  }

  const bmi = calculateBmi(latest.weight, latest.height_cm);
  const bmiCategory = getBmiCategory(bmi);
  const bpCategory = getBloodPressureCategory(latest.systolic_bp, latest.diastolic_bp);
  const sugarCategory = getSugarCategory(latest.sugar_level);

  const weeklyAverages = {
    weight: round(average(weekly.map((entry) => entry.weight))),
    systolicBp: round(average(weekly.map((entry) => entry.systolic_bp))),
    diastolicBp: round(average(weekly.map((entry) => entry.diastolic_bp))),
    sugarLevel: round(average(weekly.map((entry) => entry.sugar_level))),
    sleepHours: round(average(weekly.map((entry) => entry.sleep_hours))),
  };

  const alerts = [];
  let riskScore = 10;

  if (bpCategory === "Hypertensive crisis") {
    alerts.push(
      createAlert({
        level: "critical",
        label: "Urgent blood pressure warning",
        message: "Your latest blood pressure reading is in a crisis range. Please seek urgent medical care.",
        color: "rose",
      })
    );
    riskScore += 40;
  } else if (bpCategory === "High") {
    alerts.push(
      createAlert({
        level: "high",
        label: "High blood pressure trend",
        message: "Your latest reading is above the healthy range. Monitor closely and discuss medication or lifestyle changes with a clinician.",
        color: "amber",
      })
    );
    riskScore += 25;
  } else if (bpCategory === "Elevated") {
    alerts.push(
      createAlert({
        level: "medium",
        label: "Elevated blood pressure",
        message: "Your blood pressure is trending upward. Reduce sodium intake, improve sleep, and keep tracking daily.",
        color: "yellow",
      })
    );
    riskScore += 12;
  }

  if (bmiCategory === "Obese") {
    alerts.push(
      createAlert({
        level: "high",
        label: "BMI risk",
        message: "BMI is in the obese range. Sustainable nutrition and activity changes can meaningfully reduce cardio-metabolic risk.",
        color: "rose",
      })
    );
    riskScore += 18;
  } else if (bmiCategory === "Overweight") {
    alerts.push(
      createAlert({
        level: "medium",
        label: "BMI above target",
        message: "BMI is above the normal range. A gradual weight-loss plan could improve blood pressure and sugar control.",
        color: "amber",
      })
    );
    riskScore += 10;
  } else if (bmiCategory === "Underweight") {
    alerts.push(
      createAlert({
        level: "medium",
        label: "BMI below target",
        message: "BMI is below the healthy range. Consider checking nutrition intake and discussing unexplained weight loss with a clinician.",
        color: "cyan",
      })
    );
    riskScore += 8;
  }

  if (sugarCategory === "Very high" || sugarCategory === "High") {
    alerts.push(
      createAlert({
        level: sugarCategory === "Very high" ? "high" : "medium",
        label: "Blood sugar risk",
        message: "Your glucose reading is elevated. Prioritize medication adherence, balanced meals, hydration, and clinician review if this persists.",
        color: sugarCategory === "Very high" ? "rose" : "amber",
      })
    );
    riskScore += sugarCategory === "Very high" ? 22 : 14;
  } else if (sugarCategory === "Low") {
    alerts.push(
      createAlert({
        level: "medium",
        label: "Low blood sugar risk",
        message: "Your glucose appears low. Recheck the reading and follow your clinician's low-sugar protocol if you have one.",
        color: "yellow",
      })
    );
    riskScore += 10;
  }

  if (latest.sleep_hours < 6) {
    alerts.push(
      createAlert({
        level: "low",
        label: "Recovery warning",
        message: "Sleep duration is below the recommended target. Poor recovery can worsen BP, appetite, and energy regulation.",
        color: "slate",
      })
    );
    riskScore += 6;
  }

  const normalizedRiskScore = Math.min(100, round(riskScore, 0));

  return {
    latest: {
      bmi,
      bmiCategory,
      bloodPressureCategory: bpCategory,
      sugarCategory,
      readingAt: latest.created_at,
    },
    weeklyAverages,
    alerts,
    riskScore: normalizedRiskScore,
    prediction: {
      title:
        normalizedRiskScore >= 70
          ? "High short-term risk of deterioration"
          : normalizedRiskScore >= 40
            ? "Moderate near-term risk"
            : "Low near-term risk",
      confidence: logs.length >= 7 ? "Medium" : "Low",
      summary:
        normalizedRiskScore >= 70
          ? "Current readings suggest a high probability of continued BP or glucose instability without intervention."
          : normalizedRiskScore >= 40
            ? "Your data suggests manageable but meaningful cardio-metabolic risk if current habits continue."
            : "Recent data indicates relatively stable health signals. Keep tracking for stronger predictions.",
    },
  };
}

module.exports = {
  average,
  buildRiskAssessment,
  calculateBmi,
  getBmiCategory,
  getBloodPressureCategory,
  getSugarCategory,
};
