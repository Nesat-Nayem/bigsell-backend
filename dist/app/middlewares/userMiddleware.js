"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userMiddleware = void 0;
const userMiddleware = (req, res, next) => {
    if (req.user.role !== 'user') {
        return res.status(401).json({ success: false, "statusCode": 401, message: 'You have no access to this route.' });
    }
    next();
};
exports.userMiddleware = userMiddleware;
