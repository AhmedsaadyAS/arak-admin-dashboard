# ARAK Admin Dashboard - Backend API Contract

> **Version**: 1.0.0
> **Base URL**: `http://localhost:5000`
> **Auth**: Bearer Token required for all endpoints (Header: `Authorization: Bearer <token>`)

## 📚 Overview

This API powers the ARAK Admin Dashboard. currently implemented via **JSON Server**. It supports standard RESTful operations (CRUD) and pagination.

---

## 🔐 Authentication

### Login (Mock)
Simulated in client-side code (`authService.js`).
- **Input**: `{ email, password }`
- **Output**: `{ token, user }`

---

## 🎓 Students

### `GET /students`
Retrieve a list of students with pagination and filtering.

**Parameters:**

| Name | Type | Description |
| :--- | :--- | :--- |
| `_page` | `integer` | Page number (default: 1) |
| `_limit` | `integer` | Items per page (default: 10) |
| `q` | `string` | Full-text search (name, email, etc.) |
| `grade` | `string` | Filter by grade (e.g., "VII A") |
| `status` | `string` | Filter by status ("Active", "Inactive") |

**Response:**
- **Status**: `200 OK`
- **Header**: `X-Total-Count`: Total number of records.
- **Body**: Array of Student objects.

```json
[
  {
    "id": 1,
    "studentId": "#123456789",
    "name": "Samantha William",
    "email": "samantha@example.com",
    "grade": "VII A",
    "status": "Active"
  }
]
```

### `GET /students/:id`
Get a single student by ID.

### `POST /students`
Create a new student.
- **Body**: Student Object (without ID).

### `PUT /students/:id`
Update a student.
- **Body**: Full Student Object.

### `DELETE /students/:id`
Remove a student.

---

## 👩‍🏫 Teachers

### `GET /teachers`
Retrieve a list of teachers. Supports pagination (`_page`, `_limit`) and search (`q`).

**Response:**
```json
[
  {
    "id": 1,
    "name": "Maria Historica",
    "subject": "History",
    "assignedClasses": ["VII A", "VII B"]
  }
]
```

---

## 📊 System & Metrics

### `GET /metrics`
Retrieve dashboard system stats.

**Response:**
```json
{
  "totalStudents": 932,
  "totalTeachers": 754,
  "systemHealth": "Good",
  "serverUptime": "99.98%"
}
```

---

## 📅 Events & Fees (Future)

- `GET /events`: List school events.
- `GET /fees`: List fee structures and payments.

---

## ⚠️ Error Handling

The API returns standard HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized (Token missing or invalid)
- `404`: Not Found
- `500`: Internal Server Error

---

## 🔮 Future Backend Migration

This API documentation describes the interface expected by the frontend. The current `json-server` implementation is a placeholder. The frontend architecture is designed to switch to a real backend seamlessly.

**Migration Steps:**
1.  **Schema**: Implement the persistent database schema as defined in `ERD.md`.
2.  **API Contract**: Ensure the real backend endpoints match the Request/Response formats documented above.
3.  **Integration**: Update the `baseURL` in `src/services/api.js` to point to the real server environment.
