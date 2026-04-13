/**
 * ARAK Admin — Data Seed Script
 * 
 * Reads db.backup.json and seeds all entities into the .NET backend
 * via the REST API in the correct dependency order.
 * 
 * Usage:
 *   node scripts/seed.js
 *   node scripts/seed.js --skip-users
 *   node scripts/seed.js --dry-run
 * 
 * Environment:
 *   API_BASE_URL  — defaults to http://localhost:5000/api
 *   ADMIN_EMAIL   — defaults to admin@arak.com
 *   ADMIN_PASSWORD— defaults to Admin@123
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKUP_PATH = path.join(__dirname, '..', 'db.backup.json');

// ── Config ────────────────────────────────────────────────────────────────────
const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@arak.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';

const DRY_RUN = process.argv.includes('--dry-run');
const SKIP_USERS = process.argv.includes('--skip-users');

// ── Helpers ───────────────────────────────────────────────────────────────────
let authToken = '';
let stats = { created: 0, skipped: 0, errors: 0 };

const dayMap = {
    'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
    'Thursday': 4, 'Friday': 5, 'Saturday': 6
};

function log(msg, type = 'info') {
    const colors = { info: '\x1b[36m', ok: '\x1b[32m', warn: '\x1b[33m', err: '\x1b[31m', reset: '\x1b[0m' };
    const prefix = { info: 'ℹ', ok: '✓', warn: '⚠', err: '✗' }[type] || '•';
    console.log(`${colors[type] || colors.info}[${prefix}] ${msg}${colors.reset}`);
}

async function api(method, endpoint, body = null) {
    const url = `${API_BASE}${endpoint}`;
    const headers = { 'Content-Type': 'application/json' };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    try {
        const res = await fetch(url, opts);
        const data = await res.json().catch(() => null);

        if (!res.ok) {
            const msg = data?.message || data?.title || res.statusText;
            const bodyStr = JSON.stringify(data);
            // 409 Conflict = already exists or dependency block
            if (res.status === 409) return { skipped: true, data };
            // 400 = validation error (possibly duplicate / already exists)
            if (res.status === 400 && (
                msg?.toLowerCase().includes('unique') ||
                msg?.toLowerCase().includes('already') ||
                bodyStr.toLowerCase().includes('already taken') ||
                bodyStr.toLowerCase().includes('duplicate')
            )) return { skipped: true, data };
            throw new Error(`${method} ${endpoint} → ${res.status}: ${msg}`);
        }
        return { data };
    } catch (err) {
        if (err.code === 'ECONNREFUSED') {
            throw new Error(`Cannot connect to ${API_BASE}. Is the backend running?`);
        }
        throw err;
    }
}

async function login() {
    log(`Logging in as ${ADMIN_EMAIL}...`);
    const { data } = await api('POST', '/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    if (!data?.token) throw new Error('Login failed — no token returned');
    authToken = data.token;
    log(`Logged in as ${data.user?.name || data.user?.email} (${data.user?.role})`, 'ok');
}

async function seedSubjects(subjects) {
    log(`Seeding ${subjects.length} subjects...`);
    for (const s of subjects) {
        try {
            const body = { name: s.name, code: s.code || null };
            if (DRY_RUN) { log(`[DRY] POST /subjects ${JSON.stringify(body)}`, 'warn'); stats.skipped++; continue; }
            await api('POST', '/subjects', body);
            stats.created++;
        } catch (err) {
            log(`Subject "${s.name}": ${err.message}`, 'err');
            stats.errors++;
        }
    }
}

async function seedClasses(classes) {
    log(`Seeding ${classes.length} classes...`);
    for (const c of classes) {
        try {
            const stage = (c.stage || c.stageLabel || '').toLowerCase();
            const body = {
                name: c.name,
                grade: c.gradeLevel ? `Grade ${c.gradeLevel}` : (c.grade || null),
                stage: stage || null,
                description: c.description || null,
            };
            if (DRY_RUN) { log(`[DRY] POST /classes ${JSON.stringify(body)}`, 'warn'); stats.skipped++; continue; }
            await api('POST', '/classes', body);
            stats.created++;
        } catch (err) {
            log(`Class "${c.name}": ${err.message}`, 'err');
            stats.errors++;
        }
    }
}

async function seedUsers(users) {
    if (SKIP_USERS) { log('Skipping users (--skip-users)', 'warn'); return; }
    log(`Seeding ${users.length} user accounts...`);
    for (const u of users) {
        try {
            const body = {
                name: u.name,
                email: u.email,
                password: u.password && u.password.length >= 6 ? (/[A-Z]/.test(u.password) ? u.password : 'Admin@123') : 'User@123',
                role: u.role || 'Teacher',
            };
            if (DRY_RUN) { log(`[DRY] POST /users ${JSON.stringify({ name: u.name, email: u.email, role: u.role })}`, 'warn'); stats.skipped++; continue; }
            await api('POST', '/users', body);
            stats.created++;
        } catch (err) {
            // Skip if user already exists (email unique constraint)
            if (err.message.includes('409') || err.message.includes('unique') || err.message.includes('already')) {
                stats.skipped++;
                continue;
            }
            log(`User "${u.name}": ${err.message}`, 'err');
            stats.errors++;
        }
    }
}

async function seedTeachers(teachers, users) {
    log(`Seeding ${teachers.length} teachers...`);
    // Build a map of user email → role for linking
    const userByEmail = {};
    for (const u of users) userByEmail[u.email.toLowerCase()] = u;

    for (const t of teachers) {
        try {
            const body = {
                name: t.name,
                email: t.email,
                phoneNumber: t.phone || null,
                subjectId: t.subjectId || null,
                assignedClasses: t.assignedClasses || [],
            };
            if (DRY_RUN) { log(`[DRY] POST /teachers ${JSON.stringify(body)}`, 'warn'); stats.skipped++; continue; }
            await api('POST', '/teachers', body);
            stats.created++;
        } catch (err) {
            if (err.message.includes('409') || err.message.includes('unique') || err.message.includes('already') || err.message.includes('Duplicate')) {
                stats.skipped++;
                continue;
            }
            log(`Teacher "${t.name}": ${err.message}`, 'err');
            stats.errors++;
        }
    }
}

async function seedStudents(students) {
    log(`Seeding ${students.length} students...`);
    for (const s of students) {
        try {
            const body = {
                studentId: s.studentId || `STU-${s.id || Math.random().toString(36).slice(2, 6)}`,
                name: s.name,
                userName: s.userName || s.name,
                password: 'Student@123',
                age: s.age || 10,
                email: s.email || `student_${s.id || Math.random().toString(36).slice(2, 6)}@arak.com`,
                dateOfBirth: s.dateOfBirth || '2015-01-01',
                placeOfBirth: s.placeOfBirth || '',
                address: s.address || '',
                city: s.city || '',
                phoneNumber: s.phone || '',
                grade: s.grade || s.className || '',
                status: s.status || 'Active',
                image: s.image || null,
                classId: s.classId || null,
                parentId: s.parentId || null,
            };
            if (DRY_RUN) { log(`[DRY] POST /students ${JSON.stringify({ studentId: s.studentId, name: s.name })}`, 'warn'); stats.skipped++; continue; }
            await api('POST', '/students', body);
            stats.created++;
        } catch (err) {
            if (err.message.includes('409') || err.message.includes('unique') || err.message.includes('already')) {
                stats.skipped++;
                continue;
            }
            log(`Student "${s.name}": ${err.message}`, 'err');
            stats.errors++;
        }
    }
}

async function seedParents(parents) {
    log(`Seeding ${parents.length} parents...`);
    for (const p of parents) {
        try {
            const body = {
                name: p.parentName || p.name || 'Parent',
                email: p.email || `parent_${p.id || Math.random().toString(36).slice(2, 6)}@arak.com`,
                phone: p.phone || null,
                address: p.address || null,
            };
            if (DRY_RUN) { log(`[DRY] POST /parents ${JSON.stringify(body)}`, 'warn'); stats.skipped++; continue; }
            await api('POST', '/parents', body);
            stats.created++;
        } catch (err) {
            if (err.message.includes('409') || err.message.includes('unique') || err.message.includes('already')) {
                stats.skipped++;
                continue;
            }
            log(`Parent "${p.parentName || p.name}": ${err.message}`, 'err');
            stats.errors++;
        }
    }
}

async function seedSchedules(schedules) {
    log(`Seeding ${schedules.length} schedule entries...`);
    for (const s of schedules) {
        try {
            const dayNum = dayMap[s.day] ?? 0;
            const body = {
                classId: s.classId,
                teacherId: s.teacherId,
                subjectId: s.subjectId,
                dayOfWeek: dayNum,
                startTime: s.startTime || '08:00',
                endTime: s.endTime || '09:00',
                location: s.room || `Room ${s.classId}`,
            };
            if (DRY_RUN) { log(`[DRY] POST /schedules ${JSON.stringify(body)}`, 'warn'); stats.skipped++; continue; }
            await api('POST', '/schedules', body);
            stats.created++;
        } catch (err) {
            if (err.message.includes('409') || err.message.includes('unique') || err.message.includes('already')) {
                stats.skipped++;
                continue;
            }
            log(`Schedule (class ${s.classId}, day ${s.day}): ${err.message}`, 'err');
            stats.errors++;
        }
    }
}

async function seedEvaluations(evaluations) {
    log(`Seeding ${evaluations.length} evaluation records...`);
    let batchCount = 0;
    for (const e of evaluations) {
        try {
            const body = {
                studentId: e.studentId,
                classId: e.classId,
                subjectId: e.subjectId,
                assessmentType: e.assessmentType || 'Final',
                marks: e.marks ?? 0,
                maxMarks: e.maxMarks ?? 100,
                feedback: e.feedback || null,
                date: e.date || new Date().toISOString().split('T')[0],
                isAbsent: e.isAbsent || false,
                semesterId: e.termId || null,
            };
            if (DRY_RUN) { log(`[DRY] POST /evaluations (student ${e.studentId}, subject ${e.subjectId})`, 'warn'); stats.skipped++; continue; }
            await api('POST', '/evaluations', body);
            stats.created++;
            batchCount++;
            if (batchCount % 100 === 0) log(`  ... ${batchCount} evaluations seeded`, 'info');
        } catch (err) {
            if (err.message.includes('409') || err.message.includes('unique') || err.message.includes('already')) {
                stats.skipped++;
                continue;
            }
            // Don't log every single evaluation error — too noisy
            stats.errors++;
        }
    }
    log(`  Total evaluations processed: ${batchCount}`, 'ok');
}

async function seedEvents(events) {
    log(`Seeding ${events.length} events...`);
    for (const e of events) {
        try {
            const typeMap = { 'Exam': 'Exam', 'Holiday': 'Holiday', 'Meeting': 'Meeting', 'Activity': 'Sports', 'Sports': 'Sports', 'Cultural': 'Cultural' };
            const body = {
                title: e.title,
                type: typeMap[e.type] || 'Meeting',
                date: e.date,
                startTime: e.startTime || '08:00',
                endTime: e.endTime || '15:00',
                description: e.description || null,
            };
            if (DRY_RUN) { log(`[DRY] POST /events ${JSON.stringify(body)}`, 'warn'); stats.skipped++; continue; }
            await api('POST', '/events', body);
            stats.created++;
        } catch (err) {
            if (err.message.includes('409') || err.message.includes('unique') || err.message.includes('already')) {
                stats.skipped++;
                continue;
            }
            log(`Event "${e.title}": ${err.message}`, 'err');
            stats.errors++;
        }
    }
}

async function seedTasks(tasks) {
    log(`Seeding ${tasks.length} tasks...`);
    for (const t of tasks) {
        try {
            if (!t.teacherId) { stats.skipped++; continue; }
            const statusMap = { 'In Progress': 'Pending', 'Completed': 'Completed', 'Pending': 'Pending', 'Overdue': 'Overdue' };
            const body = {
                title: t.title,
                description: t.description || '',
                teacherId: t.teacherId,
                classId: t.classId || null,
                subjectId: t.subjectId || null,
                deadline: t.dueDate || new Date().toISOString().split('T')[0],
                state: statusMap[t.status] || 'Pending',
            };
            if (DRY_RUN) { log(`[DRY] POST /tasks ${JSON.stringify(body)}`, 'warn'); stats.skipped++; continue; }
            await api('POST', '/tasks', body);
            stats.created++;
        } catch (err) {
            if (err.message.includes('409') || err.message.includes('unique') || err.message.includes('already')) {
                stats.skipped++;
                continue;
            }
            log(`Task "${t.title}": ${err.message}`, 'err');
            stats.errors++;
        }
    }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
    log('═══════════════════════════════════════════════');
    log('  ARAK Admin — Data Seeder');
    log('═══════════════════════════════════════════════');
    log(`API: ${API_BASE}`);
    log(`Dry Run: ${DRY_RUN}`);
    log(`Skip Users: ${SKIP_USERS}`);
    log('');

    // 1. Load backup data
    if (!fs.existsSync(BACKUP_PATH)) {
        log(`Backup file not found: ${BACKUP_PATH}`, 'err');
        process.exit(1);
    }
    const data = JSON.parse(fs.readFileSync(BACKUP_PATH, 'utf-8'));
    log(`Loaded backup: ${Object.keys(data).filter(k => Array.isArray(data[k])).length} collections`);

    // 2. Login
    try {
        await login();
    } catch (err) {
        log(`Login failed: ${err.message}`, 'err');
        log('Make sure the backend is running and the admin account exists.', 'warn');
        process.exit(1);
    }

    if (DRY_RUN) log('\n── DRY RUN MODE — no data will be written ──\n', 'warn');

    // 3. Seed in dependency order
    //    Subjects → Classes → Users → Teachers → Parents → Students → Schedules → Evaluations → Events → Tasks

    await seedSubjects(data.subjects || []);
    await seedClasses(data.classes || []);
    await seedUsers(data.users || []);
    await seedTeachers(data.teachers || [], data.users || []);
    await seedParents(data.parents || []);
    await seedStudents(data.students || []);
    await seedSchedules(data.schedules || []);
    await seedEvaluations(data.evaluations || []);
    await seedEvents(data.events || []);
    await seedTasks(data.tasks || []);

    // 4. Summary
    log('');
    log('═══════════════════════════════════════════════');
    log('  Seed Complete');
    log('═══════════════════════════════════════════════');
    log(`  Created : ${stats.created}`, 'ok');
    log(`  Skipped : ${stats.skipped}`, 'warn');
    log(`  Errors  : ${stats.errors}`, stats.errors > 0 ? 'err' : 'ok');
    log('═══════════════════════════════════════════════');

    if (stats.errors > 0) {
        log('\nSome records failed to seed. Check errors above.', 'warn');
        process.exit(1);
    }
}

main().catch(err => {
    log(`Fatal: ${err.message}`, 'err');
    if (err.stack) console.error(err.stack);
    process.exit(1);
});
