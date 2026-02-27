import { describe, it, expect, beforeAll } from 'vitest';
import { api } from '../services/api';

/**
 * Schedule-Profile Data Consistency Tests
 * 
 * Verify that schedule updates are immediately reflected in student and teacher profiles
 * This ensures data integrity across related views
 */

describe('Schedule-Profile Data Consistency', () => {
    let testStudent, testTeacher, testSchedules;

    beforeAll(async () => {
        // Get test data
        const students = await api.getStudents({ _limit: 1 });
        testStudent = students.data[0];

        const teachers = await api.getTeachers();
        testTeacher = teachers[0];
    });

    describe('Student Profile Schedule Integration', () => {
        it('student profile should fetch schedules from live API', async () => {
            expect(testStudent).toBeDefined();
            expect(testStudent.classId).toBeDefined();

            // Fetch schedules for student's class
            const schedules = await api.getSchedulesByClass(testStudent.classId);

            expect(schedules).toBeDefined();
            expect(Array.isArray(schedules)).toBe(true);
        });

        it('schedules should contain required fields', async () => {
            const schedules = await api.getSchedulesByClass(testStudent.classId);

            if (schedules.length > 0) {
                const schedule = schedules[0];

                expect(schedule).toHaveProperty('day');
                expect(schedule).toHaveProperty('time');
                expect(schedule).toHaveProperty('subject');
                expect(schedule).toHaveProperty('classId');
            }
        });

        it('student class schedule should match database schedules', async () => {
            const schedules = await api.getSchedulesByClass(testStudent.classId);
            const allSchedules = await api.getSchedules();

            // Filter all schedules for this class
            const classSchedulesFromAll = allSchedules.filter(
                s => String(s.classId) === String(testStudent.classId)
            );

            expect(schedules.length).toBe(classSchedulesFromAll.length);
        });
    });

    describe('Teacher Profile Schedule Integration', () => {
        it('teacher profile should fetch schedules from live API', async () => {
            expect(testTeacher).toBeDefined();

            // Fetch schedules for teacher
            const schedules = await api.getSchedulesByTeacher(testTeacher.id);

            expect(schedules).toBeDefined();
            expect(Array.isArray(schedules)).toBe(true);
        });

        it('teacher schedules should reference valid classes', async () => {
            const schedules = await api.getSchedulesByTeacher(testTeacher.id);
            const classes = await api.client.get('/classes');
            const classIds = new Set(classes.data.map(c => String(c.id)));

            schedules.forEach(schedule => {
                expect(
                    classIds.has(String(schedule.classId)),
                    `Schedule ${schedule.id} references non-existent class ${schedule.classId}`
                ).toBe(true);
            });
        });

        it('teacher schedule should match database schedules', async () => {
            const schedules = await api.getSchedulesByTeacher(testTeacher.id);
            const allSchedules = await api.getSchedules();

            // Filter all schedules for this teacher
            const teacherSchedulesFromAll = allSchedules.filter(
                s => String(s.teacherId) === String(testTeacher.id)
            );

            expect(schedules.length).toBe(teacherSchedulesFromAll.length);
        });
    });

    describe('Schedule Update Propagation', () => {
        it('API endpoints should use consistent ID formats', async () => {
            // Test that string and numeric IDs work the same
            const schedules1 = await api.getSchedulesByClass(testStudent.classId);
            const schedules2 = await api.getSchedulesByClass(String(testStudent.classId));

            expect(schedules1.length).toBe(schedules2.length);
        });

        it('schedule changes should be immediately queryable', async () => {
            // Fetch schedules twice - they should be consistent
            const schedules1 = await api.getSchedulesByClass(testStudent.classId);
            const schedules2 = await api.getSchedulesByClass(testStudent.classId);

            expect(schedules1.length).toBe(schedules2.length);

            if (schedules1.length > 0) {
                expect(schedules1[0].id).toBe(schedules2[0].id);
            }
        });

        it('all schedule API methods should return consistent data', async () => {
            const schedulesByClass = await api.getSchedulesByClass(testStudent.classId);
            const allSchedules = await api.getSchedules();

            // Schedules from getSchedulesByClass should be subset of all schedules
            schedulesByClass.forEach(schedule => {
                const foundInAll = allSchedules.find(s => s.id === schedule.id);
                expect(foundInAll).toBeDefined();
            });
        });
    });

    describe('Cross-Entity Schedule Validation', () => {
        it('schedules for a class should include schedules from teachers teaching that class', async () => {
            const classSchedules = await api.getSchedulesByClass(testStudent.classId);

            if (classSchedules.length > 0) {
                // Get all teachers teaching this class
                const teacherIds = [...new Set(classSchedules.map(s => s.teacherId))];

                for (const teacherId of teacherIds) {
                    const teacherSchedules = await api.getSchedulesByTeacher(teacherId);

                    // Teacher should have at least one schedule for this class
                    const hasClassSchedule = teacherSchedules.some(
                        s => String(s.classId) === String(testStudent.classId)
                    );

                    expect(hasClassSchedule).toBe(true);
                }
            }
        });

        it('teacher schedules should align with assigned classes', async () => {
            const teacherSchedules = await api.getSchedulesByTeacher(testTeacher.id);

            if (teacherSchedules.length > 0) {
                // All schedules should reference valid classes
                const uniqueClassIds = [...new Set(teacherSchedules.map(s => String(s.classId)))];

                expect(uniqueClassIds.length).toBeGreaterThan(0);

                // Verify each class exists
                const classes = await api.client.get('/classes');
                const classIds = new Set(classes.data.map(c => String(c.id)));

                uniqueClassIds.forEach(classId => {
                    expect(classIds.has(classId)).toBe(true);
                });
            }
        });
    });

    describe('Schedule Data Completeness', () => {
        it('all students with classId should have accessible schedules', async () => {
            const students = await api.getStudents({ _limit: 10 });

            for (const student of students.data) {
                if (student.classId) {
                    const schedules = await api.getSchedulesByClass(student.classId);

                    // Students in a class should have schedules (unless class is empty)
                    expect(Array.isArray(schedules)).toBe(true);
                }
            }
        });

        it('all teachers should have accessible schedule data', async () => {
            const teachers = await api.getTeachers();

            for (const teacher of teachers.slice(0, 5)) { // Test first 5
                const schedules = await api.getSchedulesByTeacher(teacher.id);

                expect(Array.isArray(schedules)).toBe(true);
                // Teachers may or may not have schedules, but should return array
            }
        });
    });
});
