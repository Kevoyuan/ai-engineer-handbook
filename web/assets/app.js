(() => {
  const html = document.documentElement;
  const menuBtn = document.getElementById('menuBtn');
  const sideOverlay = document.getElementById('sideOverlay');
  const themeBtn = document.getElementById('themeBtn');
  const langToggle = document.getElementById('langToggle');

  const textOriginal = new WeakMap();
  const attrOriginal = new WeakMap();
  let residual = {};
  let residualKeys = [];
  let interactionAssetsPromise = null;
  let chapterAdditionsPromise = null;

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
        element.setAttribute(name, toEnglish ? translateResidual(original) : original);
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

  const currentChapterSlug = () => location.pathname.match(/\/chapters\/([^/]+)/)?.[1] || '';

  const loadChapterAdditions = () => {
    if (chapterAdditionsPromise) return chapterAdditionsPromise;
    chapterAdditionsPromise = fetch('/assets/chapter-additions.json', {cache: 'no-cache'})
      .then(response => {
        if (!response.ok) throw new Error(`chapter-additions.json: ${response.status}`);
        return response.json();
      })
      .then(value => value && typeof value === 'object' ? value : {});
    return chapterAdditionsPromise;
  };

  const fetchAdditionDocument = async addition => {
    const response = await fetch(addition.path, {cache: 'no-cache'});
    if (!response.ok) throw new Error(`${addition.path}: ${response.status}`);
    return new DOMParser().parseFromString(await response.text(), 'text/html');
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
        existing.addEventListener('load', resolve, {once: true});
        existing.addEventListener('error', reject, {once: true});
        return;
      }

      const script = document.createElement('script');
      script.id = 'handbook-interactions-js';
      script.src = '/assets/handbook-interactions.js';
      script.defer = true;
      script.addEventListener('load', resolve, {once: true});
      script.addEventListener('error', reject, {once: true});
      document.head.append(script);
    });
    return interactionAssetsPromise;
  };

  const injectCurrentChapterAdditions = async () => {
    const slug = currentChapterSlug();
    if (!slug) return;

    const manifest = await loadChapterAdditions();
    const additions = Array.isArray(manifest[slug]) ? manifest[slug] : [];
    if (!additions.length) return;

    for (const addition of additions) {
      if (!addition?.path || !addition?.id || document.getElementById(addition.id)) continue;

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
    document.dispatchEvent(new CustomEvent('handbook:languagechange', {detail: {lang: toEnglish ? 'en' : 'zh'}}));
  };

  langToggle?.addEventListener('click', () => setLanguage(html.dataset.lang === 'en' ? 'zh' : 'en'));

  fetch('/assets/i18n-residuals.json', {cache: 'no-cache'})
    .then(response => {
      if (!response.ok) throw new Error(`i18n-residuals.json: ${response.status}`);
      return response.json();
    })
    .then(map => {
      residual = map;
      residualKeys = Object.keys(residual).sort((a, b) => b.length - a.length);
    })
    .catch(() => {
      // Explicit data-i18n attributes still work if the residual dictionary is unavailable.
    })
    .finally(() => {
      injectCurrentChapterAdditions()
        .catch(error => {
          console.error('Chapter additions failed to load', error);
          // Base chapter remains usable if a presentation fragment cannot load.
        })
        .finally(() => {
          setLanguage(localStorage.getItem('ai-handbook-lang') || 'zh');
        });
    });
})();
