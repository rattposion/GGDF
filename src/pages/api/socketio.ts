import { initSocket } from '../../services/socketio';

export default function handler(req: any, res: any) {
  if (!res.socket.server.io) {
    initSocket(res.socket.server);
  }
  res.end();
} 