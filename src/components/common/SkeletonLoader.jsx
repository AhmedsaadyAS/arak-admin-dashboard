import React from 'react';
import './SkeletonLoader.css';

/**
 * SkeletonLoader Component
 * Loading placeholder for async data
 * 
 * @param {String} variant - 'table' | 'card' | 'text' | 'circle'
 * @param {Number} rows - Number of rows (for table variant)
 * @param {Number} height - Custom height in pixels
 */
export default function SkeletonLoader({
    variant = "table",
    rows = 5,
    height
}) {
    if (variant === 'table') {
        return (
            <div className="skeleton-table">
                {/* Header */}
                <div className="skeleton-table-header">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="skeleton-cell skeleton-header-cell" />
                    ))}
                </div>
                {/* Rows */}
                {[...Array(rows)].map((_, rowIndex) => (
                    <div key={rowIndex} className="skeleton-table-row">
                        {[...Array(4)].map((_, cellIndex) => (
                            <div key={cellIndex} className="skeleton-cell" />
                        ))}
                    </div>
                ))}
            </div>
        );
    }

    if (variant === 'card') {
        return (
            <div className="skeleton-card" style={{ height: height ? `${height}px` : '200px' }}>
                <div className="skeleton-card-header" />
                <div className="skeleton-card-body">
                    <div className="skeleton-line" style={{ width: '80%' }} />
                    <div className="skeleton-line" style={{ width: '60%' }} />
                    <div className="skeleton-line" style={{ width: '90%' }} />
                </div>
            </div>
        );
    }

    if (variant === 'circle') {
        return <div className="skeleton-circle" style={{ width: height || 40, height: height || 40 }} />;
    }

    // Default: text lines
    return (
        <div className="skeleton-text">
            <div className="skeleton-line" style={{ width: '100%' }} />
            <div className="skeleton-line" style={{ width: '80%' }} />
            <div className="skeleton-line" style={{ width: '60%' }} />
        </div>
    );
}
