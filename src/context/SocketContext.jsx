import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children, token }) => {
  const socketRef             = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [connected, setConnected]     = useState(false);

  useEffect(() => {
    // Disconnect old socket if token changes
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
      setOnlineUsers([]);
    }

    if (!token) return;

    const socket = io('http://localhost:5000', {
      auth:       { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay:    2000,
    });

    socketRef.current = socket;

    socket.on('connect',      ()      => setConnected(true));
    socket.on('disconnect',   ()      => setConnected(false));
    socket.on('online_users', (users) => setOnlineUsers(users));
    socket.on('user_online',  (id)    => setOnlineUsers((prev) => [...new Set([...prev, id])]));
    socket.on('user_offline', (id)    => setOnlineUsers((prev) => prev.filter((u) => u !== id)));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  const isOnline = useCallback((userId) => onlineUsers.includes(userId?.toString()), [onlineUsers]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, onlineUsers, isOnline, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used inside SocketProvider');
  return ctx;
};
