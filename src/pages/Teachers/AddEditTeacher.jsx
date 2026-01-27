import React, { useState, useEffect } from 'react';
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
        phone: teacher?.phone || '',
        subject: teacher?.subject || '',
        department: teacher?.department || '',
        experience: teacher?.experience || '',
        education: teacher?.education || '',
        dateJoined: teacher?.dateJoined || new Date().toISOString().split('T')[0],
        address: teacher?.address || '',
        city: teacher?.city || '',
        about: teacher?.about || '',
        status: teacher?.status || 'Active',
        assignedClasses: teacher?.assignedClasses || []
    });

    const [availableClasses, setAvailableClasses] = useState([]);

    // Fetch classes on mount
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await api.client.get('/classes');
                setAvailableClasses(response.data || []);
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

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
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
                        {/* Photo Upload Placeholder */}
                        <div style={{ gridRow: 'span 3', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontWeight: '500' }}>Photo</label>
                            <div style={{
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
                                color: 'var(--primary-color)'
                            }}>
                                <Upload size={24} />
                                <span style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Upload Photo</span>
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

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>City *</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
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

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Department</label>
                            <select
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            >
                                <option value="">Select Department</option>
                                <option value="Science">Science</option>
                                <option value="Humanities">Humanities</option>
                                <option value="Languages">Languages</option>
                                <option value="Mathematics">Mathematics</option>
                                <option value="Technology">Technology</option>
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
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Experience (Years)</label>
                            <input
                                type="number"
                                name="experience"
                                value={formData.experience}
                                onChange={handleChange}
                                min="0"
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            />
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
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Education / Qualifications</label>
                            <input
                                type="text"
                                name="education"
                                value={formData.education}
                                onChange={handleChange}
                                placeholder="e.g. PhD in Physics, University of..."
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
