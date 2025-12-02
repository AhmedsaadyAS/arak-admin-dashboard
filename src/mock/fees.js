export const feesData = {
    1: { // Student ID 1
        totalDue: 5000000,
        totalPaid: 5000000,
        outstanding: 0,
        invoices: [
            { id: '#INV-001', description: 'Tuition Fee - Semester 1', amount: 3000000, paid: 3000000, dueDate: '2024-01-15', status: 'Paid' },
            { id: '#INV-002', description: 'Lab Fee', amount: 500000, paid: 500000, dueDate: '2024-02-01', status: 'Paid' },
            { id: '#INV-003', description: 'Book & Materials', amount: 1500000, paid: 1500000, dueDate: '2024-02-15', status: 'Paid' }
        ]
    },
    2: { // Student ID 2
        totalDue: 5000000,
        totalPaid: 3500000,
        outstanding: 1500000,
        invoices: [
            { id: '#INV-004', description: 'Tuition Fee - Semester 1', amount: 3000000, paid: 3000000, dueDate: '2024-01-15', status: 'Paid' },
            { id: '#INV-005', description: 'Lab Fee', amount: 500000, paid: 500000, dueDate: '2024-02-01', status: 'Paid' },
            { id: '#INV-006', description: 'Book & Materials', amount: 1500000, paid: 0, dueDate: '2024-02-15', status: 'Pending' }
        ]
    },
    3: { // Student ID 3
        totalDue: 5000000,
        totalPaid: 2500000,
        outstanding: 2500000,
        invoices: [
            { id: '#INV-007', description: 'Tuition Fee - Semester 1', amount: 3000000, paid: 2500000, dueDate: '2024-01-15', status: 'Overdue' },
            { id: '#INV-008', description: 'Lab Fee', amount: 500000, paid: 0, dueDate: '2024-02-01', status: 'Overdue' },
            { id: '#INV-009', description: 'Book & Materials', amount: 1500000, paid: 0, dueDate: '2024-02-15', status: 'Overdue' }
        ]
    }
};
