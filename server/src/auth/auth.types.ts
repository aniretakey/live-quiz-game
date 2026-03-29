import { ResponseTypes } from "../types";

export interface RegResponse {
    type: ResponseTypes.REGISTER;
    data: {
        name: string;
        index: string | number;
        error: boolean;
        errorText: string;
    };
    id: 0;
}