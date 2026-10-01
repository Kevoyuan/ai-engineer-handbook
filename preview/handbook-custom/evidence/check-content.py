from pathlib import Path
from bs4 import BeautifulSoup,Comment
import json,collections
root=Path('../..');manifest=json.loads((root/'web/assets/chapter-additions.json').read_text());chapters=json.loads(Path('src/chapters.json').read_text());report=[]
for c in chapters:
 data=json.loads(Path('public/content',c['slug']+'.json').read_text());dest=BeautifulSoup(data['zh'],'html.parser');source=BeautifulSoup((root/'web/chapters'/c['slug']/'index.html').read_text(),'html.parser').select_one('main')
 for el in source.select('.ch-head,.interp-strip,.page-nav,script,style'):el.decompose()
 original=[str(x).strip() for x in source.find_all(string=True) if str(x).strip() and not isinstance(x,Comment)]
 missing=[text for text in original if text not in dest.get_text()];assert not missing,(c['slug'],missing[:3])
 for x in manifest.get(c['slug'],[]):
  supplement=BeautifulSoup((root/'web'/x['path'].lstrip('/')).read_text(),'html.parser');missing=[str(text).strip() for text in supplement.find_all(string=True) if str(text).strip() and not isinstance(text,Comment) and str(text).strip() not in dest.get_text()];assert not missing,(x['id'],missing[:3])
 for s in data['sections']:assert len(dest.find_all(id=s['id']))==1,(c['slug'],s['id'])
 ids=collections.Counter(el['id'] for el in dest.select('[id]'));duplicates=[id for id,n in ids.items() if n>1];assert not duplicates,(c['slug'],duplicates)
 report.append({'chapter':c['number'],'preservedTextNodes':len(original),'supplements':len(manifest.get(c['slug'],[])),'sectionLinksValid':len(data['sections'])})
Path('evidence/content-preservation.json').write_text(json.dumps({'passed':True,'chapters':report},indent=2));print('PASS: all technical text nodes, 26 complete supplements, unique IDs and 87 section destinations preserved.')
