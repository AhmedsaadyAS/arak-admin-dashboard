import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Download, Upload, FileSpreadsheet, AlertTriangle, CheckCircle, X, ChevronDown } from 'lucide-react';
import { api } from '../../services/api';
import { STAGE_OPTIONS } from '../../config/gradingSystems';
import { generateOfficialSheet, downloadSheet, parseOfficialSheet, gradesToEvaluations, saveEvaluations } from '../../services/officialSheetService';
import './SheetManager.css';

export default function SheetManager() {
    // ─── Raw Data ─────────────────────────────────────
    const [subjects, setSubjects] = useState([]);
    const [allClasses, setAllClasses] = useState([]);
    const [schedules, setSchedules] = useState([]); // Timetable entries

    // ─── Selection ────────────────────────────────────
    const [selectedStage, setSelectedStage] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');

    // ─── UI State ─────────────────────────────────────
    const [uploading, setUploading] = useState(false);
    const [downloadingTemplate, setDownloadingTemplate] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [parseResult, setParseResult] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const fileInputRef = useRef(null);

    // ─── Data Fetching ────────────────────────────────
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [subjectsData, classesData, schedulesData] = await Promise.all([
                    api.getSubjects(),
                    api.getClasses(),
                    api.getSchedules(),
                ]);
                console.log('[SheetManager] Fetched subjects:', subjectsData);
                console.log('[SheetManager] Fetched classes:', classesData);
                console.log('[SheetManager] Fetched schedules:', schedulesData);
                setSubjects(subjectsData || []);
                setAllClasses(classesData || []);
                setSchedules(schedulesData || []);
            } catch (err) {
                console.error('Failed to fetch data:', err);
            }
        };
        fetchData();
    }, []);

    // ─── Derived State via useMemo (no extra useState/useEffect) ──
    /** Classes filtered by selected stage */
    const filteredClasses = useMemo(() => {
        if (!selectedStage) return [];
        // Map frontend stage values to backend stage values
        const stageMap = {
            'PRIMARY': 'primary',
            'PREP': 'preparatory',
            'SECONDARY': 'secondary'
        };
        const backendStage = stageMap[selectedStage] || selectedStage.toLowerCase();
        console.log('[SheetManager] Filtering classes:', { selectedStage, backendStage, allClasses });
        const result = allClasses.filter(c => c.stage === backendStage);
        console.log('[SheetManager] Filtered classes result:', result);
        return result;
    }, [selectedStage, allClasses]);

    /** Selected class object */
    const selectedClassObj = useMemo(
        () => allClasses.find(c => String(c.id) === String(selectedClass)) || null,
        [allClasses, selectedClass]
    );

    /** Subjects - filter by subjects that have timetable entries for the selected class */
    const filteredSubjects = useMemo(() => {
        if (!selectedClass) return subjects;
        
        // Get unique subjectIds from timetable entries for this class
        const classSubjectIds = [...new Set(
            schedules
                .filter(s => s.classId === parseInt(selectedClass, 10))
                .map(s => s.subjectId)
                .filter(id => id != null)
        )];
        
        // Return subjects that are in this class's timetable
        return subjects.filter(s => classSubjectIds.includes(parseInt(s.id, 10)));
    }, [selectedClass, subjects, schedules]);

    /** Selected subject object */
    const selectedSubjectObj = useMemo(
        () => subjects.find(s => String(s.id) === String(selectedSubject)) || null,
        [subjects, selectedSubject]
    );

    /** Form ready when all 3 dropdowns have a value */
    const isFormValid = useMemo(
        () => Boolean(selectedStage && selectedClass && selectedSubject),
        [selectedStage, selectedClass, selectedSubject]
    );

    // Reset class when stage changes
    useEffect(() => {
        setSelectedClass('');
        setSelectedSubject('');
    }, [selectedStage]);

    // Reset subject when class changes (or it's no longer in filteredSubjects)
    useEffect(() => {
        const isStillValid =
            selectedSubject &&
            filteredSubjects.some(s => String(s.id) === String(selectedSubject));
        if (!isStillValid) setSelectedSubject('');
    }, [filteredSubjects]); // eslint-disable-line react-hooks/exhaustive-deps

    // ─── Download Template ────────────────────────────
    const handleDownloadTemplate = useCallback(async () => {
        if (!isFormValid) return;
        setDownloadingTemplate(true);
        try {
            const studentsResponse = await api.getStudents({ classId: selectedClass });
            const students = Array.isArray(studentsResponse)
                ? studentsResponse
                : studentsResponse?.data || [];

            const buffer = generateOfficialSheet(
                selectedStage,
                selectedSubjectObj?.name || 'Subject',
                students,
                selectedClassObj?.name || ''
            );

            const filename = `${selectedClassObj?.name || 'Class'}_${selectedSubjectObj?.name || 'Subject'}_Template.xlsx`;
            downloadSheet(buffer, filename);
        } catch (err) {
            console.error('Failed to generate template:', err);
            alert('Failed to generate template. Please try again.');
        } finally {
            setDownloadingTemplate(false);
        }
    }, [isFormValid, selectedStage, selectedClass, selectedClassObj, selectedSubjectObj]);

    // ─── File Handling ────────────────────────────────
    const handleFile = useCallback(async (file) => {
        if (!file) return;
        if (!isFormValid) {
            alert('Please select Stage, Class, and Subject first.');
            return;
        }

        const ext = file.name.split('.').pop().toLowerCase();
        if (!['xlsx', 'xls'].includes(ext)) {
            alert('Please upload an Excel file (.xlsx or .xls)');
            return;
        }

        setUploading(true);
        setParseResult(null);
        setSaveSuccess(false);

        try {
            const result = await parseOfficialSheet(file, selectedStage);
            setParseResult(result);
            setShowModal(true);
        } catch (err) {
            console.error('Failed to parse sheet:', err);
            alert('Failed to parse the uploaded file. Please check the format.');
        } finally {
            setUploading(false);
        }
    }, [isFormValid, selectedStage]);

    const handleFileInput = useCallback((e) => {
        if (e.target.files?.[0]) handleFile(e.target.files[0]);
        e.target.value = ''; // allow re-uploading same file
    }, [handleFile]);

    // ─── Drag & Drop ──────────────────────────────────
    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e.type === 'dragenter' || e.type === 'dragover');
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
    }, [handleFile]);

    // ─── Save Grades (upsert: delete old → insert new) ─────
    const handleSaveGrades = useCallback(async () => {
        if (!parseResult || parseResult.validGrades.length === 0) return;
        setSaving(true);
        try {
            const evaluations = gradesToEvaluations(
                parseResult.validGrades,
                {
                    classId: parseInt(selectedClass, 10),
                    subjectId: parseInt(selectedSubject, 10),
                    subjectName: selectedSubjectObj?.name || '',
                    teacherId: null,
                    termId: 1,
                },
                selectedStage
            );

            // Upsert: removes stale records then inserts fresh ones
            const { saved, deleted, errors: saveErrors } = await saveEvaluations(
                evaluations,
                parseInt(selectedClass, 10),
                parseInt(selectedSubject, 10)
            );

            if (saveErrors.length > 0) {
                console.warn('Some evaluations failed to save:', saveErrors);
                alert(`Saved ${saved} grades (${deleted} old records replaced). ${saveErrors.length} rows had errors.`);
            }

            setSaveSuccess(true);
            setTimeout(() => {
                setShowModal(false);
                setParseResult(null);
                setSaveSuccess(false);
            }, 2000);
        } catch (err) {
            console.error('Failed to save grades:', err);
            alert('Failed to save grades. Please try again.');
        } finally {
            setSaving(false);
        }
    }, [parseResult, selectedClass, selectedSubject, selectedSubjectObj, selectedStage]);

    const closeModal = useCallback(() => {
        if (!saving) setShowModal(false);
    }, [saving]);

    // ─── Render ──────────────────────────────────────
    return (
        <div className="sheet-manager">
            {/* Header */}
            <div className="sheet-header">
                <div className="header-left">
                    <FileSpreadsheet size={32} className="header-icon" />
                    <div>
                        <h2>Control Sheets</h2>
                        <p>Generate and manage official Egyptian grading sheets</p>
                    </div>
                </div>
            </div>

            {/* Selection Panel */}
            <div className="selection-panel">
                <h3>Sheet Configuration</h3>
                <div className="selection-grid">
                    {/* Stage */}
                    <div className="form-group">
                        <label htmlFor="stageSelect">Educational Stage *</label>
                        <div className="select-wrapper">
                            <select
                                id="stageSelect"
                                value={selectedStage}
                                onChange={(e) => setSelectedStage(e.target.value)}
                            >
                                <option value="">-- Select Stage --</option>
                                {STAGE_OPTIONS.map(s => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="select-icon" />
                        </div>
                    </div>

                    {/* Class — filtered by stage */}
                    <div className="form-group">
                        <label htmlFor="classSelect">Class *</label>
                        <div className="select-wrapper">
                            <select
                                id="classSelect"
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                disabled={!selectedStage}
                            >
                                <option value="">
                                    {selectedStage ? '-- Select Class --' : '-- Select Stage first --'}
                                </option>
                                {filteredClasses.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="select-icon" />
                        </div>
                    </div>

                    {/* Subject — filtered by class curriculum */}
                    <div className="form-group">
                        <label htmlFor="subjectSelect">Subject *</label>
                        <div className="select-wrapper">
                            <select
                                id="subjectSelect"
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                disabled={!selectedClass}
                            >
                                <option value="">
                                    {selectedClass ? '-- Select Subject --' : '-- Select Class first --'}
                                </option>
                                {filteredSubjects.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.nameAr || s.code})</option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="select-icon" />
                        </div>
                    </div>
                </div>

                {/* Stage Info Badge */}
                {selectedStage && (
                    <div className="stage-info">
                        <span className="stage-badge">
                            {STAGE_OPTIONS.find(s => s.value === selectedStage)?.label}
                        </span>
                        <span className="stage-desc">
                            Grades: {STAGE_OPTIONS.find(s => s.value === selectedStage)?.grades?.join(', ')}
                        </span>
                    </div>
                )}
            </div>

            {/* Action Panel */}
            <div className="action-panel">
                <div className="action-grid">
                    {/* Download Template */}
                    <div className="action-card download-card">
                        <div className="action-icon-box download-icon-box">
                            <Download size={28} />
                        </div>
                        <h4>Download Template</h4>
                        <p>Generate an official Excel template with student names and grade columns for the selected stage.</p>
                        <button
                            className="action-btn download-btn"
                            onClick={handleDownloadTemplate}
                            disabled={!isFormValid || downloadingTemplate}
                        >
                            {downloadingTemplate ? 'Generating...' : 'Download Excel Template'}
                        </button>
                    </div>

                    {/* Upload Sheet */}
                    <div
                        className={`action-card upload-card ${dragActive ? 'drag-active' : ''}`}
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                    >
                        <div className="action-icon-box upload-icon-box">
                            <Upload size={28} />
                        </div>
                        <h4>Upload Filled Sheet</h4>
                        <p>Upload a completed grading sheet. Scores will be validated before saving.</p>
                        <div className="upload-zone">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileInput}
                                style={{ display: 'none' }}
                            />
                            <button
                                className="action-btn upload-btn"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={!isFormValid || uploading}
                            >
                                {uploading ? 'Parsing...' : 'Choose File or Drag & Drop'}
                            </button>
                        </div>
                        {dragActive && (
                            <div className="drag-overlay">
                                <Upload size={40} />
                                <span>Drop Excel file here</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Validation Results Modal */}
            {showModal && parseResult && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>
                                {saveSuccess ? (
                                    <><CheckCircle size={22} style={{ color: '#22C55E' }} /> Grades Saved!</>
                                ) : parseResult.errors.length > 0 ? (
                                    <><AlertTriangle size={22} style={{ color: '#F59E0B' }} /> Validation Results</>
                                ) : (
                                    <><CheckCircle size={22} style={{ color: '#22C55E' }} /> All Scores Valid</>
                                )}
                            </h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Summary */}
                        <div className="modal-summary">
                            <div className="summary-stat">
                                <span className="stat-number">{parseResult.summary.totalRows}</span>
                                <span className="stat-label">Total Rows</span>
                            </div>
                            <div className="summary-stat valid">
                                <span className="stat-number">{parseResult.summary.validCount}</span>
                                <span className="stat-label">Valid</span>
                            </div>
                            <div className="summary-stat errors">
                                <span className="stat-number">{parseResult.summary.errorCount}</span>
                                <span className="stat-label">Errors</span>
                            </div>
                            <div className="summary-stat">
                                <span className="stat-number">{parseResult.summary.averageTotal}%</span>
                                <span className="stat-label">Average</span>
                            </div>
                        </div>

                        {/* Error List */}
                        {parseResult.errors.length > 0 && (
                            <div className="error-list">
                                <h4>Errors ({parseResult.errors.length})</h4>
                                <div className="error-scroll">
                                    {parseResult.errors.map((err, i) => (
                                        <div key={i} className="error-row">
                                            <span className="error-badge">Row {err.row}</span>
                                            <span className="error-msg">{err.message}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="modal-actions">
                            <button className="modal-cancel" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            {parseResult.validGrades.length > 0 && !saveSuccess && (
                                <button
                                    className="modal-save"
                                    onClick={handleSaveGrades}
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : `Save ${parseResult.validGrades.length} Valid Grades`}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
