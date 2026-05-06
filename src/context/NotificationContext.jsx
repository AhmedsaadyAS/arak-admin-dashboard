import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

const POLL_INTERVAL = 30000; // 30 seconds

export const NotificationProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [recentMessages, setRecentMessages] = useState([]);

    const fetchUnreadCount = useCallback(async () => {
        if (!isAuthenticated()) return;
        try {
            const conversations = await api.getConversations();
            const total = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
            setUnreadCount(total);

            // Keep the 5 most recent conversations with unread messages
            const unread = conversations
                .filter(c => c.unreadCount > 0)
                .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime))
                .slice(0, 5)
                .map(c => ({
                    participantId: c.participantId,
                    name: c.participant?.name || 'Unknown',
                    message: c.lastMessage,
                    time: c.lastMessageTime,
                    count: c.unreadCount,
                }));
            setRecentMessages(unread);
        } catch (error) {
            // Silently fail — don't disrupt the UI for notification polling errors
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    return (
        <NotificationContext.Provider value={{ unreadCount, recentMessages, refreshNotifications: fetchUnreadCount }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
