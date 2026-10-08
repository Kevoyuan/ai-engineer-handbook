"""Runnable negative/positive cases for interview primitives (no third-party deps)."""
import math
import unittest
from datetime import datetime, timezone
from unittest.mock import Mock

from primitives import (
    InvestigationHost, TimedEvent, brier_score, binary_confusion,
    bounded_top_k, classification_scores, parse_orders_csv,
    rolling_failure_counts, stable_logsumexp, topological_sort,
)


def time(hour, minute):
    return datetime(2026, 10, 8, hour, minute, tzinfo=timezone.utc)


class MLEvaluationTests(unittest.TestCase):
    def test_stable_logsumexp_does_not_overflow(self):
        self.assertAlmostEqual(stable_logsumexp([1000, 1000]), 1000 + math.log(2))
        self.assertAlmostEqual(stable_logsumexp([-1000, -1000]),
                               -1000 + math.log(2))

    def test_logsumexp_rejects_empty_and_nonfinite(self):
        for values in ([], [float("nan")], [float("inf")]):
            with self.subTest(values=values):
                with self.assertRaises(ValueError):
                    stable_logsumexp(values)

    def test_99_percent_accuracy_zero_recall_for_rare_violations(self):
        y = [0] * 990 + [1] * 10
        predicted = [0] * 1000
        scores = classification_scores(y, predicted)
        self.assertAlmostEqual(scores["accuracy"], 0.99)
        self.assertEqual(scores["recall"], 0.0)
        self.assertIsNone(scores["precision"])  # denominator undefined
        self.assertIsNone(scores["f1"])

    def test_nonzero_precision_recall_f1(self):
        s = classification_scores([1, 1, 0, 0], [1, 0, 1, 0])
        self.assertEqual((s["tp"], s["fp"], s["tn"], s["fn"]),
                         (1, 1, 1, 1))
        self.assertEqual((s["precision"], s["recall"], s["f1"]),
                         (0.5, 0.5, 0.5))

    def test_invalid_labels_and_length_fail_closed(self):
        for args in (([1], [1, 0]), ([2], [0]), ([], [])):
            with self.subTest(args=args):
                with self.assertRaises(ValueError):
                    binary_confusion(*args)

    def test_brier_score_perfect_and_incorrect(self):
        self.assertEqual(brier_score([0, 1], [0.0, 1.0]), 0.0)
        self.assertEqual(brier_score([0, 1], [1.0, 0.0]), 1.0)
        with self.assertRaises(ValueError):
            brier_score([1], [1.2])


class CodingCraftTests(unittest.TestCase):
    def test_top_k_filters_tenant_before_selection(self):
        candidate_stream = iter([
            (0.999, "tenant-b", "secret"),
            (0.4, "tenant-a", "b"),
            (0.4, "tenant-a", "a"),
            (0.1, "tenant-a", "c"),
        ])
        self.assertEqual(
            bounded_top_k(candidate_stream, 2, allowed_tenant="tenant-a"),
            [(0.4, "a"), (0.4, "b")],
        )

    def test_top_k_validates_scope_and_zero_k(self):
        with self.assertRaises(ValueError):
            bounded_top_k([(1.0, "b", "1")], 1, allowed_tenant="")
        self.assertEqual(bounded_top_k([], 0, allowed_tenant="a"), [])
        with self.assertRaises(ValueError):
            bounded_top_k([], -1, allowed_tenant="a")
        with self.assertRaises(ValueError):
            bounded_top_k([(float("nan"), "a", "bad")], 2,
                          allowed_tenant="a")

    def test_csv_quoted_comma_and_duplicate(self):
        csv_text = (
            'tenant_id,source_event_id,order_id,event_time_utc\n'
            'tenant-a,e-1,"order,42",2026-10-08T11:00:00Z\n'
            'tenant-a,e-1,"order,42",2026-10-08T11:00:00Z\n'
        )
        valid, bad = parse_orders_csv(csv_text)
        self.assertEqual(len(valid), 1)
        self.assertEqual(valid[0]["order_id"], "order,42")
        self.assertEqual(bad, [])

    def test_csv_quarantines_conflict_bad_timestamps_extra_columns(self):
        csv_text = (
            'tenant_id,source_event_id,order_id,event_time_utc\n'
            'tenant-a,e-1,42,2026-10-08T11:00:00Z\n'
            'tenant-a,e-1,99,2026-10-08T11:00:00Z\n'
            'tenant-a,e-2,42,2026-10-08T11:00:00\n'
            'tenant-a,e-3,42,2026-10-08T12:00:00Z,extra\n'
            ',e-4,42,2026-10-08T12:00:00Z\n'
        )
        valid, rejected = parse_orders_csv(csv_text)
        self.assertEqual(len(valid), 1)
        self.assertEqual(len(rejected), 4)
        self.assertTrue(any("conflicting" in x["reason"] for x in rejected))

    def test_csv_rejects_unknown_header(self):
        with self.assertRaises(ValueError):
            parse_orders_csv("tenant,order\na,42\n")

    def test_sliding_window_counts_event_time(self):
        events = [
            TimedEvent(time(10, 0), True),
            TimedEvent(time(10, 14), False),
            TimedEvent(time(10, 16), True),
        ]
        self.assertEqual(rolling_failure_counts(events, 15),
                         [(1, 1), (2, 1), (2, 1)])

    def test_window_rejects_unsorted_event_time(self):
        with self.assertRaises(ValueError):
            rolling_failure_counts([
                TimedEvent(time(10, 20), False),
                TimedEvent(time(10, 10), True),
            ])

    def test_topological_dependencies_hold(self):
        deps = {
            "identity": set(),
            "authorize": {"identity"},
            "read": {"authorize"},
            "explain": {"read"},
        }
        self.assertEqual(topological_sort(deps),
                         ["identity", "authorize", "read", "explain"])

    def test_topological_cycle_and_undeclared_node_fail(self):
        with self.assertRaisesRegex(ValueError, "cycle"):
            topological_sort({"a": {"b"}, "b": {"a"}})
        with self.assertRaisesRegex(ValueError, "undeclared"):
            topological_sort({"a": {"missing"}})

    def test_dependency_injection_denial_skips_reader(self):
        policy, reader = Mock(), Mock()
        policy.can_read.return_value = False
        host = InvestigationHost(reader, policy)
        with self.assertRaises(PermissionError):
            host.investigate("alice", "order-42")
        reader.read_order.assert_not_called()

    def test_dependency_injection_authorized_read_once(self):
        policy, reader = Mock(), Mock()
        policy.can_read.return_value = True
        reader.read_order.return_value = ["e-1", "e-2"]
        result = InvestigationHost(reader, policy).investigate("alice", "42")
        self.assertEqual(result, ["e-1", "e-2"])
        reader.read_order.assert_called_once_with("alice", "42")


if __name__ == "__main__":
    unittest.main()
