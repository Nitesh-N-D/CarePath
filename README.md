# CarePath

[![Live Demo](https://img.shields.io/badge/Live%20Demo-carepath.app-0F766E?style=for-the-badge)](https://care-path-two.vercel.app)
[![API](https://img.shields.io/badge/API-onrender-0891B2?style=for-the-badge)](https://carepath-xnsd.onrender.com/api)
[![License](https://img.shields.io/badge/License-MIT-111827?style=for-the-badge)](./LICENSE)

CarePath is a production-style healthcare SaaS application built for modern health tracking, AI-guided support, disease understanding, doctor discovery, and role-based care operations.

It combines a premium public landing experience with a role-based authenticated dashboard for patients, doctors, and admins.

## Live Links

- Live app: https://care-path-two.vercel.app
- Live API: https://carepath-xnsd.onrender.com/api

## Highlights

- Premium SaaS landing page with public disease library access
- JWT-based authentication with Google sign-in support
- Role-based dashboards for `user`, `doctor`, and `admin`
- Personal health tracking for BMI, blood pressure, blood sugar, and wellness trends
- AI health assistant with switchable `Ollama` and `OpenAI` providers
- Real-time streaming AI responses
- Risk scoring, weekly summaries, and PDF export
- Doctor recommendation engine and clinician workflow support
- Medication reminders and notification feed
- Public disease encyclopedia with filters and detailed condition pages
- Responsive UI with dark mode and a centralized design system

## Tech Stack

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
- `pg`
- JWT
- bcrypt
- Nodemailer

## Product Areas

### Public Experience

- Premium landing page
- Disease encyclopedia preview section
- Full public disease library
- Public disease detail pages
- Authentication entry points

### Patient Experience

- Sidebar dashboard shell
- Health dashboard and metrics tracking
- BMI calculator
- AI assistant
- Doctor recommendations
- Medication reminders
- Weekly report and PDF export
- Settings and preferences

### Doctor Experience

- Sidebar dashboard shell
- Assigned patient review flow
- Clinical note support
- AI assistant
- BMI calculator
- Settings

### Admin Experience

- Sidebar dashboard shell
- Platform operations dashboard
- User and doctor oversight
- AI assistant
- BMI calculator
- Settings


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
|   |   |   `-- ai/
|   |   `-- utils/
|   |-- .env.example
|   |-- package.json
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
|   |-- package.json
|   `-- tailwind.config.js
|-- LICENSE
`-- README.md
```

## Core Features

### Disease Encyclopedia

- Searchable disease library
- Body-system and category filters
- Detailed pages with symptoms, causes, diagnosis, treatment, prevention, emergency signs, and references

### Health Tracking

- Persistent health profile
- BMI auto-calculation
- Blood pressure and sugar tracking
- Weekly trend visibility
- Risk indicators and insights

### AI Assistant

- Context-aware prompts using user health data
- Switchable AI provider system
- Streaming responses
- Graceful provider fallback support

### Reports and Analytics

- Weekly health summaries
- Charts and trend visualization
- PDF export

### Role-Based Operations

- Patient-facing dashboard
- Doctor workspace
- Admin operations dashboard

## Routes

### Public

- `/`
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/diseases`
- `/diseases/:slug`

### Protected

- `/dashboard`
- `/health`
- `/bmi`
- `/assistant`
- `/doctors`
- `/settings`
- `/doctor`
- `/admin`

## Environment Variables

### Backend

Create `backend/.env` from `backend/.env.example`.

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgres://user:password@host:5432/carepath
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
APP_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,https://carepath.app
MAIL_FROM=CarePath <no-reply@carepath.app>
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=

AI_PROVIDER=ollama

OLLAMA_URL=http://127.0.0.1:11434/api/chat
OLLAMA_MODEL=llama3.1

LLM_API_BASE_URL=
LLM_API_KEY=
LLM_MODEL=gpt-4o-mini
```

### Frontend

Create `frontend/.env` from `frontend/.env.example`.

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=
```

## AI Provider System

CarePath supports both local and cloud LLM providers.

### Ollama

```env
AI_PROVIDER=ollama
OLLAMA_URL=http://127.0.0.1:11434/api/chat
OLLAMA_MODEL=llama3.1
```

### OpenAI-Compatible API

```env
AI_PROVIDER=openai
LLM_API_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=your_api_key
LLM_MODEL=gpt-4o-mini
```

### Provider Behavior

- `AI_PROVIDER` selects the primary provider
- provider switching happens inside the backend AI service layer
- provider fallback is supported when the primary provider fails
- streaming responses are supported for chat UX

## Local Development

### 1. Clone the repository

```powershell
git clone <your-repo-url>
cd CarePath
```

### 2. Install dependencies

```powershell
cd backend
npm install
cd ../frontend
npm install
```

### 3. Configure environment files

```powershell
cd backend
Copy-Item .env.example .env
cd ../frontend
Copy-Item .env.example .env
```

### 4. Start PostgreSQL

Make sure your `DATABASE_URL` points to a running PostgreSQL instance.

### 5. Run the backend

```powershell
cd backend
npm run dev
```

Backend startup initializes the schema, applies compatibility updates, seeds disease data, and starts background reminder logic.

### 6. Run the frontend

```powershell
cd frontend
npm run dev
```

### 7. Open the app

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`

## Production Deployment

### Frontend

Recommended for Vercel:

```env
VITE_API_BASE_URL=https://carepath-xnsd.onrender.com/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Backend

Use a production PostgreSQL database and set:

```env
PORT=5000
NODE_ENV=production
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
APP_URL=https://carepath.app
CORS_ORIGINS=https://carepath.app,http://localhost:5173
MAIL_FROM=CarePath <no-reply@your-domain.com>
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
AI_PROVIDER=ollama
OLLAMA_URL=http://127.0.0.1:11434/api/chat
OLLAMA_MODEL=llama3.1
LLM_API_BASE_URL=
LLM_API_KEY=
LLM_MODEL=gpt-4o-mini
```

Use `AI_PROVIDER=openai` if you want cloud inference instead of local Ollama.

## Available Scripts

### Frontend

```powershell
npm run dev
npm run lint
npm run build
npm run preview
```

### Backend

```powershell
npm run dev
npm run start
```

## Design and UX Notes

- The landing page is public and marketing-focused
- Role-based modules live inside the authenticated dashboard shell
- Dark mode uses a centralized theme system
- Loading skeletons are used instead of blank states
- Disease library and disease detail pages are part of the public product experience

## Verification

Verified in this workspace:

- `frontend`: `npm run lint`
- `frontend`: `npm run build`
- `backend`: app import sanity check

## License

This project includes a [LICENSE](./LICENSE) file. 
