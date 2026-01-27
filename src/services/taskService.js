import { api } from './api';

/**
 * Task Service
 * Handles homework/task monitoring operations for Admins
 * Mirrors expected ASP.NET Core structure
 */
export const taskService = {

    /**
     * Get all tasks with optional filtering
     * @param {Object} params - Query parameters {teacherId, classId, status}
     */
    getAllTasks: async (params = {}) => {
        try {
            const response = await api.client.get('/tasks', { params });
            return response.data;
        } catch (error) {
            console.error("TaskService: Failed to fetch tasks", error);
            throw error;
        }
    },

    /**
     * Get tasks assigned by a specific teacher
     * @param {number|string} teacherId 
     */
    getTasksByTeacher: async (teacherId) => {
        try {
            const numericId = parseInt(teacherId, 10);
            if (isNaN(numericId)) throw new Error("Invalid Teacher ID");

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
            const numericId = parseInt(classId, 10);
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
     * Delete inappropriate task (Admin quality control)
     * @param {number|string} id 
     */
    deleteTask: async (id) => {
        try {
            const numericId = parseInt(id, 10);
            const response = await api.client.delete(`/tasks/${numericId}`);
            return response.data;
        } catch (error) {
            console.error("TaskService: Failed to delete task", error);
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
