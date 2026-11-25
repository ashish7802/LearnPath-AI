# LearnPath AI — Zero-to-Engineer Skill Mastery Platform

LearnPath AI is an open-source, personalized, skill-based engineering learning platform designed to take beginners from true zero to demonstrable, portfolio-backed engineering capability.
 
---

## 🚀 Key Features

- **Three Career Pathways**:
  - **Software Engineer**: Systems, Git, Data Structures, Relational SQL, and REST APIs.
  - **Machine Learning Engineer**: NumPy vectorized arrays, Data Cleaning, Scikit-learn, and Deep Learning with PyTorch.
  - **AI Engineer**: Tokens, High-Dimensional Embeddings, Production RAG with Vector DBs, and ReAct Autonomous Agents.
- **Verifiable Skill Mastery**: Gated prerequisite progression. Checking a box never marks a topic mastered; learners must pass deterministic test cases, code challenges, and conceptual rubrics ($\ge 80\%$).
- **AI Personal Learning Coach**: Multi-lingual guidance in English, Hindi, and Hinglish with real-world analogies, Socratic progressive hints, error diagnosis, and timeout protection.
- **Adaptive Study Planner**: SuperMemo-2 (SM-2) spaced repetition engine calculating daily study blocks (Revision, Lesson, Practice, Projects) with non-punitive rescheduling.
- **Hardened Security Architecture**: Zod runtime schema validation, sliding-window rate limiting on sensitive routes, HttpOnly secure cookies, and isolated code evaluation.
- **Production-Ready Target**: Optimized for Vercel deployment and Supabase PostgreSQL.

---

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons
- **ORM & Database**: Prisma ORM with Supabase PostgreSQL
- **Security & Validation**: Zod, Jose (JWT), BcryptJS
- **Testing**: Node test runner, Playwright E2E automation

---

## ⚙️ Environment Variables

Configure these variables in your `.env` or Vercel Project Settings:

| Variable | Description | Required in Production |
| :--- | :--- | :--- |
| `DATABASE_URL` | Supabase PostgreSQL transaction connection pooler (Port 6543) | Yes |
| `DIRECT_URL` | Supabase PostgreSQL direct connection for Prisma migrations (Port 5432) | Yes |
| `JWT_SECRET` | High-entropy cryptographic key for signing session tokens (min 32 chars) | Yes |
| `AI_COACH_API_KEY` | Google Gemini API Key for live AI Learning Coach reasoning | Optional (Falls back gracefully) |
| `AI_COACH_MODEL` | Target AI Model identifier (default: `gemini-1.5-flash`) | Optional |
| `NEXT_PUBLIC_APP_NAME`| Platform branding display name | Optional |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project API URL (if client SDK is used) | Optional |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anonymous key | Optional |

---

## 📦 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/ashish7802/LearnPath-AI.git
cd LearnPath-AI
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### 3. Database Initialization

```bash
# Push schema or deploy migrations to Supabase
npx prisma db push

# Seed core career paths, tracks, modules, and verified resources
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Demo account credentials:
- **Email**: `learner@learnpath.ai`
- **Password**: `Password123!`

---

## 🧪 Automated Testing

LearnPath AI includes comprehensive automated testing:

```bash
# 1. Validate all curriculum files, prerequisites, and dependency graphs
npm run validate:curriculum

# 2. Run unit and regression test suite
npm run test:unit

# 3. Run security, Zod schema validation, and rate limiter tests
npm run test:security

# 4. Run live HTTP end-to-end tests against the running server
npm run test:e2e:live

# 5. Run full Playwright E2E browser test suite
npx playwright test
```

---

## 🌐 Deploying to Vercel + Supabase

1. Push your repository to GitHub.
2. In the **Supabase Dashboard**:
   - Create a project and note your database password.
   - Under **Project Settings -> Database -> Connection string**:
     - Copy the **Transaction Pooler** connection string (Port 6543 with `?pgbouncer=true`) as `DATABASE_URL`.
     - Copy the **Session / Direct** connection string (Port 5432) as `DIRECT_URL`.
3. In the **Vercel Dashboard**:
   - Import your GitHub repository.
   - Under **Environment Variables**, add:
     - `DATABASE_URL`
     - `DIRECT_URL`
     - `JWT_SECRET` (generate a random 32+ character string)
     - `AI_COACH_API_KEY` (optional)
     - `AI_COACH_MODEL` (e.g. `gemini-1.5-flash`)
   - Click **Deploy**.
4. Run migrations on Supabase:
   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```

---

## 📄 License

MIT
