# FDE ML Evaluation + Coding Craft — runnable mini-lab

Independent educational fixtures supporting CH01 §1.22, CH09 §9.24, CH11 §11.11 and CH08 §8.18. These are **not** copied FDEInterviews answer keys, customer data, production security controls, trained ML models or benchmark results.

## Run with Python 3 standard library

~~~~bash
cd examples/fde-interview-engineering
python3 -m unittest discover -s tests -v
~~~~

The tests are intentionally **positive and negative** rather than just happy paths. They cover:

- 99% accuracy but zero recall on a synthetic rare security violation class; undefined precision is explicitly represented as `None`.
- Stable log-sum-exp for logits around +1000/-1000 and rejection of NaN/Inf.
- Brier score arithmetic on known probabilities (not an evaluation of calibration quality from data).
- Tenant-authorized Top-K with deterministic tie breaking, and no “global top-k then ACL filter” mistake.
- Python csv.DictReader handling quoted commas, idempotent events, conflicting IDs, invalid timestamps, malformed extra fields and schema mismatch.
- Sorted event-time sliding window, late/out-of-order rejection. It does not implement Apache Spark watermarks.
- Deterministic DAG topological order; reject cycles and unknown dependencies **before scheduling side effects**.
- Dependency-injected policy fake proves a denied request calls the data reader zero times; this is **not** a test of a real SSO or database RLS implementation.

## Stage 07 production contract tests

Run the same unittest command to additionally validate version-pinned index promotion, fail-closed ACL revision invalidation, independent tenant rate-limit budget and bitemporal Feature Store lookups. The Python code in `production_contracts.py` is a **toy deterministic simulation**, not a real vector store, API gateway or Databricks Feature Store. Its negative tests prove the **declared teaching invariants only**.

## Read the canonical explanations

- CH01 §1.22 — Gradient Descent, Bias/Variance, Overfitting, Information Theory, Loss/Activation/Norm, Semi-supervised learning, Forgetting, Optimization and Vision tasks.
- CH09 §9.24 — Precision/Recall/F1 for class imbalance, uncertainty calibration, synthetic eval leakage, bandit vs A/B choices.
- CH11 §11.11 — Big-O, Heap Top-K, messy CSV, two-pointer windows, Python GIL/concurrency.
- CH08 §8.18 — BFS/DFS versus topological scheduling, dependency injection and permission fakes.

## Meaning and boundaries

**Unit test pass does not validate deployed ML model performance, the probability calibration of LLM self-confidence, real tenant isolation, SQL/Databricks execution or production thread scaling.** All current examples are deterministic stdlib teaching logic. Primary product behavior is linked at the end of the owning Handbook chapters.

To avoid non-reproducible customer claims, the 99% accuracy counterexample is precisely: 990 negatives, 10 positives, predict negative for all, accuracy = 990/1000 and recall of the positive class = 0/10. It is a constructed example, not a measured classifier.

## First-party references

- [scikit-learn precision/recall](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.precision_recall_fscore_support.html), [calibration](https://scikit-learn.org/stable/modules/calibration.html), [data leakage](https://scikit-learn.org/stable/common_pitfalls.html)
- [PyTorch CrossEntropyLoss](https://docs.pytorch.org/docs/stable/generated/torch.nn.CrossEntropyLoss.html), [BCEWithLogitsLoss](https://docs.pytorch.org/docs/stable/generated/torch.nn.BCEWithLogitsLoss.html)
- [Python heapq](https://docs.python.org/3/library/heapq.html), [csv](https://docs.python.org/3/library/csv.html), [threading](https://docs.python.org/3/library/threading.html), [concurrent.futures](https://docs.python.org/3/library/concurrent.futures.html)

All code and docs are retained in a **Draft GitHub branch until an explicit release request**. No Vercel promotion is part of this work.
