import WebSocket from "ws";
import { CreateGameError, CreateGameRequest, CreateGameResponse } from "./games.types";
import { Game, ResponseTypes, User } from "../types";
import { generateGameCodeAndId } from "../utils/generateGameCodeAndId";
import { validateQuestions } from "../utils/validateQuestions";

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