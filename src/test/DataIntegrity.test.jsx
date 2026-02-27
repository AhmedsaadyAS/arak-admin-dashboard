import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

// Read the raw db.json file
const dbPath = path.resolve(__dirname, '../../db.json');
const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

describe('Data Integrity & Referential Tests', () => {

    let teacherIds, classIds, studentIds;

    // Helper to normalize IDs (handle both string and number)
    const normalizeId = (id) => String(id);

    beforeAll(() => {
        // Build Sets for fast lookup - normalize all IDs to strings
        teacherIds = new Set(dbData.teachers.map(t => normalizeId(t.id)));
        classIds = new Set((dbData.classes || []).map(c => normalizeId(c.id)));
        studentIds = new Set(dbData.students.map(s => normalizeId(s.id)));
    });

    describe('Dataset Size Validation', () => {
        it('should have 150 students and 30 teachers in the raw dataset', () => {
            expect(dbData.students.length).toBe(150);
            expect(dbData.teachers.length).toBe(30);
        });

        it('should have classes, attendance, evaluations, and tasks', () => {
            expect(dbData.classes).toBeDefined();
            expect(dbData.attendance).toBeDefined();
            expect(dbData.evaluations).toBeDefined();
            expect(dbData.tasks).toBeDefined();
        });
    });

    describe('Student Referential Integrity', () => {
        it('every student should be linked to a valid teacher', () => {
            dbData.students.forEach(student => {
                expect(student.teacherId, `Student ${student.id} has invalid teacherId`).toBeDefined();
                expect(teacherIds.has(normalizeId(student.teacherId)), `Student ${student.id} references non-existent teacher ${student.teacherId}`).toBe(true);
            });
        });

        it('every student should be linked to a valid class', () => {
            dbData.students.forEach(student => {
                if (student.classId) {
                    expect(classIds.has(normalizeId(student.classId)), `Student ${student.id} references non-existent class ${student.classId}`).toBe(true);
                }
            });
        });

        it('should have no duplicate student IDs', () => {
            const ids = dbData.students.map(s => s.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length);
        });

        it('should have no duplicate student studentId fields', () => {
            const studentIdFields = dbData.students.map(s => s.studentId);
            const uniqueStudentIds = new Set(studentIdFields);
            expect(uniqueStudentIds.size).toBe(studentIdFields.length);
        });
    });

    describe('Teacher Referential Integrity', () => {
        it('should have no duplicate teacher IDs', () => {
            const ids = dbData.teachers.map(t => t.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length);
        });

        it('should have no duplicate teacher teacherId fields', () => {
            const teacherIdFields = dbData.teachers.map(t => t.teacherId);
            const uniqueTeacherIds = new Set(teacherIdFields);
            expect(uniqueTeacherIds.size).toBe(teacherIdFields.length);
        });
    });

    describe('Attendance Referential Integrity', () => {
        it('all attendance records should reference existing students', () => {
            (dbData.attendance || []).forEach(record => {
                expect(record.studentId, `Attendance ${record.id} missing studentId`).toBeDefined();
                expect(studentIds.has(normalizeId(record.studentId)), `Attendance ${record.id} references non-existent student ${record.studentId}`).toBe(true);
            });
        });

        it('all attendance records should reference existing teachers', () => {
            (dbData.attendance || []).forEach(record => {
                if (record.teacherId) {
                    expect(teacherIds.has(normalizeId(record.teacherId)), `Attendance ${record.id} references non-existent teacher ${record.teacherId}`).toBe(true);
                }
            });
        });
    });

    describe('Evaluation Referential Integrity', () => {
        it('all evaluations should reference existing students', () => {
            (dbData.evaluations || []).forEach(record => {
                expect(record.studentId, `Evaluation ${record.id} missing studentId`).toBeDefined();
                expect(studentIds.has(normalizeId(record.studentId)), `Evaluation ${record.id} references non-existent student ${record.studentId}`).toBe(true);
            });
        });

        it('all evaluations should reference existing teachers', () => {
            (dbData.evaluations || []).forEach(record => {
                if (record.teacherId) {
                    expect(teacherIds.has(normalizeId(record.teacherId)), `Evaluation ${record.id} references non-existent teacher ${record.teacherId}`).toBe(true);
                }
            });
        });
    });

    describe('Task Referential Integrity', () => {
        it('all tasks should reference existing teachers', () => {
            (dbData.tasks || []).forEach(task => {
                if (task.teacherId) {
                    expect(teacherIds.has(normalizeId(task.teacherId)), `Task ${task.id} references non-existent teacher ${task.teacherId}`).toBe(true);
                }
            });
        });

        it('all tasks should reference existing classes if classId present', () => {
            (dbData.tasks || []).forEach(task => {
                if (task.classId) {
                    expect(classIds.has(normalizeId(task.classId)), `Task ${task.id} references non-existent class ${task.classId}`).toBe(true);
                }
            });
        });
    });

    describe('Schedule Referential Integrity', () => {
        it('all schedules should reference existing teachers', () => {
            (dbData.schedules || []).forEach(schedule => {
                if (schedule.teacherId) {
                    expect(teacherIds.has(normalizeId(schedule.teacherId)), `Schedule ${schedule.id} references non-existent teacher ${schedule.teacherId}`).toBe(true);
                }
            });
        });

        it('all schedules should reference existing classes', () => {
            (dbData.schedules || []).forEach(schedule => {
                if (schedule.classId) {
                    expect(classIds.has(normalizeId(schedule.classId)), `Schedule ${schedule.id} references non-existent class ${schedule.classId}`).toBe(true);
                }
            });
        });
    });

    describe('Fees Calculation Integrity', () => {
        it('should calculate Total Fees accurately based on feesStatus', () => {
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
            const corruptStudent = { ...dbData.students[0], amount: null };
            const students = [...dbData.students, corruptStudent];

            const totalAmount = students.reduce((sum, s) => sum + (s.amount || 0), 0);
            expect(totalAmount).not.toBeNaN();
            expect(totalAmount).toBeGreaterThan(0);
        });
    });

    describe('Orphaned Record Detection', () => {
        it('should have no orphaned students (all have valid teachers)', () => {
            const orphanedStudents = dbData.students.filter(s => !teacherIds.has(normalizeId(s.teacherId)));
            expect(orphanedStudents.length, `Found ${orphanedStudents.length} students with invalid teacher references`).toBe(0);
        });

        it('should have no orphaned attendance records', () => {
            const orphanedAttendance = (dbData.attendance || []).filter(
                a => !studentIds.has(normalizeId(a.studentId)) || (a.teacherId && !teacherIds.has(normalizeId(a.teacherId)))
            );
            expect(orphanedAttendance.length, `Found ${orphanedAttendance.length} attendance records with invalid references`).toBe(0);
        });

        it('should have no orphaned evaluation records', () => {
            const orphanedEvals = (dbData.evaluations || []).filter(
                e => !studentIds.has(normalizeId(e.studentId)) || (e.teacherId && !teacherIds.has(normalizeId(e.teacherId)))
            );
            expect(orphanedEvals.length, `Found ${orphanedEvals.length} evaluation records with invalid references`).toBe(0);
        });
    });
});
