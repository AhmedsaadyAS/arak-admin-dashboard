import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './ConfirmModal.css';

/**
 * ConfirmModal Component
 * Reusable confirmation dialog for delete operations
 * 
 * @param {Boolean} isOpen - Show/hide modal
 * @param {String} title - Modal title
 * @param {String} message - Confirmation message
 * @param {String} confirmText - Confirm button text
 * @param {String} cancelText - Cancel button text
 * @param {Function} onConfirm - Callback for confirm action
 * @param {Function} onCancel - Callback for cancel action
 * @param {String} variant - 'danger' | 'warning' | 'info'
 */
export default function ConfirmModal({
    isOpen = false,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    variant = "danger"
}) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className={`modal-content ${variant}`} onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onCancel}>
                    <X size={20} />
                </button>

                <div className="modal-icon">
                    <AlertTriangle size={48} />
                </div>

                <h3 className="modal-title">{title}</h3>
                <p className="modal-message">{message}</p>

                <div className="modal-actions">
                    <button
                        className="modal-btn cancel-btn"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>
                    <button
                        className={`modal-btn confirm-btn ${variant}`}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
