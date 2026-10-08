"""Deterministic, read-only FDE order investigation walking skeleton.

Uses Python stdlib + SQLite only. NOT an auth provider, Lakehouse, LLM or cloud app.
TrustedActor MUST be supplied by a real authenticated host in production.
"""
from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import datetime, timezone
import json
import sqlite3
from typing import Literal


STATUS = Literal["ANOMALY", "CONSISTENT", "INSUFFICIENT_EVIDENCE"]
ALLOWED_EVENT_TYPES = {"CREATED", "SHIPPED", "HANDED_OFF", "DELIVERED"}


class AccessDenied(PermissionError):
    """No authorized access to a requested order."""


class ConflictingEvent(ValueError):
    """One source event ID was reused with different business content."""


@dataclass(frozen=True)
class TrustedActor:
    """Host-verified context, NOT user- or LLM-supplied tenant parameters."""
    user_id: str
    tenant_id: str
    allowed_orders: frozenset[str]


@dataclass(frozen=True)
class SourceEvent:
    tenant_id: str
    source: str
    source_event_id: str
    order_id: str
    source_version: int
    event_type: str
    event_time_utc: str
    ingested_at_utc: str


def valid_utc(value: str) -> datetime:
    """Parse an explicit UTC instant; reject naive or non-UTC timestamps."""
    try:
        dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise ValueError(f"Invalid UTC timestamp: {value!r}") from exc
    if dt.tzinfo is None or dt.utcoffset().total_seconds() != 0:
        raise ValueError("Timestamp must include UTC offset Z or +00:00")
    return dt


class OrderStore:
    def __init__(self) -> None:
        self.db = sqlite3.connect(":memory:")
        self.db.row_factory = sqlite3.Row
        self.db.execute("""
            CREATE TABLE events (
                tenant_id TEXT NOT NULL,
                source TEXT NOT NULL,
                source_event_id TEXT NOT NULL,
                order_id TEXT NOT NULL,
                source_version INTEGER NOT NULL,
                event_type TEXT NOT NULL,
                event_time_utc TEXT NOT NULL,
                ingested_at_utc TEXT NOT NULL,
                PRIMARY KEY (tenant_id, source, source_event_id)
            )
        """)
        self.db.execute("""
            CREATE INDEX idx_order_tenant
              ON events (tenant_id, order_id, event_time_utc)
        """)

    def ingest(self, event: SourceEvent) -> bool:
        """False for an identical replay; rejects conflicts for same source ID.

        Educational single-process implementation. Real concurrent ingestion
        requires atomic database constraints and transaction/error handling.
        """
        if not all((event.tenant_id, event.source, event.source_event_id, event.order_id)):
            raise ValueError("Missing source identity / tenant / order")
        if event.source_version < 0 or event.event_type not in ALLOWED_EVENT_TYPES:
            raise ValueError("Invalid source version or event type")
        valid_utc(event.event_time_utc)
        valid_utc(event.ingested_at_utc)
        core = ("tenant_id", "source", "source_event_id", "order_id",
                "source_version", "event_type", "event_time_utc")
        existing = self.db.execute(
            """SELECT * FROM events
               WHERE tenant_id = ? AND source = ? AND source_event_id = ?""",
            (event.tenant_id, event.source, event.source_event_id),
        ).fetchone()
        if existing is not None:
            if any(existing[key] != getattr(event, key) for key in core):
                raise ConflictingEvent("Source event ID payload conflict: quarantine")
            return False
        with self.db:
            self.db.execute("""
                INSERT INTO events (
                    tenant_id, source, source_event_id, order_id, source_version,
                    event_type, event_time_utc, ingested_at_utc
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, tuple(getattr(event, key) for key in (
                "tenant_id", "source", "source_event_id", "order_id",
                "source_version", "event_type", "event_time_utc", "ingested_at_utc"
            )))
        return True

    def authorized_timeline(self, actor: TrustedActor, order_id: str) -> list[dict]:
        # Fail before querying, keeping forbidden tenant data out of the evidence path.
        if not actor.user_id or not actor.tenant_id or order_id not in actor.allowed_orders:
            raise AccessDenied("Order not authorized")
        # Parameterized, tenant-scoped lookup; a trusted host supplies the actor.
        rows = self.db.execute("""
            SELECT source, source_event_id, source_version, event_type,
                   event_time_utc, ingested_at_utc
              FROM events
             WHERE tenant_id = ? AND order_id = ?
             ORDER BY event_time_utc ASC, source ASC, source_event_id ASC
        """, (actor.tenant_id, order_id)).fetchall()
        return [dict(row) for row in rows]


def investigate(store: OrderStore, actor: TrustedActor, order_id: str) -> dict:
    events = store.authorized_timeline(actor, order_id)
    handoffs = [e for e in events if e["event_type"] == "HANDED_OFF"]
    deliveries = [e for e in events if e["event_type"] == "DELIVERED"]
    evidence = [
        {"source": e["source"], "source_event_id": e["source_event_id"],
         "event_type": e["event_type"], "event_time_utc": e["event_time_utc"]}
        for e in events
    ]
    if not handoffs or not deliveries:
        status: STATUS = "INSUFFICIENT_EVIDENCE"
        explanation = "Missing handoff or delivery source evidence; cannot infer chronology."
    else:
        # This flags recorded chronology only, not a proven real-world incident.
        first_handoff = min(valid_utc(e["event_time_utc"]) for e in handoffs)
        first_delivery = min(valid_utc(e["event_time_utc"]) for e in deliveries)
        if first_delivery < first_handoff:
            status = "ANOMALY"
            explanation = (
                "Recorded delivery precedes recorded handoff; verify source clocks "
                "and event-time semantics with the system owners."
            )
        else:
            status = "CONSISTENT"
            explanation = "Recorded handoff occurs no later than recorded delivery."
    return {
        "order_id": order_id,
        "status": status,
        "explanation": explanation,
        "evidence": evidence,
        "read_only": True,
    }


def demo() -> list[dict]:
    db = OrderStore()
    fixture = [
        SourceEvent("tenant-a", "carrier", "a-del", "42", 2, "DELIVERED",
                    "2026-10-07T10:20:00Z", "2026-10-07T10:35:00Z"),
        SourceEvent("tenant-a", "warehouse", "a-hand", "42", 1, "HANDED_OFF",
                    "2026-10-07T10:30:00Z", "2026-10-07T10:31:00Z"),
        SourceEvent("tenant-b", "carrier", "b-del", "42", 2, "DELIVERED",
                    "2026-10-07T11:30:00Z", "2026-10-07T11:32:00Z"),
        SourceEvent("tenant-b", "warehouse", "b-hand", "42", 1, "HANDED_OFF",
                    "2026-10-07T11:00:00Z", "2026-10-07T11:10:00Z"),
    ]
    for event in fixture:
        db.ingest(event)
    db.ingest(fixture[0])  # identical replay is a no-op
    return [
        investigate(db, TrustedActor("alice", "tenant-a", frozenset({"42"})), "42"),
        investigate(db, TrustedActor("bob", "tenant-b", frozenset({"42"})), "42"),
    ]


if __name__ == "__main__":
    print(json.dumps(demo(), ensure_ascii=False, indent=2))
