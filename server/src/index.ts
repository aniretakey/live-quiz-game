import WebSocket, {WebSocketServer} from 'ws';
import {User} from "./types";

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
        clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(msg);
            }
        });

        const command = JSON.parse(msg.toString());
        const commandType = command.type

        if (commandType === CommandTypes.REGISTER) {
            // TODO: вынести логику по логину / регистрации в отдельную функцию, здесь оставить только свитч
            console.log('raw.data', command.data);
            const {name, password} = command.data;

            const user = users?.filter(el => el.name === name)?.[0];
            const isUserExists = !!user
            const isUserPasswordCorrect = user?.password === password

            if (!isUserExists) {
                const newUser: User = {
                    name,
                    password,
                    index: String(users.length + 1),
                    ws: ws
                };

                users.push(newUser);

                const response = {
                    type: CommandTypes.REGISTER,
                    data: {
                        name,
                        index: newUser.index,
                        error: false,
                        errorText: ''
                    },
                    id: 0 // TODO: решить что-то с id
                };

                ws.send(JSON.stringify(response));
                return;
            }

            if (isUserPasswordCorrect) {
                console.log('success login!')
                const response = {
                    type: CommandTypes.REGISTER,
                    data: {
                        name,
                        index: user.index,
                        error: false,
                        errorText: ''
                    },
                    id: 0 // TODO: решить что-то с id
                };

                ws.send(JSON.stringify(response));
                return;
            } else if (users?.some(el => el.name === name && el.password !== password)) {
                console.log('Incorrect password!');
                const response = {
                    type: CommandTypes.REGISTER,
                    data: {
                        name,
                        index: user.index,
                        error: true,
                        errorText: 'Incorrect password!'
                    },
                    id: 0 // TODO: решить что-то с id
                };

                ws.send(JSON.stringify(response));
            }


        }
    })

    ws.on('close', (ws) => {
        console.log('Closed!, number: ', ws);
        // clients.splice(clients.indexOf(ws), 1);
    });
})