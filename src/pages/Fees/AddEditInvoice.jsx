import React, { useState } from 'react';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { studentsData } from '../../mock/students';
import '../../styles/layout.css';
import '../Dashboard/dashboard.css';

export default function AddEditInvoice({ invoice, onBack, onSave }) {
    const isEditMode = !!invoice;

    const [formData, setFormData] = useState({
        id: invoice?.id || '',
        studentId: invoice?.studentId || '',
        amount: invoice?.amount || '',
        description: invoice?.description || '',
        dueDate: invoice?.dueDate || '',
        status: invoice?.status || 'Pending',
        date: invoice?.date || new Date().toISOString().split('T')[0]
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const student = studentsData.find(s => s.id === parseInt(formData.studentId));
        const invoiceData = {
            ...formData,
            studentId: parseInt(formData.studentId),
            amount: parseFloat(formData.amount),
            studentName: student?.name || 'Unknown',
            studentClass: student?.grade || 'Unknown',
            parentName: student?.parentName || 'Unknown'
        };
        onSave(invoiceData);
    };

    const selectedStudent = studentsData.find(s => s.id === parseInt(formData.studentId));

    return (
        <div className="dashboard-page">
            <button onClick={onBack} className="back-button">← Back to Invoices</button>

            <div className="chart-card">
                <div className="card-header">
                    <h3>{isEditMode ? 'Edit Invoice' : 'Create New Invoice'}</h3>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Section: Invoice Details */}
                    <h4 style={{ color: 'var(--primary-color)', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                        Invoice Details
                    </h4>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Invoice ID</label>
                            <input
                                type="text"
                                name="id"
                                value={formData.id}
                                onChange={handleChange}
                                placeholder="Auto-generated"
                                disabled={!isEditMode}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    background: isEditMode ? 'white' : '#f9fafb',
                                    color: '#6b7280'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Invoice Date</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Due Date *</label>
                            <input
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Status *</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                                <option value="Overdue">Overdue</option>
                            </select>
                        </div>
                    </div>

                    {/* Section: Student Information */}
                    <h4 style={{ color: 'var(--primary-color)', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                        Student Information
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Select Student *</label>
                            <select
                                name="studentId"
                                value={formData.studentId}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            >
                                <option value="">Select Student</option>
                                {studentsData.map(student => (
                                    <option key={student.id} value={student.id}>
                                        {student.name} ({student.grade}) - ID: {student.studentId}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedStudent && (
                            <>
                                <div style={{
                                    padding: '1rem',
                                    background: '#F3F4FF',
                                    borderRadius: '8px',
                                    border: '1px solid #C1BBEB'
                                }}>
                                    <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.25rem' }}>Parent Name</div>
                                    <div style={{ fontWeight: '600', color: '#303972' }}>{selectedStudent.parentName}</div>
                                </div>
                                <div style={{
                                    padding: '1rem',
                                    background: '#F3F4FF',
                                    borderRadius: '8px',
                                    border: '1px solid #C1BBEB'
                                }}>
                                    <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.25rem' }}>Class</div>
                                    <div style={{ fontWeight: '600', color: '#303972' }}>{selectedStudent.grade}</div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Section: Payment Information */}
                    <h4 style={{ color: 'var(--primary-color)', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                        Payment Information
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Amount ($) *</label>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            />
                        </div>

                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description *</label>
                            <input
                                type="text"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                placeholder="e.g., Term 1 Tuition Fee, Lab Fee, Books & Materials"
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            />
                        </div>
                    </div>

                    {/* Summary Card */}
                    {formData.amount && (
                        <div style={{
                            padding: '1.5rem',
                            background: 'linear-gradient(135deg, #4D44B5 0%, #6B5DD3 100%)',
                            borderRadius: '12px',
                            color: 'white',
                            marginBottom: '2rem'
                        }}>
                            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', opacity: 0.9 }}>Total Invoice Amount</div>
                            <div style={{ fontSize: '2rem', fontWeight: '700' }}>${parseFloat(formData.amount || 0).toLocaleString()}</div>
                            <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', opacity: 0.8 }}>
                                Due: {formData.dueDate || 'Not set'}
                            </div>
                        </div>
                    )}

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
                            {isEditMode ? 'Update Invoice' : 'Create Invoice'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
