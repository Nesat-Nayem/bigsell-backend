"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.managerMiddleware = void 0;
const managerMiddleware = (req, res, next) => {
    if (req.user.role !== 'manager') {
        return res.status(401).json({ success: false, "statusCode": 401, message: 'You have no access to this route.' });
    }
    next();
};
exports.managerMiddleware = managerMiddleware;
