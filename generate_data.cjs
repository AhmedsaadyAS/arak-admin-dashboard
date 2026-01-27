const fs = require('fs');

const generateData = () => {
    // Arrays to hold data
    const users = [];
    const classes = [];
    const teachers = [];
    const students = [];
    const parents = [];
    const studentParents = [];
    const attendance = [];

    // Helper: Random Date
    const randomDate = (start, end) => {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
    };

    // 1. Generate Classes (Static list for consistency)
    const gradeLevels = ['VII', 'VIII', 'IX'];
    const sections = ['A', 'B', 'C'];
    let classIdCounter = 1;

    gradeLevels.forEach(grade => {
        sections.forEach(section => {
            classes.push({
                id: classIdCounter++,
                name: `${grade} ${section}`, // e.g., "VII A"
                gradeLevel: grade,
                section: section
            });
        });
    });

    // 2. Generate Users (Admin, Teachers, Parents)
    // We'll generate 1 Admin, 30 Teachers, 100 Parents
    let userIdCounter = 1;

    // Admin
    users.push({ id: userIdCounter++, username: 'admin', role: 'Admin', status: 'Active' });

    // 3. Generate Teachers & their Users
    const subjects = ['Math', 'Science', 'History', 'English', 'Arts', 'Physics', 'Chemistry'];

    for (let i = 1; i <= 30; i++) {
        // Teacher User
        const teacherUser = {
            id: userIdCounter++,
            username: `teacher${i}`,
            role: 'Teacher',
            status: 'Active'
        };
        users.push(teacherUser);

        // Assign to 1-2 random classes
        const assignedClasses = [];
        const numClasses = Math.floor(Math.random() * 2) + 1;
        for (let j = 0; j < numClasses; j++) {
            const cls = classes[Math.floor(Math.random() * classes.length)];
            if (!assignedClasses.includes(cls.name)) assignedClasses.push(cls.name);
        }

        teachers.push({
            id: i,
            userId: teacherUser.id, // Link to User
            teacherId: `#T${1000 + i}`,
            name: `Teacher ${i}`,
            subject: subjects[Math.floor(Math.random() * subjects.length)],
            email: `${teacherUser.username}@arak.com`,
            phone: `+62 811 ${Math.floor(Math.random() * 9000) + 1000}`,
            assignedClasses: assignedClasses,
            status: 'Active',
            dateJoined: '2020-01-01'
        });
    }

    // 4. Generate Parents & their Users
    // 100 Parents for 150 Students (some parents have multiple kids)
    for (let i = 1; i <= 100; i++) {
        const parentUser = {
            id: userIdCounter++,
            username: `parent${i}`,
            role: 'Parent',
            status: 'Active'
        };
        users.push(parentUser);

        parents.push({
            id: i,
            userId: parentUser.id,
            name: `Parent ${i}`,
            phone: `+62 812 ${Math.floor(Math.random() * 9000) + 1000}`,
            city: ['Jakarta', 'Bandung', 'Surabaya', 'Bali'][Math.floor(Math.random() * 4)],
            email: `${parentUser.username}@example.com`
        });
    }

    // 5. Generate Students & Links
    const statuses = ['Active', 'Inactive', 'At Risk'];
    const feeStatuses = ['Paid', 'Pending', 'Overdue'];

    for (let i = 1; i <= 150; i++) {
        // Assign to a random Class
        const assignedClass = classes[Math.floor(Math.random() * classes.length)];

        // Pick a primary teacher (Logic: Find a teacher who teaches this class, or random if none)
        // For simplicity/mock: Random teacher from list
        const primaryTeacher = teachers[Math.floor(Math.random() * teachers.length)];

        // Pick a Parent (Random from parents list)
        const parent = parents[Math.floor(Math.random() * parents.length)];

        students.push({
            id: i,
            studentId: `#S${20000 + i}`,
            name: `Student ${i}`,
            email: `student${i}@example.com`,
            classId: assignedClass.id, // FK to Class
            grade: assignedClass.name, // Compatibility Field for Frontend
            teacherId: primaryTeacher.id, // Direct Link Compatibility
            status: statuses[Math.floor(Math.random() * statuses.length)],
            feesStatus: feeStatuses[Math.floor(Math.random() * feeStatuses.length)],
            amount: Math.floor(Math.random() * 500) * 1000,
            parentName: parent.name, // Compatibility Field
            parentPhone: parent.phone, // Compatibility Field
            city: parent.city,
            enrollmentDate: randomDate(new Date(2023, 0, 1), new Date())
        });

        // Link in Join Table
        studentParents.push({
            id: i, // simple ID
            studentId: i,
            parentId: parent.id,
            relation: 'Father' // Mock relation
        });
    }

    // 6. Generate Schedule (TimeTable)
    // Link Class + Teacher + Subject
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const periods = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00'];
    const schedules = [];
    let scheduleIdCounter = 1;

    classes.forEach(cls => {
        // specific teachers for this grade/class? 
        // For mock, just pick random teachers who "can" teach (we already assigned them classes in step 3, let's use that if possible, or just random for coverage)

        days.forEach(day => {
            periods.forEach(time => {
                const teacher = teachers[Math.floor(Math.random() * teachers.length)];
                schedules.push({
                    id: scheduleIdCounter++,
                    classId: cls.id,
                    className: cls.name,
                    teacherId: teacher.id,
                    teacherName: teacher.name,
                    subject: teacher.subject,
                    day: day,
                    time: time
                });
            });
        });
    });

    // 7. Generate Tasks (Assignments)
    // Teachers assign tasks to students (via Class usually, but ERD said Student-Task, let's do Class-based tasks spread to students or just direct links if simplified)
    // The ERD said TEACHERS assign TASKS, STUDENTS receive TASKS.
    const tasks = [];
    let taskIdCounter = 1;

    // Each teacher assigns a few tasks
    teachers.forEach(teacher => {
        for (let k = 0; k < 3; k++) {
            tasks.push({
                id: taskIdCounter++,
                teacherId: teacher.id,
                title: `${teacher.subject} Assignment ${k + 1}`,
                description: `Complete chapter ${k + 1} exercises.`,
                dueDate: randomDate(new Date(), new Date(2026, 3, 1)),
                status: 'Pending'
            });
        }
    });

    // 8. Generate Attendance & Evaluations
    // Random samples
    const evaluations = [];
    let attId = 1;
    let evalId = 1;

    students.forEach(student => {
        // Attendance: 90% Present
        attendance.push({
            id: attId++,
            studentId: student.id,
            teacherId: student.teacherId, // Primary teacher records it
            date: "2026-01-18",
            status: Math.random() > 0.1 ? 'Present' : 'Absent'
        });

        // Evaluation
        evaluations.push({
            id: evalId++,
            studentId: student.id,
            teacherId: student.teacherId,
            subject: 'General',
            marks: Math.floor(Math.random() * 40) + 60, // 60-100
            feedback: "Good progress",
            date: "2026-01-15"
        });
    });

    const db = {
        currentUser: { name: "Admin User", role: "Admin" },
        users,
        classes,
        teachers,
        students,
        parents,
        studentParents,
        schedules,
        tasks,
        attendance,
        evaluations,
        events: [],
        fees: [],
        metrics: {
            totalStudents: students.length,
            totalTeachers: teachers.length,
            systemHealth: "Good",
            serverUptime: "99.99%"
        }
    };

    fs.writeFileSync('db.json', JSON.stringify(db, null, 4));
    console.log(`Successfully generated db.json with:
    - ${users.length} Users
    - ${classes.length} Classes
    - ${teachers.length} Teachers
    - ${students.length} Students
    - ${parents.length} Parents
    - ${studentParents.length} Parent-Student Links`);
};

generateData();
