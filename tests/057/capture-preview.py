"""Screens from the real application HTML. Demo data only; never shipped as startup state."""
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[2];O=R/'docs/screenshots057';O.mkdir(parents=True,exist_ok=True)
with sync_playwright() as w:
 b=w.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);p=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2,has_touch=True)
 p.on('pageerror',lambda e:print('ERROR',e))
 p.evaluate("Object.defineProperty(window,'localStorage',{value:{getItem:k=>window.__store?.[k]||null,setItem:(k,v)=>{(window.__store||={})[k]=v},removeItem:k=>delete window.__store[k]}})")
 p.set_content((R/'ONIZLEME.html').read_text());p.wait_for_function('ready')
 p.evaluate("()=>{S.preferences.theme='garden';S.preferences.motion=false;S.living.time='day';S.living.weather='clear';S.living.baseCoins=42000;applyTheme();window.demoPlace057=(id,room,x,y)=>{if(!DECOR[id])throw Error(id);if(!owns('decor',id))S.world.purchases.push({id:'demo-'+id,type:'decor',item:id,cost:0,at:new Date().toISOString()});S.world.layout=S.world.layout.filter(p=>p.item!==id);S.world.layout.push({id:'demo-'+id,type:'decor',item:id,x:50,y:70});S.living.placement['decor:'+id]={x,y,room:room!=='garden'};if(room!=='garden')S.living.rooms057.assignments['decor:'+id]=room;else delete S.living.rooms057.assignments['decor:'+id];};}")
 rooms={
 'greenhouse':[['ghShelf057',89,143],['ghHanging057',304,99],['ghCitrus057',427,172],['ghPotting057',122,204],['ghSeedCabinet057',414,250],['ghOrchid057',259,168],['ghSofa057',125,282],['ghChair057',334,204],['ghBasket057',370,277],['ghTerrarium057',214,225],['rugRound',264,261],['trTeaTable056',258,258],['plantIndoor',204,146]],
 'salon':[['sofaSage',120,206],['television',338,139],['fireplace',111,137],['coffeeTable',257,212],['rug',253,262],['trKilim056',234,221],['floorLamp',405,204],['armchair',354,280],['bookcase',90,278]],
 'kitchen':[['htFridge057',87,173],['htSink057',238,160],['htCabinet057',396,165],['htStove057',386,268],['htDining057',178,252],['trKettle056',180,225]],
 'bathroom':[['htShower057',85,183],['htVanity057',262,179],['htToilet057',409,198],['htBath057',255,279],['htTowels057',78,289]],
 'lounge':[['sofa',111,200],['recordPlayer',326,174],['pianoUpright',341,288],['teaSet',217,244]],
 'bedroom':[['bed',220,257],['desk',113,171],['sideTable',335,259],['wallClock',243,117]]}
 for room,arr in rooms.items():
  for id,x,y in arr:p.evaluate('([id,room,x,y])=>demoPlace057(id,room,x,y)',[id,room,x,y])
 for room in ['greenhouse','salon','kitchen','bathroom','lounge','bedroom']:
  p.evaluate('id=>openSpace057(id)',room);p.wait_for_timeout(350);p.screenshot(path=str(O/(room+'.png')))
 # room nav and actual note modal
 p.evaluate("openSpace057('greenhouse');spaceList057()");p.wait_for_timeout(350);p.screenshot(path=str(O/'rooms.png'))
 p.evaluate("()=>{closeSheet();S.notes=[{id:'demo1',title:'Kış bahçesi fikirlerim',plainText:'Cam raflar, bir kitap ve sıcak bir çay.',html:'<p>Cam raflar, bir kitap ve sıcak bir çay.</p>',attachments:[],category:'Genel',updatedAt:new Date().toISOString()},{id:'demo2',title:'Haftanın çalışma planı',plainText:'Bugün küçük bir başlangıç.',html:'<p>Bugün küçük bir başlangıç.</p>',attachments:[],category:'Genel',updatedAt:new Date().toISOString()}];route('notes');beginNoteSelection054('demo1');}")
 p.locator('[data-action=bulk-trash054]').click();p.wait_for_timeout(450);p.screenshot(path=str(O/'notes-confirm.png'));p.evaluate('closeSheet();endNoteSelection054()')
 for cat in ['winter057','halloween057','interior057']:
  p.evaluate('cat=>{UI.gardenRoom=false;UI.shopDestination054=false;UI.shopTab=cat;UI.interiorFilter057="all";route("shop")}',cat);p.wait_for_timeout(300);p.screenshot(path=str(O/(cat+'-shop.png')))
 # Camera-bounded winter and autumn example gardens, only demo purchases and coordinates.
 garden=[['wnSnowman057',319,238],['wnSleigh057',330,276],['wnCandyArch057',114,161],['wnGiftTower057',81,247],['wnGingerHouse057',104,197],['wnLantern057',235,245],['wnFestiveFence057',215,283],['wnStar057',269,190]]
 for id,x,y in garden:p.evaluate('([id,x,y])=>demoPlace057(id,"garden",x,y)',[id,x,y])
 p.evaluate("()=>{S.world.purchases.push({id:'demo-mode',type:'decor',item:'modeWinter',cost:0,at:new Date().toISOString()});S.living.atmosphere='winter';S.living.weather='snow';S.living.time='night';UI.gardenFull=false;exitSpace057();route('garden');}");p.wait_for_timeout(350);p.screenshot(path=str(O/'winter-garden.png'))
 # Actual model gallery at larger size. Uses application pixel renderer, not mock-up replacements.
 data=p.evaluate("()=>({groups:[['YILBAŞI · 24 DEKOR',Object.keys(WINTER057)],['CADILAR BAYRAMI · 24 DEKOR',Object.keys(HALLOWEEN057)],['KIŞ BAHÇESİ VE ODALAR · 20 EŞYA',Object.keys(FURNITURE057)]].map(([title,keys])=>({title,items:keys.map(id=>({id,name:DECOR[id].name,price:DECOR[id].price,svg:pixel(id,132)}))}))})")
 q=b.new_page(viewport={'width':1180,'height':800},device_scale_factor=1)
 for group in data['groups']:
  cards=''.join('<article>'+e['svg']+'<b>'+e['name']+'</b><small>'+str(e['price'])+' jeton</small></article>'for e in group['items'])
  doc='''<!doctype html><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;background:#101b1b;color:#f7f2e6;font-family:Arial,sans-serif;padding:36px}h1{font-size:30px;letter-spacing:1px;margin:0 0 9px}p{color:#b8c4b7;margin:0 0 25px}.grid{display:grid;grid-template-columns:repeat(6,1fr);gap:13px}article{background:#1c2b2a;border:1px solid #45544a;border-radius:18px;min-height:204px;padding:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px}svg{image-rendering:pixelated}b{font-size:12px;text-align:center;min-height:26px}small{font-size:11px;color:#ccdab5}footer{font-size:12px;color:#9cafa1;margin-top:28px}</style>'''+f'<h1>{group["title"]}</h1><p>LumaNote 0.5.7 · Gerçek uygulama modelleri · Otomatik satın alma yapılmaz.</p><div class="grid">'+cards+'</div><footer>Özgün piksel çizimler · Bahçe, ev ve kış bahçesi koleksiyonları</footer>'
  q.set_content(doc);q.screenshot(path=str(O/('catalog-'+str(len(group['items']))+('-winter'if group['title'].startswith('YIL')else '-halloween'if group['title'].startswith('CAD')else '-interior')+'.png')),full_page=True)
 b.close()
