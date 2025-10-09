
import { TErrorSources, TGenericErrorResponse } from "../interface/error.interface";
const handleDuplicateError = (err: any): TGenericErrorResponse => {
  // check match
  const match = err.message.match(/"([^"]*)"/);

  const extractedMessage = match && match[1];

  const errorSources: TErrorSources = [
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

export default handleDuplicateError;