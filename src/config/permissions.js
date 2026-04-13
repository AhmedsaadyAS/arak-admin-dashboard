/**
 * Role-Based Permissions Configuration
 * 
 * This file defines what each role can do in the system.
 * Permissions are organized by:
 * - pages: What pages/routes the role can access
 * - actions: What specific actions the role can perform
 */

// Permission constants
export const PERMISSIONS = {
    // Page Access
    DASHBOARD: 'dashboard',
    STUDENTS: 'students',
    TEACHERS: 'teachers',
    SCHEDULE: 'schedule',
    EVENTS: 'events',
    FEES: 'fees',
    REPORTS: 'reports',
    GRADEBOOK: 'gradebook',
    TASKS: 'tasks',
    ACTIVITY: 'activity',
    CHAT: 'chat',
    USER_MANAGEMENT: 'user_management',
    SETTINGS: 'settings',
    CONTROL_SHEETS: 'control_sheets',
    GRADES: 'grades',

    // Actions
    CREATE_STUDENT: 'create_student',
    EDIT_STUDENT: 'edit_student',
    DELETE_STUDENT: 'delete_student',
    CREATE_TEACHER: 'create_teacher',
    EDIT_TEACHER: 'edit_teacher',
    DELETE_TEACHER: 'delete_teacher',
    CREATE_USER: 'create_user',
    EDIT_USER: 'edit_user',
    DELETE_USER: 'delete_user',
    CREATE_PARENT: 'create_parent',
    EDIT_PARENT: 'edit_parent',
    DELETE_PARENT: 'delete_parent',
    MANAGE_FEES: 'manage_fees',
    MANAGE_GRADES: 'manage_grades',
    MANAGE_SCHEDULE: 'manage_schedule',
    VIEW_REPORTS: 'view_reports',
    EXPORT_DATA: 'export_data',
};

