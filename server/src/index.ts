import WebSocket, { WebSocketServer } from 'ws';
import { CommandTypes, Game, User } from "./types";
import { handleReg } from "./auth/auth.handler";
import { createGame, joinGame } from "./games/games.handler";
import { getUserByWs } from "./utils/getUserByWs";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// WebSocket server
const wss = new WebSocketServer({port: PORT});

const clients: WebSocket[] = []
const users: User[] = [];

const games: Game[] = []

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

        const user = getUserByWs(ws, users);

        if (user) {
            if (commandType === CommandTypes.CREATE_GAME) {
                createGame(ws, command.data, games, user);
                return;
            }

            if (commandType === CommandTypes.JOIN_GAME) {
                joinGame(ws, command.data, games, user);
                return;
            }
        }
    })

    ws.on('close', (ws) => {
        console.log('Closed!, number: ', ws);
        // clients.splice(clients.indexOf(ws), 1);
    });
})