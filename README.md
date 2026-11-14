# DevSpaceZ

**DevSpaceZ** is an all-in-one collaborative developer workspace platform combining project management (Kanban), real-time documentation, team chat, browser-based WebIDE, AI assistance, and Docker/Git monitoring in a single full-stack TypeScript monorepo.

---

## Key Features

- **Authentication & Role-Based Access Control (RBAC)**
  - Email/Password authentication with OTP verification & password reset, JWT + HttpOnly cookies, and OAuth 2.0 (Google & GitHub via Passport.js).
  - Multi-tenant **Organizations**, **Sub-Teams**, **Workspaces**, and customizable **Roles & Permissions**.
- **Kanban Board & Project Workflows**
  - Interactive drag-and-drop boards, lists, and tasks (`@hello-pangea/dnd`) with checklists, comments, file attachments, task join/review requests, and real-time updates over Socket.io.
- **Browser WebIDE & Collaboration**
  - Integrated **Monaco Editor** with TypeScript Automatic Type Acquisition (`@typescript/ata`), **WebContainers** in-browser runtime, **xterm.js** terminal, and real-time collaborative coding via **Yjs** (`y-websocket`).
  - Optional Docker-backed Language Server Protocol (LSP) & container monitoring via `dockerode`.
- **Real-Time Collaborative Docs**
  - Rich-text editor built on **Tiptap + Yjs**, supporting `.docx` import/export, document translation, and PDF export.
- **Team Chat, Notifications & Global Search**
  - Real-time team messaging with file uploads, notifications, and a global command palette.
- **AI Assistant & Analytics**
  - **Google Gemini** integration for AI-assisted workflows and task generation.
  - Project & team analytics dashboards (`recharts`) and GitHub webhook statistics processed asynchronously with **Redis + BullMQ**.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Zustand, TanStack React Query, React Router v7, Monaco Editor, WebContainers API, xterm.js, Tiptap, Yjs, Recharts, Framer Motion |
| **Backend** | Node.js, Express 5, TypeScript, MongoDB (Mongoose), Redis, BullMQ, Socket.io, `y-websocket`, Passport.js, Zod, Multer, Dockerode, Google Generative AI, Winston |
| **Testing & Quality** | Vitest, React Testing Library, ESLint, Husky, lint-staged |
| **DevOps & Deploy** | Docker, Docker Compose, Nginx, GitHub Actions CI/CD, Vercel (Frontend), Render (Backend) |

---

## Project Structure

```text
DevSpaceZ/
├── backend/                # Express 5 + TypeScript API, WebSockets (Socket.io, Yjs, LSP), BullMQ workers
│   ├── src/
│   │   ├── config/         # MongoDB connection
│   │   ├── controllers/    # Route handlers (auth, boards, ide, docs, chat, ai, docker, git, ...)
│   │   ├── middlewares/    # Auth, RBAC, upload, validation, error handling
│   │   ├── models/         # Mongoose schemas
│   │   ├── queues/         # BullMQ queues (email, git)
│   │   ├── routes/         # REST API routes (/api/v1/*)
│   │   ├── scripts/        # Database migration scripts
│   │   ├── services/       # Business logic & Redis caching
│   │   ├── utils/          # Socket.io, Yjs, LSP, JWT, logger, Passport
│   │   └── workers/        # Background workers (email, git stats)
│   └── Dockerfile
├── frontend/               # React 19 + Vite + TypeScript SPA
│   ├── src/
│   │   ├── entities/       # Zustand stores (auth, organization, user profile)
│   │   ├── features/       # Feature modules (auth, board, ide, document, chat, ai, organization, ...)
│   │   ├── layouts/        # Dashboard & Settings layouts
│   │   ├── pages/          # Route pages
│   │   ├── shared/         # Axios client, hooks, UI components, utilities
│   │   └── tests/          # Vitest unit tests
│   ├── nginx.conf
│   └── Dockerfile
├── shared/                 # Shared TypeScript types between frontend and backend
├── docs/                   # Setup documentation (e.g., GitHub webhook setup)
├── docker-compose.yml      # Multi-container setup (MongoDB, Redis, Backend, Frontend)
└── .github/workflows/      # CI/CD pipeline (build & docker-compose verification)
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 20
- **MongoDB** (local or MongoDB Atlas)
- **Redis** (required for caching and BullMQ background workers)
- **Docker & Docker Compose** (optional, for containerized setup)

### 1. Run Locally (Development)

#### Backend

```bash
cd backend
npm install
```

Create `backend/.env` with your configuration:

```env
NODE_ENV=development
PORT=5001
MONGO_URI=mongodb://localhost:27017/devspace
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:5173

JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret

# Optional integrations
GEMINI_API_KEY=your_gemini_api_key
RESEND_API_KEY=your_resend_api_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
GITHUB_WEBHOOK_SECRET=your_webhook_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/v1/auth/google/callback
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5001/api/v1/auth/github/callback
```

Start the backend dev server:

```bash
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies `/api`, `/uploads`, and `/yjs` requests to the backend (`http://localhost:5001`).

---

### 2. Run with Docker Compose

From the project root:

```bash
docker-compose up --build
```

Services exposed:
- **Frontend (Nginx):** `http://localhost:80`
- **Backend API & WebSockets:** `http://localhost:5001`
- **MongoDB:** `localhost:27017`
- **Redis:** `localhost:6379`

---

## Scripts & Verification

### Frontend (`cd frontend`)
- `npm run dev` — Start Vite development server
- `npm run build` — Build production bundle (`dist/`)
- `npm run lint` — Run ESLint
- `npm run test` — Run Vitest unit tests

### Backend (`cd backend`)
- `npm run dev` — Start backend with `tsx watch`
- `npm run build` — Compile TypeScript & resolve path aliases (`tsc && tsc-alias`)
- `npm run start` — Run compiled server (`dist/backend/src/server.js`)
