/**
 * seed_relational_db.cjs
 * 
 * Generates a fully normalized db.json with:
 *   - Integer IDs everywhere
 *   - Subjects table with id + code
 *   - Classes with stage (PRIMARY / PREP / SECONDARY)
 *   - Teachers linked to subjects via subjectId
 *   - Students linked to classes and parents
 *   - Evaluations with assessmentType
 *   - Schedule slots with teacher→subject consistency
 *   - Attendance records
 * 
 * Usage:  node scripts/seed_relational_db.cjs
 */

const fs = require('fs');
const path = require('path');

const DB_PATH = path.resolve(__dirname, '..', 'db.json');
const BACKUP_PATH = path.resolve(__dirname, '..', 'db.backup.json');

// ═══════════════════════════════════════════════════════════════════
//  CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

const ASSESSMENT_TYPES = ['Quiz', 'Weekly Task', 'Midterm', 'Final', 'Assignment', 'Project'];

const STAGES = {
    PRIMARY: { key: 'PRIMARY', label: 'Primary', labelAr: 'ابتدائي', grades: [4, 5, 6] },
    PREP: { key: 'PREP', label: 'Preparatory', labelAr: 'إعدادي', grades: [7, 8, 9] },
    SECONDARY: { key: 'SECONDARY', label: 'Secondary', labelAr: 'ثانوي', grades: [10, 11, 12] },
};

// ─── SUBJECTS ─────────────────────────────────────────────────────
// Full catalog of all subjects across all grades
const SUBJECTS = [
    { id: 1, name: 'Mathematics', nameAr: 'رياضيات', code: 'MATH', color: '#4D44B5' },
    { id: 2, name: 'Arabic', nameAr: 'لغة عربية', code: 'ARAB', color: '#FB7D5B' },
    { id: 3, name: 'English', nameAr: 'لغة إنجليزية', code: 'ENG', color: '#FCC43E' },
    { id: 4, name: 'Science', nameAr: 'علوم', code: 'SCI', color: '#00B69B' },
    { id: 5, name: 'Social Studies', nameAr: 'دراسات اجتماعية', code: 'SOC', color: '#303972' },
    { id: 6, name: 'Religious Ed', nameAr: 'تربية دينية', code: 'REL', color: '#9B59B6' },
    { id: 7, name: 'Arts', nameAr: 'تربية فنية', code: 'ART', color: '#E74C3C' },
    { id: 8, name: 'Physical Ed', nameAr: 'تربية رياضية', code: 'PE', color: '#27AE60' },
    { id: 9, name: 'Computer Science', nameAr: 'حاسب آلي', code: 'CS', color: '#2980B9' },
    { id: 10, name: 'Physics', nameAr: 'فيزياء', code: 'PHYS', color: '#E67E22' },
    { id: 11, name: 'Chemistry', nameAr: 'كيمياء', code: 'CHEM', color: '#1ABC9C' },
    { id: 12, name: 'Biology', nameAr: 'أحياء', code: 'BIO', color: '#2ECC71' },
    { id: 13, name: 'History', nameAr: 'تاريخ', code: 'HIST', color: '#8E44AD' },
    { id: 14, name: 'Geography', nameAr: 'جغرافيا', code: 'GEO', color: '#16A085' },
    { id: 15, name: 'Philosophy', nameAr: 'فلسفة ومنطق', code: 'PHIL', color: '#D35400' },
    { id: 16, name: 'French', nameAr: 'لغة فرنسية', code: 'FRN', color: '#2C3E50' },
    { id: 17, name: 'Algebra', nameAr: 'جبر', code: 'ALG', color: '#7D3C98' },
    { id: 18, name: 'Geometry', nameAr: 'هندسة', code: 'GEOM', color: '#F39C12' },
];

