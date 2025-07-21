import { Request, Response, NextFunction } from 'express';
import { userInterface } from './userInterface';
export const supportMiddleware = (req: userInterface, res: Response, next: NextFunction) => {
  if (req.user.role !== 'support') {
    return res.status(401).json({ success: false,  "statusCode": 401, message: 'You have no access to this route.' });
  }
  next();
};
