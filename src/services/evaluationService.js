import { api } from './api';

/**
 * Service for Evaluation & Grade Management.
 * Mirrors the structure expected by the future C# ASP.NET Controller.
 */
export const evaluationService = {

    /**
     * Fetch grades for a specific class and subject.
     * @param {string|number} classId 
     * @param {string} subject 
     */
    getClassGrades: async (classId, subject) => {
        try {
            // Strong Typing: Ensure ID is an integer for SQL compatibility
            const numericClassId = parseInt(classId, 10);
            if (isNaN(numericClassId)) throw new Error("Invalid Class ID");

            // Mock Endpoint: In real backend, this would be GET /api/evaluations?classId=1&subject=Math
            // For now, we simulate fetching all evaluations and filtering client-side if needed, 
            // or assume the endpoint handles it.
            const response = await api.client.get('/evaluations', {
                params: {
                    classId: numericClassId,
                    subject: subject
                }
            });

            return response.data;
        } catch (error) {
            console.error("EvaluationService: Failed to fetch class grades", error);
            throw error; // Re-throw to be handled by UI Error Boundary
        }
    },

    /**
     * Get a summary of student performance (Marks by Exam Type).
     * @param {string|number} studentId 
     */
    getStudentPerformance: async (studentId) => {
        try {
            const numericId = parseInt(studentId, 10);
            const response = await api.client.get('/evaluations', {
                params: { studentId: numericId }
            });
            return response.data;
        } catch (error) {
            console.error("EvaluationService: Connection Failed", error);
            return []; // Fail gracefully
        }
    },

    /**
     * Admin: Lock grades for a class to prevent further editing.
     * @param {number} classId 
     * @param {boolean} isLocked 
     */
    setGradeLockStatus: async (classId, isLocked) => {
        try {
            // Mocking a status update. 
            // In a real DB, this might update a 'GradeLock' table.
            console.log(`[Audit] Admin setting lock status for Class ${classId} to ${isLocked}`);
            return { success: true, message: `Grades ${isLocked ? 'Locked' : 'Unlocked'}` };
        } catch (error) {
            throw new Error("Failed to update lock status");
        }
    }
};
