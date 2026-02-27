import { api } from './api';

/**
 * Service for Evaluation & Grade Management.
 * Mirrors the structure expected by the future C# ASP.NET Controller.
 */
export const evaluationService = {

    /**
     * Fetch grades for a specific class and subject.
     * Optionally filter by assessmentType.
     * @param {string|number} classId 
     * @param {string|number} subjectId 
     * @param {string} [assessmentType]  optional filter
     */
    getClassGrades: async (classId, subjectId, assessmentType = null) => {
        try {
            const params = {
                classId: parseInt(classId, 10),
                subjectId: parseInt(subjectId, 10),
            };
            if (isNaN(params.classId)) throw new Error('Invalid Class ID');
            if (isNaN(params.subjectId)) throw new Error('Invalid Subject ID');

            if (assessmentType && assessmentType !== 'All') {
                params.assessmentType = assessmentType;
            }

            const response = await api.client.get('/evaluations', { params });
            const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
            return data;
        } catch (error) {
            console.error('EvaluationService: Failed to fetch class grades', error);
            throw error;
        }
    },

    /**
     * Fetch ALL evaluations for a class (all subjects).
     * Used for multi-scope exports.
     * @param {string|number} classId
     * @param {string} [assessmentType]  optional filter
     */
    getClassAllSubjects: async (classId, assessmentType = null) => {
        try {
            const params = { classId: parseInt(classId, 10) };
            if (isNaN(params.classId)) throw new Error('Invalid Class ID');

            if (assessmentType && assessmentType !== 'All') {
                params.assessmentType = assessmentType;
            }

            const response = await api.client.get('/evaluations', { params });
            const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
            return data;
        } catch (error) {
            console.error('EvaluationService: Failed to fetch all subjects', error);
            return [];
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
            return [];
        }
    },

    /**
     * Admin: Lock grades for a class to prevent further editing.
     * @param {number} classId 
     * @param {boolean} isLocked 
     */
    setGradeLockStatus: async (classId, isLocked) => {
        try {
            await api.client.patch(`/classes/${classId}`, { gradesLocked: isLocked });
            return { success: true, message: `Grades ${isLocked ? 'Locked' : 'Unlocked'}` };
        } catch (error) {
            throw new Error("Failed to update lock status");
        }
    },
};

