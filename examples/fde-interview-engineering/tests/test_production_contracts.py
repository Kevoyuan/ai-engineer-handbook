"""Negative tests for index alias freshness, tenant budget and point-in-time features."""
import unittest
from datetime import datetime, timezone, timedelta

from production_contracts import (
    IndexManifest, IndexRouter, FeatureValue,
    TenantTokenBucket, as_of_feature,
)


def time(hour):
    return datetime(2026, 10, 8, hour, tzinfo=timezone.utc)


class IndexContractsTest(unittest.TestCase):
    def test_cannot_promote_mismatched_query_encoder(self):
        x = IndexRouter(current_acl_revision=2)
        with self.assertRaises(ValueError):
            x.promote(IndexManifest("index-v2", "embed-v2", 2),
                      query_encoder="embed-v1")
        self.assertIsNone(x.active)

    def test_cannot_restore_index_with_revoked_acl(self):
        x = IndexRouter(current_acl_revision=3)
        with self.assertRaises(PermissionError):
            x.promote(IndexManifest("index-old", "embed-v1", 2),
                      query_encoder="embed-v1")

    def test_revocation_invalidates_old_index_alias(self):
        x = IndexRouter(current_acl_revision=1)
        x.promote(IndexManifest("index-a", "embed-a", 1),
                  query_encoder="embed-a")
        self.assertEqual(x.visible(query_encoder="embed-a"), "index-a")
        x.bump_acl(2)
        with self.assertRaises(PermissionError):
            x.visible(query_encoder="embed-a")
        x.promote(IndexManifest("index-b", "embed-b", 2),
                  query_encoder="embed-b")
        self.assertEqual(x.visible(query_encoder="embed-b"), "index-b")

    def test_acl_revision_cannot_move_backwards(self):
        x = IndexRouter(current_acl_revision=5)
        with self.assertRaises(ValueError):
            x.bump_acl(3)


class RateLimitTest(unittest.TestCase):
    def test_tenant_rate_limit_does_not_starve_other_tenant(self):
        x = TenantTokenBucket(capacity=2, tokens_per_second=1)
        self.assertTrue(x.admit("alice-tenant", now=0))
        self.assertTrue(x.admit("alice-tenant", now=0))
        self.assertFalse(x.admit("alice-tenant", now=0))
        self.assertTrue(x.admit("bob-tenant", now=0))
        self.assertTrue(x.admit("alice-tenant", now=1))

    def test_rate_limit_rejects_invalid_times_and_tenants(self):
        x = TenantTokenBucket(capacity=1, tokens_per_second=1)
        with self.assertRaises(ValueError):
            x.admit("", now=1)
        self.assertTrue(x.admit("a", now=1))
        with self.assertRaises(ValueError):
            x.admit("a", now=0)
        with self.assertRaises(ValueError):
            x.admit("a", now=float("nan"))


class TimeAwareFeatureTest(unittest.TestCase):
    def setUp(self):
        self.rows = [
            FeatureValue("tenant-a", "42", time(10), time(10), 100, 1),
            # historical event that arrived after the model decision:
            FeatureValue("tenant-a", "42", time(11), time(15), 999, 2),
            FeatureValue("tenant-a", "42", time(14), time(14), 140, 3),
            FeatureValue("tenant-b", "42", time(9), time(9), 777, 1),
        ]

    def test_future_known_feature_is_not_available_at_prediction_time(self):
        self.assertEqual(
            as_of_feature(self.rows, tenant="tenant-a", entity="42",
                          label_time=time(12), knowledge_time=time(12)),
            100,
        )

    def test_late_arrival_only_visible_when_known_and_effective(self):
        self.assertEqual(
            as_of_feature(self.rows, tenant="tenant-a", entity="42",
                          label_time=time(12), knowledge_time=time(16)),
            999,
        )

    def test_other_tenant_same_entity_id_is_isolated(self):
        self.assertEqual(
            as_of_feature(self.rows, tenant="tenant-b", entity="42",
                          label_time=time(12), knowledge_time=time(12)),
            777,
        )

    def test_missing_feature_is_none_and_naive_time_invalid(self):
        self.assertIsNone(
            as_of_feature(self.rows, tenant="tenant-a", entity="missing",
                          label_time=time(12), knowledge_time=time(12))
        )
        with self.assertRaises(ValueError):
            as_of_feature(self.rows, tenant="tenant-a", entity="42",
                          label_time=datetime(2026, 10, 8, 12),
                          knowledge_time=time(12))


if __name__ == "__main__":
    unittest.main()
