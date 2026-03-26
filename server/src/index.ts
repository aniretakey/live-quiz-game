import {WebSocketServer} from 'ws';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// WebSocket server
const wss = new WebSocketServer({port: PORT});

wss.on('connection', (ws) => {
    console.log('Connected!');

    ws.on('message', (msg) => {
        console.log('Received message', msg);
        ws.send('Message delivered!')
    })

    ws.on('close', (ws) => {
        console.log('Closed!')
    });
})