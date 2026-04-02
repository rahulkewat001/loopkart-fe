import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../utils/api';
import Navbar from '../../components/layout/Navbar';
import './ChatPage.css';

const formatTime = (date) => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const formatDate = (date) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString())     return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export default function ChatPage() {
  const { chatId }   = useParams();
  const { user }     = useAuth();
  const { socket, isOnline } = useSocket();
  const navigate     = useNavigate();

  const [chats, setChats]         = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages]   = useState([]);
  const [text, setText]           = useState('');
  const [loading, setLoading]     = useState(true);
  const [sending, setSending]     = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeout  = useRef(null);

  // Load all chats
  useEffect(() => {
    api.get('/chats').then(({ data }) => {
      setChats(data.chats);
      setLoading(false);
    });
  }, []);

  // Load specific chat
  useEffect(() => {
    if (!chatId) return;
    api.get(`/chats/${chatId}`).then(({ data }) => {
      setActiveChat(data.chat);
      setMessages(data.chat.messages || []);
      // Update unread count in list
      setChats((prev) => prev.map((c) => c._id === chatId ? { ...c, unreadCount: 0 } : c));
    });
  }, [chatId]);

  // Socket events
  useEffect(() => {
    if (!socket || !chatId) return;

    socket.emit('join_chat', chatId);

    const handleNewMessage = ({ chatId: cId, message }) => {
      if (cId === chatId) {
        setMessages((prev) => [...prev, message]);
        socket.emit('mark_read', { chatId });
      }
      // Update last message in chat list
      setChats((prev) => prev.map((c) =>
        c._id === cId ? { ...c, lastMessage: message.text, lastMessageAt: message.createdAt, unreadCount: cId === chatId ? 0 : (c.unreadCount || 0) + 1 } : c
      ));
    };

    const handleTyping = ({ userId, isTyping }) => {
      setTypingUsers((prev) => ({ ...prev, [userId]: isTyping }));
    };

    socket.on('new_message', handleNewMessage);
    socket.on('typing',      handleTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('typing',      handleTyping);
    };
  }, [socket, chatId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getOtherParticipant = useCallback((chat) => {
    return chat?.participants?.find((p) => p._id !== user?._id);
  }, [user]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);

    // Optimistic update
    const optimistic = { _id: Date.now(), sender: user._id, senderName: user.name, text: text.trim(), createdAt: new Date(), read: false };
    setMessages((prev) => [...prev, optimistic]);
    const sentText = text.trim();
    setText('');

    try {
      if (socket?.connected) {
        socket.emit('send_message', { chatId, text: sentText });
        socket.emit('typing', { chatId, isTyping: false });
      } else {
        // Fallback to REST
        await api.post(`/chats/${chatId}/messages`, { text: sentText });
      }
      setChats((prev) => prev.map((c) => c._id === chatId ? { ...c, lastMessage: sentText, lastMessageAt: new Date() } : c));
    } catch {
      setMessages((prev) => prev.filter((m) => m._id !== optimistic._id));
      setText(sentText);
    } finally { setSending(false); }
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    if (!socket || !chatId) return;
    socket.emit('typing', { chatId, isTyping: true });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => socket.emit('typing', { chatId, isTyping: false }), 1500);
  };

  const filteredChats = chats.filter((c) => {
    const other = getOtherParticipant(c);
    return other?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           c.productName?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const isTyping = activeChat && Object.entries(typingUsers).some(([uid, t]) => t && uid !== user?._id);

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = formatDate(msg.createdAt);
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  return (
    <div className="chat-page">
      <Navbar />
      <div className="chat-layout">

        {/* ── Sidebar ── */}
        <aside className="chat-sidebar">
          <div className="chat-sidebar__header">
            <h2 className="chat-sidebar__title">💬 Messages</h2>
            <span className="chat-sidebar__count">{chats.reduce((s, c) => s + (c.unreadCount || 0), 0) > 0 && chats.reduce((s, c) => s + (c.unreadCount || 0), 0)}</span>
          </div>
          <div className="chat-sidebar__search">
            <span>🔍</span>
            <input placeholder="Search conversations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          {loading ? (
            <div className="chat-loading">Loading chats...</div>
          ) : filteredChats.length === 0 ? (
            <div className="chat-empty-list">
              <p>💬</p>
              <p>No conversations yet</p>
              <small>Go to any seller product and click</small>
              <small><strong>"Chat with Seller"</strong> to start</small>
            </div>
          ) : (
            <div className="chat-list">
              {filteredChats.map((chat) => {
                const other = getOtherParticipant(chat);
                const online = isOnline(other?._id);
                return (
                  <div
                    key={chat._id}
                    className={`chat-list-item ${chatId === chat._id ? 'chat-list-item--active' : ''}`}
                    onClick={() => navigate(`/chat/${chat._id}`)}
                  >
                    <div className="chat-list-item__avatar-wrap">
                      <div className="chat-list-item__avatar">{other?.name?.[0]?.toUpperCase()}</div>
                      {online && <span className="chat-list-item__online" />}
                    </div>
                    <div className="chat-list-item__info">
                      <div className="chat-list-item__top">
                        <p className="chat-list-item__name">{other?.name}</p>
                        <span className="chat-list-item__time">{chat.lastMessageAt ? formatTime(chat.lastMessageAt) : ''}</span>
                      </div>
                      {chat.productName && <p className="chat-list-item__product">{chat.productEmoji} {chat.productName}</p>}
                      <p className="chat-list-item__last">{chat.lastMessage || 'Start a conversation'}</p>
                    </div>
                    {chat.unreadCount > 0 && <span className="chat-list-item__badge">{chat.unreadCount}</span>}
                  </div>
                );
              })}
            </div>
          )}
        </aside>

        {/* ── Chat Window ── */}
        <div className="chat-window">
          {!chatId ? (
            <div className="chat-placeholder">
              <div className="chat-placeholder__icon">💬</div>
              <h3>Select a conversation</h3>
              <p>Choose a chat from the left to start messaging</p>
            </div>
          ) : (
            <>
              {/* Header */}
              {activeChat && (() => {
                const other  = getOtherParticipant(activeChat);
                const online = isOnline(other?._id);
                return (
                  <div className="chat-header">
                    <button className="chat-header__back" onClick={() => navigate('/chat')}>←</button>
                    <div className="chat-header__avatar-wrap">
                      <div className="chat-header__avatar">{other?.name?.[0]?.toUpperCase()}</div>
                      {online && <span className="chat-header__online" />}
                    </div>
                    <div className="chat-header__info">
                      <p className="chat-header__name">{other?.name}</p>
                      <p className="chat-header__status">
                        {online ? '🟢 Online' : '⚫ Offline'}
                        {other?.role === 'seller' && ` · 🏪 ${other?.sellerProfile?.shopName || 'Seller'}`}
                      </p>
                    </div>
                    {activeChat.productName && (
                      <div className="chat-header__product">
                        <span>{activeChat.productEmoji}</span>
                        <span>{activeChat.productName}</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Messages */}
              <div className="chat-messages">
                {Object.entries(groupedMessages).map(([date, msgs]) => (
                  <div key={date}>
                    <div className="chat-date-divider"><span>{date}</span></div>
                    {msgs.map((msg) => {
                      const isMine = msg.sender?.toString() === user?._id?.toString() || msg.sender === user?._id;
                      return (
                        <div key={msg._id} className={`chat-msg ${isMine ? 'chat-msg--mine' : 'chat-msg--theirs'}`}>
                          {!isMine && <div className="chat-msg__avatar">{msg.senderName?.[0]?.toUpperCase() || '?'}</div>}
                          <div className="chat-msg__bubble">
                            <p className="chat-msg__text">{msg.text}</p>
                            <div className="chat-msg__meta">
                              <span className="chat-msg__time">{formatTime(msg.createdAt)}</span>
                              {isMine && <span className="chat-msg__read">{msg.read ? '✓✓' : '✓'}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="chat-msg chat-msg--theirs">
                    <div className="chat-msg__avatar">...</div>
                    <div className="chat-msg__bubble chat-msg__bubble--typing">
                      <span /><span /><span />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form className="chat-input-bar" onSubmit={handleSend}>
                <input
                  className="chat-input"
                  placeholder="Type a message..."
                  value={text}
                  onChange={handleTyping}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend(e)}
                  autoFocus
                />
                <button type="submit" className="chat-send-btn" disabled={!text.trim() || sending}>
                  {sending ? '...' : '➤'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
