import { Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User as UserModel } from "../modules/auth/auth.model";
// If you later enable Staff/AdminStaff, import them and add to the `modelsToCheck` array.
// import { Staff as StaffModel } from "../modules/staff/staff.model";
// import { AdminStaff as AdminStaffModel } from "../modules/admin-staff/admin-staff.model";
import { userInterface } from "./userInterface";
import { appError } from "../errors/appError";

/**
 * auth middleware
 * usage: auth() -> just authenticate
 *        auth('admin', 'manager') -> authenticate and authorize role
 */
export const auth = (...requiredRoles: string[]) => {
  return async (req: userInterface, res: Response, next: NextFunction) => {
    try {
      // 1) Extract token
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return next(
          new appError("Authentication required. No token provided.", 401)
        );
      }

      const parts = authHeader.split(" ");
      if (parts.length !== 2 || parts[0] !== "Bearer") {
        return next(
          new appError(
            "Invalid authorization header format. Expected 'Bearer <token>'.",
            401
          )
        );
      }
      const token = parts[1];

      // 2) Ensure JWT secret exists
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        // this is a server misconfiguration — 500
        return next(
          new appError("Server misconfiguration: JWT secret not set.", 500)
        );
      }

      // 3) Verify token (jwt.verify throws if invalid/expired)
      const decoded = jwt.verify(token, secret) as JwtPayload | string;
      // We expect decoded to be an object containing userId (adjust if your token uses a different claim)
      const userId =
        typeof decoded === "object" && decoded && (decoded as any).userId
          ? (decoded as any).userId
          : undefined;

      if (!userId) {
        return next(
          new appError("Invalid token payload: missing userId.", 401)
        );
      }

      // 4) Find user across models (add other models if required)
      // Keep a list of candidate models to check — currently only UserModel is enabled
      const modelsToCheck = [UserModel /*, StaffModel, AdminStaffModel */];

      let user: any | null = null;
      for (const Model of modelsToCheck) {
        if (!Model || typeof Model.findById !== "function") continue;
        // Using lean() would return plain object; we may want the full document sometimes
        // Use findById(userId).select('+password') if you need private fields — careful with attaching to req.

        user = await Model.findById(userId);
        if (user) break;
      }

      if (!user) {
        return next(new appError("User not found.", 401));
      }

      // 5) Attach user to request (ensure your userInterface allows this)
      req.user = user;

      // 6) Role-based authorization (if roles provided)
      if (requiredRoles.length > 0) {
        const role = (user.role ?? "").toString();
        if (!requiredRoles.includes(role)) {
          return next(
            new appError(
              "You do not have permission to perform this action.",
              403
            )
          );
        }
      }

      return next();
    } catch (err: any) {
      // distinguish between token errors and other errors
      if (err.name === "TokenExpiredError") {
        return next(new appError("Token expired. Please login again.", 401));
      }
      if (err.name === "JsonWebTokenError") {
        return next(new appError("Invalid token. Please login again.", 401));
      }
      // fallback
      return next(new appError("Authentication failed.", 401));
    }
  };
};
