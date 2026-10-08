"""Deterministic educational FDE coding/evaluation primitives (stdlib only).

These are executable interview fixtures, NOT a model evaluator,
production access-control system, or warehouse/streaming runtime.
"""
from collections import deque
import csv
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
import heapq
import io
import math


def stable_logsumexp(logits):
    """Finite, nonempty logits; subtract the maximum to avoid overflow."""
    values = tuple(logits)
    if not values or not all(math.isfinite(x) for x in values):
        raise ValueError("logits must be finite and nonempty")
    m = max(values)
    return m + math.log(math.fsum(math.exp(v - m) for v in values))


def binary_confusion(labels, predictions):
    """Return TP, FP, TN, FN; reject missing/invalid labels."""
    y, pred = list(labels), list(predictions)
    if len(y) != len(pred) or not y:
        raise ValueError("label lengths must agree and be nonempty")
    if any(x not in (0, 1) for x in y + pred):
        raise ValueError("labels must be exactly 0 or 1")
    tp = sum(yt == 1 and yp == 1 for yt, yp in zip(y, pred))
    fp = sum(yt == 0 and yp == 1 for yt, yp in zip(y, pred))
    tn = sum(yt == 0 and yp == 0 for yt, yp in zip(y, pred))
    fn = sum(yt == 1 and yp == 0 for yt, yp in zip(y, pred))
    return dict(tp=tp, fp=fp, tn=tn, fn=fn)


def classification_scores(labels, predictions):
    c = binary_confusion(labels, predictions)
    # A zero-denominator metric is undefined. Don't pretend it is always 0.
    def ratio(n, d):
        return n / d if d else None
    precision = ratio(c["tp"], c["tp"] + c["fp"])
    recall = ratio(c["tp"], c["tp"] + c["fn"])
    f1 = (2 * precision * recall / (precision + recall)
          if precision is not None and recall is not None
          and precision + recall else None)
    return {**c, "precision": precision, "recall": recall,
            "f1": f1, "accuracy": (c["tp"] + c["tn"]) / sum(c.values())}


def brier_score(y_true, probabilities):
    labels, probs = list(y_true), list(probabilities)
    if len(labels) != len(probs) or not labels:
        raise ValueError("labels and probabilities must be nonempty and aligned")
    if any(y not in (0, 1) for y in labels):
        raise ValueError("binary 0/1 labels required")
    if any(not math.isfinite(p) or p < 0 or p > 1 for p in probs):
        raise ValueError("probabilities must be finite and in [0,1]")
    return math.fsum((p - y) ** 2 for y, p in zip(labels, probs)) / len(labels)


def bounded_top_k(scored_documents, k, *, allowed_tenant):
    """Scope before Top-K. Each item: (score, tenant, doc_id).

    Stable descending score then ascending doc_id; score must be finite.
    This function is exact over the *provided candidate stream* only.
    """
    if not isinstance(k, int) or k < 0:
        raise ValueError("k must be a nonnegative integer")
    if not allowed_tenant:
        raise ValueError("trusted tenant scope required")
    if k == 0:
        return []
    def eligible():
        for score, tenant, doc_id in scored_documents:
            if not math.isfinite(score):
                raise ValueError("nonfinite score")
            if tenant == allowed_tenant:
                yield (-score, doc_id)  # ascending tuple -> best score, then ID
    # nsmallest uses an O(k) auxiliary heap for k << N; exact within input.
    best = heapq.nsmallest(k, eligible())
    return [(-neg_score, doc_id) for neg_score, doc_id in best]


def parse_orders_csv(raw_text):
    """Quarantine errors instead of dropping row evidence. CSV is trusted as data."""
    csv_reader = csv.DictReader(io.StringIO(raw_text, newline=""))
    required = {"tenant_id", "source_event_id", "order_id", "event_time_utc"}
    if not csv_reader.fieldnames or set(csv_reader.fieldnames) != required:
        raise ValueError("unexpected/missing CSV columns")
    accepted, rejected, seen = [], [], {}
    for record in csv_reader:
        try:
            if None in record:
                raise ValueError("extra CSV columns")
            if any(record[key] is None or not record[key].strip() for key in required):
                raise ValueError("empty field")
            ts = datetime.fromisoformat(record["event_time_utc"].replace("Z", "+00:00"))
            if ts.tzinfo is None or ts.utcoffset() != timedelta(0):
                raise ValueError("timestamp must include UTC")
            identity = (record["tenant_id"], record["source_event_id"])
            payload = tuple(record[k] for k in sorted(required))
            if identity in seen:
                if seen[identity] != payload:
                    raise ValueError("conflicting source event ID")
                continue  # identical replay: idempotent
            seen[identity] = payload
            accepted.append(record)
        except (ValueError, TypeError, KeyError) as exc:
            rejected.append({"source_line": csv_reader.line_num,
                             "reason": str(exc), "raw": dict(record)})
    return accepted, rejected


@dataclass(frozen=True)
class TimedEvent:
    event_time: datetime
    failed: bool


def rolling_failure_counts(sorted_events, minutes=15):
    """(count, failures) for event-time windows inclusive at cutoff.

    Contract: sorted, UTC-aware event times. Out-of-order input is rejected.
    """
    if minutes <= 0:
        raise ValueError("minutes must be positive")
    active = deque()
    failures = 0
    prev = None
    results = []
    for event in sorted_events:
        ts = event.event_time
        if ts.tzinfo is None or ts.utcoffset() != timedelta(0):
            raise ValueError("UTC-aware timestamps required")
        if prev is not None and ts < prev:
            raise ValueError("events must be sorted by event time")
        prev = ts
        active.append(event)
        failures += int(event.failed)
        cutoff = ts - timedelta(minutes=minutes)
        while active and active[0].event_time < cutoff:
            failures -= int(active.popleft().failed)
        results.append((len(active), failures))
    return results


def topological_sort(dependencies):
    """Return deterministic order of DAG where mapping node -> predecessors.

    Reject undeclared dependencies and cycles before external side effects.
    """
    nodes = set(dependencies)
    children = {node: set() for node in nodes}
    indegree = {node: 0 for node in nodes}
    for node, required in dependencies.items():
        unique = set(required)
        unknown = unique - nodes
        if unknown:
            raise ValueError(f"undeclared dependencies: {sorted(unknown)}")
        indegree[node] = len(unique)
        for before in unique:
            children[before].add(node)
    ready = [node for node in nodes if indegree[node] == 0]
    heapq.heapify(ready)
    output = []
    while ready:
        node = heapq.heappop(ready)
        output.append(node)
        for nxt in children[node]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                heapq.heappush(ready, nxt)
    if len(output) != len(nodes):
        raise ValueError("cycle in dependency graph")
    return output


class InvestigationHost:
    """Policy injected by trusted infrastructure; no LLM authority."""

    def __init__(self, reader, policy):
        self.reader = reader
        self.policy = policy

    def investigate(self, actor, order_id):
        if not self.policy.can_read(actor, order_id):
            raise PermissionError("not authorized")
        return self.reader.read_order(actor, order_id)
