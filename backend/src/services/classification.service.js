/**
 * T3 — Classification Engine
 * Groups normalized resources into their respective categories.
 * Designed for extensibility: adding a new category requires no structural changes here.
 */

const { VALID_CATEGORIES } = require('../models/resource.model');

/**
 * Classifies a flat list of resources into category buckets.
 * Any resource with category 'unknown' lands in a dedicated 'unclassified' bucket.
 *
 * @param {Array} resources - Normalized resource objects from the ingestion layer
 * @returns {Object} - Map of category → resource array, plus 'unclassified'
 */
function classifyResources(resources) {
  // Initialise all known categories to empty arrays (ensures consistent shape)
  const buckets = Object.fromEntries(VALID_CATEGORIES.map(c => [c, []]));
  buckets.unclassified = [];

  for (const resource of resources) {
    const target = VALID_CATEGORIES.includes(resource.category)
      ? resource.category
      : 'unclassified';
    buckets[target].push(resource);
  }

  return buckets;
}

/**
 * Returns a flat summary count per category.
 */
function getCategoryCounts(classified) {
  return Object.fromEntries(
    Object.entries(classified).map(([cat, items]) => [cat, items.length])
  );
}

module.exports = { classifyResources, getCategoryCounts };
