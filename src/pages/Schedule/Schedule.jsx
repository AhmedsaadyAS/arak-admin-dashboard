import React, { useState } from 'react';
import { Calendar, Users, Clock, MapPin, ChevronLeft, ChevronRight, Plus, Edit2, Trash2 } from 'lucide-react';
import { classesData } from '../../mock/classes';
import { teachersData } from '../../mock/teachers';
import { lessonsData } from '../../mock/lessons';
import { subjectsData } from '../../mock/subjects';
import { getClassSchedule, getTeacherSchedule, getDayName, formatTime } from '../../utils/scheduleUtils';
import LessonForm from '../../components/schedule/LessonForm';
import './Schedule.css';

export default function Schedule() {
    const [viewMode, setViewMode] = useState('class'); // 'class' or 'teacher'
    const [selectedId, setSelectedId] = useState(1); // classId or teacherId
    const [currentDate, setCurrentDate] = useState(new Date());

    // Editing State
    const [isEditing, setIsEditing] = useState(false);
    const [lessons, setLessons] = useState(lessonsData);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);

    // Get schedule based on view mode and current lessons state
    const schedule = viewMode === 'class'
        ? getClassSchedule(selectedId, lessons)
        : getTeacherSchedule(selectedId, lessons);

    const weekDays = [0, 1, 2, 3, 4]; // Sun-Thu

    const handlePrevWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentDate(newDate);
    };

    const handleNextWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentDate(newDate);
    };

    const handleAddLesson = () => {
        setEditingLesson(null);
        setIsFormOpen(true);
    };

    const handleEditLesson = (lesson) => {
        setEditingLesson(lesson);
        setIsFormOpen(true);
    };

    const handleDeleteLesson = (lessonId) => {
        if (window.confirm('Are you sure you want to delete this lesson?')) {
            setLessons(prev => prev.filter(l => l.id !== lessonId));
        }
    };

    const handleSaveLesson = (lesson) => {
        if (editingLesson) {
            setLessons(prev => prev.map(l => l.id === lesson.id ? lesson : l));
        } else {
            setLessons(prev => [...prev, lesson]);
        }
    };

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const handleUploadSchedule = (file) => {
        // Mock upload logic
        console.log("Uploading file:", file.name);
        alert(`Schedule imported successfully from ${file.name}!\n\n(This is a mock action. In a real app, this would parse the CSV/Excel file.)`);
        setIsUploadModalOpen(false);
        // Simulate refresh
        // setScheduleData([...scheduleData]); 
    };

    return (
        <div className="dashboard-page">
            <div className="card-header">
                <h3>Schedule</h3>
                <div className="topbar-actions">
                    <button className="icon-btn" onClick={() => setIsUploadModalOpen(true)} style={{ width: 'auto', padding: '0 1rem', borderRadius: '40px', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>↑</span>
                        <span>Import Schedule</span>
                    </button>
                    <button className="icon-btn" onClick={handleAddLesson} style={{ width: 'auto', padding: '0 1rem', borderRadius: '40px', background: 'var(--primary-color)', color: 'white', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>+</span>
                        <span>Add Lesson</span>
                    </button>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="schedule-controls">
                <div className="view-toggle">
                    <button
                        className={`toggle-btn ${viewMode === 'class' ? 'active' : ''}`}
                        onClick={() => { setViewMode('class'); setSelectedId(classesData[0].id); }}
                    >
                        <Users size={18} /> Class View
                    </button>
                    <button
                        className={`toggle-btn ${viewMode === 'teacher' ? 'active' : ''}`}
                        onClick={() => { setViewMode('teacher'); setSelectedId(teachersData[0].id); }}
                    >
                        <Calendar size={18} /> Teacher View
                    </button>
                </div>

                <div className="selector-group">
                    {viewMode === 'class' ? (
                        <select
                            value={selectedId}
                            onChange={(e) => setSelectedId(parseInt(e.target.value))}
                            className="schedule-select"
                        >
                            {classesData.map(cls => (
                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                            ))}
                        </select>
                    ) : (
                        <select
                            value={selectedId}
                            onChange={(e) => setSelectedId(parseInt(e.target.value))}
                            className="schedule-select"
                        >
                            {teachersData.map(teacher => (
                                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="date-nav">
                    <button onClick={handlePrevWeek}><ChevronLeft size={20} /></button>
                    <span>Week of {currentDate.toLocaleDateString()}</span>
                    <button onClick={handleNextWeek}><ChevronRight size={20} /></button>
                </div>
            </div>

            {/* Schedule Grid */}
            <div className="schedule-grid-container">
                <div className="schedule-grid">
                    {weekDays.map(day => (
                        <div key={day} className="day-column">
                            <div className="day-header">
                                <span className="day-name">{getDayName(day)}</span>
                            </div>
                            <div className="day-content">
                                {schedule[day]?.map((lesson, index) => (
                                    <div
                                        key={index}
                                        className="lesson-card"
                                        style={{ borderLeft: `4px solid ${lesson.subjectColor}` }}
                                    >
                                        <div className="lesson-time">
                                            <Clock size={12} />
                                            {formatTime(lesson.startTime)} - {formatTime(lesson.endTime)}
                                        </div>
                                        <div className="lesson-subject">{lesson.subjectName}</div>
                                        <div className="lesson-info">
                                            {viewMode === 'class' ? (
                                                <>
                                                    <span className="info-item"><Users size={12} /> {lesson.teacherName}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="info-item"><Users size={12} /> Grade {lesson.classId}</span>
                                                </>
                                            )}
                                            <span className="info-item"><MapPin size={12} /> {lesson.room}</span>
                                        </div>

                                        {isEditing && (
                                            <div className="lesson-actions">
                                                <button
                                                    className="icon-btn edit"
                                                    onClick={(e) => { e.stopPropagation(); handleEditLesson(lesson); }}
                                                    title="Edit Lesson"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    className="icon-btn delete"
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteLesson(lesson.id); }}
                                                    title="Delete Lesson"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {(!schedule[day] || schedule[day].length === 0) && (
                                    <div className="empty-slot">No classes</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="schedule-legend">
                {subjectsData.map(subject => (
                    <div key={subject.id} className="legend-item">
                        <span className="color-dot" style={{ background: subject.color }}></span>
                        <span>{subject.name}</span>
                    </div>
                ))}
            </div>

            {/* Lesson Form Modal */}
            <LessonForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSave={handleSaveLesson}
                initialData={editingLesson}
                allLessons={lessons}
            />

            {/* Upload Modal (Moved inside main div for context) */}
            {isUploadModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h3>Import Schedule</h3>
                            <button className="icon-btn" onClick={() => setIsUploadModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const file = e.target.elements.scheduleFile.files[0];
                            if (file) handleUploadSchedule(file);
                        }}>
                            <div className="form-group">
                                <label>Select File (CSV/Excel)</label>
                                <div style={{ border: '2px dashed #e5e7eb', padding: '2rem', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', background: '#f9fafb' }}>
                                    <input type="file" name="scheduleFile" required accept=".csv,.xlsx,.xls" style={{ display: 'block', margin: '0 auto' }} />
                                    <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#A098AE' }}>Supported formats: .csv, .xlsx</p>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setIsUploadModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Upload</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
