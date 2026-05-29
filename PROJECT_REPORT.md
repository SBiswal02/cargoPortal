# Project Report: Intergalactic Cargo Portal

## 1. Introduction

Intergalactic Cargo Portal is a full-stack web application developed for managing cargo manifest data in a secure logistics environment. The application supports user registration, login, role-based access control, manifest upload, cargo parsing, and shipment viewing through a React dashboard.

The project focuses on two main user roles: Admin and Standard. Admin users can upload cargo manifest files, while Standard users can only view processed shipment records. The backend applies special cargo-processing rules before saving records to the database.

## 2. Project Objectives

- Build a secure cargo management portal with authentication.
- Assign user roles automatically based on email domain.
- Restrict manifest upload access to Admin users only.
- Parse uploaded manifest files and save valid cargo records.
- Apply Sector-7 weight adjustment rules during import.
- Skip cargo records whose final weight is a prime number.
- Display cargo data differently for Admin and Standard users.
- Provide a clean React-based dashboard for viewing shipments.
- Include focused tests for authentication and parser logic.

## 3. Technology Stack

### Backend

- Node.js
- Express.js
- SQLite
- Sequelize ORM
- JSON Web Tokens (JWT)
- bcryptjs
- multer

### Frontend

- React 18
- Vite
- React Router
- CSS modules/stylesheets

### Testing

- Node.js assert module
- Custom backend test scripts

## 4. System Overview

The application is divided into two major parts:

- `backend/`: Provides REST APIs for authentication, cargo upload, cargo listing, database access, and business-rule processing.
- `frontend/`: Provides the user interface for login, signup, dashboard access, manifest upload, and cargo table display.

The frontend communicates with the backend through HTTP API calls. Authenticated requests include a JWT in the `Authorization` header. Uploaded manifest files are processed server-side, ensuring that critical business rules cannot be bypassed by the client.

## 5. User Roles and Access Control

The system supports two roles:

- Admin
- Standard

Role assignment is handled by the backend during signup. Users cannot choose their own role.

Users with email addresses ending in `@nebula-corp.com` are assigned the Admin role. All other users are assigned the Standard role. For example:

- `commander@nebula-corp.com` becomes Admin.
- `user@example.com` becomes Standard.
- `ops@nebula-corp.com.example` remains Standard because it does not end with the approved domain.

Admin users can upload manifest files. Standard users are blocked from upload attempts with a `403` response and the message `Clearance level inadequate.`

## 6. Functional Requirements

### Authentication

The system allows users to create an account and log in. Passwords are hashed before being stored in the database. After successful signup or login, the backend returns a JWT containing the user identity and role.

### Role-Based Dashboard

After login, users are shown a dashboard based on their role.

Admin users can:

- View cargo records.
- Upload manifest files.
- See weights in kilograms.

Standard users can:

- View cargo records.
- See weights in pounds.
- Access no upload control in the dashboard.

### Manifest Upload

Admin users upload a plain text manifest file using the `manifest` form field. The backend parses the file, applies cargo rules, saves valid records, and returns the number of imported and skipped records.

### Cargo Listing

Authenticated users can view cargo records through the dashboard. The backend returns records ordered by weight in descending order. The frontend also keeps Earth-bound shipments pinned to the bottom of the table.

## 7. Manifest Processing Rules

The parser expects manifest lines in the following format:

```text
[YYYY-MM-DD] || CRG-001 :: 500 >> Mars Base Alpha
```

The processing rules are:

- If the destination contains `Sector-7`, the cargo weight is multiplied by `1.45`.
- The adjusted weight is rounded to the nearest integer.
- If the final weight is a prime number, the record is skipped.
- Non-prime final weights are saved to the cargo table.
- Empty or invalid lines are ignored.

This logic is implemented in `backend/utils/parser.js`.

## 8. Database Design

The project uses SQLite with Sequelize models.

### Users Table

