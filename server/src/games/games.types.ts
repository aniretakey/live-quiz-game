import { CommandTypes, Question, ResponseTypes } from "../types";

export type CreateGameRequest = {
    type: CommandTypes.CREATE_GAME,
    data: {
        questions: Question[]
    },
    "id": 0
}

export type CreateGameResponse = {
    type: ResponseTypes.GAME_CREATED,
    data: {
        gameId: string,
        code: string
    },
    "id": 0
}

export type CreateGameError = {
    type: "error";
    data: {
        message: string;
    };
    id: 0;
};