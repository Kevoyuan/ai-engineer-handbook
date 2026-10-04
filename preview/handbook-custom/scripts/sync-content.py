"""Derive the complete preview from canonical web chapters, including registered supplements."""
from pathlib import Path
from bs4 import BeautifulSoup, NavigableString
import json,re,shutil
root=Path(__file__).resolve().parents[3]; project=Path(__file__).resolve().parents[1]; web=root/'web'
chapters=json.loads((web/'chapters.json').read_text()); additions=json.loads((web/'assets/chapter-additions.json').read_text()); residual=json.loads((web/'assets/i18n-residuals.json').read_text()); search=[]; report=[]
def english(soup):
 for el in soup.select('[data-i18n-en]'): el.clear();el.append(el['data-i18n-en'])
 for text in list(soup.find_all(string=True)):
  if text.parent.name in ['style','script'] or text.parent.has_attr('data-i18n-en'):continue
  value=str(text)
  for k in sorted(residual,key=len,reverse=True):
   if k in value:value=value.replace(k,residual[k])
  text.replace_with(value)
 for el in soup.select('[aria-label], [title], [placeholder]'):
  for attr in ['aria-label','title','placeholder']:
   if el.get(attr) in residual:el[attr]=residual[el[attr]]
   elif el.get(attr)=='可横向滚动的对比表':el[attr]='Scrollable comparison table'
   elif el.get(attr)=='代码示例':el[attr]='Code example'
 return soup
for chapter in chapters:
 slug=chapter['slug']; soup=BeautifulSoup((web/'chapters'/slug/'index.html').read_text(),'html.parser');main=soup.select_one('main');body=BeautifulSoup(str(main),'html.parser');main=body.select_one('main'); main.name='div';main.attrs={}
 source_text=main.get_text(' ',strip=True)
 for el in main.select('.ch-head,.interp-strip,.page-nav,script,style'):el.decompose()
 for extra in additions.get(slug,[]):
  fragment=BeautifulSoup((web/extra['path'].lstrip('/')).read_text(),'html.parser')
  nodes=list(fragment.contents);lead=main.select_one('.ch > .lead')
  if extra.get('position')=='afterLead' and lead:
   for node in reversed(nodes):lead.insert_after(node)
  else:
   for node in nodes:main.append(node)
 # Keep trusted document structure and topology; remove executables and dead navigation.
 for el in main.find_all(True):
  for attr in list(el.attrs):
   if attr.startswith('on'):del el[attr]
  if el.name=='a':
   href=el.get('href','')
   if href.startswith('/chapters/'):
    parts=href.split('/');el['href']='#read/'+parts[2]+ ('/'+href.split('#',1)[1] if '#' in href else '')
   elif href=='/' or href.startswith('/#'):el['href']='#home'
  if el.get('style'):
   styles=[]
   for declaration in el['style'].split(';'):
    if ':' not in declaration:continue
    prop,value=declaration.split(':',1)
    if re.search(r'#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(',value):
     if prop.strip().startswith('background'):value='var(--paper2)'
     elif prop.strip()=='color':value='var(--ink)'
     elif 'border' in prop:value=re.sub(r'#[0-9a-fA-F]{3,8}\b','var(--line)',value)
    # Keep semantic role fills legible after their original white text is adapted.
    if prop.strip() in ('background','background-color') and re.fullmatch(r'\s*var\(--(?:blu|org|grn|pur|red|tea|amb)\)\s*',value):
     el['class']=el.get('class',[])+['document-role-fill']
     prop='--document-role'
    if prop.strip()=='grid-template-columns':
     el['class']=el.get('class',[])+['document-grid']
     prop='--document-grid-columns'
    styles.append(prop+':'+value)
   el['style']=';'.join(styles)
  if el.name=='th' and not el.has_attr('scope'):el['scope']='col'
 toc=[];used=set()
 candidates=main.select('h2.sub') or main.select('.cd-h,.co-t')
 for i,el in enumerate(candidates):
  anchor=el if el.name.startswith('h') else el.parent
  id=anchor.get('id') or f'section-{i+1}'
  while id in used:id+='-section'
  used.add(id);anchor['id']=id
  translated=el.select_one('[data-i18n-en]')
  zh=el.get_text(' ',strip=True);en=translated.get('data-i18n-en') if translated else residual.get(zh,zh)
  toc.append({'id':id,'zh':zh,'en':en})
 for i,table in enumerate(main.select('table')):
  if table.get('id')=='comparison' and not any(section['id']=='comparison' for section in toc):
   toc.append({'id':'comparison','zh':'能力对比','en':'Comparison'})
  if not table.parent.get('class') or 'tw' not in table.parent.get('class',[]):
   wrap=body.new_tag('div',attrs={'class':'tw'});table.wrap(wrap)
 for i,lab in enumerate(main.select('[data-architecture-explorer],[data-cost-simulator]')):
  lab['id']=lab.get('id',f'interactive-{i+1}')
  toc.append({'id':lab['id'],'zh':'交互实验：'+lab.select_one('.lab-title').get_text(' ',strip=True),'en':'Interactive lab'})
 for el in main.select('.tw,pre'):
  el['tabindex']='0'
  el['role']='region'
  el['aria-label']='可横向滚动的对比表' if 'tw' in el.get('class',[]) else '代码示例'
 positions={el.get('id'):i for i,el in enumerate(main.find_all(True)) if el.get('id')}
 toc.sort(key=lambda section:positions[section['id']])
 zh=str(main);en=str(english(BeautifulSoup(zh,'html.parser')))
 payload={'zh':zh,'en':en,'sections':toc,'supplements':[x['id'] for x in additions.get(slug,[])]}
 (project/'public/content'/f'{slug}.json').write_text(json.dumps(payload,ensure_ascii=False))
 # Section-level index enables direct lookup rather than chapter-only results.
 for section in toc:
  for lang,html in [('zh',zh),('en',en)]:
   doc=BeautifulSoup(html,'html.parser');target=doc.find(id=section['id']);texts=[target.get_text(' ',strip=True)] if target else []
   if target:
    for sib in target.next_siblings:
     if getattr(sib,'name',None)=='h2' and 'sub' in sib.get('class',[]):break
     if hasattr(sib,'get_text'):texts.append(sib.get_text(' ',strip=True))
   section['text'+lang.title()]=' '.join(texts)
  search.append({'titleZh':chapter['number']+' '+section['zh'],'titleEn':chapter['number']+' '+section['en'],'textZh':section.pop('textZh'),'textEn':section.pop('textEn'),'href':'#read/'+slug+'/'+section['id']})
 report.append({'slug':slug,'sections':len(toc),'supplements':len(payload['supplements']),'characters':len(BeautifulSoup(zh,'html.parser').get_text())})
(project/'src/chapters.json').write_text(json.dumps(chapters,ensure_ascii=False,indent=2))
(project/'src/search-index.json').write_text(json.dumps(search,ensure_ascii=False))
shutil.copy(project/'src/search-index.json', project/'public/content/search-index.json')
shutil.copy(web/'assets/handbook-interactions.js',project/'public/handbook-interactions.js')
(project/'evidence/content-manifest.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(f'Synced {len(chapters)} chapters, {sum(x["supplements"] for x in report)} supplements, {len(search)} searchable sections.')
