import fs from 'node:fs';
import postcss from 'postcss';
const css=fs.readFileSync('../../web/assets/app.css','utf8')+'\n'+fs.readFileSync('../../web/assets/handbook-interactions.css','utf8');
const ast=postcss.parse(css);
ast.walkAtRules(rule=>{if(['import','font-face','keyframes'].includes(rule.name))rule.remove();});
ast.walkRules(rule=>{
 const selectors=rule.selectors.filter(s=>!s.includes('scrollbar')&&!/(^|[\s,>])(?:html|body|header|aside|main)(?:[\s.#:[>]|$)|:root|#side|#menu|\.skip-link|\.search-page|\.chapter-index|\.page-nav|\.tools|\.brand|\.lang-toggle|\.back-to-top/.test(s));
 if(!selectors.length){rule.remove();return;}
 rule.selectors=selectors.map(s=>'.chapter-body :where('+s.replace(/\[data-theme=dark\]/g,'.dark')+')');
 rule.walkDecls(d=>{if(d.prop.startsWith('font')||d.prop==='line-height')d.important=false;if(d.prop==='font-family')d.value=d.value.includes('Mono')||d.value.includes('monospace')?'var(--font-mono)':'var(--font-sans)';if(['animation','transition'].includes(d.prop))d.value='none';});
 // Legacy presentation carried a dozen near-identical sizes (9, 9.5, 10,
 // 10.5, 11.5, 11.8, 12.5, 12.8, 13.5, 14.5, 15.5, 16.5). Snap body-range
 // sizes onto the six-step ladder so the Reader has a real type hierarchy.
 rule.walkDecls('font-size',d=>{
  const m=/^(\d+(?:\.\d+)?)px$/.exec(d.value);
  if(!m)return;
  const v=parseFloat(m[1]);
  if(v>=18)return;
  const ladder=[11,12,13,14,15,16];
  d.value=ladder.reduce((a,b)=>Math.abs(b-v)<Math.abs(a-v)?b:a)+'px';
 });
});
// The legacy static site carried its own dark palette as a bare token block.
// Scoped into the Reader it becomes a second theme source that overrides the
// semantic tokens whenever load order changes. The runtime owns those tokens.
ast.walkRules(rule=>{
 if(/^\.chapter-body :where\(\.dark\)$/.test(rule.selector))rule.remove();
});
const output='/* Generated topology styles from canonical chapter presentation. Run npm run sync-content. */\n'+ast.toString();
if(/\.chapter-body :where\(\.dark\)\{/.test(output))throw new Error('Legacy dark token block leaked into content-base.css');
const legacyToken=/(--(?:bg|paper|paper2|ink|mut|line2?|grid|blu|org|grn|pur|tea|amb|code-bg|code-ink)):/.exec(output);
if(legacyToken)throw new Error('Legacy palette variable leaked into content-base.css: '+legacyToken[1]);
fs.writeFileSync('src/content-base.css',output);
