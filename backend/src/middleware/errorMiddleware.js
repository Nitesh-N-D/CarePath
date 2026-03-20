function notFoundHandler(req, _res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

function errorHandler(error, _req, res, _next) {
  const status = error.status || 500;
  const payload = {
    message: error.message || "Internal Server Error",
  };

  if (error.details) {
    payload.details = error.details;
  }

  if (process.env.NODE_ENV !== "production" && error.stack) {
    payload.stack = error.stack;
  }

  res.status(status).json(payload);
}

module.exports = { notFoundHandler, errorHandler };
