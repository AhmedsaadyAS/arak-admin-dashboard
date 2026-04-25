import { api } from './api';
import { ensureNumericId, normalizeId } from '../utils/idValidation';

/**
 * Task Service
 * Handles homework/task monitoring operations for Admins
 * Mirrors expected ASP.NET Core structure
 * Now with centralized ID validation
 */
export const taskService = {

    /**
     * Get all tasks with optional filtering
     * @param {Object} params - Query parameters {teacherId, classId, status}
     */
    getAllTasks: async (params = {}) => {
        try {
            // Normalize any ID parameters
            const normalizedParams = { ...params };
            if (params.teacherId) {
                normalizedParams.teacherId = normalizeId(params.teacherId);
            }
            if (params.classId) {
                normalizedParams.classId = normalizeId(params.classId);
            }

            const response = await api.client.get('/tasks', { params: normalizedParams });
            return response.data;
        } catch (error) {
            console.error("TaskService: Failed to fetch tasks", error);
            throw error;
        }
    },

    /**
     * Get a single task by ID
     * @param {number|string} id 
     */
    getTaskById: async (id) => {
        try {
            const numericId = ensureNumericId(id, 'taskId');
            const response = await api.client.get(`/tasks/${numericId}`);
            return response.data;
        } catch (error) {
            console.error("TaskService: Failed to fetch task", error);
            throw error;
        }
    },

    /**
     * Get tasks assigned by a specific teacher
     * @param {number|string} teacherId 
     */
    getTasksByTeacher: async (teacherId) => {
        try {
            const numericId = ensureNumericId(teacherId, 'teacherId');
            const response = await api.client.get('/tasks', {
                params: { teacherId: numericId }
            });
            return response.data;
        } catch (error) {
            console.error("TaskService: Failed to fetch teacher tasks", error);
            throw error;
        }
    },

    /**
     * Get tasks for a specific class
     * @param {number|string} classId 
     */
    getTasksByClass: async (classId) => {
        try {
            const numericId = ensureNumericId(classId, 'classId');
            const response = await api.client.get('/tasks', {
                params: { classId: numericId }
            });
            return response.data;
        } catch (error) {
            console.error("TaskService: Failed to fetch class tasks", error);
            throw error;
        }
    },

    /**
     * Create a new task
     * @param {Object} taskData - { teacherId, title, description, dueDate, status }
     */
    createTask: async (taskData) => {
        try {
            // Validate and normalize IDs
            const normalizedData = { ...taskData };
            if (taskData.teacherId) {
                normalizedData.teacherId = ensureNumericId(taskData.teacherId, 'teacherId');
            }
            if (taskData.classId) {
                normalizedData.classId = ensureNumericId(taskData.classId, 'classId');
            }

            const response = await api.client.post('/tasks', normalizedData);
            return response.data;
        } catch (error) {
            console.error("TaskService: Failed to create task", error);
            throw error;
        }
    },

    /**
     * Delete inappropriate task (Admin quality control)
     * @param {number|string} id 
     */
    deleteTask: async (id) => {
        try {
            const numericId = ensureNumericId(id, 'taskId');
            const response = await api.client.delete(`/tasks/${numericId}`);
            return response.data;
        } catch (error) {
            console.error("TaskService: Failed to delete task", error);
            throw error;
        }
    },

    /**
     * Update a task
     * @param {number|string} id 
     * @param {Object} updates 
     */
    updateTask: async (id, updates) => {
        try {
            const numericId = ensureNumericId(id, 'taskId');

            // Normalize any ID fields in updates
            const normalizedUpdates = { ...updates };
            if (updates.teacherId) {
                normalizedUpdates.teacherId = ensureNumericId(updates.teacherId, 'teacherId');
            }
            if (updates.classId) {
                normalizedUpdates.classId = ensureNumericId(updates.classId, 'classId');
            }

            const response = await api.client.put(`/tasks/${numericId}`, normalizedUpdates);
            return response.data;
        } catch (error) {
            console.error("TaskService: Failed to update task", error);
            throw error;
        }
    },

    /**
     * Get task completion statistics
     * Note: In real backend, this would aggregate from student submissions
     * For now, returns mock analytics
     */
    getTaskStats: async () => {
        try {
            const tasks = await api.client.get('/tasks');
            const total = tasks.data.length;

            // Mock completion rate (60-80%)
            const completionRate = Math.floor(Math.random() * 20) + 60;

            return {
                totalTasks: total,
                completionRate: completionRate,
                pendingTasks: Math.floor(total * (100 - completionRate) / 100),
                completedTasks: Math.floor(total * completionRate / 100)
            };
        } catch (error) {
            console.error("TaskService: Failed to fetch stats", error);
            return {
                totalTasks: 0,
                completionRate: 0,
                pendingTasks: 0,
                completedTasks: 0
            };
        }
    }
};
