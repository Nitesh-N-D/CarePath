# CarePath

CarePath is a production-oriented healthcare SaaS platform for disease education, personal health tracking, AI-guided support, clinical collaboration, and admin operations.

The current build includes:

- Structured disease encyclopedia with search and filters
- JWT auth, Google sign-in, forgot/reset password flows
- Persistent user profile storage for age, gender, weight, height, location, medications, and conditions
- Health tracking for BP, sugar, BMI, sleep, and weekly trend analytics
- AI assistant with local Ollama support or API-based LLM fallback
- Weekly health report generation and PDF export
- Doctor recommendation engine
- Medication reminders with scheduler-backed notifications
- Doctor dashboard with patient risk visibility and clinical notes
- Admin dashboard for user oversight, assignments, reminder totals, and AI usage totals
- Responsive premium dashboard UI with dark mode toggle

## Stack

Frontend:

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Recharts
- Axios
- jsPDF

Backend:

- Node.js
- Express
- PostgreSQL
- pg
- JWT
- bcrypt
- Nodemailer

## Folder Structure

```text
CarePath/
|-- backend/
|   |-- data/
|   |-- db/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middleware/
|   |   |-- routes/
|   |   |-- services/
|   |   `-- utils/
|   |-- .env.example
|   `-- server.js
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |-- context/
|   |   |-- pages/
|   |   |-- services/
|   |   `-- types/
|   `-- .env.example
`-- README.md
```

## Key Product Modules

### Disease Encyclopedia

- Static disease dataset seeded into PostgreSQL on startup
- Structured records with symptoms, causes, diagnosis, treatment, prevention, emergency signs, and sources
- Search by query plus body-system and category filters
- Detail pages with clean cards and references

### Patient Workspace

- Persistent profile and health logs
- BMI auto-calculation and category labeling
- Risk alerts for blood pressure, glucose, BMI, and sleep
- Weekly insights engine and exportable PDF report
- Reminder management and in-app notification feed

### AI Assistant

- `/api/assistant/chat` route
- Health-context prompt built from profile, risk score, weekly report, and disease context
- Configurable local Ollama support via `AI_PROVIDER=ollama`
- Configurable OpenAI-compatible endpoint support via `AI_PROVIDER=api`
- Stored chat history per user

### Doctor Workspace

- Assigned patient list
- Latest health snapshot and risk score visibility
- Clinical note persistence

### Admin Workspace

- User oversight
- Doctor assignment workflow
- Total users, doctors, assignments, health logs, reminders, and AI message analytics

## Local Development

### 1. Install dependencies

```powershell
cd backend
npm install
cd ../frontend
npm install
```

### 2. Configure environment files

Backend:

```powershell
Copy-Item .env.example .env
```

Frontend:

```powershell
Copy-Item .env.example .env
```

### 3. Start PostgreSQL

Point `DATABASE_URL` in `backend/.env` at a reachable PostgreSQL database.

### 4. Start the backend

```powershell
cd backend
npm run dev
```

The backend boot process now:

- runs the database schema
- seeds diseases
- seeds doctor recommendations
- starts the medication reminder scheduler

### 5. Start the frontend

```powershell
cd frontend
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`

## Production Deployment

### Frontend

Set:

```env
VITE_API_BASE_URL=https://your-api-domain/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Backend

Set:

```env
PORT=5000
NODE_ENV=production
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
APP_URL=https://your-frontend-domain
CORS_ORIGINS=https://your-frontend-domain,http://localhost:5173
AI_PROVIDER=ollama
OLLAMA_URL=http://127.0.0.1:11434/api/chat
OLLAMA_MODEL=llama3.1
LLM_API_BASE_URL=
LLM_API_KEY=
LLM_MODEL=gpt-4o-mini
```

Use `AI_PROVIDER=api` when pointing at an external OpenAI-compatible model endpoint.

## Scripts

Frontend:

```powershell
npm run lint
npm run build
```

Backend:

```powershell
npm run dev
npm run start
```

## Recommended Commit Sequence

1. `feat(db): add profile, reminders, assistant, doctor directory, and clinical note schema`
2. `feat(api): add dashboard analytics, assistant chat, recommendations, reminders, and seeded startup`
3. `feat(ui): rebuild patient dashboard with AI, reports, reminders, and premium analytics`
4. `feat(clinician): upgrade doctor and admin workspaces with live operational data`
5. `chore(seo-docs): add metadata, sitemap, robots, env examples, and deployment docs`

## Verification

Verified in this workspace:

- `frontend`: `npm run lint`
- `frontend`: `npm run build`
- `backend`: app import and route boot sanity check via `node`

## Notes

- The frontend is Vite-based rather than full Next.js. The product requirements were implemented in the existing architecture so the platform is shippable without a risky framework migration in the same pass.
- Screenshots were not generated from the CLI session. Capture the home page, patient dashboard, doctor dashboard, and admin dashboard after running locally for portfolio presentation.
