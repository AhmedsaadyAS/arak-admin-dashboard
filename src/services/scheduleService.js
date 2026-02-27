import { api } from './api';

/**
 * ID Type Validation Utilities
 */
const normalizeId = (id) => {
    if (id === null || id === undefined) return null;
    const numId = Number(id);
    return isNaN(numId) ? null : numId;
};

const ensureNumericId = (id, fieldName = 'id') => {
    const normalized = normalizeId(id);
    if (normalized === null) {
        throw new Error(`Invalid ${fieldName}: must be a valid number`);
    }
    return normalized;
};

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
     * @returns {Promise<object>} Created schedule entry
     */
    addLessonWithSync: async (lessonData, showToast) => {
        try {
            // Validate and normalize IDs
            const teacherId = ensureNumericId(lessonData.teacherId, 'teacherId');
            const classId = ensureNumericId(lessonData.classId, 'classId');

            // 1. Fetch teacher to check assigned classes
            const teacher = await api.getTeacherById(teacherId);
            if (!teacher) {
                throw new Error(`Teacher with ID ${teacherId} not found`);
            }

            const currentClasses = teacher.assignedClasses || [];
            let teacherUpdated = false;

            // 2. Check if class needs to be assigned
            if (!currentClasses.includes(classId)) {
                // 3. ATOMIC SYNC: Update teacher's assignedClasses first
                const updatedClasses = [...new Set([...currentClasses, classId])]; // Use Set to prevent duplicates

                await api.client.patch(`/teachers/${teacherId}`, {
                    assignedClasses: updatedClasses
                });

                teacherUpdated = true;

                if (showToast) {
                    showToast('success', `Class automatically assigned to teacher ${teacher.name}`);
                }
            }

            // 4. Create schedule entry with normalized IDs
            const normalizedLesson = {
                ...lessonData,
                teacherId,
                classId
            };

            const response = await api.client.post('/schedules', normalizedLesson);

            if (showToast && !teacherUpdated) {
                showToast('success', 'Lesson added successfully');
            }

            return response.data;
        } catch (error) {
            console.error("Failed to add lesson with sync", error);

            if (showToast) {
                showToast('error', error.message || 'Failed to save lesson');
            }
            throw error;
        }
    },

    /**
     * Alias for addLessonWithSync (for clarity in code)
     */
    addLesson: async (lessonData, showToast) => {
        return scheduleService.addLessonWithSync(lessonData, showToast);
    },

    /**
     * Update teacher's assigned classes and sync schedules
     * Validates that removing a class won't orphan schedules
     * @param {number} teacherId 
     * @param {Array<number>} newClassIds 
     * @param {function} showToast 
     * @returns {Promise<{updated: boolean, orphanedSchedules: Array}>}
     */
    syncTeacherClasses: async (teacherId, newClassIds, showToast) => {
        try {
            const numericTeacherId = ensureNumericId(teacherId, 'teacherId');
            const normalizedClassIds = newClassIds.map(id => ensureNumericId(id, 'classId'));

            // 1. Fetch current teacher data
            const teacher = await api.getTeacherById(numericTeacherId);
            if (!teacher) {
                throw new Error(`Teacher with ID ${numericTeacherId} not found`);
            }

            const currentClassIds = (teacher.assignedClasses || []).map(id => normalizeId(id));
            const removedClassIds = currentClassIds.filter(id => !normalizedClassIds.includes(id));

            // 2. Check for orphaned schedules
            if (removedClassIds.length > 0) {
                const orphanedSchedules = [];

                for (const classId of removedClassIds) {
                    const response = await api.client.get('/schedules', {
                        params: { teacherId: numericTeacherId, classId }
                    });

                    if (response.data && response.data.length > 0) {
                        orphanedSchedules.push(...response.data);
                    }
                }

                if (orphanedSchedules.length > 0) {
                    return {
                        updated: false,
                        orphanedSchedules,
                        message: `Cannot remove classes: ${removedClassIds.length} class(es) have ${orphanedSchedules.length} active schedule(s)`
                    };
                }
            }

            // 3. Update teacher's assigned classes
            await api.client.patch(`/teachers/${numericTeacherId}`, {
                assignedClasses: normalizedClassIds
            });

            if (showToast) {
                showToast('success', 'Teacher classes updated successfully');
            }

            return {
                updated: true,
                orphanedSchedules: [],
                message: 'Classes updated successfully'
            };
        } catch (error) {
            console.error("Failed to sync teacher classes", error);

            if (showToast) {
                showToast('error', error.message || 'Failed to update teacher classes');
            }
            throw error;
        }
    },

    /**
     * Update an existing schedule entry
     * @param {number} id - Schedule ID to update
     * @param {object} lessonData - Updated lesson data
     * @param {function} showToast - Optional toast function for feedback
     * @returns {Promise<object>} Updated schedule entry
     */
    updateSchedule: async (id, lessonData, showToast) => {
        try {
            const numericId = ensureNumericId(id, 'scheduleId');
            const teacherId = ensureNumericId(lessonData.teacherId, 'teacherId');
            const classId = ensureNumericId(lessonData.classId, 'classId');

            // Normalize the lesson data
            const normalizedLesson = {
                ...lessonData,
                teacherId,
                classId
            };

            // Update the schedule
            const response = await api.client.put(`/schedules/${numericId}`, normalizedLesson);

            // Check if teacher assignment needs updating
            const teacher = await api.getTeacherById(teacherId);
            if (teacher) {
                const currentClasses = teacher.assignedClasses || [];
                if (!currentClasses.includes(classId)) {
                    const updatedClasses = [...new Set([...currentClasses, classId])];
                    await api.client.patch(`/teachers/${teacherId}`, {
                        assignedClasses: updatedClasses
                    });

                    if (showToast) {
                        showToast('success', 'Lesson updated and teacher class assignment synced');
                    }
                } else if (showToast) {
                    showToast('success', 'Lesson updated successfully');
                }
            }

            return response.data;
        } catch (error) {
            console.error("Failed to update schedule", error);

            if (showToast) {
                showToast('error', error.message || 'Failed to update lesson');
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
            const numericId = ensureNumericId(id, 'scheduleId');
            await api.client.delete(`/schedules/${numericId}`);
        } catch (error) {
            console.error("Failed to delete schedule", error);
            throw error;
        }
    }
};
