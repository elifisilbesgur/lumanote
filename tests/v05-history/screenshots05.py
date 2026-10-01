from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1]; out=R/'docs/screenshots'; out.mkdir(parents=True,exist_ok=True)
fixture="""(()=>{S=fresh();S.preferences.finishSound=false;S.preferences.theme='nocturne';S.preferences.companion='cat';S.living.time='day';S.living.weather='clear';S.world.background='meadow';S.living.baseSeconds=0;S.living.baseCoins=0;
S.world.credits={'sample-session-a':60000,'sample-session-b':18000};
for(const [type,items] of [['pet',['cat','duck','bee','turtle','fox','owl']],['decor',['bench','birdhouse','beehive','flowers','campfire','catbed']]])for(const item of items)S.world.purchases.push({id:'demo:'+item,type,item,cost:(type==='pet'?PETS:DECOR)[item].price});
const placed=[['pet','cat',218,237],['pet','duck',360,163],['pet','bee',265,146],['pet','turtle',400,190],['pet','fox',160,254],['pet','owl',290,114],['pet','bunny',185,173],['decor','bench',218,241],['decor','birdhouse',281,118],['decor','beehive',267,162],['decor','flowers',68,236],['decor','campfire',176,260],['decor','catbed',145,170]];
for(const [type,item,x,y] of placed){S.world.layout.push({id:type+':'+item,type,item,x:50,y:75});S.living.placement[type+':'+item]={x,y,room:item==='catbed'};}
for(const [kind,x,y] of [['lavender',275,252],['tulip',266,241],['daisy',287,260]]){const id='demo-plant-'+kind;S.world.harvested.push({id,kind,at:Date.now()});S.world.layout.push({id:'plant:'+id,type:'plant',item:id,x:50,y:80});S.living.placement['plant:'+id]={x,y,room:false};}
S.living.album=['lavender','tulip','daisy'];S.living.bonds.cat=8000;S.world.petNames.cat='Miso';
S.world.plots=[['sunflower',.5],['lavender',.78],['strawberry',1]].map(([kind,p],i)=>({id:'demo-pot-'+i,kind,atSeconds:worldSeconds()-SEEDS[kind].minutes*60*p}));
for(let i=0;i<3;i++)S.living.growthSeen['demo-pot-'+i]=growthStage(S.world.plots[i]);
S.notes=[['Bugünkü küçük hedefler','<p>Bir konu, bir adım. Bugün olasılık sorularını bitireceğim.</p>','Ders'],['Kitaptan kalanlar','<p>Önemli olan küçük adımlarla devam etmek.</p>','Kişisel'],['Proje fikirleri','<p>Bir fikri sadeleştir. Sonra çalışır hâle getir.</p>','İş'],['Haftanın planı','<p>Pazartesi: tekrar. Salı: yeni konu. Çarşamba: sorular.</p>','Ders']].map(([title,html,category],i)=>({id:'note-demo-'+i,title,html,plainText:plain(html),category,attachments:[],tags:[],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),pinned:i===0,favorite:false,archived:false,deletedAt:null,paper:{kind:'dark',opacity:.24},ink:[],pdfInk:{}}));
UI.immersive=false;UI.gardenFull=false;UI.gardenEdit=false;UI.gardenRoom=false;applyTheme();route('garden');})()"""
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'],headless=True)
 p=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2)
 p.evaluate("Object.defineProperty(window,'localStorage',{value:{getItem:k=>window.__store?.[k]||null,setItem:(k,v)=>{(window.__store||={})[k]=v}}})")
 p.set_content((R/'ONIZLEME.html').read_text());p.wait_for_timeout(450);p.evaluate(fixture);p.wait_for_timeout(900)
 p.screenshot(path=str(out/'garden.png'))
 p.evaluate("route('notes')");p.wait_for_timeout(600);p.screenshot(path=str(out/'notes.png'))
 p.evaluate("S.preferences.theme='garden';S.living.time='dusk';S.living.weather='rain';applyTheme();route('focus')");p.wait_for_timeout(700);p.screenshot(path=str(out/'focus.png'))
 p.set_viewport_size({'width':844,'height':390});p.evaluate("UI.immersive=true;S.preferences.timerStyle='simple';render()");p.wait_for_timeout(650);p.screenshot(path=str(out/'focus-landscape.png'))
 p.evaluate("UI.immersive=false;UI.gardenFull=true;S.preferences.theme='nocturne';S.living.time='day';S.living.weather='clear';applyTheme();route('garden')");p.wait_for_timeout(500);p.screenshot(path=str(out/'garden-full.png'))
 p.evaluate("UI.gardenRoom=true;render()");p.wait_for_timeout(500);p.screenshot(path=str(out/'cabin.png'))
 b.close()
print(out)
