import React from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

/**
 * Reusable Pagination Component
 * Provides Next/Previous controls with page info
 */
const Pagination = React.memo(function Pagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    loading = false
}) {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="pagination-container">
            <div className="pagination-info">
                <span>
                    Showing <strong>{startItem}-{endItem}</strong> of <strong>{totalItems}</strong> items
                </span>
                <span className="page-indicator">
                    Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                </span>
            </div>

            <div className="pagination-controls">
                <button
                    className="pagination-btn"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    aria-label="Previous page"
                >
                    <ChevronLeft size={20} />
                    Previous
                </button>

                <button
                    className="pagination-btn"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || loading}
                    aria-label="Next page"
                >
                    Next
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
});

Pagination.propTypes = {
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    totalItems: PropTypes.number.isRequired,
    itemsPerPage: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    loading: PropTypes.bool
};

export default Pagination;
