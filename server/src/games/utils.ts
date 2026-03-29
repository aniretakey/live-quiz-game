import WebSocket from "ws";
import { Game } from "../types";

export const getGameByCode = (gameCode: string, games: Game[]) => {
    return games.find((game) => game.code === gameCode)
}

export function broadcastToGame(game: Game, msg: any) {
    game.players.forEach((player) => {
        if (player.ws && player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(JSON.stringify(msg));
        }
    });
}