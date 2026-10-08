"""Production-boundary educational simulations, not real IAM/Databricks/Vector DB.

Stdlib-only fixtures for FDE Q41/Q42/Q48/Q56 and safety regressions.
"""
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
import math


@dataclass(frozen=True)
class IndexManifest:
    revision: str
    document_encoder: str
    acl_revision: int


class IndexRouter:
    """A toy atomic alias switch with current ACL and encoder validation."""

    def __init__(self, *, current_acl_revision: int):
        self.current_acl_revision = current_acl_revision
        self.active = None

    def promote(self, manifest: IndexManifest, *, query_encoder: str):
        if manifest.acl_revision < self.current_acl_revision:
            raise PermissionError("candidate index has stale ACL revision")
        if manifest.document_encoder != query_encoder:
            raise ValueError("query/document embedding encoder mismatch")
        self.active = manifest

    def bump_acl(self, new_revision: int):
        if new_revision <= self.current_acl_revision:
            raise ValueError("ACL revision must strictly increase")
        self.current_acl_revision = new_revision
        # Do not continue using an old access snapshot under the new policy.
        if self.active is not None and self.active.acl_revision < new_revision:
            self.active = None

    def visible(self, *, query_encoder: str) -> str:
        if self.active is None:
            raise PermissionError("no authorized active index")
        if self.active.acl_revision < self.current_acl_revision:
            raise PermissionError("active ACL stale")
        if self.active.document_encoder != query_encoder:
            raise ValueError("query/document encoder mismatch")
        return self.active.revision


class TenantTokenBucket:
    """Per-tenant token buckets with a deterministic time provider, no timers.

    Real systems need distributed atomic state, expiry, authenticated tenancy,
    concurrency budgets, and a global upstream capacity limit as separate gates.
    """

    def __init__(self, *, capacity: float, tokens_per_second: float):
        if not (math.isfinite(capacity) and capacity > 0
                and math.isfinite(tokens_per_second) and tokens_per_second > 0):
            raise ValueError("capacity/refill must be finite and positive")
        self.capacity = float(capacity)
        self.rate = float(tokens_per_second)
        self.tenants = {}

    def admit(self, tenant: str, *, now: float, cost: float = 1.0) -> bool:
        if not tenant:
            raise ValueError("tenant required from trusted identity")
        if not math.isfinite(now) or not math.isfinite(cost) or cost <= 0:
            raise ValueError("invalid admission")
        tokens, last = self.tenants.get(tenant, (self.capacity, now))
        if now < last:
            raise ValueError("time must not move backward")
        tokens = min(self.capacity, tokens + (now - last) * self.rate)
        allowed = tokens >= cost
        self.tenants[tenant] = (tokens - cost if allowed else tokens, now)
        return allowed


@dataclass(frozen=True)
class FeatureValue:
    tenant: str
    entity: str
    effective_at: datetime
    available_at: datetime
    value: int
    source_version: int


def as_of_feature(rows, *, tenant, entity, label_time, knowledge_time):
    """Only return a feature *effective* by label_time AND *known* by knowledge_time.

    This models bitemporal lookups; it does NOT execute Databricks Feature Store.
    """
    if not tenant or not entity:
        raise ValueError("tenant/entity required")
    for ts in (label_time, knowledge_time):
        if ts.tzinfo is None or ts.utcoffset() != timedelta(0):
            raise ValueError("explicit UTC time required")
    eligible = []
    for row in rows:
        if row.tenant != tenant or row.entity != entity:
            continue
        if any(ts.tzinfo is None or ts.utcoffset() != timedelta(0)
               for ts in (row.effective_at, row.available_at)):
            raise ValueError("invalid source UTC time")
        if row.effective_at <= label_time and row.available_at <= knowledge_time:
            eligible.append(row)
    if not eligible:
        return None
    best = max(eligible, key=lambda x: (x.effective_at, x.available_at, x.source_version))
    return best.value
