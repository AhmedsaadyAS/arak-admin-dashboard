import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Send, Paperclip, Smile, MoreVertical, MessageSquarePlus, Users, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import './Chat.css';

/**
 * Decode the JWT token to extract the user's GUID string ID (sub claim).
 * The Conversations API uses GUID string IDs, not the integer IDs from the login response.
 */
function getCurrentUserGuid() {
    const token = localStorage.getItem('arak_auth_token') || sessionStorage.getItem('arak_auth_token');
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub || payload.nameid || null;
    } catch {
        return null;
    }
}

/**
 * Format an ISO datetime string to a human-readable time/date.
 */
function formatTime(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (isYesterday) {
        return 'Yesterday';
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function Chat() {
    const { user } = useAuth();
    const { refreshNotifications } = useNotifications();
    const currentUserGuid = getCurrentUserGuid();

    // --- State ---
    const [conversations, setConversations] = useState([]);
    const [activeParticipantId, setActiveParticipantId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);

    // New conversation modal state
    const [showNewChat, setShowNewChat] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [loadingUsers, setLoadingUsers] = useState(false);

    const messagesEndRef = useRef(null);

    // --- Load conversations on mount ---
    const loadConversations = useCallback(async () => {
        try {
            setLoadingConversations(true);
            const data = await api.getConversations();
            setConversations(data);
        } catch (error) {
            console.error('Failed to load conversations:', error);
        } finally {
            setLoadingConversations(false);
        }
    }, []);

    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    // --- Load messages when active conversation changes ---
    useEffect(() => {
        if (!activeParticipantId) {
            setMessages([]);
            return;
        }

        const loadMessages = async () => {
            try {
                setLoadingMessages(true);
                const data = await api.getMessages(activeParticipantId);
                setMessages(data);

                // Mark conversation as read
                const conv = conversations.find(c => c.participantId === activeParticipantId);
                if (conv && conv.unreadCount > 0) {
                    await api.markConversationAsRead(activeParticipantId);
                    // Update local state
                    setConversations(prev =>
                        prev.map(c =>
                            c.participantId === activeParticipantId
                                ? { ...c, unreadCount: 0 }
                                : c
                        )
                    );
                    refreshNotifications();
                }
            } catch (error) {
                console.error('Failed to load messages:', error);
            } finally {
                setLoadingMessages(false);
            }
        };

        loadMessages();
    }, [activeParticipantId]);

    // --- Scroll to bottom when messages change ---
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // --- Send message ---
    const handleSendMessage = async () => {
        if (!messageText.trim() || !activeParticipantId || sendingMessage) return;

        const text = messageText.trim();
        setMessageText('');
        setSendingMessage(true);

        try {
            const newMsg = await api.sendMessage(activeParticipantId, text);
            setMessages(prev => [...prev, newMsg]);

            // Update conversation list — move this conversation to top with new lastMessage
            setConversations(prev => {
                const updated = prev.map(c =>
                    c.participantId === activeParticipantId
                        ? { ...c, lastMessage: text, lastMessageTime: new Date().toISOString() }
                        : c
                );
                // Sort: most recent first
                updated.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
                return updated;
            });
        } catch (error) {
            console.error('Failed to send message:', error);
            setMessageText(text); // Restore the text so user can retry
        } finally {
            setSendingMessage(false);
        }
    };

    // --- New conversation: load all users ---
    const handleNewChat = async () => {
        setShowNewChat(true);
        setLoadingUsers(true);
        try {
            // Load teachers and parents as potential conversation partners
            const [teachers, parents] = await Promise.all([
                api.getTeachers(),
                api.getParents(),
            ]);

            const users = [];

            // Map teachers
            if (Array.isArray(teachers)) {
                teachers.forEach(t => {
                    if (t.email) {
                        users.push({
                            // We need the Identity GUID for the teacher, not the TeacherId int.
                            // We'll look it up via /api/users?email=...
                            name: t.name,
                            email: t.email,
                            type: 'Teacher',
                        });
                    }
                });
            }

            // Map parents
            if (Array.isArray(parents)) {
                parents.forEach(p => {
                    if (p.email) {
                        users.push({
                            name: p.name,
                            email: p.email,
                            type: 'Parent',
                        });
                    }
                });
            }

            setAllUsers(users);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    // --- Start conversation with a user by resolving their GUID ---
    const startConversation = async (userEntry) => {
        try {
            // Resolve the user's GUID via the users endpoint
            const usersResult = await api.getUsers({ email: userEntry.email });
            const targetUser = Array.isArray(usersResult) ? usersResult[0] : null;

            if (!targetUser) {
                alert(`User ${userEntry.email} not found in the system.`);
                return;
            }

            const targetId = targetUser.id; // GUID string

            // Check if conversation already exists
            const existingConv = conversations.find(c => c.participantId === targetId);
            if (existingConv) {
                setActiveParticipantId(targetId);
                setShowNewChat(false);
                return;
            }

            // Set as active — messages will load (empty if new conversation)
            setActiveParticipantId(targetId);

            // Add to conversations list optimistically
            setConversations(prev => [{
                participantId: targetId,
                lastMessage: '',
                lastMessageTime: new Date().toISOString(),
                unreadCount: 0,
                participant: {
                    name: targetUser.name || userEntry.name,
                    avatar: ''
                }
            }, ...prev]);

            setShowNewChat(false);
        } catch (error) {
            console.error('Failed to start conversation:', error);
            alert('Failed to look up user. Please try again.');
        }
    };

    // --- Filtering ---
    const filteredConversations = conversations.filter(conv => {
        const name = conv.participant?.name || '';
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'All' || (filter === 'Unread' && conv.unreadCount > 0);
        return matchesSearch && matchesFilter;
    });

    const activeConversation = conversations.find(c => c.participantId === activeParticipantId);

    // --- Filter users in new chat modal ---
    const filteredUsers = allUsers.filter(u =>
        u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearchTerm.toLowerCase())
    );

    return (
        <div className="dashboard-page" style={{ height: 'calc(100vh - 100px)', overflow: 'hidden' }}>
            <div className="chat-container">
                {/* Left Panel - Sidebar */}
                <div className="chat-sidebar">
                    <div className="chat-sidebar-header">
                        <h3>Messages</h3>
                        <button className="icon-btn" style={{ width: '36px', height: '36px' }} onClick={handleNewChat} title="New conversation">
                            <MessageSquarePlus size={18} />
                        </button>
                    </div>

                    <div className="chat-search">
                        <Search size={18} color="#A098AE" />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="chat-filters">
                        {['All', 'Unread'].map(f => (
                            <button
                                key={f}
                                className={`filter-btn ${filter === f ? 'active' : ''}`}
                                onClick={() => setFilter(f)}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <div className="conversations-list">
                        {loadingConversations ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                                <Loader2 size={24} className="spinning" />
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#A098AE' }}>
                                <p>No conversations yet</p>
                                <button className="filter-btn active" onClick={handleNewChat} style={{ marginTop: '0.5rem' }}>
                                    Start a conversation
                                </button>
                            </div>
                        ) : (
                            filteredConversations.map(conv => (
                                <div
                                    key={conv.participantId}
                                    className={`conversation-item ${activeParticipantId === conv.participantId ? 'active' : ''}`}
                                    onClick={() => setActiveParticipantId(conv.participantId)}
                                >
                                    <div className="conversation-avatar">
                                        {(conv.participant?.name || '?').charAt(0)}
                                    </div>
                                    <div className="conversation-details">
                                        <div className="conversation-header">
                                            <span className="conversation-name">{conv.participant?.name || 'Unknown'}</span>
                                            <span className="conversation-time">{formatTime(conv.lastMessageTime)}</span>
                                        </div>
                                        <div className="conversation-message">
                                            <p>{conv.lastMessage || 'No messages yet'}</p>
                                            {conv.unreadCount > 0 && <span className="unread-badge">{conv.unreadCount}</span>}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Panel - Active Conversation */}
                <div className="chat-main">
                    {activeConversation ? (
                        <>
                            <div className="chat-header">
                                <div className="chat-header-info">
                                    <div className="conversation-avatar" style={{ width: '40px', height: '40px' }}>
                                        {(activeConversation.participant?.name || '?').charAt(0)}
                                    </div>
                                    <div>
                                        <h4>{activeConversation.participant?.name || 'Unknown'}</h4>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="icon-btn"><Search size={20} /></button>
                                    <button className="icon-btn"><MoreVertical size={20} /></button>
                                </div>
                            </div>

                            <div className="chat-messages">
                                {loadingMessages ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                                        <Loader2 size={32} className="spinning" />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, color: '#A098AE' }}>
                                        <p>No messages yet. Send the first message!</p>
                                    </div>
                                ) : (
                                    messages.map(msg => {
                                        const isSent = msg.senderId === currentUserGuid;
                                        return (
                                            <div
                                                key={msg.id}
                                                className={`message ${isSent ? 'message-sent' : 'message-received'}`}
                                            >
                                                <div className="message-content">
                                                    <p>{msg.content}</p>
                                                    <span className="message-time">
                                                        {formatTime(msg.sentAt)}
                                                        {isSent && msg.readAt && ' \u2713\u2713'}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="chat-input-area">
                                <button className="icon-btn" title="Attach file">
                                    <Paperclip size={20} />
                                </button>
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                                    disabled={sendingMessage}
                                />
                                <button className="icon-btn" title="Add emoji">
                                    <Smile size={20} />
                                </button>
                                <button
                                    className="send-btn"
                                    onClick={handleSendMessage}
                                    disabled={!messageText.trim() || sendingMessage}
                                >
                                    {sendingMessage ? <Loader2 size={20} className="spinning" /> : <Send size={20} />}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="chat-empty">
                            <div style={{ background: '#F3F4FF', padding: '2rem', borderRadius: '50%', marginBottom: '1rem' }}>
                                <Send size={48} color="var(--primary-color)" />
                            </div>
                            <h3>Select a conversation</h3>
                            <p>Choose a conversation from the list to start messaging</p>
                        </div>
                    )}
                </div>
            </div>

            {/* New Conversation Modal */}
            {showNewChat && (
                <div className="chat-modal-overlay" onClick={() => setShowNewChat(false)}>
                    <div className="chat-modal" onClick={e => e.stopPropagation()}>
                        <div className="chat-modal-header">
                            <h3><Users size={20} /> New Conversation</h3>
                            <button className="icon-btn" onClick={() => setShowNewChat(false)}>&times;</button>
                        </div>
                        <div className="chat-search" style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <Search size={18} color="#A098AE" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={userSearchTerm}
                                onChange={(e) => setUserSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="chat-modal-list">
                            {loadingUsers ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                                    <Loader2 size={24} className="spinning" />
                                </div>
                            ) : filteredUsers.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#A098AE' }}>
                                    No users found
                                </div>
                            ) : (
                                filteredUsers.map((u, idx) => (
                                    <div
                                        key={idx}
                                        className="conversation-item"
                                        onClick={() => startConversation(u)}
                                    >
                                        <div className="conversation-avatar">
                                            {u.name.charAt(0)}
                                        </div>
                                        <div className="conversation-details">
                                            <div className="conversation-header">
                                                <span className="conversation-name">{u.name}</span>
                                                <span className="conversation-time" style={{ background: u.type === 'Teacher' ? '#e0f2fe' : '#fef3c7', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem' }}>
                                                    {u.type}
                                                </span>
                                            </div>
                                            <div className="conversation-message">
                                                <p>{u.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
