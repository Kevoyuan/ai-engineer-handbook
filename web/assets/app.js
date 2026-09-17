(() => {
  const html = document.documentElement;
  const menuBtn = document.getElementById('menuBtn');
  const sideOverlay = document.getElementById('sideOverlay');
  const themeBtn = document.getElementById('themeBtn');
  const langToggle = document.getElementById('langToggle');
  const searchInput = document.getElementById('siteSearch');
  const searchResults = document.getElementById('searchResults');

  const HAN = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/u;
  const textOriginal = new WeakMap();
  const attrOriginal = new WeakMap();
  let residual = {};
  let residualKeys = [];
  let searchCorpusPromise = null;
  let interactionAssetsPromise = null;

  const chapterAdditions = {
    '03-hybrid-retrieval-query-routing': [
      {
        path: '/assets/ch03-conversational-rag.html',
        id: 'conversational-rag'
      }
    ],
    '05-document-pdf-rag': [
      {
        path: '/assets/ch05-grounded-document-agent.html',
        id: 'grounded-document-agent'
      }
    ],
    '06-skills-routing': [
      {
        path: '/assets/ch06-capability-architecture.html',
        id: 'capability-architecture',
        position: 'afterLead'
      }
    ],
    '08-agent-orchestration': [
      {
        path: '/assets/ch08-loop-vs-graph.html',
        id: 'loop-vs-graph'
      },
      {
        path: '/assets/ch08-langchain-vs-langgraph.html',
        id: 'langchain-vs-langgraph'
      },
      {
        path: '/assets/ch08-coding-agent-engineering.html',
        id: 'coding-agent-engineering'
      }
    ],
    '09-reliability-evaluation-observability': [
      {
        path: '/assets/ch09-reliability-control-plane.html',
        id: 'reliability-control-plane',
        position: 'afterLead'
      },
      {
        path: '/assets/ch09-observability-evals.html',
        id: 'observability-durable-evals'
      },
      {
        path: '/assets/ch09-production-monitoring.html',
        id: 'production-monitoring-loop'
      },
      {
        path: '/assets/ch09-sentiment-ab.html',
        id: 'sentiment-ab-monitoring'
      },
      {
        path: '/assets/ch09-monitoring-capstone.html',
        id: 'monitoring-capstone'
      },
      {
        path: '/assets/ch09-cost-per-successful-task.html',
        id: 'cost-per-successful-task'
      }
    ]
  };

  const normalizeEnglishPunctuation = value => value
    .replace(/。/g, '.')
    .replace(/，/g, ', ')
    .replace(/：/g, ': ')
    .replace(/；/g, '; ')
    .replace(/、/g, ' · ')
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .replace(/？/g, '?')
    .replace(/！/g, '!')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/＋/g, '+')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/([,.;:!?])(?=[A-Za-z0-9])/g, '$1 ')
    .replace(/[ \t]{2,}/g, ' ');

  const translateResidual = value => {
    if (!value) return value;
    const leading = value.match(/^\s*/)?.[0] || '';
    const trailing = value.match(/\s*$/)?.[0] || '';
    let core = value.trim();
    if (!core) return value;
    if (residual[core]) core = residual[core];
    else {
      for (const key of residualKeys) {
        if (core.includes(key)) core = core.split(key).join(residual[key]);
      }
    }
    return leading + normalizeEnglishPunctuation(core) + trailing;
  };

  const closeSidebar = open => {
    document.body.classList.toggle('sidebar-open', open);
    menuBtn?.setAttribute('aria-expanded', String(open));
  };

  menuBtn?.addEventListener('click', () => closeSidebar(!document.body.classList.contains('sidebar-open')));
  sideOverlay?.addEventListener('click', () => closeSidebar(false));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeSidebar(false);
  });
  document.querySelectorAll('#side a').forEach(link => link.addEventListener('click', () => closeSidebar(false)));
  document.querySelectorAll('.acc-h').forEach(button => button.addEventListener('click', () => button.parentElement?.classList.toggle('open')));

  html.dataset.theme = localStorage.getItem('hb-theme') || 'light';
  themeBtn?.addEventListener('click', () => {
    html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('hb-theme', html.dataset.theme);
  });

  const rememberAttribute = (element, name) => {
    let record = attrOriginal.get(element);
    if (!record) {
      record = {};
      attrOriginal.set(element, record);
    }
    if (!(name in record)) record[name] = element.getAttribute(name);
    return record[name];
  };

  const translateAttributes = toEnglish => {
    document.querySelectorAll('[aria-label], [placeholder]').forEach(element => {
      for (const name of ['aria-label', 'placeholder']) {
        if (!element.hasAttribute(name)) continue;
        const original = rememberAttribute(element, name);
        if (toEnglish) element.setAttribute(name, translateResidual(original));
        else element.setAttribute(name, original);
      }
    });

    const description = document.querySelector('meta[name="description"]');
    if (description) {
      const original = rememberAttribute(description, 'content');
      description.setAttribute('content', toEnglish ? translateResidual(original) : original);
    }
  };

  const translateRawTextNodes = toEnglish => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || parent.closest('.i18n-text, script, style')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      if (!textOriginal.has(node)) textOriginal.set(node, node.nodeValue);
      const original = textOriginal.get(node);
      node.nodeValue = toEnglish ? translateResidual(original) : original;
    }
  };

  const applyLanguageToRoot = (root, lang) => {
    const toEnglish = lang === 'en';
    root.querySelectorAll?.('.i18n-text').forEach(element => {
      const value = toEnglish ? element.dataset.i18nEn : element.dataset.i18nZh;
      if (value != null) element.textContent = toEnglish ? normalizeEnglishPunctuation(value) : value;
    });

    if (toEnglish) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          const parent = node.parentElement;
          if (!parent || parent.closest('.i18n-text, script, style')) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      });
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(node => { node.nodeValue = translateResidual(node.nodeValue); });
    }
  };

  const currentChapterSlug = () => location.pathname.match(/\/chapters\/([^/]+)/)?.[1] || '';

  const fetchAdditionDocument = async addition => {
    const response = await fetch(addition.path);
    if (!response.ok) throw new Error(`${addition.path}: ${response.status}`);
    const source = await response.text();
    return new DOMParser().parseFromString(source, 'text/html');
  };

  const loadInteractionAssets = () => {
    if (!document.getElementById('handbook-interactions-css')) {
      const link = document.createElement('link');
      link.id = 'handbook-interactions-css';
      link.rel = 'stylesheet';
      link.href = '/assets/handbook-interactions.css';
      document.head.append(link);
    }

    if (interactionAssetsPromise) return interactionAssetsPromise;
    interactionAssetsPromise = new Promise((resolve, reject) => {
      if (window.initHandbookInteractions) {
        resolve();
        return;
      }
      const existing = document.getElementById('handbook-interactions-js');
      if (existing) {
        existing.addEventListener('load', resolve, {once:true});
        existing.addEventListener('error', reject, {once:true});
        return;
      }
      const script = document.createElement('script');
      script.id = 'handbook-interactions-js';
      script.src = '/assets/handbook-interactions.js';
      script.defer = true;
      script.addEventListener('load', resolve, {once:true});
      script.addEventListener('error', reject, {once:true});
      document.head.append(script);
    });
    return interactionAssetsPromise;
  };

  const injectCurrentChapterAddition = async () => {
    const additions = chapterAdditions[currentChapterSlug()] || [];
    if (!additions.length) return;
    for (const addition of additions) {
      if (document.getElementById(addition.id)) continue;
      const doc = await fetchAdditionDocument(addition);
      const fragment = document.createDocumentFragment();
      [...doc.body.children].forEach(node => fragment.append(node));
      const lead = addition.position === 'afterLead' ? document.querySelector('main .ch > .lead') : null;
      const pageNav = document.querySelector('main .page-nav');
      if (lead) lead.after(fragment);
      else if (pageNav) pageNav.before(fragment);
      else document.querySelector('main')?.append(fragment);
    }
    await loadInteractionAssets();
    window.initHandbookInteractions?.();
  };

  const setLanguage = lang => {
    const toEnglish = lang === 'en';
    html.dataset.lang = toEnglish ? 'en' : 'zh';
    html.lang = toEnglish ? 'en' : 'zh-CN';

    document.querySelectorAll('.i18n-text').forEach(element => {
      const value = toEnglish ? element.dataset.i18nEn : element.dataset.i18nZh;
      if (value != null) element.textContent = toEnglish ? normalizeEnglishPunctuation(value) : value;
    });

    const title = document.querySelector('title');
    if (title?.dataset.i18nTitleZh) {
      document.title = toEnglish ? title.dataset.i18nTitleEn : title.dataset.i18nTitleZh;
    }

    translateRawTextNodes(toEnglish);
    translateAttributes(toEnglish);

    if (langToggle) {
      langToggle.textContent = toEnglish ? 'ZH / EN' : '中 / EN';
      langToggle.setAttribute('aria-label', toEnglish ? 'Switch to Chinese' : '中 / EN：切换到英文');
    }

    localStorage.setItem('ai-handbook-lang', toEnglish ? 'en' : 'zh');
    document.dispatchEvent(new CustomEvent('handbook:languagechange', {detail:{lang:toEnglish ? 'en' : 'zh'}}));
    if (searchInput && searchResults) runSearch();
  };

  langToggle?.addEventListener('click', () => setLanguage(html.dataset.lang === 'en' ? 'zh' : 'en'));

  const chapterUrl = item => `/chapters/${item.slug}/`;

  const loadSearchCorpus = () => {
    if (searchCorpusPromise) return searchCorpusPromise;
    searchCorpusPromise = fetch('/chapters.json')
      .then(response => {
        if (!response.ok) throw new Error(`chapters.json: ${response.status}`);
        return response.json();
      })
      .then(async chapters => Promise.all(chapters.map(async item => {
        const response = await fetch(chapterUrl(item));
        if (!response.ok) throw new Error(`${item.slug}: ${response.status}`);
        const source = await response.text();
        const doc = new DOMParser().parseFromString(source, 'text/html');
        const section = doc.querySelector('.ch') || doc.querySelector('main') || doc.body;
        const zhParts = [section.textContent.replace(/\s+/g, ' ').trim()];
        applyLanguageToRoot(section, 'en');
        const enParts = [normalizeEnglishPunctuation(section.textContent.replace(/\s+/g, ' ').trim())];

        const additions = chapterAdditions[item.slug] || [];
        for (const addition of additions) {
          try {
            const additionDoc = await fetchAdditionDocument(addition);
            const additionRoot = additionDoc.body;
            zhParts.push(additionRoot.textContent.replace(/\s+/g, ' ').trim());
            applyLanguageToRoot(additionRoot, 'en');
            enParts.push(normalizeEnglishPunctuation(additionRoot.textContent.replace(/\s+/g, ' ').trim()));
          } catch {
            // Search still works for the base chapter if a supplemental fragment cannot load.
          }
        }

        return {
          href: chapterUrl(item),
          titleZh: `${item.number} ${item.zh}`,
          titleEn: `${item.number} ${item.en}`,
          textZh: zhParts.filter(Boolean).join(' '),
          textEn: enParts.filter(Boolean).join(' ')
        };
      })));
    return searchCorpusPromise;
  };

  const currentSearchLanguage = () => html.dataset.lang === 'en' ? 'en' : 'zh';

  const makeSnippet = (text, query) => {
    const clean = text.replace(/\s+/g, ' ').trim();
    if (!query) return clean.slice(0, 210) + (clean.length > 210 ? '…' : '');
    const lower = clean.toLowerCase();
    const index = lower.indexOf(query.toLowerCase());
    const start = Math.max(0, index >= 0 ? index - 70 : 0);
    const snippet = clean.slice(start, start + 230);
    return `${start > 0 ? '…' : ''}${snippet}${start + 230 < clean.length ? '…' : ''}`;
  };

  const renderSearch = (corpus, query) => {
    const lang = currentSearchLanguage();
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
    if (!searchInput || !searchResults) return;
    const lang = currentSearchLanguage();
    searchResults.textContent = lang === 'en' ? 'Loading search index…' : '正在加载搜索索引…';
    loadSearchCorpus()
      .then(corpus => renderSearch(corpus, searchInput.value))
      .catch(() => {
        searchResults.textContent = lang === 'en' ? 'Search is temporarily unavailable.' : '搜索索引暂时不可用。';
      });
  };

  searchInput?.addEventListener('input', runSearch);

  fetch('/assets/i18n-residuals.json')
    .then(response => {
      if (!response.ok) throw new Error(`i18n-residuals.json: ${response.status}`);
      return response.json();
    })
    .then(map => {
      residual = map;
      residualKeys = Object.keys(residual).sort((a, b) => b.length - a.length);
    })
    .catch(() => {
      // Existing data-i18n attributes still work even if the residual dictionary cannot load.
    })
    .finally(() => {
      injectCurrentChapterAddition()
        .catch(() => {
          // Base chapter remains usable if a supplemental fragment cannot load.
        })
        .finally(() => {
          setLanguage(localStorage.getItem('ai-handbook-lang') || 'zh');
          if (searchInput && searchResults) runSearch();
        });
    });
})();
