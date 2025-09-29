"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const appError_1 = require("./appError");
const handleZodError = (err) => {
    const issues = Array.isArray(err.issues)
        ? err.issues
        : Array.isArray(err.errors)
            ? err.errors
            : [];
    const parsed = issues.map((e) => {
        var _a, _b;
        return ({
            path: Array.isArray(e === null || e === void 0 ? void 0 : e.path) ? e.path.join('.') : String((_a = e === null || e === void 0 ? void 0 : e.path) !== null && _a !== void 0 ? _a : ''),
            message: String((_b = e === null || e === void 0 ? void 0 : e.message) !== null && _b !== void 0 ? _b : 'Invalid input'),
        });
    });
    const appErr = new appError_1.appError('Invalid input data.', 400);
    appErr.errors = parsed;
    return appErr;
};
exports.default = handleZodError;
