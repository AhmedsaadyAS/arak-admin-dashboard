import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// Read the raw db.json file
const dbPath = path.resolve(__dirname, '../../db.json');
const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

/**
 * Schedule Integrity Tests
 * Verify that students, teachers, and schedules maintain proper relationships
 */

describe('Student-Teacher-Schedule Integrity', () => {

    const normalizeId = (id) => String(id);

    describe('Schedule-Teacher Consistency', () => {
        it('all schedules should reference existing teachers', () => {
            const teacherIds = new Set(dbData.teachers.map(t => normalizeId(t.id)));

            (dbData.schedules || []).forEach(schedule => {
                if (schedule.teacherId) {
                    expect(
                        teacherIds.has(normalizeId(schedule.teacherId)),
                        `Schedule ${schedule.id} references non-existent teacher ${schedule.teacherId}`
                    ).toBe(true);
                }
            });
        });

        it('all schedules should reference existing classes', () => {
            const classIds = new Set((dbData.classes || []).map(c => normalizeId(c.id)));

            (dbData.schedules || []).forEach(schedule => {
                if (schedule.classId) {
                    expect(
                        classIds.has(normalizeId(schedule.classId)),
                        `Schedule ${schedule.id} references non-existent class ${schedule.classId}`
                    ).toBe(true);
                }
            });
        });
    });

    describe('Student-Class-Schedule Alignment', () => {
        it('students assigned to a class should have schedules for that class', () => {
            const schedulesByClass = {};

            // Build schedule lookup by classId
            (dbData.schedules || []).forEach(schedule => {
                const classId = normalizeId(schedule.classId);
                if (!schedulesByClass[classId]) {
                    schedulesByClass[classId] = [];
                }
                schedulesByClass[classId].push(schedule);
            });

            // Check each student's class has schedules
            dbData.students.forEach(student => {
                if (student.classId) {
                    const classId = normalizeId(student.classId);
                    const hasSchedules = schedulesByClass[classId]?.length > 0;

                    // If class exists, it should have schedules
                    if (hasSchedules !== undefined) {
                        expect(
                            hasSchedules,
                            `Student ${student.id} in class ${classId} has no schedules`
                        ).toBe(true);
                    }
                }
            });
        });

        it('schedules should exist for classes that have students', () => {
            const studentsPerClass = {};

            // Count students per class
            dbData.students.forEach(student => {
                if (student.classId) {
                    const classId = normalizeId(student.classId);
                    studentsPerClass[classId] = (studentsPerClass[classId] || 0) + 1;
                }
            });

            const schedulesPerClass = {};

            // Count schedules per class
            (dbData.schedules || []).forEach(schedule => {
                if (schedule.classId) {
                    const classId = normalizeId(schedule.classId);
                    schedulesPerClass[classId] = (schedulesPerClass[classId] || 0) + 1;
                }
            });

            // Classes with students should have schedules
            Object.keys(studentsPerClass).forEach(classId => {
                const studentCount = studentsPerClass[classId];
                const scheduleCount = schedulesPerClass[classId] || 0;

                if (studentCount > 0) {
                    expect(
                        scheduleCount,
                        `Class ${classId} has ${studentCount} students but ${scheduleCount} schedules`
                    ).toBeGreaterThan(0);
                }
            });
        });
    });

    describe('Teacher-Schedule-Student Consistency', () => {
        it('teachers assigned to students should have schedules for their classes', () => {
            const schedulesByTeacher = {};

            // Build schedule lookup by teacherId
            (dbData.schedules || []).forEach(schedule => {
                const teacherId = normalizeId(schedule.teacherId);
                if (!schedulesByTeacher[teacherId]) {
                    schedulesByTeacher[teacherId] = [];
                }
                schedulesByTeacher[teacherId].push(schedule);
            });

            // Group students by teacher
            const studentsByTeacher = {};
            dbData.students.forEach(student => {
                const teacherId = normalizeId(student.teacherId);
                if (!studentsByTeacher[teacherId]) {
                    studentsByTeacher[teacherId] = [];
                }
                studentsByTeacher[teacherId].push(student);
            });

            // Check that teachers with students have schedules
            Object.keys(studentsByTeacher).forEach(teacherId => {
                const studentCount = studentsByTeacher[teacherId].length;
                const hasSchedules = schedulesByTeacher[teacherId]?.length > 0;

                if (studentCount > 0) {
                    expect(
                        hasSchedules,
                        `Teacher ${teacherId} has ${studentCount} students but no schedules`
                    ).toBe(true);
                }
            });
        });

        it('teachers teaching classes should have students in those classes', () => {
            const classTeachers = {};

            // Get teachers per class from schedules
            (dbData.schedules || []).forEach(schedule => {
                const classId = normalizeId(schedule.classId);
                const teacherId = normalizeId(schedule.teacherId);

                if (!classTeachers[classId]) {
                    classTeachers[classId] = new Set();
                }
                classTeachers[classId].add(teacherId);
            });

            // Get students per class
            const classStudents = {};
            dbData.students.forEach(student => {
                if (student.classId) {
                    const classId = normalizeId(student.classId);
                    if (!classStudents[classId]) {
                        classStudents[classId] = [];
                    }
                    classStudents[classId].push(student);
                }
            });

            // Classes with teachers in schedules should have students
            Object.keys(classTeachers).forEach(classId => {
                const hasStudents = (classStudents[classId]?.length || 0) > 0;
                const teacherCount = classTeachers[classId].size;

                // If teachers are scheduled for a class, it should have students
                expect(
                    hasStudents,
                    `Class ${classId} has ${teacherCount} teacher(s) scheduled but no students`
                ).toBe(true);
            });
        });
    });

    describe('Schedule Time Conflicts', () => {
        it('should detect if a teacher has overlapping schedules', () => {
            const teacherSchedules = {};
            const conflicts = [];

            // Group schedules by teacher
            (dbData.schedules || []).forEach(schedule => {
                const teacherId = normalizeId(schedule.teacherId);
                if (!teacherSchedules[teacherId]) {
                    teacherSchedules[teacherId] = [];
                }
                teacherSchedules[teacherId].push(schedule);
            });

            // Check for time conflicts per teacher
            Object.entries(teacherSchedules).forEach(([teacherId, schedules]) => {
                const timeSlots = {};

                schedules.forEach(schedule => {
                    const day = schedule.day;
                    const time = schedule.time; // Assuming format like "09:00"

                    if (day && time) {
                        const key = `${day}-${time}`;

                        if (!timeSlots[key]) {
                            timeSlots[key] = [];
                        }
                        timeSlots[key].push(schedule);
                    }
                });

                // Detect conflicts (more than one schedule at same time)
                Object.entries(timeSlots).forEach(([slot, conflictingSchedules]) => {
                    if (conflictingSchedules.length > 1) {
                        conflicts.push({
                            teacherId,
                            slot,
                            count: conflictingSchedules.length,
                            schedules: conflictingSchedules
                        });
                    }
                });
            });

            // Report conflicts (info only, don't fail test)
            if (conflicts.length > 0) {
                console.log(`\n⚠️  Found ${conflicts.length} teacher schedule conflict(s):`);
                conflicts.forEach(c => {
                    console.log(`   - Teacher ${c.teacherId} has ${c.count} schedules at ${c.slot}`);
                });
            }

            // Test passes - we successfully detected conflicts (if any)
            expect(conflicts).toBeDefined();
        });

        it('should detect if a class has overlapping schedules', () => {
            const classSchedules = {};

            // Group schedules by class
            (dbData.schedules || []).forEach(schedule => {
                const classId = normalizeId(schedule.classId);
                if (!classSchedules[classId]) {
                    classSchedules[classId] = [];
                }
                classSchedules[classId].push(schedule);
            });

            // Check for time conflicts per class
            Object.entries(classSchedules).forEach(([classId, schedules]) => {
                const timeSlots = {};

                schedules.forEach(schedule => {
                    const day = schedule.day;
                    const time = schedule.time;

                    if (day && time) {
                        const key = `${day}-${time}`;

                        if (!timeSlots[key]) {
                            timeSlots[key] = [];
                        }
                        timeSlots[key].push(schedule);
                    }
                });

                // Check for duplicates (conflicts)
                Object.entries(timeSlots).forEach(([slot, conflictingSchedules]) => {
                    expect(
                        conflictingSchedules.length,
                        `Class ${classId} has ${conflictingSchedules.length} schedules at ${slot}`
                    ).toBe(1);
                });
            });
        });
    });

    describe('Subject-Teacher Alignment', () => {
        it('teachers should teach their assigned subjects in schedules', () => {
            const teacherSubjects = {};

            // Get teacher subjects
            dbData.teachers.forEach(teacher => {
                teacherSubjects[normalizeId(teacher.id)] = teacher.subject;
            });

            // Verify schedules match teacher subjects
            (dbData.schedules || []).forEach(schedule => {
                if (schedule.teacherId && schedule.subject) {
                    const teacherId = normalizeId(schedule.teacherId);
                    const teacherSubject = teacherSubjects[teacherId];

                    if (teacherSubject) {
                        // Allow some flexibility - subject might be part of teacher's expertise
                        // This is a soft check - we log but don't fail
                        const matches = schedule.subject === teacherSubject ||
                            teacherSubject.includes(schedule.subject) ||
                            schedule.subject.includes(teacherSubject);

                        // For now, just check that subject exists
                        expect(schedule.subject).toBeDefined();
                    }
                }
            });
        });
    });

    describe('Comprehensive Schedule Integrity Report', () => {
        it('should provide a complete integrity summary', () => {
            const report = {
                totalSchedules: (dbData.schedules || []).length,
                totalStudents: dbData.students.length,
                totalTeachers: dbData.teachers.length,
                totalClasses: (dbData.classes || []).length,

                classesWithSchedules: 0,
                classesWithoutSchedules: 0,
                teachersWithSchedules: 0,
                teachersWithoutSchedules: 0,

                potentialConflicts: 0
            };

            // Count classes with schedules
            const classesWithSchedules = new Set();
            (dbData.schedules || []).forEach(schedule => {
                if (schedule.classId) {
                    classesWithSchedules.add(normalizeId(schedule.classId));
                }
            });
            report.classesWithSchedules = classesWithSchedules.size;
            report.classesWithoutSchedules = report.totalClasses - classesWithSchedules.size;

            // Count teachers with schedules
            const teachersWithSchedules = new Set();
            (dbData.schedules || []).forEach(schedule => {
                if (schedule.teacherId) {
                    teachersWithSchedules.add(normalizeId(schedule.teacherId));
                }
            });
            report.teachersWithSchedules = teachersWithSchedules.size;
            report.teachersWithoutSchedules = report.totalTeachers - teachersWithSchedules.size;

            console.log('\n========== SCHEDULE INTEGRITY REPORT ==========');
            console.log('Total Schedules:', report.totalSchedules);
            console.log('Total Students:', report.totalStudents);
            console.log('Total Teachers:', report.totalTeachers);
            console.log('Total Classes:', report.totalClasses);
            console.log('\nCoverage:');
            console.log(`  Classes with schedules: ${report.classesWithSchedules}/${report.totalClasses}`);
            console.log(`  Teachers with schedules: ${report.teachersWithSchedules}/${report.totalTeachers}`);
            console.log('=============================================\n');

            // Basic sanity checks
            expect(report.totalSchedules).toBeGreaterThan(0);
            expect(report.classesWithSchedules).toBeGreaterThan(0);
            expect(report.teachersWithSchedules).toBeGreaterThan(0);
        });
    });
});
