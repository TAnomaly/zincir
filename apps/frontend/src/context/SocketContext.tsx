import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';

interface SocketContextType {
    socket: WebSocket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token, user } = useAuthStore();
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!token || !user) {
            if (socket) {
                socket.close();
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        // WebSocket bağlantısı
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // Backend portu 3001'de çalışıyor
        const wsUrl = `${protocol}//${window.location.hostname}:3001/ws?token=${token}`;

        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            // console.log('🔌 WebSocket bağlantısı kuruldu');
            setIsConnected(true);
        };

        ws.onclose = () => {
            // console.log('🔌 WebSocket bağlantısı kesildi');
            setIsConnected(false);
        };

        ws.onerror = (error) => {
            // WebSocket hatalarını konsola basma (Kullanıcı isteği)
            // console.error('WebSocket hatası:', error);
        };

        setSocket(ws);

        return () => {
            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                ws.close();
            }
        };
    }, [token, user]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
