"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handleDuplicateError = (err) => {
    // check match
    const match = err.message.match(/"([^"]*)"/);
    const extractedMessage = match && match[1];
    const errorSources = [
        {
            path: "",
            message: extractedMessage ? `${extractedMessage} already exists` : 'Duplicate key value',
        },
    ];
    const statusCode = 400;
    return {
        statusCode,
        message: extractedMessage ? `${extractedMessage} already exists` : 'Duplicate key error',
        errorSources,
    };
};
exports.default = handleDuplicateError;
