import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

export default function MessageBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const conversations = await api.getConversations();
        // Sum up unread counts from all conversations
        const total = Array.isArray(conversations) 
          ? conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0)
          : 0;
        setUnreadCount(total);
      } catch (_) {
        setUnreadCount(0);
      }
    };

    fetchCount();
    
    // Listen to custom update event to immediately update badge counts
    window.addEventListener('messages-updated', fetchCount);
    
    const interval = setInterval(fetchCount, 30000); // Poll every 30s
    
    return () => {
      window.removeEventListener('messages-updated', fetchCount);
      clearInterval(interval);
    };
  }, []);

  return (
    <Link to="/conversations" className="icon-btn" title="Messages">
      <MessageSquare size={20} />
      {unreadCount > 0 && (
        <span className="notification-dot" style={{ backgroundColor: '#FB7D5B' }}></span>
      )}
    </Link>
  );
}
