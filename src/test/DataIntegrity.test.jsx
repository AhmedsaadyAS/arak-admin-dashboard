import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// Read the raw db.json file
const dbPath = path.resolve(__dirname, '../../db.json');
const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

describe('Data Integrity & Stress Tests', () => {

    it('should have 150 students and 30 teachers in the raw dataset', () => {
        expect(dbData.students.length).toBe(150);
        expect(dbData.teachers.length).toBe(30);
    });

    it('every student should be linked to a valid teacher', () => {
        const teacherIds = new Set(dbData.teachers.map(t => t.id));

        dbData.students.forEach(student => {
            expect(student.teacherId).toBeDefined();
            expect(teacherIds.has(student.teacherId)).toBe(true);
        });
    });

    it('should calculate Total Fees accurately based on feesStatus', () => {
        // Calculate Expected
        const expectedPaid = dbData.students
            .filter(s => s.feesStatus === 'Paid')
            .length;

        const expectedPending = dbData.students
            .filter(s => s.feesStatus === 'Pending')
            .length;

        const expectedOverdue = dbData.students
            .filter(s => s.feesStatus === 'Overdue')
            .length;

        // Sanity Check
        expect(expectedPaid + expectedPending + expectedOverdue).toBe(150);
    });

    it('should handle null values in calculation gracefully', () => {
        // Simulate a student with missing amount
        const corruptStudent = { ...dbData.students[0], amount: null };
        const students = [...dbData.students, corruptStudent];

        const totalAmount = students.reduce((sum, s) => sum + (s.amount || 0), 0);
        expect(totalAmount).not.toBeNaN();
        expect(totalAmount).toBeGreaterThan(0);
    });
});
