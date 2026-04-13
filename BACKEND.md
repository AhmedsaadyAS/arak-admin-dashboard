# ARAK Admin Dashboard — .NET Backend API Contract

> **Version**: 2.1.0  
> **Last Updated**: April 13, 2026  
> **Target Framework**: ASP.NET Core 9  
> **Database**: Microsoft SQL Server 2019+  
> **Base URL (Dev)**: `http://localhost:5000/api`  
> **Base URL (Prod)**: `https://api.arak.school/api`  
> **Auth**: JWT Bearer Token — `Authorization: Bearer <token>`  
> **Frontend env var**: `VITE_API_BASE_URL` in `.env`  
> **Runtime**: Port 5000 (configured in `launchSettings.json`)

---

## 📋 Quick Endpoint Index

| Module | Endpoints |
|---|---|
| 🔐 Auth | `POST /auth/login` · `POST /auth/logout` · `GET /auth/me` |
| 🎓 Students | `GET/POST /students` · `GET/PUT/DELETE /students/{id}` |
| 👩‍🏫 Teachers | `GET/POST /teachers` · `GET/PUT/PATCH/DELETE /teachers/{id}` |
| 👨‍👩‍👦 Parents | `GET/POST /parents` · `GET/PATCH/DELETE /parents/{id}` |
| 👤 Users | `GET/POST /users` · `GET/PATCH/DELETE /users/{id}` |
| 🏫 Classes | `GET /classes` · `PATCH /classes/{id}` |
| 📚 Subjects | `GET /subjects` |
| 🔑 Roles | `GET /roles` |
| 📅 Schedules | `GET/POST /schedules` · `PUT/DELETE /schedules/{id}` |
| 📋 Evaluations | `GET/POST /evaluations` · `DELETE /evaluations/{id}` |
| 📝 Tasks | `GET/POST /tasks` · `GET/PATCH/DELETE /tasks/{id}` |
| 📆 Events | `GET/POST /events` · `PUT/DELETE /events/{id}` |
| 🏫 Attendance | `GET /attendance` |
| 📊 Metrics | `GET /metrics` |

---

## 🔐 Authentication

> **Note:** Current `authService.js` is fully mock. This entire section needs real implementation.

> ⚠️ **CRITICAL**: See "Critical Notices & Gotchas" section below for pagination format, role strings, and other contract-breaking requirements.

### `POST /auth/login`
Authenticate a user and return a JWT token.

**Request Body:**
```json
{
  "email": "admin@arak.com",
  "password": "admin123"
}
```

