# Backend-Frontend Connection Status

## ✅ Connection Verified - All Systems Operational

### Backend (.NET API)
- **Status**: ✅ Running
- **URL**: `http://localhost:5000`
- **API Base**: `http://localhost:5000/api`
- **Swagger UI**: `http://localhost:5000/swagger`
- **CORS**: Configured for `http://localhost:5173`

### Frontend (React + Vite)
- **Status**: ✅ Running
- **URL**: `http://localhost:5173`
- **API Config**: `VITE_API_BASE_URL=http://localhost:5000/api`

### Database
- **Type**: SQL Server
- **Database**: ArakDB
- **Connection**: ✅ Connected
- **Migrations**: ✅ Up to date (including MaxStudents field)

---

## Configuration Files Verified

### 1. `.env` (Frontend)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```
✅ Correctly pointing to backend API

### 2. `src/services/api.js` (Frontend API Client)
```javascript
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});
```
✅ Using correct base URL

### 3. `src/services/authService.js` (Authentication)
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
// Login: POST /api/auth/login
// Logout: POST /api/auth/logout
// Verify: GET /api/auth/me
```
✅ Authentication endpoints configured

### 4. `appsettings.json` (Backend)
```json
{
  "Cors": {
    "AllowedOrigins": [
      "http://localhost:5173",
      "http://localhost:5174"
    ]
  }
}
```
✅ CORS allows frontend origin

### 5. Backend Program.cs
- CORS policy "AllowFrontend" configured ✅
- Authentication & Authorization enabled ✅
- JWT Bearer token validation ✅
- Database context configured ✅

---

## API Endpoints Available

### Public (No Auth Required)
- `POST /api/auth/login` - User login

### Protected (Requires JWT Token)
- `GET /api/auth/me` - Get current user
- `GET /api/classes` - List all classes
- `POST /api/classes` - Create class
- `PUT /api/classes/{id}` - Update class
- `PATCH /api/classes/{id}` - Partial update (lock grades, maxStudents)
- `DELETE /api/classes/{id}` - Delete class
- `GET /api/students` - List students
- `GET /api/teachers` - List teachers
- `GET /api/schedules` - List schedules
- And many more...

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | `admin@arak.com` | `Admin@123` |
| **Academic Admin** | `academic@arak.com` | `Academic@123` |
| **Teacher** | `teacher1@arak.com` | `Teacher@123` |
| **Parent** | `parent1@arak.com` | `Parent@123` |

---

## Recent Changes Applied

### Backend Updates
✅ Added `MaxStudents` field to Class entity  
✅ Created migration `AddMaxStudentsToClass`  
✅ Updated DTOs: `ClassDto`, `CreateClassDto`, `PatchClassDto`  
✅ Updated `ClassesController` with MaxStudents support  

### Frontend Updates  
✅ Redesigned class cards with capacity bar  
✅ Added MaxStudents field to Add/Edit forms  
✅ Added "Add Grade" button and modal  
✅ Enhanced UI/UX with better styling  

---

## How to Test Connection

1. **Open Browser**: Navigate to `http://localhost:5173`
2. **Login**: Use any credentials from the table above
3. **Navigate to Grades & Classes**: Go to `/grades` route
4. **Test Features**:
   - View all classes with student capacity bars
   - Click "Add Grade" to create a new grade
   - Click "Add Class" to create a new class with custom max students
   - Edit existing classes
   - View capacity indicators (green/orange/red)
   - Lock/unlock grades

---

## Troubleshooting

### If Frontend Can't Connect to Backend:
1. Verify backend is running: `netstat -ano | findstr ":5000"`
2. Check `.env` file has correct URL
3. Restart frontend dev server: `npm run dev`
4. Check browser console for CORS errors

### If Getting 401 Unauthorized:
1. Clear localStorage: `localStorage.clear()`
2. Refresh page
3. Login again with valid credentials

### If Database Errors:
1. Check SQL Server is running
2. Run migration: `dotnet ef database update`
3. Verify connection string in `appsettings.json`

---

**Last Verified**: April 13, 2026  
**Status**: ✅ All connections verified and working
