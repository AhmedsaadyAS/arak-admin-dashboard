import React from 'react';
import { X, User, Calendar, BookOpen, Clock, FileText } from 'lucide-react';
import './TaskDetailsModal.css';

/**
 * TaskDetailsModal Component
 * Displays full task details including description, teacher, class, and due date
 * 
 * @param {object} task - Task object
 * @param {object} teacher - Teacher object
 * @param {string} className - Class name
 * @param {function} onClose - Close callback
 */
export default function TaskDetailsModal({ task, teacher, className, onClose }) {
    if (!task) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="task-details-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{task.title}</h3>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="task-details-content">
                    <div className="details-grid">
                        <div className="detail-item">
                            <div className="detail-icon">
                                <User size={18} />
                            </div>
                            <div className="detail-info">
                                <span className="detail-label">Assigned By</span>
                                <span className="detail-value">{teacher?.name || 'Unknown Teacher'}</span>
                            </div>
                        </div>

                        <div className="detail-item">
                            <div className="detail-icon">
                                <BookOpen size={18} />
                            </div>
                            <div className="detail-info">
                                <span className="detail-label">Class</span>
                                <span className="detail-value">{className || 'Unknown Class'}</span>
                            </div>
                        </div>

                        <div className="detail-item">
                            <div className="detail-icon">
                                <Calendar size={18} />
                            </div>
                            <div className="detail-info">
                                <span className="detail-label">Due Date</span>
                                <span className="detail-value">
                                    {new Date(task.dueDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>

                        {task.startTime && (
                            <div className="detail-item">
                                <div className="detail-icon">
                                    <Clock size={18} />
                                </div>
                                <div className="detail-info">
                                    <span className="detail-label">Time</span>
                                    <span className="detail-value">{task.startTime}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="description-section">
                        <div className="description-header">
                            <FileText size={18} />
                            <h4>Description</h4>
                        </div>
                        <div className="description-content">
                            {task.description || 'No description provided'}
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-primary" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
