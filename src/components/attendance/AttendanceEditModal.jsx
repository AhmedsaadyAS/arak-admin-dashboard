import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Shared Attendance Edit Modal
 * Used in both Attendance Overview and Student Details pages.
 */
export default function AttendanceEditModal({ record, onClose, onSave }) {
    const [status, setStatus] = useState(record.status === 'NotMarked' ? 'Present' : record.status);
    const [timeIn, setTimeIn] = useState(record.timeIn ? record.timeIn.substring(0, 5) : '08:00');
    const [timeOut, setTimeOut] = useState(record.timeOut ? record.timeOut.substring(0, 5) : '');
    const [notes, setNotes] = useState(record.notes || '');


    return (
        <div className="att-modal-overlay animate-fade-in">
            <div className="att-modal-card">
                <div className="modal-header">
                    <h4>Update Attendance</h4>
                    <span>{record.studentName}</span>
                </div>
                
                <div className="modal-body">
                    <div className="modal-field">
                        <label>Attendance Status</label>
                        <div className="select-container">
                            <select value={status} onChange={(e) => setStatus(e.target.value)}>
                                <option value="Present">Present</option>
                                <option value="Absent">Absent</option>
                                <option value="Late">Late</option>
                            </select>
                            <ChevronDown className="field-icon" size={16} />
                        </div>
                    </div>

                    <div className="modal-row">
                        <div className="modal-field">
                            <label>Time In</label>
                            <input type="time" value={timeIn} onChange={(e) => setTimeIn(e.target.value)} />
                        </div>
                        <div className="modal-field">
                            <label>Time Out</label>
                            <input type="time" value={timeOut} onChange={(e) => setTimeOut(e.target.value)} />
                        </div>
                    </div>

                    <div className="modal-field">
                        <label>Private Notes</label>
                        <textarea 
                            value={notes} 
                            onChange={(e) => setNotes(e.target.value)} 
                            placeholder="Add reason for absence or late arrival..."
                        />
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="att-btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="att-btn btn-primary" onClick={() => onSave({
                        status: status,
                        timeIn: timeIn ? `${timeIn}:00` : null,
                        timeOut: timeOut ? `${timeOut}:00` : null,
                        notes
                    })}>Update Record</button>
                </div>
            </div>
        </div>
    );
}
