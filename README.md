# IntergalacticCargoPortal - Biswal

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

The signup endpoint ignores any client-supplied `role` field. Role assignment is made only by the backend from the normalized email address.

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

The login/signup screen is served at `/`. After authentication the frontend routes users by
role:

- **Admin:** `/admin/dashboard`
- **Standard:** `/dashboard`

Admins see the manifest **File Upload** control plus the cargo table. Standard users see only
the cargo table; the upload input/button are not rendered for them.

### 3. Quick test flow

1. Sign up as `admin@nebula-corp.com` / `password123` → Admin dashboard with **File Upload** and weights in **KG**
2. Upload the root `manifest.txt`
3. Log out, sign up as `user@example.com` → Standard dashboard: no upload control in DOM, weights in **LBS**, Earth shipments pinned to the top

Cargo rows are sorted by weight from heaviest to lightest. The display keeps the source order
rule consistent for both roles: Admins see stored KG, Standard users see `KG × 2.20462` rounded
to LBS, and any cargo destined for Earth is pinned above every non-Earth destination regardless
of weight.

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

## Task 2: Upload & Cargo API

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/upload` | POST | Admin only | Upload `manifest.txt` (field name: `manifest`) |
| `/api/cargo` | GET | Any authenticated user | List all saved cargo records |

**Processing rules** (`utils/parser.js`):
- Destination contains `Sector-7` → weight × 1.45, then round to nearest integer
- If final weight is prime → record is **not** saved

**Standard user blocked from upload (403):**
```bash
curl -X POST http://localhost:3001/api/upload \
  -H "Authorization: Bearer <standard-user-jwt-token>" \
  -F "manifest=@manifest.txt"
```

Response: `403` — `"Clearance level inadequate."`

**Admin upload:**
```bash
curl -X POST http://localhost:3001/api/upload \
  -H "Authorization: Bearer <admin-user-jwt-token>" \
  -F "manifest=@manifest.txt"
```

**Fetch cargo:**
```bash
curl http://localhost:3001/api/cargo \
  -H "Authorization: Bearer <jwt-token>"
```

**Run parser tests:**
```bash
cd backend && npm run test:parser
```

**Run foundation auth tests:**
```bash
cd backend && npm run test:auth
```

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
