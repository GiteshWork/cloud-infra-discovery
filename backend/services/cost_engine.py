"""
T4 — Cost Aggregation Engine
Calculates total infrastructure cost and per-category breakdowns.
Handles zero costs, missing values, and unknown categories gracefully.
"""

from typing import Any
from models.resource import Resource, ResourceCategory


def aggregate_costs(resources: list[Resource]) -> dict[str, Any]:
    """
    Compute a full cost summary across all resources.

    Returns a structured dict with:
      - total_cost: grand total (USD/month)
      - by_category: cost, count, and resource list per category
      - resource_count: total number of resources
      - zero_cost_resources: IDs of resources with $0 cost
    """
    by_category: dict[str, dict] = {
        cat.value: {"cost": 0.0, "count": 0, "resources": []}
        for cat in ResourceCategory
    }

    total_cost = 0.0
    zero_cost_resources: list[str] = []

    for resource in resources:
        category_key = resource.category.value
        cost = resource.monthly_cost  # already normalised to ≥0 by ingestion

        by_category[category_key]["cost"] += cost
        by_category[category_key]["count"] += 1
        by_category[category_key]["resources"].append(resource.id)

        total_cost += cost

        if cost == 0.0:
            zero_cost_resources.append(resource.id)

    # Round all costs to 2 decimal places
    total_cost = round(total_cost, 2)
    for cat_data in by_category.values():
        cat_data["cost"] = round(cat_data["cost"], 2)

    return {
        "total_cost": total_cost,
        "currency": "USD",
        "period": "monthly",
        "resource_count": len(resources),
        "by_category": by_category,
        "zero_cost_resources": zero_cost_resources,
    }


def cost_breakdown(resources: list[Resource]) -> dict[str, Any]:
    """
    Produce a richer cost breakdown: per-category stats plus
    top-5 most expensive resources overall.

    Used by the /cost-breakdown endpoint.
    """
    summary = aggregate_costs(resources)
    by_cat = summary["by_category"]

    # Per-category: average cost and percentage of total
    total = summary["total_cost"]
    categories_detail = []

    for cat in ResourceCategory:
        key = cat.value
        cat_cost = by_cat[key]["cost"]
        cat_count = by_cat[key]["count"]
        categories_detail.append({
            "category": key,
            "total_cost": cat_cost,
            "resource_count": cat_count,
            "average_cost": round(cat_cost / cat_count, 2) if cat_count else 0.0,
            "percentage": round((cat_cost / total * 100), 1) if total else 0.0,
        })

    # Top-5 most expensive individual resources
    sorted_resources = sorted(resources, key=lambda r: r.monthly_cost, reverse=True)
    top_costly = [
        {
            "id": r.id,
            "name": r.name,
            "type": r.type,
            "category": r.category.value,
            "monthly_cost": r.monthly_cost,
        }
        for r in sorted_resources[:5]
    ]

    return {
        "total_cost": total,
        "currency": "USD",
        "period": "monthly",
        "categories": categories_detail,
        "top_costly_resources": top_costly,
        "zero_cost_count": len(summary["zero_cost_resources"]),
    }