**Response `200 OK`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@arak.com",
    "role": "Super Admin",
    "avatar": "AU",
    "roleId": 1
  }
}
```

**Response `401 Unauthorized`:**
```json
{ "message": "Invalid email or password" }
```

> ⚠️ **Frontend expects** the `user` object to contain: `id`, `name`, `email`, `role` (string name), `avatar`, `roleId`

---

### `POST /auth/logout`
Invalidate current token (server-side if using refresh tokens).

**Response `200 OK`:**
```json
{ "message": "Logged out successfully" }
```

---

### `GET /auth/me`
Get the currently authenticated user from the JWT token.

**Headers:** `Authorization: Bearer <token>`

**Response `200 OK`:** Same as the `user` object from login.

---

## 🎓 Students

### `GET /students`
Get paginated, filtered student list.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `_page` | `int` | Page number (default: 1) |
| `_limit` | `int` | Items per page (default: 10) |
| `q` | `string` | Full-text search (name, email, studentId) |
| `grade` | `string` | Filter by grade (e.g. `"Grade 4-A"`) |
| `classId` | `int` | Filter by class ID |
| `status` | `string` | `"Active"` or `"Inactive"` |

**Response `200 OK`:**
```json
{
  "data": [
    {
      "id": 1,
      "studentId": "STU-4A-01",
      "name": "Hassan Amin",
      "email": "hassan.amin@arak.edu.eg",
      "grade": "Grade 4-A",
      "classId": 1,
      "parentId": 5,
      "status": "Active",
      "city": "Cairo",
      "phone": "+201012345678",
      "dateOfBirth": "2015-03-12",
      "address": "123 Main St"
    }
  ],
  "total": 144,
  "page": 1,
  "pageSize": 10
}
```

> ⚠️ **Frontend reads**: `response.data.data` for the array and `response.data.items` (or `response.data.total`) for count.  
> File: `api.js → getStudents()`

---

### `GET /students/{id}`
Get single student.

**Response `200 OK`:** Single student object (same shape as above).

---

### `POST /students`
Create a new student.

**Request Body:**
```json
{
  "studentId": "STU-4A-10",
  "name": "New Student",
  "email": "new@arak.edu.eg",
  "grade": "Grade 4-A",
  "classId": 1,
  "parentId": 2,
  "status": "Active",
  "city": "Cairo",
  "phone": "+201000000000",
  "dateOfBirth": "2015-06-01"
}
```

**Response `201 Created`:** Created student object with `id`.

---

### `PUT /students/{id}`
Full update of a student record.

**Response `200 OK`:** Updated student object.

---

### `DELETE /students/{id}`
Delete a student.

> ⚠️ **Frontend checks dependencies first** (`/attendance`, `/evaluations` by `studentId`) and will block deletion if records exist. The .NET backend should also enforce this via foreign key constraints or a `409 Conflict` response.

**Response `200 OK`:** `{}`  
**Response `409 Conflict`:** `{ "message": "Cannot delete student with existing attendance/evaluation records" }`

---

## 👩‍🏫 Teachers

### `GET /teachers`
Get all teachers (no pagination required currently — returns full array).

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `q` | `string` | Search by name |
| `teacherId` | `int` | Filter by teacher ID (used for dependency checks) |

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "teacherId": "#T100001",
    "name": "Maria Historica",
    "email": "maria@arak.edu.eg",
    "phone": "+201099999999",
    "subject": "History",
    "department": "Humanities",
    "experience": 8,
    "city": "Cairo",
    "status": "Active",
    "assignedClasses": [1, 2, 3],
    "education": "PhD in History",
    "about": "Experienced teacher...",
    "expertise": ["Medieval History", "Modern History"],
    "dateJoined": "2020-09-01"
  }
]
```

---

### `GET /teachers/{id}`
Get single teacher.

---

### `POST /teachers`
Create a new teacher.

**Response `201 Created`:** Created teacher object with `id`.

---

### `PUT /teachers/{id}`
Full update of teacher record.

---

### `PATCH /teachers/{id}`
Partial update (e.g., update `assignedClasses` only).

**Request Body (example):**
```json
{ "assignedClasses": [1, 2, 4] }
```

---

### `DELETE /teachers/{id}`
Delete a teacher.

> ⚠️ **Frontend checks dependencies**: `classes?teacherId=X`, `tasks?teacherId=X`, `schedules?teacherId=X`  
> Return `409 Conflict` if any exist.

---

## 👨‍👩‍👦 Parents

### `GET /parents`
Get all parents.

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "name": "Dina Rizk",
    "email": "dina@example.com",
    "phone": "+201011111111",
    "studentIds": [1, 3],
    "role": "Parent",
    "roleId": 5
  }
]
```

---

### `GET /parents/{id}` · `POST /parents` · `PATCH /parents/{id}` · `DELETE /parents/{id}`
Standard CRUD. Body matches the object above.

---

## 👤 Users (Admin Accounts)

> These are **admin panel accounts**, not parents/teachers.

### `GET /users`

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `email` | `string` | Filter by email (used for login lookup) |
| `role` | `string` | Filter by role name |

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "name": "Ahmed Admin",
    "email": "admin2@arak.com",
    "role": "Admin",
    "roleId": 2,
    "avatar": "AA",
    "status": "Active",
    "permissions": ["manage_users", "view_students"],
    "createdAt": "2025-01-15T10:00:00Z"
  }
]
```

