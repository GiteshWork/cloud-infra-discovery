/**
 * T1 — Data Ingestion Layer
 * Responsible for loading the mock JSON dataset, validating its structure,
 * and normalizing each resource using the Resource model.
 */

const fs = require('fs');
const path = require('path');
const { normalizeResource } = require('../models/resource.model');

const DATA_PATH = path.resolve(__dirname, '../data/mock-infrastructure.json');

/**
 * Validates the top-level envelope of the ingested JSON.
 * Throws descriptive errors if the structure is malformed.
 */
function validateEnvelope(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid dataset: root must be a JSON object.');
  }
  if (!Array.isArray(raw.resources)) {
    throw new Error('Invalid dataset: "resources" must be an array.');
  }
}

/**
 * Core ingestion function.
 * Reads the JSON file, validates the envelope, and normalizes all resources.
 * Returns an ingestion report with normalized data + any warnings.
 */
function ingestData() {
  let raw;

  try {
    const fileContent = fs.readFileSync(DATA_PATH, 'utf-8');
    raw = JSON.parse(fileContent);
  } catch (err) {
    throw new Error(`Failed to read or parse data file: ${err.message}`);
  }

  validateEnvelope(raw);

  const warnings = [];
  const normalized = [];

  raw.resources.forEach((item, index) => {
    try {
      const resource = normalizeResource(item, index);

      // Collect warnings for resources that needed sanitization (T7)
      if (resource._meta.cost_sanitized) {
        warnings.push({
          id: resource.id,
          issue: `Invalid cost value "${resource._meta.original_cost}" — defaulted to 0.`,
        });
      }
      if (resource.category === 'unknown') {
        warnings.push({
          id: resource.id,
          issue: `Unknown resource type "${resource.type}" — category set to "unknown".`,
        });
      }

      normalized.push(resource);
    } catch (err) {
      warnings.push({
        id: item.id || `index-${index}`,
        issue: `Skipped due to error: ${err.message}`,
      });
    }
  });

  return {
    ingested_at: raw.ingested_at || new Date().toISOString(),
    source: raw.source || 'unknown',
    total_raw: raw.resources.length,
    total_normalized: normalized.length,
    warnings,
    resources: normalized,
  };
}

// Singleton cache — data is loaded once per process lifecycle
let _cache = null;

function getIngestedData() {
  if (!_cache) {
    _cache = ingestData();
  }
  return _cache;
}

// Allow cache invalidation for testing
function resetCache() {
  _cache = null;
}

module.exports = { getIngestedData, resetCache, ingestData };
