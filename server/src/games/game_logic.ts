import { AnswerData, CommandTypes, Game, ResponseTypes, StartGameData, User } from "../types";
import { broadcastToGame, getGameById } from "./utils";
import WebSocket from "ws";

function finishGame(game: Game) {
    game.status = 'finished';

    const sorted = game.players
        .filter(p => String(p.index) !== String(game.hostId))
        .sort((a, b) => b.score - a.score);

    const scoreboard = sorted.map((p, i) => ({
        name: p.name,
        score: p.score,
        rank: i + 1,
    }));

    broadcastToGame(game, {
        type: ResponseTypes.GAME_FINISHED,
        data: {scoreboard},
        id: 0,
    });
}

function nextStep(game: Game) {
    game.currentQuestion++;

    if (game.currentQuestion < game.questions.length) {
        sendQuestion(game);
    } else {
        finishGame(game);
    }
}

function finishQuestion(game: Game) {
    const question = game.questions[game.currentQuestion];

    const results = game.players.map(player => {
        const answer = game.playerAnswers.get(player.index);

        let points = 0;
        let correct = false;

        if (answer) {
            const timeTaken = answer.timestamp - (game.questionStartTime || 0);
            const timeLeft = question.timeLimitSec * 1000 - timeTaken;

            correct = answer.answerIndex === question.correctIndex;

            if (correct) {
                points = Math.max(
                    0,
                    Math.floor(1000 * (timeLeft / (question.timeLimitSec * 1000)))
                );
            }
        }

        player.score += points;

        return {
            name: player.name,
            answered: !!answer,
            correct,
            pointsEarned: points,
            totalScore: player.score,
        };
    });

    broadcastToGame(game, {
        type: CommandTypes.QUESTION_RESULT,
        data: {
            questionIndex: game.currentQuestion,
            correctIndex: question.correctIndex,
            playerResults: results,
        },
        id: 0,
    });

    setTimeout(() => {
        nextStep(game);
    }, 3000);
}

function sendQuestion(game: Game) {
    const question = game.questions[game.currentQuestion];

    if (!question) {
        return;
    }

    game.questionStartTime = Date.now();

    game.playerAnswers.clear();
    game.players.forEach(p => {
        p.hasAnswered = false;
    });

    const payload = {
        type: "question",
        data: {
            questionNumber: game.currentQuestion + 1,
            totalQuestions: game.questions.length,
            text: question.text,
            options: question.options,
            timeLimitSec: question.timeLimitSec,
        },
        id: 0,
    };

    broadcastToGame(game, payload);

    game.questionTimer = setTimeout(() => {
        finishQuestion(game);
    }, question.timeLimitSec * 1000);
}

export function startGame(
    data: StartGameData,
    games: Game[],
    user: User
) {
    const game = getGameById(data.gameId, games);

    if (!game) {
        return;
    }

    if (String(game.hostId) !== String(user.index)) {
        return;
    }

    if (game.status !== 'waiting') {
        return;
    }

    game.status = 'in_progress';
    game.currentQuestion = 0;

    sendQuestion(game);
}

export function handleAnswer(
    ws: WebSocket,
    data: AnswerData,
    games: Game[],
    user: User,
) {
    const game = getGameById(data.gameId, games);

    if (!game) return;
    if (game.status !== 'in_progress') return;
    if (data.questionIndex !== game.currentQuestion) return;

    if (game.playerAnswers.has(user.index)) return;

    const timestamp = Date.now();

    game.playerAnswers.set(user.index, {
        answerIndex: data.answerIndex,
        timestamp,
    });

    const player = game.players.find(p => p.index === user.index);
    if (player) {
        player.hasAnswered = true;
        player.answerTime = timestamp;
    }

    ws.send(JSON.stringify({
        type: ResponseTypes.ANSWER_ACCEPTED,
        data: {
            questionIndex: data.questionIndex,
        },
        id: 0,
    }));

    const activePlayers = game.players.filter(
        p => String(p.index) !== String(game.hostId)
    );

    const allAnswered = activePlayers.every(p =>
        game.playerAnswers.has(p.index)
    );

    if (allAnswered) {
        clearTimeout(game.questionTimer);
        finishQuestion(game);
    }
}