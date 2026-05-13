/**
 * T2 — Resource Models
 * Defines the normalized shape of each resource category.
 * Validates and sanitizes raw ingested data into typed models.
 */

const VALID_CATEGORIES = ['compute', 'storage', 'networking'];
const VALID_STATUSES = ['running', 'stopped', 'active', 'available', 'in-use', 'deployed', 'unknown'];

// ─── Category-specific type maps ────────────────────────────────────────────

const COMPUTE_TYPES = new Set(['EC2', 'ECS_CONTAINER', 'LAMBDA', 'EKS_NODE', 'FARGATE']);
const STORAGE_TYPES = new Set(['S3', 'RDS', 'EBS_VOLUME', 'ELASTICACHE', 'DYNAMODB', 'EFS']);
const NETWORKING_TYPES = new Set(['VPC', 'ALB', 'NLB', 'CLOUDFRONT', 'ROUTE53', 'NAT_GATEWAY', 'SECURITY_GROUP', 'SUBNET']);

/**
 * Resolves a resource category from its type string.
 * Returns 'unknown' for unrecognised types — extensible for future resource types.
 */
function resolveCategory(type) {
  if (!type || typeof type !== 'string') return 'unknown';
  const upper = type.toUpperCase();
  if (COMPUTE_TYPES.has(upper)) return 'compute';
  if (STORAGE_TYPES.has(upper)) return 'storage';
  if (NETWORKING_TYPES.has(upper)) return 'networking';
  return 'unknown';
}

/**
 * Sanitizes a raw cost value to a valid float.
 * Returns 0 for null, undefined, or non-numeric values (T7 edge case handling).
 */
function sanitizeCost(raw) {
  if (raw === null || raw === undefined) return 0;
  const parsed = parseFloat(raw);
  return isNaN(parsed) || parsed < 0 ? 0 : parsed;
}

/**
 * Normalizes a raw resource object into a consistent Resource model.
 * Fills in defaults for missing fields (T7 edge cases).
 */
function normalizeResource(raw, index) {
  const id = raw.id || `auto-id-${index}`;
  const name = raw.name || `unnamed-resource-${index}`;
  const type = (raw.type || 'UNKNOWN').toUpperCase();

  // Prefer explicitly provided category; fall back to type-based resolution
  const rawCategory = raw.category ? raw.category.toLowerCase() : null;
  const category = VALID_CATEGORIES.includes(rawCategory)
    ? rawCategory
    : resolveCategory(type);

  const status = raw.status || 'unknown';
  const region = raw.region || 'unknown';
  const costRaw = raw.cost_per_month;
  const cost = sanitizeCost(costRaw);
  const costSanitized = costRaw !== cost; // flag if we had to sanitize

  return {
    id,
    name,
    type,
    category,
    region,
    status,
    cost_per_month: cost,
    tags: raw.tags && typeof raw.tags === 'object' ? raw.tags : {},
    metadata: raw.metadata && typeof raw.metadata === 'object' ? raw.metadata : {},
    _meta: {
      cost_sanitized: costSanitized,
      original_cost: costRaw,
      category_inferred: !VALID_CATEGORIES.includes(rawCategory),
    },
  };
}

module.exports = { normalizeResource, resolveCategory, sanitizeCost, VALID_CATEGORIES };
