# 🎓 ARAK Admin Dashboard

> **Educational Management System**  
> A comprehensive Learning Management System (LMS) with Role-Based Access Control (RBAC), relational data integrity, and real-time grade management.

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![.NET](https://img.shields.io/badge/.NET-9.0-512BD4?style=flat-square&logo=dotnet)](https://dotnet.microsoft.com/)
[![SQL Server](https://img.shields.io/badge/SQL_Server-2019+-CC2927?style=flat-square&logo=microsoft-sql-server)](https://www.microsoft.com/en-us/sql-server)
[![Status](https://img.shields.io/badge/Status-Production_Ready-green?style=flat-square)]()

---

## 📑 Table of Contents

- [🚀 Quick Start](#-quick-start)
- [✨ Key Features](#-key-features)
- [🛠️ Technology Stack](#%EF%B8%8F-technology-stack)
- [📐 Architecture](#-architecture)
- [🔐 Roles & Permissions](#-roles--permissions)
- [📦 Installation](#-installation)
- [🔧 Configuration](#-configuration)
- [📡 API Endpoints](#-api-endpoints)
- [🗄️ Database](#%EF%B8%8F-database)
- [🧪 Testing](#-testing)
- [📁 Project Structure](#-project-structure)
- [⚠️ Known Issues](#%EF%B8%8F-known-issues)
- [🤝 Contributing](#-contributing)
- [📝 License](#-license)
- [👥 Team](#-team)

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **.NET 9 SDK**
- **SQL Server** 2019+ (Express, Developer, or Standard)
- **Git**
- **EF Core CLI Tool** - Install via: `dotnet tool install --global dotnet-ef`

### 1-Minute Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd arak-admin-dashboard

# 2. Install frontend dependencies
npm install

# 3. Configure database (edit arak-backend/Arak.PLL/appsettings.json)
# Update the ConnectionStrings.DefaultConnection with your SQL Server credentials

# 4. Apply database migrations
cd arak-backend
dotnet ef database update --project Arak.DAL --startup-project Arak.PLL

# 5. Start the backend (runs on port 5000)
cd Arak.PLL
dotnet run

# 6. In a new terminal, start the frontend (runs on port 5173)
cd ../../
npm run dev
```

**Access the application:**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Swagger UI**: http://localhost:5000/swagger

### 🔑 Default Login Credentials

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Super Admin** | `admin@arak.com` | `Admin@123` | Full access to all modules |
| **Academic Admin** | `academic@arak.com` | `Academic@123` | Grades, schedules, tasks |
| **Teacher** | `teacher1@arak.com` | `Teacher@123` | Own classes only |
| **Parent** | `parent1@arak.com` | `Parent@123` | View children's data |

> ⚠️ **Change these passwords in production!** Set via environment variable: `ARAK_DEFAULT_PASSWORD`

---

## ✨ Key Features

### 🔐 Role-Based Access Control (RBAC)
- **7 distinct roles** with granular permission boundaries
- **Frontend guards** (React route protection)
- **Backend enforcement** (JWT + `[Authorize]` attributes)
- **Super Admin bypass** for unrestricted access

### 📊 Comprehensive Modules
- **Dashboard**: Role-specific KPIs, charts, and quick actions
- **Student Management**: CRUD with search, filter, pagination
- **Teacher Management**: Profiles with class assignments
- **Schedule System**: Weekly timetable with conflict detection
- **Gradebook Monitor**: Student performance analytics
- **Control Sheets**: Bulk Excel grade upload (Egyptian grading system)
- **Task Monitor**: Homework tracking and completion analytics
- **Event Manager**: School-wide calendar
- **User Management**: Admin account creation and role assignment
- **Fees Management**: Financial records and payment tracking

### 🛡️ Data Integrity
- **Orphan Prevention**: Cascade deletes disabled globally
- **Dependency Checks**: Cannot delete records with active references
- **Atomic Operations**: Schedule creation auto-syncs teacher assignments
- **Grade Locking**: Prevents modifications to locked class grades

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **Vite 5** | Build tool & dev server |
| **React Router v7** | Client-side routing |
| **Tailwind CSS** | Utility-first styling |
| **Recharts** | Data visualization |
| **Lucide React** | Icon library |
| **Axios** | HTTP client with JWT interceptor |
| **Context API** | State management (Auth, Toast, Refresh) |
| **React Hook Form** | Form handling |
| **xlsx (SheetJS)** | Excel parsing |

### Backend (.NET Clean Architecture)
| Project | Purpose |
|---------|---------|
| **Arak.DAL** | Data Access Layer (EF Core, Models, Migrations, Repositories) |
| **Arak.BLL** | Business Logic Layer (DTOs, Services, Interfaces) |
| **Arak.PLL** | Presentation Layer (Controllers, JWT Auth, Middleware) |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| **ASP.NET Core 9** | Web API framework |
| **Entity Framework Core** | ORM |
| **SQL Server** | Relational database |
| **ASP.NET Core Identity** | User management & password hashing |
| **JWT Bearer** | Authentication (24h token expiry) |

---

## 📐 Architecture

### System Architecture

```
┌─────────────────────────────────────────────┐
│            React Frontend (Vite)            │
│  Port: 5173  │  JWT: localStorage/session  │
├─────────────────────────────────────────────┤
│         Axios Service Layer (API)           │
│  Base URL: http://localhost:5000/api        │
├─────────────────────────────────────────────┤
│         ASP.NET Core Backend (.NET 9)       │
│  Port: 5000  │  JWT: 24h expiry            │
├─────────────────────────────────────────────┤
│         SQL Server Database (ArakDB)        │
│  EF Core  │  Identity  │  Migrations        │
└─────────────────────────────────────────────┘
```

### Data Flow

1. **User logs in** → `POST /api/auth/login`
2. **Backend validates** → Returns JWT token + user object
3. **Frontend stores token** → `localStorage` (Remember Me) or `sessionStorage`
4. **Axios interceptor** → Attaches `Authorization: Bearer <token>` to every request
5. **ProtectedRoute** → Checks user role against required permission
6. **API request** → Backend validates JWT and enforces `[Authorize]`
7. **Response** → Returns data in standardized format

---

## 🔐 Roles & Permissions

### Role Hierarchy

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **Super Admin** | Full system access | All modules, all operations |
| **Admin** | School administrator | Students, teachers, classes, fees, reports |
| **Academic Admin** | Academic coordinator | Grades, schedules, tasks, events |
| **Fees Admin** | Financial officer | Fees module, reports |
| **Users Admin** | User management | Students, teachers, parents CRUD |
| **Teacher** | Teaching staff | Own classes, grade upload, tasks |
| **Parent** | Parent/Guardian | View children's grades, schedule, fees |

### Permission Matrix

| Module | Super Admin | Admin | Academic Admin | Fees Admin | Users Admin | Teacher | Parent |
|--------|:-----------:|:-----:|:--------------:|:----------:|:-----------:|:-------:|:------:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Students | ✅ (CRUD) | ✅ (CRUD) | ✅ (C/E) | 👁️ View | ✅ (CRUD) | ❌ | ❌ |
| Teachers | ✅ (CRUD) | ✅ (CRUD) | ✅ (C/E) | ❌ | ✅ (CRUD) | ❌ | ❌ |
| Schedule | ✅ | ✅ | ✅ | ❌ | ❌ | 👁️ Own | ❌ |
| Gradebook | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ Own | ✅ Children |
| Control Sheets | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Tasks | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ Own | ❌ |
| Events | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Fees | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | 👁️ Children |
| User Management | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Reports | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

> **Legend**: ✅ Full Access | ✅ (C/E) Create/Edit only | 👁️ Read-Only | ❌ No Access

---

## 📦 Installation

### Step 1: Clone Repository

```bash
# Clone repository
git clone <repository-url>
cd arak-admin-dashboard
```

### Step 2: Install Frontend Dependencies

```bash
npm install
```

### Step 3: Install EF Core CLI Tool

```bash
dotnet tool install --global dotnet-ef
```

### Step 4: Configure Backend Database

Edit `arak-backend/Arak.PLL/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=ArakDB;Integrated Security=True;TrustServerCertificate=True;"
  }
}
```

**SQL Server Connection String Options:**
- **Local SQL Server**: `Server=.;Database=ArakDB;Integrated Security=True;TrustServerCertificate=True;`
- **SQL Server Express**: `Server=.\SQLEXPRESS;Database=ArakDB;...`
- **Named Instance**: `Server=YOUR_PC_NAME\SQLEXPRESS;Database=ArakDB;...`
- **Remote Server**: `Server=192.168.1.100;Database=ArakDB;User Id=sa;Password=yourpassword;...`

### Step 5: Apply Database Migrations

```bash
cd arak-backend
dotnet ef database update --project Arak.DAL --startup-project Arak.PLL
```

This will:
- Create the `ArakDB` database
- Run all migrations
- Seed initial data (roles, admin users, sample classes/students/teachers)

### Step 6: Start Backend Server

```bash
# From arak-backend/Arak.PLL
dotnet run
```

The backend will start on **http://localhost:5000**

### Step 7: Start Frontend Development Server

```bash
# From project root
npm run dev
```

The frontend will start on **http://localhost:5173** and open in your browser.

---

## 🔧 Configuration

### Frontend Environment Variables

A `.env.example` file is provided as a template. Copy it to `.env`:

```bash
cp .env.example .env
```

**Available variables:**

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:5000/api` |

Example `.env` file:
```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:5000/api
```

### Backend Configuration (`appsettings.json`)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.;Database=ArakDB;Integrated Security=True;TrustServerCertificate=True;"
  },
  "Jwt": {
    "Key": "YourSuperSecretKey_Minimum32Characters!",
    "Issuer": "ArakAPI",
    "Audience": "ArakDashboard",
    "ExpirationHours": 24
  },
  "Cors": {
    "AllowedOrigins": [
      "http://localhost:5173",
      "http://localhost:5174"
    ]
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

### Environment Variables (Production)

Set these environment variables to override defaults:

| Variable | Purpose | Default |
|----------|---------|---------|
| `ARAK_DEFAULT_PASSWORD` | Default password for seeded accounts | `{Role}@123` |
| `ARAK_ADMIN_PASSWORD` | Password for admin@arak.com | `Admin@123` |
| `ARAK_JWT_KEY` | JWT signing key | From appsettings.json |

---

## 📡 API Endpoints

### Base URL
- **Development**: `http://localhost:5000/api`
- **Production**: `https://api.arak.school/api`

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | Authenticate user |
| `POST` | `/auth/logout` | Logout (client-side token clear) |
| `GET` | `/auth/me` | Get current user from JWT |

### Core Resources

| Module | Endpoints | Auth Required |
|--------|-----------|:-------------:|
| **Students** | `GET/POST /students` · `GET/PUT/DELETE /students/{id}` | ✅ |
| **Teachers** | `GET/POST /teachers` · `GET/PUT/PATCH/DELETE /teachers/{id}` | ✅ |
| **Parents** | `GET/POST /parents` · `GET/PATCH/DELETE /parents/{id}` | ✅ |
| **Users** | `GET/POST /users` · `GET/PATCH/DELETE /users/{id}` | ✅ |
| **Classes** | `GET /classes` · `PATCH /classes/{id}` | ✅ |
| **Subjects** | `GET /subjects` | ✅ |
| **Roles** | `GET /roles` | ✅ |
| **Schedules** | `GET/POST /schedules` · `PUT/DELETE /schedules/{id}` | ✅ |
| **Evaluations** | `GET/POST /evaluations` · `DELETE /evaluations/{id}` | ✅ |
| **Tasks** | `GET/POST /tasks` · `GET/PATCH/DELETE /tasks/{id}` | ✅ |
| **Events** | `GET/POST /events` · `PUT/DELETE /events/{id}` | ✅ |
| **Attendance** | `GET /attendance` | ✅ |
| **Metrics** | `GET /metrics` | ❌ (Health check) |

### Response Format

**Successful GET:**
```json
{
  "data": [...],
  "items": 144,
  "page": 1,
  "pageSize": 10
}
```

**Error Response:**
```json
{
  "status": 404,
  "title": "Not Found",
  "detail": "Student with ID 999 was not found."
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200 OK` | Successful GET/DELETE |
| `201 Created` | Successful POST |
| `400 Bad Request` | Validation failed |
| `401 Unauthorized` | Missing or invalid JWT |
| `403 Forbidden` | Insufficient role/permission |
| `404 Not Found` | Resource doesn't exist |
| `409 Conflict` | Delete blocked by dependencies |
| `500 Internal Server Error` | Unexpected server error |

> 📖 **Full API Documentation**: See [BACKEND.md](./BACKEND.md) or visit http://localhost:5000/swagger

---

## 🗄️ Database

### Entity Relationships

```
ApplicationUser (Identity)
    ├── Teacher (1:1) ──→ Subject
    │       └── TeacherClass (M:N) ──→ Class
    ├── Parent (1:1) ──→ Student (1:N)
    └── Admin Users

Class ──→ Student (1:N)
    ├── TimeTable (Schedule)
    ├── Evaluation (Grades)
    └── Assignment (Tasks)

Subject ──→ TimeTable
Teacher ──→ TimeTable
```

### Key Data Integrity Rules

1. **DeleteBehavior.Restrict** on ALL foreign keys
2. **Cannot delete** Teacher with active Schedule records
3. **Cannot delete** Student with Evaluation/Attendance records
4. **Cannot delete** Class with enrolled Students
5. **gradesLocked** (bool) on Class → prevents grade mutations when true
6. **All IDs are `int` primitive** (never GUID or string)

### Running Migrations

```bash
# Create a new migration
cd arak-backend/Arak.DAL
dotnet ef migrations add YourMigrationName

# Apply migrations to database
cd ../Arak.PLL
dotnet ef database update

# Remove last migration (if not applied)
dotnet ef migrations remove
```

---

## 🧪 Testing

### Frontend Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

**Testing Stack:**
- **Vitest** - Test runner
- **Testing Library** - React component testing
- **JSDOM** - DOM simulation

### Backend Tests

```bash
# Run backend tests
cd arak-backend
dotnet test
```

---

## 📁 Project Structure

```
arak-admin/
├── src/                          # Frontend source code
│   ├── components/
│   │   ├── auth/                 # ProtectedRoute, Auth layouts
│   │   ├── common/               # Reusable components (Modal, Toast, etc.)
│   │   ├── layout/               # Sidebar, Topbar
│   │   └── control/              # SheetManager (Excel upload)
│   ├── context/                  # React Contexts (Auth, Toast, Refresh)
│   ├── pages/                    # Route components
│   │   ├── Students/
│   │   ├── Teachers/
│   │   ├── User/                 # User Management
│   │   ├── Grades/               # Grades & Classes
│   │   └── ...
│   ├── services/                 # API service layer (Axios calls)
│   ├── config/                   # Permissions, grading systems
│   ├── styles/                   # Global CSS & design tokens
│   ├── App.jsx                   # Main app component & routing
│   └── main.jsx                  # Entry point
├── arak-backend/                 # Backend .NET solution
│   ├── Arak.DAL/                 # Data Access Layer
│   │   ├── Database/             # DbContext, DbInitializer
│   │   ├── Entities/             # EF Core models
│   │   ├── Migrations/           # EF migrations
│   │   └── Repository/           # Generic & specific repos
│   ├── Arak.BLL/                 # Business Logic Layer
│   │   ├── DTOs/                 # Data Transfer Objects
│   │   └── Service/              # Business services
│   └── Arak.PLL/                 # Presentation Layer
│       ├── Controllers/          # API controllers
│       ├── Program.cs            # App entry point & middleware
│       └── appsettings.json      # Configuration
├── .env                          # Environment variables
├── package.json                  # Frontend dependencies
├── vite.config.js                # Vite configuration
└── README.md                     # This file
```

---

## ⚠️ Known Issues

### 🔴 High Priority

1. **Auth Service Mock** - `authService.js` uses mocked payloads, not fully wired to ASP.NET Core Identity
   - **Impact**: Login flow may not match backend response shape
   - **Status**: In progress

### 🟠 Medium Priority

2. **Grade Upload = N+1 Requests** - Control sheet upload sends 1 request per student grade
   - **Fix**: Implement `POST /evaluations/batch` endpoint (single SQL transaction)
   - **File**: `Arak.PLL/Controllers/EvaluationsController.cs`

3. **Teacher.assignedClasses Sync** - Race condition if PATCH fails after Schedule creation
   - **Fix**: Compute dynamically from Schedule table instead of storing denormalized array

### 🟡 Low Priority

4. **Chat Feature** - 0% implemented
   - **Fix**: ASP.NET Core SignalR hub + `@microsoft/signalr` on frontend

5. **JWT Refresh Token** - Hard logout at 24h, possible data loss with unsaved forms
   - **Fix**: Implement refresh token flow

6. **GET /metrics Endpoint** - May return incomplete stats
   - **Fix**: Implement `HealthController.cs` with real-time metrics

---

## 🤝 Contributing

### Git Workflow

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add new feature description"

# Push and create PR
git push origin feature/your-feature-name
```

### Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, no logic change)
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Build/config changes

### Before Submitting PR

- [ ] All tests pass (`npm test` + `dotnet test`)
- [ ] No ESLint warnings (`npm run lint`)
- [ ] Backend builds successfully (`dotnet build`)
- [ ] Update documentation if API contracts changed
- [ ] Test with different user roles

---

## 📝 License

This project is **proprietary and confidential**. Unauthorized copying, distribution, or modification is prohibited without explicit permission from the project owner.

---

## 👥 Team

| Name | Role |
|------|------|
| **Lead Developer** | Final-year IT student |

---

## 📞 Support

- **Issues**: GitHub Issues repository
- **Documentation**: [BACKEND.md](./BACKEND.md) - Full API contract
- **SRS**: [SRS.md](./SRS.md) - Software Requirements Specification (private)

---

## 🙏 Acknowledgments

- **React Team** - Excellent UI framework
- **Microsoft .NET Team** - Robust backend framework
- **Lucide** - Beautiful icon library
- **Recharts** - Powerful charting library

---

<div align="center">

**Made with ❤️ by the ARAK Team**  
© 2026

</div>