> ⚠️ **Do NOT return `password` field** to the frontend — strip it server-side.

---

### `POST /users`
Create new admin user.

**Request Body:**
```json
{
  "name": "New User",
  "email": "newuser@arak.com",
  "password": "hashed_password",
  "role": "Teacher",
  "roleId": 3,
  "permissions": [],
  "status": "Active"
}
```

---

### `GET /users/{id}` · `PATCH /users/{id}` · `DELETE /users/{id}`
Standard CRUD. `PATCH` for partial updates (role change, status, permissions).

---
- [ ] Return `409 Conflict` instead of `200` when deleting records with dependencies

---

## 🚨 Critical Notices & Gotchas

> These are not obvious from the API surface alone — they come from reading the actual frontend business logic. **Share this section with your backend developer before they start.**

---

### 0. 🎯 Current Implementation Status (April 2026)

**What's Working:**
- ✅ Full .NET backend with ASP.NET Core Identity
- ✅ JWT authentication with real login endpoint
- ✅ All CRUD endpoints for Students, Teachers, Classes, Subjects, Schedules, Evaluations, Tasks, Events
- ✅ Delete functionality with dependency checking (Students, Teachers, Users, Parents)
- ✅ User Management with Add Admin button working
- ✅ Class management with student capacity tracking (MaxStudents)
- ✅ Control Sheets page with proper stage/class/subject filtering
- ✅ Database seeding with realistic test data

**What Needs Attention:**
- 🔴 Auth service still has mocked fallback logic
- 🟠 Grade upload uses N+1 requests (needs batch endpoint)
- 🟡 Chat feature not implemented
- 🟡 No JWT refresh token (hard 24h logout)

---

### 1. 🔑 `user.role` Must Be a String Name — Not an ID

The frontend reads `user.role` as a **string** (e.g., `"Super Admin"`, `"Teacher"`) directly from the login response and stores it in `localStorage`.

All permission checks compare against these exact strings:
```js
if (user.role === 'Super Admin') return true;  // Bypass all checks
allowedRoles.includes(user.role)               // Route guard
```

**What this means for the backend:**
- Your JWT payload must include `role: "Super Admin"` (the string name), not just `roleId: 1`
- The login response's `user` object must include **both** `role: "Super Admin"` AND `roleId: 1`
- If you change role name strings, the frontend will break silently (access denied for everyone)

### Exact role name strings the frontend expects — do not rename:
```
"Super Admin" | "Admin" | "Academic Admin" | "Teacher" | "Fees Admin" | "Users Admin" | "Parent"
```

> ⚠️ **Note**: These are the roles currently seeded in the database. The SRS mentions additional roles (Registrar, Accountant, Student) but they are NOT implemented in the current codebase.

---

### 2. 📊 Pagination Format — Very Specific Shape Expected

The `getStudents()` method in `api.js` reads the response like this:
```js
if (response.data && Array.isArray(response.data.data)) {
    return { data: response.data.data, total: response.data.items };
}
// fallback: array response + X-Total-Count header
```

**Your `GET /students` response must be:**
```json
{
  "data": [...],
  "items": 144
}
```

> ⚠️ Note the key is **`items`** (not `total`, not `count`, not `totalCount`). This is a json-server v1 convention the frontend was built around.  
> **Recommendation:** Return both `items` and `total` so the frontend works regardless.

---

### 3. 🔄 Schedule + Teacher `assignedClasses` Must Stay in Sync

When a schedule lesson is created or updated, the frontend **automatically patches the teacher** to add that class to their `assignedClasses` array.

From `scheduleService.js`:
```
Add lesson to class 3 for teacher 5
  → PATCH /teachers/5 { assignedClasses: [1, 2, 3] }
  → POST /schedules { teacherId: 5, classId: 3, ... }
```

**What this means for the backend:**
- `assignedClasses` on a teacher is a **derived/denormalized field** — keep it updated when schedules change
- When you `DELETE /schedules/{id}`, check if that was the only lesson for that class for that teacher. If so, remove the class from `teacher.assignedClasses`
- Frontend blocks class removal from a teacher if they have active schedules for that class — your backend should enforce this too via `409 Conflict`

