import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const webRoot = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.dirname(webRoot);
const errors = [];

const exists = absolutePath => fs.existsSync(absolutePath);
const read = absolutePath => fs.readFileSync(absolutePath, 'utf8');
const fail = message => errors.push(message);

const canonicalChapters = [
  '00-ai-engineer-system-framework.md',
  '02-enterprise-retrieval.md',
  '03-hybrid-retrieval-query-routing.md',
  '04-rag-reliability-selective-answering.md',
  '05-document-pdf-rag.md',
  '06-skills-routing.md',
  '07-memory-context-engineering.md',
  '08-agent-orchestration.md',
  '09-reliability-evaluation-observability.md'
];

const retiredSupplements = [
  '03-conversational-rag.md',
  '08-coding-agent-engineering.md',
  '08-langchain-vs-langgraph.md',
  '09-production-monitoring.md',
  '09-user-sentiment-ab-testing.md',
  '09-security-monitoring.md',
  '09-production-monitoring-capstone.md'
];

const chapterDir = path.join(repoRoot, 'handbook', 'chapters');
for (const file of canonicalChapters) {
  const target = path.join(chapterDir, file);
  if (!exists(target)) fail(`Missing canonical semantic chapter: handbook/chapters/${file}`);
}
for (const file of retiredSupplements) {
  if (exists(path.join(chapterDir, file))) fail(`Retired duplicate semantic owner returned: handbook/chapters/${file}`);
}

const legacyAggregate = path.join(repoRoot, 'handbook', 'ai_engineer_handbook.md');
if (!exists(legacyAggregate)) {
  fail('Missing handbook/ai_engineer_handbook.md compatibility entry point.');
} else {
  const legacy = read(legacyAggregate);
  if (!/compatibility/i.test(legacy) || !/Do not add or edit handbook knowledge here/i.test(legacy)) {
    fail('handbook/ai_engineer_handbook.md no longer looks like a compatibility-only entry point.');
  }
  if (legacy.length > 12000) {
    fail('handbook/ai_engineer_handbook.md is growing into a second aggregate semantic manuscript.');
  }
}

if (exists(path.join(webRoot, 'DESIGN.md'))) {
  fail('web/DESIGN.md must not exist; root DESIGN.md is the only design contract.');
}
if (!exists(path.join(repoRoot, 'DESIGN.md'))) {
  fail('Missing root DESIGN.md presentation contract.');
}

const manifestPath = path.join(webRoot, 'assets', 'chapter-additions.json');
let manifest = {};
try {
  manifest = JSON.parse(read(manifestPath));
} catch (error) {
  fail(`Cannot parse web/assets/chapter-additions.json: ${error.message}`);
}

const chaptersJsonPath = path.join(webRoot, 'chapters.json');
let chapters = [];
try {
  chapters = JSON.parse(read(chaptersJsonPath));
} catch (error) {
  fail(`Cannot parse web/chapters.json: ${error.message}`);
}

const chapterSlugs = new Set(chapters.map(chapter => chapter.slug));
const semanticByWebSlug = {
  '02-enterprise-retrieval': '02-enterprise-retrieval.md',
  '03-hybrid-retrieval-query-routing': '03-hybrid-retrieval-query-routing.md',
  '04-rag-reliability-selective-answering': '04-rag-reliability-selective-answering.md',
  '05-document-pdf-rag': '05-document-pdf-rag.md',
  '06-skills-routing': '06-skills-routing.md',
  '07-memory-context-engineering': '07-memory-context-engineering.md',
  '08-agent-orchestration': '08-agent-orchestration.md',
  '09-reliability-evaluation-observability': '09-reliability-evaluation-observability.md'
};

for (const chapter of chapters) {
  const semanticFile = semanticByWebSlug[chapter.slug];
  if (!semanticFile) fail(`Web chapter has no canonical semantic mapping: ${chapter.slug}`);
  else if (!exists(path.join(chapterDir, semanticFile))) fail(`Web chapter ${chapter.slug} maps to missing handbook/chapters/${semanticFile}`);
}

