import React from 'react';
import { X } from 'lucide-react';
import './FilterBar.css';

/**
 * FilterBar Component
 * Reusable filter bar with dropdowns and clear button
 * 
 * @param {Array} filters - Array of filter configs: [{ key, label, options, value, onChange }]
 * @param {Function} onClear - Callback to clear all filters
 */
export default function FilterBar({ filters = [], onClear }) {
    const hasActiveFilters = filters.some(f => f.value && f.value !== '');

    return (
        <div className="filter-bar">
            <div className="filter-inputs">
                {filters.map((filter) => (
                    <div key={filter.key} className="filter-group">
                        <label htmlFor={filter.key}>{filter.label}</label>
                        <select
                            id={filter.key}
                            value={filter.value || ''}
                            onChange={(e) => filter.onChange(e.target.value)}
                            className="filter-select"
                        >
                            <option value="">All {filter.label}</option>
                            {filter.options?.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>

            {hasActiveFilters && onClear && (
                <button
                    className="clear-filters-btn"
                    onClick={onClear}
                    title="Clear all filters"
                >
                    <X size={16} />
                    Clear Filters
                </button>
            )}
        </div>
    );
}
