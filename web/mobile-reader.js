(()=>{
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  // Give wide data tables their own horizontal scroll container instead of widening the page.
  $$('table').forEach(table=>{
    if(table.parentElement?.classList.contains('mobile-table-scroll')) return;
    const wrap=document.createElement('div');
    wrap.className='mobile-table-scroll';
    wrap.tabIndex=0;
    wrap.setAttribute('role','region');
    wrap.setAttribute('aria-label','Scrollable table / 可横向滚动表格');
    table.parentNode.insertBefore(wrap,table);
    wrap.appendChild(table);
  });

  const dock=document.createElement('nav');
  dock.className='mobile-reader-dock';
  dock.setAttribute('aria-label','Mobile reading navigation / 手机阅读导航');
  dock.innerHTML=`
    <button type="button" id="mobile-prev"><span class="dock-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 6.5 9 12l5.5 5.5"/></svg></span><span class="i18n-text" data-i18n-en="Previous" data-i18n-zh="上一章">上一章</span></button>
    <button type="button" id="mobile-search"><span class="dock-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="5.5"/><path d="m15.2 15.2 4.1 4.1"/></svg></span><span class="i18n-text" data-i18n-en="Search" data-i18n-zh="搜索">搜索</span></button>
    <button type="button" id="mobile-focus"><span class="dock-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="1.8"/></svg></span><span class="i18n-text" data-i18n-en="Focus" data-i18n-zh="专注">专注</span></button>
    <button type="button" id="mobile-next"><span class="dock-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9.5 6.5 5.5 5.5-5.5 5.5"/></svg></span><span class="i18n-text" data-i18n-en="Next" data-i18n-zh="下一章">下一章</span></button>`;
  document.body.appendChild(dock);

  const ordered=[$('#cover'),...$$('section.ch')].filter(Boolean);
  const currentIndex=()=>{
    const y=(parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)||72)+24;
    let best=0;
    ordered.forEach((s,i)=>{if(s.getBoundingClientRect().top<=y)best=i});
    return best;
  };
  const go=(delta)=>{
    const i=Math.max(0,Math.min(ordered.length-1,currentIndex()+delta));
    ordered[i]?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
    try{history.replaceState(null,'','#'+ordered[i].id)}catch(e){}
  };
  const sync=()=>{
    const i=currentIndex();
    $('#mobile-prev').disabled=i<=0;
    $('#mobile-next').disabled=i>=ordered.length-1;
    const focus=$('#reader-focus');
    $('#mobile-focus')?.setAttribute('aria-pressed',focus?.getAttribute('aria-pressed')||'false');
  };
  $('#mobile-prev').addEventListener('click',()=>go(-1));
  $('#mobile-next').addEventListener('click',()=>go(1));
  $('#mobile-search').addEventListener('click',()=>$('.reader-search-open')?.click());
  $('#mobile-focus').addEventListener('click',()=>$('#reader-focus')?.click());
  addEventListener('scroll',sync,{passive:true});
  addEventListener('resize',sync,{passive:true});
  $('#reader-focus')?.addEventListener('click',()=>setTimeout(sync,0));
  sync();
})();
