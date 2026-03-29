import { CommandTypes, Game, ResponseTypes, StartGameData, User } from "../types";
import { broadcastToGame, getGameById } from "./utils";

function finishGame(game: Game) {
    game.status = 'finished';

    const sorted = [...game.players].sort((a, b) => b.score - a.score);

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

    nextStep(game);
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