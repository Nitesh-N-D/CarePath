# CarePath

CarePath is a full-stack healthcare SaaS platform built for modern health monitoring, clinical collaboration, and structured medical knowledge delivery.

It combines:

- Personal health tracking
- Disease knowledge search
- Doctor and admin workflows
- JWT authentication
- Google sign-in
- Password reset
- PDF report generation
- Premium SaaS-style UI

## Live Demo

- Frontend: `https://care-path-two.vercel.app`
- Backend: `https://carepath-xnsd.onrender.com`
- API healthcheck: `https://carepath-xnsd.onrender.com/api/healthcheck`

## Highlights

- Premium React + TypeScript frontend with Tailwind CSS
- Responsive product UI for mobile, tablet, laptop, and desktop
- Role-based dashboards for `user`, `doctor`, and `admin`
- Glassmorphism + premium medical UI styling
- Health analytics with Recharts
- PDF export for health reports
- Google OAuth login
- Password reset email flow
- PostgreSQL database with Neon-compatible connection
- Express API with JWT auth, route protection, and validation
- Deployment-ready setup for Vercel + Render + Neon

## Product Modules

### 1. Personal Health Monitoring

Users can log and review:

- Weight
- Height
- Blood pressure
- Sugar level
- Sleep hours

The dashboard includes:

- KPI cards
- Trend charts
- Weekly summaries
- Risk alerts
- PDF report export

### 2. Disease Knowledge

The platform includes a structured disease library with:

- Overview
- Causes
- Symptoms
- Diagnosis
- Treatment
- Prevention
- Emergency signs

### 3. Doctor Workspace

Doctors can:

- View assigned patients
- Review patient summaries
- Add clinical notes

### 4. Admin Workspace

Admins can:

- View users
- Review analytics
- Assign doctors to patients

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Recharts
- Axios
- jsPDF
- jspdf-autotable

### Backend

- Node.js
- Express
- PostgreSQL
- pg
- JWT
- bcrypt
- Nodemailer

### Infrastructure

- Frontend hosting: Vercel
- Backend hosting: Render
- Database: Neon PostgreSQL
- Google OAuth: Google Cloud Console

## Repository Structure

```text
CarePath/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── db/
│   │   └── schema.sql
│   ├── server.js
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   ├── vite.config.ts
│   └── .env.example
└── README.md
```

## Authentication

CarePath supports:

- Email + password signup
- Email + password login
- Google sign-in
- Persistent login using local storage
- JWT-based session handling
- Forgot password
- Reset password
- Protected routes
- Role-based route guards

## Roles

### User

- Track health logs
- View dashboard analytics
- Export PDF reports

### Doctor

- View assigned patients
- Review patient health data
- Add notes

### Admin

- View all users
- Manage doctor assignments
- Review system analytics

## API Routes

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`

### Health

- `GET /api/health`
- `POST /api/health`

### Admin

- `GET /api/admin/users`
- `GET /api/admin/analytics`
- `PUT /api/admin/assign-doctor`

### Doctor

- `GET /api/doctor/patients`

### Diseases

- `GET /api/diseases`
- `GET /api/diseases/search`
- `GET /api/diseases/:slug`

## Database Schema

Main tables:

- `users`
- `health_logs`
- `doctors`
- `patient_assignments`
- `password_resets`
- `diseases`

See the full schema in `backend/db/schema.sql`.

See the full schema in [backend/db/schema.sql](c:/Users/Nitesh/OneDrive/Documents/CarePath/backend/db/schema.sql).

## Local Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd CarePath
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 4. Configure environment variables

Backend:

Copy `backend/.env.example` to `backend/.env`

Frontend:

Copy `frontend/.env.example` to `frontend/.env`

### 5. Run the backend

```bash
cd backend
npm run dev
```

### 6. Run the frontend

```bash
cd frontend
npm run dev
```

Frontend usually runs on:

```text
http://localhost:5173
```

Backend usually runs on:

```text
http://localhost:5000
```

## Environment Variables

### Backend `.env`

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgres://user:password@host:5432/carepath
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
APP_URL=https://care-path-two.vercel.app
CORS_ORIGINS=http://localhost:5173,https://care-path-two.vercel.app
MAIL_FROM=CarePath <no-reply@carepath.app>
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
```

### Frontend `.env`

```env
VITE_API_BASE_URL=https://carepath-xnsd.onrender.com/api
VITE_GOOGLE_CLIENT_ID=
```

## Google OAuth Setup

In Google Cloud Console, use:

### Authorized JavaScript origins

- `https://care-path-two.vercel.app`
- `http://localhost:5173`

### Authorized redirect URIs

- `https://care-path-two.vercel.app`
- `http://localhost:5173`

Then set:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## Production Deployment

### Frontend on Vercel

Set:

```env
VITE_API_BASE_URL=https://carepath-xnsd.onrender.com/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Backend on Render

Set:

```env
PORT=5000
NODE_ENV=production
DATABASE_URL=your_neon_database_url
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
APP_URL=https://care-path-two.vercel.app
CORS_ORIGINS=http://localhost:5173,https://care-path-two.vercel.app
MAIL_FROM=CarePath <no-reply@carepath.app>
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
```

## Build Commands

### Frontend

```bash
npm run lint
npm run build
```

### Backend

```bash
npm run start
```

## Production Notes

- Routes are lazy-loaded for better frontend performance
- PDF dependencies are loaded on demand
- Vite chunking is configured to reduce initial bundle pressure
- The frontend auto-normalizes backend URLs to include `/api`
- The backend supports older user table schemas as a compatibility fallback

## Troubleshooting

### 1. Login returns 404

Make sure:

```env
VITE_API_BASE_URL=https://carepath-xnsd.onrender.com/api
```

If `/api` is missing, auth routes will fail.

### 2. Backend root shows `Route not found: GET /`

After deploying the latest backend, the root URL should show a friendly API status response.

Use:

- `https://carepath-xnsd.onrender.com/`
- `https://carepath-xnsd.onrender.com/api`
- `https://carepath-xnsd.onrender.com/api/healthcheck`

### 3. `column "role" does not exist`

Run this SQL on the production database:

```sql
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

ALTER TABLE users
ADD CONSTRAINT users_role_check
CHECK (role IN ('user', 'doctor', 'admin'));
```

If old doctor users already exist:

```sql
UPDATE users
SET role = 'doctor'
WHERE id IN (
  SELECT user_id FROM doctors
);
```

### 4. Google login is not working

Check:

- `VITE_GOOGLE_CLIENT_ID` is set in Vercel
- Google OAuth origins match your deployed frontend
- backend CORS includes your Vercel domain



## Future Improvements

- AI assistant integration with source-backed responses
- Pandemic timeline and public health analytics
- Medication reminders
- Better doctor note persistence
- File uploads for profile and reports
- Audit logs for admin actions

## License

This project is for educational, portfolio, and product demonstration purposes.

## Author

Built by Nitesh N D 
