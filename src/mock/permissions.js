export const permissionsData = [
    {
        module: 'Students',
        permissions: [
            { id: 'students_view', name: 'View', enabled: true },
            { id: 'students_add', name: 'Add', enabled: true },
            { id: 'students_edit', name: 'Edit', enabled: true },
            { id: 'students_delete', name: 'Delete', enabled: true }
        ]
    },
    {
        module: 'Teachers',
        permissions: [
            { id: 'teachers_view', name: 'View', enabled: true },
            { id: 'teachers_add', name: 'Add', enabled: true },
            { id: 'teachers_edit', name: 'Edit', enabled: true },
            { id: 'teachers_delete', name: 'Delete', enabled: true }
        ]
    },
    {
        module: 'Classes',
        permissions: [
            { id: 'classes_view', name: 'View', enabled: true },
            { id: 'classes_add', name: 'Add', enabled: true },
            { id: 'classes_edit', name: 'Edit', enabled: true },
            { id: 'classes_delete', name: 'Delete', enabled: false }
        ]
    },
    {
        module: 'Events',
        permissions: [
            { id: 'events_view', name: 'View', enabled: true },
            { id: 'events_add', name: 'Add', enabled: true },
            { id: 'events_edit', name: 'Edit', enabled: true },
            { id: 'events_delete', name: 'Delete', enabled: true }
        ]
    },
    {
        module: 'Fees',
        permissions: [
            { id: 'fees_view', name: 'View', enabled: true },
            { id: 'fees_add', name: 'Add', enabled: true },
            { id: 'fees_edit', name: 'Edit', enabled: false },
            { id: 'fees_delete', name: 'Delete', enabled: false }
        ]
    },
    {
        module: 'Messages',
        permissions: [
            { id: 'messages_view', name: 'View', enabled: true },
            { id: 'messages_send', name: 'Send', enabled: true }
        ]
    },
    {
        module: 'Reports',
        permissions: [
            { id: 'reports_view', name: 'View', enabled: true },
            { id: 'reports_export', name: 'Export', enabled: true }
        ]
    },
    {
        module: 'Settings',
        permissions: [
            { id: 'settings_view', name: 'View', enabled: true },
            { id: 'settings_edit', name: 'Edit', enabled: false }
        ]
    },
    {
        module: 'User Management',
        permissions: [
            { id: 'users_view', name: 'View', enabled: true },
            { id: 'users_add', name: 'Add', enabled: true },
            { id: 'users_edit', name: 'Edit', enabled: true },
            { id: 'users_delete', name: 'Delete', enabled: true },
            { id: 'users_assign_roles', name: 'Assign Roles', enabled: true }
        ]
    }
];

export const rolePermissions = {
    1: { // Super Admin - All permissions
        students: ['view', 'add', 'edit', 'delete'],
        teachers: ['view', 'add', 'edit', 'delete'],
        classes: ['view', 'add', 'edit', 'delete'],
        events: ['view', 'add', 'edit', 'delete'],
        fees: ['view', 'add', 'edit', 'delete'],
        messages: ['view', 'send'],
        reports: ['view', 'export'],
        settings: ['view', 'edit'],
        users: ['view', 'add', 'edit', 'delete', 'assign_roles']
    },
    2: { // School Administrator
        students: ['view', 'add', 'edit'],
        teachers: ['view'],
        classes: ['view', 'add', 'edit'],
        events: ['view', 'add', 'edit'],
        fees: ['view'],
        messages: ['view', 'send'],
        reports: ['view', 'export'],
        settings: ['view'],
        users: []
    },
    3: { // Registrar
        students: ['view', 'add', 'edit'],
        teachers: ['view'],
        classes: ['view'],
        events: ['view'],
        fees: [],
        messages: ['view'],
        reports: ['view'],
        settings: [],
        users: []
    },
    4: { // Finance Administrator
        students: ['view'],
        teachers: [],
        classes: [],
        events: [],
        fees: ['view', 'add', 'edit'],
        messages: ['view', 'send'],
        reports: ['view', 'export'],
        settings: [],
        users: []
    },
    5: { // Teacher
        students: ['view'],
        teachers: ['view'],
        classes: ['view'],
        events: ['view'],
        fees: [],
        messages: ['view', 'send'],
        reports: [],
        settings: [],
        users: []
    }
};
