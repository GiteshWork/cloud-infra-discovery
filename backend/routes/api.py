"""
T5 — API Layer
Flask Blueprint exposing all infrastructure data endpoints.
"""

from flask import Blueprint, jsonify, request, current_app
from services.cost_engine import aggregate_costs, cost_breakdown
from services.classifier import get_supported_types
from models.resource import ResourceCategory

api_bp = Blueprint("api", __name__, url_prefix="/api")


def _get_resources():
    """Helper: fetch the loaded resources from app context."""
    return current_app.config["RESOURCES"]


# ────────────────────────────────────────────────────────────
#  GET /api/resources
#  Returns all resources, with optional ?category= filter
# ────────────────────────────────────────────────────────────
@api_bp.get("/resources")
def get_resources():
    """
    List all cloud resources.

    Query params:
      - category (str): filter by 'compute', 'storage', 'networking', 'unknown'
      - region   (str): filter by AWS region (e.g. 'us-east-1')
      - status   (str): filter by resource status
    """
    resources = _get_resources()

    category_filter = request.args.get("category", "").lower()
    region_filter = request.args.get("region", "").lower()
    status_filter = request.args.get("status", "").lower()

    if category_filter:
        resources = [r for r in resources if r.category.value == category_filter]
    if region_filter:
        resources = [r for r in resources if r.region.lower() == region_filter]
    if status_filter:
        resources = [r for r in resources if r.status.value == status_filter]

    return jsonify({
        "count": len(resources),
        "filters": {
            "category": category_filter or None,
            "region": region_filter or None,
            "status": status_filter or None,
        },
        "resources": [r.to_dict() for r in resources],
    })


# ────────────────────────────────────────────────────────────
#  GET /api/resources/<resource_id>
#  Returns a single resource by ID
# ────────────────────────────────────────────────────────────
@api_bp.get("/resources/<resource_id>")
def get_resource(resource_id: str):
    resources = _get_resources()
    resource = next((r for r in resources if r.id == resource_id), None)

    if not resource:
        return jsonify({"error": f"Resource '{resource_id}' not found"}), 404

    return jsonify(resource.to_dict())


# ────────────────────────────────────────────────────────────
#  GET /api/summary
#  High-level infrastructure overview
# ────────────────────────────────────────────────────────────
@api_bp.get("/summary")
def get_summary():
    """
    Returns a human-readable infrastructure summary:
      - Total resource count
      - Total monthly cost
      - Per-category cost and resource count
    """
    resources = _get_resources()
    agg = aggregate_costs(resources)

    # Build the concise summary the task spec requests
    summary = {
        "total_resources": agg["resource_count"],
        "total_monthly_cost": agg["total_cost"],
        "currency": "USD",
        "period": "monthly",
        "categories": {
            cat: {
                "resource_count": agg["by_category"][cat]["count"],
                "monthly_cost": agg["by_category"][cat]["cost"],
            }
            for cat in ["compute", "storage", "networking", "unknown"]
            if agg["by_category"][cat]["count"] > 0
        },
        "zero_cost_resources": agg["zero_cost_resources"],
    }

    return jsonify(summary)


# ────────────────────────────────────────────────────────────
#  GET /api/cost-breakdown
#  Detailed cost breakdown with percentages and top spenders
# ────────────────────────────────────────────────────────────
@api_bp.get("/cost-breakdown")
def get_cost_breakdown():
    """
    Returns detailed cost breakdown:
      - Per-category cost, average, and % of total
      - Top 5 most expensive resources
    """
    resources = _get_resources()
    breakdown = cost_breakdown(resources)
    return jsonify(breakdown)


# ────────────────────────────────────────────────────────────
#  GET /api/categories
#  List supported resource type → category mappings
# ────────────────────────────────────────────────────────────
@api_bp.get("/categories")
def get_categories():
    """Lists all supported resource types per category (introspection endpoint)."""
    return jsonify(get_supported_types())


# ────────────────────────────────────────────────────────────
#  GET /api/health
# ────────────────────────────────────────────────────────────
@api_bp.get("/health")
def health_check():
    resources = _get_resources()
    return jsonify({
        "status": "ok",
        "resources_loaded": len(resources),
    })
