/**
 * fix_db_integrity.cjs
 * 
 * One-time cleanup script for db.json.
 * Fixes the denormalized student-parent data so the frontend works with clean data.
 * 
 * Usage:  node scripts/fix_db_integrity.cjs
 * 
 * What it does:
 *   1. Creates db.backup.json
 *   2. Deletes the orphaned studentParents table
 *   3. Syncs parents → students (parentId, parentName, parentEmail, parentPhone)
 *   4. Nullifies parent fields for students not linked to any parent
 *   5. Writes the cleaned db.json
 */

const fs = require('fs');
const path = require('path');

const DB_PATH = path.resolve(__dirname, '..', 'db.json');
const BACKUP_PATH = path.resolve(__dirname, '..', 'db.backup.json');

// ── Helpers ──────────────────────────────────────────────────────────────────

const log = (icon, msg) => console.log(`  ${icon}  ${msg}`);

function loadDb() {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
}

function saveDb(db) {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

function backup() {
    fs.copyFileSync(DB_PATH, BACKUP_PATH);
    log('💾', `Backup created → ${path.basename(BACKUP_PATH)}`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

function main() {
    console.log('\n╔══════════════════════════════════════════╗');
    console.log('║   db.json Integrity Fix                  ║');
    console.log('╚══════════════════════════════════════════╝\n');

    // 1. Backup
    backup();

    // 2. Load
    const db = loadDb();
    const students = db.students || [];
    const parents = db.parents || [];

    log('📊', `Loaded ${students.length} students, ${parents.length} parents`);

    // 3. Delete orphaned studentParents table
    if (db.studentParents) {
        const count = db.studentParents.length;
        delete db.studentParents;
        log('🗑️ ', `Deleted studentParents table (${count} orphaned rows)`);
    }

    // 4. Build a lookup: studentId → parent record
    //    A student can only belong to ONE parent in this denormalized model.
    const studentToParent = new Map();

    parents.forEach(parent => {
        if (!Array.isArray(parent.linkedStudents)) return;

        // Normalize IDs to strings for consistent comparison
        parent.linkedStudents = parent.linkedStudents.map(id => {
            // Keep the original type but remember string version for lookup
            return id;
        });

        parent.linkedStudents.forEach(studentId => {
            const key = String(studentId);
            if (studentToParent.has(key)) {
                log('⚠️ ', `Student ${key} claimed by multiple parents: ${studentToParent.get(key).parentName} AND ${parent.parentName}. Using last.`);
            }
            studentToParent.set(key, parent);
        });
    });

    // 5. Sync: update each student's denormalized parent fields
    let synced = 0;
    let orphaned = 0;

    students.forEach(student => {
        const key = String(student.id);
        const parent = studentToParent.get(key);

        if (parent) {
            // Student IS linked to a parent — sync denormalized fields
            student.parentId = parent.id;
            student.parentName = parent.parentName || null;
            student.parentEmail = parent.email || null;
            student.parentPhone = parent.phone || null;
            synced++;
        } else {
            // Student is NOT linked to any parent — clear their fields
            student.parentId = null;
            student.parentName = null;
            student.parentEmail = null;
            student.parentPhone = null;
            orphaned++;
        }
    });

    log('🔗', `Synced ${synced} students to their parent records`);
    log('🚫', `Cleared parent fields on ${orphaned} orphan students`);

    // 6. Validate linkedStudents arrays (remove IDs that don't exist)
    let removedBadIds = 0;
    const validStudentIds = new Set(students.map(s => String(s.id)));

    parents.forEach(parent => {
        if (!Array.isArray(parent.linkedStudents)) {
            parent.linkedStudents = [];
            return;
        }

        const before = parent.linkedStudents.length;
        parent.linkedStudents = parent.linkedStudents.filter(id => validStudentIds.has(String(id)));
        const removed = before - parent.linkedStudents.length;
        if (removed > 0) {
            log('🧹', `Removed ${removed} invalid student IDs from parent "${parent.parentName}"`);
            removedBadIds += removed;
        }
    });

    if (removedBadIds > 0) {
        log('🧹', `Total invalid IDs removed from linkedStudents: ${removedBadIds}`);
    }

    // 7. Write cleaned data
    db.students = students;
    db.parents = parents;
    saveDb(db);
    log('✅', `Saved clean db.json`);

    // 8. Summary
    console.log('\n┌──────────────────────────────────────────┐');
    console.log('│  Summary                                 │');
    console.log('├──────────────────────────────────────────┤');
    console.log(`│  Students synced:        ${String(synced).padStart(3)}              │`);
    console.log(`│  Orphan students:        ${String(orphaned).padStart(3)}              │`);
    console.log(`│  Invalid IDs removed:    ${String(removedBadIds).padStart(3)}              │`);
    console.log(`│  studentParents table:   DELETED          │`);
    console.log('└──────────────────────────────────────────┘\n');
}

try {
    main();
} catch (err) {
    console.error('\n❌ Script failed:', err.message);
    console.error(err.stack);
    process.exit(1);
}
