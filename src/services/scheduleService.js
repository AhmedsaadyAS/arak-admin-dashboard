import { api } from './api';

export const scheduleService = {
    /**
     * Get all schedule entries
     */
    getAllSchedules: async () => {
        try {
            const response = await api.client.get('/schedules');
            return response.data;
        } catch (error) {
            console.error("Failed to fetch schedules", error);
            throw error;
        }
    },

    /**
     * Add a new lesson and automatically sync teacher's assigned classes
     * @param {object} lessonData - { teacherId, classId, subject, day, startTime, endTime }
     * @param {function} showToast - Optional toast function for feedback
     */
    addLesson: async (lessonData, showToast) => {
        try {
            // 1. Fetch teacher to check assigned classes
            const teacher = await api.getTeacherById(lessonData.teacherId);
            const currentClasses = teacher.assignedClasses || [];
            const newClassId = parseInt(lessonData.classId);

            // 2. Check if class needs to be assigned
            if (!currentClasses.includes(newClassId)) {
                // 3. ATOMIC SYNC: Update teacher's assignedClasses
                const updatedClasses = [...currentClasses, newClassId];

                await api.client.patch(`/teachers/${lessonData.teacherId}`, {
                    assignedClasses: updatedClasses
                });

                console.log(`[Sync] Auto-assigned class ${newClassId} to teacher ${lessonData.teacherId}`);

                if (showToast) {
                    showToast('success', 'Class automatically assigned to teacher profile');
                }
            }

            // 4. Create schedule entry
            const response = await api.client.post('/schedules', lessonData);
            return response.data;
        } catch (error) {
            console.error("Failed to add lesson with sync", error);
            if (showToast) {
                showToast('error', 'Failed to save lesson');
            }
            throw error;
        }
    },

    /**
     * Delete a schedule entry
     * @param {number} id 
     */
    deleteSchedule: async (id) => {
        try {
            await api.client.delete(`/schedules/${id}`);
        } catch (error) {
            console.error("Failed to delete schedule", error);
            throw error;
        }
    }
};
