function notFoundHandler(req, _res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

function errorHandler(error, _req, res, _next) {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    res.status(400).json({ message: "Invalid JSON payload." });
    return;
  }

  const status = error.status || 500;
  const payload = {
    message: status >= 500 ? "Internal Server Error" : error.message || "Request failed.",
  };

  if (error.details) {
    payload.details = error.details;
  }

  if (process.env.NODE_ENV !== "production" && error.stack) {
    payload.message = error.message || payload.message;
    payload.stack = error.stack;
  }

  res.status(status).json(payload);
}

module.exports = { notFoundHandler, errorHandler };
