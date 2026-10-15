/**
 * Centralized Express Error Handling Middleware
 * Adheres to CampusLoop RULES.md API response contract
 */

export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`,
    code: 'ROUTE_NOT_FOUND'
  });
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errorCode = err.code || 'INTERNAL_ERROR';
  let details = err.details || null;

  // Handle Mongoose / MongoDB errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = Object.values(err.errors).map((val) => val.message);
  } else if (err.code === 11000) {
    statusCode = 409;
    errorCode = 'DUPLICATE_KEY_ERROR';
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with this ${field} already exists.`;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    errorCode = 'INVALID_IDENTIFIER';
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    errorCode = 'MALFORMED_JSON';
    message = 'Malformed JSON payload in request body.';
  }

  // Response payload (never leak stack trace in production)
  const response = {
    success: false,
    error: message,
    code: errorCode
  };

  if (details) {
    response.details = details;
  }

  if (process.env.NODE_ENV !== 'production' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
