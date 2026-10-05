import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import postcss from "postcss";

const project = fileURLToPath(new URL("../", import.meta.url));
const source = fileURLToPath(
  new URL("../../../web/index.html", import.meta.url),
);
const data = JSON.parse(
  execFileSync(
    "python3",
    [
      "-c",
      String.raw`
from bs4 import BeautifulSoup
from pathlib import Path
import json, sys
source = BeautifulSoup(Path(sys.argv[1]).read_text(), 'html.parser')
chapters = json.loads(Path(sys.argv[2]).read_text())
chapter_by_slug = {chapter['slug']: chapter for chapter in chapters}
sections = []
links = {
    '.ae-knowledge': ['02-enterprise-retrieval', '03-hybrid-retrieval-query-routing', '04-rag-reliability-selective-answering', '05-document-pdf-rag'],
    '.ae-state': ['07-memory-context-engineering'],
    '.ae-capabilities': ['06-skills-routing'],
    '.ae-orchestration': ['08-agent-orchestration'],
    '.ae-plane-label': ['09-reliability-evaluation-observability'],
    '.ae-platform': ['01-model-api-context-foundations', '10-serving-deployment-ai-platform']
}
for ident in ['system-framework', 'agent-reference']:
    versions = {}
    for lang in ['zh', 'en']:
        section = BeautifulSoup(str(source.find(id=ident)), 'html.parser')
        for el in section.select('[data-i18n-' + lang + ']'):
            el.string = el['data-i18n-' + lang]
        for selector, indices in links.items():
            node = section.select_one(selector)
            if node is None: continue
            nav = section.new_tag('nav', attrs={'class':'architecture-chapter-links', 'aria-label':'Related chapters' if lang == 'en' else '相关章节'})
            for slug in indices:
                ch = chapter_by_slug[slug]
                a = section.new_tag('a', href='#read/' + ch['slug'])
                a.string = ('CH ' if lang == 'en' else '第 ') + ch['number'] + ('' if lang == 'en' else ' 章') + ' ↗'
                a['title'] = ch[lang]
                nav.append(a)
            node.append(nav)
        for el in section.select('.framework-head > small'):
            el.decompose()
        for el in section.select('.ae-outcome, .ae-domain, .ae-runtime, .ae-control-plane, .ae-platform, .agent-entry, .agent-zone, .agent-core, .agent-validation, .agent-control, .agent-learning, .agent-equation'):
            el['class'] = el.get('class', []) + ['diagram-panel']
        for el in section.select('.ae-kicker, .ae-runtime-head small, .agent-shell small'):
            el['class'] = el.get('class', []) + ['diagram-label']
        for el in section.find_all(True):
            for attr in list(el.attrs):
                if attr.startswith('data-i18n') or attr.startswith('on'): del el[attr]
        versions[lang] = str(section)
    sections.append({'id': ident, **versions})
print(json.dumps({'sections': sections, 'css': source.find('style', id='system-framework-style').get_text()}, ensure_ascii=False))
`,
      source,
      project + "src/chapters.json",
    ],
    { encoding: "utf8" },
  ),
);
fs.writeFileSync(
  project + "src/architecture-content.json",
  JSON.stringify(data.sections, null, 2) + "\n",
);
const css = postcss.parse(data.css);
css.walkRules((rule) => {
  rule.selectors = rule.selectors.map(
    (selector) => ".architecture-overview :where(" + selector + ")",
  );
  rule.walkDecls((declaration) => {
    declaration.important = false;
  });
});
const architectureCssPath = project + "src/architecture-base.css";
const generatedCss =
  "/* Derived from the original system and Agent reference diagrams. */\n" +
  css.toString();
const formatInsensitiveCss = (value) =>
  value
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, "")
    .replace(/;}/g, "}")
    .replace(/(^|[^0-9])0\.(\d+)/g, "$1.$2");
const currentCss = fs.existsSync(architectureCssPath)
  ? fs.readFileSync(architectureCssPath, "utf8")
  : "";
if (
  !currentCss ||
  formatInsensitiveCss(currentCss) !== formatInsensitiveCss(generatedCss)
) {
  fs.writeFileSync(architectureCssPath, generatedCss);
}
console.log("Synced system and Agent reference architectures.");
