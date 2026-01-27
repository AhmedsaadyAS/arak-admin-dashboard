import { api } from './api';

/**
 * Event Service
 * Handles school-wide event management
 * Mirrors expected ASP.NET Core structure
 */
export const eventService = {

    /**
     * Get all events
     */
    getAllEvents: async () => {
        try {
            const response = await api.client.get('/events');
            return response.data;
        } catch (error) {
            console.error("EventService: Failed to fetch events", error);
            throw error;
        }
    },

    /**
     * Get events within a date range
     * @param {string} startDate - ISO date string
     * @param {string} endDate - ISO date string
     */
    getEventsByDateRange: async (startDate, endDate) => {
        try {
            // In real backend, this would use SQL date filtering
            // For json-server, we fetch all and filter client-side
            const response = await api.client.get('/events');

            return response.data.filter(event => {
                const eventDate = new Date(event.date);
                return eventDate >= new Date(startDate) && eventDate <= new Date(endDate);
            });
        } catch (error) {
            console.error("EventService: Failed to fetch events by date", error);
            throw error;
        }
    },

    /**
     * Create new event
     * @param {Object} eventDto - Event data {title, type, date, startTime, endTime, description}
     */
    createEvent: async (eventDto) => {
        try {
            // Validate required fields
            if (!eventDto.title || !eventDto.date || !eventDto.type) {
                throw new Error("Missing required fields: title, date, type");
            }

            const response = await api.client.post('/events', {
                ...eventDto,
                createdAt: new Date().toISOString()
            });
            return response.data;
        } catch (error) {
            console.error("EventService: Failed to create event", error);
            throw error;
        }
    },

    /**
     * Update existing event
     * @param {number|string} id 
     * @param {Object} eventDto 
     */
    updateEvent: async (id, eventDto) => {
        try {
            const numericId = parseInt(id, 10);
            if (isNaN(numericId)) throw new Error("Invalid Event ID");

            const response = await api.client.put(`/events/${numericId}`, {
                ...eventDto,
                updatedAt: new Date().toISOString()
            });
            return response.data;
        } catch (error) {
            console.error("EventService: Failed to update event", error);
            throw error;
        }
    },

    /**
     * Delete event
     * @param {number|string} id 
     */
    deleteEvent: async (id) => {
        try {
            const numericId = parseInt(id, 10);
            const response = await api.client.delete(`/events/${numericId}`);
            return response.data;
        } catch (error) {
            console.error("EventService: Failed to delete event", error);
            throw error;
        }
    },

    /**
     * Get event categories with color schemes
     */
    getEventTypes: () => {
        return {
            'Holiday': { color: '#22C55E', bgColor: '#DCFCE7', icon: '🎉' },
            'Exam': { color: '#EF4444', bgColor: '#FEE2E2', icon: '📝' },
            'Meeting': { color: '#3B82F6', bgColor: '#DBEAFE', icon: '👥' },
            'Sports': { color: '#F59E0B', bgColor: '#FEF3C7', icon: '⚽' },
            'Cultural': { color: '#A855F7', bgColor: '#F3E8FF', icon: '🎭' }
        };
    }
};
