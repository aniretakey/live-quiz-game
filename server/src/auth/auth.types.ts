import { CommandTypes } from "../types";

export interface RegRequest {
    name: string;
    password: string;
}

export interface RegResponse {
    type: CommandTypes.REGISTER;
    data: {
        name: string;
        index: string | number;
        error: boolean;
        errorText: string;
    };
    id: 0;
}