---

### 4. 📋 Grade Upload is an Upsert (Delete All → Re-insert)

The control sheet upload (`saveEvaluations`) works like this:
```
1. GET /evaluations?classId=X&subjectId=Y       → get all existing IDs
2. DELETE /evaluations/{id}  (one by one)         → delete all of them
3. POST /evaluations  (one by one, sequentially)  → insert fresh records
```

**What this means for the backend:**
- This is effectively an **upsert by (classId, subjectId)** — treat it that way
- **Recommend:** Implement `DELETE /evaluations?classId=X&subjectId=Y` (bulk delete by filter) to avoid N individual DELETE calls for large classes
- **Recommend:** Implement `POST /evaluations/batch` with array body for bulk insert
- Sequential inserts are used because json-server races on parallel POSTs — with a real SQL backend, parallel inserts are safe. But the frontend still does them sequentially for safety

---

### 5. 🆔 All IDs Must Be Integers — Not Strings

The frontend normalizes IDs everywhere:
```js
parseInt(id, 10)      // used in every service
Number(id)            // used in schedule service
```

**What this means for the backend:**
- Use `int` (not `string`, not `Guid`) for primary keys
- json-server sometimes returns IDs as strings — .NET returns `int` which is correct
- Any ID that comes back as a string `"3"` instead of `3` will cause filter queries to return empty results (the frontend uses strict `===` comparison in some places after parsing)

---

### 6. 🔒 Grades Lock Mechanism

Classes have a `gradesLocked: boolean` field. When locked:
- The Gradebook Monitor shows a lock icon
- The Control Sheet upload button may be disabled
- `PATCH /classes/{id}` with `{ gradesLocked: true }` is called

**What this means for the backend:**
- Add `gradesLocked` column to the `Classes` table (boolean, default `false`)
- When `gradesLocked = true`, the backend **should reject** any `POST /evaluations` for students in that class with `403 Forbidden`
- Only `Super Admin` and `Academic Admin` can toggle this

---

### 7. 🔐 No Self-Registration — Admin-Created Accounts Only

From the SRS and frontend:
- There is **no public registration endpoint**
- All user accounts are created by admins via `POST /users`
- `POST /auth/login` is the only public endpoint
- All other endpoints require `Authorization: Bearer <token>`

---

### 8. 🧑‍👨 Parent → Student Relationship (1 Parent : Many Students)

Parents have a `studentIds: [1, 3, 5]` array linking them to multiple children.

**What this means for the backend:**
- This is a **one-to-many** relationship: `Parent` → `Students`
- When fetching parent details, consider including student names in the response for the User Management page
- When a student is deleted, remove their ID from `parent.studentIds`

---

### 9. 🚫 Passwords — Security Critical

> ⚠️ **Current state (json-server):** Passwords are stored and compared in **plaintext**. This is only acceptable for the mock stage.

**For the .NET backend:**
- Hash passwords with **bcrypt or Argon2** (ASP.NET Core Identity handles this automatically)
- **Never return the `password` field** in any API response — strip it at the serialization layer using `[JsonIgnore]` or a DTO
- The frontend strips password from user objects before storing in localStorage, but the API must never send it

---

### 10. 📦 Evaluation Record Shape (for Control Sheet Upload)

When the frontend parses an uploaded Excel sheet and saves grades, each evaluation record looks like:
```json
{
  "studentId": 5,
  "classId": 1,
  "subjectId": 2,
  "assessmentType": "Month1",
  "marks": 42,
  "maxMarks": 50,
  "date": "2025-11-01",
  "termId": 1,
  "isAbsent": false,
  "feedback": ""
}
```

**Assessment types** come from `src/config/gradingSystems.js` and vary by stage:
- **Primary (ابتدائي):** `Month1`, `Month2`, `Month3`, `Final`
- **Preparatory (إعدادي):** `Month1`, `Month2`, `Final`, `Oral`, `Practical`
- **Secondary (ثانوي):** `Month1`, `Month2`, `Final`, `Oral`, `Practical`, `Research`

