from models.resource import (
    Resource,
    ResourceCategory
)


TYPE_CATEGORY_MAP = {

    # Compute
    "ec2": ResourceCategory.COMPUTE,
    "ecs": ResourceCategory.COMPUTE,
    "eks": ResourceCategory.COMPUTE,
    "lambda": ResourceCategory.COMPUTE,
    "container": ResourceCategory.COMPUTE,

    # Storage
    "s3": ResourceCategory.STORAGE,
    "ebs": ResourceCategory.STORAGE,
    "efs": ResourceCategory.STORAGE,
    "rds": ResourceCategory.STORAGE,
    "dynamodb": ResourceCategory.STORAGE,

    # Networking
    "vpc": ResourceCategory.NETWORKING,
    "alb": ResourceCategory.NETWORKING,
    "nlb": ResourceCategory.NETWORKING,
    "natgateway": ResourceCategory.NETWORKING,
    "cloudfront": ResourceCategory.NETWORKING,
    "route53": ResourceCategory.NETWORKING,
}


def classify_resource(data):
    """
    Convert raw JSON resource into Resource object.
    """

    resource_type = str(
        data.get("type", "")
    ).lower()

    category = TYPE_CATEGORY_MAP.get(resource_type)

    if not category:
        category = ResourceCategory.NETWORKING

    return Resource(
        id=data.get("id", "unknown"),
        name=data.get("name", "Unnamed Resource"),
        type=resource_type,
        category=category,
        region=data.get("region", "unknown"),
        monthly_cost=float(data.get("monthly_cost", 0) or 0),
        status=data.get("status", "running")
    )

def get_supported_types():
    """
    Return all supported infrastructure resource types.
    """

    return list(TYPE_CATEGORY_MAP.keys())
