# CarePath

CarePath is a production-oriented healthcare SaaS application for personal health tracking, AI-guided support, disease understanding, doctor discovery, clinician collaboration, and role-based operations.

This project is built to feel like a real product, not a demo page collection. It includes a premium landing page, a role-aware authenticated dashboard shell, patient health workflows, clinician tools, and admin controls.

## Product Highlights

- Disease encyclopedia with structured symptoms, causes, treatments, prevention, and detail pages
- User authentication with JWT sessions and Google sign-in support
- Patient dashboard with BMI, blood pressure, sugar, sleep, risk scoring, charts, weekly insights, and PDF export
- AI assistant with local Ollama support or API-based LLM fallback
- Doctor recommendations based on health context and location
- Medication reminders with notification feed
- Doctor dashboard for assigned patient review and clinical notes
- Admin dashboard for platform analytics, assignments, and operations
- Dedicated settings page for account details, password management, theme, and preferences
- Light and dark theme support with a centralized design system
- Premium landing page with motion, section navigation, and SaaS-style product storytelling

## Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Framer Motion
- Recharts
- Axios
- jsPDF

### Backend

- Node.js
- Express
- PostgreSQL
- pg
- JWT
- bcrypt
- Nodemailer

## Project Structure

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
|   |-- .env.example
|   `-- tailwind.config.js
`-- README.md
```

## Role-Based Experience

### Patient

- Left sidebar dashboard navigation
- Health overview
- BMI calculator
- AI assistant
- Doctor recommendations
- Settings

### Doctor

- Left sidebar dashboard navigation
- Assigned patient workspace
- BMI calculator
- AI assistant
- Settings

### Admin

- Left sidebar dashboard navigation
- Admin operations dashboard
- BMI calculator
- AI assistant
- Doctor management
- Settings

## Environment Setup

### Backend `.env`

Copy:

```powershell
cd backend
Copy-Item .env.example .env
```

Expected core variables:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/carepath
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
APP_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173

AI_PROVIDER=ollama
OLLAMA_URL=http://127.0.0.1:11434/api/chat
OLLAMA_MODEL=llama3.1

LLM_API_BASE_URL=
LLM_API_KEY=
LLM_MODEL=gpt-4o-mini
```

### Frontend `.env`

Copy:

```powershell
cd frontend
Copy-Item .env.example .env
```

Expected core variables:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=
```

## Local Development

### 1. Install dependencies

```powershell
cd backend
npm install
cd ../frontend
npm install
```

### 2. Start PostgreSQL

Make sure your `DATABASE_URL` points to a running PostgreSQL database.

### 3. Run the backend

```powershell
cd backend
npm run dev
```

On startup, the backend now:

- runs the schema
- applies compatibility migrations
- seeds disease data
- seeds doctor recommendations
- starts the reminder scheduler

Important:

- If you previously ran CarePath before the `phone` field was added, restart the backend once after pulling latest changes.
- The backend now adds the missing `phone` column automatically with `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.

### 4. Run the frontend

```powershell
cd frontend
npm run dev
```

### 5. Open locally

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`

## Production Notes

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

Use `AI_PROVIDER=api` if you want an external OpenAI-compatible endpoint instead of Ollama.

## Key Functional Areas

### Disease Encyclopedia

- PostgreSQL-backed seeded dataset
- Search and filters
- Detail pages

### Health Tracking

- Profile persistence
- BMI auto-calculation
- BP, sugar, and sleep logging
- Risk scoring
- Weekly report generation
- PDF export

### AI Assistant

- Stored chat history
- Context-aware prompting
- Ollama-compatible by default

### Recommendations and Reminders

- Doctor recommendation engine
- Medication reminders
- Notification feed

### Admin and Clinical Operations

- Clinician notes
- Admin assignment workflows
- Usage analytics

## Scripts

### Frontend

```powershell
npm run lint
npm run build
```

### Backend

```powershell
npm run dev
npm run start
```

## UX Notes

- The public landing page is marketing-only.
- Authenticated users move through a left-sidebar dashboard shell.
- Phone number is edited only in Settings.
- Footer `Get Started` now routes directly to signup instead of a dead anchor path.

## Verification

Verified in this workspace:

- `frontend`: `npm run lint`
- `frontend`: `npm run build`

## Suggested Portfolio Screens

- Landing page hero
- Patient dashboard
- Doctor dashboard
- Admin dashboard
- Settings page

## Commit History So Far

1. `7195895` `feat(db): add healthcare intelligence schema and seed data`
2. `e46217e` `feat(api): add assistant, analytics, reminders, and care workflows`
3. `6b17832` `feat(ui): rebuild patient experience with insights, AI, and dark mode`
4. `c40b092` `feat(ops): upgrade doctor and admin workspaces`
5. `4cbe42b` `chore(seo-docs): add deployment docs and search metadata`
6. `10dd1d9` `feat(ai): add provider-aware assistant service`
7. `19c2ad3` `feat(theme): refine CarePath brand and global dark mode`
8. `ef2b39e` `feat(shell): separate marketing landing and role navigation`
