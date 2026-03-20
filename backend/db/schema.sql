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
CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX IF NOT EXISTS idx_diseases_slug ON diseases(slug);
CREATE INDEX IF NOT EXISTS idx_diseases_body_system ON diseases(body_system);
CREATE INDEX IF NOT EXISTS idx_diseases_category ON diseases(category);