// ─── PER-GRADE SUBJECT MAPPING ───────────────────────────────────
// Each grade has its own set of subjects following Egyptian curriculum
const GRADE_SUBJECTS = {
    // PRIMARY — Grades 4, 5, 6
    4: [1, 2, 3, 4, 5, 6, 7, 8],           // Math, Arabic, English, Science, Social Studies, Religious Ed, Arts, PE
    5: [1, 2, 3, 4, 5, 6, 7, 8],           // Same as Grade 4
    6: [1, 2, 3, 4, 5, 6, 7, 8, 9],        // + Computer Science

    // PREP — Grades 7, 8, 9  (Science splits into Physics/Chem/Bio at Grade 9)
    7: [1, 2, 3, 4, 5, 6, 9, 7, 8],        // Math, Arabic, English, Science, Social Studies, Religious Ed, CS, Arts, PE
    8: [1, 2, 3, 4, 5, 6, 9, 7, 8],        // Same as Grade 7
    9: [17, 18, 2, 3, 4, 5, 6, 9, 7, 8],   // Algebra, Geometry, Arabic, English, Science, Social, Religious, CS, Arts, PE

    // SECONDARY — Grades 10, 11, 12 (Sciences split out, add Philosophy/French)
    10: [17, 18, 2, 3, 10, 11, 12, 13, 14, 15, 16], // Algebra, Geom, Arabic, English, Physics, Chemistry, Biology, History, Geography, Philosophy, French
    11: [17, 18, 2, 3, 10, 11, 12, 13, 14, 15, 16], // Same as Grade 10
    12: [17, 18, 2, 3, 10, 11, 12, 13, 14, 15, 16], // Same as Grade 10
};

const FIRST_NAMES = [
    'Ahmed', 'Mohamed', 'Omar', 'Ali', 'Youssef', 'Hassan', 'Ibrahim', 'Khaled',
    'Fatma', 'Nour', 'Sara', 'Mona', 'Hana', 'Layla', 'Dina', 'Mariam',
    'Karim', 'Tarek', 'Amr', 'Mostafa', 'Aya', 'Rana', 'Salma', 'Yasmin'
];

const LAST_NAMES = [
    'Hassan', 'Mohamed', 'Ali', 'Ibrahim', 'Mahmoud', 'Abdallah', 'Saeed',
    'Nasser', 'Gamal', 'Farouk', 'Amin', 'Khalil', 'Youssef', 'Osman',
    'Mostafa', 'Salem', 'Shaker', 'Hamed', 'Rizk', 'Tawfik'
];

const DAY_INDICES = [0, 1, 2, 3, 4]; // Sunday=0, Monday=1, ..., Thursday=4
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
const PERIODS = [1, 2, 3, 4, 5, 6];
const ROOMS = [
    'Room 101', 'Room 102', 'Room 103', 'Room 201', 'Room 202', 'Room 203',
    'Room 301', 'Room 302', 'Lab 1', 'Lab 2', 'Lab 3', 'Lab 4'
];

const FEEDBACK_PHRASES = [
    'Excellent work, keep it up!',
    'Good progress, needs more practice',
    'Shows great understanding',
    'Must improve homework quality',
    'Very active in class',
    'Needs to focus more during lessons',
    'Outstanding performance',
    'Steady improvement shown',
    'Could participate more in discussions',
    'Well organized and attentive',
];

// ═══════════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════════

