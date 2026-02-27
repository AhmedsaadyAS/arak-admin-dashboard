const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// 1. Add missing roles
const existingNames = db.roles.map(r => r.name);
const missingRoles = [
    {
        id: '5', name: 'Academic Admin',
        description: 'Academic operations - students, teachers, schedules, grades',
        permissions: ['students_view', 'students_add', 'students_edit', 'teachers_view', 'teachers_add', 'teachers_edit', 'attendance_view', 'attendance_manage', 'gradebook', 'reports_view', 'control_sheets']
    },
    {
        id: '6', name: 'Fees Admin',
        description: 'Financial operations and fee management',
        permissions: ['fees_view', 'fees_add', 'fees_edit', 'students_view', 'reports_view']
    },
    {
        id: '7', name: 'Users Admin',
        description: 'User management - students, teachers, parents',
        permissions: ['students_view', 'students_add', 'students_edit', 'students_delete', 'teachers_view', 'teachers_add', 'teachers_edit', 'teachers_delete', 'users_view', 'users_add', 'users_edit', 'users_delete']
    }
];

let addedCount = 0;
missingRoles.forEach(r => {
    if (!existingNames.includes(r.name)) {
        db.roles.push(r);
        addedCount++;
        console.log('  Added role:', r.name);
    }
});

// 2. Fix any users with role='Unknown'
let fixedCount = 0;
db.users.forEach(u => {
    if (u.role === 'Unknown' || !u.role) {
        const role = db.roles.find(r => String(r.id) === String(u.roleId));
        if (role) {
            u.role = role.name;
            fixedCount++;
            console.log('  Fixed user:', u.name, '->', role.name);
        }
    }
});

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log(`\n✅ Done. Added ${addedCount} roles, fixed ${fixedCount} users.`);
console.log(`   Total roles: ${db.roles.length}`);
