from pathlib import Path
from playwright.sync_api import sync_playwright
import json
R=Path(__file__).resolve().parents[2];O=R/'docs/screenshots054';O.mkdir(parents=True,exist_ok=True)
with sync_playwright() as w:
 b=w.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader']);p=b.new_page(viewport={'width':390,'height':844},has_touch=True,device_scale_factor=2);p.set_default_timeout(6000)
 p.evaluate("Object.defineProperty(window,'localStorage',{value:{getItem:k=>window.__store?.[k]||null,setItem:(k,v)=>{(window.__store||={})[k]=v}}})")
 p.set_content((R/'ONIZLEME.html').read_text());p.wait_for_function('ready')
 p.evaluate("""()=>{
 S.living.baseCoins=34500;S.preferences.theme='garden';S.world.petNames.bunny='Luna';
 const items=['modeSakura','modeWinter','modeHalloween','gazebo','fountain','bench','flowers','beehive','birdbath','vegetablePatch','sofa','television','fireplace','coffeeTable','plantIndoor','rugRound','floorLamp'];
 for(const item of items)S.world.purchases.push({id:uid(),type:'decor',item,cost:DECOR[item].price,at:new Date().toISOString()});
 const pos={gazebo:[125,228,false],fountain:[323,244,false],bench:[215,270,false],flowers:[100,280,false],beehive:[380,277,false],birdbath:[327,288,false],vegetablePatch:[219,203,false],sofa:[152,240,true],television:[341,143,true],fireplace:[147,151,true],coffeeTable:[250,241,true],plantIndoor:[411,223,true],rugRound:[260,278,true],floorLamp:[75,223,true]};
 S.world.layout=S.world.layout.filter(x=>x.type!=='decor');for(const key of Object.keys(S.living.placement))if(key.startsWith('decor:'))delete S.living.placement[key];
 for(const [item,[x,y,room]]of Object.entries(pos)){S.world.layout.push({id:uid(),type:'decor',item,x:50,y:75});S.living.placement['decor:'+item]={x,y,room};}
 closeSheet();route('garden');window.demoState054=JSON.parse(JSON.stringify(S));
 }""")
 def shot(name):
  p.evaluate("()=>{closeSheet();$('#toast').classList.remove('show');window.scrollTo(0,0)}")
  p.wait_for_timeout(650);p.screenshot(path=str(O/(name+'.png')))
 for mode in ['sakura','winter','halloween']:
  p.evaluate(f"setAtmosphere054('{mode}')")
  shot(mode)
 p.evaluate("()=>{UI.gardenRoom=true;UI.gardenEdit=true;UI.selectedLiving='decor:sofa';S.living.roomWall='cream';S.living.roomFloor='oak';render();updateGardenSelection();}")
 shot('cabin')
 p.evaluate("""()=>{S.notes=[['Haftanın planı','Matematik, okuma ve küçük molalar.'],['Ders notlarım','Bugünün önemli başlıkları.'],['Proje fikirleri','Aklıma gelenleri bir yerde topluyorum.'],['Kitap alıntıları','Son okuduğum bölümden notlar.']].map(([title,text],i)=>({id:'preview'+i,title,html:'<p>'+text+'</p>',plainText:text,createdAt:'2026-09-30T10:00:00Z',updatedAt:'2026-09-30T10:00:00Z',attachments:[],color:'#bba5d7'}));UI.trash=false;UI.archived=false;UI.query='';UI.category='Tümü';route('notes');UI.noteSelection054=new Set(['preview0','preview2']);render();}""")
 shot('selection')
 p.evaluate("""()=>{const n=S.notes[1];n.title='Renkli ders notlarım';n.html='<h2>Bir adım daha.</h2><p>Bugün öğrendiklerimi <span style="color:#c3567b;font-weight:bold">kendi renklerimle</span> kaydediyorum.</p><p><span style="color:#438ac7">Önemli fikirler</span> kolayca bulunsun.</p><ul><li>Konuyu küçük parçalara ayır.</li><li><span style="font-style:italic">Bir örnekle açıkla.</span></li><li>Kısa bir tekrar yap.</li></ul>';n.plainText=plain(n.html);openEditor(n.id);writingTools();}""")
 shot('writing')
 p.evaluate("()=>{flushEditor();route('shop');UI.shopTab='decor';render()}");shot('decor')
 p.evaluate("()=>{UI.shopTab='home';render()}");shot('furniture')
 p.evaluate("()=>{UI.shopTab='modes';render()}");shot('mode-store')
 print('Screens',len(list(O.glob('*.png'))))
 print('DOM status',p.evaluate("({opacity:getComputedStyle(document.body).opacity,overlay:UI.overlay})"));b.close()
