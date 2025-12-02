import React, { useState, useMemo } from 'react';
import { Search, Plus, Download, MoreHorizontal, DollarSign, Calendar, Filter, Edit2, Eye } from 'lucide-react';
import { feesData } from '../../mock/fees';
import { studentsData } from '../../mock/students';
import AddEditInvoice from './AddEditInvoice';
import '../../styles/layout.css';
import '../Dashboard/dashboard.css';

export default function Fees() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [dateRangeFilter, setDateRangeFilter] = useState('All Time');

    // Flatten invoices for the table
    const initialInvoices = useMemo(() => {
        return Object.values(feesData).flatMap(studentFees =>
            studentFees.invoices.map(inv => ({
                ...inv,
                studentId: studentFees.studentId,
                studentName: studentsData.find(s => s.id === studentFees.studentId)?.name || 'Unknown',
                studentClass: studentsData.find(s => s.id === studentFees.studentId)?.grade || 'Unknown',
                parentName: studentsData.find(s => s.id === studentFees.studentId)?.parentName || 'Unknown'
            }))
        );
    }, []);

    const [invoices, setInvoices] = useState(initialInvoices);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [currentInvoice, setCurrentInvoice] = useState(null);

    // Advanced filtering
    const filteredInvoices = useMemo(() => {
        return invoices.filter(inv => {
            const matchesSearch = searchTerm === '' ||
                inv.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inv.parentName.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;

            // Date filtering logic (simplified for demo)
            let matchesDate = true;
            const invoiceDate = new Date(inv.date);
            const now = new Date();

            if (dateRangeFilter === 'This Month') {
                matchesDate = invoiceDate.getMonth() === now.getMonth() &&
                    invoiceDate.getFullYear() === now.getFullYear();
            } else if (dateRangeFilter === 'Last Month') {
                const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                matchesDate = invoiceDate.getMonth() === lastMonth.getMonth() &&
                    invoiceDate.getFullYear() === lastMonth.getFullYear();
            }

            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [invoices, searchTerm, statusFilter, dateRangeFilter]);

    // Financial Summary
    const financialSummary = useMemo(() => {
        return {
            totalPaid: filteredInvoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0),
            totalPending: filteredInvoices.filter(i => i.status === 'Pending').reduce((sum, i) => sum + i.amount, 0),
            totalOverdue: filteredInvoices.filter(i => i.status === 'Overdue').reduce((sum, i) => sum + i.amount, 0)
        };
    }, [filteredInvoices]);

    const handleAddInvoice = () => {
        setCurrentInvoice(null);
        setIsEditing(true);
    };

    const handleEditInvoice = (invoice, e) => {
        e.stopPropagation();
        setCurrentInvoice(invoice);
        setIsEditing(true);
    };

    const handleSaveInvoice = (invoiceData) => {
        if (currentInvoice) {
            // Update existing invoice
            setInvoices(invoices.map(inv => inv.id === currentInvoice.id ? { ...inv, ...invoiceData } : inv));
        } else {
            // Add new invoice
            const newInvoice = {
                id: `#INV-${Math.floor(Math.random() * 9000) + 1000}`,
                date: new Date().toISOString().split('T')[0],
                ...invoiceData
            };
            setInvoices([newInvoice, ...invoices]);
        }
        setIsEditing(false);
        setCurrentInvoice(null);
    };

    const handleExport = () => {
        alert(`Exporting ${filteredInvoices.length} invoices...`);
    };

    const handleViewDetails = (invoice, e) => {
        e.stopPropagation();
        alert(`Viewing invoice details:\n\nID: ${invoice.id}\nStudent: ${invoice.studentName}\nAmount: $${invoice.amount.toLocaleString()}\nStatus: ${invoice.status}`);
    };

    if (isEditing) {
        return (
            <AddEditInvoice
                invoice={currentInvoice}
                onBack={() => {
                    setIsEditing(false);
                    setCurrentInvoice(null);
                }}
                onSave={handleSaveInvoice}
            />
        );
    }

    return (
        <div className="dashboard-page">
            <div className="card-header">
                <h3>Fees & Invoices</h3>
            </div>

            {/* Financial Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', background: '#E8F5E9', borderRadius: '50%', color: '#00B69B' }}>
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-gray)' }}>Total Paid</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#00B69B' }}>${financialSummary.totalPaid.toLocaleString()}</div>
                    </div>
                </div>
                <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', background: '#FFF4E5', borderRadius: '50%', color: '#FF8C00' }}>
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-gray)' }}>Pending</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#FF8C00' }}>${financialSummary.totalPending.toLocaleString()}</div>
                    </div>
                </div>
                <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', background: '#FFEBEE', borderRadius: '50%', color: '#D32F2F' }}>
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-gray)' }}>Overdue</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#D32F2F' }}>${financialSummary.totalOverdue.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            {/* Enhanced Filter Bar */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                alignItems: 'center',
                background: 'white',
                padding: '1rem',
                borderRadius: '12px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}>
                <div className="search-bar" style={{ flex: 1, minWidth: '250px' }}>
                    <Search size={20} className="search-icon" style={{ color: '#A098AE' }} />
                    <input
                        type="text"
                        placeholder="Search by student, parent, or invoice ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ fontSize: '0.95rem' }}
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                        padding: '0.75rem 1rem',
                        border: '1px solid #E0E0E0',
                        borderRadius: '8px',
                        background: 'white',
                        cursor: 'pointer',
                        color: '#303972',
                        fontWeight: '500'
                    }}
                >
                    <option value="All">All Status</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Overdue">Overdue</option>
                </select>

                <select
                    value={dateRangeFilter}
                    onChange={(e) => setDateRangeFilter(e.target.value)}
                    style={{
                        padding: '0.75rem 1rem',
                        border: '1px solid #E0E0E0',
                        borderRadius: '8px',
                        background: 'white',
                        cursor: 'pointer',
                        color: '#303972',
                        fontWeight: '500'
                    }}
                >
                    <option value="All Time">All Time</option>
                    <option value="This Month">This Month</option>
                    <option value="Last Month">Last Month</option>
                </select>

                <button
                    onClick={handleExport}
                    style={{
                        padding: '0.75rem 1.5rem',
                        border: '1px solid var(--primary-color)',
                        background: 'white',
                        color: 'var(--primary-color)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s'
                    }}
                >
                    <Download size={18} />
                    Export Report
                </button>

                <button
                    onClick={handleAddInvoice}
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        background: 'var(--primary-color)',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 4px 10px rgba(77, 68, 181, 0.2)'
                    }}
                >
                    <Plus size={18} />
                    New Invoice
                </button>
            </div>

            {/* Results Counter */}
            <div style={{
                padding: '0 0.5rem',
                marginBottom: '1rem',
                fontWeight: '500',
                color: '#A098AE',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.9rem'
            }}>
                <span>Showing <strong style={{ color: '#303972' }}>{filteredInvoices.length}</strong> invoices</span>
                {(searchTerm || statusFilter !== 'All' || dateRangeFilter !== 'All Time') && (
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('All');
                            setDateRangeFilter('All Time');
                        }}
                        style={{
                            padding: '0.4rem 1rem',
                            border: 'none',
                            background: 'transparent',
                            color: '#FB7D5B',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            textDecoration: 'underline'
                        }}
                    >
                        Clear All Filters
                    </button>
                )}
            </div>

            {/* Invoices Table */}
            <div className="chart-card" style={{ padding: 0, overflow: 'hidden', border: 'none', boxShadow: 'none', background: 'transparent' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="simple-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 1rem', padding: '0 0.5rem' }}>
                        <thead>
                            <tr>
                                <th style={{ padding: '1rem', color: '#A098AE', fontWeight: '600', textAlign: 'left' }}>Invoice ID</th>
                                <th style={{ padding: '1rem', color: '#A098AE', fontWeight: '600', textAlign: 'left' }}>Student Name</th>
                                <th style={{ padding: '1rem', color: '#A098AE', fontWeight: '600', textAlign: 'left' }}>Class</th>
                                <th style={{ padding: '1rem', color: '#A098AE', fontWeight: '600', textAlign: 'left' }}>Amount</th>
                                <th style={{ padding: '1rem', color: '#A098AE', fontWeight: '600', textAlign: 'left' }}>Due Date</th>
                                <th style={{ padding: '1rem', color: '#A098AE', fontWeight: '600', textAlign: 'left' }}>Status</th>
                                <th style={{ padding: '1rem', color: '#A098AE', fontWeight: '600', textAlign: 'left' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.length > 0 ? (
                                filteredInvoices.map((invoice) => (
                                    <tr
                                        key={invoice.id}
                                        style={{
                                            cursor: 'pointer',
                                            background: 'white',
                                            boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
                                            transition: 'transform 0.2s, box-shadow 0.2s'
                                        }}
                                        className="table-row-hover"
                                    >
                                        <td style={{ padding: '1.2rem 1rem', borderRadius: '12px 0 0 12px' }}>
                                            <span style={{ fontWeight: '700', color: '#4D44B5' }}>
                                                {invoice.id}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.2rem 1rem' }}>
                                            <div>
                                                <div style={{ fontWeight: '700', color: '#303972' }}>{invoice.studentName}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#A098AE' }}>Parent: {invoice.parentName}</div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.2rem 1rem' }}>
                                            <span style={{
                                                padding: '0.4rem 1rem',
                                                background: '#F3F4FF',
                                                color: '#4D44B5',
                                                borderRadius: '20px',
                                                fontSize: '0.85rem',
                                                fontWeight: '600'
                                            }}>
                                                {invoice.studentClass}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.2rem 1rem', fontWeight: '700', color: '#303972' }}>
                                            ${invoice.amount.toLocaleString()}
                                        </td>
                                        <td style={{
                                            padding: '1.2rem 1rem',
                                            color: invoice.status === 'Overdue' ? '#D32F2F' : '#303972',
                                            fontWeight: invoice.status === 'Overdue' ? '600' : '400'
                                        }}>
                                            {invoice.dueDate}
                                        </td>
                                        <td style={{ padding: '1.2rem 1rem' }}>
                                            <span style={{
                                                padding: '0.4rem 1rem',
                                                background: invoice.status === 'Paid' ? '#E8F5E9' : invoice.status === 'Pending' ? '#FFF4E5' : '#FFEBEE',
                                                color: invoice.status === 'Paid' ? '#00B69B' : invoice.status === 'Pending' ? '#FF8C00' : '#D32F2F',
                                                borderRadius: '20px',
                                                fontSize: '0.85rem',
                                                fontWeight: '600'
                                            }}>
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.2rem 1rem', borderRadius: '0 12px 12px 0' }}>
                                            <div style={{ display: 'flex', gap: '0.8rem' }}>
                                                <button
                                                    className="icon-btn"
                                                    onClick={(e) => handleViewDetails(invoice, e)}
                                                    title="View Details"
                                                    style={{
                                                        width: '36px',
                                                        height: '36px',
                                                        borderRadius: '50%',
                                                        background: '#F3F4FF',
                                                        color: '#4D44B5'
                                                    }}
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    className="icon-btn"
                                                    onClick={(e) => handleEditInvoice(invoice, e)}
                                                    title="Edit Invoice"
                                                    style={{
                                                        width: '36px',
                                                        height: '36px',
                                                        borderRadius: '50%',
                                                        background: '#F3F4FF',
                                                        color: '#4D44B5'
                                                    }}
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                width: '60px',
                                                height: '60px',
                                                background: '#F3F4FF',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#4D44B5'
                                            }}>
                                                <Search size={30} />
                                            </div>
                                            <h3 style={{ margin: 0, color: '#303972' }}>No Invoices Found</h3>
                                            <p style={{ margin: 0, color: '#A098AE' }}>
                                                We couldn't find any invoices matching your search.
                                                <br />Try adjusting your filters or search terms.
                                            </p>
                                            <button
                                                onClick={() => {
                                                    setSearchTerm('');
                                                    setStatusFilter('All');
                                                    setDateRangeFilter('All Time');
                                                }}
                                                style={{
                                                    marginTop: '0.5rem',
                                                    padding: '0.6rem 1.5rem',
                                                    background: '#4D44B5',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                Clear Filters
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
