import { env } from '@/common/utils/envConfig';
import WebSocket, { WebSocketServer } from 'ws';
import { Message } from '../repositories/messages/messages.repository';
import { messagesService } from '../services/messages/messages.service';

const wss = new WebSocketServer({
  port: env.WS_PORT
});

let clients: WebSocket[] = [];

wss.on('connection', (ws) => {
	console.log('Client connected');
    clients.push(ws);
	if (!messagesService.isWatchingMessages) {
		messagesService.watchMessages();
	}
	ws.on('close', () => {
        clients = clients.filter(client => client !== ws);
		if (clients.length === 0) {
			messagesService.unwatchMessages();
		}
		console.log('Client disconnected');
    });
});

export function broadcastMessage(message: Message) {
    console.log('broadcasting message', message, clients.length)

    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}