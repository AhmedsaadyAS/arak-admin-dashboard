/**
 * Clean old seed evaluation records from db.json
 * 
 * This script removes ALL evaluation records from the database,
 * so the GradeBook starts fresh with only data from sheet uploads.
 * 
 * Usage: node scripts/cleanSeedEvaluations.js
 */
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'db.json');

try {
    const raw = fs.readFileSync(dbPath, 'utf-8');
    const db = JSON.parse(raw);

    if (!db.evaluations) {
        console.log('No evaluations collection found in db.json');
        process.exit(0);
    }

    const before = db.evaluations.length;
    db.evaluations = [];

    // Write back
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
    console.log(`✅ Removed ${before} old evaluation records from db.json`);
    console.log('   The evaluations array is now empty.');
    console.log('   Upload sheets via Control → Sheets to populate fresh data.');
} catch (err) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
}
