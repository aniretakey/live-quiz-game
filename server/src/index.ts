import WebSocket, {WebSocketServer} from 'ws';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// WebSocket server
const wss = new WebSocketServer({port: PORT});

const clients: WebSocket[] = []

wss.on('connection', (ws: WebSocket) => {
    console.log('Connected!');
    clients.push(ws);
    console.log('clients', clients)

    ws.on('message', (msg) => {
        clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(msg);
            }
        });
    })

    ws.on('close', (ws) => {
        console.log('Closed!, number: ', ws);
        // clients.splice(clients.indexOf(ws), 1);
    });
})