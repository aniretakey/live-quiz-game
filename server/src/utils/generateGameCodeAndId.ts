import { randomUUID } from "node:crypto";

function generateCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result.toUpperCase();
}

export const generateGameCodeAndId = (): {
    code: string, gameId: string
} => {
    const gameId = randomUUID();
    const code = generateCode()

    return {gameId, code}
}