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
    clients.push(ws);

    ws.on('message', (raw) => {
        const command = JSON.parse(raw.toString());
        const user = getUserByWs(ws, users);

        switch (command.type) {
            case CommandTypes.REGISTER:
                handleReg(ws, command.data, users);
                return;

            case CommandTypes.CREATE_GAME:
                if (user) {
                    createGame(ws, command.data, games, user);
                }
                return;

            case CommandTypes.JOIN_GAME:
                if (user) {
                    joinGame(ws, command.data, games, user, users);
                }
                return;

            default:
                return;
        }
    });

    ws.on('close', () => {
        const index = clients.indexOf(ws);
        if (index !== -1) clients.splice(index, 1);
    });
});