The `isAbsent: true` flag is set when a student wrote `غ` or `A` in the Excel cell.

---

### 11. 🌐 CORS Configuration

Since the frontend runs on `localhost:5173` (Vite) and the backend will run on a different port/domain, configure CORS in your ASP.NET Core project:

```csharp
// Program.cs
builder.Services.AddCors(options => {
    options.AddPolicy("AllowFrontend", policy => {
        policy.WithOrigins("http://localhost:5173", "https://your-production-domain.com")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
app.UseCors("AllowFrontend");
```

---

### 12. 📡 `GET /metrics` — Health Check Endpoint

The dashboard top bar shows a **"System Online" / "Offline"** badge. It calls `GET /metrics` on page load. If this endpoint fails or times out, the badge shows "Offline" — the rest of the app still works.

**This endpoint must:**
- Respond quickly (< 500ms)
- Return `200 OK` even if some subsystems are degraded (include health details in the body)
- Not require heavy database queries

---

### 13. 🔐 Full RBAC Permission Map

The backend should enforce these permissions at the API level. Listed per role:

| Role | Page Access | Allowed Actions |
|---|---|---|
| **Super Admin** | Everything | Everything (no restrictions) |
| **Admin** | Dashboard, Students, Teachers, Schedule, Events, Fees, Reports, Gradebook, Tasks, Chat, Settings | Create/Edit/Delete students, teachers, parents · Manage fees, grades, schedule · Export data |
| **Academic Admin** | Dashboard, Students, Teachers, Schedule, Events, Reports, Gradebook, Tasks | Create/Edit students & teachers · Manage grades & schedules · View reports · Control sheets |
| **Fees Admin** | Dashboard, Fees, Reports, Students (view) | Manage fees · View reports · Export data |
| **Users Admin** | Dashboard, Students, Teachers, User Management, Chat | Create/Edit/Delete students, teachers, parents |
| **Teacher** | Dashboard, Schedule, Gradebook, Tasks, Chat | Manage grades for assigned classes only |
| **Parent** | Dashboard, Fees (view), Schedule (view), Gradebook (view own children) | No write actions |

---

### 14. 📝 `GET /users?email=X` — Used for Login Lookup

During login, before checking demo accounts, the frontend does:
```js
GET /users?email=admin@arak.com
```
and finds the user by exact email match.

**What this means:**
- `GET /users` must support `email` as a query filter parameter
- The `.NET` login endpoint (`POST /auth/login`) replaces this — the frontend will no longer need to do `GET /users?email=X` once real auth is in place
- Until then, ensure your `/users` endpoint supports exact email filtering

---

### 15. ⏱️ Token Storage — localStorage vs sessionStorage

The frontend stores the token in either `localStorage` (if "Remember Me" is checked) or `sessionStorage` (if not). The request interceptor reads from both:
```js
const token = localStorage.getItem('arak_auth_token') || sessionStorage.getItem('arak_auth_token');
```

**What this means:**
- Your JWT expiry should be long enough for a working session (e.g., 24h for sessionStorage, 7d for localStorage)
- When you implement token refresh, the frontend will need to be updated to handle `401` responses by calling a refresh endpoint

---

*Last updated: based on full source code audit of `src/services/`, `src/context/AuthContext.jsx`, `src/config/permissions.js`, `src/services/scheduleService.js`, `src/services/officialSheetService.js`*

## 🔑 Roles

### `GET /roles`
Get all available roles.

**Response `200 OK`:**
```json
[
  { "id": 1, "name": "Super Admin" },
  { "id": 2, "name": "Admin" },
  { "id": 3, "name": "Teacher" },
  { "id": 4, "name": "Academic Admin" },
  { "id": 5, "name": "Parent" },
  { "id": 6, "name": "Fees Admin" },
  { "id": 7, "name": "Users Admin" }
]
```

