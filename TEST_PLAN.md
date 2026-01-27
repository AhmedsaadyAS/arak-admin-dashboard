# Expert-Level Testing Plan - ARAK Admin Dashboard

**Date**: January 27, 2026  
**Scope**: All Phase 3 Implementations (100% SRS Compliance)  
**Servers**: Dev (5173) + JSON (5000) - Both Running ✅

---

## 🎯 Test Objectives

1. **Functional Correctness**: All features work as designed
2. **RBAC Security**: Role-based access properly enforced
3. **Data Integrity**: Orphan checks prevent bad deletions
4. **User Experience**: Loading states, empty states, error handling
5. **Performance**: Responsive interactions, no console errors

---

## Test Suite 1: Authentication & RBAC

### Test 1.1: Super Admin Access
**Steps**:
1. Navigate to http://localhost:5173
2. Login: admin@arak.com / admin123
3. Verify dashboard loads
4. Check sidebar shows ALL menu items

**Expected Result**:
- ✅ Login successful
- ✅ Sidebar shows: Dashboard, Students, Teachers, Schedule, Events, Fees, Reports, Gradebook, Task Monitor, User Management, Chat, Activity, Settings

**Edge Cases**:
- [ ] Invalid credentials show error
- [ ] Session persists on page refresh

---

### Test 1.2: Academic Admin Access (Restricted)
**Steps**:
1. Logout from Super Admin
2. Login with Academic Admin (create test user if needed)
3. Verify sidebar shows only allowed items

**Expected Result**:
- ✅ Sidebar shows: Dashboard, Gradebook, Task Monitor (only)
- ✅ Cannot access /user (redirects to Unauthorized)

---

### Test 1.3: Fees Admin Access
**Steps**:
1. Login: fees@arak.com / fees123
2. Check sidebar filtering

**Expected Result**:
- ✅ Sidebar shows: Dashboard, Fees, Reports (only)
- ✅ Cannot access /evaluations

---

## Test Suite 2: Gradebook Monitor

### Test 2.1: Basic Grade Viewing
**Steps**:
1. Login as Super Admin or Academic Admin
2. Navigate to /evaluations
3. Select a Class from dropdown
4. Select a Subject (e.g., Math)
5. Verify grade table appears

**Expected Result**:
- ✅ FilterBar shows Class & Subject dropdowns
- ✅ DataTable displays student grades
- ✅ Marks are color-coded (Green ≥80, Orange ≥60, Red <60)
- ✅ Grade distribution chart appears below filters

**Data Validation**:
- [ ] Average calculation is correct
- [ ] Student count matches class roster
- [ ] Chart shows correct A-F distribution

---

### Test 2.2: Lock/Unlock Functionality
**Steps**:
1. With grades loaded, click "Lock Grades" button
2. Verify button changes to "Grades Locked" (red)
3. Click again to unlock
4. Verify button changes to "Grades Unlocked" (green)

**Expected Result**:
- ✅ Lock toggle works without errors
- ✅ Button text and color update correctly
- ✅ Console log shows lock status change

---

### Test 2.3: Empty State Handling
**Steps**:
1. Navigate to /evaluations
2. Don't select any filters
3. Verify empty state shows

**Expected Result**:
- ✅ Shows "Select Class and Subject" message
- ✅ Award icon displayed
- ✅ Helpful instruction text visible

---

### Test 2.4: Loading States
**Steps**:
1. Select Class and Subject
2. Observe loading behavior

**Expected Result**:
- ✅ SkeletonLoader appears while fetching
- ✅ Smooth transition to data table
- ✅ No layout shift during load

---

## Test Suite 3: Task Monitor

### Test 3.1: Statistics Dashboard
**Steps**:
1. Navigate to /tasks
2. Verify statistics cards appear

**Expected Result**:
- ✅ 4 stat cards: Total Tasks, Completed, Pending, Completion Rate
- ✅ Each card has correct icon and color
- ✅ Numbers are realistic (not 0/0)

---

### Test 3.2: Filtering by Teacher
**Steps**:
1. Select a Teacher from dropdown
2. Verify tasks filter correctly
3. Clear filters
4. Verify all tasks return

**Expected Result**:
- ✅ Task list updates based on filter
- ✅ Task count badge updates
- ✅ Clear button removes all filters

---

### Test 3.3: Task Deletion with Confirmation
**Steps**:
1. Click Delete icon on a task
2. Verify ConfirmModal appears
3. Click "Cancel"
4. Verify modal closes, task still exists
5. Click Delete again
6. Click "Delete Task"
7. Verify task is removed

**Expected Result**:
- ✅ ConfirmModal shows task title in message
- ✅ Cancel works without deletion
- ✅ Confirm removes task from list
- ✅ Statistics update after deletion

---

