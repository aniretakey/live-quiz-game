import WebSocket from "ws";
import { RegRequest, RegResponse } from "./auth.types";
import { User } from "../types";
import { randomUUID } from "node:crypto";

export function handleReg(ws: WebSocket, data: RegRequest, users: User[]): void {
    const {name, password} = data;

    const user = users.find((u) => u.name === name);

    if (!user) {
        const newUser: User = {
            name,
            password,
            index: randomUUID(),
            ws,
        };

        users.push(newUser);

        const response: RegResponse = {
            type: "reg",
            data: {
                name,
                index: newUser.index,
                error: false,
                errorText: "",
            },
            id: 0,
        };

        ws.send(JSON.stringify(response));
        return;
    }

    if (user.password !== password) {
        const response: RegResponse = {
            type: "reg",
            data: {
                name,
                index: user.index,
                error: true,
                errorText: "Incorrect password!",
            },
            id: 0,
        };

        ws.send(JSON.stringify(response));
        return;
    }

    const response: RegResponse = {
        type: "reg",
        data: {
            name,
            index: user.index,
            error: false,
            errorText: "",
        },
        id: 0,
    };

    ws.send(JSON.stringify(response));
}