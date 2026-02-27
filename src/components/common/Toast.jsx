import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import './Toast.css';

/**
 * Toast Component
 * Displays temporary notification messages
 * 
 * @param {string} type - 'success' | 'error' | 'warning' | 'info'
 * @param {string} message - Message to display
 * @param {function} onClose - Callback when toast is closed
 * @param {number} duration - Auto-dismiss duration in ms (0 = no auto-dismiss)
 */
const Toast = React.memo(function Toast({ type = 'info', message, onClose, duration = 3000 }) {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const icons = {
        success: <CheckCircle size={20} />,
        error: <XCircle size={20} />,
        warning: <AlertCircle size={20} />,
        info: <Info size={20} />
    };

    return (
        <div className={`toast toast-${type}`}>
            <div className="toast-icon">{icons[type]}</div>
            <span className="toast-message">{message}</span>
            <button className="toast-close" onClick={onClose}>
                <X size={16} />
            </button>
        </div>
    );
});

Toast.propTypes = {
    type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
    message: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    duration: PropTypes.number
};

export default Toast;
