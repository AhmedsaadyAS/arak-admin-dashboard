import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import { scheduleService } from '../../services/scheduleService';
import ConfirmModal from '../common/ConfirmModal';
import './TeacherForm.css';

/**
 * TeacherForm Component
 * Form for adding/editing teachers with class assignment and integrity checking
 * 
 * @param {Object} teacher - Existing teacher data (for edit mode)
 * @param {Boolean} isOpen - Show/hide modal
 * @param {Function} onClose - Close callback
 * @param {Function} onSave - Save callback
 * @param {Function} showToast - Toast notification function
 */
export default function TeacherForm({
    teacher = null,
    isOpen = false,
    onClose,
    onSave,
    showToast
}) {
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        email: '',
        phone: '',
        assignedClasses: [],
        status: 'Active',
        about: '',
        education: '',
        expertise: []
    });

    const [availableClasses, setAvailableClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [orphanWarning, setOrphanWarning] = useState(null);

    // Load available classes on mount
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const classesData = await api.getClasses();
                setAvailableClasses(classesData || []);
            } catch (error) {
                console.error('Failed to load classes', error);
                if (showToast) {
                    showToast('error', 'Failed to load available classes');
                }
            }
        };

        if (isOpen) {
            fetchClasses();
        }
    }, [isOpen, showToast]);

    // Populate form when teacher data changes
    useEffect(() => {
        if (teacher) {
            setFormData({
                name: teacher.name || '',
                subject: teacher.subject || '',
                email: teacher.email || '',
                phone: teacher.phone || '',
                assignedClasses: teacher.assignedClasses || [],
                status: teacher.status || 'Active',
                about: teacher.about || '',
                education: teacher.education || '',
                expertise: Array.isArray(teacher.expertise) ? teacher.expertise : []
            });
        } else {
            // Reset for new teacher
            setFormData({
                name: '',
                subject: '',
                email: '',
                phone: '',
                assignedClasses: [],
                status: 'Active',
                about: '',
                education: '',
                expertise: []
            });
        }
    }, [teacher]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClassToggle = (classId) => {
        const numericClassId = Number(classId);
        setFormData(prev => {
            const currentClasses = prev.assignedClasses || [];
            const isAssigned = currentClasses.includes(numericClassId);

            if (isAssigned) {
                // Removing class - check for orphaned schedules
                if (teacher?.id) {
                    checkOrphanedSchedules(teacher.id, numericClassId);
                }
                return {
                    ...prev,
                    assignedClasses: currentClasses.filter(id => id !== numericClassId)
                };
            } else {
                // Adding class
                return {
                    ...prev,
                    assignedClasses: [...currentClasses, numericClassId]
                };
            }
        });
    };

    const checkOrphanedSchedules = async (teacherId, removedClassId) => {
        try {
            const schedules = await api.getSchedules({
                teacherId: Number(teacherId),
                classId: Number(removedClassId)
            });

            if (schedules && schedules.length > 0) {
                const className = availableClasses.find(c => Number(c.id) === Number(removedClassId))?.name || `Class ${removedClassId}`;

                setOrphanWarning({
                    className,
                    scheduleCount: schedules.length,
                    classId: removedClassId
                });
            }
        } catch (error) {
            console.error('Failed to check orphaned schedules', error);
        }
    };

    const handleOrphanConfirm = () => {
        // User confirmed removal despite orphaned schedules
        setOrphanWarning(null);
        if (showToast) {
            showToast('warning', 'Class removed. Note: Active schedules remain for this class.');
        }
    };

    const handleOrphanCancel = () => {
        // Re-add the class
        const classIdToRestore = orphanWarning.classId;
        setFormData(prev => ({
            ...prev,
            assignedClasses: [...(prev.assignedClasses || []), Number(classIdToRestore)]
        }));
        setOrphanWarning(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate required fields
            if (!formData.name || !formData.subject) {
                if (showToast) {
                    showToast('error', 'Name and Subject are required');
                }
                setLoading(false);
                return;
            }

            // Ensure IDs are numeric
            const normalizedData = {
                ...formData,
                assignedClasses: (formData.assignedClasses || []).map(id => Number(id))
            };

            let result;
            if (teacher?.id) {
                // Update existing teacher
                result = await scheduleService.syncTeacherClasses(
                    teacher.id,
                    normalizedData.assignedClasses,
                    showToast
                );

                if (!result.updated) {
                    // Sync failed due to orphaned schedules
                    setLoading(false);
                    return;
                }

                // Update other teacher fields
                await api.updateTeacher(teacher.id, {
                    name: normalizedData.name,
                    subject: normalizedData.subject,
                    email: normalizedData.email,
                    phone: normalizedData.phone,
                    status: normalizedData.status,
                    about: normalizedData.about,
                    education: normalizedData.education,
                    expertise: normalizedData.expertise
                });

                if (showToast) {
                    showToast('success', 'Teacher updated successfully');
                }
            } else {
                // Create new teacher
                result = await api.createTeacher(normalizedData);
                if (showToast) {
                    showToast('success', 'Teacher created successfully');
                }
            }

            if (onSave) {
                onSave(result);
            }
            onClose();
        } catch (error) {
            console.error('Failed to save teacher', error);
            if (showToast) {
                showToast('error', error.message || 'Failed to save teacher');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div className="teacher-form-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>{teacher ? 'Edit Teacher' : 'Add New Teacher'}</h2>
                        <button className="close-btn" onClick={onClose}>
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="teacher-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Teacher name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Subject *</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder="Primary subject"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="email@example.com"
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+1234567890"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Assigned Classes</label>
                            <div className="class-selector">
                                {availableClasses.map(cls => {
                                    const clsId = Number(cls.id);
                                    const isAssigned = (formData.assignedClasses || []).includes(clsId);

                                    return (
                                        <button
                                            key={cls.id}
                                            type="button"
                                            className={`class-chip ${isAssigned ? 'selected' : ''}`}
                                            onClick={() => handleClassToggle(cls.id)}
                                        >
                                            {cls.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Status</label>
                            <select name="status" value={formData.status} onChange={handleChange}>
                                <option value="Active">Active</option>
                                <option value="On Leave">On Leave</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>About</label>
                            <textarea
                                name="about"
                                value={formData.about}
                                onChange={handleChange}
                                placeholder="Brief description..."
                                rows={3}
                            />
                        </div>

                        <div className="form-actions">
                            <button type="button" onClick={onClose} className="cancel-btn">
                                Cancel
                            </button>
                            <button type="submit" className="save-btn" disabled={loading}>
                                <Save size={18} />
                                {loading ? 'Saving...' : 'Save Teacher'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Orphaned Schedules Warning Modal */}
            <ConfirmModal
                isOpen={!!orphanWarning}
                title="Active Schedules Found"
                message={`Class "${orphanWarning?.className}" has ${orphanWarning?.scheduleCount} active schedule(s). If you remove this class, those schedules will remain orphaned. Do you want to continue?`}
                confirmText="Remove Anyway"
                cancelText="Keep Class"
                onConfirm={handleOrphanConfirm}
                onCancel={handleOrphanCancel}
                variant="warning"
            />
        </>
    );
}
