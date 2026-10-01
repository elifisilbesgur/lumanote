"""Actual application screenshots using sample local data, plus a model catalogue."""
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[2];O=R/'docs/screenshots055';O.mkdir(parents=True,exist_ok=True)
with sync_playwright() as w:
 b=w.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader'])
 p=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2,has_touch=True)
 p.evaluate("Object.defineProperty(window,'localStorage',{value:{getItem:k=>window.__s?.[k]||null,setItem:(k,v)=>{(window.__s||={})[k]=v},removeItem:k=>delete window.__s[k]}})")
 p.set_content((R/'ONIZLEME.html').read_text());p.wait_for_function('ready')
 p.evaluate("""()=>{S.preferences.theme='garden';S.world.petNames.bunny='Luna';S.living.baseCoins=50000;
 for(const item of ['modeSakura',...Object.keys(SAKURA_CATALOG055)])S.world.purchases.push({id:uid(),type:'decor',item,cost:DECOR[item].price,at:new Date().toISOString()});
 S.living.atmosphere='sakura';S.living.weather='clear';S.living.time='day';
 for(const [item,px,py]of [['jpTorii',176,268],['jpKoiPond',89,340],['jpRedBridge',97,378],['jpTeaPavilion',273,438],['jpBambooGrove',319,357],['jpBonsai',167,386],['jpLanternTrio',289,207],['jpZenGarden',122,438],['jpPaperLantern',215,326],['jpIrisPatch',205,428]]){
 S.world.layout.push({id:uid(),type:'decor',item,x:50,y:75});S.living.placement['decor:'+item]={x:30+(px-24)*420/312,y:88+(py-181)*204/256,room:false};}
 S.living.placement['pet:bunny']={x:220,y:228,room:false};
 UI.gardenEdit=false;UI.gardenRoom=false;applyTheme();route('garden');} """)
 def shot(name):
  p.evaluate("()=>{$('#toast').classList.remove('show');window.scrollTo(0,0)}");p.wait_for_timeout(500);p.screenshot(path=str(O/(name+'.png')))
 shot('garden')
 p.evaluate("()=>{UI.shopTab='sakura055';UI.sakuraFilter055='water';route('shop')}");shot('water-shop')
 p.evaluate("()=>{UI.sakuraFilter055='lights';render()}");shot('lantern-shop')
 p.evaluate("()=>{UI.sakuraFilter055='home';render()}");shot('home-shop')
 p.evaluate("""()=>{S.world.layout=S.world.layout.filter(x=>!S.living.placement[x.type+':'+x.item]?.room);
 for(const [item,x,y]of [['jpTatami',228,264],['jpShoji',367,153],['jpKotatsu',231,236],['jpFuton',382,265],['jpTokonoma',232,145],['jpMatchaSet',123,234]]){S.world.layout.push({id:uid(),type:'decor',item,x:50,y:75});S.living.placement['decor:'+item]={x,y,room:true};}
 UI.shopDestination054=true;UI.gardenRoom=true;route('garden');} """)
 shot('room')
 # Make a catalogue from the very same drawing recipes, not mocked application screens.
 grid=p.evaluate("()=>Object.keys(SAKURA_CATALOG055).map(k=>`<article>${pixel(k,124)}<strong>${esc(DECOR[k].name)}</strong><span>${DECOR[k].price.toLocaleString('tr-TR')} jeton · ${DECOR[k].roomOnly?'Ev':'Bahçe'}</span></article>`).join('')")
 q=b.new_page(viewport={'width':1240,'height':1545},device_scale_factor=1)
 q.set_content('''<!doctype html><html lang="tr"><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;background:#eef0e9;font-family:Arial,sans-serif;color:#263c35;padding:45px}header{display:flex;justify-content:space-between;align-items:flex-end;padding-bottom:27px}h1{font-size:38px;font-weight:600;margin:8px 0}header small{letter-spacing:3px;font-size:10px;color:#7d6c7b}p{margin:0;color:#697a70;font-size:14px}header>b{font-size:12px;border:1px solid #ccd3c5;border-radius:20px;padding:10px 16px}main{display:grid;grid-template-columns:repeat(6,1fr);gap:12px}article{height:238px;background:#f9faf6;border:1px solid #dce1d5;border-radius:13px;display:flex;flex-direction:column;align-items:center;padding:13px 8px}article svg{width:143px;height:151px;margin:0 0 10px;image-rendering:pixelated}strong{font-size:12px;text-align:center;line-height:1.3}span{font-size:10px;color:#728277;margin-top:7px}footer{margin-top:22px;font-size:11px;color:#708071}</style><header><div><small>LUMA · SAKURA KOLEKSİYONU</small><h1>Küçük bir Japon bahçesi.</h1><p>30 yeni piksel model · 24 bahçe dekoru + 6 ev eşyası</p></div><b>0.5.5</b></header><main>'''+grid+'''</main><footer>Modeller uygulama kodundan gösterilmiştir. Referans fotoğrafları ve filigranlı görseller bu çizimlere dahil değildir.</footer></html>''')
 q.screenshot(path=str(O/'catalog.png'),full_page=True);b.close()