---

## 🏫 Classes

### `GET /classes`
Get all classes.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `teacherId` | `int` | Filter classes assigned to teacher (dependency check) |
| `stage` | `string` | Filter by stage (`"primary"`, `"preparatory"`, `"secondary"`) |

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "name": "Grade 4-A",
    "grade": "Grade 4",
    "stage": "primary",
    "teacherId": 2,
    "gradesLocked": false,
    "studentCount": 30
  }
]
```

---

### `PATCH /classes/{id}`
Partial update — used to lock/unlock grades.

**Request Body:**
```json
{ "gradesLocked": true }
```

**Response `200 OK`:** Updated class object.

---

## 📚 Subjects

### `GET /subjects`
Get all subjects (lookup table — no pagination needed).

**Response `200 OK`:**
```json
[
  { "id": 1, "name": "Arabic (لغة عربية)", "code": "ARB" },
  { "id": 2, "name": "Mathematics (رياضيات)", "code": "MAT" },
  { "id": 3, "name": "English (إنجليزي)", "code": "ENG" },
  { "id": 4, "name": "Science (علوم)", "code": "SCI" },
  { "id": 5, "name": "Islamic Studies (تربية إسلامية)", "code": "ISL" }
]
```

---

## 📅 Schedules

### `GET /schedules`
Get schedules. Can be filtered.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `classId` | `int` | Filter by class |
| `teacherId` | `int` | Filter by teacher |

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "classId": 1,
    "teacherId": 3,
    "subjectId": 2,
    "dayOfWeek": 1,
    "startTime": "08:00",
    "endTime": "09:00",
    "room": "Room 12"
  }
]
```

> `dayOfWeek`: `0`=Sunday, `1`=Monday ... `6`=Saturday

---

### `POST /schedules`
Create a new schedule lesson.

**Response `201 Created`:** Created schedule with `id`.

---

### `PUT /schedules/{id}`
Full update of a schedule slot.

---

### `DELETE /schedules/{id}`
Delete a schedule slot.

---

## 📋 Evaluations (Grades)

> Used by **Gradebook Monitor** and **Control Sheets** (official grade upload).

### `GET /evaluations`
Get evaluations with filters.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `classId` | `int` | Filter by class |
| `subjectId` | `int` | Filter by subject |
| `studentId` | `int` | Filter by student |
| `assessmentType` | `string` | `"Month1"`, `"Month2"`, `"Final"`, etc. |

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "studentId": 5,
    "classId": 1,
    "subjectId": 2,
    "assessmentType": "Month1",
    "marks": 42,
    "maxMarks": 50,
    "feedback": "Good performance",
    "date": "2025-11-01"
  }
]
```

---

### `POST /evaluations`
Create a single evaluation record.

**Request Body:** Same shape as above (without `id`).

**Response `201 Created`:** Created evaluation with `id`.

> ⚠️ **Control Sheets bulk upload** calls this endpoint once per student per grade column. Plan for **batch insert** support: `POST /evaluations/batch` with an array body for performance.

---

### `DELETE /evaluations/{id}`
Delete a specific evaluation record.

**Response `200 OK`:** `{}`

---

## 📝 Tasks (Homework)

### `GET /tasks`
Get tasks with optional filters.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `teacherId` | `int` | Filter by assigned teacher |
| `classId` | `int` | Filter by class |
| `status` | `string` | `"Pending"`, `"Completed"`, `"Overdue"` |

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "title": "Chapter 3 Exercises",
    "description": "Complete exercises 1-10",
    "teacherId": 2,
    "classId": 1,
    "subjectId": 3,
    "dueDate": "2025-11-20",
    "status": "Pending",
    "createdAt": "2025-11-10T09:00:00Z"
  }
]
```

---

### `GET /tasks/{id}`
Get single task.

---

### `POST /tasks`
Create a new task.

**Response `201 Created`:** Created task with `id`.

---

### `PATCH /tasks/{id}`
Partial update of a task (e.g., update status).

---

