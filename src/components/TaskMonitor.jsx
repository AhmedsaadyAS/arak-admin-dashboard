import React, { useState, useEffect } from 'react';
import { Eye, Trash2 } from 'lucide-react';
import DataTable from './common/DataTable';
import ConfirmModal from './common/ConfirmModal';
import { taskService } from '../services/taskService';
import { api } from '../services/api';
import { dataIntegrityService } from '../services/dataIntegrityService';
import './TaskMonitor.css';

/**
 * TaskMonitor Component
 * Displays and manages academic tasks with teacher assignments
 * Features: DataTable display, integrity validation, delete with warnings
 * 
 * @param {Function} showToast - Toast notification function
 */
export default function TaskMonitor({ showToast }) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // Load tasks on mount
    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            setLoading(true);
            const data = await taskService.getAllTasks();

            // Enrich tasks with teacher names
            const enrichedTasks = await Promise.all(
                data.map(async (task) => {
                    if (task.teacherId) {
                        try {
                            const teacher = await api.getTeacherById(Number(task.teacherId));
                            return {
                                ...task,
                                teacherName: teacher?.name || `Teacher ${task.teacherId}`
                            };
                        } catch {
                            return {
                                ...task,
                                teacherName: `Teacher ${task.teacherId}`
                            };
                        }
                    }
                    return {
                        ...task,
                        teacherName: 'Unassigned'
                    };
                })
            );

            setTasks(enrichedTasks);
        } catch (error) {
            console.error('Failed to load tasks', error);
            if (showToast) {
                showToast('error', 'Failed to load tasks');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (task) => {
        setSelectedTask(task);
        setShowDetailsModal(true);
    };

    const handleDeleteClick = async (task) => {
        // Validate teacher reference exists
        if (task.teacherId) {
            const isValid = await dataIntegrityService.validateReference(
                'teacher',
                Number(task.teacherId)
            );

            if (!isValid) {
                if (showToast) {
                    showToast('warning', 'Referenced teacher no longer exists');
                }
            }
        }

        setTaskToDelete(task);
    };

    const handleDeleteConfirm = async () => {
        if (!taskToDelete) return;

        try {
            await taskService.deleteTask(Number(taskToDelete.id));

            // Update state to remove deleted task
            setTasks(prev => prev.filter(t => t.id !== taskToDelete.id));

            if (showToast) {
                showToast('success', `Task "${taskToDelete.title}" deleted successfully`);
            }
        } catch (error) {
            console.error('Failed to delete task', error);
            if (showToast) {
                showToast('error', error.message || 'Failed to delete task');
            }
        } finally {
            setTaskToDelete(null);
        }
    };

    // Define table columns
    const columns = [
        {
            key: 'id',
            label: 'ID',
            sortable: true,
            render: (value) => `#${value}`
        },
        {
            key: 'title',
            label: 'Task Title',
            sortable: true
        },
        {
            key: 'teacherName',
            label: 'Assigned Teacher',
            sortable: true,
            render: (value) => (
                <span className={value === 'Unassigned' ? 'unassigned-badge' : ''}>
                    {value}
                </span>
            )
        },
        {
            key: 'dueDate',
            label: 'Due Date',
            sortable: true,
            render: (value) => {
                if (!value) return '-';
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });
            }
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (value) => (
                <span className={`status-badge status-${(value || 'pending').toLowerCase()}`}>
                    {value || 'Pending'}
                </span>
            )
        }
    ];

    if (loading) {
        return (
            <div className="task-monitor">
                <div className="loading-state">Loading tasks...</div>
            </div>
        );
    }

    return (
        <div className="task-monitor">
            <div className="monitor-header">
                <h2>Task Management</h2>
                <p className="monitor-subtitle">
                    Monitor and manage academic tasks assigned to teachers
                </p>
            </div>

            <div className="custom-actions-table">
                <DataTable
                    columns={columns}
                    data={tasks}
                    showActions={false}
                    emptyMessage="No tasks found"
                />

                {/* Custom actions column */}
                <div className="custom-actions-overlay">
                    {tasks.map((task) => (
                        <div key={task.id} className="action-row">
                            <button
                                className="action-btn view-btn"
                                onClick={() => handleViewDetails(task)}
                                title="View Details"
                            >
                                <Eye size={16} />
                            </button>
                            <button
                                className="action-btn delete-btn"
                                onClick={() => handleDeleteClick(task)}
                                title="Delete Task"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!taskToDelete}
                title="Delete Task"
                message={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setTaskToDelete(null)}
                variant="danger"
            />

            {/* Task Details Modal */}
            {showDetailsModal && selectedTask && (
                <TaskDetailsModal
                    task={selectedTask}
                    onClose={() => {
                        setShowDetailsModal(false);
                        setSelectedTask(null);
                    }}
                />
            )}
        </div>
    );
}

/**
 * TaskDetailsModal Component
 * Shows full task information including description and teacher details
 */
function TaskDetailsModal({ task, onClose }) {
    if (!task) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="task-details-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Task Details</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="detail-row">
                        <span className="detail-label">Task ID:</span>
                        <span className="detail-value">#{task.id}</span>
                    </div>

                    <div className="detail-row">
                        <span className="detail-label">Title:</span>
                        <span className="detail-value">{task.title}</span>
                    </div>

                    <div className="detail-row full-width">
                        <span className="detail-label">Description:</span>
                        <p className="detail-description">
                            {task.description || 'No description provided'}
                        </p>
                    </div>

                    <div className="detail-row">
                        <span className="detail-label">Assigned Teacher:</span>
                        <span className="detail-value">
                            {task.teacherName || 'Unassigned'}
                        </span>
                    </div>

                    <div className="detail-row">
                        <span className="detail-label">Teacher ID:</span>
                        <span className="detail-value">
                            {task.teacherId ? `#${task.teacherId}` : 'N/A'}
                        </span>
                    </div>

                    <div className="detail-row">
                        <span className="detail-label">Due Date:</span>
                        <span className="detail-value">
                            {task.dueDate
                                ? new Date(task.dueDate).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })
                                : 'Not set'
                            }
                        </span>
                    </div>

                    <div className="detail-row">
                        <span className="detail-label">Status:</span>
                        <span className={`status-badge status-${(task.status || 'pending').toLowerCase()}`}>
                            {task.status || 'Pending'}
                        </span>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="close-modal-btn" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
