# Retain — Personal Expense & Budget Manager

A full-stack web application for recording personal expenses, tracking monthly
budgets, and gaining insight into your spending. Retain lets you create, view,
update, and delete expenses, filter and search them in powerful ways, set a
monthly budget with live progress feedback, and view rich summaries of your
spending. Administrators get a dedicated dashboard for managing expense
categories and viewing platform-wide insights.

Built as a summative project. Frontend is **React + TypeScript + Vite**; the
backend is a **Node.js + Express REST API written in TypeScript** with
**MongoDB** for persistence, and the frontend currently runs against a mock
data layer that will be swapped for real API calls.

## Video Demo

**Live demo video:** `https://your-video-demo-link-here`

> Update this field with the URL of your recorded walkthrough before submission.

## Technologies Used

### Frontend (`app/`)
- **React 19** with **TypeScript** (strict mode, `verbatimModuleSyntax`)
- **Vite** — build tool and dev server
- **Material-UI (MUI)** — component library and responsive layout
- **React Router v7** — routing and protected routes
- **Redux Toolkit + React Redux** — search, filtering, and sorting state
- **Axios** — HTTP client (used when the real API is wired up)
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

### 1. Frontend (requires nothing else — uses mock data)

```powershell
cd app
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

Demo accounts (mock auth):
- Admin: `admin@retain.app` / `password`
- User: `demo@retain.app` / `password`

### 2. Backend (optional for now)

```powershell
cd server
npm install
copy .env.example .env     # then fill in MONGO_URI / JWT_SECRET
npm run dev
```

The API runs at http://localhost:5000 — `GET /health` returns `{ "status": "ok" }`.

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

## Feature Highlights

- Create, view, update, and delete expenses (title, amount, category, date,
  payment method, optional notes)
- Search expenses by title/notes; filter by category, payment method, date
  range, and amount range; sort by date, amount, or title; paginated results
- Monthly budget: set/update a budget and see total spent, remaining, and a
  within / approaching / over status
- User dashboard: total spending for the month, remaining budget, highest
  expense, spending by category, and recent expenses
- Admin dashboard: category management (with safe reassignment to a default
  category) and platform insights (user/expense counts, total value, spend per
  category, top/bottom 5 categories, recent expenses and users)
- Authentication via React Context with protected routes and role-based access

## API Overview (planned/backend)

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Create an account | Public |
| POST | `/api/auth/login` | Log in, returns a JWT | Public |
| GET/POST/PATCH/DELETE | `/api/expenses` | Expense CRUD + filtering | Authenticated |
| GET/PUT | `/api/budgets/:month` | Read/update monthly budget | Authenticated |
| GET | `/api/categories` | List categories | Authenticated |
| POST/PATCH/DELETE | `/api/categories/:id` | Manage categories | Admin |
| GET | `/api/dashboard?month=` | User spending summary | Authenticated |
| GET | `/api/admin/insights` | Platform insights | Admin |

## Contributing / Ownership

Individual summative project. Not open for external contributions.