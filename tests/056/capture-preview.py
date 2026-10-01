"""Screenshots from the application source, using explicitly fictional local state."""
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[2];O=R/'docs/screenshots056';O.mkdir(parents=True,exist_ok=True)
with sync_playwright() as w:
 b=w.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader'])
 p=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2,has_touch=True)
 p.evaluate("Object.defineProperty(window,'localStorage',{value:{getItem:k=>window.__s?.[k]||null,setItem:(k,v)=>{(window.__s||={})[k]=v},removeItem:k=>delete window.__s[k]}})")
 p.set_content((R/'ONIZLEME.html').read_text());p.wait_for_function('ready')
 p.evaluate("""()=>{S.preferences.theme='garden';S.world.petNames.bunny='Luna';S.living.baseCoins=85000;
 for(const item of ['modeSakura',...Object.keys(SAKURA_CATALOG055),...Object.keys(ANATOLIA056)])S.world.purchases.push({id:uid(),type:'decor',item,cost:DECOR[item].price,at:new Date().toISOString()});
 S.living.atmosphere='sakura';S.living.weather='clear';S.living.time='day';
 for(const [item,px,py]of [['jpTorii',166,271],['jpKoiPond',86,348],['jpRedBridge',91,385],['jpBambooGrove',321,353],['jpBonsai',197,349],['jpLanternTrio',292,209],['jpPaperLantern',206,309],['jpIrisPatch',239,438],['trKilim056',280,430],['trTeaTable056',279,423]]){
 S.world.layout.push({id:uid(),type:'decor',item,x:50,y:75});S.living.placement['decor:'+item]={x:30+(px-24)*420/312,y:88+(py-181)*204/256,room:false};}
 S.focusHistory.push({id:'preview-study',completedMinutes:90,phase:'work',startedAt:new Date().toISOString(),endedAt:new Date().toISOString()});
 S.world.credits['preview-study']=5400;const sec=worldSeconds();S.world.plots=[{id:'preview1',kind:'sunflower',atSeconds:sec-15*60},{id:'preview2',kind:'lavender',atSeconds:sec-34*60},null];
 S.living.memorials=[{id:'previewmemory',name:'İlk projem tamamlandı',kind:'flower',hidden:false},{id:'previewmemory2',name:'Yeni bir başlangıç',kind:'tree',hidden:false}];
 S.living.placement['memorial:previewmemory']={x:239,y:230,room:false};S.living.placement['memorial:previewmemory2']={x:282,y:196,room:false};
 S.living.placement['pet:bunny']={x:201,y:254,room:false};UI.gardenEdit=false;UI.gardenRoom=false;applyTheme();route('garden');}""")
 def shot(name):
  p.evaluate("()=>{$('#toast').classList.remove('show')}");p.wait_for_timeout(330);p.screenshot(path=str(O/(name+'.png')))
 shot('garden')
 p.evaluate("document.querySelector('.nursery053').scrollIntoView({block:'start'})");shot('memories')
 p.evaluate("()=>{UI.shopTab='sakura055';UI.sakuraFilter055='all';route('shop')}");shot('japanese-shop')
 p.evaluate("()=>{UI.shopTab='anatolia056';route('shop')}");shot('anatolia-shop')
 for theme,name in [('opal056','Opal Akışı'),('emerald056','Zümrüt Cam'),('amber056','Kehribar Gece'),('cosmos056','Kozmik İnci')]:
  p.evaluate('(t)=>{UI.immersive=false;S.preferences.theme=t;applyTheme();route("focus")}',theme);shot(theme)
 p.evaluate('mixerSheet()');p.evaluate("document.querySelector('.piano-panel056').scrollIntoView({block:'center'})");shot('piano')
 # Actual model recipes shown at a useful catalogue scale, not a fake in-app screenshot.
 grids=p.evaluate("()=>({j:Object.keys(SAKURA_CATALOG055).map(k=>`<article>${pixel(k,122)}<strong>${esc(DECOR[k].name)}</strong><span>${DECOR[k].price.toLocaleString('tr-TR')} jeton · ${DECOR[k].roomOnly?'Ev':'Bahçe'}</span></article>`).join(''),t:Object.keys(ANATOLIA056).map(k=>`<article>${pixel(k,122)}<strong>${esc(DECOR[k].name)}</strong><span>${DECOR[k].price.toLocaleString('tr-TR')} jeton · Bahçe / Ev</span></article>`).join('')})")
 q=b.new_page(viewport={'width':1240,'height':1000},device_scale_factor=1)
 q.set_content('''<!doctype html><html lang="tr"><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;padding:40px;background:#eeefe8;font-family:Arial,sans-serif;color:#293c36}h1{font-size:33px;margin:8px 0}p{font-size:14px;color:#697c70;margin:10px 0 20px}h2{font-size:23px;margin:28px 0 18px}small{letter-spacing:2px;font-size:11px;color:#8c6d80}main{display:grid;grid-template-columns:repeat(6,1fr);gap:12px}article{height:213px;display:flex;flex-direction:column;align-items:center;justify-content:center;border:1px solid #d9e0d0;border-radius:15px;background:#fafbf6;padding:10px}article svg{image-rendering:pixelated;width:135px;height:139px;margin-bottom:10px}article strong{font-size:12px;text-align:center;line-height:1.3}article span{font-size:10px;color:#708072;margin-top:7px}footer{margin-top:28px;font-size:11px;color:#708072}</style><small>LUMA · ATÖLYE · 0.5.6</small><h1>Bahçene iki küçük dünya.</h1><p>42 parça · uygulamadaki çizim kodundan oluşturulan model kataloğu</p><h2>Japon · Sakura — 30 parça</h2><main>'''+grids['j']+'''</main><h2>Çay & Kilim — 12 yeni parça</h2><main>'''+grids['t']+'''</main><footer>Mağazada satın alınır, ardından Yerleştir seçilir. Referans fotoğrafları / filigranlı görseller kullanılmamıştır.</footer></html>''')
 q.screenshot(path=str(O/'catalog.png'),full_page=True);b.close()
