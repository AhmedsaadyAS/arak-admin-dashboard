import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Edit2, Trash2 } from 'lucide-react';
import './DataTable.css';

/**
 * DataTable Component
 * Reusable table with sorting, actions, and responsive design
 * 
 * @param {Array} columns - Array of column definitions: [{ key, label, sortable, render }]
 * @param {Array} data - Array of data objects
 * @param {Function} onEdit - Callback for edit action
 * @param {Function} onDelete - Callback for delete action
 * @param {Boolean} showActions - Show edit/delete actions column
 */
export default function DataTable({
    columns = [],
    data = [],
    onEdit,
    onDelete,
    showActions = true,
    emptyMessage = "No data available"
}) {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Sorting logic
    const handleSort = (key) => {
        const column = columns.find(col => col.key === key);
        if (!column?.sortable) return;

        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Sort data
    const sortedData = React.useMemo(() => {
        if (!sortConfig.key) return data;

        return [...data].sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data, sortConfig]);

    // Empty state
    if (data.length === 0) {
        return (
            <div className="data-table-empty">
                <p>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="data-table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                onClick={() => handleSort(column.key)}
                                className={column.sortable ? 'sortable' : ''}
                            >
                                <div className="th-content">
                                    <span>{column.label}</span>
                                    {column.sortable && (
                                        <div className="sort-icons">
                                            <ChevronUp
                                                size={14}
                                                className={sortConfig.key === column.key && sortConfig.direction === 'asc' ? 'active' : ''}
                                            />
                                            <ChevronDown
                                                size={14}
                                                className={sortConfig.key === column.key && sortConfig.direction === 'desc' ? 'active' : ''}
                                            />
                                        </div>
                                    )}
                                </div>
                            </th>
                        ))}
                        {showActions && <th className="actions-column">Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((row, index) => (
                        <tr key={row.id || index}>
                            {columns.map((column) => (
                                <td key={column.key}>
                                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                                </td>
                            ))}
                            {showActions && (
                                <td className="actions-cell">
                                    <div className="action-buttons">
                                        {onEdit && (
                                            <button
                                                className="action-btn edit-btn"
                                                onClick={() => onEdit(row)}
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button
                                                className="action-btn delete-btn"
                                                onClick={() => onDelete(row)}
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
