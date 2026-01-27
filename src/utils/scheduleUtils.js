// Schedule utility functions
import { lessonsData } from '../mock/lessons';
import { subjectsData } from '../mock/subjects';
import { teachersData } from '../mock/teachers';

/**
 * Get weekly schedule for a specific class
 * @param {number} classId - The class ID
 * @param {Array} lessons - Lessons data (optional, defaults to lessonsData)
 * @returns {Object} Schedule organized by day of week
 */
export function getClassSchedule(classId, lessons = lessonsData) {
    const classLessons = lessons.filter(lesson => lesson.classId === classId);

    // Group by day of week
    const schedule = {
        0: [], // Sunday
        1: [], // Monday
        2: [], // Tuesday
        3: [], // Wednesday
        4: [], // Thursday
        5: [], // Friday
        6: []  // Saturday
    };

    classLessons.forEach(lesson => {
        const subject = subjectsData.find(s => s.id === lesson.subjectId);
        const teacher = teachersData.find(t => t.id === lesson.teacherId);

        // SAFEGUARD: Only push if the day exists (0-6)
        if (schedule[lesson.dayOfWeek]) {
            schedule[lesson.dayOfWeek].push({
                ...lesson,
                subjectName: subject?.name || 'Unknown Subject',
                subjectColor: subject?.color || '#gray',
                teacherName: teacher?.name || 'Unknown Teacher'
            });
        }
    });

    // Sort each day by start time
    Object.keys(schedule).forEach(day => {
        schedule[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return schedule;
}

/**
 * Get weekly schedule for a specific teacher
 * @param {number} teacherId - The teacher ID
 * @param {Array} lessons - Lessons data (optional, defaults to lessonsData)
 * @returns {Object} Schedule organized by day of week
 */
export function getTeacherSchedule(teacherId, lessons = lessonsData) {
    const teacherLessons = lessons.filter(lesson => lesson.teacherId === teacherId);

    // Group by day of week
    const schedule = {
        0: [], // Sunday
        1: [], // Monday
        2: [], // Tuesday
        3: [], // Wednesday
        4: [], // Thursday
        5: [], // Friday
        6: []  // Saturday
    };

    teacherLessons.forEach(lesson => {
        const subject = subjectsData.find(s => s.id === lesson.subjectId);

        // SAFEGUARD: Only push if the day exists (0-6)
        if (schedule[lesson.dayOfWeek]) {
            schedule[lesson.dayOfWeek].push({
                ...lesson,
                subjectName: subject?.name || 'Unknown Subject',
                subjectColor: subject?.color || '#4D44B5'
            });
        }
    });

    // Sort each day by start time
    Object.keys(schedule).forEach(day => {
        schedule[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return schedule;
}

/**
 * Detect time conflicts in lessons
 * @param {Array} lessons - Lessons data
 * @returns {Array} Array of conflicts
 */
export function detectTimeConflicts(lessons = lessonsData) {
    const conflicts = [];

    // Group lessons by day
    const lessonsByDay = {};

    lessons.forEach(lesson => {
        const key = lesson.dayOfWeek;
        if (!lessonsByDay[key]) {
            lessonsByDay[key] = [];
        }
        lessonsByDay[key].push(lesson);
    });

    // Check for overlaps within each day
    Object.values(lessonsByDay).forEach(dayLessons => {
        for (let i = 0; i < dayLessons.length; i++) {
            for (let j = i + 1; j < dayLessons.length; j++) {
                const lesson1 = dayLessons[i];
                const lesson2 = dayLessons[j];

                // Check if times overlap
                if (lesson1.startTime < lesson2.endTime && lesson2.startTime < lesson1.endTime) {
                    // Teacher Conflict
                    if (lesson1.teacherId === lesson2.teacherId) {
                        conflicts.push({
                            type: 'Teacher',
                            lesson1,
                            lesson2,
                            teacherId: lesson1.teacherId,
                            dayOfWeek: lesson1.dayOfWeek,
                            message: `Teacher is already booked: ${lesson1.startTime}-${lesson1.endTime} in ${lesson1.room || 'Unknown Room'}`
                        });
                    }
                    // Room Conflict
                    if (lesson1.room === lesson2.room && lesson1.room) {
                        conflicts.push({
                            type: 'Room',
                            lesson1,
                            lesson2,
                            room: lesson1.room,
                            dayOfWeek: lesson1.dayOfWeek,
                            message: `Room ${lesson1.room} is already booked: ${lesson1.startTime}-${lesson1.endTime}`
                        });
                    }
                }
            }
        }
    });

    return conflicts;
}

/**
 * Get day name from day number
 * @param {number} dayOfWeek - 0-6 (Sunday-Saturday)
 * @returns {string} Day name
 */
export function getDayName(dayOfWeek) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek] || 'Unknown';
}

/**
 * Get short day name from day number
 * @param {number} dayOfWeek - 0-6 (Sunday-Saturday)
 * @returns {string} Short day name
 */
export function getShortDayName(dayOfWeek) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayOfWeek] || '?';
}

/**
 * Format time to 12-hour format
 * @param {string} time - Time in HH:MM format
 * @returns {string} Time in 12-hour format
 */
export function formatTime(time) {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

/**
 * Get all time slots used in schedules
 * @param {Array} lessons - Lessons data
 * @returns {Array} Sorted array of unique time slots
 */
export function getTimeSlots(lessons = lessonsData) {
    const slots = new Set();
    lessons.forEach(lesson => {
        slots.add(lesson.startTime);
    });
    return Array.from(slots).sort();
}
