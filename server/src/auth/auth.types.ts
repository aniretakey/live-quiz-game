export interface RegRequest {
    name: string;
    password: string;
}

export interface RegResponse {
    type: "reg";
    data: {
        name: string;
        index: string | number;
        error: boolean;
        errorText: string;
    };
    id: 0;
}