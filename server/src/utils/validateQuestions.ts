import { Question } from "../types";

export const validateQuestions = (questions: Question[]): {
    isError: boolean;
    errorMessage?: string;
} => {
    let isError = false;
    let errorMessage;

    questions.forEach((question) => {
        const {options, timeLimitSec, correctIndex} = question;

        if (options.length !== 4) {
            isError = true;
            errorMessage = 'Incorrect question options';
            return;
        }

        if (Number.isNaN(timeLimitSec)) {
            isError = true;
            errorMessage = 'Time limit must be a number';
        }

        if (!correctIndex || Number.isNaN(correctIndex)) {
            isError = true;
            errorMessage = 'Incorrect answer index';
        }
    })

    return {
        isError,
        errorMessage,
    }
}