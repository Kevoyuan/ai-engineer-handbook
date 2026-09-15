(() => {
  const lang = () => document.documentElement.dataset.lang === 'en' ? 'en' : 'zh';

  const copy = {
    zh: {
      loopTitle: 'Bounded Agent Loop',
      loopDesc: '当前任务仍然适合单个可控循环：共享上下文、明确验证、显式停止条件。先把 Loop 做稳，不要为了“更高级”而上 Graph。',
      gatedTitle: 'Bounded Loop + Deterministic Gates',
      gatedDesc: '已经出现轻量结构边界，但还不需要完整 Graph。优先加确定性 Gate、审批点或 checkpoint，让单个 Loop 的状态与风险边界更明确。',
      graphTitle: 'State Graph with Bounded Work Units',
      graphDesc: '协调复杂度已经超过单个 Loop：用显式节点和边表达 branch / join、权限边界、checkpoint、独立恢复或 human approval。节点可以是确定性步骤，也可以是 Agent Loop。',
      score: '结构信号',
      perAttempt: '单次尝试成本',
      perTask: '单任务成本',
      perSuccess: '成功任务成本',
      efficient: '高效路由',
      retryTrap: '低价模型重试陷阱',
      balanced: '平衡方案'
    },
    en: {
      loopTitle: 'Bounded Agent Loop',
      loopDesc: 'The task still fits one controllable loop: shared context, clear verification, and an explicit stopping condition. Stabilize the loop before adding graph complexity.',
      gatedTitle: 'Bounded Loop + Deterministic Gates',
      gatedDesc: 'A light structural boundary has appeared, but a full graph is not yet necessary. Add deterministic gates, approval points, or checkpoints first.',
      graphTitle: 'State Graph with Bounded Work Units',
      graphDesc: 'Coordination complexity now exceeds one loop. Use explicit nodes and edges for branch / join, permission boundaries, checkpoints, independent recovery, or human approval. A node may be deterministic work or an agent loop.',
      score: 'structural signals',
      perAttempt: 'Cost / attempt',
      perTask: 'Cost / task',
      perSuccess: 'Cost / successful task',
      efficient: 'Efficient routing',
      retryTrap: 'Cheap-model retry trap',
      balanced: 'Balanced'
    }
  };

  const money = value => `$${value < 0.01 ? value.toFixed(4) : value.toFixed(3)}`;

  function initArchitectureExplorer() {
    const root = document.querySelector('[data-architecture-explorer]');
    if (!root) return;
    if (root.dataset.ready === 'true') {
      root._update?.();
      return;
    }
    root.dataset.ready = 'true';

    const checks = [...root.querySelectorAll('input[data-arch-signal]')];
    const title = root.querySelector('[data-arch-title]');
    const desc = root.querySelector('[data-arch-desc]');
    const scoreEl = root.querySelector('[data-arch-score]');
    const reset = root.querySelector('[data-arch-reset]');

    const update = () => {
      const selected = checks.filter(input => input.checked);
      const score = selected.reduce((sum, input) => sum + Number(input.dataset.weight || 1), 0);
      const c = copy[lang()];
      let mode = 'loop';
      let resultTitle = c.loopTitle;
      let resultDesc = c.loopDesc;

      if (score === 1) {
        mode = 'gated';
        resultTitle = c.gatedTitle;
        resultDesc = c.gatedDesc;
      } else if (score >= 2) {
        mode = 'graph';
        resultTitle = c.graphTitle;
        resultDesc = c.graphDesc;
      }

      root.dataset.mode = mode;
      if (title) title.textContent = resultTitle;
      if (desc) desc.textContent = resultDesc;
      if (scoreEl) scoreEl.textContent = `${selected.length} ${c.score}`;
    };

    checks.forEach(input => input.addEventListener('change', update));
    reset?.addEventListener('click', () => {
      checks.forEach(input => { input.checked = false; });
      update();
      checks[0]?.focus();
    });

    root._update = update;
    update();
  }

  function initCostSimulator() {
    const root = document.querySelector('[data-cost-simulator]');
    if (!root) return;
    if (root.dataset.ready === 'true') {
      root._update?.();
      return;
    }
    root.dataset.ready = 'true';

    const tokens = root.querySelector('[data-cost-tokens]');
    const price = root.querySelector('[data-cost-price]');
    const attempts = root.querySelector('[data-cost-attempts]');
    const success = root.querySelector('[data-cost-success]');
    const outputs = {
      tokens: root.querySelector('[data-out-tokens]'),
      price: root.querySelector('[data-out-price]'),
      attempts: root.querySelector('[data-out-attempts]'),
      success: root.querySelector('[data-out-success]'),
      perAttempt: root.querySelector('[data-cost-per-attempt]'),
      perTask: root.querySelector('[data-cost-per-task]'),
      perSuccess: root.querySelector('[data-cost-per-success]'),
      liveTokens: root.querySelector('[data-live-tokens]'),
      liveRate: root.querySelector('[data-live-rate]'),
      liveOutcome: root.querySelector('[data-live-outcome]')
    };
    const bars = {
      attempt: root.querySelector('[data-bar-attempt]'),
      task: root.querySelector('[data-bar-task]'),
      success: root.querySelector('[data-bar-success]')
    };
    const barLabels = {
      attempt: root.querySelector('[data-bar-label-attempt]'),
      task: root.querySelector('[data-bar-label-task]'),
      success: root.querySelector('[data-bar-label-success]')
    };
    const metricLabels = {
      attempt: root.querySelector('[data-label-attempt]'),
      task: root.querySelector('[data-label-task]'),
      success: root.querySelector('[data-label-success]')
    };
    const presets = [...root.querySelectorAll('[data-cost-preset]')];

    const values = () => ({
      tokens: Number(tokens?.value || 0),
      price: Number(price?.value || 0),
      attempts: Number(attempts?.value || 1),
      success: Number(success?.value || 1) / 100
    });

    const update = () => {
      const v = values();
      const c = copy[lang()];
      const perAttempt = (v.tokens / 1_000_000) * v.price;
      const perTask = perAttempt * v.attempts;
      const perSuccess = perTask / Math.max(v.success, 0.01);
      const scale = Math.max(perSuccess, perTask, perAttempt, 0.01);

      if (outputs.tokens) outputs.tokens.textContent = `${Math.round(v.tokens / 1000)}k`;
      if (outputs.price) outputs.price.textContent = `$${v.price.toFixed(2)}/1M`;
      if (outputs.attempts) outputs.attempts.textContent = `${v.attempts.toFixed(1)}×`;
      if (outputs.success) outputs.success.textContent = `${Math.round(v.success * 100)}%`;
      if (outputs.perAttempt) outputs.perAttempt.textContent = money(perAttempt);
      if (outputs.perTask) outputs.perTask.textContent = money(perTask);
      if (outputs.perSuccess) outputs.perSuccess.textContent = money(perSuccess);
      if (outputs.liveTokens) outputs.liveTokens.textContent = `${Math.round(v.tokens / 1000)}k tokens × ${v.attempts.toFixed(1)} attempts`;
      if (outputs.liveRate) outputs.liveRate.textContent = `$${v.price.toFixed(2)} / 1M tokens`;
      if (outputs.liveOutcome) outputs.liveOutcome.textContent = `${Math.round(v.success * 100)}% success → ${money(perSuccess)}`;

      if (bars.attempt) bars.attempt.style.width = `${Math.max(4, perAttempt / scale * 100)}%`;
      if (bars.task) bars.task.style.width = `${Math.max(4, perTask / scale * 100)}%`;
      if (bars.success) bars.success.style.width = `${Math.max(4, perSuccess / scale * 100)}%`;
      if (barLabels.attempt) barLabels.attempt.textContent = money(perAttempt);
      if (barLabels.task) barLabels.task.textContent = money(perTask);
      if (barLabels.success) barLabels.success.textContent = money(perSuccess);

      if (metricLabels.attempt) metricLabels.attempt.textContent = c.perAttempt;
      if (metricLabels.task) metricLabels.task.textContent = c.perTask;
      if (metricLabels.success) metricLabels.success.textContent = c.perSuccess;
    };

    const presetValues = {
      efficient: {tokens: 35000, price: 1.2, attempts: 1.2, success: 92},
      retryTrap: {tokens: 55000, price: 0.45, attempts: 3.4, success: 68},
      balanced: {tokens: 45000, price: 1.8, attempts: 1.4, success: 88}
    };

    presets.forEach(button => button.addEventListener('click', () => {
      const preset = presetValues[button.dataset.costPreset];
      if (!preset) return;
      tokens.value = String(preset.tokens);
      price.value = String(preset.price);
      attempts.value = String(preset.attempts);
      success.value = String(preset.success);
      presets.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      update();
    }));

    [tokens, price, attempts, success].forEach(input => input?.addEventListener('input', () => {
      presets.forEach(button => button.setAttribute('aria-pressed', 'false'));
      update();
    }));

    root._update = update;
    update();
  }

  function refreshPresetLabels() {
    const c = copy[lang()];
    const labels = {
      efficient: c.efficient,
      retryTrap: c.retryTrap,
      balanced: c.balanced
    };
    document.querySelectorAll('[data-cost-preset]').forEach(button => {
      if (labels[button.dataset.costPreset]) button.textContent = labels[button.dataset.costPreset];
    });
  }

  function init() {
    initArchitectureExplorer();
    initCostSimulator();
    refreshPresetLabels();
  }

  window.initHandbookInteractions = init;
  document.addEventListener('handbook:languagechange', init);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
