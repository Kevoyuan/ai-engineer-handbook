import fs from 'node:fs';
import crypto from 'node:crypto';

const residual = JSON.parse(fs.readFileSync('assets/i18n-residuals.json', 'utf8'));
const residualKeys = Object.keys(residual).sort((a, b) => b.length - a.length);
const slugs = fs.readdirSync('chapters').sort();

const decode = value => value
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&nbsp;/g, ' ');

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
  let core = decode(value).replace(/\s+/g, ' ').trim();
  if (!core) return '';
  if (residual[core]) core = residual[core];
  else {
    for (const key of residualKeys) {
      if (core.includes(key)) core = core.split(key).join(residual[key]);
    }
  }
  return normalizeEnglishPunctuation(core);
};

const englishTextFromHtml = source => {
  let content = source
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<span\b([^>]*\bclass="[^"]*\bi18n-text\b[^"]*"[^>]*)>([\s\S]*?)<\/span>/gi,
      (all, attrs) => {
        const match = attrs.match(/data-i18n-en="([^"]*)"/i);
        return match ? normalizeEnglishPunctuation(decode(match[1])) : all;
      })
    .replace(/<[^>]+>/g, '\n');
  return content.split(/\n+/).map(translateResidual).filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
};

const strip = value => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const items = slugs.map(slug => {
  const html = fs.readFileSync(`chapters/${slug}/index.html`, 'utf8');
  const title = html.match(/<title[^>]*data-i18n-title-zh="([^"]+)" data-i18n-title-en="([^"]+)"/);
  return {
    slug,
    number: slug.slice(0, 2),
    zh: title[1].replace(' · AI 工程手册', ''),
    en: title[2].replace(' · AI Engineering Handbook', ''),
    html
  };
});

fs.writeFileSync('chapters.json', JSON.stringify(items.map(({html, ...item}) => item), null, 2));

const span = (zh, en) => `<span class="i18n-text" data-i18n-zh="${zh}" data-i18n-en="${en}">${zh}</span>`;
const asset = name => `/assets/${name}?v=${crypto.createHash('sha256').update(fs.readFileSync('assets/' + name)).digest('hex').slice(0, 12)}`;
const nav = current => `<aside id="side" aria-label="章节导航"><div class="sd-h"><a href="/">AI ENGINEERING</a><span>8 CHAPTERS</span></div><nav aria-label="手册章节">${items.map(c => `<a href="/chapters/${c.slug}/"${current === c.slug ? ' aria-current="page"' : ''}><i>${c.number}</i>${span(c.zh, c.en)}</a>`).join('')}</nav><div class="sd-f">${span('原章号 02–09', 'Original chapters 02–09')}</div></aside>`;

const files = ['index.html', 'search/index.html', '404.html', ...items.map(c => `chapters/${c.slug}/index.html`)];
for (const file of files) {
  const c = items.find(x => file === `chapters/${x.slug}/index.html`);
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(/<aside[\s\S]*?<\/aside>/, nav(c?.slug));
  html = html.replace(/<link rel="stylesheet"[^>]+>\s*/g, '');
  html = html.replace('</head>', `${c ? `<link rel="stylesheet" href="${asset('app.css')}">` : ''}<link rel="stylesheet" href="${asset('home.css')}"><link rel="stylesheet" href="${asset('reader.css')}"></head>`);
  html = html.replace(/<script src="\/assets\/app.js[^\"]*" defer>/, `<script src="${asset('app.js')}" defer>`);
  html = html.replace(/<span id="curCh">[\s\S]*?<\/span>(?=<div class="tools">)/, `<span id="curCh">${c ? span(c.zh, c.en) : span('AI 工程手册', 'AI Engineering Handbook')}</span>`);

  if (c) {
    html = html.replace(/<h1 class="ch-t">[\s\S]*?<\/h1>/, `<h1 class="ch-t">${span(c.zh, c.en)}</h1>`);
    html = html.replace(/(<div class="ch-no"><small>CHAPTER<\/small>)\d+/, `$1${c.number}`);
    const i = items.indexOf(c), prev = items[i - 1], next = items[i + 1];
    const previousLink = prev
      ? `<a href="/chapters/${prev.slug}/">← ${prev.number} ${span(prev.zh, prev.en)}</a>`
      : `<a href="/">${span('← 目录', '← Contents')}</a>`;
    const nextLink = next
      ? `<a href="/chapters/${next.slug}/">${next.number} ${span(next.zh, next.en)} →</a>`
      : `<a href="/">${span('目录 →', 'Contents →')}</a>`;
    html = html.replace(/<nav class="page-nav"[\s\S]*?<\/nav>/, `<nav class="page-nav" aria-label="章节翻页">${previousLink}${nextLink}</nav>`);
  } else if (file === 'index.html') {
    html = html.replace(/<div class="chapter-grid">[\s\S]*?<\/div><\/section>/, `<div class="chapter-grid">${items.map(c => `<a class="chapter-card" href="/chapters/${c.slug}/"><span>${c.number}</span><h2>${span(c.zh, c.en)}</h2><b>${span('阅读本章 →', 'Read chapter →')}</b></a>`).join('')}</div></section>`);
    html = html.replace(/大厂题库 \/ /g, '').replace(/Big-tech Question Banks \/ /g, '').replace(/工程化答题体系/g, 'AI 工程实践体系');
  }

  fs.writeFileSync(file, html);
}

const searchIndex = items.map(c => {
  const section = c.html.match(/<section class="ch"[\s\S]*?<\/main>/)?.[0] || c.html;
  return {
    titleZh: `${c.number} ${c.zh}`,
    titleEn: `${c.number} ${c.en}`,
    href: `/chapters/${c.slug}/`,
    textZh: strip(section),
    textEn: englishTextFromHtml(section)
  };
});
fs.writeFileSync('search-index.json', JSON.stringify(searchIndex));

console.log('Unified 11 pages, eight chapter identities, bilingual search text, shared navigation, and reading design.');
