# 🎓 ARAK Admin Dashboard

> A comprehensive Learning Management System (LMS) administration interface built with React, robust Role-Based Access Control (RBAC), and relational data integrity.

![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white)
![RBAC](https://img.shields.io/badge/Security-RBAC-green?style=flat-square)
![Status](https://img.shields.io/badge/Status-Evaluation_Ready-orange?style=flat-square)

## 🚀 Overview

ARAK Admin is a school management dashboard designed for high-level oversight of an educational institution. It provides granular access control for different admin roles and ensures data consistency across complex relationships (Teachers ↔ Classes ↔ Schedules).

### ✨ Key Features

- **🔐 Granular RBAC**:
  - **Super Admin**: Full unrestricted access.
  - **Academic Admin**: Manages grades, tasks, and schedules.
  - **Users Admin**: Manages student and teacher profiles.
  - **Fees Admin**: Access to financial reports and fee structures.

- **📊 Comprehensive Modules**:
  - **Start/Command Centers**: Dynamic Dashboards for each role.
  - **Gradebook Monitor**: Oversee student performance with distribution charts.
  - **Task Monitor**: Track homework assignment completion and quality.
  - **Event Manager**: School-wide event calendar (Holidays, Exams, etc.).
  - **Schedule System**: Real-time class scheduling with teacher conflict detection.

- **🛡️ Data Integrity**:
  - **Orphan Prevention**: Cannot delete teachers/classes if they have active dependencies (e.g., scheduled lessons).
  - **Atomic Sync**: Adding a lesson automatically patches the teacher's profile to include the new Class scope.

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, React Router v6
- **Styling**: Vanilla CSS (Circuit Board Design System), Lucide React Icons
- **State Management**: Context API (Auth, Refresh, Toast)
- **Data Layer**: Custom Axios Service Layer, Mock JSON Server (for development)
- **Charts**: Recharts

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/AhmedsaadyAS/arak-admin-dashboard.git
   cd arak-admin-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the Backend (Mock Server)**
   Runs on port `5000` to simulate the API.
   ```bash
   npm run server
   ```

4. **Start the Frontend**
   Runs on port `5173`.
   ```bash
   npm run dev
   ```

5. **Login Credentials** (for testing)

| Role | Username | Password | Access |
|------|----------|----------|--------|
| **Super Admin** | `super` | `password` | All Modules |
| **Academic** | `academic` | `password` | Gradebook, Tasks, Schedule |
| **Users Admin** | `users` | `password` | Teachers, Students |
| **Fees Admin** | `fees` | `password` | Fees, Reports |
| **Teacher** | `teacher1` | `password` | View Only |

## 📐 Project Structure

```
src/
├── components/
│   ├── auth/          # ProtectedRoute, Auth Layouts
│   ├── common/        # DataTable, ConfirmModal, Toast, etc.
│   ├── layout/        # Sidebar, Topbar
│   └── schedule/      # LessonForm
├── context/           # AuthContext, ToastContext
├── pages/             # Route Components (Dashboard, Tasks, etc.)
├── services/          # API Layer (taskService, scheduleService)
├── styles/            # Global variables & Design tokens
└── utils/             # Helpers (scheduleUtils, roleUtils)
```

## 🔄 Workflow

1. **Authentication**: JWT-based login (simulated) stores token in localStorage.
2. **Access Control**: `ProtectedRoute` checks user role against route permission.
3. **Data Fetching**: Services handle API calls with centralized error handling.
4. **Mutations**: Optimistic UI updates with Toast notifications for success/error.

## 📝 License

This project is proprietary and confidential. Unauthorized copying is prohibited.
