import React, { useState, useEffect, useRef } from 'react';
import { Save, X, Upload } from 'lucide-react';
import { api } from '../../services/api';
import '../../styles/layout.css';
import '../Dashboard/dashboard.css';

export default function AddEditStudent({ student, onBack, onSave }) {
    const isEditMode = !!student;
    const [classes, setClasses] = useState([]);
    const [parents, setParents] = useState([]);

    const [formData, setFormData] = useState({
        name: student?.name || '',
        studentId: student?.studentId || '',
        email: student?.email || '',
        phone: student?.phoneNumber || student?.phone || '',
        grade: student?.grade || '',
        classId: student?.classId || '',
        className: student?.className || '',
        dateOfBirth: student?.dateOfBirth || '',
        placeOfBirth: student?.placeOfBirth || 'Jakarta',
        address: student?.address || '',
        city: student?.city || '',
        parentId: student?.parentId || '',
        parentName: student?.parentName || '',
        parentEmail: student?.parentEmail || '',
        parentPhone: student?.parentPhone || '',
        status: student?.status || 'Active',
        image: student?.image || null,
        imagePreview: null,
    });

    // Fetch classes and parents on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [classesData, parentsRes] = await Promise.all([
                    api.getClasses(),
                    api.getParents()
                ]);
                const loadedClasses = classesData || [];
                setClasses(loadedClasses);
                const loadedParents = parentsRes || [];
                setParents(loadedParents);

                // Auto-resolve grade from classId if grade doesn't match any class name
                if (student?.classId && loadedClasses.length > 0) {
                    const matchedClass = loadedClasses.find(c => c.id == student.classId);
                    if (matchedClass) {
                        setFormData(prev => ({
                            ...prev,
                            grade: matchedClass.name,
                            className: matchedClass.name
                        }));
                    }
                }

                // Auto-populate parent details from parentId on edit
                if (student?.parentId && loadedParents.length > 0) {
                    const matchedParent = loadedParents.find(p => p.id == student.parentId);
                    if (matchedParent) {
                        setFormData(prev => ({
                            ...prev,
                            parentName: matchedParent.parentName || '',
                            parentEmail: matchedParent.email || '',
                            parentPhone: matchedParent.phone || ''
                        }));
                    }
                }
            } catch (error) {
                console.error('Failed to fetch form data:', error);
            }
        };
        fetchData();
    }, []);

    // Handle parent selection from dropdown
    const handleParentSelect = (e) => {
        const selectedId = e.target.value;
        if (!selectedId) {
            // "None" selected — clear parent fields
            setFormData(prev => ({
                ...prev,
                parentId: '',
                parentName: '',
                parentEmail: '',
                parentPhone: ''
            }));
            return;
        }
        const parent = parents.find(p => String(p.id) === String(selectedId));
        if (parent) {
            setFormData(prev => ({
                ...prev,
                parentId: parent.id,
                parentName: parent.parentName || '',
                parentEmail: parent.email || '',
                parentPhone: parent.phone || ''
            }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // If class is selected, also set className
        if (name === 'classId') {
            const selectedClass = classes.find(c => c.id == value);
            setFormData(prev => ({
                ...prev,
                classId: value,
                className: selectedClass?.name || '',
                grade: selectedClass?.name || prev.grade
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const fileInputRef = useRef(null);

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Preview immediately
        const previewUrl = URL.createObjectURL(file);
        setFormData(prev => ({ ...prev, imagePreview: previewUrl }));

        // Upload to backend
        try {
            const formPayload = new FormData();
            formPayload.append('file', file);
            const response = await api.uploadPhoto(formPayload);
            setFormData(prev => ({ ...prev, image: response.url }));
        } catch (err) {
            console.error('Photo upload failed:', err);
            alert('Failed to upload photo. Please try again.');
            setFormData(prev => ({ ...prev, imagePreview: null }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const studentData = {
            id: student ? parseInt(student.id) : undefined,
            name: formData.name || "",
            userName: formData.name || "",
            age: parseInt(formData.age) || 0,
            email: formData.email || "",
            dateOfBirth: formData.dateOfBirth || "",
            placeOfBirth: formData.placeOfBirth || "",
            address: formData.address || "",
            city: formData.city || "",
            phoneNumber: formData.phone || formData.phoneNumber || "",
            grade: formData.grade || "",
            status: formData.status || "Active",
            image: formData.image || null,
            classId: formData.classId ? parseInt(formData.classId) : null,
            parentId: formData.parentId ? parseInt(formData.parentId) : null,
        };
        onSave(studentData);
    };

    return (
        <div className="dashboard-page">
            <button onClick={onBack} className="back-button">← Back to Students List</button>

            <div className="chart-card">
                <div className="card-header">
                    <h3>{isEditMode ? 'Edit Student' : 'Add New Student'}</h3>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Section: Student Information */}
                    <h4 style={{ color: 'var(--primary-color)', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                        Student Information
                    </h4>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                        {/* Photo Upload */}
                        <div style={{ gridRow: 'span 3', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontWeight: '500' }}>Photo</label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handlePhotoUpload}
                                style={{ display: 'none' }}
                            />
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    width: '150px',
                                    height: '150px',
                                    background: '#F3F4FF',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px dashed #C1BBEB',
                                    cursor: 'pointer',
                                    color: 'var(--primary-color)',
                                    overflow: 'hidden'
                                }}
                            >
                                {formData.imagePreview || formData.image ? (
                                    <img
                                        src={formData.imagePreview || formData.image}
                                        alt="Student"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
                                    />
                                ) : (
                                    <>
                                        <Upload size={24} />
                                        <span style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Upload Photo</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="studentName" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Full Name *</label>
                            <input
                                id="studentName"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                autoComplete="name"
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            />
                        </div>

                        <div>
                            <label htmlFor="studentIdField" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Student ID *</label>
                            <input
                                id="studentIdField"
                                type="text"
                                name="studentId"
                                value={formData.studentId}
                                onChange={handleChange}
                                required
                                placeholder="#123456"
                                autoComplete="off"
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            />
                        </div>

                        <div>
                            <label htmlFor="grade" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Grade *</label>
                            <select
                                id="grade"
                                name="grade"
                                value={formData.grade}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            >
                                <option value="">Select Grade</option>
                                {classes.map(cls => (
                                    <option key={cls.id} value={cls.name}>{cls.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="classId" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Class *</label>
                            <select
                                id="classId"
                                name="classId"
                                value={formData.classId}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            >
                                <option value="">Select Class</option>
                                {classes.map(cls => (
                                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                                ))}
                            </select>
                        </div>


                        <div>
                            <label htmlFor="dateOfBirth" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Date of Birth *</label>
                            <input
                                type="date"
                                id="dateOfBirth"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                required
                                autoComplete="bday"
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            />
                        </div>

                        <div>
                            <label htmlFor="placeOfBirth" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Place of Birth</label>
                            <input
                                type="text"
                                id="placeOfBirth"
                                name="placeOfBirth"
                                value={formData.placeOfBirth}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            />
                        </div>
                    </div>

                    {/* Section: Contact Information */}
                    <h4 style={{ color: 'var(--primary-color)', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                        Contact Information
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div>
                            <label htmlFor="studentEmail" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email *</label>
                            <input
                                id="studentEmail"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                autoComplete="email"
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            />
                        </div>
                        <div>
                            <label htmlFor="studentPhone" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Phone *</label>
                            <input
                                id="studentPhone"
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                autoComplete="tel"
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label htmlFor="studentAddress" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Address *</label>
                            <textarea
                                id="studentAddress"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                rows="3"
                                autoComplete="street-address"
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontFamily: 'inherit' }}
                            />
                        </div>
                    </div>

                    {/* Section: Parent Information */}
                    <h4 style={{ color: 'var(--primary-color)', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                        Parent / Guardian
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                        {/* Parent Selector */}
                        <div style={{ gridColumn: 'span 2' }}>
                            <label htmlFor="parentId" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Select Parent</label>
                            <select
                                id="parentId"
                                name="parentId"
                                value={formData.parentId}
                                onChange={handleParentSelect}
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white' }}
                            >
                                <option value="">-- Choose a parent --</option>
                                {parents.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.parentName} — {p.email}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Auto-filled read-only fields (shown when parent selected) */}
                        {formData.parentId && (
                            <>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#6b7280' }}>Parent Name</label>
                                    <div style={{ padding: '0.75rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#374151' }}>
                                        {formData.parentName || '—'}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#6b7280' }}>Parent Email</label>
                                    <div style={{ padding: '0.75rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#374151' }}>
                                        {formData.parentEmail || '—'}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#6b7280' }}>Parent Phone</label>
                                    <div style={{ padding: '0.75rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#374151' }}>
                                        {formData.parentPhone || '—'}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                        <button
                            type="button"
                            onClick={onBack}
                            style={{
                                padding: '0.75rem 2rem',
                                border: '1px solid #e5e7eb',
                                background: 'white',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <X size={18} />
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={{
                                padding: '0.75rem 2rem',
                                background: 'var(--primary-color)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <Save size={18} />
                            {isEditMode ? 'Update Student' : 'Save Student'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
