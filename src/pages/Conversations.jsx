import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Conversations() {
  const { user } = useAuth();
  const currentUserId = user?.id;

  const [conversations, setConversations] = useState([]);
  const [activeUserId, setActiveUserId] = useState(null);
  const [activeUserName, setActiveUserName] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getConversations();
        // If res is directly an array, use it; otherwise check nested data fields
        const data = Array.isArray(res) ? res : (res.data?.data ?? res.data ?? []);
        setConversations(data);
      } catch (err) {
        console.error("Failed to load conversations", err);
      }
    };
    load();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConversation = async (conv) => {
    const userId = conv.participantId;
    setActiveUserId(userId);
    setActiveUserName(conv.participant?.name || 'Unknown');
    setLoading(true);
    try {
      const res = await api.getMessages(userId);
      // If res is directly an array, use it; otherwise check nested data fields
      const msgs = Array.isArray(res) ? res : (res.data?.data ?? res.data ?? []);
      setMessages(msgs);
      await api.markConversationRead(userId);
      // update unread badge in list
      setConversations(prev =>
        prev.map(c =>
          c.participantId === userId ? { ...c, unreadCount: 0 } : c
        )
      );
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !activeUserId) return;
    setSending(true);
    try {
      const res = await api.sendMessage(activeUserId, { content: newMessage.trim() });
      const sent = res.data ?? res; // Ensure correct object shape is captured
      setMessages(prev => [...prev, sent]);
      setNewMessage('');
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Left Panel: Conversations List */}
      <div className="w-80 border-r border-gray-200 flex flex-col h-full bg-gray-50/50">
        <div className="p-4 border-b bg-white">
          <h2 className="text-lg font-semibold text-gray-800">Messages</h2>
        </div>
        <div className="overflow-y-auto flex-1">
          {conversations.map(conv => {
            const userId = conv.participantId;
            const userName = conv.participant?.name || 'Unknown';
            const isActive = activeUserId === userId;

            return (
              <div
                key={userId}
                onClick={() => handleSelectConversation(conv)}
                className={`flex items-center gap-3 p-4 cursor-pointer
                            hover:bg-gray-100 transition-colors border-b bg-white
                            ${isActive
                              ? 'bg-blue-50/50 border-l-4 border-l-blue-500'
                              : 'border-l-4 border-l-transparent'}`}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-blue-100 flex
                                items-center justify-center text-blue-600
                                font-semibold text-sm flex-shrink-0">
                  {userName[0]?.toUpperCase()}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {userName}
                  </p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {conv.lastMessage ?? 'No messages yet'}
                  </p>
                </div>
                {/* Unread badge */}
                {conv.unreadCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full
                                   w-5 h-5 flex items-center justify-center
                                   flex-shrink-0 font-medium">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            );
          })}
          {conversations.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-500">
              No conversations found.
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Chat Window */}
      <div className="flex-1 flex flex-col h-full bg-white">
        {/* Header */}
        {activeUserId ? (
          <div className="p-4 border-b flex items-center gap-3 bg-white shadow-sm z-10">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center
                            justify-center text-blue-600 font-semibold text-sm">
              {activeUserName[0]?.toUpperCase()}
            </div>
            <span className="font-semibold text-gray-800">{activeUserName}</span>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50/30">
            Select a conversation to start chatting
          </div>
        )}

        {/* Messages */}
        {activeUserId && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
              {loading ? (
                <div className="flex justify-center py-4">
                    <p className="text-gray-400 text-sm">Loading...</p>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => {
                    const currentId = user?.id;
                    const senderId  = msg.senderId ?? msg.senderUserId;
                    const isMine    = Boolean(currentId) &&
                                      String(senderId) === String(currentId);

                    const dateVal = msg.sentAt ?? msg.createdAt;
                  
                  return (
                    <div key={msg.id ?? idx}
                         className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl
                                       text-sm shadow-sm
                                       ${isMine
                                         ? 'bg-blue-500 text-white rounded-br-sm'
                                         : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'}`}>
                        <p className="whitespace-pre-wrap">{msg.content ?? msg.text ?? msg.body}</p>
                        <p className={`text-[11px] mt-1 text-right
                                       ${isMine ? 'text-blue-100' : 'text-gray-400'}`}>
                          {dateVal ? new Date(dateVal).toLocaleTimeString(
                            [], { hour: '2-digit', minute: '2-digit' }
                          ) : ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-white flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Type a message..."
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5
                           text-sm focus:outline-none focus:ring-2
                           focus:ring-blue-300 bg-gray-50 hover:bg-white transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={sending || !newMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50
                           disabled:hover:bg-blue-600 text-white px-5 py-2.5 
                           rounded-xl text-sm font-medium transition-colors
                           shadow-sm"
              >
                {sending ? '...' : 'Send'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
