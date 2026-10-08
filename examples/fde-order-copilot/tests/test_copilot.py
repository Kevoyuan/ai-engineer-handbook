"""Contract tests for the deterministic, single-process educational sample."""
import unittest

from copilot import (
    AccessDenied, ConflictingEvent, OrderStore, SourceEvent, TrustedActor,
    demo, investigate, valid_utc,
)


def event(tenant, source, key, order, version, kind, at, ingested=None):
    return SourceEvent(
        tenant, source, key, order, version, kind,
        at, ingested or "2026-10-07T12:00:00Z"
    )


class CopilotTest(unittest.TestCase):
    def setUp(self):
        self.store = OrderStore()
        # The SAME order ID exists in two tenants with different facts.
        self.a = TrustedActor("alice", "tenant-a", frozenset({"42", "99"}))
        self.b = TrustedActor("bob", "tenant-b", frozenset({"42"}))
        self.unassigned = TrustedActor("unauthorized", "tenant-a", frozenset())
        self.store.ingest(event("tenant-a", "carrier", "a-del", "42", 2,
                                "DELIVERED", "2026-10-07T10:20:00Z"))
        self.store.ingest(event("tenant-a", "warehouse", "a-hand", "42", 1,
                                "HANDED_OFF", "2026-10-07T10:30:00Z"))
        self.store.ingest(event("tenant-b", "carrier", "b-del", "42", 2,
                                "DELIVERED", "2026-10-07T11:30:00Z"))
        self.store.ingest(event("tenant-b", "warehouse", "b-hand", "42", 1,
                                "HANDED_OFF", "2026-10-07T11:00:00Z"))

    def test_anomaly_has_citable_evidence_and_no_write(self):
        result = investigate(self.store, self.a, "42")
        self.assertEqual(result["status"], "ANOMALY")
        self.assertEqual({e["source_event_id"] for e in result["evidence"]},
                         {"a-hand", "a-del"})
        self.assertTrue(result["read_only"])
        self.assertIn("Recorded", result["explanation"])

    def test_other_tenant_identical_order_id_is_separate(self):
        result = investigate(self.store, self.b, "42")
        self.assertEqual(result["status"], "CONSISTENT")
        self.assertEqual({e["source_event_id"] for e in result["evidence"]},
                         {"b-hand", "b-del"})
        self.assertNotIn("a-del", str(result))
        self.assertNotIn("tenant-a", str(result))

    def test_denied_assignment_even_when_order_exists(self):
        with self.assertRaises(AccessDenied):
            investigate(self.store, self.unassigned, "42")

    def test_denied_cross_tenant_lookup_does_not_expose_records(self):
        # Bob is allowed order 42 only within tenant B, never tenant A.
        response = investigate(self.store, self.b, "42")
        self.assertFalse(any(e["source_event_id"].startswith("a-")
                             for e in response["evidence"]))
        with self.assertRaises(AccessDenied):
            investigate(self.store, self.b, "99")

    def test_exact_duplicate_event_is_noop(self):
        x = event("tenant-a", "carrier", "a-del", "42", 2,
                  "DELIVERED", "2026-10-07T10:20:00Z")
        self.assertFalse(self.store.ingest(x))
        self.assertEqual(len(investigate(self.store, self.a, "42")["evidence"]), 2)

    def test_replay_with_changed_ingest_timestamp_is_same_business_event(self):
        x = event("tenant-a", "carrier", "a-del", "42", 2, "DELIVERED",
                  "2026-10-07T10:20:00Z", "2026-10-07T12:59:00Z")
        self.assertFalse(self.store.ingest(x))

    def test_conflicting_same_event_id_rejected(self):
        with self.assertRaises(ConflictingEvent):
            self.store.ingest(event("tenant-a", "carrier", "a-del", "42", 2,
                                    "HANDED_OFF", "2026-10-07T10:20:00Z"))

    def test_out_of_order_arrival_still_uses_event_time(self):
        self.store.ingest(event("tenant-a", "warehouse", "hand-older", "99", 1,
                                "HANDED_OFF", "2026-10-07T10:00:00Z",
                                "2026-10-07T12:01:00Z"))
        self.store.ingest(event("tenant-a", "carrier", "del-earlier-ingest", "99", 2,
                                "DELIVERED", "2026-10-07T10:15:00Z",
                                "2026-10-07T10:16:00Z"))
        self.assertEqual(investigate(self.store, self.a, "99")["status"], "CONSISTENT")

    def test_missing_handoff_or_delivery_requires_abstention(self):
        self.store.ingest(event("tenant-a", "carrier", "only-del", "99", 1,
                                "DELIVERED", "2026-10-07T12:00:00Z"))
        result = investigate(self.store, self.a, "99")
        self.assertEqual(result["status"], "INSUFFICIENT_EVIDENCE")
        self.assertEqual(len(result["evidence"]), 1)

    def test_missing_order_with_assignment_still_has_no_evidence(self):
        result = investigate(self.store, self.a, "99")
        self.assertEqual(result["status"], "INSUFFICIENT_EVIDENCE")
        self.assertEqual(result["evidence"], [])

    def test_utc_validation_rejects_naive_and_invalid_kind(self):
        with self.assertRaises(ValueError):
            valid_utc("2026-10-07T10:20:00")
        with self.assertRaises(ValueError):
            self.store.ingest(event("tenant-a", "carrier", "other", "99", 1,
                                    "ISSUE_REFUND", "2026-10-07T10:20:00Z"))

    def test_demo_both_tenants_and_deterministic_replay(self):
        results = demo()
        self.assertEqual([x["status"] for x in results], ["ANOMALY", "CONSISTENT"])
        self.assertTrue(all(len(x["evidence"]) == 2 for x in results))


if __name__ == "__main__":
    unittest.main()
