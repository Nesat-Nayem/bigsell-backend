"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportMiddleware = void 0;
const supportMiddleware = (req, res, next) => {
    if (req.user.role !== 'support') {
        return res.status(401).json({ success: false, "statusCode": 401, message: 'You have no access to this route.' });
    }
    next();
};
exports.supportMiddleware = supportMiddleware;
