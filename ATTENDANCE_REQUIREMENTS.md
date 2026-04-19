# Arak System - Attendance Feature Architecture & Requirements

## System Architecture

| Platform | Who Uses It |
|----------|------------|
| **React Web Panel** | Super Admin, Admin only |
| **Flutter Mobile App** | Teacher, Parent only |

## Role 1 — Super Admin / Admin (Web Only)

### `/attendance` — Daily Attendance Page
- Grade dropdown → Class dropdown → Date picker
- 4 summary cards: Total Students / Present % / Absent % / Late %
- "Mark All Present" button → sets all students to Present
- Students List table: # | Name | Status badge | Time In | Time Out | Edit button
- Edit button → modal to change status + timeIn + timeOut for one student
- Empty state if no class/date selected

### `/attendance/student/:id` — Student Details Page
- Student name + Grade + Class
- Today's status banner (green=Present, red=Absent, orange=Late) + date + Punch In + Punch Out times
- 3 stat cards: Attendance Rate % / Late Arrivals count / Absences count
- Monthly calendar: each day has colored dot (green/red/orange/grey=not recorded)
- Navigate months with `<` `>` arrows

## Role 2 — Teacher (Flutter Only)

### Attendance Screen
- Class selector dropdown (all classes)
- Session selector: Morning / Afternoon
- "Overall Attendance" % — live calculated
- Student card list: Avatar circle + Student Name + Status pill button
- Status pill cycles on tap: **Present** (green) → **Absent** (red) → **Late** (orange) → back to Present
- Sticky **"Save Attendance"** blue button at bottom
- Morning save → `POST /api/attendance/bulk`
- Afternoon save → `PUT /api/attendance/bulk-timeout` (only updates timeOut)

## Role 3 — Parent (Flutter Only)

### Attendance Details Screen
- Back arrow + "attendance Details" title
- Student name bold + Grade - Class subtitle
- Today's status card: green checkmark + "present today" + date + time in + time out
- 3 inline stats: Attendance % | Late arrivals count | Absences count
- Monthly calendar with color-coded days:
  - 🟢 Green = Present
  - 🔴 Red = Absent
  - 🟠 Orange = Late
  - ⚪ Grey = Weekend / Not recorded
- "last update" timestamp at bottom
- **Read-only — zero edit controls**
- Shows **only their linked child/children** — never other students

***

## Backend Implementation Plan

### Database Model — `AttendanceRecord`
- Id (int, PK)
- StudentId (int, FK → Students)
- ClassId (int, FK → Classes)
- TeacherId (int, FK → Users)
- Date (DateOnly)
- Session ("Morning" | "Afternoon")
- Status ("Present" | "Absent" | "Late" | "NotRecorded")
- TimeIn (TimeOnly, nullable)
- TimeOut (TimeOnly, nullable)
- CreatedAt (DateTime)
- UpdatedAt (DateTime)

### Endpoints to Implement

**1.** `POST /api/attendance/bulk` *(Teacher — Morning)*
- Auth: Teacher role only
- Body: `{ classId, date, session: "Morning", records: [{studentId, status, timeIn}] }`
- Creates attendance records for all students in one call
- If record exists for same student+date → update it

**2.** `PUT /api/attendance/bulk-timeout` *(Teacher — Afternoon)*
- Auth: Teacher role only
- Body: `{ classId, date, records: [{studentId, timeOut}] }`
- Updates only `timeOut` and `session = "Afternoon"` for existing records

**3.** `GET /api/attendance/class/{classId}?date=YYYY-MM-DD` *(Admin)*
- Auth: Admin / Super Admin
- Returns all students in class with their attendance for that date
- Response per student: `{ studentId, studentName, status, timeIn, timeOut }`
- If no record → status = `"NotRecorded"`, times = null

**4.** `GET /api/attendance/summary/{classId}?date=YYYY-MM-DD` *(Admin — summary cards)*
- Auth: Admin / Super Admin
- Returns: `{ totalStudents, presentCount, presentRate, absentCount, absentRate, lateCount, lateRate, notRecordedCount }`

**5.** `GET /api/attendance/student/{studentId}?month=MM&year=YYYY` *(Parent + Admin)*
- Auth: Parent (only their linked child) / Admin / Super Admin
- Returns: `{ studentName, grade, className, todayStatus, todayTimeIn, todayTimeOut, attendanceRate, lateArrivals, absences, records: [{ date, status, timeIn, timeOut }] }`
- Parent security check: verify `studentId` belongs to requesting parent's linked students — return 403 if not

**6.** `PATCH /api/attendance/{id}` *(Admin override)*
- Auth: Admin / Super Admin only
- Body: `{ status, timeIn, timeOut }`
- Admin can correct any record

### Seed Data
- 2 classes × 10 students each
- 10 days of attendance records with mixed statuses (70% present, 15% absent, 15% late)
- Realistic timeIn values: 07:45–08:30, timeOut: 13:30–14:00

---
**Status:** Waiting for Flutter app views and explicit command to begin step 1.
