import { describe, it } from 'vitest';
import { dataIntegrityService } from '../services/dataIntegrityService';

/**
 * Quick diagnostic test to inspect orphaned records
 */
describe('Orphaned Records Diagnostic', () => {
    it('should show detailed orphaned record breakdown', async () => {
        const result = await dataIntegrityService.getOrphanedRecords();

        console.log('\n========== ORPHANED RECORDS REPORT ==========');
        console.log('Total Orphaned:', result.totalCount);
        console.log('\nBreakdown:');
        console.log('  Students:', result.summary.students);
        console.log('  Attendance:', result.summary.attendance);
        console.log('  Evaluations:', result.summary.evaluations);
        console.log('  Tasks:', result.summary.tasks);
        console.log('  Schedules:', result.summary.schedules);

        if (result.summary.students > 0) {
            console.log('\nSample Orphaned Students:');
            result.orphaned.students.slice(0, 3).forEach(s => {
                console.log(`  - Student ${s.id}: ${s.reason}`);
            });
        }

        if (result.summary.attendance > 0) {
            console.log('\nSample Orphaned Attendance:');
            result.orphaned.attendance.slice(0, 3).forEach(a => {
                console.log(`  - Attendance ${a.id}: ${a.reason}`);
            });
        }

        if (result.summary.evaluations > 0) {
            console.log('\nSample Orphaned Evaluations:');
            result.orphaned.evaluations.slice(0, 3).forEach(e => {
                console.log(`  - Evaluation ${e.id}: ${e.reason}`);
            });
        }

        if (result.summary.tasks > 0) {
            console.log('\nSample Orphaned Tasks:');
            result.orphaned.tasks.slice(0, 3).forEach(t => {
                console.log(`  - Task ${t.id}: ${t.reason}`);
            });
        }

        if (result.summary.schedules > 0) {
            console.log('\nSample Orphaned Schedules:');
            result.orphaned.schedules.slice(0, 3).forEach(s => {
                console.log(`  - Schedule ${s.id}: ${s.reason}`);
            });
        }

        console.log('============================================\n');
    });
});
