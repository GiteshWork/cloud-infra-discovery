/**
 * Cloud Infrastructure Discovery & Visibility Module
 * Entry point — sets up Express app with middleware, routes, and error handling.
 */

const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api.routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Request logger (lightweight, no external deps)
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// Root redirect to summary
app.get('/', (_req, res) => res.redirect('/api/summary'));

// ─── Error handlers ───────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Cloud Infra Discovery API running on http://localhost:${PORT}`);
  console.log(`   → Summary:        http://localhost:${PORT}/api/summary`);
  console.log(`   → Resources:      http://localhost:${PORT}/api/resources`);
  console.log(`   → Cost Breakdown: http://localhost:${PORT}/api/cost-breakdown`);
  console.log(`   → Categories:     http://localhost:${PORT}/api/categories\n`);
});

module.exports = app; // exported for testing
