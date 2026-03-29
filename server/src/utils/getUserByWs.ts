import WebSocket from "ws";
import { User } from "../types";

export function getUserByWs(ws: WebSocket, users: User[]): User | undefined {
    return users.find((u) => u.ws === ws);
}