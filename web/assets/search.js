(() => {
  const html = document.documentElement;
  const searchInput = document.getElementById('siteSearch');
  const searchResults = document.getElementById('staticSearchResults');
  if (!searchInput || !searchResults) return;

  let corpusPromise = null;

  const supplementalAssets = [
    ['/chapters/03-hybrid-retrieval-query-routing/', '/assets/ch03-conversational-rag.html'],
    ['/chapters/05-document-pdf-rag/', '/assets/ch05-grounded-document-agent.html'],
    ['/chapters/06-skills-routing/', '/assets/ch06-capability-architecture.html'],
    ['/chapters/08-agent-orchestration/', '/assets/ch08-loop-vs-graph.html'],
    ['/chapters/08-agent-orchestration/', '/assets/ch08-coding-agent-engineering.html'],
    ['/chapters/09-reliability-evaluation-observability/', '/assets/ch09-reliability-control-plane.html'],
    ['/chapters/09-reliability-evaluation-observability/', '/assets/ch09-observability-evals.html'],
    ['/chapters/09-reliability-evaluation-observability/', '/assets/ch09-production-monitoring.html'],
    ['/chapters/09-reliability-evaluation-observability/', '/assets/ch09-sentiment-ab.html'],
    ['/chapters/09-reliability-evaluation-observability/', '/assets/ch09-monitoring-capstone.html'],
    ['/chapters/09-reliability-evaluation-observability/', '/assets/ch09-cost-per-successful-task.html']
  ];

  const currentLanguage = () => html.dataset.lang === 'en' ? 'en' : 'zh';

  const normalizeItem = item => ({
    href: item.href || '/',
    titleZh: item.titleZh || item.titleEn || '',
    titleEn: item.titleEn || item.titleZh || '',
    textZh: item.textZh || item.text || '',
    textEn: item.textEn || item.text || ''
  });

  const cleanText = root => root.textContent.replace(/\s+/g, ' ').trim();

  const extractSupplementText = source => {
    const zhDoc = new DOMParser().parseFromString(source, 'text/html');
    const enDoc = new DOMParser().parseFromString(source, 'text/html');
    enDoc.querySelectorAll('.i18n-text').forEach(element => {
      if (element.dataset.i18nEn != null) element.textContent = element.dataset.i18nEn;
    });
    return {
      textZh: cleanText(zhDoc.body),
      textEn: cleanText(enDoc.body)
    };
  };

  const loadSupplements = () => Promise.allSettled(supplementalAssets.map(async ([href, path]) => {
    const response = await fetch(path, {cache: 'no-cache'});
    if (!response.ok) throw new Error(`${path}: ${response.status}`);
    return {href, ...extractSupplementText(await response.text())};
  })).then(results => results
    .filter(result => result.status === 'fulfilled')
    .map(result => result.value));

  const mergeSupplements = (items, supplements) => {
    const normalized = items.map(normalizeItem);
    const byHref = new Map(normalized.map(item => [item.href, item]));
    supplements.forEach(supplement => {
      const item = byHref.get(supplement.href);
      if (!item) return;
      item.textZh = `${item.textZh} ${supplement.textZh}`.trim();
      item.textEn = `${item.textEn} ${supplement.textEn}`.trim();
    });
    return normalized;
  };

  const loadCorpus = () => {
    if (corpusPromise) return corpusPromise;
    corpusPromise = Promise.all([
      fetch('/search-index.json', {cache: 'no-cache'}).then(response => {
        if (!response.ok) throw new Error(`search-index.json: ${response.status}`);
        return response.json();
      }),
      loadSupplements()
    ]).then(([items, supplements]) => {
      if (!Array.isArray(items)) throw new Error('search-index.json: invalid payload');
      return mergeSupplements(items, supplements);
    });
    return corpusPromise;
  };

  const makeSnippet = (text, query) => {
    const clean = String(text || '').replace(/\s+/g, ' ').trim();
    if (!query) return clean.slice(0, 210) + (clean.length > 210 ? '…' : '');
    const lower = clean.toLowerCase();
    const index = lower.indexOf(query.toLowerCase());
    const start = Math.max(0, index >= 0 ? index - 70 : 0);
    const snippet = clean.slice(start, start + 230);
    return `${start > 0 ? '…' : ''}${snippet}${start + 230 < clean.length ? '…' : ''}`;
  };

  const render = (corpus, query) => {
    const lang = currentLanguage();
    const q = query.trim().toLowerCase();
    const titleKey = lang === 'en' ? 'titleEn' : 'titleZh';
    const textKey = lang === 'en' ? 'textEn' : 'textZh';
    const matches = corpus.filter(item => {
      if (!q) return true;
      return `${item[titleKey]} ${item[textKey]}`.toLowerCase().includes(q);
    }).slice(0, 30);

    searchResults.replaceChildren(...matches.map(item => {
      const link = document.createElement('a');
      link.className = 'search-result';
      link.href = item.href;
      const title = document.createElement('b');
      title.textContent = item[titleKey];
      const snippet = document.createElement('small');
      snippet.textContent = makeSnippet(item[textKey], q);
      link.append(title, snippet);
      return link;
    }));

    if (!matches.length) {
      searchResults.textContent = lang === 'en' ? 'No matching content found.' : '没有找到匹配内容。';
    }
  };

  const runSearch = () => {
    const lang = currentLanguage();
    searchResults.textContent = lang === 'en' ? 'Loading search index…' : '正在加载搜索索引…';
    loadCorpus()
      .then(corpus => render(corpus, searchInput.value))
      .catch(error => {
        console.error('Static search index failed to load', error);
        searchResults.textContent = lang === 'en' ? 'Search is temporarily unavailable.' : '搜索索引暂时不可用。';
      });
  };

  searchInput.addEventListener('input', runSearch);
  document.addEventListener('handbook:languagechange', runSearch);
  runSearch();
})();
