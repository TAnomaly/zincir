import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { logger } from '../utils/logger';

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

        // WebSocket bağlantısı (opsiyonel - sadece bildirimler için)
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // Backend portu 3001'de çalışıyor
        const wsUrl = `${protocol}//${window.location.hostname}:3001/ws?token=${token}`;

        try {
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                logger.log('🔌 WebSocket bağlantısı kuruldu');
                setIsConnected(true);
            };

            ws.onclose = () => {
                logger.log('🔌 WebSocket bağlantısı kesildi');
                setIsConnected(false);
            };

            ws.onerror = () => {
                // WebSocket hatalarını sessizce yönet
                // Not: WebSocket sadece anlık bildirimler için kullanılır
                // Bağlantı başarısız olsa da uygulama çalışmaya devam eder
                logger.log('WebSocket bağlanamadı (Bildirimler devre dışı)');
                setIsConnected(false);
            };

            setSocket(ws);

            return () => {
                if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                    ws.close();
                }
            };
        } catch (error) {
            // WebSocket bağlantısı kurulamazsa sessizce devam et
            logger.log('WebSocket başlatılamadı');
            setIsConnected(false);
        }
    }, [token, user]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
