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
});
fs.writeFileSync('src/content-base.css','/* Generated topology styles from canonical chapter presentation. Run npm run sync-content. */\n'+ast.toString());
