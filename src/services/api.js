import axios from 'axios';

const BASE_URL = 'http://localhost:5000';
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
            // Optional: Dispatch event or redirect logic could go here
            console.error('Unauthorized! Token might be expired.');
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

        // JSON Server v1 beta returns { data: [...], items: total, ... } for paginated requests
        if (response.data && Array.isArray(response.data.data)) {
            return {
                data: response.data.data,
                total: response.data.items
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

    // --- Other ---

    getEvents: async () => {
        const response = await apiClient.get('/events');
        return response.data;
    },

    getFees: async () => {
        const response = await apiClient.get('/fees');
        return response.data;
    }
};
