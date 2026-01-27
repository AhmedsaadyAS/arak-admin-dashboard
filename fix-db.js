const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

if (!db.subjects || db.subjects.length === 0) {
    db.subjects = [
        { "id": "1", "name": "Mathematics", "color": "#4D44B5" },
        { "id": "2", "name": "History", "color": "#FB7D5B" },
        { "id": "3", "name": "Physics", "color": "#FCC43E" },
        { "id": "4", "name": "Biology", "color": "#303972" },
        { "id": "5", "name": "English", "color": "#C0C0C0" },
        { "id": "6", "name": "Computer Science", "color": "#22C55E" },
        { "id": "7", "name": "Chemistry", "color": "#F59E0B" }
    ];
    console.log('Fixed: Added subjects to db.json');
} else {
    console.log('Skipped: Subjects already exist');
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
