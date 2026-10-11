import AppError from "../utils/AppError.js";
import ApiResponse from "../utils/ApiResponse.js";

const errorHandler = (err, req, res, next) => {
  // Never serialize driver errors, request bodies, tokens, or validation values.
  console.error("Request failed", { statusCode: err.statusCode || 500 });

  const statusCode = err.statusCode || 500;

  res
    .status(statusCode)
    .json(
      new ApiResponse(
        statusCode,
        err instanceof AppError ? err.message : "Internal Server Error"
      )
    );
};

export default errorHandler;
