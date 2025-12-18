import React, { useState } from 'react';
import { Search, Send, Paperclip, Smile, MoreVertical } from 'lucide-react';
import { conversationsData } from '../../mock/conversations';
import { messagesData } from '../../mock/messages';
import './Chat.css';

export default function Chat() {
    const [activeConversation, setActiveConversation] = useState(conversationsData[0]?.id);
    const [messageText, setMessageText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');

    // State for messages to allow local updates
    const [allMessages, setAllMessages] = useState(messagesData);

    const filteredConversations = conversationsData.filter(conv => {
        const matchesSearch = conv.userName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'All' || conv.userType === filter || (filter === 'Unread' && conv.unread > 0);
        return matchesSearch && matchesFilter;
    });

    const currentConversation = conversationsData.find(c => c.id === activeConversation);
    const messages = allMessages[activeConversation] || [];

    const handleSendMessage = () => {
        if (messageText.trim()) {
            const newMessage = {
                id: Date.now(),
                senderId: 'admin',
                senderName: 'Admin',
                text: messageText,
                timestamp: 'Just now',
                isAdmin: true
            };

            setAllMessages(prev => ({
                ...prev,
                [activeConversation]: [...(prev[activeConversation] || []), newMessage]
            }));
            setMessageText('');
        }
    };

    const messagesEndRef = React.useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    React.useEffect(() => {
        scrollToBottom();
        console.log('Messages updated:', messages);
    }, [messages]);

    return (
        <div className="dashboard-page" style={{ height: 'calc(100vh - 100px)', overflow: 'hidden' }}>
            <div className="chat-container">
                {/* Left Panel - Sidebar */}
                <div className="chat-sidebar">
                    <div className="chat-sidebar-header">
                        <h3>Messages</h3>
                        <button className="icon-btn" style={{ width: '36px', height: '36px' }}>
                            <MoreVertical size={18} />
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
                        <button
                            className={`filter-btn ${filter === 'All' ? 'active' : ''}`}
                            onClick={() => setFilter('All')}
                        >
                            All
                        </button>
                        <button
                            className={`filter-btn ${filter === 'Unread' ? 'active' : ''}`}
                            onClick={() => setFilter('Unread')}
                        >
                            Unread
                        </button>
                        <button
                            className={`filter-btn ${filter === 'Parent' ? 'active' : ''}`}
                            onClick={() => setFilter('Parent')}
                        >
                            Parents
                        </button>
                        <button
                            className={`filter-btn ${filter === 'Teacher' ? 'active' : ''}`}
                            onClick={() => setFilter('Teacher')}
                        >
                            Teachers
                        </button>
                    </div>

                    <div className="conversations-list">
                        {filteredConversations.map(conv => (
                            <div
                                key={conv.id}
                                className={`conversation-item ${activeConversation === conv.id ? 'active' : ''}`}
                                onClick={() => setActiveConversation(conv.id)}
                            >
                                <div className="conversation-avatar">
                                    {conv.userName.charAt(0)}
                                    {conv.online && <span className="online-dot"></span>}
                                </div>
                                <div className="conversation-details">
                                    <div className="conversation-header">
                                        <span className="conversation-name">{conv.userName}</span>
                                        <span className="conversation-time">{conv.lastMessageTime}</span>
                                    </div>
                                    <div className="conversation-message">
                                        <p>{conv.lastMessage}</p>
                                        {conv.unread > 0 && <span className="unread-badge">{conv.unread}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel - Active Conversation */}
                <div className="chat-main">
                    {currentConversation ? (
                        <>
                            <div className="chat-header">
                                <div className="chat-header-info">
                                    <div className="conversation-avatar" style={{ width: '40px', height: '40px' }}>
                                        {currentConversation.userName.charAt(0)}
                                    </div>
                                    <div>
                                        <h4>{currentConversation.userName}</h4>
                                        <p>{currentConversation.userType} • {currentConversation.online ? 'Online' : 'Offline'}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="icon-btn"><Search size={20} /></button>
                                    <button className="icon-btn"><MoreVertical size={20} /></button>
                                </div>
                            </div>

                            <div className="chat-messages">
                                {messages.map(msg => (
                                    <div
                                        key={msg.id}
                                        className={`message ${msg.isAdmin ? 'message-sent' : 'message-received'}`}
                                    >
                                        <div className="message-content">
                                            <p>{msg.text}</p>
                                            <span className="message-time">{msg.timestamp}</span>
                                        </div>
                                    </div>
                                ))}
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
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                                <button className="icon-btn" title="Add emoji">
                                    <Smile size={20} />
                                </button>
                                <button
                                    className="send-btn"
                                    onClick={handleSendMessage}
                                    disabled={!messageText.trim()}
                                >
                                    <Send size={20} />
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
        </div>
    );
}
