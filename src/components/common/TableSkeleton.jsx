import React from 'react';
import '../../styles/layout.css';

const TableSkeleton = ({ rows = 5, columns = 6 }) => {
    return (
        <div className="skeleton-container animate-fade-in">
            <div className="skeleton-header">
                {[...Array(columns)].map((_, i) => (
                    <div key={i} className="skeleton-cell skeleton-text" style={{ width: '100px' }}></div>
                ))}
            </div>
            {[...Array(rows)].map((_, r) => (
                <div key={r} className="skeleton-row">
                    {[...Array(columns)].map((_, c) => (
                        <div key={c} className="skeleton-cell">
                            <div className="skeleton-text" style={{ width: c === 0 ? '40px' : c === 1 ? '150px' : '80%' }}></div>
                        </div>
                    ))}
                </div>
            ))}
            <style>{`
                .skeleton-container {
                    background: white;
                    border-radius: 20px;
                    padding: 1rem;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);
                }
                .skeleton-header {
                    display: flex;
                    gap: 1rem;
                    padding: 1rem;
                    border-bottom: 2px solid #f3f4f6;
                    margin-bottom: 1rem;
                }
                .skeleton-row {
                    display: flex;
                    gap: 1rem;
                    padding: 1.2rem 1rem;
                    border-bottom: 1px solid #f3f4f6;
                }
                .skeleton-cell {
                    flex: 1;
                }
                .skeleton-text {
                    height: 20px;
                    background: #eee;
                    border-radius: 4px;
                    animation: shimmer 1.5s infinite linear;
                    background: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%);
                    background-size: 1000px 100%;
                }
                @keyframes shimmer {
                    0% {
                        background-position: -1000px 0;
                    }
                    100% {
                        background-position: 1000px 0;
                    }
                }
                .animate-fade-in {
                    animation: fadeIn 0.5s ease-in;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default TableSkeleton;