| Field | Type | Description |
| --- | --- | --- |
| id | Integer | Primary key |
| name | String | Optional user name |
| email | String | Unique user email |
| password | String | Hashed password |
| role | Enum | Admin or Standard |
| createdAt | Date | Record creation time |
| updatedAt | Date | Record update time |

### Cargo Table

| Field | Type | Description |
| --- | --- | --- |
| id | Integer | Primary key |
| cargo_code | String | Cargo identifier |
| manifest_date | String | Date from manifest |
| weight_kg | Integer | Final processed weight in kilograms |
| destination | String | Cargo destination |
| created_at | Date | Record creation time |

## 9. API Endpoints

| Endpoint | Method | Access | Description |
| --- | --- | --- | --- |
| `/health` | GET | Public | Checks API health |
| `/signup` | POST | Public | Creates a user and returns JWT |
| `/login` | POST | Public | Authenticates a user and returns JWT |
| `/me` | GET | Authenticated | Returns current token user data |
| `/api/upload` | POST | Admin | Uploads and processes manifest file |
| `/api/cargo` | GET | Authenticated | Returns saved cargo records |

## 10. Frontend Design

The frontend contains:

- An authentication page with login and signup modes.
- A dashboard page showing user role, email, logout action, and cargo records.
- An Admin-only upload panel.
- A cargo table component for displaying records.
- Utility functions for cargo sorting and weight formatting.

The interface changes based on user role. Admin users see weights as `KG`, while Standard users see converted values in `LBS`.

## 11. Security Measures

- Passwords are hashed using bcrypt before storage.
- JWT authentication protects private endpoints.
- Upload access is enforced on the backend using role middleware.
- User role is resolved on the backend and client-supplied role values are ignored.
- Email addresses are normalized before account creation and login.
- Duplicate email registration is blocked.

## 12. Testing

The backend includes focused tests for key business rules.

### Authentication Test

The authentication test verifies:

- Admin role assignment for `@nebula-corp.com` addresses.
- Standard role assignment for non-admin domains.
- Client-supplied role values are ignored.
- Similar-looking domains such as `@nebula-corp.com.example` do not receive Admin access.
- Login returns a valid user role and token.

Command:

```bash
cd backend
npm run test:auth
```

### Parser Test

The parser test verifies:

- Prime final weights are skipped.
- Non-prime weights are saved.
- Sector-7 weights are multiplied by `1.45` and rounded.

Command:

```bash
cd backend
npm run test:parser
```

## 13. Installation and Execution

### Backend

```bash
cd backend
npm install
npm run dev
```

The backend runs at:

```text
http://localhost:3001
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

## 14. Project Structure

```text
backend/
  app.js
  server.js
  config/
  middleware/
  models/
  routes/
  tests/
  uploads/
  utils/

frontend/
  index.html
  src/
    api.js
    App.jsx
    components/
    context/
    pages/
    utils/

manifest.txt
README.md
PROJECT_REPORT.md
```

## 15. Limitations

- The current project uses SQLite, which is suitable for local development but may need replacement with PostgreSQL or MySQL for production deployment.
- Uploaded manifest files are stored locally, so a production version would require file cleanup or cloud storage.
- The test suite focuses on backend auth and parser behavior; broader integration and frontend tests could be added.
- The current role system supports only Admin and Standard roles.

## 16. Future Enhancements

- Add pagination and search for large cargo datasets.
- Add audit logs for manifest uploads.
- Add frontend test coverage.
- Add duplicate cargo detection.
- Add production-ready environment configuration.
- Add upload history for Admin users.
- Add data export to CSV or PDF.

## 17. Conclusion

Intergalactic Cargo Portal successfully implements a secure full-stack cargo manifest management system. It combines JWT authentication, backend-enforced role-based access control, manifest parsing, database persistence, and a role-aware React dashboard.

The project demonstrates practical use of Express, Sequelize, SQLite, React, and Vite while enforcing business-specific cargo rules on the server. The included tests verify the most important authentication and parser behaviors, making the implementation easier to maintain and extend.
