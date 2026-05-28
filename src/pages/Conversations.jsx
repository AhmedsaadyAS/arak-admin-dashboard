import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
    Search, 
    Send, 
    User, 
    Users, 
    MessageSquare, 
    Check, 
    CheckCheck, 
    Loader2, 
    AlertCircle 
} from 'lucide-react';

// ==========================================
// Helper: Format Message Timestamp
// ==========================================
const formatMessageTime = (timeStr) => {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    const now = new Date();
    
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (isYesterday) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
};

// ==========================================
// Subcomponent: Search Results Dropdown
// ==========================================
function SearchResults({ results, onSelectResult }) {
    if (results.length === 0) return null;

    return (
        <div className="absolute top-full left-0 right-0 mt-1 max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg z-50">
            <div className="p-2 bg-gray-50 text-[11px] font-bold tracking-wider text-gray-400 uppercase border-b border-gray-100">
                Search Results
            </div>
            {results.map((u) => {
                const initials = u.name ? u.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '?';
                const roleColor = u.role === 'Teacher' 
                    ? 'bg-blue-50 text-blue-600 border-blue-100' 
                    : 'bg-emerald-50 text-emerald-600 border-emerald-100';

                return (
                    <div
                        key={`${u.role}-${u.userId || u.id}`}
                        onClick={() => onSelectResult(u)}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0"
                    >
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs select-none">
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{u.name}</p>
                            <p className="text-xs text-gray-400 truncate">{u.email}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${roleColor}`}>
                            {u.role}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

// ==========================================
// Subcomponent: Message Bubble
// ==========================================
function MessageBubble({ message, isMine }) {
    const formattedTime = formatMessageTime(message.sentAt);

    return (
        <div className={`flex w-full mb-3 ${isMine ? 'justify-end' : 'justify-start'}`}>
            <div 
                className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2.5 rounded-2xl shadow-sm text-sm
                    ${isMine 
                        ? 'bg-[#4D44B5] text-white rounded-br-none' 
                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                    }`}
            >
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                <div className="flex items-center justify-end gap-1 mt-1 select-none">
                    <span className={`text-[9px] ${isMine ? 'text-indigo-200' : 'text-gray-400'}`}>
                        {formattedTime}
                    </span>
                    {isMine && (
                        message.isRead ? (
                            <CheckCheck size={12} className="text-indigo-200" />
                        ) : (
                            <Check size={12} className="text-indigo-200/60" />
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

// ==========================================
// Subcomponent: Conversation Item List
// ==========================================
function ConversationList({ conversations, activeUserId, onSelect, userRoles }) {
    if (conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-48 p-6 text-center">
                <AlertCircle size={28} className="text-gray-300 mb-2" />
                <p className="text-sm font-medium text-gray-400">No active chats found</p>
                <p className="text-xs text-gray-300 mt-1">Search above to start a conversation</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {conversations.map((conv) => {
                const userId = conv.participantId;
                const name = conv.participant?.name || 'Unknown';
                const isActive = activeUserId === userId;
                const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

                // Check custom role map first, otherwise fall back to generic
                const rawRole = userRoles[userId] || 'User';
                const roleBadge = rawRole === 'Teacher'
                    ? { text: 'Teacher', bg: 'bg-blue-50 text-blue-600 border-blue-100' }
                    : rawRole === 'Parent'
                        ? { text: 'Parent', bg: 'bg-emerald-50 text-emerald-600 border-emerald-100' }
                        : { text: rawRole, bg: 'bg-indigo-50 text-indigo-600 border-indigo-100' };

                return (
                    <div
                        key={`conv-${userId}`}
                        onClick={() => onSelect(conv)}
                        className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 border-l-4
                            ${isActive 
                                ? 'bg-[#4D44B5]/5 border-[#4D44B5]' 
                                : 'bg-white border-transparent'
                            }`}
                    >
                        {/* Avatar */}
                        <div className="w-11 h-11 rounded-full bg-indigo-50 text-[#4D44B5] flex items-center justify-center font-bold text-sm shadow-inner flex-shrink-0 select-none">
                            {initials}
                        </div>

                        {/* Middle Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-1 mb-0.5">
                                <h4 className="text-sm font-bold text-gray-800 truncate">{name}</h4>
                                <span className="text-[10px] text-gray-400 flex-shrink-0">
                                    {formatMessageTime(conv.lastMessageTime)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full border ${roleBadge.bg}`}>
                                    {roleBadge.text}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 truncate pr-2">
                                {conv.lastMessage || 'No messages yet'}
                            </p>
                        </div>

                        {/* Right Badge */}
                        {conv.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-bold rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center shadow-sm flex-shrink-0 animate-pulse">
                                {conv.unreadCount}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ==========================================
// Subcomponent: Chat Window Pane
// ==========================================
function ChatWindow({ 
    activeUserId, 
    activeUserName, 
    activeUserRole, 
    messages, 
    loadingMessages, 
    currentUserId, 
    newMessage, 
    setNewMessage, 
    onSend, 
    sending 
}) {
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (!activeUserId) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50 p-8 text-center h-full">
                <div className="w-16 h-16 rounded-full bg-indigo-50 text-[#4D44B5] flex items-center justify-center mb-4 shadow-sm">
                    <MessageSquare size={32} />
                </div>
                <h3 className="text-base font-bold text-gray-700">Select a conversation</h3>
                <p className="text-sm text-gray-400 max-w-xs mt-1">
                    Choose a conversation from the left pane or search for users to start messaging.
                </p>
            </div>
        );
    }

    const roleBadgeColor = activeUserRole === 'Teacher' 
        ? 'bg-blue-50 text-blue-600 border border-blue-100' 
        : activeUserRole === 'Parent'
            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
            : 'bg-indigo-50 text-indigo-600 border border-indigo-100';

    const initials = activeUserName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

    return (
        <div className="flex-1 flex flex-col h-full bg-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-[#4D44B5] flex items-center justify-center font-bold text-sm">
                        {initials}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-sm leading-tight">{activeUserName}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${roleBadgeColor}`}>
                            {activeUserRole}
                        </span>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F3F4FF]/30">
                {loadingMessages ? (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                        <Loader2 className="animate-spin text-[#4D44B5] mb-2" size={24} />
                        <p className="text-xs">Loading chat history...</p>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, idx) => {
                            const isMine = String(msg.senderId) === String(currentUserId);
                            return (
                                <MessageBubble 
                                    key={msg.id || idx} 
                                    message={msg} 
                                    isMine={isMine} 
                                />
                            );
                        })}
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-400 select-none">
                                <MessageSquare size={36} className="text-gray-200 mb-2" />
                                <p className="text-xs font-semibold">No messages yet</p>
                                <p className="text-[11px] text-gray-300 mt-1">Send a message to start chatting.</p>
                            </div>
                        )}
                    </>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input Bar */}
            <div className="p-4 border-t border-gray-100 bg-white">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                onSend();
                            }
                        }}
                        placeholder="Type a message..."
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4D44B5]/30 focus:border-[#4D44B5] bg-gray-50 hover:bg-white transition-all duration-200"
                    />
                    <button
                        onClick={onSend}
                        disabled={sending || !newMessage.trim()}
                        className="bg-[#4D44B5] hover:bg-[#3b3394] disabled:opacity-50 text-white px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md shadow-indigo-600/10 flex items-center gap-1.5 flex-shrink-0"
                    >
                        {sending ? (
                            <Loader2 className="animate-spin" size={16} />
                        ) : (
                            <>
                                <span>Send</span>
                                <Send size={14} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// MAIN EXPORT COMPONENT
// ==========================================
export default function Conversations() {
    const { user } = useAuth();
    const currentUserId = user?.id;

    // States
    const [conversations, setConversations] = useState([]);
    const [userRoles, setUserRoles] = useState({}); // Mapping of userId -> role
    const [usersList, setUsersList] = useState([]); // Master list of Parents + Teachers for search
    
    // Active Conversation States
    const [activeUserId, setActiveUserId] = useState(null);
    const [activeUserName, setActiveUserName] = useState('');
    const [activeUserRole, setActiveUserRole] = useState('User');

    // Chat History States
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingConvs, setLoadingConvs] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);

    // Search States
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    // 1. Initial Load: Fetch Conversations & Users Map
    useEffect(() => {
        loadConversationsAndMap();
    }, []);

    const loadConversationsAndMap = async () => {
        setLoadingConvs(true);
        try {
            // Fetch chats
            const res = await api.getConversations();
            const convData = Array.isArray(res) ? res : (res.data?.data ?? res.data ?? []);
            
            // Sort conversations by last message timestamp descending
            const sortedConvs = [...convData].sort((a, b) => {
                const timeA = new Date(a.lastMessageTime || 0);
                const timeB = new Date(b.lastMessageTime || 0);
                return timeB - timeA;
            });
            setConversations(sortedConvs);

            // Concurrent prefetch of Teachers and Parents (capped at 200 each) to build role
            // lookup map and power the unified search. We use getTeachers/getParents — NOT
            // getUsers — because /users returns admin accounts, not teaching staff / parents.
            const [teachersRaw, parentsRaw] = await Promise.all([
                api.getTeachers({ pageSize: 200 }),
                api.getParents({ pageSize: 200 }),
            ]);

            // Normalise: both endpoints return arrays (or {data:[]} shaped objects)
            const teacherArr = Array.isArray(teachersRaw) ? teachersRaw : (teachersRaw?.data ?? []);
            const parentArr  = Array.isArray(parentsRaw)  ? parentsRaw  : (parentsRaw?.data  ?? []);

            const mappedTeachers = teacherArr.map(t => ({ ...t, role: 'Teacher' }));
            const mappedParents  = parentArr.map(p  => ({ ...p, role: 'Parent'  }));
            const combined = [...mappedTeachers, ...mappedParents];
            setUsersList(combined);

            // Compile a local userId -> Role dictionary for conversation badges
            const roleDict = {};
            combined.forEach(u => {
                roleDict[u.userId] = u.role;  // key by Identity userId
                roleDict[u.id] = u.role;       // keep int id as fallback
            });
            setUserRoles(roleDict);

        } catch (err) {
            console.error("Failed to load initial conversations context", err);
        } finally {
            setLoadingConvs(false);
        }
    };

    // 2. Client Side Unified Search Auto-Complete
    useEffect(() => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            return;
        }

        const filtered = usersList.filter(u => 
            // Avoid matching oneself
            u.id !== currentUserId && 
            (u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
             u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setSearchResults(filtered);
    }, [searchTerm, usersList, currentUserId]);

    // 3. Selection Event for Conversations
    const handleSelectConversation = async (conv) => {
        const userId = conv.participantId;
        const name = conv.participant?.name || 'Unknown';
        const role = userRoles[userId] || 'User';

        setActiveUserId(userId);
        setActiveUserName(name);
        setActiveUserRole(role);
        setLoadingMessages(true);

        try {
            const res = await api.getMessages(userId);
            const msgs = Array.isArray(res) ? res : (res.data?.data ?? res.data ?? []);
            
            // Messages from API are ordered oldest-first or paginated, reverse if necessary
            // In ASP.NET backend they are stored chronological page 1, so ensure we render correctly
            setMessages(msgs);

            // Mark conversation as read on client & server
            await api.markConversationRead(userId);
            setConversations(prev => 
                prev.map(c => c.participantId === userId ? { ...c, unreadCount: 0 } : c)
            );
        } catch (err) {
            console.error("Failed to load conversation history", err);
        } finally {
            setLoadingMessages(false);
        }
    };

    // 4. Selection Event for New Users (from search results)
    const handleSelectSearchResult = (searchedUser) => {
        const identityId = searchedUser.userId; // Identity string ID
        const existingConv = conversations.find(c => c.participantId === identityId);
        if (existingConv) {
            handleSelectConversation(existingConv);
        } else {
            // New empty chat flow
            setActiveUserId(identityId);
            setActiveUserName(searchedUser.name);
            setActiveUserRole(searchedUser.role);
            setMessages([]);
        }
        setSearchTerm(''); // Clear search input
    };

    // 5. Send Message (with Optimistic UI updates)
    const handleSend = async () => {
        if (!newMessage.trim() || !activeUserId) return;

        const typedContent = newMessage.trim();
        const tempId = `temp-${Date.now()}`;

        // Build mock message payload for optimistic render
        const optimisticMsg = {
            id: tempId,
            senderId: currentUserId,
            senderName: user?.name || 'Me',
            receiverId: activeUserId,
            receiverName: activeUserName,
            content: typedContent,
            sentAt: new Date().toISOString(),
            isRead: false
        };

        // Append to UI immediately
        setMessages(prev => [...prev, optimisticMsg]);
        setNewMessage('');
        setSending(true);

        try {
            const res = await api.sendMessage(activeUserId, { content: typedContent });
            const realMsg = res.data ?? res;

            // Swap out temporary optimistic message with confirmed database record
            setMessages(prev => prev.map(m => m.id === tempId ? realMsg : m));

            // Mark conversation as read to ensure unread counts are cleared on response
            await api.markConversationRead(activeUserId);

            // Proactively refresh the left sidebar chats list
            const updatedChats = await api.getConversations();
            const rawChats = Array.isArray(updatedChats) ? updatedChats : (updatedChats.data?.data ?? updatedChats.data ?? []);
            
            const sortedChats = [...rawChats].sort((a, b) => {
                const timeA = new Date(a.lastMessageTime || 0);
                const timeB = new Date(b.lastMessageTime || 0);
                return timeB - timeA;
            });
            setConversations(sortedChats);

        } catch (err) {
            console.error("Failed to post message", err);
            // Evict failed optimistic message and restore input field
            setMessages(prev => prev.filter(m => m.id !== tempId));
            setNewMessage(typedContent);
            alert("Could not send message. Please verify network connection and try again.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex h-full min-h-[400px] bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 144px)' }}>
            {/* LEFT Panel (1/3 Width) */}
            <div className="w-80 md:w-96 border-r border-gray-100 flex flex-col h-full bg-slate-50/40 relative">
                
                {/* Search Container */}
                <div className="p-4 bg-white border-b border-gray-100 relative">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search teachers & parents..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-50 hover:bg-gray-100/50 focus:bg-white pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#4D44B5]/30 focus:border-[#4D44B5] transition-all duration-200"
                        />
                    </div>
                    {/* Dynamic Auto-complete Search Drawer */}
                    <SearchResults 
                        results={searchResults} 
                        onSelectResult={handleSelectSearchResult} 
                    />
                </div>

                {/* List Header */}
                <div className="px-4 py-3 bg-white flex items-center justify-between border-b border-gray-50">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Conversations</h3>
                    {loadingConvs && (
                        <Loader2 className="animate-spin text-gray-400" size={14} />
                    )}
                </div>

                {/* Scrollable Conversation Directory */}
                <ConversationList 
                    conversations={conversations} 
                    activeUserId={activeUserId} 
                    onSelect={handleSelectConversation}
                    userRoles={userRoles}
                />
            </div>

            {/* RIGHT Panel (2/3 Width) */}
            <div className="flex-1 h-full flex flex-col bg-white">
                <ChatWindow 
                    activeUserId={activeUserId}
                    activeUserName={activeUserName}
                    activeUserRole={activeUserRole}
                    messages={messages}
                    loadingMessages={loadingMessages}
                    currentUserId={currentUserId}
                    newMessage={newMessage}
                    setNewMessage={setNewMessage}
                    onSend={handleSend}
                    sending={sending}
                />
            </div>
        </div>
    );
}
