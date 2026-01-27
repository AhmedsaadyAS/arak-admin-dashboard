import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Edit2, Trash2, Plus } from 'lucide-react';
import { eventService } from '../../services/eventService';
import EventForm from './EventForm';
import ConfirmModal from '../../components/common/ConfirmModal';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import '../../styles/layout.css';
import '../Dashboard/dashboard.css';

export default function Events() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, event: null });

    // Fetch events on mount
    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const eventsData = await eventService.getAllEvents();
            setEvents(eventsData);
        } catch (error) {
            console.error("Failed to fetch events", error);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveEvent = async (eventData) => {
        try {
            if (editingEvent) {
                // Update existing event
                await eventService.updateEvent(editingEvent.id, eventData);
            } else {
                // Create new event
                const eventTypes = eventService.getEventTypes();
                const typeConfig = eventTypes[eventData.type] || eventTypes['Meeting'];

                await eventService.createEvent({
                    ...eventData,
                    color: typeConfig.color,
                    bgColor: typeConfig.bgColor
                });
            }

            // Refresh events list
            await fetchEvents();
            setIsFormOpen(false);
            setEditingEvent(null);
        } catch (error) {
            console.error("Failed to save event", error);
            alert("Failed to save event. Please try again.");
        }
    };

    const handleEditClick = (event) => {
        setEditingEvent(event);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (event) => {
        setDeleteModal({ isOpen: true, event });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal.event) return;

        try {
            await eventService.deleteEvent(deleteModal.event.id);
            setEvents(events.filter(e => e.id !== deleteModal.event.id));
            setDeleteModal({ isOpen: false, event: null });
        } catch (error) {
            console.error("Failed to delete event", error);
            alert("Failed to delete event. Please try again.");
        }
    };

    const handleAddNew = () => {
        setEditingEvent(null);
        setIsFormOpen(true);
    };

    // Calendar generation
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Check if a day has events
    const hasEventOnDay = (day) => {
        if (!day) return false;
        return events.some(e => {
            const eventDate = new Date(e.date);
            return eventDate.getDate() === day &&
                eventDate.getMonth() === currentDate.getMonth() &&
                eventDate.getFullYear() === currentDate.getFullYear();
        });
    };

    if (isFormOpen) {
        return (
            <EventForm
                onClose={() => {
                    setIsFormOpen(false);
                    setEditingEvent(null);
                }}
                onSave={handleSaveEvent}
                initialData={editingEvent}
            />
        );
    }

    return (
        <div className="dashboard-page">
            <div className="card-header">
                <h3>Events & Calendar</h3>
                <div className="topbar-actions">
                    <button
                        className="icon-btn"
                        onClick={handleAddNew}
                        style={{
                            width: 'auto',
                            padding: '0 1rem',
                            borderRadius: '40px',
                            background: 'var(--primary-color)',
                            color: 'white',
                            gap: '0.5rem',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <Plus size={18} />
                        <span>Add Event</span>
                    </button>
                </div>
            </div>

            <div className="charts-grid">
                {/* Calendar */}
                <div className="chart-card" style={{ flex: 2 }}>
                    <div className="card-header">
                        <h3>Calendar</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button
                                className="icon-btn"
                                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span style={{ fontWeight: 'bold', minWidth: '120px', textAlign: 'center' }}>
                                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </span>
                            <button
                                className="icon-btn"
                                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem', textAlign: 'center' }}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} style={{ color: '#A098AE', fontWeight: 'bold', padding: '0.5rem' }}>{day}</div>
                        ))}
                        {days.map((day, i) => {
                            const today = new Date();
                            const isToday = day === today.getDate() &&
                                currentDate.getMonth() === today.getMonth() &&
                                currentDate.getFullYear() === today.getFullYear();
                            const hasEvent = hasEventOnDay(day);

                            return (
                                <div key={i} style={{
                                    height: '80px',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    padding: '0.5rem',
                                    position: 'relative',
                                    background: day ? 'white' : 'transparent',
                                    border: day ? '1px solid #f3f4f6' : 'none'
                                }}>
                                    {day && (
                                        <>
                                            <span style={{
                                                fontWeight: 'bold',
                                                color: isToday ? 'var(--primary-color)' : '#303972',
                                                background: isToday ? '#F3F4FF' : 'transparent',
                                                width: '24px',
                                                height: '24px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: '50%'
                                            }}>
                                                {day}
                                            </span>
                                            {hasEvent && (
                                                <div style={{
                                                    width: '80%',
                                                    height: '4px',
                                                    background: 'var(--secondary-color)',
                                                    marginTop: 'auto',
                                                    borderRadius: '2px',
                                                    alignSelf: 'center'
                                                }}></div>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Events List */}
                <div className="chart-card" style={{ flex: 1 }}>
                    <div className="card-header">
                        <h3>Upcoming Events</h3>
                        <span style={{ fontSize: '0.8rem', color: '#A098AE' }}>
                            {events.length} event{events.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {loading ? (
                        <SkeletonLoader variant="card" height={100} />
                    ) : events.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9CA3AF' }}>
                            <CalendarIcon size={48} style={{ margin: '0 auto 1rem' }} />
                            <p>No events scheduled</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '500px', overflowY: 'auto' }}>
                            {events.map(event => (
                                <div key={event.id} style={{
                                    background: event.bgColor || '#F3F4FF',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    borderLeft: `4px solid ${event.color || 'var(--primary-color)'}`,
                                    position: 'relative'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-dark)' }}>{event.title}</h4>
                                            <p style={{ fontSize: '0.8rem', color: '#A098AE', margin: '0 0 0.5rem 0' }}>{event.type}</p>
                                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#A098AE' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                    <CalendarIcon size={14} /> {new Date(event.date).toLocaleDateString()}
                                                </div>
                                                {event.startTime && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                        <Clock size={14} /> {event.startTime} - {event.endTime}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => handleEditClick(event)}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: '#3B82F6',
                                                    cursor: 'pointer',
                                                    padding: '0.5rem',
                                                    borderRadius: '6px',
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}
                                                title="Edit event"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(event)}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: '#EF4444',
                                                    cursor: 'pointer',
                                                    padding: '0.5rem',
                                                    borderRadius: '6px',
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}
                                                title="Delete event"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Delete Event?"
                message={`Are you sure you want to delete "${deleteModal.event?.title}"? This action cannot be undone.`}
                confirmText="Delete Event"
                cancelText="Cancel"
                variant="danger"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteModal({ isOpen: false, event: null })}
            />
        </div>
    );
}
