import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Plus, Search, Lock, Unlock, Pencil, Trash2, X,
    School, Users, AlertTriangle, Save, ChevronDown,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './GradesPage.css';

// ─── Constants ────────────────────────────────────────────────────────────────

const STAGES = [
    { key: 'all',          label: 'All Stages' },
    { key: 'primary',      label: 'Primary'      },
    { key: 'preparatory',  label: 'Preparatory'  },
    { key: 'secondary',    label: 'Secondary'    },
];

const GRADE_OPTIONS = {
    primary:     ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'],
    preparatory: ['Grade 7', 'Grade 8', 'Grade 9'],
    secondary:   ['Grade 10', 'Grade 11', 'Grade 12'],
};

const EMPTY_FORM = { name: '', grade: '', customGrade: '', stage: '', description: '', maxStudents: 30 };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStripeClass(stage) {
    if (!stage) return 'stripe-default';
    const map = { primary: 'stripe-primary', preparatory: 'stripe-preparatory', secondary: 'stripe-secondary' };
    return map[stage] ?? 'stripe-default';
}

function getStageBadgeClass(stage) {
    if (!stage) return 'badge-stage badge-default';
    return `badge-stage badge-${stage}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GradesPage() {
    const { showToast } = useToast();

    // ── State ────────────────────────────────────────────────────────────────
    const [classes, setClasses]         = useState([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState('');
    const [search, setSearch]           = useState('');
    const [activeStage, setActiveStage] = useState('all');

    // Modal state
    const [modal, setModal]   = useState(null);  // 'add' | 'edit' | 'delete' | 'addGrade'
    const [selected, setSelected] = useState(null);
    const [form, setForm]     = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [gradeForm, setGradeForm] = useState({ grade: '', stage: '' });

    // ── Data fetching ────────────────────────────────────────────────────────
    const fetchClasses = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await api.getClasses();
            setClasses(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to load classes. Please try again.');
            console.error('[GradesPage] fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchClasses(); }, [fetchClasses]);

    // ── Derived data ─────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        let list = classes;
        if (activeStage !== 'all') list = list.filter(c => c.stage === activeStage);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(c =>
                c.name?.toLowerCase().includes(q) ||
                c.grade?.toLowerCase().includes(q) ||
                c.description?.toLowerCase().includes(q)
            );
        }
        return list;
    }, [classes, activeStage, search]);

    const stats = useMemo(() => ({
        total:       classes.length,
        primary:     classes.filter(c => c.stage === 'primary').length,
        preparatory: classes.filter(c => c.stage === 'preparatory').length,
        secondary:   classes.filter(c => c.stage === 'secondary').length,
        locked:      classes.filter(c => c.gradesLocked).length,
    }), [classes]);

    // ── Modal helpers ─────────────────────────────────────────────────────────
    const openAdd = () => {
        setForm(EMPTY_FORM);
        setSelected(null);
        setModal('add');
    };

    const openAddGrade = () => {
        setGradeForm({ grade: '', stage: '' });
        setModal('addGrade');
    };

    const openEdit = (cls) => {
        setSelected(cls);
        setForm({
            name:        cls.name        || '',
            grade:       cls.grade       || '',
            customGrade: '',
            stage:       cls.stage       || '',
            description: cls.description || '',
            maxStudents: cls.maxStudents || 30,
        });
        setModal('edit');
    };

    const openDelete = (cls) => {
        setSelected(cls);
        setModal('delete');
    };

    const closeModal = () => {
        setModal(null);
        setSelected(null);
        setSaving(false);
        setGradeForm({ grade: '', stage: '' });
    };

    // ── Form change ───────────────────────────────────────────────────────────
    const handleField = (e) => {
        const { name, value } = e.target;
        setForm(f => {
            const next = { ...f, [name]: value };
            // auto-clear grade when stage changes (different grade options)
            if (name === 'stage') next.grade = '';
            return next;
        });
    };

    // ── CRUD actions ──────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!form.name.trim()) { showToast('error', 'Class name is required.'); return; }
        if (!form.maxStudents || form.maxStudents < 1) { showToast('error', 'Maximum students must be at least 1.'); return; }
        
        setSaving(true);
        try {
            const payload = {
                name:        form.name.trim(),
                grade:       (form.grade === 'custom' ? form.customGrade?.trim() : form.grade) || null,
                stage:       form.stage  || null,
                description: form.description.trim() || null,
                maxStudents: parseInt(form.maxStudents, 10) || 30,
            };

            if (modal === 'add') {
                const created = await api.client.post('/classes', payload);
                setClasses(prev => [...prev, created.data]);
                showToast('success', `Class "${payload.name}" created successfully.`);
            } else {
                const updated = await api.client.put(`/classes/${selected.id}`, payload);
                setClasses(prev => prev.map(c => c.id === selected.id ? updated.data : c));
                showToast('success', `Class "${payload.name}" updated.`);
            }
            closeModal();
            fetchClasses(); // Re-sync from server to get accurate studentCount
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to save. Please try again.';
            showToast('error', msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selected) return;
        setSaving(true);
        try {
            await api.client.delete(`/classes/${selected.id}`);
            setClasses(prev => prev.filter(c => c.id !== selected.id));
            showToast('success', `Class "${selected.name}" deleted.`);
            closeModal();
        } catch (err) {
            const msg = err.response?.data?.message || 'Cannot delete this class.';
            showToast('error', msg);
        } finally {
            setSaving(false);
        }
    };

    const toggleLock = async (cls) => {
        const next = !cls.gradesLocked;
        try {
            const res = await api.updateClass(cls.id, { gradesLocked: next });
            setClasses(prev => prev.map(c => c.id === cls.id ? { ...c, gradesLocked: res.gradesLocked ?? next } : c));
            showToast('success', `Grades ${next ? 'locked' : 'unlocked'} for "${cls.name}".`);
        } catch (err) {
            showToast('error', 'Failed to toggle grades lock.');
        }
    };

    const handleSaveGrade = async () => {
        if (!gradeForm.grade.trim()) { showToast('error', 'Grade name is required.'); return; }
        if (!gradeForm.stage) { showToast('error', 'Stage is required.'); return; }
        
        setSaving(true);
        try {
            // Create a new class with the grade level
            const className = `${gradeForm.grade} - A`;
            const payload = {
                name: className,
                grade: gradeForm.grade.trim(),
                stage: gradeForm.stage,
                description: `Default class for ${gradeForm.grade}`,
                maxStudents: 30,
            };

            const created = await api.client.post('/classes', payload);
            setClasses(prev => [...prev, created.data]);
            showToast('success', `Grade "${gradeForm.grade}" created with default class "${className}".`);
            closeModal();
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to create grade.';
            showToast('error', msg);
        } finally {
            setSaving(false);
        }
    };

    // ── Grade options for current stage ──────────────────────────────────────
    const gradeOptions = form.stage ? (GRADE_OPTIONS[form.stage] || []) : [];

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="grades-page">

            {/* Header */}
            <div className="grades-header">
                <div className="grades-header-left">
                    <h2>🏫 Grades &amp; Classes</h2>
                    <p>Manage class sections, assign stages, and control grade locking.</p>
                </div>
                <div className="grades-header-actions">
                    <button className="btn-add-grade" onClick={openAddGrade}>
                        <Plus size={16} /> Add Grade
                    </button>
                    <button className="btn-add-class" onClick={openAdd}>
                        <Plus size={16} /> Add Class
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="error-banner" style={{ background: '#fef2f2', color: '#b91c1c', padding: '1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertTriangle size={18} /> {error}
                </div>
            )}

            {/* Stats */}
            <div className="grades-stats">
                <div className="stat-card">
                    <div className="stat-icon total"><School size={22} color="#7c3aed" /></div>
                    <div className="stat-info">
                        <div className="count">{stats.total}</div>
                        <div className="label">Total Classes</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon primary">🎒</div>
                    <div className="stat-info">
                        <div className="count">{stats.primary}</div>
                        <div className="label">Primary</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon prep">📚</div>
                    <div className="stat-info">
                        <div className="count">{stats.preparatory}</div>
                        <div className="label">Preparatory</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon sec">🎓</div>
                    <div className="stat-info">
                        <div className="count">{stats.secondary}</div>
                        <div className="label">Secondary</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon locked">🔒</div>
                    <div className="stat-info">
                        <div className="count">{stats.locked}</div>
                        <div className="label">Grades Locked</div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="grades-controls">
                {/* Search */}
                <div className="grades-search-wrap">
                    <Search size={16} />
                    <input
                        className="grades-search"
                        placeholder="Search classes..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                {/* Stage Tabs */}
                <div className="stage-tabs">
                    {STAGES.map(s => (
                        <button
                            key={s.key}
                            className={`stage-tab ${activeStage === s.key ? `active ${s.key}` : ''}`}
                            onClick={() => setActiveStage(s.key)}
                        >
                            {s.label}
                            {s.key !== 'all' && (
                                <span style={{ marginLeft: '0.3rem', opacity: 0.7, fontSize: '0.75rem' }}>
                                    ({classes.filter(c => c.stage === s.key).length})
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="grades-loading">
                    <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <span>Loading classes...</span>
                </div>
            ) : filtered.length === 0 ? (
                <div className="grades-empty">
                    <div className="grades-empty-icon">🏫</div>
                    <h3>{search || activeStage !== 'all' ? 'No classes match your filters' : 'No classes yet'}</h3>
                    <p>{search || activeStage !== 'all' ? 'Try adjusting your search or filter.' : 'Add your first class to get started.'}</p>
                    {!search && activeStage === 'all' && (
                        <button className="btn-add-class" onClick={openAdd} style={{ margin: '1rem auto 0' }}>
                            <Plus size={16} /> Add First Class
                        </button>
                    )}
                </div>
            ) : (
                <div className="classes-grid">
                    {filtered.map(cls => (
                        <ClassCard
                            key={cls.id}
                            cls={cls}
                            onEdit={openEdit}
                            onDelete={openDelete}
                            onToggleLock={toggleLock}
                        />
                    ))}
                </div>
            )}

            {/* ── Add / Edit Modal ─────────────────────────────────────────── */}
            {(modal === 'add' || modal === 'edit') && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
                    <div className="modal-card" role="dialog" aria-modal="true">
                        <div className="modal-header">
                            <h3>
                                {modal === 'add' ? <><Plus size={18} /> Add Class</> : <><Pencil size={18} /> Edit Class</>}
                            </h3>
                            <button className="modal-close" onClick={closeModal} aria-label="Close">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="form-grid">
                            {/* Class Name */}
                            <div className="field-group full">
                                <label htmlFor="cls-name">Class Name *</label>
                                <input
                                    id="cls-name"
                                    name="name"
                                    placeholder='e.g. "Grade 4-A"'
                                    value={form.name}
                                    onChange={handleField}
                                    autoFocus
                                />
                            </div>

                            {/* Stage */}
                            <div className="field-group">
                                <label htmlFor="cls-stage">Stage</label>
                                <select id="cls-stage" name="stage" value={form.stage} onChange={handleField}>
                                    <option value="">— Select Stage —</option>
                                    <option value="primary">Primary</option>
                                    <option value="preparatory">Preparatory</option>
                                    <option value="secondary">Secondary</option>
                                </select>
                            </div>

                            {/* Grade */}
                            <div className="field-group">
                                <label htmlFor="cls-grade">Grade Level</label>
                                {form.grade === 'custom' ? (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            autoFocus
                                            placeholder="Enter custom grade..."
                                            value={form.customGrade || ''}
                                            onChange={e => setForm(f => ({ ...f, customGrade: e.target.value }))}
                                            style={{ flex: 1 }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setForm(f => ({...f, grade: '', customGrade: ''}))}
                                            style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', background: '#f1f5f9', cursor: 'pointer' }}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <select id="cls-grade" name="grade" value={form.grade} onChange={handleField}>
                                        <option value="">— Select Grade —</option>
                                        {gradeOptions.map(g => (
                                            <option key={g} value={g}>{g}</option>
                                        ))}
                                        {form.stage && <option value="custom">Other (Custom)...</option>}
                                    </select>
                                )}
                            </div>

                            {/* Max Students */}
                            <div className="field-group">
                                <label htmlFor="cls-max-students">Max Students</label>
                                <input
                                    id="cls-max-students"
                                    name="maxStudents"
                                    type="number"
                                    min="1"
                                    placeholder="30"
                                    value={form.maxStudents}
                                    onChange={handleField}
                                />
                            </div>

                            {/* Description */}
                            <div className="field-group full">
                                <label htmlFor="cls-desc">Description (optional)</label>
                                <textarea
                                    id="cls-desc"
                                    name="description"
                                    rows={2}
                                    placeholder='e.g. "Morning session class"'
                                    value={form.description}
                                    onChange={handleField}
                                />
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={closeModal}>Cancel</button>
                            <button className="btn-save" onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving...' : (modal === 'add' ? 'Create Class' : 'Save Changes')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Add Grade Modal ─────────────────────────────────────────── */}
            {modal === 'addGrade' && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
                    <div className="modal-card modal-card-small" role="dialog" aria-modal="true">
                        <div className="modal-header">
                            <h3>
                                <><Plus size={18} /> Add New Grade</>
                            </h3>
                            <button className="modal-close" onClick={closeModal} aria-label="Close">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="grade-form-content">
                            <div className="info-box">
                                <p>
                                    <strong>Note:</strong> This will create a default class (Section A) for the selected grade level.
                                    You can add more sections later.
                                </p>
                            </div>

                            <div className="form-grid-grade">
                                <div className="field-group">
                                    <label htmlFor="grade-level">Grade Level *</label>
                                    <input
                                        id="grade-level"
                                        placeholder='e.g. "Grade 5"'
                                        value={gradeForm.grade}
                                        onChange={e => setGradeForm(f => ({ ...f, grade: e.target.value }))}
                                        autoFocus
                                        list="grade-suggestions"
                                    />
                                    <datalist id="grade-suggestions">
                                        {Object.values(GRADE_OPTIONS).flat().map(g => (
                                            <option key={g} value={g} />
                                        ))}
                                    </datalist>
                                </div>

                                <div className="field-group">
                                    <label htmlFor="grade-stage">Stage *</label>
                                    <select
                                        id="grade-stage"
                                        value={gradeForm.stage}
                                        onChange={e => setGradeForm(f => ({ ...f, stage: e.target.value }))}
                                    >
                                        <option value="">— Select Stage —</option>
                                        <option value="primary">Primary (Grades 1-6)</option>
                                        <option value="preparatory">Preparatory (Grades 7-9)</option>
                                        <option value="secondary">Secondary (Grades 10-12)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={closeModal}>Cancel</button>
                            <button className="btn-save" onClick={handleSaveGrade} disabled={saving}>
                                {saving ? 'Creating...' : 'Create Grade'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Confirm Modal ──────────────────────────────────────── */}
            {modal === 'delete' && selected && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
                    <div className="modal-card" role="dialog" aria-modal="true">
                        <div className="modal-header">
                            <h3><Trash2 size={18} /> Delete Class</h3>
                            <button className="modal-close" onClick={closeModal} aria-label="Close"><X size={16} /></button>
                        </div>

                        <div className="delete-modal-body">
                            <div className="delete-icon-ring">
                                <Trash2 size={28} />
                            </div>
                            <h4>Delete "{selected.name}"?</h4>
                            <p>
                                This action cannot be undone.{selected.studentCount > 0
                                    ? ` This class has ${selected.studentCount} enrolled student(s) and cannot be deleted — re-assign students first.`
                                    : ' All class data will be permanently removed.'}
                            </p>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={closeModal}>Cancel</button>
                            {selected.studentCount === 0 && (
                                <button
                                    className="btn-delete-confirm"
                                    onClick={handleDelete}
                                    disabled={saving}
                                >
                                    {saving ? 'Deleting...' : 'Delete Class'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Class Card ─────────────────────────────────────────────────────────────

function ClassCard({ cls, onEdit, onDelete, onToggleLock }) {
    const studentCount = cls.studentCount ?? 0;
    const maxStudents = cls.maxStudents ?? 30;
    const capacityPercentage = Math.round((studentCount / maxStudents) * 100);
    const isOverCapacity = studentCount > maxStudents;
    const isNearCapacity = capacityPercentage >= 90 && !isOverCapacity;

    return (
        <div className="class-card">
            <div className={`class-card-stripe ${getStripeClass(cls.stage)}`} />
            <div className="class-card-body">
                <div className="class-card-top">
                    <h3 className="class-name">{cls.name}</h3>
                    <div className="class-actions-top">
                        {cls.gradesLocked && (
                            <span className="locked-badge" title="Grades Locked">
                                <Lock size={10} />
                            </span>
                        )}
                    </div>
                </div>
                
                <div className="class-meta">
                    {cls.stage && <span className={getStageBadgeClass(cls.stage)}>{cls.stage}</span>}
                    {cls.grade && <span className="badge-grade">{cls.grade}</span>}
                </div>
                
                {cls.description && <p className="class-description">{cls.description}</p>}
                
                {/* Capacity Section */}
                <div className="capacity-section">
                    <div className="capacity-header">
                        <span className="capacity-label">
                            <Users size={14} />
                            Student Capacity
                        </span>
                        <span className={`capacity-value ${isOverCapacity ? 'over-capacity' : ''} ${isNearCapacity ? 'near-capacity' : ''}`}>
                            {studentCount}/{maxStudents} ({capacityPercentage}%)
                        </span>
                    </div>
                    <div className="capacity-bar">
                        <div 
                            className={`capacity-fill ${isOverCapacity ? 'over' : isNearCapacity ? 'warning' : 'normal'}`}
                            style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                        />
                    </div>
                    {isOverCapacity && (
                        <div className="capacity-warning">
                            <AlertTriangle size={12} />
                            <span>Over capacity by {studentCount - maxStudents} student(s)</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="class-card-footer">
                <div className="class-footer-left">
                    <span className="available-spots">
                        {isOverCapacity ? (
                            <span className="over-text">Over limit</span>
                        ) : (
                            <>{maxStudents - studentCount} spots left</>
                        )}
                    </span>
                </div>
                <div className="class-actions">
                    <button
                        className={`btn-icon ${cls.gradesLocked ? 'unlock' : 'lock'}`}
                        title={cls.gradesLocked ? 'Unlock Grades' : 'Lock Grades'}
                        onClick={() => onToggleLock(cls)}
                    >
                        {cls.gradesLocked ? <Unlock size={14} /> : <Lock size={14} />}
                    </button>
                    <button
                        className="btn-icon edit"
                        title="Edit Class"
                        onClick={() => onEdit(cls)}
                    >
                        <Pencil size={14} />
                    </button>
                    <button
                        className="btn-icon delete"
                        title="Delete Class"
                        onClick={() => onDelete(cls)}
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