### Test 3.4: Due Date Highlighting
**Steps**:
1. View task list
2. Check due date colors

**Expected Result**:
- ✅ Overdue tasks show in RED
- ✅ Future tasks show in GREEN

---

## Test Suite 4: Event Manager

### Test 4.1: Event Creation
**Steps**:
1. Navigate to /events
2. Click "Add Event" button
3. Fill form:
   - Title: "Science Fair"
   - Type: "Cultural"
   - Date: Tomorrow's date
   - Start Time: 09:00
   - End Time: 15:00
   - Description: "Annual science exhibition"
4. Click "Create Event"

**Expected Result**:
- ✅ EventForm modal appears
- ✅ All fields editable
- ✅ Event appears in events list
- ✅ Event has correct color for type (Cultural = Purple)
- ✅ Calendar shows marker on event date

---

### Test 4.2: Event Editing
**Steps**:
1. Click Edit icon on an event
2. Change title to "Updated Science Fair"
3. Click "Update Event"

**Expected Result**:
- ✅ Form pre-populates with existing data
- ✅ Button says "Update Event" (not "Create")
- ✅ Event updates in list
- ✅ Calendar updates if date changed

---

### Test 4.3: Event Deletion
**Steps**:
1. Click Delete icon on an event
2. Verify ConfirmModal appears
3. Click "Delete Event"

**Expected Result**:
- ✅ ConfirmModal shows event title
- ✅ Event removed from list
- ✅ Calendar marker removed

---

### Test 4.4: Event Type Colors
**Steps**:
1. Create events of each type:
   - Holiday
   - Exam
   - Meeting
   - Sports
   - Cultural
2. Verify each has correct color