### `DELETE /tasks/{id}`
Delete a task (admin quality control).

---

## 📆 Events

### `GET /events`
Get all events (client-side date filtering in frontend).

> ⚠️ When .NET is ready, the frontend `eventService.getEventsByDateRange()` expects server-side filtering. Add `startDate` and `endDate` query params.

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "title": "National Holiday",
    "type": "Holiday",
    "date": "2025-12-01",
    "startTime": "08:00",
    "endTime": "15:00",
    "description": "National Day celebration",
    "createdAt": "2025-11-01T10:00:00Z"
  }
]
```

**Event Types:** `Holiday`, `Exam`, `Meeting`, `Sports`, `Cultural`

---

### `POST /events`
Create event. Body matches above (without `id`).

**Response `201 Created`:** Created event with `id`.

---

### `PUT /events/{id}`
Full update of an event.

---

### `DELETE /events/{id}`
Delete an event.

---

## 🏫 Attendance

### `GET /attendance`
Get attendance records.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `studentId` | `int` | Filter by student (used in dependency checks) |
| `classId` | `int` | Filter by class |
| `date` | `string` | Filter by specific date (`YYYY-MM-DD`) |

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "studentId": 5,
    "classId": 1,
    "date": "2025-11-10",
    "status": "Present",
    "recordedBy": 3
  }
]
```

> ⚠️ Currently used only for **dependency checks** before student deletion. Full attendance UI is planned.

---

## 📊 Metrics (Dashboard)

### `GET /metrics`
Get system-wide dashboard statistics.

**Response `200 OK`:**
```json
{
  "totalStudents": 144,
  "totalTeachers": 32,
  "totalClasses": 18,
  "totalEvents": 12,
  "systemHealth": "Good",
  "serverUptime": "99.98%",
  "activeUsers": 8
}
```

> Used by `api.getSystemHealth()` to display the **"System Online"** badge in the top nav.

---

## ⚠️ Error Response Format

All errors should return a consistent shape (ASP.NET Core `ProblemDetails`):

```json
{
  "status": 404,
  "title": "Not Found",
  "detail": "Student with ID 999 was not found.",
  "errors": {}
}
```

| Status Code | When to Use |
|---|---|
| `200 OK` | Successful GET / DELETE |
| `201 Created` | Successful POST |
| `400 Bad Request` | Validation failed |
| `401 Unauthorized` | Missing or invalid JWT |
| `403 Forbidden` | Authenticated but insufficient role |
| `404 Not Found` | Resource doesn't exist |
| `409 Conflict` | Delete blocked by dependencies |
| `500 Internal Server Error` | Unexpected server error |

---

## 🔒 RBAC — Roles & Permissions

The frontend enforces route-level access via `src/config/permissions.js`. The backend should enforce the same rules at the API level.

| Role | Key Permissions |
|---|---|
| `Super Admin` | Full access to everything |
| `Admin` | Users, students, teachers, reports |
| `Academic Admin` | Grades, schedules, tasks, events |
| `Teacher` | Own tasks and schedules only |
| `Fees Admin` | Fees module only |
| `Users Admin` | User management only |
| `Parent` | Read-only own children (mobile app only) |

---

## 🚀 Migration Checklist (Frontend → .NET)

- [ ] Implement `POST /auth/login` → return real JWT
- [ ] Update `VITE_API_BASE_URL` in `.env` to .NET base URL
- [ ] Implement all CRUD endpoints above
- [ ] Change `/students` pagination to return `{ data: [], total: N }` format
- [ ] Add `POST /evaluations/batch` for bulk grade upload
- [ ] Add date filtering to `GET /events?startDate=&endDate=`
- [ ] Strip passwords from all `/users` responses
- [ ] Implement `PATCH /teachers/{id}` for partial updates
- [ ] Enforce JWT auth on all endpoints
- [ ] Return `409 Conflict` instead of `200` when deleting records with dependencies

---

*Generated from frontend source: `src/services/api.js`, `src/services/authService.js`, and all service files.*
