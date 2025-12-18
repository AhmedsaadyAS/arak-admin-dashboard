import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { classesData } from '../../mock/classes';
import { subjectsData } from '../../mock/subjects';
import { teachersData } from '../../mock/teachers';
import { detectTimeConflicts } from '../../utils/scheduleUtils';

export default function LessonForm({ isOpen, onClose, onSave, initialData, allLessons }) {
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
    const [debugConflicts, setDebugConflicts] = useState([]);

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
        } else {
            setFormData({
                classId: classesData[0]?.id.toString() || '',
                subjectId: subjectsData[0]?.id.toString() || '',
                teacherId: teachersData[0]?.id.toString() || '',
                dayOfWeek: 0,
                startTime: '08:00',
                endTime: '09:00',
                room: 'Room 101'
            });
        }
        setError(null);
        setDebugConflicts([]);
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
            id: initialData ? initialData.id : Date.now(),
            classId: parseInt(formData.classId),
            subjectId: parseInt(formData.subjectId),
            teacherId: parseInt(formData.teacherId),
            dayOfWeek: parseInt(formData.dayOfWeek)
        };

        // Conflict Detection
        const otherLessons = initialData
            ? allLessons.filter(l => l.id !== initialData.id)
            : allLessons;

        const conflicts = detectTimeConflicts([...otherLessons, newLesson]);
        setDebugConflicts(conflicts);

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
                        <label>Class</label>
                        <select name="classId" value={formData.classId} onChange={handleChange} required>
                            {classesData.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Subject</label>
                        <select name="subjectId" value={formData.subjectId} onChange={handleChange} required>
                            {subjectsData.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Teacher</label>
                        <select name="teacherId" value={formData.teacherId} onChange={handleChange} required>
                            {teachersData.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Day</label>
                        <select name="dayOfWeek" value={formData.dayOfWeek} onChange={handleChange} required>
                            {days.map(d => (
                                <option key={d.value} value={d.value}>{d.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Start Time</label>
                            <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>End Time</label>
                            <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Room</label>
                        <input type="text" name="room" value={formData.room} onChange={handleChange} required placeholder="e.g. Room 101" />
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
