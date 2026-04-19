import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'arak_auth_token';

// Create Centralized Axios Instance
const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor: Add Auth Token
apiClient.interceptors.request.use(
    (config) => {
        // Check both local and session storage
        const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle global errors like 401 Unauthorized
        if (error.response && error.response.status === 401) {
            console.error('Unauthorized! Token might be expired.');
            localStorage.removeItem(TOKEN_KEY);
            sessionStorage.removeItem(TOKEN_KEY);
            // Redirect to login page to force user to get a fresh token
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const api = {
    // Expose client if needed directly
    client: apiClient,

    // --- System ---
    getSystemHealth: async () => {
        try {
            const response = await apiClient.get('/metrics');
            return response.data;
        } catch (error) {
            console.warn("System Health Check Failed");
            return { systemHealth: "Offline", serverUptime: "0%" };
        }
    },

    checkHealth: async () => {
        try {
            const metrics = await api.getSystemHealth();
            return !!metrics;
        } catch {
            return false;
        }
    },

    // --- Students ---

    /**
     * Get students with support for pagination and filtering.
     * Returns an object { data, total } to support pagination.
     * @param {Object} params - { _page, _limit, q, grade, ... }
     */
    getStudents: async (params = {}) => {
        // Adapt params for JSON Server v1 beta
        const apiParams = { ...params };
        if (apiParams._limit) {
            apiParams._per_page = apiParams._limit;
            delete apiParams._limit;
        }

        const response = await apiClient.get('/students', { params: apiParams });

        // JSON Server v1 beta returned items vs new Backend returns total
        if (response.data && Array.isArray(response.data.data)) {
            return {
                data: response.data.data,
                total: response.data.total ?? response.data.items ?? 0
            };
        }

        // Fallback for non-paginated or older version (array response)
        return {
            data: response.data,
            total: parseInt(response.headers['x-total-count'] || response.data.length || '0', 10)
        };
    },

    getStudentById: async (id) => {
        const numericId = parseInt(id, 10);
        const response = await apiClient.get(`/students/${numericId}`);
        return response.data;
    },

    createStudent: async (studentData) => {
        const response = await apiClient.post('/students', studentData);
        return response.data;
    },

    updateStudent: async (id, studentData) => {
        const numericId = parseInt(id, 10);
        const response = await apiClient.put(`/students/${numericId}`, studentData);
        return response.data;
    },

    deleteStudent: async (id) => {
        const numericId = parseInt(id, 10);

        // Data Integrity: Check for dependencies before deletion
        try {
            const [attendance, evaluations] = await Promise.all([
                apiClient.get('/attendance', { params: { studentId: numericId } }),
                apiClient.get('/evaluations', { params: { studentId: numericId } })
            ]);

            const dependencies = {
                attendance: attendance.data?.length || 0,
                evaluations: evaluations.data?.length || 0
            };

            const totalDeps = dependencies.attendance + dependencies.evaluations;

            if (totalDeps > 0) {
                const error = new Error("Cannot delete student with existing records");
                error.dependencies = dependencies;
                throw error;
            }

            // Safe to delete
            const response = await apiClient.delete(`/students/${numericId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // --- Teachers ---

    getTeachers: async (params = {}) => {
        const response = await apiClient.get('/teachers', { params });
        return response.data;
    },

    getTeacherById: async (id) => {
        const numericId = parseInt(id, 10);
        const response = await apiClient.get(`/teachers/${numericId}`);
        return response.data;
    },

    createTeacher: async (teacherData) => {
        const response = await apiClient.post('/teachers', teacherData);
        return response.data;
    },

    updateTeacher: async (id, teacherData) => {
        const numericId = parseInt(id, 10);
        const response = await apiClient.put(`/teachers/${numericId}`, teacherData);
        return response.data;
    },

    deleteTeacher: async (id) => {
        const numericId = parseInt(id, 10);

        // Data Integrity: Check for dependencies before deletion
        try {
            const [classes, tasks, schedules] = await Promise.all([
                apiClient.get('/classes', { params: { teacherId: numericId } }),
                apiClient.get('/tasks', { params: { teacherId: numericId } }),
                apiClient.get('/schedules', { params: { teacherId: numericId } })
            ]);

            const dependencies = {
                classes: classes.data?.length || 0,
                tasks: tasks.data?.length || 0,
                schedules: schedules.data?.length || 0
            };

            const totalDeps = dependencies.classes + dependencies.tasks + dependencies.schedules;

            if (totalDeps > 0) {
                // Throw error with dependency details for UI to handle
                const error = new Error("Cannot delete teacher with active dependencies");
                error.dependencies = dependencies;
                throw error;
            }

            // Safe to delete
            const response = await apiClient.delete(`/teachers/${numericId}`);
            return response.data;
        } catch (error) {
            // Re-throw with dependency info if available
            throw error;
        }
    },

    // --- Schedules ---

    /**
     * Get schedules by classId
     * @param {string|number} classId
     */
    /**
     * Get schedules by classId
     * @param {string|number} classId
     */
    getSchedulesByClass: async (classId) => {
        const response = await apiClient.get('/schedules', {
            params: { classId: parseInt(classId, 10) }
        });
        return response.data || [];
    },

    /**
     * Get schedules by teacherId
     * @param {string|number} teacherId
     */
    getSchedulesByTeacher: async (teacherId) => {
        const response = await apiClient.get('/schedules', {
            params: { teacherId: parseInt(teacherId, 10) }
        });
        return response.data || [];
    },

    /**
     * Get all schedules
     */
    getSchedules: async (params = {}) => {
        const response = await apiClient.get('/schedules', { params });
        return response.data || [];
    },

    // --- Other ---

    getEvents: async () => {
        const response = await apiClient.get('/events');
        return response.data;
    },

    getFees: async () => {
        const response = await apiClient.get('/fees');
        return response.data;
    },

    // --- Users (Admin) ---

    getUsers: async (params = {}) => {
        const response = await apiClient.get('/users', { params });
        return response.data || [];
    },

    getUserById: async (id) => {
        const response = await apiClient.get(`/users/${id}`);
        return response.data;
    },

    createUser: async (userData) => {
        const response = await apiClient.post('/users', userData);
        return response.data;
    },

    updateUser: async (id, userData) => {
        const response = await apiClient.patch(`/users/${id}`, userData);
        return response.data;
    },

    deleteUser: async (id) => {
        const response = await apiClient.delete(`/users/${id}`);
        return response.data;
    },

    // --- Parents ---

    getParents: async (params = {}) => {
        const response = await apiClient.get('/parents', { params });
        return response.data || [];
    },

    getParentById: async (id) => {
        const response = await apiClient.get(`/parents/${id}`);
        return response.data;
    },

    createParent: async (parentData) => {
        const response = await apiClient.post('/parents', parentData);
        return response.data;
    },

    updateParent: async (id, parentData) => {
        const response = await apiClient.put(`/parents/${id}`, parentData);
        return response.data;
    },

    deleteParent: async (id) => {
        const response = await apiClient.delete(`/parents/${id}`);
        return response.data;
    },

    // --- Roles ---

    getRoles: async () => {
        const response = await apiClient.get('/roles');
        return response.data || [];
    },

    // --- Classes ---

    getClasses: async (params = {}) => {
        const response = await apiClient.get('/classes', { params });
        return response.data || [];
    },

    updateClass: async (id, data) => {
        const response = await apiClient.patch(`/classes/${id}`, data);
        return response.data;
    },

    // --- Subjects ---

    getSubjects: async (params = {}) => {
        const response = await apiClient.get('/subjects', { params });
        return response.data || [];
    },

    // --- Evaluations ---

    getEvaluations: async (params = {}) => {
        const response = await apiClient.get('/evaluations', { params });
        return response.data || [];
    },

    createEvaluation: async (data) => {
        const response = await apiClient.post('/evaluations', data);
        return response.data;
    },

    deleteEvaluation: async (id) => {
        const response = await apiClient.delete(`/evaluations/${id}`);
        return response.data;
    },

    // --- Attendance ---

    getAttendanceByClass: async (classId, date, page = 1, pageSize = 30) => {
        const response = await apiClient.get(`/attendance/class/${classId}`, {
            params: { date, page, pageSize }
        });
        return response.data;
    },

    markAttendance: async (data) => {
        const response = await apiClient.post('/attendance', data);
        return response.data;
    },

    bulkMarkAttendance: async (data) => {
        const response = await apiClient.post('/attendance/bulk', data);
        return response.data;
    },

    updateAttendance: async (id, data) => {
        const response = await apiClient.put(`/attendance/${id}`, data);
        return response.data;
    },

    getStudentAttendanceByMonth: async (studentId, month, year) => {
        const response = await apiClient.get(`/attendance/student/${studentId}`, {
            params: { month, year }
        });
        return response.data;
    },

    getStudentAttendanceStats: async (studentId) => {
        const response = await apiClient.get(`/attendance/student/${studentId}/stats`);
        return response.data;
    },

    bulkUpdateTimeOut: async (data) => {
        const response = await apiClient.put('/attendance/bulk-timeout', data);
        return response.data;
    },
};
