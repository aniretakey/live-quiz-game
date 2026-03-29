import WebSocket, {WebSocketServer} from 'ws';
import {User} from "./types";
import {handleReg} from "./auth/auth.handler";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// WebSocket server
const wss = new WebSocketServer({port: PORT});

const clients: WebSocket[] = []

const users: User[] = [];

export enum CommandTypes {
    REGISTER = "reg",
    CREATE_GAME = "create_game",
    JOIN_GAME = "join_game",
    START_GAME = "start_game",
    ANSWER = "answer",
    QUESTION_RESULT = "question_result",
}

wss.on('connection', (ws: WebSocket) => {
    console.log('Connected!');
    clients.push(ws);
    console.log('clients', clients)

    ws.on('message', (msg) => {
        const command = JSON.parse(msg.toString());
        const commandType = command.type

        // TODO: сообщения только для тестирования, потом удалить!
        clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN && commandType !== CommandTypes.REGISTER) {
                client.send(msg);
            }
        });


        if (commandType === CommandTypes.REGISTER) {
            handleReg(ws, command.data, users);
            return;
        }
    })

    ws.on('close', (ws) => {
        console.log('Closed!, number: ', ws);
        // clients.splice(clients.indexOf(ws), 1);
    });
})