/**
 * Global error handling middleware.
 * Catches any errors thrown from route handlers and returns a clean JSON error.
 */
function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${err.message}`);

  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 404 handler for undefined routes.
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    error: `Route "${req.method} ${req.originalUrl}" not found.`,
    available_routes: [
      'GET /api/health',
      'GET /api/resources',
      'GET /api/resources/:id',
      'GET /api/summary',
      'GET /api/cost-breakdown',
      'GET /api/categories',
    ],
  });
}

module.exports = { errorHandler, notFoundHandler };
