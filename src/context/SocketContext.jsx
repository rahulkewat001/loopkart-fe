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

    const socket = io('https://loopkart-be.onrender.com', {
      auth:       { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay:    1000,
      timeout: 10000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      setConnected(true);
    });
    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setConnected(false);
    });
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
    socket.on('online_users', (users) => {
      console.log('👥 Online users:', users);
      setOnlineUsers(users);
    });
    socket.on('user_online', (id) => {
      console.log('🟢 User online:', id);
      setOnlineUsers((prev) => [...new Set([...prev, id])]);
    });
    socket.on('user_offline', (id) => {
      console.log('⚫ User offline:', id);
      setOnlineUsers((prev) => prev.filter((u) => u !== id));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  const isOnline = useCallback((userId) => {
    const result = onlineUsers.includes(userId?.toString());
    console.log(`Checking if user ${userId} is online:`, result);
    console.log('All online users:', onlineUsers);
    return result;
  }, [onlineUsers]);

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
