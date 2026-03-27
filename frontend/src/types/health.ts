export interface HealthLog {
  id: string;
  weight: number;
  height_cm: number;
  systolic_bp: number;
  diastolic_bp: number;
  sugar_level: number;
  sleep_hours: number;
  created_at: string;
}

export interface UserProfile {
  user_id: string;
  age: number | null;
  gender: string | null;
  weight: number | null;
  height_cm: number | null;
  location: string | null;
  primary_goal: string | null;
  chronic_conditions: string[];
  allergies: string[];
  medications: string[];
  updated_at: string;
  bmi: number | null;
  bmiCategory: string;
}

export interface RiskAlert {
  level: "low" | "medium" | "high" | "critical";
  label: string;
  message: string;
  color: string;
}

export interface RiskAssessment {
  latest: {
    bmi: number | null;
    bmiCategory: string;
    bloodPressureCategory: string;
    sugarCategory: string;
    readingAt: string;
  } | null;
  weeklyAverages: {
    weight: number;
    systolicBp: number;
    diastolicBp: number;
    sugarLevel: number;
    sleepHours: number;
  } | null;
  alerts: RiskAlert[];
  riskScore: number;
  prediction: {
    title: string;
    confidence: string;
    summary: string;
  };
}

export interface WeeklyReport {
  title: string;
  generatedAt: string;
  overview: string;
  insights: string[];
  personalizedSuggestions: string[];
  preventiveTips: string[];
}

export interface MedicationReminder {
  id: string;
  medication_name: string;
  dosage: string;
  schedule_time: string;
  frequency: string;
  instructions: string | null;
  active: boolean;
  last_sent_at: string | null;
  created_at: string;
}

export interface ReminderNotification {
  id: string;
  reminder_id: string;
  title: string;
  message: string;
  due_at: string;
  sent_at: string | null;
  read_at: string | null;
  status: "pending" | "sent" | "read";
}

export interface DoctorRecommendation {
  id: string;
  name: string;
  specialization: string;
  location: string;
  conditions: string[];
  experience_years: number;
  rating: number;
  contact_phone: string | null;
  hospital: string | null;
}

export interface DashboardResponse {
  profile: UserProfile | null;
  logs: HealthLog[];
  riskAssessment: RiskAssessment;
  weeklyReport: WeeklyReport;
  reminders: MedicationReminder[];
  notifications: ReminderNotification[];
  doctorRecommendations: DoctorRecommendation[];
}

export interface AssistantMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
  metadata?: Record<string, unknown>;
}
