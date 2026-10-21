const {chromium} = require('playwright');
(async () => {
  const b = await chromium.launch();
  const shots = [
    {w: 1440, h: 1000, dark: false, url: '#read/03-hybrid-retrieval-query-routing', name: 's1-reader-1440-light'},
    {w: 1440, h: 1000, dark: true, url: '#read/03-hybrid-retrieval-query-routing', name: 's1-reader-1440-dark'},
    {w: 390, h: 844, dark: true, url: '#read/03-hybrid-retrieval-query-routing', name: 's1-reader-390-dark'},
    {w: 1440, h: 1000, dark: true, url: '#home', name: 's1-home-1440-dark'},
  ];
  for (const s of shots) {
    const ctx = await b.newContext({
      viewport: {width: s.w, height: s.h},
      reducedMotion: 'reduce',
      colorScheme: s.dark ? 'dark' : 'light',
    });
    const p = await ctx.newPage();
    await p.goto('http://localhost:4180/' + s.url);
    await p.waitForTimeout(1800);
    await p.screenshot({path: `evidence/${s.name}.png`});
    await ctx.close();
  }
  const widths = [390, 768, 1440, 1728];
  for (const w of widths) {
    const ctx = await b.newContext({viewport: {width: w, height: 1000}, reducedMotion: 'reduce'});
    const p = await ctx.newPage();
    await p.goto('http://localhost:4180/#read/03-hybrid-retrieval-query-routing');
    await p.waitForTimeout(1500);
    const m = await p.evaluate(() => {
      const el = document.querySelector('.canonical-content');
      const pane = document.querySelector('.chapter-body');
      return {
        contentW: el ? Math.round(el.getBoundingClientRect().width) : null,
        paneW: Math.round(pane.getBoundingClientRect().width),
        overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    console.log(w, JSON.stringify(m));
    await ctx.close();
  }
  await b.close();
})();
