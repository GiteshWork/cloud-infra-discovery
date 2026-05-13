/**
 * T4 — Cost Aggregation Engine
 * Computes total cost and per-category cost breakdowns from classified resources.
 * Handles edge cases: null costs, invalid values (already sanitized by model layer).
 */

/**
 * Aggregates cost for a single array of resources.
 * Returns a rounded total to avoid floating-point drift.
 */
function sumCost(resources) {
  return Math.round(
    resources.reduce((acc, r) => acc + (r.cost_per_month || 0), 0) * 100
  ) / 100;
}

/**
 * Builds a full cost breakdown report from classified resource buckets.
 *
 * @param {Object} classified - Output from classifyResources()
 * @returns {Object} - Breakdown per category + grand total
 */
function aggregateCosts(classified) {
  const breakdown = {};
  let total = 0;

  for (const [category, resources] of Object.entries(classified)) {
    const categoryTotal = sumCost(resources);
    const topResources = [...resources]
      .sort((a, b) => b.cost_per_month - a.cost_per_month)
      .slice(0, 3)
      .map(r => ({ id: r.id, name: r.name, type: r.type, cost: r.cost_per_month }));

    breakdown[category] = {
      total: categoryTotal,
      resource_count: resources.length,
      top_resources: topResources,
    };

    total += categoryTotal;
  }

  return {
    total_cost: Math.round(total * 100) / 100,
    currency: 'USD',
    period: 'monthly',
    breakdown,
  };
}

/**
 * Generates a concise human-readable summary string.
 */
function formatSummaryText(costReport) {
  const { total_cost, breakdown } = costReport;
  const lines = [`Total Cost: $${total_cost.toLocaleString()}/month`];

  for (const [cat, data] of Object.entries(breakdown)) {
    if (cat === 'unclassified') continue;
    lines.push(`  ${cat.charAt(0).toUpperCase() + cat.slice(1)}: $${data.total.toLocaleString()}`);
  }

  if (breakdown.unclassified?.total > 0) {
    lines.push(`  Unclassified: $${breakdown.unclassified.total.toLocaleString()}`);
  }

  return lines.join('\n');
}

module.exports = { aggregateCosts, sumCost, formatSummaryText };
