import React, { useState, useEffect, useRef } from 'react';
import { Save, X, Upload } from 'lucide-react';
import { api } from '../../services/api';
import '../../styles/layout.css';
import '../Dashboard/dashboard.css';

export default function AddEditTeacher({ teacher, onBack, onSave }) {
    const isEditMode = !!teacher;

    const [formData, setFormData] = useState({
        name: teacher?.name || '',
        teacherId: teacher?.teacherId || '',
        email: teacher?.email || '',
        phone: teacher?.phoneNumber || teacher?.phone || '',
        subject: teacher?.subject || '',
        dateJoined: teacher?.dateJoined || new Date().toISOString().split('T')[0],
        address: teacher?.address || '',
        about: teacher?.about || '',
        status: teacher?.status || 'Active',
        assignedClasses: (teacher?.assignedClasses || []).map(Number),
        image: teacher?.image || null,
        imagePreview: null,
    });

    const [availableClasses, setAvailableClasses] = useState([]);

    // Fetch classes on mount
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const classesData = await api.getClasses();
                setAvailableClasses(classesData || []);
            } catch (error) {
                console.error("Failed to fetch classes", error);
            }
        };
        fetchClasses();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const fileInputRef = useRef(null);

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const previewUrl = URL.createObjectURL(file);
        setFormData(prev => ({ ...prev, imagePreview: previewUrl }));

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
        const { phone, imagePreview, image, ...rest } = formData;
        onSave({
            ...rest,
            image: image || null,
            phoneNumber: phone || '',
        });
    };
    return (
        <div className="dashboard-page">
            <button onClick={onBack} className="back-button">← Back to Teachers List</button>

            <div className="chart-card">
                <div className="card-header">
                    <h3>{isEditMode ? 'Edit Teacher' : 'Add New Teacher'}</h3>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Section: Personal Information */}
                    <h4 style={{ color: 'var(--primary-color)', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                        Personal Information
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
                                        alt="Teacher"
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
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Full Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Teacher ID *</label>
                            <input
                                type="text"
                                name="teacherId"
                                value={formData.teacherId}
                                onChange={handleChange}
                                required
                                placeholder="#T123456"
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Phone *</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            />
                        </div>


                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Address</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows="2"
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontFamily: 'inherit' }}
                            />
                        </div>
                    </div>

                    {/* Section: Professional Information */}
                    <h4 style={{ color: 'var(--primary-color)', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                        Professional Information
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Subject *</label>
                            <select
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            >
                                <option value="">Select Subject</option>
                                <option value="Mathematics">Mathematics</option>
                                <option value="History">History</option>
                                <option value="Physics">Physics</option>
                                <option value="Chemistry">Chemistry</option>
                                <option value="Biology">Biology</option>
                                <option value="English">English</option>
                                <option value="Computer Science">Computer Science</option>
                            </select>
                        </div>


                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Assigned Classes</label>
                            <select
                                multiple
                                value={formData.assignedClasses}
                                onChange={(e) => {
                                    const selected = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                                    setFormData(prev => ({ ...prev, assignedClasses: selected }));
                                }}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    minHeight: '120px'
                                }}
                            >
                                {availableClasses.map(cls => (
                                    <option key={cls.id} value={cls.id}>
                                        {cls.name} {cls.grade ? `(Grade ${cls.grade})` : ''}
                                    </option>
                                ))}
                            </select>
                            <small style={{ color: '#6B7280', marginTop: '0.25rem', display: 'block' }}>
                                Hold Ctrl (Windows) or Cmd (Mac) to select multiple classes
                            </small>
                        </div>


                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Date Joined</label>
                            <input
                                type="date"
                                name="dateJoined"
                                value={formData.dateJoined}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            />
                        </div>


                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>About</label>
                            <textarea
                                name="about"
                                value={formData.about}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Short bio..."
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontFamily: 'inherit' }}
                            />
                        </div>
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
                            {isEditMode ? 'Update Teacher' : 'Save Teacher'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
