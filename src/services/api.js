const BASE_URL = 'http://localhost:5000';

class ApiError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
        this.name = "ApiError";
    }
}

/**
 * Validates and transforms the API response.
 * @param {Response} response 
 * @returns {Promise<any>}
 */
async function handleResponse(response) {
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error: ${response.status} ${response.statusText}`, errorText);
        throw new ApiError(`Request failed: ${response.statusText} (${response.status})`, response.status);
    }
    // Handle 204 No Content
    if (response.status === 204) {
        return null;
    }
    return response.json();
}

/**
 * Builds a query string from an object.
 * @param {Object} params 
 * @returns {string}
 */
function buildQueryString(params = {}) {
    const query = new URLSearchParams();
    Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            query.append(key, params[key]);
        }
    });
    const queryString = query.toString();
    return queryString ? `?${queryString}` : '';
}

export const api = {
    /**
     * Generic HTTP Request Wrapper
     * @param {string} endpoint 
     * @param {Object} options 
     */
    request: async (endpoint, options = {}) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            };

            const response = await fetch(`${BASE_URL}${endpoint}`, config);
            return handleResponse(response);
        } catch (error) {
            console.error(`Network or Parsing Error for ${endpoint}:`, error);
            // Re-throw to allow components to handle specific error UI
            throw error;
        }
    },

    // --- System & Metrics ---

    /**
     * Checks DB connection and returns system metrics.
     */
    getSystemHealth: async () => {
        try {
            return await api.request('/metrics');
        } catch (error) {
            console.warn("System Health Check Failed");
            return { systemHealth: "Offline", serverUptime: "0%" };
        }
    },

    checkHealth: async () => {
        // Simple boolean check for the UI indicator
        try {
            const metrics = await api.getSystemHealth();
            return !!metrics;
        } catch {
            return false;
        }
    },

    // --- Students CRUD ---

    /**
     * Get all students with optional matching params for search.
     * @param {Object} params - e.g. { q: 'John', grade: 'VII A' }
     */
    getStudents: async (params = {}) => {
        const qs = buildQueryString(params);
        return api.request(`/students${qs}`);
    },

    getStudentById: async (id) => {
        return api.request(`/students/${id}`);
    },

    createStudent: async (studentData) => {
        return api.request('/students', {
            method: 'POST',
            body: JSON.stringify(studentData)
        });
    },

    updateStudent: async (id, studentData) => {
        return api.request(`/students/${id}`, {
            method: 'PUT', // or PATCH
            body: JSON.stringify(studentData)
        });
    },

    deleteStudent: async (id) => {
        return api.request(`/students/${id}`, {
            method: 'DELETE'
        });
    },

    // --- Teachers CRUD ---

    /**
     * Get all teachers with optional search.
     * @param {Object} params - e.g. { q: 'Math' }
     */
    getTeachers: async (params = {}) => {
        const qs = buildQueryString(params);
        return api.request(`/teachers${qs}`);
    },

    getTeacherById: async (id) => {
        return api.request(`/teachers/${id}`);
    },

    createTeacher: async (teacherData) => {
        return api.request('/teachers', {
            method: 'POST',
            body: JSON.stringify(teacherData)
        });
    },

    updateTeacher: async (id, teacherData) => {
        return api.request(`/teachers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(teacherData)
        });
    },

    deleteTeacher: async (id) => {
        return api.request(`/teachers/${id}`, {
            method: 'DELETE'
        });
    },

    // --- Events & Fees (Placeholders for Future Expansion) ---

    getEvents: async () => {
        return api.request('/events');
    },

    getFees: async () => {
        return api.request('/fees');
    }
};
