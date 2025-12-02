export const attendanceData = {
    1: [ // Student ID 1
        { date: '2024-03-20', status: 'Present', time: '07:30 AM' },
        { date: '2024-03-19', status: 'Present', time: '07:25 AM' },
        { date: '2024-03-18', status: 'Present', time: '07:35 AM' },
        { date: '2024-03-15', status: 'Late', time: '08:15 AM' },
        { date: '2024-03-14', status: 'Present', time: '07:20 AM' },
        { date: '2024-03-13', status: 'Present', time: '07:30 AM' },
        { date: '2024-03-12', status: 'Present', time: '07:28 AM' },
        { date: '2024-03-11', status: 'Absent', time: '-' }
    ],
    2: [ // Student ID 2
        { date: '2024-03-20', status: 'Present', time: '07:40 AM' },
        { date: '2024-03-19', status: 'Late', time: '08:10 AM' },
        { date: '2024-03-18', status: 'Present', time: '07:30 AM' }
    ],
    3: [ // Student ID 3 - Karen Hope (High Risk)
        { date: '2024-03-20', status: 'Absent', time: '-' },
        { date: '2024-03-19', status: 'Absent', time: '-' },
        { date: '2024-03-18', status: 'Absent', time: '-' },
        { date: '2024-03-15', status: 'Present', time: '07:30 AM' },
        { date: '2024-03-14', status: 'Late', time: '08:20 AM' }
    ]
};

export const attendanceSummary = {
    1: { present: 85, absent: 3, late: 2, total: 90 },
    2: { present: 75, absent: 8, late: 7, total: 90 },
    3: { present: 60, absent: 20, late: 10, total: 90 }
};
