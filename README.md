# Retain — Personal Expense & Budget Manager

A full-stack web application for recording personal expenses, tracking monthly
budgets, and gaining insight into your spending. Retain lets you create, view,
update, and delete expenses, filter and search them in powerful ways, set a
monthly budget with live progress feedback, and view rich summaries of your
spending. Administrators get a dedicated dashboard for managing expense
categories and viewing platform-wide insights.

Built as a summative project. Frontend is **React + TypeScript + Vite**; the
backend is a **Node.js + Express REST API written in TypeScript** with
**MongoDB** for persistence. The frontend talks to the backend API for all
data (auth, expenses, budgets, categories, dashboards).

## Live Application

- **Frontend (Vercel):** https://summative-project-retain-app.vercel.app
- **Backend API (Railway):** https://summative-project-retain-app-production.up.railway.app
  — health check at `/api/health`

Sign in with the seeded demo accounts below, or create a new account.

## Video Demo

**Live demo video:** `https://your-video-demo-link-here`

> Update this field with the URL of your recorded walkthrough before submission.

## Technologies Used

### Frontend (`app/`)
- **React 19** with **TypeScript** (`verbatimModuleSyntax`)
- **Vite** — build tool and dev server
- **Material-UI (MUI)** — component library and responsive layout
- **React Router v7** — routing and protected routes
- **Redux Toolkit + React Redux** — search, filtering, and sorting state
- **Axios** — HTTP client for the backend API
- **React Context** — authentication (sign up / sign in / sign out, user roles)

### Backend (`server/`)
- **Node.js + Express** written in **TypeScript**
- **Mongoose** — MongoDB ODM (models: User, Category, Expense, Budget)
- **JWT** authentication and role-based authorization
- **Helmet / CORS / Morgan** — security and request logging

### Database
- **MongoDB (MongoDB Atlas)**

## Project Structure

```
retain-app/
├─ app/        → React + TypeScript + Vite frontend
└─ server/     → Express + TypeScript REST API
```

## Getting Started

### Prerequisites
- Node.js 20+ and npm
- (Backend only) a MongoDB Atlas connection string — see `server/.env.example`

### 1. Backend (required)

```powershell
cd server
npm install
copy .env.example .env     # then fill in MONGO_URI / JWT_SECRET
npm run dev
```

The API runs at http://localhost:5000 — `GET /health` returns `{ "status": "ok" }`.

### 2. Frontend (requires the backend + database)

```powershell
cd app
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

Set `VITE_API_URL` in `app/.env` if the API is not on `http://localhost:5000/api`
(see `app/.env.example`).

Seeded demo accounts:
- Admin: `admin@retain.app` / `password`
- User: `demo@retain.app` / `password`

## Scripts

### Frontend
| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc -b`) and build for production |
| `npm run lint` | Run oxlint |

### Backend
| Command | Purpose |
| --- | --- |
| `npm run dev` | Run with `tsx watch` (auto-restart) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run the compiled server |
| `npm run typecheck` | Type-check without emitting |
| `npm test` | Run the node test suite |

## Deployment

The app runs as two deployed services:

| Service | Platform | Notes |
| --- | --- | --- |
| Frontend | Vercel | Root Directory `app`; static Vite build. `/api/*` is rewritten to the Railway API (`app/vercel.json`) so the browser makes same-origin requests |
| API | Railway | Root `server`; `npm run build` then `npm start` |

Environment variables:

| Variable | Where | Purpose |
| --- | --- | --- |
| `MONGO_URI` | Railway | MongoDB Atlas connection string |
| `JWT_SECRET` | Railway | Token signing secret |
| `JWT_EXPIRES_IN` | Railway | Optional token lifetime (default `7d`) |
| `CLIENT_ORIGIN` | Railway | Comma-separated allowed frontend origins (CORS) |
| `VITE_API_URL` | Vercel | API base URL for the browser (set to `/api` to use the rewrite) |

## Feature Highlights

- Create, view, update, and delete expenses (title, amount, category, date,
  payment method, optional notes)
- Search expenses by title/notes; filter by category, payment method, date
  range, and amount range; sort by date, amount, or title; paginated results
- Monthly budget: set/update a budget and see total spent, remaining, and a
  within / approaching / over status
- User dashboard: total spending for the month, remaining budget, highest
  expense, spending by category, and recent expenses
- Analytics page: month picker, 6-month spending trend, spending-by-category
  donut, payment-method breakdown, and top 5 largest expenses
- Admin dashboard: category management (with safe reassignment to a default
  category) and platform insights (user/expense counts, total value, spend per
  category, top/bottom 5 categories, recent expenses and users)
- Authentication via React Context with protected routes and role-based access
- Profile management: view account details and change password / delete account

## API Overview (backend)

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | Create an account | Public |
| POST | `/api/auth/signin` | Log in, returns a JWT | Public |
| PUT | `/api/auth/password` | Change your password | Authenticated |
| DELETE | `/api/auth/account` | Delete account + all its data | Authenticated |
| GET/POST/PUT/DELETE | `/api/expenses` | Expense CRUD + filtering | Authenticated |
| GET/PUT | `/api/budgets/:month` | Read/update monthly budget | Authenticated |
| GET | `/api/categories` | List categories | Authenticated |
| POST/PUT/DELETE | `/api/categories/:id` | Manage categories | Admin |
| GET | `/api/dashboard?month=YYYY-MM` | User spending summary | Authenticated |
| GET | `/api/admin/insights` | Platform insights | Admin |

## Contributing / Ownership

Individual summative project. Not open for external contributions.