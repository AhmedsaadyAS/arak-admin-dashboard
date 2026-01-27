import React from 'react';
import { AlertTriangle, X, Link2 } from 'lucide-react';
import './DeleteWarningModal.css';

/**
 * DeleteWarningModal Component
 * Specialized modal for displaying dependency warnings before deletion
 * 
 * @param {Boolean} isOpen - Show/hide modal
 * @param {String} entityType - Type of entity being deleted (Teacher, Student, etc.)
 * @param {String} entityName - Name of the entity
 * @param {Object} dependencies - Object with dependency counts {classes: 3, tasks: 5, etc.}
 * @param {Function} onCancel - Callback for cancel action
 */
export default function DeleteWarningModal({
    isOpen = false,
    entityType = "Teacher",
    entityName = "",
    dependencies = {},
    onCancel
}) {
    if (!isOpen) return null;

    const dependencyEntries = Object.entries(dependencies).filter(([_, count]) => count > 0);
    const totalDependencies = Object.values(dependencies).reduce((sum, count) => sum + count, 0);

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="delete-warning-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onCancel}>
                    <X size={20} />
                </button>

                <div className="warning-icon">
                    <AlertTriangle size={64} />
                </div>

                <h3 className="warning-title">Cannot Delete {entityType}</h3>

                <div className="warning-message">
                    <p>
                        <strong>{entityName || `This ${entityType.toLowerCase()}`}</strong> cannot be deleted
                        because it is currently linked to <strong>{totalDependencies} records</strong> in the system.
                    </p>
                </div>

                <div className="dependencies-list">
                    <div className="dependencies-header">
                        <Link2 size={18} />
                        <span>Active Dependencies</span>
                    </div>
                    {dependencyEntries.map(([type, count]) => (
                        <div key={type} className="dependency-item">
                            <span className="dependency-type">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                            <span className="dependency-count">{count} record{count > 1 ? 's' : ''}</span>
                        </div>
                    ))}
                </div>

                <div className="warning-instructions">
                    <p>
                        <strong>Next Steps:</strong> Please reassign or remove these dependencies before deleting this {entityType.toLowerCase()}.
                    </p>
                </div>

                <div className="modal-actions-center">
                    <button
                        className="action-btn-primary"
                        onClick={onCancel}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
