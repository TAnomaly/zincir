import { Server as HttpServer } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';

interface ExtWebSocket extends WebSocket {
    userId?: string;
    isAlive: boolean;
}

class SocketService {
    private wss: WebSocketServer | null = null;
    private userSockets: Map<string, ExtWebSocket[]> = new Map();

    public init(server: HttpServer) {
        this.wss = new WebSocketServer({ server, path: '/ws' });

        this.wss.on('connection', (ws: ExtWebSocket, req) => {
            ws.isAlive = true;

            ws.on('pong', () => {
                ws.isAlive = true;
            });

            // Token doğrulama (Query param veya header)
            const url = new URL(req.url || '', `http://${req.headers.host}`);
            const token = url.searchParams.get('token');

            if (!token) {
                ws.close(1008, 'Token gerekli');
                return;
            }

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
                ws.userId = decoded.userId;

                // Kullanıcı soketini kaydet
                if (!this.userSockets.has(decoded.userId)) {
                    this.userSockets.set(decoded.userId, []);
                }
                this.userSockets.get(decoded.userId)?.push(ws);

                console.log(`🔌 Kullanıcı bağlandı: ${decoded.userId}`);

                ws.on('close', () => {
                    this.removeSocket(decoded.userId, ws);
                });

                ws.on('error', (err) => {
                    console.error('WebSocket hatası:', err);
                    this.removeSocket(decoded.userId, ws);
                });

            } catch (error) {
                ws.close(1008, 'Geçersiz token');
            }
        });

        // Heartbeat interval
        setInterval(() => {
            this.wss?.clients.forEach((ws: WebSocket) => {
                const extWs = ws as ExtWebSocket;
                if (!extWs.isAlive) return ws.terminate();
                extWs.isAlive = false;
                ws.ping();
            });
        }, 30000);
    }

    private removeSocket(userId: string, ws: ExtWebSocket) {
        const sockets = this.userSockets.get(userId);
        if (sockets) {
            const index = sockets.indexOf(ws);
            if (index !== -1) {
                sockets.splice(index, 1);
            }
            if (sockets.length === 0) {
                this.userSockets.delete(userId);
            }
        }
        console.log(`🔌 Kullanıcı ayrıldı: ${userId}`);
    }

    public emitToUser(userId: string, event: string, data: any) {
        const sockets = this.userSockets.get(userId);
        if (sockets) {
            sockets.forEach(ws => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ event, data }));
                }
            });
            return true;
        }
        return false;
    }
}

export const socketService = new SocketService();
