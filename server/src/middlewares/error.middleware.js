class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// MongoDB duplicate key error handler
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const message = `An account with this ${field} already exists.`;
  return new AppError(message, 400);
};

// MongoDB validation error handler
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((e) => e.message);
  const message = `Invalid input data: ${errors.join(". ")}`;
  return new AppError(message, 400);
};

// JWT error handler
const handleJWTError = () => {
  return new AppError("Invalid token. Please login again.", 401);
};

// JWT expired error handler
const handleJWTExpiredError = () => {
  return new AppError("Your token has expired. Please login again.", 401);
};

// MongoDB CastError handler
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// Send error in development
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    error: err.message,
    stack: err.stack,
    details: err,
  });
};

// Send error in production
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  } else {
    console.error("ERROR 💥", err);
    res.status(500).json({
      success: false,
      error: "Something went wrong!",
    });
  }
};

// Main error handling middleware
export default function errorMiddleware(err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    if (err.code === 11000) error = handleDuplicateKeyError(err);
    if (err.name === "ValidationError") error = handleValidationError(err);
    if (err.name === "JsonWebTokenError") error = handleJWTError();
    if (err.name === "TokenExpiredError") error = handleJWTExpiredError();
    if (err.name === "CastError") error = handleCastError(err);

    sendErrorProd(error, res);
  }
}

export { AppError };
