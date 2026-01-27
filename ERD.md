# ARAK Admin Dashboard - ERD

This document outlines the target entity relationships for the system.

```mermaid
erDiagram
    USERS ||--o{ ADMINS : "is a"
    USERS ||--o{ TEACHERS : "is a"
    USERS ||--o{ PARENTS : "is a"
    
    PARENTS ||--o{ STUDENT_PARENTS : "has"
    STUDENTS ||--o{ STUDENT_PARENTS : "linked to"
    
    TEACHERS ||--o{ CLASSES : "teaches"
    CLASSES ||--o{ STUDENTS : "contains"
    CLASSES ||--o{ SCHEDULE : "has"
    TEACHERS ||--o{ SCHEDULE : "assigned"
    
    TEACHERS ||--o{ ATTENDANCE : "records"
    STUDENTS ||--o{ ATTENDANCE : "has"
    
    TEACHERS ||--o{ EVALUATIONS : "writes"
    STUDENTS ||--o{ EVALUATIONS : "receives"
    
    TEACHERS ||--o{ TASKS : "assigns"
    STUDENTS ||--o{ TASKS : "receives"

    USERS {
        int id PK
        string username "Unique"
        string password_hash
        string role "Admin | Teacher | Parent"
        boolean status "Active/Inactive"
    }

    STUDENTS {
        int id PK
        string student_id "Unique #S"
        string name
        int class_id FK
        date enrollment_date
    }

    PARENTS {
        int id PK
        int user_id FK
        string phone
        string city
    }

    TEACHERS {
        int id PK
        int user_id FK
        string subject
        string phone
    }

    ATTENDANCE {
        int id PK
        int student_id FK
        int teacher_id FK
        date date
        string status "Present | Absent | Late"
    }

    EVALUATIONS {
        int id PK
        int student_id FK
        int teacher_id FK
        string subject
        float marks
        string feedback
        date date
    }

    SCHEDULE {
        int id PK
        int class_id FK
        int teacher_id FK
        string subject
        string day "Monday-Friday"
        time time
    }

    TASKS {
        int id PK
        int teacher_id FK
        string title
        string description
        date due_date
    }
```

## 🔗 Relationships Analysis

### 1. Unified User System (Authentication)
*   **Centralization**: The system relies on a unified `USERS` table for managing Authentication.
*   **RBAC**: Access rights are determined based on roles (Admin, Teacher, Parent) as specified in the SRS.
*   **Polymorphism**: Specific profile tables (`TEACHERS`, `PARENTS`) link back to `USERS` via `user_id`, allowing distinct profile data while sharing auth credentials.

### 2. Parent-Student Linking
*   **Many-to-Many**: Uses an intermediate table `STUDENT_PARENTS` instead of a direct foreign key.
*   **Purpose**: Allows a single Parent account to be linked to and monitor multiple Students (siblings), and supports cases where a student has multiple guardians.

### 3. Attendance & Evaluations
*   **Dual Linkage**: Every record is linked to a **TeacherID** (the authority responsible for data entry) and a **StudentID** (the subject of the record).
*   **Scalability**: This structure supports future integration with hardware solutions like **NFC** or **Biometric/Fingerprint** scanners for automated attendance.

### 4. Classes & Tasks
*   **Scoping**: Students and Teachers are linked via `class_id`.
*   **Isolation**: This ensures that tasks, schedules, and assignments are scoped correctly—users only see data relevant to their specific Class context.

