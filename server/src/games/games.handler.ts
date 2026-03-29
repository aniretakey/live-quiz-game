import WebSocket from "ws";
import {
    CreateGameError,
    CreateGameRequest,
    CreateGameResponse,
    JoinGameRequest,
    PlayerJoinNotification,
    UpdatePlayersResponse
} from "./games.types";
import { Game, Player, ResponseTypes, User } from "../types";
import { generateGameCodeAndId } from "../utils/generateGameCodeAndId";
import { validateQuestions } from "../utils/validateQuestions";
import { broadcastToGame, getGameByCode } from "./utils";

export function createGame(ws: WebSocket, data: CreateGameRequest['data'], games: Game[], host: User) {
    const {isError, errorMessage} = validateQuestions(data.questions);

    if (isError) {
        const errorResponse: CreateGameError = {
            type: "error",
            data: {
                message: errorMessage ?? "Questions validation error",
            },
            id: 0,
        };

        ws.send(JSON.stringify(errorResponse));
        return;
    }

    const {code, gameId} = generateGameCodeAndId();

    const newGame: Game = {
        id: gameId,
        code,
        hostId: host.index,
        questions: data.questions,
        players: [],
        currentQuestion: -1,
        status: "waiting",
        playerAnswers: new Map()
    };

    games.push(newGame);

    const response: CreateGameResponse = {
        type: ResponseTypes.GAME_CREATED,
        data: {
            gameId,
            code,
        },
        id: 0,
    };

    ws.send(JSON.stringify(response));
}

export function addPlayerToGame(
    game: Game,
    user: User,
    ws: WebSocket,
): void {
    const newPlayer: Player = {
        name: user.name,
        index: user.index,
        score: 0,
        ws
    };

    game.players.push(newPlayer);
}

export function notifyPlayers(
    game: Game,
    playerName: string,
    host: User
): void {
    const notification: PlayerJoinNotification = {
        type: ResponseTypes.PLAYER_JOINED,
        data: {
            playerName,
            playerCount: game.players.length,
        },
        id: 0,
    };

    broadcastToGame(game, notification);

    const updatePlayers: UpdatePlayersResponse = {
        type: ResponseTypes.UPDATE_PLAYERS,
        data: game.players.map((player) => ({
            name: player.name,
            index: player.index,
            score: player.score,
        })),
        id: 0,
    };

    broadcastToGame(game, updatePlayers);

    if (host.ws && host.ws.readyState === WebSocket.OPEN) {
        host.ws.send(JSON.stringify(updatePlayers));
    }
}

export function joinGame(
    ws: WebSocket,
    data: JoinGameRequest['data'],
    games: Game[],
    user: User,
    users: User[]
) {
    const game = getGameByCode(data.code, games);

    if (!game) {
        ws.send(JSON.stringify({
            type: "error",
            data: {message: `Game with code ${data.code} not found`},
            id: 0,
        }));
        return;
    }

    if (game.status !== 'waiting') {
        ws.send(JSON.stringify({
            type: "error",
            data: {message: `Game is already in progress`},
            id: 0,
        }));
        return;
    }

    addPlayerToGame(game, user, ws);

    ws.send(JSON.stringify({
        type: ResponseTypes.GAME_JOINED,
        data: {gameId: game.id},
        id: 0,
    }));

    const host = users.find(u => u.index === game.hostId);

    if (host) {
        notifyPlayers(game, user.name, host);
    } else {
        const notification: PlayerJoinNotification = {
            type: ResponseTypes.PLAYER_JOINED,
            data: {
                playerName: user.name,
                playerCount: game.players.length,
            },
            id: 0,
        };

        const updatePlayers: UpdatePlayersResponse = {
            type: ResponseTypes.UPDATE_PLAYERS,
            data: game.players.map((player) => ({
                name: player.name,
                index: player.index,
                score: player.score,
                ws: player.ws
            })),
            id: 0,
        };

        broadcastToGame(game, notification);
        broadcastToGame(game, updatePlayers);
    }
}