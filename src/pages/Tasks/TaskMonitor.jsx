import React, { useState, useEffect } from 'react';
import { BookOpen, Trash2, Eye, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import FilterBar from '../../components/common/FilterBar';
import DataTable from '../../components/common/DataTable';
import ConfirmModal from '../../components/common/ConfirmModal';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import TaskDetailsModal from './TaskDetailsModal';
import { taskService } from '../../services/taskService';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './TaskMonitor.css';

export default function TaskMonitor() {
    const { showToast } = useToast();
    const [tasks, setTasks] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, task: null });
    const [detailsModal, setDetailsModal] = useState({ isOpen: false, task: null, teacher: null, className: '' });

    // Fetch initial data
    useEffect(() => {
        fetchInitialData();
    }, []);

    // Fetch tasks when filters change
    useEffect(() => {
        fetchTasks();
    }, [selectedTeacher, selectedClass, selectedStatus]);

    const fetchInitialData = async () => {
        try {
            const [teachersRes, classesRes, statsRes] = await Promise.all([
                api.getTeachers(),
                api.client.get('/classes'),
                taskService.getTaskStats()
            ]);
            setTeachers(teachersRes);
            setClasses(classesRes.data || []);
            setStats(statsRes);
        } catch (error) {
            console.error("Failed to fetch initial data", error);
        }
    };

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const params = {};
            if (selectedTeacher) params.teacherId = selectedTeacher;
            if (selectedClass) params.classId = selectedClass;
            if (selectedStatus) params.status = selectedStatus;

            const tasksData = await taskService.getAllTasks(params);
            setTasks(tasksData);
        } catch (error) {
            console.error("Failed to fetch tasks", error);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (task) => {
        const teacher = teachers.find(t => t.id === task.teacherId);
        const classObj = classes.find(c => c.id === task.classId);
        setDetailsModal({
            isOpen: true,
            task,
            teacher,
            className: classObj?.name || 'Unknown'
        });
    };

    const handleDeleteClick = (task) => {
        setDeleteModal({ isOpen: true, task });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal.task) return;

        try {
            await taskService.deleteTask(deleteModal.task.id);
            setTasks(tasks.filter(t => t.id !== deleteModal.task.id));
            setDeleteModal({ isOpen: false, task: null });

            showToast('success', 'Task deleted successfully');

            // Refresh stats
            const statsRes = await taskService.getTaskStats();
            setStats(statsRes);
        } catch (error) {
            console.error("Failed to delete task", error);
            showToast('error', 'Failed to delete task');
        }
    };

    const handleClearFilters = () => {
        setSelectedTeacher('');
        setSelectedClass('');
        setSelectedStatus('');
    };

    // Status options
    const statusOptions = [
        { value: 'pending', label: 'Pending' },
        { value: 'completed', label: 'Completed' },
        { value: 'overdue', label: 'Overdue' }
    ];

    // Table columns
    const columns = [
        {
            key: 'title',
            label: 'Task Title',
            sortable: true,
            render: (title) => <strong style={{ color: '#303972' }}>{title}</strong>
        },
        {
            key: 'description',
            label: 'Description',
            sortable: false,
            render: (desc) => (
                <span style={{ color: '#6B7280', fontSize: '0.9rem' }}>
                    {desc?.substring(0, 60)}{desc?.length > 60 ? '...' : ''}
                </span>
            )
        },
        {
            key: 'teacherName',
            label: 'Assigned By',
            sortable: true
        },
        {
            key: 'dueDate',
            label: 'Due Date',
            sortable: true,
            render: (date) => {
                const dueDate = new Date(date);
                const isOverdue = dueDate < new Date();
                return (
                    <span style={{ color: isOverdue ? '#EF4444' : '#22C55E', fontWeight: '500' }}>
                        {new Date(date).toLocaleDateString()}
                    </span>
                );
            }
        }
    ];

    // Prepare table data with teacher names
    const tableData = tasks.map(task => {
        const teacher = teachers.find(t => t.id === task.teacherId);
        return {
            ...task,
            teacherName: teacher?.name || 'Unknown'
        };
    });

    return (
        <div className="task-monitor">
            {/* Header with Stats */}
            <div className="task-header">
                <div className="header-left">
                    <BookOpen size={32} className="header-icon" />
                    <div>
                        <h2>Task Monitor</h2>
                        <p>Admin oversight for homework assignments and quality control</p>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon total">
                            <BookOpen size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Total Tasks</span>
                            <span className="stat-value">{stats.totalTasks}</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon completed">
                            <CheckCircle size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Completed</span>
                            <span className="stat-value">{stats.completedTasks}</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon pending">
                            <Clock size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Pending</span>
                            <span className="stat-value">{stats.pendingTasks}</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon rate">
                            <TrendingUp size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Completion Rate</span>
                            <span className="stat-value">{stats.completionRate}%</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <FilterBar
                filters={[
                    {
                        key: 'teacher',
                        label: 'Teacher',
                        value: selectedTeacher,
                        onChange: setSelectedTeacher,
                        options: teachers.map(t => ({ value: t.id, label: t.name }))
                    },
                    {
                        key: 'class',
                        label: 'Class',
                        value: selectedClass,
                        onChange: setSelectedClass,
                        options: classes.map(c => ({ value: c.id, label: c.name }))
                    },
                    {
                        key: 'status',
                        label: 'Status',
                        value: selectedStatus,
                        onChange: setSelectedStatus,
                        options: statusOptions
                    }
                ]}
                onClear={handleClearFilters}
            />

            {/* Task Table */}
            <div className="task-table-card">
                <div className="card-header-row">
                    <h3>Homework Assignments</h3>
                    <span className="task-count">{tasks.length} tasks</span>
                </div>
                {loading ? (
                    <SkeletonLoader variant="table" rows={5} />
                ) : (
                    <DataTable
                        columns={columns}
                        data={tableData}
                        onEdit={handleViewDetails}
                        onDelete={handleDeleteClick}
                        showActions={true}
                        emptyMessage="No tasks found matching your filters"
                    />
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Delete Task?"
                message={`Are you sure you want to delete "${deleteModal.task?.title}"? This action cannot be undone.`}
                confirmText="Delete Task"
                cancelText="Cancel"
                variant="danger"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteModal({ isOpen: false, task: null })}
            />

            {/* Task Details Modal */}
            <TaskDetailsModal
                task={detailsModal.task}
                teacher={detailsModal.teacher}
                className={detailsModal.className}
                onClose={() => setDetailsModal({ isOpen: false, task: null, teacher: null, className: '' })}
            />
        </div>
    );
}
