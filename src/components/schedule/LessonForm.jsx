import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, Save, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { detectTimeConflicts } from '../../utils/scheduleUtils';

export default function LessonForm({ isOpen, onClose, onSave, initialData = null, allLessons = [] }) {
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [availableTeachers, setAvailableTeachers] = useState([]); // ✅ Filtered by subject
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        classId: '',
        subjectId: '',
        teacherId: '',
        dayOfWeek: 0,
        startTime: '08:00',
        endTime: '09:00',
        room: ''
    });
    const [error, setError] = useState(null);

    // Fetch dropdown data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // ✅ Fetch from normalized endpoints
                const [classesData, subjectsData, teachersRes] = await Promise.all([
                    api.getClasses(),
                    api.getSubjects(),
                    api.getTeachers()
                ]);

                setClasses(classesData || []);
                setSubjects(subjectsData || []);
                setTeachers(teachersRes);

                // Set defaults if creating new and data loaded
                if (!initialData && classesData?.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        classId: classesData[0].id.toString(),
                        subjectId: subjectsData?.[0]?.id.toString() || '',
                        teacherId: teachersRes?.[0]?.id.toString() || ''
                    }));
                }
            } catch (err) {
                console.error("Failed to fetch lesson form data", err);
                setError("Failed to load options. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchData();
        }
    }, [isOpen, initialData]);

    // ✅ Filter teachers when subject changes
    useEffect(() => {
        if (formData.subjectId && teachers.length > 0) {
            // Convert to number for comparison (form stores as string)
            const selectedSubjectId = Number(formData.subjectId);

            // Filter teachers who teach this subject
            const filtered = teachers.filter(t => t.subjectId === selectedSubjectId);
            setAvailableTeachers(filtered);

            // Auto-select first available teacher if current selection is invalid
            if (filtered.length > 0) {
                const currentTeacherId = Number(formData.teacherId);
                const isCurrentValid = filtered.some(t => t.id === currentTeacherId);

                if (!isCurrentValid) {
                    setFormData(prev => ({
                        ...prev,
                        teacherId: filtered[0].id.toString()
                    }));
                }
            }
        } else {
            // Show all teachers if no subject selected
            setAvailableTeachers(teachers);
        }
    }, [formData.subjectId, teachers, formData.teacherId]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                classId: initialData.classId.toString(),
                subjectId: initialData.subjectId.toString(),
                teacherId: initialData.teacherId.toString(),
                dayOfWeek: initialData.dayOfWeek,
                startTime: initialData.startTime,
                endTime: initialData.endTime,
                room: initialData.room
            });
        } else if (!isOpen) {
            // Reset form when modal closes
            setFormData({
                classId: '',
                subjectId: '',
                teacherId: '',
                dayOfWeek: 0,
                startTime: '08:00',
                endTime: '09:00',
                room: ''
            });
        }
        setError(null);
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic Validation
        if (formData.startTime >= formData.endTime) {
            setError('End time must be after start time');
            return;
        }

        const newLesson = {
            ...formData,
            classId: parseInt(formData.classId),
            subjectId: parseInt(formData.subjectId),
            teacherId: parseInt(formData.teacherId),
            dayOfWeek: parseInt(formData.dayOfWeek)
        };

        // Add ID only if editing (for conflict detection)
        if (initialData) {
            newLesson.id = initialData.id;
        }

        // Conflict Detection
        const otherLessons = initialData
            ? allLessons.filter(l => l.id !== initialData.id)
            : allLessons;

        const conflicts = detectTimeConflicts([...otherLessons, newLesson]);

        const relevantConflict = conflicts.find(c =>
            c.lesson1.id === newLesson.id || c.lesson2.id === newLesson.id
        );

        if (relevantConflict) {
            setError(relevantConflict.message || 'Schedule conflict detected!');
            return;
        }

        onSave(newLesson);
        onClose();
    };

    const days = [
        { value: 0, label: 'Sunday' },
        { value: 1, label: 'Monday' },
        { value: 2, label: 'Tuesday' },
        { value: 3, label: 'Wednesday' },
        { value: 4, label: 'Thursday' }
    ];

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h2>{initialData ? 'Edit Lesson' : 'Add New Lesson'}</h2>
                    <button onClick={onClose} className="close-button"><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    {error && (
                        <div className="error-message" style={{
                            background: '#FEECEC', color: '#EE3636', padding: '0.75rem',
                            borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}>
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="lesson-classId">Class</label>
                        <select id="lesson-classId" name="classId" value={formData.classId} onChange={handleChange} required disabled={loading}>
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="lesson-subjectId">Subject</label>
                        <select id="lesson-subjectId" name="subjectId" value={formData.subjectId} onChange={handleChange} required disabled={loading}>
                            {subjects.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="lesson-teacherId">Teacher</label>
                        <select id="lesson-teacherId" name="teacherId" value={formData.teacherId} onChange={handleChange} required disabled={loading}>
                            {availableTeachers.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="lesson-dayOfWeek">Day</label>
                        <select id="lesson-dayOfWeek" name="dayOfWeek" value={formData.dayOfWeek} onChange={handleChange} required>
                            {days.map(d => (
                                <option key={d.value} value={d.value}>{d.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="lesson-startTime">Start Time</label>
                            <input id="lesson-startTime" type="time" name="startTime" value={formData.startTime} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="lesson-endTime">End Time</label>
                            <input id="lesson-endTime" type="time" name="endTime" value={formData.endTime} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="lesson-room">Room</label>
                        <input id="lesson-room" type="text" name="room" value={formData.room} onChange={handleChange} required placeholder="e.g. Room 101" />
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="cancel-button">Cancel</button>
                        <button type="submit" className="save-button">
                            <Save size={18} style={{ marginRight: '0.5rem' }} />
                            Save Lesson
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

LessonForm.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    initialData: PropTypes.shape({
        id: PropTypes.number,
        classId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        subjectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        teacherId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        dayOfWeek: PropTypes.number,
        startTime: PropTypes.string,
        endTime: PropTypes.string,
        room: PropTypes.string
    }),
    allLessons: PropTypes.array
};
