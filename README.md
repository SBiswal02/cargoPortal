# Intergalactic Cargo Portal

Full-stack cargo manifest portal with JWT authentication, role-based access control (Admin / Standard), manifest upload parsing, and a React dashboard.

## Stack

- **Backend:** Node.js, Express, SQLite, Sequelize ORM, JWT, bcrypt, multer
- **Frontend:** React 18, Vite, React Router

## Prerequisites

- Node.js
- npm

## Local Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # optional — defaults work for local dev
npm run dev
```

API runs at `http://localhost:3001`.

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/signup` | POST | — | Register (role auto-assigned) |
| `/login` | POST | — | Login, returns JWT |
| `/api/upload` | POST | Admin | Upload `manifest.txt` |
| `/api/cargo` | GET | Any authenticated user | List cargo records |

**Role provisioning:** emails ending in `@nebula-corp.com` become **Admin**; all others are **Standard**. Users cannot choose a role at signup.

**Upload rules:**
- Only Admins may upload; Standard users receive `403` with `"Clearance level inadequate."`
- Destinations containing `Sector-7` get weight × 1.45, then rounded
- Records whose final weight is a prime number are not saved

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

UI runs at `http://localhost:5173` and proxies API calls to the backend.

### 3. Quick test flow

1. Sign up as `admin@nebula-corp.com` / `password123` → Admin dashboard with **File Upload** and weights in **KG**
2. Upload the root `manifest.txt`
3. Log out, sign up as `user@example.com` → Standard dashboard: no upload control in DOM, weights in **LBS**, Earth shipment pinned to bottom

## Database Schema

```sql
users (
  id INTEGER PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  password TEXT,
  role TEXT CHECK (role IN ('Admin', 'Standard')),
  created_at TEXT,
  updated_at TEXT
)

cargo (
  id INTEGER PRIMARY KEY,
  cargo_code TEXT,
  manifest_date TEXT,
  weight_kg INTEGER,
  destination TEXT,
  created_at TEXT
)
```

## Example API calls

**Admin signup payload:**
```json
{
  "email": "commander@nebula-corp.com",
  "password": "securepass123"
}
```

**Standard user blocked from upload:**
```bash
curl -X POST http://localhost:3001/api/upload \
  -H "Authorization: Bearer <standard-user-token>" \
  -F "manifest=@manifest.txt"
```

Response: `403` — `"Clearance level inadequate."`

## Project structure

```
backend/
├── config/
│   └── db.js
├── models/
│   ├── User.js
│   └── Cargo.js
├── routes/
│   ├── authRoutes.js
│   └── cargoRoutes.js
├── middleware/
│   ├── authMiddleware.js
│   └── roleMiddleware.js
├── utils/
│   └── parser.js
├── uploads/
├── server.js
├── .env
└── cargo.db

frontend/         React dashboard
manifest.txt      Sample cargo manifest
```
