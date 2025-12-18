// Weekly timetable lessons
// dayOfWeek: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
// Note: Students and teachers can have multiple lessons per day

export const lessonsData = [
    // Grade 7-A Schedule (Class ID: 1)
    // Sunday
    { id: 1, classId: 1, subjectId: 1, teacherId: 2, dayOfWeek: 0, startTime: '08:00', endTime: '09:00', room: 'Room 101' },
    { id: 2, classId: 1, subjectId: 3, teacherId: 4, dayOfWeek: 0, startTime: '09:00', endTime: '10:00', room: 'Room 101' },
    { id: 3, classId: 1, subjectId: 2, teacherId: 5, dayOfWeek: 0, startTime: '10:30', endTime: '11:30', room: 'Lab 1' },
    { id: 4, classId: 1, subjectId: 8, teacherId: 6, dayOfWeek: 0, startTime: '11:30', endTime: '12:30', room: 'Room 101' },

    // Monday
    { id: 5, classId: 1, subjectId: 4, teacherId: 1, dayOfWeek: 1, startTime: '08:00', endTime: '09:00', room: 'Room 101' },
    { id: 6, classId: 1, subjectId: 1, teacherId: 2, dayOfWeek: 1, startTime: '09:00', endTime: '10:00', room: 'Room 101' },
    { id: 7, classId: 1, subjectId: 9, teacherId: 7, dayOfWeek: 1, startTime: '10:30', endTime: '11:30', room: 'Gym' },
    { id: 8, classId: 1, subjectId: 10, teacherId: 8, dayOfWeek: 1, startTime: '11:30', endTime: '12:30', room: 'Lab 2' },

    // Tuesday
    { id: 9, classId: 1, subjectId: 3, teacherId: 4, dayOfWeek: 2, startTime: '08:00', endTime: '09:00', room: 'Room 101' },
    { id: 10, classId: 1, subjectId: 2, teacherId: 5, dayOfWeek: 2, startTime: '09:00', endTime: '10:00', room: 'Lab 1' },
    { id: 11, classId: 1, subjectId: 1, teacherId: 2, dayOfWeek: 2, startTime: '10:30', endTime: '11:30', room: 'Room 101' },
    { id: 12, classId: 1, subjectId: 4, teacherId: 1, dayOfWeek: 2, startTime: '11:30', endTime: '12:30', room: 'Room 101' },

    // Wednesday
    { id: 13, classId: 1, subjectId: 8, teacherId: 6, dayOfWeek: 3, startTime: '08:00', endTime: '09:00', room: 'Room 101' },
    { id: 14, classId: 1, subjectId: 1, teacherId: 2, dayOfWeek: 3, startTime: '09:00', endTime: '10:00', room: 'Room 101' },
    { id: 15, classId: 1, subjectId: 3, teacherId: 4, dayOfWeek: 3, startTime: '10:30', endTime: '11:30', room: 'Room 101' },
    { id: 16, classId: 1, subjectId: 10, teacherId: 8, dayOfWeek: 3, startTime: '11:30', endTime: '12:30', room: 'Lab 2' },

    // Thursday
    { id: 17, classId: 1, subjectId: 2, teacherId: 5, dayOfWeek: 4, startTime: '08:00', endTime: '09:00', room: 'Lab 1' },
    { id: 18, classId: 1, subjectId: 1, teacherId: 2, dayOfWeek: 4, startTime: '09:00', endTime: '10:00', room: 'Room 101' },
    { id: 19, classId: 1, subjectId: 9, teacherId: 7, dayOfWeek: 4, startTime: '10:30', endTime: '11:30', room: 'Gym' },
    { id: 20, classId: 1, subjectId: 3, teacherId: 4, dayOfWeek: 4, startTime: '11:30', endTime: '12:30', room: 'Room 101' },

    // Grade 7-B Schedule (Class ID: 2)
    // Sunday
    { id: 21, classId: 2, subjectId: 3, teacherId: 4, dayOfWeek: 0, startTime: '08:00', endTime: '09:00', room: 'Room 102' },
    { id: 22, classId: 2, subjectId: 1, teacherId: 2, dayOfWeek: 0, startTime: '09:00', endTime: '10:00', room: 'Room 102' },
    { id: 23, classId: 2, subjectId: 4, teacherId: 1, dayOfWeek: 0, startTime: '10:30', endTime: '11:30', room: 'Room 102' },
    { id: 24, classId: 2, subjectId: 8, teacherId: 6, dayOfWeek: 0, startTime: '11:30', endTime: '12:30', room: 'Room 102' },

    // Monday
    { id: 25, classId: 2, subjectId: 2, teacherId: 5, dayOfWeek: 1, startTime: '08:00', endTime: '09:00', room: 'Lab 1' },
    { id: 26, classId: 2, subjectId: 1, teacherId: 2, dayOfWeek: 1, startTime: '09:00', endTime: '10:00', room: 'Room 102' },
    { id: 27, classId: 2, subjectId: 3, teacherId: 4, dayOfWeek: 1, startTime: '10:30', endTime: '11:30', room: 'Room 102' },
    { id: 28, classId: 2, subjectId: 10, teacherId: 8, dayOfWeek: 1, startTime: '11:30', endTime: '12:30', room: 'Lab 2' },

    // Tuesday
    { id: 29, classId: 2, subjectId: 1, teacherId: 2, dayOfWeek: 2, startTime: '08:00', endTime: '09:00', room: 'Room 102' },
    { id: 30, classId: 2, subjectId: 9, teacherId: 7, dayOfWeek: 2, startTime: '09:00', endTime: '10:00', room: 'Gym' },
    { id: 31, classId: 2, subjectId: 4, teacherId: 1, dayOfWeek: 2, startTime: '10:30', endTime: '11:30', room: 'Room 102' },
    { id: 32, classId: 2, subjectId: 2, teacherId: 5, dayOfWeek: 2, startTime: '11:30', endTime: '12:30', room: 'Lab 1' },

    // Wednesday
    { id: 33, classId: 2, subjectId: 3, teacherId: 4, dayOfWeek: 3, startTime: '08:00', endTime: '09:00', room: 'Room 102' },
    { id: 34, classId: 2, subjectId: 8, teacherId: 6, dayOfWeek: 3, startTime: '09:00', endTime: '10:00', room: 'Room 102' },
    { id: 35, classId: 2, subjectId: 1, teacherId: 2, dayOfWeek: 3, startTime: '10:30', endTime: '11:30', room: 'Room 102' },
    { id: 36, classId: 2, subjectId: 10, teacherId: 8, dayOfWeek: 3, startTime: '11:30', endTime: '12:30', room: 'Lab 2' },

    // Thursday
    { id: 37, classId: 2, subjectId: 2, teacherId: 5, dayOfWeek: 4, startTime: '08:00', endTime: '09:00', room: 'Lab 1' },
    { id: 38, classId: 2, subjectId: 1, teacherId: 2, dayOfWeek: 4, startTime: '09:00', endTime: '10:00', room: 'Room 102' },
    { id: 39, classId: 2, subjectId: 3, teacherId: 4, dayOfWeek: 4, startTime: '10:30', endTime: '11:30', room: 'Room 102' },
    { id: 40, classId: 2, subjectId: 9, teacherId: 7, dayOfWeek: 4, startTime: '11:30', endTime: '12:30', room: 'Gym' },

    // Grade 8-A Schedule (Class ID: 3)
    // Sunday  
    { id: 41, classId: 3, subjectId: 5, teacherId: 3, dayOfWeek: 0, startTime: '08:00', endTime: '09:00', room: 'Lab 3' },
    { id: 42, classId: 3, subjectId: 1, teacherId: 2, dayOfWeek: 0, startTime: '09:00', endTime: '10:00', room: 'Room 201' },
    { id: 43, classId: 3, subjectId: 6, teacherId: 9, dayOfWeek: 0, startTime: '10:30', endTime: '11:30', room: 'Lab 4' },
    { id: 44, classId: 3, subjectId: 3, teacherId: 4, dayOfWeek: 0, startTime: '11:30', endTime: '12:30', room: 'Room 201' },

    // Monday
    { id: 45, classId: 3, subjectId: 7, teacherId: 10, dayOfWeek: 1, startTime: '08:00', endTime: '09:00', room: 'Lab 5' },
    { id: 46, classId: 3, subjectId: 1, teacherId: 2, dayOfWeek: 1, startTime: '09:00', endTime: '10:00', room: 'Room 201' },
    { id: 47, classId: 3, subjectId: 8, teacherId: 6, dayOfWeek: 1, startTime: '10:30', endTime: '11:30', room: 'Room 201' },
    { id: 48, classId: 3, subjectId: 9, teacherId: 7, dayOfWeek: 1, startTime: '11:30', endTime: '12:30', room: 'Gym' },

    // Tuesday
    { id: 49, classId: 3, subjectId: 3, teacherId: 4, dayOfWeek: 2, startTime: '08:00', endTime: '09:00', room: 'Room 201' },
    { id: 50, classId: 3, subjectId: 5, teacherId: 3, dayOfWeek: 2, startTime: '09:00', endTime: '10:00', room: 'Lab 3' },
    { id: 51, classId: 3, subjectId: 1, teacherId: 2, dayOfWeek: 2, startTime: '10:30', endTime: '11:30', room: 'Room 201' },
    { id: 52, classId: 3, subjectId: 10, teacherId: 8, dayOfWeek: 2, startTime: '11:30', endTime: '12:30', room: 'Lab 2' },

    // Wednesday
    { id: 53, classId: 3, subjectId: 6, teacherId: 9, dayOfWeek: 3, startTime: '08:00', endTime: '09:00', room: 'Lab 4' },
    { id: 54, classId: 3, subjectId: 1, teacherId: 2, dayOfWeek: 3, startTime: '09:00', endTime: '10:00', room: 'Room 201' },
    { id: 55, classId: 3, subjectId: 3, teacherId: 4, dayOfWeek: 3, startTime: '10:30', endTime: '11:30', room: 'Room 201' },
    { id: 56, classId: 3, subjectId: 7, teacherId: 10, dayOfWeek: 3, startTime: '11:30', endTime: '12:30', room: 'Lab 5' },

    // Thursday
    { id: 57, classId: 3, subjectId: 5, teacherId: 3, dayOfWeek: 4, startTime: '08:00', endTime: '09:00', room: 'Lab 3' },
    { id: 58, classId: 3, subjectId: 1, teacherId: 2, dayOfWeek: 4, startTime: '09:00', endTime: '10:00', room: 'Room 201' },
    { id: 59, classId: 3, subjectId: 9, teacherId: 7, dayOfWeek: 4, startTime: '10:30', endTime: '11:30', room: 'Gym' },
    { id: 60, classId: 3, subjectId: 8, teacherId: 6, dayOfWeek: 4, startTime: '11:30', endTime: '12:30', room: 'Room 201' },

    // Grade 8-B Schedule (Class ID: 4) - Sample
    { id: 61, classId: 4, subjectId: 1, teacherId: 2, dayOfWeek: 0, startTime: '08:00', endTime: '09:00', room: 'Room 202' },
    { id: 62, classId: 4, subjectId: 5, teacherId: 3, dayOfWeek: 0, startTime: '09:00', endTime: '10:00', room: 'Lab 3' },
    { id: 63, classId: 4, subjectId: 3, teacherId: 4, dayOfWeek: 0, startTime: '10:30', endTime: '11:30', room: 'Room 202' },
    { id: 64, classId: 4, subjectId: 6, teacherId: 9, dayOfWeek: 0, startTime: '11:30', endTime: '12:30', room: 'Lab 4' },

    // Grade 9-A Schedule (Class ID: 5) - Sample
    { id: 65, classId: 5, subjectId: 5, teacherId: 3, dayOfWeek: 0, startTime: '08:00', endTime: '09:00', room: 'Lab 3' },
    { id: 66, classId: 5, subjectId: 6, teacherId: 9, dayOfWeek: 0, startTime: '09:00', endTime: '10:00', room: 'Lab 4' },
    { id: 67, classId: 5, subjectId: 1, teacherId: 2, dayOfWeek: 0, startTime: '10:30', endTime: '11:30', room: 'Room 301' },
    { id: 68, classId: 5, subjectId: 7, teacherId: 10, dayOfWeek: 0, startTime: '11:30', endTime: '12:30', room: 'Lab 5' }
];
