// handleZodError.ts
import { ZodError } from "zod";
import { appError } from "./appError";
const handleZodError = (err: ZodError) => {
  const issues = Array.isArray((err as any).issues)
    ? (err as any).issues
    : Array.isArray((err as any).errors)
    ? (err as any).errors
    : [];

  const parsed = issues.map((e: any) => ({
    path: Array.isArray(e?.path) ? e.path.join('.') : String(e?.path ?? ''),
    message: String(e?.message ?? 'Invalid input'),
  }));

  const appErr = new appError('Invalid input data.', 400) as any;
  appErr.errors = parsed;
  return appErr;
};

export default handleZodError;
