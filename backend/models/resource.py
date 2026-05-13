"""
T2 — Resource Modeling
Data models for Compute, Storage, and Networking resources.
Uses Python dataclasses for clean, typed, serializable structures.
"""

from dataclasses import dataclass, field, asdict
from typing import Optional, Dict, Any
from enum import Enum


class ResourceCategory(str, Enum):
    """Supported resource categories. Extend here for future types."""
    COMPUTE = "compute"
    STORAGE = "storage"
    NETWORKING = "networking"
    UNKNOWN = "unknown"


class ResourceStatus(str, Enum):
    """Lifecycle states a cloud resource can be in."""
    RUNNING = "running"
    STOPPED = "stopped"
    AVAILABLE = "available"
    PENDING = "pending"
    UNKNOWN = "unknown"


@dataclass
class Resource:
    """
    Base model representing any cloud resource.
    All category-specific resources share these core fields.
    """
    id: str
    name: str
    type: str                           # e.g. "EC2", "S3", "VPC"
    category: ResourceCategory
    region: str
    status: ResourceStatus
    monthly_cost: float                 # USD per month
    tags: Dict[str, str] = field(default_factory=dict)
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "category": self.category.value,
            "region": self.region,
            "status": self.status.value,
            "monthly_cost": self.monthly_cost,
            "tags": self.tags,
            "metadata": self.metadata,
            "created_at": self.created_at,
        }


@dataclass
class ComputeResource(Resource):
    """
    Specialised model for compute resources: EC2, ECS tasks, Lambda, etc.
    Inherits all base fields and enforces category = COMPUTE.
    """
    instance_type: Optional[str] = None
    vcpus: Optional[int] = None
    memory_gb: Optional[float] = None

    def __post_init__(self):
        self.category = ResourceCategory.COMPUTE

    def to_dict(self) -> Dict[str, Any]:
        base = super().to_dict()
        base.update({
            "instance_type": self.instance_type,
            "vcpus": self.vcpus,
            "memory_gb": self.memory_gb,
        })
        return base


@dataclass
class StorageResource(Resource):
    """
    Specialised model for storage resources: S3, EBS, RDS, ElastiCache, DynamoDB.
    """
    size_gb: Optional[float] = None
    storage_type: Optional[str] = None  # e.g. "object", "block", "relational"

    def __post_init__(self):
        self.category = ResourceCategory.STORAGE

    def to_dict(self) -> Dict[str, Any]:
        base = super().to_dict()
        base.update({
            "size_gb": self.size_gb,
            "storage_type": self.storage_type,
        })
        return base


@dataclass
class NetworkingResource(Resource):
    """
    Specialised model for networking resources: VPC, ALB, NAT Gateway, CloudFront, Route53.
    """
    scope: Optional[str] = None  # "regional" or "global"

    def __post_init__(self):
        self.category = ResourceCategory.NETWORKING

    def to_dict(self) -> Dict[str, Any]:
        base = super().to_dict()
        base.update({"scope": self.scope})
        return base
