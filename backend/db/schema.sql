CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'doctor', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  weight NUMERIC(6,2) NOT NULL,
  height_cm NUMERIC(5,2) NOT NULL DEFAULT 170,
  systolic_bp NUMERIC(5,2) NOT NULL,
  diastolic_bp NUMERIC(5,2) NOT NULL,
  sugar_level NUMERIC(6,2) NOT NULL,
  sleep_hours NUMERIC(4,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  age INTEGER CHECK (age BETWEEN 1 AND 120),
  gender TEXT,
  phone TEXT,
  weight NUMERIC(6,2),
  height_cm NUMERIC(5,2),
  location TEXT,
  primary_goal TEXT,
  chronic_conditions TEXT[] NOT NULL DEFAULT '{}',
  allergies TEXT[] NOT NULL DEFAULT '{}',
  medications TEXT[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS patient_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (doctor_id, user_id)
);

CREATE TABLE IF NOT EXISTS password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS clinical_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medication_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  schedule_time TIME NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'daily',
  instructions TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reminder_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_id UUID NOT NULL REFERENCES medication_reminders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  due_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'read'))
);

CREATE TABLE IF NOT EXISTS ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS doctor_directory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  location TEXT NOT NULL,
  conditions TEXT[] NOT NULL DEFAULT '{}',
  experience_years INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(3,2) NOT NULL DEFAULT 4.5,
  available BOOLEAN NOT NULL DEFAULT TRUE,
  contact_phone TEXT,
  hospital TEXT,
  UNIQUE (name, location, hospital)
);

CREATE TABLE IF NOT EXISTS diseases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  body_system TEXT NOT NULL,
  category TEXT NOT NULL,
  symptoms TEXT[] NOT NULL DEFAULT '{}',
  causes TEXT NOT NULL,
  diagnosis TEXT NOT NULL,
  treatment TEXT NOT NULL,
  prevention TEXT NOT NULL,
  emergency_signs TEXT[] NOT NULL DEFAULT '{}',
  sources TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_health_logs_user_id ON health_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_health_logs_created_at ON health_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_location ON user_profiles(location);
CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_patient_user_id ON clinical_notes(patient_user_id);
CREATE INDEX IF NOT EXISTS idx_medication_reminders_user_id ON medication_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminder_notifications_user_id ON reminder_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_user_id ON ai_chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_doctor_directory_location ON doctor_directory(location);
CREATE INDEX IF NOT EXISTS idx_diseases_slug ON diseases(slug);
CREATE INDEX IF NOT EXISTS idx_diseases_body_system ON diseases(body_system);
CREATE INDEX IF NOT EXISTS idx_diseases_category ON diseases(category);
