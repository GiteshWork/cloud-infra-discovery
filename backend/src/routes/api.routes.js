/**
 * T5 — API Layer
 * Exposes all infrastructure data through clean REST endpoints.
 *
 * Endpoints:
 *   GET /api/resources          — Full list of all normalized resources
 *   GET /api/resources/:id      — Single resource by ID
 *   GET /api/summary            — Infrastructure overview + cost summary
 *   GET /api/cost-breakdown     — Detailed cost aggregation per category
 *   GET /api/categories         — Resources grouped by category
 *   GET /api/health             — Service health check
 */

const express = require('express');
const router = express.Router();

const { getIngestedData } = require('../services/ingestion.service');
const { classifyResources, getCategoryCounts } = require('../services/classification.service');
const { aggregateCosts, formatSummaryText } = require('../services/cost.service');

// ─── Helper: build classified + cost data once per request ──────────────────
function buildContext() {
  const ingestion = getIngestedData();
  const classified = classifyResources(ingestion.resources);
  const costReport = aggregateCosts(classified);
  return { ingestion, classified, costReport };
}

// ─── GET /api/health ────────────────────────────────────────────────────────
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── GET /api/resources ─────────────────────────────────────────────────────
// Query params:
//   ?category=compute|storage|networking
//   ?region=us-east-1
//   ?status=running
//   ?type=EC2
router.get('/resources', (req, res) => {
  const { ingestion } = buildContext();
  let resources = ingestion.resources;

  // Optional filters
  const { category, region, status, type } = req.query;
  if (category) resources = resources.filter(r => r.category === category.toLowerCase());
  if (region)   resources = resources.filter(r => r.region === region);
  if (status)   resources = resources.filter(r => r.status === status.toLowerCase());
  if (type)     resources = resources.filter(r => r.type === type.toUpperCase());

  res.json({
    total: resources.length,
    filters_applied: { category, region, status, type },
    ingested_at: ingestion.ingested_at,
    resources,
  });
});

// ─── GET /api/resources/:id ──────────────────────────────────────────────────
router.get('/resources/:id', (req, res) => {
  const { ingestion } = buildContext();
  const resource = ingestion.resources.find(r => r.id === req.params.id);

  if (!resource) {
    return res.status(404).json({ error: `Resource "${req.params.id}" not found.` });
  }

  res.json(resource);
});

// ─── GET /api/summary ────────────────────────────────────────────────────────
router.get('/summary', (req, res) => {
  const { ingestion, classified, costReport } = buildContext();

  res.json({
    overview: {
      total_resources: ingestion.total_normalized,
      total_raw_ingested: ingestion.total_raw,
      source: ingestion.source,
      ingested_at: ingestion.ingested_at,
      warnings: ingestion.warnings.length,
      category_counts: getCategoryCounts(classified),
    },
    cost_summary: {
      total_cost: `$${costReport.total_cost.toLocaleString()}/month`,
      compute: `$${costReport.breakdown.compute?.total.toLocaleString() || 0}`,
      storage: `$${costReport.breakdown.storage?.total.toLocaleString() || 0}`,
      networking: `$${costReport.breakdown.networking?.total.toLocaleString() || 0}`,
      unclassified: `$${costReport.breakdown.unclassified?.total.toLocaleString() || 0}`,
    },
    summary_text: formatSummaryText(costReport),
    ingestion_warnings: ingestion.warnings,
  });
});

// ─── GET /api/cost-breakdown ─────────────────────────────────────────────────
router.get('/cost-breakdown', (req, res) => {
  const { costReport } = buildContext();
  res.json(costReport);
});

// ─── GET /api/categories ─────────────────────────────────────────────────────
router.get('/categories', (req, res) => {
  const { classified } = buildContext();

  const result = {};
  for (const [cat, resources] of Object.entries(classified)) {
    result[cat] = {
      count: resources.length,
      resources,
    };
  }

  res.json(result);
});

module.exports = router;
