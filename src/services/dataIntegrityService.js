import { api } from './api';

/**
 * Data Integrity Service
 * 
 * Provides two categories of functionality:
 * 
 * 1. **Sync helpers** (temporary) — Compensate for json-server's inability to
 *    handle relational writes. These will be REMOVED when the real ASP.NET Core
 *    API is connected, since the backend will own this logic.
 * 
 * 2. **Validation helpers** — Pre-delete reference checks to prevent orphaned
 *    records. These can optionally remain as a frontend safety net.
 */
export const dataIntegrityService = {

    // ══════════════════════════════════════════════════════════════════════════
    //  SYNC HELPERS  (temporary — json-server only)
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * After saving a student, ensure the parent side stays in sync.
     * 
     * Logic:
     *   - If student has a parentId → add student.id to that parent's linkedStudents
     *   - If parentId changed → also REMOVE student.id from the OLD parent
     * 
     * @param {Object} savedStudent  The student record just saved (must include .id and .parentId)
     * @param {string|null} oldParentId  The previous parentId (null if new student)
     * @returns {Promise<void>}
     */
    syncStudentToParent: async (savedStudent, oldParentId = null) => {
        try {
            const studentId = savedStudent.id;
            const newParentId = savedStudent.parentId;

            // ── Remove from OLD parent ──────────────────────────────────────
            if (oldParentId && oldParentId !== newParentId) {
                try {
                    const oldParent = await api.getParentById(oldParentId);
                    if (oldParent && Array.isArray(oldParent.linkedStudents)) {
                        const updated = oldParent.linkedStudents.filter(
                            id => String(id) !== String(studentId)
                        );
                        if (updated.length !== oldParent.linkedStudents.length) {
                            await api.updateParent(oldParentId, { linkedStudents: updated });
                            console.log(`[Sync] Removed student ${studentId} from old parent ${oldParentId}`);
                        }
                    }
                } catch (err) {
                    // Old parent may have been deleted — safe to ignore
                    console.warn(`[Sync] Old parent ${oldParentId} not found, skipping removal.`);
                }
            }

            // ── Add to NEW parent ───────────────────────────────────────────
            if (newParentId) {
                try {
                    const newParent = await api.getParentById(newParentId);
                    if (newParent) {
                        const linked = Array.isArray(newParent.linkedStudents)
                            ? newParent.linkedStudents
                            : [];

                        const alreadyLinked = linked.some(id => String(id) === String(studentId));
                        if (!alreadyLinked) {
                            await api.updateParent(newParentId, {
                                linkedStudents: [...linked, studentId]
                            });
                            console.log(`[Sync] Added student ${studentId} to parent ${newParentId}`);
                        }
                    }
                } catch (err) {
                    console.warn(`[Sync] Parent ${newParentId} not found. Student saved without parent link.`);
                }
            }
        } catch (error) {
            console.error('[Sync] syncStudentToParent failed:', error);
            // Don't throw — sync failure shouldn't block the primary save
        }
    },

    /**
     * After saving a parent, update all linked students' denormalized fields.
     * 
     * Logic:
     *   - For each student ID in parent.linkedStudents → PATCH student with parent info
     *   - For students that were REMOVED from linkedStudents → clear their parent fields
     * 
     * @param {Object} savedParent  The parent record just saved
     * @param {Array}  oldLinkedStudents  The previous linkedStudents array ([] if new)
     * @returns {Promise<void>}
     */
    syncParentToStudents: async (savedParent, oldLinkedStudents = []) => {
        try {
            const parentId = savedParent.id;
            const newLinked = savedParent.linkedStudents || [];
            const oldLinked = oldLinkedStudents || [];

            const parentFields = {
                parentId: parentId,
                parentName: savedParent.parentName || null,
                parentEmail: savedParent.email || null,
                parentPhone: savedParent.phone || null,
            };

            // ── Update ADDED / KEPT students ────────────────────────────────
            for (const studentId of newLinked) {
                try {
                    await api.updateStudent(studentId, parentFields);
                    console.log(`[Sync] Updated student ${studentId} with parent ${parentId} info`);
                } catch (err) {
                    console.warn(`[Sync] Failed to update student ${studentId}:`, err.message);
                }
            }

            // ── Clear REMOVED students ──────────────────────────────────────
            const removedIds = oldLinked.filter(
                id => !newLinked.some(nid => String(nid) === String(id))
            );

            for (const studentId of removedIds) {
                try {
                    await api.updateStudent(studentId, {
                        parentId: null,
                        parentName: null,
                        parentEmail: null,
                        parentPhone: null,
                    });
                    console.log(`[Sync] Cleared parent fields on student ${studentId}`);
                } catch (err) {
                    console.warn(`[Sync] Failed to clear student ${studentId}:`, err.message);
                }
            }
        } catch (error) {
            console.error('[Sync] syncParentToStudents failed:', error);
        }
    },

    // ══════════════════════════════════════════════════════════════════════════
    //  VALIDATION HELPERS  (pre-delete reference checks)
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Check if a student can be safely deleted.
     * @param {number|string} studentId 
     * @returns {Promise<{canDelete: boolean, dependencies: Object, message: string}>}
     */
    validateStudentReferences: async (studentId) => {
        try {
            const numericId = parseInt(studentId, 10);

            const [attendance, evaluations] = await Promise.all([
                api.client.get(`/attendance/student/${numericId}`),
                api.client.get('/evaluations', { params: { studentId: numericId } }),
            ]);

            const dependencies = {
                attendance: attendance.data || [],
                evaluations: evaluations.data || [],
                totalCount: (attendance.data?.length || 0) + (evaluations.data?.length || 0),
            };

            return {
                canDelete: dependencies.totalCount === 0,
                dependencies,
                message: dependencies.totalCount > 0
                    ? `Student has ${dependencies.attendance.length} attendance record(s) and ${dependencies.evaluations.length} evaluation(s)`
                    : 'No dependencies found',
            };
        } catch (error) {
            console.error('Failed to validate student references:', error);
            return { canDelete: false, dependencies: {}, message: 'Error checking dependencies' };
        }
    },

    /**
     * Check if a teacher can be safely deleted.
     * @param {number|string} teacherId 
     * @returns {Promise<{canDelete: boolean, dependencies: Object, message: string}>}
     */
    validateTeacherReferences: async (teacherId) => {
        try {
            const numericId = parseInt(teacherId, 10);

            const [students, classes, tasks, schedules] = await Promise.all([
                api.getStudents({ teacherId: numericId }),
                api.client.get('/classes', { params: { teacherId: numericId } }),
                api.client.get('/tasks', { params: { teacherId: numericId } }),
                api.client.get('/schedules', { params: { teacherId: numericId } }),
            ]);

            const dependencies = {
                students: students.data || [],
                classes: classes.data || [],
                tasks: tasks.data || [],
                schedules: schedules.data || [],
                totalCount:
                    (students.data?.length || 0) +
                    (classes.data?.length || 0) +
                    (tasks.data?.length || 0) +
                    (schedules.data?.length || 0),
            };

            return {
                canDelete: dependencies.totalCount === 0,
                dependencies,
                message: dependencies.totalCount > 0
                    ? `Teacher has ${dependencies.students.length} student(s), ${dependencies.classes.length} class(es), ${dependencies.tasks.length} task(s), and ${dependencies.schedules.length} schedule(s)`
                    : 'No dependencies found',
            };
        } catch (error) {
            console.error('Failed to validate teacher references:', error);
            return { canDelete: false, dependencies: {}, message: 'Error checking dependencies' };
        }
    },

    /**
     * Check if a class can be safely deleted.
     * @param {number|string} classId 
     * @returns {Promise<{canDelete: boolean, dependencies: Object, message: string}>}
     */
    validateClassReferences: async (classId) => {
        try {
            const numericId = parseInt(classId, 10);

            const [students, schedules] = await Promise.all([
                api.getStudents({ classId: numericId }),
                api.client.get('/schedules', { params: { classId: numericId } }),
            ]);

            const dependencies = {
                students: students.data || [],
                schedules: schedules.data || [],
                totalCount: (students.data?.length || 0) + (schedules.data?.length || 0),
            };

            return {
                canDelete: dependencies.totalCount === 0,
                dependencies,
                message: dependencies.totalCount > 0
                    ? `Class has ${dependencies.students.length} student(s) and ${dependencies.schedules.length} schedule(s)`
                    : 'No dependencies found',
            };
        } catch (error) {
            console.error('Failed to validate class references:', error);
            return { canDelete: false, dependencies: {}, message: 'Error checking dependencies' };
        }
    },

    /**
     * Generic function to check if an entity can be deleted.
     * @param {'student'|'teacher'|'class'} entityType 
     * @param {number|string} id 
     * @returns {Promise<{canDelete: boolean, dependencies: Object}>}
     */
    canDeleteEntity: async (entityType, id) => {
        switch (entityType.toLowerCase()) {
            case 'student':
                return await dataIntegrityService.validateStudentReferences(id);
            case 'teacher':
                return await dataIntegrityService.validateTeacherReferences(id);
            case 'class':
                return await dataIntegrityService.validateClassReferences(id);
            default:
                return { canDelete: false, dependencies: {}, message: `Unknown entity type: ${entityType}` };
        }
    },

    /**
     * Find orphaned records across the database.
     * @returns {Promise<Object>}
     */
    getOrphanedRecords: async () => {
        try {
            const [students, teachers, classes, attendance, evaluations, tasks, schedules] = await Promise.all([
                api.getStudents({ _limit: 1000 }),
                api.getTeachers(),
                api.client.get('/classes'),
                api.client.get('/attendance'),
                api.client.get('/evaluations'),
                api.client.get('/tasks'),
                api.client.get('/schedules'),
            ]);

            const teacherIds = new Set(teachers.map(t => t.id));
            const classIds = new Set((classes.data || []).map(c => c.id));
            const studentIds = new Set((students.data || []).map(s => s.id));

            const orphaned = {
                students: [],
                attendance: [],
                evaluations: [],
                tasks: [],
                schedules: [],
            };

            (students.data || []).forEach(student => {
                if (student.teacherId && !teacherIds.has(student.teacherId)) {
                    orphaned.students.push({ ...student, reason: `Invalid teacherId: ${student.teacherId}` });
                }
            });

            (attendance.data || []).forEach(record => {
                if (record.studentId && !studentIds.has(record.studentId)) {
                    orphaned.attendance.push({ ...record, reason: `Invalid studentId: ${record.studentId}` });
                } else if (record.teacherId && !teacherIds.has(record.teacherId)) {
                    orphaned.attendance.push({ ...record, reason: `Invalid teacherId: ${record.teacherId}` });
                }
            });

            (evaluations.data || []).forEach(record => {
                if (record.studentId && !studentIds.has(record.studentId)) {
                    orphaned.evaluations.push({ ...record, reason: `Invalid studentId: ${record.studentId}` });
                } else if (record.teacherId && !teacherIds.has(record.teacherId)) {
                    orphaned.evaluations.push({ ...record, reason: `Invalid teacherId: ${record.teacherId}` });
                }
            });

            (tasks.data || []).forEach(task => {
                if (task.teacherId && !teacherIds.has(task.teacherId)) {
                    orphaned.tasks.push({ ...task, reason: `Invalid teacherId: ${task.teacherId}` });
                }
            });

            (schedules.data || []).forEach(schedule => {
                if (schedule.teacherId && !teacherIds.has(schedule.teacherId)) {
                    orphaned.schedules.push({ ...schedule, reason: `Invalid teacherId: ${schedule.teacherId}` });
                } else if (schedule.classId && !classIds.has(schedule.classId)) {
                    orphaned.schedules.push({ ...schedule, reason: `Invalid classId: ${schedule.classId}` });
                }
            });

            const totalOrphaned =
                orphaned.students.length +
                orphaned.attendance.length +
                orphaned.evaluations.length +
                orphaned.tasks.length +
                orphaned.schedules.length;

            return {
                orphaned,
                totalCount: totalOrphaned,
                summary: {
                    students: orphaned.students.length,
                    attendance: orphaned.attendance.length,
                    evaluations: orphaned.evaluations.length,
                    tasks: orphaned.tasks.length,
                    schedules: orphaned.schedules.length,
                },
            };
        } catch (error) {
            console.error('Failed to detect orphaned records:', error);
            return { orphaned: {}, totalCount: 0, summary: {}, error: error.message };
        }
    },

    /**
     * Validate that a reference exists before creating/updating.
     * @param {'student'|'teacher'|'class'} entityType 
     * @param {number|string} id 
     * @returns {Promise<boolean>}
     */
    validateReference: async (entityType, id) => {
        try {
            const numericId = parseInt(id, 10);
            if (isNaN(numericId)) return false;

            let response;
            switch (entityType.toLowerCase()) {
                case 'student':
                    response = await api.client.get(`/students/${numericId}`);
                    break;
                case 'teacher':
                    response = await api.client.get(`/teachers/${numericId}`);
                    break;
                case 'class':
                    response = await api.client.get(`/classes/${numericId}`);
                    break;
                default:
                    return false;
            }
            return !!response.data;
        } catch (error) {
            return false;
        }
    },
};
