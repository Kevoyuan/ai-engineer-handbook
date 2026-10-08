# FDE Stages 05–06 · ML foundations, evaluation and coding-source verification

**Updated 2026-10-08.** Public [FDE Concepts](https://www.fdeinterviews.com/concepts) supplied topic names, not paid solution text. Questions **Q24–Q39 are original explanations and interview-style prompts**, not official site answer keys. First-party documentation is linked for library-specific behavior; mathematical deductions and fictional business cases are handbook synthesis. The Python mini-lab is a **deterministic educational fixture**, not model training or customer workload verification.

## Phase 05 · ML and evaluation

| Question | Primary owning chapter | Fact/evidence and boundary |
|---|---|---|
| Q24 · Gradient Descent and Learning Rate | CH01 §1.21 | Gradient optimization math; training objective does not prove held-out production improvement |
| Q25 · Bias/variance, regularization, data leakage | CH01 §1.21 | [scikit-learn common pitfalls](https://scikit-learn.org/stable/common_pitfalls.html), [TimeSeriesSplit](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TimeSeriesSplit.html); future data contamination is not repaired by model complexity |
| Q26 · Entropy, CrossEntropy, KL, Perplexity and logsumexp | CH01 §1.21 | [PyTorch CrossEntropyLoss](https://docs.pytorch.org/docs/stable/generated/torch.nn.CrossEntropyLoss.html), [BCEWithLogitsLoss](https://docs.pytorch.org/docs/stable/generated/torch.nn.BCEWithLogitsLoss.html); no model training was executed |
| Q27 · MLP, activation, loss, BatchNorm vs LayerNorm | CH01 §1.21 | [PyTorch LayerNorm](https://docs.pytorch.org/docs/stable/generated/torch.nn.LayerNorm.html), [BatchNorm1d](https://docs.pytorch.org/docs/stable/generated/torch.nn.BatchNorm1d.html); framework-specific axis/optimizer behavior must be version-checked |
| Q28 · Catastrophic forgetting, semi/self-training | CH01 §1.21 | General model/data methodology; no claim that PEFT eliminates forgetting or pseudo-labels are correct |
| Q29 · Convex vs non-convex, CV classification/detection/segmentation | CH01 §1.21 | General mathematical and label-granularity distinctions; no CV benchmark tested |
| Q30 · Precision / Recall / F1 and imbalanced classes | CH09 §9.24 | [scikit-learn precision/recall/F-score](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.precision_recall_fscore_support.html); 99% accuracy / zero recall is a constructed 1000-record counterexample |
| Q31 · Calibration and uncertainty | CH09 §9.24 | [scikit-learn probability calibration](https://scikit-learn.org/stable/modules/calibration.html); a low Brier score does not prove calibration alone |
| Q32 · Synthetic data for golden eval | CH09 §9.24 | First-party [scikit-learn data leakage pitfalls](https://scikit-learn.org/stable/common_pitfalls.html) supports holdout separation; data-generator design is handbook synthesis |
| Q33 · Bandits vs A/B, shadow and canary | CH09 §9.24 | Experiment-architecture synthesis; no online adaptive randomization test, reward analysis or customer approval performed |

## Phase 06 · Coding & Engineering Craft

| Question | Primary owner | First-party behavior to verify |
|---|---|---|
| Q34 · Big-O, Heaps and Top-K | CH11 §11.11 | [Python heapq](https://docs.python.org/3/library/heapq.html): nlargest/nsmallest and heap semantics; bounded eligible candidate selection, not ANN recall guarantee |
| Q35 · Parsing messy CSV | CH11 §11.11 | [Python csv](https://docs.python.org/3/library/csv.html): quoted fields, DictReader and newline contract; sample applies extra validation rules |
| Q36 · Sliding Window and Two Pointers | CH11 §11.11 | Original O(N) sorted-event deque fixture; Spark event-time semantics separately follow [Structured Streaming](https://spark.apache.org/docs/latest/streaming/index.html) |
| Q37 · Concurrency and GIL | CH11 §11.11 | [Python threading](https://docs.python.org/3/library/threading.html), [free-threading](https://docs.python.org/3/howto/free-threading-python.html), [concurrent.futures](https://docs.python.org/3/library/concurrent.futures.html); optional free-threaded builds exist in 3.13+, extension compatibility not universal |
| Q38 · Graph traversal and topological sort | CH08 §8.18 | Deterministic Kahn algorithm implementation and test; dependency cycles blocked before external side effects; not a proof for a real workflow framework |
| Q39 · Dependency injection and tool safety | CH08 §8.18 | [Python unittest.mock](https://docs.python.org/3/library/unittest.mock.html): negative fake confirms no reader call when denied; not a production RLS or SSO penetration test |

## Runnable narrow evidence

Code: [FDE interview engineering mini-lab](../../examples/fde-interview-engineering/). It uses Python stdlib only; covers rare positive-class recall, logsumexp numerical stability, Brier score arithmetic, tenant-scoped top-K, CSV quoting/quarantine, ordered sliding windows, graph DAG validation and policy-injected tool rejection. The CI must execute `python3 -m unittest discover -s tests -v` in the example directory. A green test suite is **not** an ML validation study nor a security certification.

The [complete 167-topic audit](./fde-2026-coverage-audit.md) now records H99/B31/N37 evidence-location grades versus previous H76/B34/N57. **Heading existence is not deep mastery**; newly added owner explanations still require expert review/production exercises where appropriate.

## Release constraint

All additions remain on Draft [PR #70](https://github.com/Kevoyuan/ai-engineer-handbook/pull/70), branch `content/fde-02-04-system-data-audit-20261008`. No `main` merge, `web/site` production asset commit, Vercel deployment or promotion is authorized by this update.
