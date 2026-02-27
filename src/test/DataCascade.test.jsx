import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api } from '../services/api';
import { dataIntegrityService } from '../services/dataIntegrityService';

/**
 * Data Cascade Tests
 * Verify that data modifications properly affect or are blocked by related entities
 * 
 * Tests cascade effects:
 * - Deleting teacher affects students, classes, tasks, schedules
 * - Deleting student affects attendance, evaluations
 * - Modifying foreign keys maintains referential integrity
 */

describe('Data Cascade & Modification Impact Tests', () => {

    describe('Teacher Deletion Impact', () => {
        it('should detect dependencies when deleting a teacher with students', async () => {
            // Get a teacher with students
            const teachers = await api.getTeachers();
            const teacherWithStudents = teachers[0];

            const validation = await dataIntegrityService.validateTeacherReferences(teacherWithStudents.id);

            // Should have dependencies
            expect(validation.canDelete).toBe(false);
            expect(validation.dependencies.students.length).toBeGreaterThan(0);
            expect(validation.message).toContain('student');
        });

        it('should list all dependent entities for a teacher', async () => {
            const teachers = await api.getTeachers();
            const teacherId = teachers[0].id;

            const validation = await dataIntegrityService.validateTeacherReferences(teacherId);

            // Check all dependency types are present
            expect(validation.dependencies).toHaveProperty('students');
            expect(validation.dependencies).toHaveProperty('classes');
            expect(validation.dependencies).toHaveProperty('tasks');
            expect(validation.dependencies).toHaveProperty('schedules');

            // At least one dependency should exist
            expect(validation.dependencies.totalCount).toBeGreaterThan(0);
        });

        it('should calculate total dependency count correctly', async () => {
            const teachers = await api.getTeachers();
            const teacherId = teachers[0].id;

            const validation = await dataIntegrityService.validateTeacherReferences(teacherId);

            const manualCount =
                validation.dependencies.students.length +
                validation.dependencies.classes.length +
                validation.dependencies.tasks.length +
                validation.dependencies.schedules.length;

            expect(validation.dependencies.totalCount).toBe(manualCount);
        });
    });

    describe('Student Deletion Impact', () => {
        it('should detect dependencies when deleting a student with attendance', async () => {
            const students = await api.getStudents({ _limit: 1 });
            const student = students.data[0];

            const validation = await dataIntegrityService.validateStudentReferences(student.id);

            // Most students should have attendance records
            if (validation.dependencies.attendance.length > 0) {
                expect(validation.canDelete).toBe(false);
                expect(validation.message).toContain('attendance');
            }
        });

        it('should detect dependencies when deleting a student with evaluations', async () => {
            const students = await api.getStudents({ _limit: 1 });
            const student = students.data[0];

            const validation = await dataIntegrityService.validateStudentReferences(student.id);

            // Check evaluation dependencies
            if (validation.dependencies.evaluations.length > 0) {
                expect(validation.canDelete).toBe(false);
                expect(validation.message).toContain('evaluation');
            }
        });

        it('should allow deletion of student with no dependencies', async () => {
            // Create a mock student with no dependencies
            const mockStudentId = 999999;

            const validation = await dataIntegrityService.validateStudentReferences(mockStudentId);

            // Should be safe to delete (no dependencies found)
            expect(validation.canDelete).toBe(true);
            expect(validation.dependencies.totalCount).toBe(0);
        });
    });

    describe('Class Deletion Impact', () => {
        it('should detect dependencies when deleting a class with students', async () => {
            const classes = await api.client.get('/classes');
            const classWithStudents = classes.data[0];

            const validation = await dataIntegrityService.validateClassReferences(classWithStudents.id);

            // Should have student dependencies
            expect(validation.dependencies.students).toBeDefined();

            if (validation.dependencies.students.length > 0) {
                expect(validation.canDelete).toBe(false);
                expect(validation.message).toContain('student');
            }
        });

        it('should detect schedule dependencies for a class', async () => {
            const classes = await api.client.get('/classes');
            const classId = classes.data[0].id;

            const validation = await dataIntegrityService.validateClassReferences(classId);

            expect(validation.dependencies).toHaveProperty('schedules');
        });
    });

    describe('Generic Entity Deletion', () => {
        it('should support generic canDeleteEntity for students', async () => {
            const students = await api.getStudents({ _limit: 1 });
            const studentId = students.data[0].id;

            const validation = await dataIntegrityService.canDeleteEntity('student', studentId);

            expect(validation).toHaveProperty('canDelete');
            expect(validation).toHaveProperty('dependencies');
            expect(validation).toHaveProperty('message');
        });

        it('should support generic canDeleteEntity for teachers', async () => {
            const teachers = await api.getTeachers();
            const teacherId = teachers[0].id;

            const validation = await dataIntegrityService.canDeleteEntity('teacher', teacherId);

            expect(validation).toHaveProperty('canDelete');
            expect(validation).toHaveProperty('dependencies');
        });

        it('should support generic canDeleteEntity for classes', async () => {
            const classes = await api.client.get('/classes');
            const classId = classes.data[0].id;

            const validation = await dataIntegrityService.canDeleteEntity('class', classId);

            expect(validation).toHaveProperty('canDelete');
            expect(validation).toHaveProperty('dependencies');
        });

        it('should handle invalid entity type gracefully', async () => {
            const validation = await dataIntegrityService.canDeleteEntity('invalid', 123);

            expect(validation.canDelete).toBe(false);
            expect(validation.message).toContain('Unknown entity type');
        });
    });

    describe('Orphaned Record Detection After Modification', () => {
        it('should detect orphaned records in the system', async () => {
            const result = await dataIntegrityService.getOrphanedRecords();

            expect(result).toHaveProperty('orphaned');
            expect(result).toHaveProperty('totalCount');
            expect(result).toHaveProperty('summary');

            // Verify summary structure
            expect(result.summary).toHaveProperty('students');
            expect(result.summary).toHaveProperty('attendance');
            expect(result.summary).toHaveProperty('evaluations');
            expect(result.summary).toHaveProperty('tasks');
            expect(result.summary).toHaveProperty('schedules');
        });

        it('should detect any orphaned records in the database', async () => {
            const result = await dataIntegrityService.getOrphanedRecords();

            // Database may have orphaned records - this is what we're testing for
            console.log('Orphaned Records Found:', result.totalCount);
            console.log('Breakdown:', result.summary);

            expect(result.totalCount).toBeGreaterThanOrEqual(0);

            // If orphaned records exist, they should be categorized
            if (result.totalCount > 0) {
                expect(result.summary.students).toBeGreaterThanOrEqual(0);
                expect(result.summary.attendance).toBeGreaterThanOrEqual(0);
                expect(result.summary.evaluations).toBeGreaterThanOrEqual(0);
            }
        });

        it('should provide detailed reasons for orphaned records', async () => {
            const result = await dataIntegrityService.getOrphanedRecords();

            // If orphaned records exist, they should have reasons
            if (result.totalCount > 0) {
                const allOrphaned = [
                    ...result.orphaned.students,
                    ...result.orphaned.attendance,
                    ...result.orphaned.evaluations,
                    ...result.orphaned.tasks,
                    ...result.orphaned.schedules
                ];

                allOrphaned.forEach(record => {
                    expect(record).toHaveProperty('reason');
                    expect(record.reason).toMatch(/Invalid (studentId|teacherId|classId)/);
                });
            }
        });
    });

    describe('Reference Validation Before Modification', () => {
        it('should validate that a teacher exists before assignment', async () => {
            const teachers = await api.getTeachers();
            const validTeacherId = teachers[0].id;

            const isValid = await dataIntegrityService.validateReference('teacher', validTeacherId);
            expect(isValid).toBe(true);
        });

        it('should reject invalid teacher reference', async () => {
            const invalidTeacherId = 999999;

            const isValid = await dataIntegrityService.validateReference('teacher', invalidTeacherId);
            expect(isValid).toBe(false);
        });

        it('should validate that a student exists', async () => {
            const students = await api.getStudents({ _limit: 1 });
            const validStudentId = students.data[0].id;

            const isValid = await dataIntegrityService.validateReference('student', validStudentId);
            expect(isValid).toBe(true);
        });

        it('should reject invalid student reference', async () => {
            const invalidStudentId = 999999;

            const isValid = await dataIntegrityService.validateReference('student', invalidStudentId);
            expect(isValid).toBe(false);
        });

        it('should validate that a class exists', async () => {
            const classes = await api.client.get('/classes');
            const validClassId = classes.data[0].id;

            const isValid = await dataIntegrityService.validateReference('class', validClassId);
            expect(isValid).toBe(true);
        });

        it('should reject invalid class reference', async () => {
            const invalidClassId = 999999;

            const isValid = await dataIntegrityService.validateReference('class', invalidClassId);
            expect(isValid).toBe(false);
        });

        it('should handle invalid entity types in validation', async () => {
            const isValid = await dataIntegrityService.validateReference('invalid', 123);
            expect(isValid).toBe(false);
        });

        it('should handle non-numeric IDs gracefully', async () => {
            const isValid = await dataIntegrityService.validateReference('teacher', 'not-a-number');
            expect(isValid).toBe(false);
        });
    });

    describe('Cascade Impact Summary', () => {
        it('should provide meaningful error messages for blocked deletions', async () => {
            const teachers = await api.getTeachers();
            const teacherId = teachers[0].id;

            const validation = await dataIntegrityService.validateTeacherReferences(teacherId);

            if (!validation.canDelete) {
                // Message should be informative
                expect(validation.message).toBeDefined();
                expect(validation.message.length).toBeGreaterThan(0);
                expect(validation.message).not.toBe('Error checking dependencies');
            }
        });

        it('should distinguish between different types of dependencies', async () => {
            const teachers = await api.getTeachers();
            const teacherId = teachers[0].id;

            const validation = await dataIntegrityService.validateTeacherReferences(teacherId);

            // Dependencies should be categorized
            const hasStudents = validation.dependencies.students?.length > 0;
            const hasClasses = validation.dependencies.classes?.length > 0;
            const hasTasks = validation.dependencies.tasks?.length > 0;
            const hasSchedules = validation.dependencies.schedules?.length > 0;

            // At least one should be true for a teacher with dependencies
            if (!validation.canDelete) {
                expect(hasStudents || hasClasses || hasTasks || hasSchedules).toBe(true);
            }
        });
    });
});