**Expected Result**:
- ✅ Holiday: Green (#22C55E)
- ✅ Exam: Red (#EF4444)
- ✅ Meeting: Blue (#3B82F6)
- ✅ Sports: Orange (#F59E0B)
- ✅ Cultural: Purple (#A855F7)

---

### Test 4.5: Calendar Navigation
**Steps**:
1. Click "Previous Month" arrow
2. Verify month changes
3. Click "Next Month" twice
4. Verify month advances

**Expected Result**:
- ✅ Month name updates
- ✅ Calendar re-renders with correct days
- ✅ Event markers update for visible month

---

## Test Suite 5: Data Integrity

### Test 5.1: Teacher Deletion with Dependencies
**Steps**:
1. Navigate to /teachers
2. Find a teacher with assigned classes/tasks
3. Click Delete
4. Verify DeleteWarningModal appears

**Expected Result**:
- ✅ Modal shows "Cannot Delete Teacher"
- ✅ Lists dependency counts (e.g., "2 Classes, 3 Tasks")
- ✅ Only "Close" button available (no force delete)
- ✅ Teacher NOT deleted

---

### Test 5.2: Student Deletion with Records
**Steps**:
1. Navigate to /students
2. Find a student with attendance/grades
3. Click Delete
4. Verify warning appears

**Expected Result**:
- ✅ Modal shows "Cannot Delete Student"
- ✅ Lists: "X Attendance records, Y Evaluations"
- ✅ Student NOT deleted

---

### Test 5.3: Safe Deletion (No Dependencies)
**Steps**:
1. Create a new teacher with no assignments
2. Try to delete
3. Verify standard ConfirmModal appears (not warning)
4. Confirm deletion

**Expected Result**:
- ✅ No dependency warning
- ✅ Standard ConfirmModal shows
- ✅ Teacher successfully deleted

---

## Test Suite 6: Shared Components

### Test 6.1: DataTable Sorting
**Steps**:
1. Go to /evaluations and load grades
2. Click "Student Name" column header
3. Verify sorting (A-Z)
4. Click again
5. Verify reverse sort (Z-A)

**Expected Result**:
- ✅ Sort icons update (up/down arrows)
- ✅ Data reorders correctly
- ✅ Active sort highlighted

---

### Test 6.2: FilterBar Clear All
**Steps**:
1. In /tasks, select Teacher + Class + Status filters
2. Click "Clear Filters" button
3. Verify all dropdowns reset to "All"

**Expected Result**:
- ✅ All filters cleared
- ✅ Full task list returns
- ✅ Clear button disappears

---

### Test 6.3: SkeletonLoader Appearance
**Steps**:
1. Navigate to /tasks
2. Observe initial load

**Expected Result**:
- ✅ Skeleton table appears with shimmer animation
- ✅ Layout matches final table structure
- ✅ Smooth transition to real data

---

## Test Suite 7: Error Handling

### Test 7.1: Network Failure Simulation
**Steps**:
1. Stop JSON server (npm run server terminal)
2. Navigate to /evaluations
3. Select Class + Subject
4. Observe behavior

**Expected Result**:
- ✅ No crash
- ✅ Error logged to console
- ✅ Empty state or error message shown
- ✅ Graceful degradation

---

### Test 7.2: Invalid Route Access
**Steps**:
1. Login as Fees Admin
2. Manually navigate to /evaluations
3. Verify redirect to /unauthorized

**Expected Result**:
- ✅ ProtectedRoute blocks access
- ✅ Redirects to Unauthorized page
- ✅ Message explains access denied

---

## Test Suite 8: User Experience

### Test 8.1: Responsive Design
**Steps**:
1. Resize browser to mobile width (375px)
2. Check each new page

**Expected Result**:
- ✅ FilterBar stacks vertically
- ✅ DataTable remains scrollable
- ✅ Modal adjusts to viewport
- ✅ No horizontal overflow

---

### Test 8.2: Keyboard Navigation
**Steps**:
1. Open EventForm
2. Tab through all fields
3. Submit with Enter key

**Expected Result**:
- ✅ Tab order is logical
- ✅ Focus visible on all elements
- ✅ Enter submits form

---

### Test 8.3: Empty States Quality
**Steps**:
1. Check empty states on:
   - /evaluations (no filters)
   - /tasks (no tasks)
   - /events (no events)

**Expected Result**:
- ✅ Each has custom icon
- ✅ Helpful message displayed
- ✅ Suggests next action

---

## Test Suite 9: Performance

### Test 9.1: Page Load Speed
**Steps**:
1. Open DevTools Network tab
2. Navigate to each new page
3. Check load times

**Expected Result**:
- ✅ /evaluations loads < 500ms
- ✅ /tasks loads < 500ms
- ✅ /events loads < 500ms
- ✅ No excessive API calls

---

### Test 9.2: Large Dataset Handling
**Steps**:
1. Check if db.json has 150+ students
2. Navigate to /evaluations
3. Select a large class
4. Measure render time

**Expected Result**:
- ✅ No lag with 150+ records
- ✅ Table renders smoothly
- ✅ Sorting works efficiently

---

### Test 9.3: Console Errors
**Steps**:
1. Open DevTools Console
2. Navigate through all pages
3. Create, edit, delete items

**Expected Result**:
- ✅ ZERO errors in console
- ✅ Only intentional logs (if any)
- ✅ No React warnings

---

## Test Suite 10: Integration Tests

### Test 10.1: End-to-End Flow: Create Event → View in Schedule
**Steps**:
1. Create event on specific date
2. Navigate to /schedule
3. Verify event appears on that date

**Expected Result**:
- ✅ Event visible in Schedule view
- ✅ Correct time and details
- ✅ Color matches event type

---

### Test 10.2: Multi-Role Workflow
**Steps**:
1. Login as Super Admin
2. Create a task
3. Logout
4. Login as Academic Admin
5. View task in /tasks
6. Delete task
7. Verify deletion persists after logout/login

**Expected Result**:
- ✅ Task created by Super Admin
- ✅ Visible to Academic Admin
- ✅ Academic Admin can delete
- ✅ Deletion persists across sessions

---

## 📊 Test Results Summary

| Suite | Total Tests | Passed | Failed | Blocked | Notes |
|-------|-------------|--------|--------|---------|-------|
| 1. Auth & RBAC | 3 | - | - | - | |
| 2. Gradebook | 4 | - | - | - | |
| 3. Task Monitor | 4 | - | - | - | |
| 4. Event Manager | 5 | - | - | - | |
| 5. Data Integrity | 3 | - | - | - | |
| 6. Shared Components | 3 | - | - | - | |
| 7. Error Handling | 2 | - | - | - | |
| 8. User Experience | 3 | - | - | - | |
| 9. Performance | 3 | - | - | - | |
| 10. Integration | 2 | - | - | - | |
| **TOTAL** | **32** | **0** | **0** | **0** | In Progress |

---

## 🔍 Critical Bugs Found

| ID | Severity | Module | Description | Status |
|----|----------|--------|-------------|--------|
| - | - | - | None yet | - |

---

## ✅ Quality Gates

- [ ] All 32 tests pass
- [ ] Zero console errors
- [ ] All RBAC rules enforced
- [ ] Data integrity checks work
- [ ] Loading states on all async operations
- [ ] Responsive on mobile (375px+)
- [ ] No memory leaks
- [ ] Meets WCAG 2.1 Level A accessibility

---

## 🚀 Next Steps After Testing

1. **If All Pass**: Mark as Production Ready ✅
2. **If Failures**: Document bugs, prioritize fixes
3. **Performance Issues**: Optimize queries, add pagination
4. **UX Improvements**: Gather user feedback

---

**Test Plan Version**: 1.0  
**Prepared By**: AI QA Engineer  
**Execution Start**: {{ test_start_time }}
