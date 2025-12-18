import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { eventsData } from '../../mock/events';
import EventForm from './EventForm';
import '../../styles/layout.css';
import '../Dashboard/dashboard.css';

export default function Events() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState(eventsData);
    const [isAddingEvent, setIsAddingEvent] = useState(false);

    const handleSaveEvent = (eventData) => {
        const newEvent = {
            id: Date.now(),
            ...eventData,
            color: '#4D44B5', // Default color
            bgColor: '#F3F4FF'
        };
        setEvents([...events, newEvent]);
        setIsAddingEvent(false);
    };

    // Simple calendar generation logic
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

    if (isAddingEvent) {
        return <EventForm onClose={() => setIsAddingEvent(false)} onSave={handleSaveEvent} />;
    }

    return (
        <div className="dashboard-page">
            <div className="card-header">
                <h3>Events</h3>
                <div className="topbar-actions">
                    <button className="icon-btn" onClick={() => setIsAddingEvent(true)} style={{ width: 'auto', padding: '0 1rem', borderRadius: '40px', background: 'var(--primary-color)', color: 'white', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>+</span>
                        <span>Add Event</span>
                    </button>
                </div>
            </div>

            <div className="charts-grid">
                <div className="chart-card" style={{ flex: 2 }}>
                    <div className="card-header">
                        <h3>Calendar</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button className="icon-btn" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>
                                <ChevronLeft size={20} />
                            </button>
                            <span style={{ fontWeight: 'bold', minWidth: '120px', textAlign: 'center' }}>
                                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </span>
                            <button className="icon-btn" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem', textAlign: 'center' }}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} style={{ color: '#A098AE', fontWeight: 'bold', padding: '0.5rem' }}>{day}</div>
                        ))}
                        {days.map((day, i) => {
                            const isToday = day === 20; // Mock "today"
                            const hasEvent = eventsData.some(e => {
                                const d = new Date(e.date);
                                return d.getDate() === day && d.getMonth() === 2; // Mock check for March
                            });

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

                <div className="chart-card" style={{ flex: 1 }}>
                    <div className="card-header">
                        <h3>Schedule Details</h3>
                        <span style={{ fontSize: '0.8rem', color: '#A098AE' }}>Thursday, 10th April, 2021</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '500px', overflowY: 'auto' }}>
                        {events.map(event => (
                            <div key={event.id} style={{
                                background: event.bgColor,
                                padding: '1rem',
                                borderRadius: '12px',
                                borderLeft: `4px solid ${event.color}`
                            }}>
                                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-dark)' }}>{event.title}</h4>
                                <p style={{ fontSize: '0.8rem', color: '#A098AE', margin: 0 }}>{event.type}</p>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.8rem', color: '#A098AE' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <CalendarIcon size={14} /> {event.date}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <Clock size={14} /> {event.startTime} - {event.endTime}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button style={{
                        width: '100%',
                        padding: '1rem',
                        marginTop: '2rem',
                        background: '#F3F4FF',
                        border: 'none',
                        borderRadius: '40px',
                        color: 'var(--primary-color)',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                    }}>
                        View More
                    </button>
                </div>
            </div>
        </div>
    );
}