let _idCounters = {};
function nextId(entity) {
    _idCounters[entity] = (_idCounters[entity] || 0) + 1;
    return _idCounters[entity];
}

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(year, month1, month2) {
    const m = randomInt(month1, month2);
    const d = randomInt(1, 28);
    return `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function randomName() {
    return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}

function generateEmail(name) {
    return name.toLowerCase().replace(/\s+/g, '.') + '@arak.edu.eg';
}

function generatePhone() {
    return `+201${randomInt(0, 2)}${String(randomInt(10000000, 99999999))}`;
}

function getStageForGrade(grade) {
    if (grade >= 4 && grade <= 6) return 'PRIMARY';
    if (grade >= 7 && grade <= 9) return 'PREP';
    if (grade >= 10 && grade <= 12) return 'SECONDARY';
    return 'UNKNOWN';
}

/**
 * Get subject IDs for a specific grade level.
 * Each grade has its own curriculum.
 */
function getSubjectsForGrade(gradeLevel) {
    return GRADE_SUBJECTS[gradeLevel] || [1, 2, 3]; // fallback to Math/Arabic/English
}

// ═══════════════════════════════════════════════════════════════════
//  GENERATORS
// ═══════════════════════════════════════════════════════════════════

function generateClasses() {
    const classes = [];
    const sections = ['A', 'B'];

    for (const [stageKey, stageDef] of Object.entries(STAGES)) {
        for (const grade of stageDef.grades) {
            for (const section of sections) {
                classes.push({
                    id: nextId('class'),
                    name: `Grade ${grade}-${section}`,
                    gradeLevel: grade,
                    section: section,
                    stage: stageKey,
                    stageLabel: stageDef.label,
                    stageLabelAr: stageDef.labelAr,
                    subjectIds: getSubjectsForGrade(grade),
                    capacity: 30,
                });
            }
        }
    }
    return classes;
}

function generateTeachers(subjects) {
    const teachers = [];
    // Create 2-3 teachers per subject
    for (const subj of subjects) {
        const count = randomInt(2, 3);
        for (let i = 0; i < count; i++) {
            const name = randomName();
            teachers.push({
                id: nextId('teacher'),
                name: name,
                email: generateEmail(name),
                phone: generatePhone(),
                subjectId: subj.id,
                subjectName: subj.name,
                qualification: pick(['B.Ed', 'M.Ed', 'Ph.D', 'B.Sc + Diploma']),
                experience: randomInt(2, 20),
                status: 'Active',
                joinDate: randomDate(randomInt(2015, 2024), 8, 9),
            });
        }
    }
    return teachers;
}

function generateStudents(classes) {
    const students = [];
    const STUDENTS_PER_CLASS = 8; // Moderate for mock data

    for (const cls of classes) {
        for (let i = 1; i <= STUDENTS_PER_CLASS; i++) {
            const name = randomName();
            const studentId = `STU-${cls.gradeLevel}${cls.section}-${String(i).padStart(2, '0')}`;
            students.push({
                id: nextId('student'),
                studentId: studentId,
                name: name,
                email: generateEmail(name),
                classId: cls.id,
                className: cls.name,
                grade: `Grade ${cls.gradeLevel}`,
                stage: cls.stage,
                dateOfBirth: randomDate(randomInt(2008, 2016), 1, 12),
                gender: pick(['Male', 'Female']),
                status: 'Active',
                enrollmentDate: randomDate(2024, 8, 9),
                seatNumber: i,
                parentId: null,        // Will be linked below
                parentName: null,
                parentEmail: null,
                parentPhone: null,
            });
        }
    }
    return students;
}

function generateParents(students) {
    const parents = [];
    // Group ~2-3 students per parent (siblings)
    const shuffled = [...students].sort(() => Math.random() - 0.5);
    let idx = 0;

    while (idx < shuffled.length) {
        const childCount = Math.min(randomInt(1, 3), shuffled.length - idx);
        const name = randomName();
        const parent = {
            id: nextId('parent'),
            parentName: name,
            email: generateEmail(name),
            phone: generatePhone(),
            role: 'Parent',
            status: 'Active',
            linkedStudents: [],
        };

        for (let c = 0; c < childCount; c++) {
            const student = shuffled[idx + c];
            student.parentId = parent.id;
            student.parentName = parent.parentName;
            student.parentEmail = parent.email;
            student.parentPhone = parent.phone;
            parent.linkedStudents.push(student.id);
        }

        parents.push(parent);
        idx += childCount;
    }

    return parents;
}

function generateEvaluations(students, classes, teachers, subjects) {
    const evaluations = [];
    // Build teacher lookup: subjectId → [teacherIds]
    const teachersBySubject = {};
    teachers.forEach(t => {
        if (!teachersBySubject[t.subjectId]) teachersBySubject[t.subjectId] = [];
        teachersBySubject[t.subjectId].push(t.id);
    });

    for (const student of students) {
        const cls = classes.find(c => c.id === student.classId);
        if (!cls) continue;

        const gradeSubjects = getSubjectsForGrade(cls.gradeLevel);

        // Generate 2-3 evaluations per student per subject
        for (const subjectId of gradeSubjects) {
            const subj = subjects.find(s => s.id === subjectId);
            if (!subj) continue;

            const availableTeachers = teachersBySubject[subjectId] || [];
            if (availableTeachers.length === 0) continue;

            const teacherId = pick(availableTeachers);
            const evalCount = randomInt(2, 3);
            const usedTypes = new Set();

            for (let e = 0; e < evalCount; e++) {
                let type;
                do { type = pick(ASSESSMENT_TYPES); } while (usedTypes.has(type) && usedTypes.size < ASSESSMENT_TYPES.length);
                usedTypes.add(type);

                const maxMarks = type === 'Quiz' ? 20 : type === 'Weekly Task' ? 15 : 100;
                const marks = randomInt(Math.floor(maxMarks * 0.4), maxMarks);

                evaluations.push({
                    id: nextId('evaluation'),
                    studentId: student.id,
                    studentName: student.name,
                    classId: cls.id,
                    teacherId: teacherId,
                    subjectId: subjectId,
                    subject: subj.name,
                    assessmentType: type,
                    marks: marks,
                    maxMarks: maxMarks,
                    feedback: pick(FEEDBACK_PHRASES),
                    date: randomDate(2025, 9, 12),
                    termId: 1,
                });
            }
        }
    }

    return evaluations;
}

function generateSchedules(classes, teachers, subjects) {
    const schedules = [];
    const teachersBySubject = {};
    teachers.forEach(t => {
        if (!teachersBySubject[t.subjectId]) teachersBySubject[t.subjectId] = [];
        teachersBySubject[t.subjectId].push(t);
    });

    // Assign a semi-stable room to each class
    const classRooms = {};
    classes.forEach((cls, idx) => {
        classRooms[cls.id] = ROOMS[idx % ROOMS.length];
    });

    for (const cls of classes) {
        const gradeSubjects = getSubjectsForGrade(cls.gradeLevel);
        const baseRoom = classRooms[cls.id];

        for (const dayIdx of DAY_INDICES) {
            // Assign each period a random subject from this grade's curriculum
            const shuffledSubjects = [...gradeSubjects].sort(() => Math.random() - 0.5);

            for (let p = 0; p < PERIODS.length; p++) {
                const subjectId = shuffledSubjects[p % shuffledSubjects.length];
                const subj = subjects.find(s => s.id === subjectId);
                if (!subj) continue;

                const availableTeachers = teachersBySubject[subjectId] || [];
                if (availableTeachers.length === 0) continue;

                const teacher = pick(availableTeachers);
                const startHour = 8 + PERIODS[p] - 1;

                schedules.push({
                    id: nextId('schedule'),
                    classId: cls.id,
                    className: cls.name,
                    dayOfWeek: dayIdx,
                    startTime: `${String(startHour).padStart(2, '0')}:00`,
                    endTime: `${String(startHour + 1).padStart(2, '0')}:00`,
                    subjectId: subjectId,
                    subjectName: subj.name,
                    teacherId: teacher.id,
                    teacherName: teacher.name,
                    room: baseRoom,
                });
            }
        }
    }

    return schedules;
}

function generateAttendance(students, classes) {
    const attendance = [];
    // Generate 5 days of attendance per student
    const dates = [
        '2025-11-10', '2025-11-11', '2025-11-12', '2025-11-13', '2025-11-14'
    ];

    for (const student of students) {
        for (const date of dates) {
            const status = Math.random() > 0.1 ? 'Present' : (Math.random() > 0.5 ? 'Absent' : 'Late');
            attendance.push({
                id: nextId('attendance'),
                studentId: student.id,
                studentName: student.name,
                classId: student.classId,
                date: date,
                status: status,
                notes: status !== 'Present' ? pick(['Medical leave', 'Family matter', 'No reason given', 'Late bus']) : '',
            });
        }
    }

    return attendance;
}

function generateUsers(teachers, parents) {
    const users = [];

    // Admin user
    users.push({
        id: nextId('user'),
        name: 'Admin User',
        email: 'admin@arak.edu.eg',
        password: 'admin123',
        role: 'Super Admin',
        roleId: 1,
        status: 'Active',
        lastLogin: '2025-11-15 10:30 AM',
        permissions: [
            { module: 'Students', permissions: ['students_view', 'students_add', 'students_edit', 'students_delete'] },
            { module: 'Teachers', permissions: ['teachers_view', 'teachers_add', 'teachers_edit', 'teachers_delete'] },
            { module: 'Classes', permissions: ['classes_view', 'classes_add', 'classes_edit', 'classes_delete'] },
            { module: 'Events', permissions: ['events_view', 'events_add', 'events_edit', 'events_delete'] },
            { module: 'Fees', permissions: ['fees_view', 'fees_add', 'fees_edit', 'fees_delete'] },
            { module: 'User Management', permissions: ['users_view', 'users_add', 'users_edit', 'users_delete'] },
            { module: 'Attendance', permissions: ['attendance_view', 'attendance_manage'] },
            { module: 'Gradebook', permissions: ['gradebook'] },
            { module: 'Reports', permissions: ['reports_view'] },
            { module: 'Control', permissions: ['control_sheets'] },
        ],
    });

    // A few teacher users
    for (const t of teachers.slice(0, 5)) {
        users.push({
            id: nextId('user'),
            name: t.name,
            email: t.email,
            password: 'teacher123',
            role: 'Teacher',
            roleId: 3,
            status: 'Active',
            lastLogin: randomDate(2025, 10, 11) + ' 08:00 AM',
            teacherId: t.id,
            permissions: [
                { module: 'Students', permissions: ['students_view'] },
                { module: 'Attendance', permissions: ['attendance_view', 'attendance_manage'] },
                { module: 'Gradebook', permissions: ['gradebook'] },
            ],
        });
    }

    // A few parent users
    for (const p of parents.slice(0, 5)) {
        users.push({
            id: nextId('user'),
            name: p.parentName,
            email: p.email,
            password: 'parent123',
            role: 'Parent',
            roleId: 4,
            status: 'Active',
            lastLogin: randomDate(2025, 10, 11) + ' 09:00 AM',
            parentId: p.id,
            permissions: [
                { module: 'Students', permissions: ['students_view'] },
                { module: 'Gradebook', permissions: ['gradebook'] },
            ],
        });
    }

    return users;
}

function generateRoles() {
    return [
        {
            id: 1,
            name: 'Super Admin',
            description: 'Full system access',
            permissions: [
                'students_view', 'students_add', 'students_edit', 'students_delete',
                'teachers_view', 'teachers_add', 'teachers_edit', 'teachers_delete',
                'classes_view', 'classes_add', 'classes_edit', 'classes_delete',
                'events_view', 'events_add', 'events_edit', 'events_delete',
                'fees_view', 'fees_add', 'fees_edit', 'fees_delete',
                'users_view', 'users_add', 'users_edit', 'users_delete',
                'attendance_view', 'attendance_manage',
                'gradebook', 'reports_view', 'control_sheets',
            ],
        },
        {
            id: 2,
            name: 'Admin',
            description: 'Administrative access without user management',
            permissions: [
                'students_view', 'students_add', 'students_edit',
                'teachers_view', 'teachers_add', 'teachers_edit',
                'classes_view', 'classes_add', 'classes_edit',
                'events_view', 'events_add', 'events_edit',
                'fees_view', 'fees_add',
                'attendance_view', 'attendance_manage',
                'gradebook', 'reports_view', 'control_sheets',
            ],
        },
        {
            id: 3,
            name: 'Teacher',
            description: 'Teaching staff access',
            permissions: [
                'students_view', 'attendance_view', 'attendance_manage', 'gradebook',
            ],
        },
        {
            id: 4,
            name: 'Parent',
            description: 'Parent/Guardian access',
            permissions: ['students_view', 'gradebook'],
        },
    ];
}

function generateEvents() {
    return [
        { id: nextId('event'), title: 'Mid-Year Exams', date: '2025-12-15', endDate: '2025-12-22', type: 'Exam', description: 'Mid-year examination period for all stages', status: 'Upcoming' },
        { id: nextId('event'), title: 'National Day Celebration', date: '2025-10-06', type: 'Holiday', description: 'October 6th national celebration', status: 'Past' },
        { id: nextId('event'), title: 'Parent-Teacher Conference', date: '2025-11-20', type: 'Meeting', description: 'Bi-annual parent-teacher meeting', status: 'Upcoming' },
        { id: nextId('event'), title: 'Science Fair', date: '2025-12-01', type: 'Activity', description: 'Annual school science fair', status: 'Upcoming' },
        { id: nextId('event'), title: 'Winter Break', date: '2025-12-25', endDate: '2026-01-10', type: 'Holiday', description: 'Winter holiday break', status: 'Upcoming' },
    ];
}

function generateTasks(teachers) {
    const tasks = [];
    const taskTitles = [
        'Prepare lesson plan for next week',
        'Grade midterm papers',
        'Update student progress reports',
        'Organize classroom materials',
        'Attend faculty meeting',
        'Review curriculum updates',
        'Contact parents for progress update',
    ];

    for (const teacher of teachers.slice(0, 10)) {
        const count = randomInt(1, 3);
        for (let i = 0; i < count; i++) {
            tasks.push({
                id: nextId('task'),
                title: pick(taskTitles),
                description: 'Task description placeholder',
                teacherId: teacher.id,
                teacherName: teacher.name,
                status: pick(['Pending', 'In Progress', 'Completed']),
                priority: pick(['Low', 'Medium', 'High']),
                dueDate: randomDate(2025, 11, 12),
                createdAt: randomDate(2025, 10, 11),
            });
        }
    }

    return tasks;
}

// ═══════════════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════════════

function main() {
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║   ARAK Relational Database Seeder               ║');
    console.log('╚══════════════════════════════════════════════════╝\n');

    // Backup existing db.json
    if (fs.existsSync(DB_PATH)) {
        fs.copyFileSync(DB_PATH, BACKUP_PATH);
        console.log(`  💾  Backup → ${path.basename(BACKUP_PATH)}`);
    }

    // Generate all entities
    console.log('  🔨  Generating data...\n');

    const subjects = SUBJECTS;
    console.log(`      Subjects:     ${subjects.length}`);

    const classes = generateClasses();
    console.log(`      Classes:      ${classes.length}`);

    const teachers = generateTeachers(subjects);
    console.log(`      Teachers:     ${teachers.length}`);

    const students = generateStudents(classes);
    console.log(`      Students:     ${students.length}`);

    const parents = generateParents(students);
    console.log(`      Parents:      ${parents.length}`);

    const evaluations = generateEvaluations(students, classes, teachers, subjects);
    console.log(`      Evaluations:  ${evaluations.length}`);

    const schedules = generateSchedules(classes, teachers, subjects);
    console.log(`      Schedules:    ${schedules.length}`);

    const attendance = generateAttendance(students, classes);
    console.log(`      Attendance:   ${attendance.length}`);

    const roles = generateRoles();
    console.log(`      Roles:        ${roles.length}`);

    const users = generateUsers(teachers, parents);
    console.log(`      Users:        ${users.length}`);

    const events = generateEvents();
    console.log(`      Events:       ${events.length}`);

    const tasks = generateTasks(teachers);
    console.log(`      Tasks:        ${tasks.length}`);

    // Assemble the database
    const db = {
        currentUser: { name: 'Admin User', role: 'Super Admin' },
        users,
        roles,
        subjects,
        classes,
        teachers,
        students,
        parents,
        evaluations,
        schedules,
        attendance,
        events,
        tasks,
        metrics: {
            systemHealth: 'Online',
            serverUptime: '99.8%',
            activeUsers: users.length,
            totalStudents: students.length,
            totalTeachers: teachers.length,
            lastUpdated: new Date().toISOString(),
        },
    };

    // Write
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');

    console.log('\n  ✅  db.json written successfully!\n');

    // Summary table
    console.log('  ┌────────────────────┬────────────┐');
    console.log('  │ Entity             │ Count      │');
    console.log('  ├────────────────────┼────────────┤');
    Object.entries(db).forEach(([key, val]) => {
        if (Array.isArray(val)) {
            console.log(`  │ ${key.padEnd(18)} │ ${String(val.length).padStart(10)} │`);
        }
    });
    console.log('  └────────────────────┴────────────┘\n');

    // Integrity checks
    console.log('  🔍  Integrity Checks:');

    // Check teacher-subject consistency in schedules
    let scheduleErrors = 0;
    schedules.forEach(s => {
        const teacher = teachers.find(t => t.id === s.teacherId);
        if (teacher && teacher.subjectId !== s.subjectId) {
            scheduleErrors++;
        }
    });
    console.log(`      Schedule teacher-subject consistency: ${scheduleErrors === 0 ? '✅ PASS' : `❌ ${scheduleErrors} mismatches`}`);

    // Check all student parentIds reference valid parents
    const parentIds = new Set(parents.map(p => p.id));
    let parentErrors = 0;
    students.forEach(s => {
        if (s.parentId && !parentIds.has(s.parentId)) parentErrors++;
    });
    console.log(`      Student-parent FK integrity:          ${parentErrors === 0 ? '✅ PASS' : `❌ ${parentErrors} invalid`}`);

    // Check all IDs are integers
    let stringIdCount = 0;
    Object.entries(db).forEach(([key, val]) => {
        if (Array.isArray(val)) {
            val.forEach(item => {
                if (item.id && typeof item.id === 'string') stringIdCount++;
            });
        }
    });
    console.log(`      All IDs are integers:                 ${stringIdCount === 0 ? '✅ PASS' : `❌ ${stringIdCount} string IDs`}`);

    console.log('\n  🎉  Done!\n');
}

try {
    main();
} catch (err) {
    console.error('\n❌ Seed script failed:', err.message);
    console.error(err.stack);
    process.exit(1);
}
