/**
 * Centralized error handling middleware
 * Returns consistent JSON error responses
 */
function errorHandler(err, req, res, next) {
  console.error("Error:", err);

  const status = err.statusCode || err.status || 500;
  const message = err.message || "Internal server error";
  const code = err.code || "UNKNOWN_ERROR";

  res.status(status).json({
    error: message,
    code: code,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

module.exports = errorHandler;
