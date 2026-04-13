# 🚀 ARAK Admin - Quick Start Guide

> Get the application running in under 5 minutes

---

## ⚡ Prerequisites Checklist

Before you begin, ensure you have:

- [ ] **Node.js 18+** installed ([Download](https://nodejs.org/))
- [ ] **.NET 9 SDK** installed ([Download](https://dotnet.microsoft.com/download/dotnet/9.0))
- [ ] **SQL Server 2019+** running (Express edition is fine)
- [ ] **Git** installed
- [ ] Basic knowledge of terminal/command prompt

---

## 📦 Step-by-Step Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd arak-admin-dashboard
```

### Step 2: Install Frontend Dependencies

```bash
npm install
```

This installs all React dependencies (takes ~1-2 minutes).

### Step 3: Configure Database Connection

Open `arak-backend/Arak.PLL/appsettings.json` and update the connection string:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER_NAME;Database=ArakDB;Integrated Security=True;TrustServerCertificate=True;"
  }
}
```

**Common connection strings:**

| Setup | Connection String |
|-------|------------------|
| **Local SQL Server** | `Server=.;Database=ArakDB;Integrated Security=True;TrustServerCertificate=True;` |
| **SQL Server Express** | `Server=.\\SQLEXPRESS;Database=ArakDB;Integrated Security=True;TrustServerCertificate=True;` |
| **Windows Authentication** | `Server=YOUR-PC\\SQLEXPRESS;Database=ArakDB;Trusted_Connection=True;TrustServerCertificate=True;` |

### Step 4: Apply Database Migrations

```bash
cd arak-backend/Arak.PLL
dotnet ef database update
```

This will:
- ✅ Create the `ArakDB` database
- ✅ Run all migrations (tables, relationships, constraints)
- ✅ Seed initial data:
  - 7 roles (Super Admin, Admin, Academic Admin, etc.)
  - 2 admin users (admin@arak.com, academic@arak.com)
  - 9 classes across 3 stages (primary, preparatory, secondary)
  - 4 subjects (Mathematics, Physics, English, Arabic)
  - 2 teachers
  - 2 parents
  - 5 students
  - 6 timetable entries

**Expected output:**
```
Build started...
Build succeeded.
Done.
```

### Step 5: Start the Backend

```bash
# Still in arak-backend/Arak.PLL
dotnet run
```

**Expected output:**
```
Building...
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

✅ Backend is now running at **http://localhost:5000**  
📊 Swagger UI available at **http://localhost:5000/swagger**

### Step 6: Start the Frontend

Open a **new terminal** (keep backend running) and navigate to project root:

```bash
cd D:\project\arak-admin
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

✅ Frontend is now running at **http://localhost:5173**

---

## 🔐 Login & Test

### 1. Open the Application

Navigate to: **http://localhost:5173**

### 2. Login with Default Credentials

| Role | Email | Password | What You Can Do |
|------|-------|----------|-----------------|
| **Super Admin** | `admin@arak.com` | `Admin@123` | Access everything, test all features |
| **Academic Admin** | `academic@arak.com` | `Academic@123` | Manage grades, schedules, tasks |
| **Teacher** | `teacher1@arak.com` | `Teacher@123` | View own classes, upload grades |
| **Parent** | `parent1@arak.com` | `Parent@123` | View children's data (read-only) |

### 3. Verify Everything Works

- [ ] Login succeeds
- [ ] Dashboard loads with charts
- [ ] Students page shows 5 students
- [ ] Teachers page shows 2 teachers
- [ ] Classes page shows 9 classes
- [ ] System health badge shows "Online"

---

## 🛠️ Development Workflow

### Daily Development

```bash
# Terminal 1 - Backend
cd arak-backend/Arak.PLL
dotnet run

# Terminal 2 - Frontend
cd D:\project\arak-admin
npm run dev
```

### After Pulling New Changes

```bash
# Update frontend dependencies
npm install

# Check for new migrations
cd arak-backend/Arak.PLL
dotnet ef database update

# Restart both servers
```

### Create a New Migration

```bash
# After modifying EF Core entities
cd arak-backend/Arak.DAL
dotnet ef migrations add YourMigrationName

# Apply to database
cd ../Arak.PLL
dotnet ef database update
```

---

## 🔧 Troubleshooting

### ❌ "dotnet: command not found"

**Solution:** Install .NET 9 SDK from https://dotnet.microsoft.com/download/dotnet/9.0

### ❌ "Cannot connect to database"

**Check:**
1. SQL Server is running
2. Connection string is correct
3. You have permissions to create databases

**Test connection:**
```bash
sqlcmd -S . -Q "SELECT 1"
```

### ❌ "Port 5000 already in use"

**Solution:** Kill the process or change port in `launchSettings.json`

```bash
# Windows - find process on port 5000
netstat -ano | findstr ":5000"

# Kill it (replace PID)
taskkill /F /PID <PID>
```

### ❌ "VITE_API_BASE_URL not configured"

**Solution:** Create `.env` file in project root:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### ❌ Frontend shows "Offline" badge

**Cause:** Backend not running or wrong API URL  
**Solution:** Start backend and verify `.env` is correct

### ❌ Login fails

**Check:**
1. Backend is running on port 5000
2. `.env` has `VITE_API_BASE_URL=http://localhost:5000/api`
3. Database was seeded (run `dotnet ef database update`)
4. Using correct credentials

---

## 📝 Available npm Scripts

```bash
npm run dev          # Start frontend dev server (Vite)
npm run build        # Build for production
npm run preview      # Preview production build
npm run server       # Start mock JSON server (port 5000) - NOT USED with .NET
npm run test         # Run frontend tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage
npm run lint         # Run ESLint
```

---

## 📝 Available .NET Commands

```bash
dotnet run                    # Start backend
dotnet build                  # Build backend
dotnet test                   # Run backend tests
dotnet ef database update     # Apply migrations
dotnet ef migrations add Name # Create migration
dotnet ef migrations remove   # Remove last migration
dotnet watch run              # Hot reload on changes
```

---

## 🎯 Next Steps

Once the application is running:

1. **Explore the Dashboard** - Login as Super Admin
2. **Test Different Roles** - Login with different credentials
3. **Add Data** - Create students, teachers, classes
4. **Upload Grades** - Use Control Sheets feature
5. **View Reports** - Check analytics and charts

---

## 📚 Documentation

- **[README.md](./README.md)** - Main project documentation
- **[BACKEND.md](./BACKEND.md)** - Full API contract reference
- **[SRS.md](./SRS.md)** - Software Requirements Specification
- **[DELETE_FUNCTIONALITY.md](./DELETE_FUNCTIONALITY.md)** - Delete operations guide

---

## 🆘 Need Help?

- **GitHub Issues**: Repository issues tracker
- **Lead Developer**: Project lead (Final-year IT student)

---

<div align="center">

**Happy Coding! 🎉**

</div>
