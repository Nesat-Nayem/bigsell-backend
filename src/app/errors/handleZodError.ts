// handleZodError.ts
import { ZodError } from "zod";
import { appError } from "./appError";
const handleZodError = (err: ZodError) => {
  const errors = err.errors.map(e => ({ path: e.path.join('. '), message: e.message }));
  const message = 'Invalid input data. ';
  return new appError(message + JSON.stringify(errors), 400);
};

export default handleZodError;