const extractIds = source => [...source.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map(match => match[1]);
const assertUniqueIds = (label, sources) => {
  const seen = new Map();
  for (const {origin, source} of sources) {
    for (const id of extractIds(source)) {
      if (seen.has(id)) fail(`Duplicate id="${id}" in ${label}: ${seen.get(id)} and ${origin}`);
      else seen.set(id, origin);
    }
  }
};

for (const [slug, additions] of Object.entries(manifest)) {
  if (!chapterSlugs.has(slug)) fail(`Fragment manifest references unknown chapter slug: ${slug}`);
  if (!Array.isArray(additions)) {
    fail(`Fragment manifest entry must be an array: ${slug}`);
    continue;
  }

  const pagePath = path.join(webRoot, 'chapters', slug, 'index.html');
  const pageSources = [];
  if (!exists(pagePath)) fail(`Missing chapter page for manifest slug: web/chapters/${slug}/index.html`);
  else pageSources.push({origin: `chapters/${slug}/index.html`, source: read(pagePath)});

  const manifestIds = new Set();
  for (const addition of additions) {
    if (!addition || typeof addition.path !== 'string' || typeof addition.id !== 'string') {
      fail(`Invalid fragment descriptor in ${slug}; each entry needs path and id.`);
      continue;
    }
    if (manifestIds.has(addition.id)) fail(`Duplicate manifest id in ${slug}: ${addition.id}`);
    manifestIds.add(addition.id);

    if (!addition.path.startsWith('/assets/')) {
      fail(`Fragment path must live under /assets/: ${addition.path}`);
      continue;
    }

    const relative = addition.path.replace(/^\//, '');
    const target = path.join(webRoot, ...relative.split('/'));
    if (!exists(target)) {
      fail(`Manifest fragment does not exist: ${addition.path}`);
      continue;
    }

    const source = read(target);
    const ids = new Set(extractIds(source));
    if (!ids.has(addition.id)) fail(`Manifest id "${addition.id}" not found in ${addition.path}`);
    pageSources.push({origin: relative, source});
  }

  assertUniqueIds(`rendered chapter ${slug}`, pageSources);
}

for (const slug of Object.keys(manifest)) {
  if (!chapterSlugs.has(slug)) continue;
}

const htmlFiles = [];
const walkHtml = directory => {
  for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) walkHtml(target);
    else if (entry.isFile() && entry.name.endsWith('.html')) htmlFiles.push(target);
  }
};
walkHtml(webRoot);

for (const file of htmlFiles) {
  assertUniqueIds(path.relative(webRoot, file), [{origin: path.relative(webRoot, file), source: read(file)}]);
}

const isExternalReference = value => /^(?:[a-z]+:)?\/\//i.test(value)
  || /^(?:mailto:|tel:|data:|javascript:)/i.test(value)
  || value.startsWith('#');

const resolveLocalReference = (file, rawValue) => {
  const value = rawValue.split('#')[0].split('?')[0];
  if (!value || isExternalReference(value)) return null;

  let target;
  if (value.startsWith('/')) target = path.join(webRoot, value.slice(1));
  else target = path.resolve(path.dirname(file), value);

  if (value.endsWith('/')) target = path.join(target, 'index.html');
  return target;
};

for (const file of htmlFiles) {
  const source = read(file);
  for (const match of source.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/gi)) {
    const reference = match[1];
    const target = resolveLocalReference(file, reference);
    if (!target) continue;
    if (!exists(target)) fail(`Broken local reference in ${path.relative(webRoot, file)}: ${reference}`);
  }
}

for (const slug of chapterSlugs) {
  if (!exists(path.join(webRoot, 'chapters', slug, 'index.html'))) {
    fail(`chapters.json points to missing page: web/chapters/${slug}/index.html`);
  }
}

if (errors.length) {
  console.error(`Structural audit failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const fragmentCount = Object.values(manifest).reduce((sum, additions) => sum + (Array.isArray(additions) ? additions.length : 0), 0);
console.log(`PASS: ${canonicalChapters.length} canonical semantic modules, ${chapters.length} web chapters, ${fragmentCount} registered fragments, ${htmlFiles.length} HTML files; no duplicate IDs or broken local references found.`);
