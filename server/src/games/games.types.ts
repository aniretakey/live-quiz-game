import { CommandTypes, CreateGameData, JoinGameData, ResponseTypes, StartGameData } from "../types";

export type CreateGameRequest = {
    type: CommandTypes.CREATE_GAME,
    data: CreateGameData,
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

export type JoinGameRequest = {
    "type": CommandTypes.JOIN_GAME,
    "data": JoinGameData,
    "id": 0
}

export type JoinGameResponse = {
    "type": ResponseTypes.GAME_JOINED,
    "data": StartGameData,
    "id": 0
}

export type PlayerJoinNotification = {
    "type": ResponseTypes.PLAYER_JOINED,
    "data": {
        "playerName": string,
        "playerCount": number
    },
    "id": 0
}

export type UpdatePlayersResponse = {
    type: ResponseTypes.UPDATE_PLAYERS,
    data: {
        name: string;
        index: string | number;
        score: number;
    }[];
    id: 0;
}