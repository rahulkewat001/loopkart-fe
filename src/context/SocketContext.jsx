import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);
const socketUrl = (
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:5001/api'
).replace(/\/api\/?$/, '');

export const SocketProvider = ({ children, token }) => {
  const socketRef             = useRef(null);
  const [socket, setSocket] = useState(null);
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

    const socket = io(socketUrl, {
      auth: { token },
      withCredentials: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1500,
    });

    socketRef.current = socket;
    setSocket(socket);

    socket.on('connect',      ()      => setConnected(true));
    socket.on('disconnect',   ()      => setConnected(false));
    socket.on('connect_error', (error) => {
      setConnected(false);

      // Invalid auth should not keep hammering the socket endpoint.
      if (error.message === 'Auth failed' || error.message === 'No token') {
        socket.disconnect();
      }
    });
    socket.on('online_users', (users) => setOnlineUsers(users));
    socket.on('user_online',  (id)    => setOnlineUsers((prev) => [...new Set([...prev, id])]));
    socket.on('user_offline', (id)    => setOnlineUsers((prev) => prev.filter((u) => u !== id)));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('online_users');
      socket.off('user_online');
      socket.off('user_offline');
      socket.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [token]);

  const isOnline = useCallback((userId) => onlineUsers.includes(userId?.toString()), [onlineUsers]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, isOnline, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used inside SocketProvider');
  return ctx;
};
