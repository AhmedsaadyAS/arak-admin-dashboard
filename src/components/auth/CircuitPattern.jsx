import React from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable Circuit Pattern SVG Component
 * Used for decorative tech-themed background patterns
 * Wrapped with React.memo to prevent re-renders
 */
const CircuitPattern = React.memo(function CircuitPattern({ rotation = 0, className = '' }) {
    return (
        <div
            className={`absolute w-80 h-80 opacity-20 pointer-events-none overflow-hidden ${className}`}
            style={{ transform: `rotate(${rotation}deg)` }}
        >
            <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-none stroke-current">
                {/* Circuit Traces */}
                <path d="M10 0 V20 L30 40 H50" strokeWidth="1" />
                <circle cx="50" cy="40" r="1.5" fill="currentColor" />

                <path d="M0 30 H20 L40 50 V70" strokeWidth="1" />
                <circle cx="40" cy="70" r="1.5" fill="currentColor" />

                <path d="M60 0 V15 L80 35 H100" strokeWidth="1" />
                <circle cx="60" cy="0" r="1.5" fill="currentColor" />

                <path d="M0 60 H15 L35 80 V100" strokeWidth="1" />
                <circle cx="35" cy="80" r="1.5" fill="currentColor" />

                <path d="M80 10 V25 H60" strokeWidth="1" />
                <circle cx="60" cy="25" r="1.5" fill="currentColor" />

                <path d="M20 90 H35 V70" strokeWidth="1" />
                <circle cx="35" cy="70" r="1.5" fill="currentColor" />

                {/* Geometric Accents */}
                <rect x="15" y="15" width="4" height="4" strokeWidth="0" fill="currentColor" opacity="0.6" />
                <rect x="70" y="70" width="6" height="6" strokeWidth="0" fill="currentColor" opacity="0.4" />
                <circle cx="85" cy="55" r="2" fill="currentColor" opacity="0.6" />
            </svg>
        </div>
    );
});

CircuitPattern.propTypes = {
    rotation: PropTypes.number,
    className: PropTypes.string
};

export default CircuitPattern;