// Role-Permission Mappings
export const ROLE_PERMISSIONS = {
    'Super Admin': {
        // Super Admin has ALL permissions
        permissions: Object.values(PERMISSIONS),
        description: 'Full system access - can do everything'
    },

    'Admin': {
        permissions: [
            // Full access including user management
            PERMISSIONS.DASHBOARD,
            PERMISSIONS.USER_MANAGEMENT,
            PERMISSIONS.STUDENTS,
            PERMISSIONS.TEACHERS,
            PERMISSIONS.SCHEDULE,
            PERMISSIONS.EVENTS,
            PERMISSIONS.FEES,
            PERMISSIONS.REPORTS,
            PERMISSIONS.GRADEBOOK,
            PERMISSIONS.TASKS,
            PERMISSIONS.ACTIVITY,
            PERMISSIONS.CHAT,
            PERMISSIONS.SETTINGS,
            // Actions
            PERMISSIONS.CREATE_STUDENT,
            PERMISSIONS.EDIT_STUDENT,
            PERMISSIONS.DELETE_STUDENT,
            PERMISSIONS.CREATE_TEACHER,
            PERMISSIONS.EDIT_TEACHER,
            PERMISSIONS.DELETE_TEACHER,
            PERMISSIONS.CREATE_PARENT,
            PERMISSIONS.EDIT_PARENT,
            PERMISSIONS.DELETE_PARENT,
            PERMISSIONS.MANAGE_FEES,
            PERMISSIONS.MANAGE_GRADES,
            PERMISSIONS.MANAGE_SCHEDULE,
            PERMISSIONS.VIEW_REPORTS,
            PERMISSIONS.EXPORT_DATA,
            PERMISSIONS.CONTROL_SHEETS,
            PERMISSIONS.GRADES,
        ],
        description: 'Administrative access to most features'
    },

    'Academic Admin': {
        permissions: [
            PERMISSIONS.DASHBOARD,
            PERMISSIONS.STUDENTS,
            PERMISSIONS.TEACHERS,
            PERMISSIONS.SCHEDULE,
            PERMISSIONS.EVENTS,
            PERMISSIONS.REPORTS,
            PERMISSIONS.GRADEBOOK,
            PERMISSIONS.TASKS,
            // Actions
            PERMISSIONS.CREATE_STUDENT,
            PERMISSIONS.EDIT_STUDENT,
            PERMISSIONS.CREATE_TEACHER,
            PERMISSIONS.EDIT_TEACHER,
            PERMISSIONS.MANAGE_GRADES,
            PERMISSIONS.MANAGE_SCHEDULE,
            PERMISSIONS.VIEW_REPORTS,
            PERMISSIONS.CONTROL_SHEETS,
            PERMISSIONS.GRADES,
        ],
        description: 'Academic operations - students, teachers, schedules, grades'
    },

    'Fees Admin': {
        permissions: [
            PERMISSIONS.DASHBOARD,
            PERMISSIONS.FEES,
            PERMISSIONS.REPORTS,
            PERMISSIONS.STUDENTS, // View only for fee context
            // Actions
            PERMISSIONS.MANAGE_FEES,
            PERMISSIONS.VIEW_REPORTS,
            PERMISSIONS.EXPORT_DATA,
        ],
        description: 'Financial operations and fee management'
    },

    'Users Admin': {
        permissions: [
            PERMISSIONS.DASHBOARD,
            PERMISSIONS.STUDENTS,
            PERMISSIONS.TEACHERS,
            PERMISSIONS.USER_MANAGEMENT,
            PERMISSIONS.CHAT,
            // Actions
            PERMISSIONS.CREATE_STUDENT,
            PERMISSIONS.EDIT_STUDENT,
            PERMISSIONS.DELETE_STUDENT,
            PERMISSIONS.CREATE_TEACHER,
            PERMISSIONS.EDIT_TEACHER,
            PERMISSIONS.DELETE_TEACHER,
            PERMISSIONS.CREATE_PARENT,
            PERMISSIONS.EDIT_PARENT,
            PERMISSIONS.DELETE_PARENT,
        ],
        description: 'User management - students, teachers, parents'
    },

    'Teacher': {
        permissions: [
            PERMISSIONS.DASHBOARD,
            PERMISSIONS.SCHEDULE,
            PERMISSIONS.GRADEBOOK,
            PERMISSIONS.TASKS,
            PERMISSIONS.CHAT,
            // Actions
            PERMISSIONS.MANAGE_GRADES, // For their own classes
        ],
        description: 'View schedules and manage grades for assigned classes'
    },

    'Parent': {
        permissions: [
            PERMISSIONS.DASHBOARD,
            PERMISSIONS.FEES, // View only
            PERMISSIONS.SCHEDULE, // View only
            PERMISSIONS.GRADEBOOK, // View only for their children
        ],
        description: 'View-only access for their children\'s information'
    }
};

/**
 * Get permissions for a role
 * @param {string} role - The role name
 * @returns {string[]} - Array of permission strings
 */
export const getPermissionsForRole = (role) => {
    if (role === 'Super Admin') {
        return Object.values(PERMISSIONS); // All permissions
    }
    return ROLE_PERMISSIONS[role]?.permissions || [];
};

/**
 * Check if a role has a specific permission
 * @param {string} role - The role name
 * @param {string} permission - The permission to check
 * @returns {boolean}
 */
export const roleHasPermission = (role, permission) => {
    if (role === 'Super Admin') return true; // Super Admin bypass
    const rolePerms = ROLE_PERMISSIONS[role]?.permissions || [];
    return rolePerms.includes(permission);
};

/**
 * Get all available roles
 * @returns {string[]}
 */
export const getAllRoles = () => Object.keys(ROLE_PERMISSIONS);

/**
 * Get role description
 * @param {string} role
 * @returns {string}
 */
export const getRoleDescription = (role) => ROLE_PERMISSIONS[role]?.description || 'Unknown role';
