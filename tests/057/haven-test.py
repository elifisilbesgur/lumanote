"""0.5.7 application tests in Chromium. Memory localStorage, not real iPhone storage."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,traceback
R=Path(__file__).resolve().parents[2];O=R/'tests/057';O.mkdir(exist_ok=True);html=(R/'ONIZLEME.html').read_text();rows=[];errors=[]
def ck(name,ok,detail=''):
 rows.append(dict(name=name,passed=bool(ok),detail=detail));print(('PASS 'if ok else 'FAIL ')+name,str(detail)[:160],flush=True)
def page(b,test=False):
 p=b.new_page(viewport={'width':390,'height':844},has_touch=True);p.set_default_timeout(5000);p.on('pageerror',lambda e:errors.append(str(e)))
 p.evaluate("Object.defineProperty(window,'localStorage',{value:{getItem:k=>window.__store?.[k]||null,setItem:(k,v)=>{(window.__store||={})[k]=v},removeItem:k=>delete window.__store[k]}})")
 if test:p.evaluate('window.LUMA_TEST_COINS_ALLOWED=true')
 p.set_content(html.replace('LUMA_TEST_COINS_SWITCH = false','LUMA_TEST_COINS_SWITCH = true') if test else html);p.wait_for_function('ready');return p
def action(p,a,d={}):return p.evaluate('([a,d])=>enhancedAction(a,{dataset:d},{})',[a,d])
with sync_playwright() as w:
 b=w.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader']);p=page(b)
 try:
  ck('Fresh record has six room styles, no artificial purchased holiday items',p.evaluate("Object.keys(S.living.rooms057.styles).length===6&&Object.keys(WINTER057).every(k=>!owns('decor',k))"))
  ck('All 68 added items have unique original model recipes',p.evaluate("()=>{const k=[...Object.keys(WINTER057),...Object.keys(HALLOWEEN057),...Object.keys(FURNITURE057)];return k.length===68&&new Set(k.map(x=>JSON.stringify(DECOR_ART054[x]))).size===68&&k.every(x=>DECOR_ART054[x].length>0)}"))
  p.evaluate("()=>{route('garden');}")
  ck('Garden has fullscreen only; useless reset/fit button removed',p.locator('.garden-tools button').count()==1 and p.locator('[data-action=garden-reset-view]').count()==0)
  ck('Use garden as theme removed from garden page',p.locator('[data-action=use-garden-theme]').count()==0)
  p.evaluate('weatherSheet()')
  ck('Use garden as theme removed from weather sheet',p.locator('.sheet [data-action=use-garden-theme]').count()==0)
  p.evaluate('closeSheet();groundSheet()')
  ck('No preset layouts offered',p.locator('[data-action=living-layout]').count()==0 and 'Hazır düzen' not in p.locator('.sheet').inner_text())
  before=p.evaluate('JSON.stringify(S.living.placement)');action(p,'living-layout',{'layout':'pond'});ck('Legacy layout action cannot silently rearrange garden',before==p.evaluate('JSON.stringify(S.living.placement)'))
  p.evaluate('closeSheet()')
  # Actual canvas click enters greenhouse, through the hit-test system.
  box=p.locator('.living-host canvas').bounding_box();hit=p.evaluate("()=>{const g=[...gardenInstances].find(g=>!g.passive),h=g.hits.find(h=>h.kind==='greenhouse');return {x:g.fit.ox+(h.x+h.w/2)*g.fit.scale,y:g.fit.oy+(h.y+h.h/2)*g.fit.scale}}")
  p.mouse.click(box['x']+hit['x'],box['y']+hit['y']);p.wait_for_timeout(100)
  ck('Canvas greenhouse entrance opens editable winter garden',p.evaluate("currentSpace057()==='greenhouse'&&[...gardenInstances].some(g=>g.room&&g.world.width===360&&g.world.height===480)"))
  ck('All six destinations are available',p.locator('.space-tabs057 button').count()==6)
  ck('Indoor stage matches garden portrait dimensions',p.evaluate("()=>{const r=document.querySelector('.room-stage057').getBoundingClientRect();return Math.abs(r.width/r.height-.75)<.01}"))
  p.locator('.garden-dock [data-action=route]').click()
  ck('Greenhouse shop opens relevant furniture filter',p.evaluate("UI.shopTab==='interior057'&&UI.interiorFilter057==='greenhouse'") and p.locator('.haven-card057').count()==10)
  p.locator('[data-action=shop-tab][data-tab=winter057]').click();ck('Christmas thematic store contains 24 items',p.locator('.haven-card057').count()==24)
  p.locator('[data-action=shop-tab][data-tab=halloween057]').click();ck('Halloween thematic store contains 24 items',p.locator('.haven-card057').count()==24)
  p.locator('[data-action=haven-buy057][data-item=hwGhost057]').click();ck('Insufficient funds blocked',p.evaluate("wallet()===0&&!owns('decor','hwGhost057')"))
  p.evaluate('S.living.baseCoins=100000')
  p.locator('[data-action=haven-buy057][data-item=hwGhost057]').click();p.wait_for_function("owns('decor','hwGhost057')")
  ck('Holiday purchase costs correct price and no special mode needed',p.evaluate("wallet()===99580&&!owns('decor','modeHalloween')"))
  p.evaluate("buyItem('decor','hwGhost057')");ck('Already owned purchase is idempotent',p.evaluate('wallet()===99580'))
  p.locator('[data-action=haven-place057][data-item=hwGhost057]').click();ck('Holiday object can target garden and all rooms',p.locator('[data-action=place-destination057]').count()==7)
  p.locator('[data-action=place-destination057][data-space=greenhouse]').click();p.wait_for_function("UI.route==='garden'")
  ck('Item is placed in greenhouse only',p.evaluate("currentSpace057()==='greenhouse'&&S.living.rooms057.assignments['decor:hwGhost057']==='greenhouse'&&[...gardenInstances].some(g=>g.hits.some(h=>h.item==='hwGhost057'))"))
  p.evaluate("openSpace057('salon')")
  ck('Greenhouse item does not leak into salon',p.evaluate("[...gardenInstances].every(g=>!g.hits.some(h=>h.item==='hwGhost057'))"))
  p.evaluate("openSpace057('greenhouse')")
  action(p,'inventory-place057',{'type':'decor','item':'hwGhost057'});p.locator('[data-action=place-destination057][data-space=kitchen]').click()
  ck('Moving room preserves purchase, only one instance exists',p.evaluate("currentSpace057()==='kitchen'&&S.world.layout.filter(x=>x.item==='hwGhost057').length===1&&wallet()===99580&&S.living.rooms057.assignments['decor:hwGhost057']==='kitchen'"))
  old=p.evaluate("S.living.placement['decor:hwGhost057'].x");action(p,'living-nudge',{'direction':'right'});ck('Room arrow changes saved position',p.evaluate("S.living.placement['decor:hwGhost057'].x")>old)
  p.evaluate("()=>{window.preRoom057=JSON.stringify(S.living.rooms057);S=normalize(structuredClone(S));render();}")
  ck('All assignments and per-room styles persist through normalize',p.evaluate('JSON.stringify(S.living.rooms057)===preRoom057'))
  # Old records with only room:true must migrate to original room without deletion.
  ck('Old indoor position without assignment becomes salon',p.evaluate("()=>{const old=structuredClone(S);delete old.living.rooms057;const n=normalize(old);return n.living.placement['decor:hwGhost057'].room&&n.world.purchases.length===S.world.purchases.length&&Object.keys(n.living.rooms057.assignments).length===0}"))
  p.evaluate("openSpace057('bathroom')")
  action(p,'space-style057',{'field':'wall','value':'rose'});p.evaluate('closeSheet()')
  ck('Wall customization belongs to selected room only',p.evaluate("S.living.rooms057.styles.bathroom.wall==='rose'&&S.living.rooms057.styles.kitchen.wall==='sage'"))
  p.evaluate("()=>{window.savedPersist057=persist;window.priorState057=JSON.stringify([S.world,S.living]);persist=async()=>{throw Error('simulated write failure')};}")
  failed=p.evaluate("buyItem('decor','wnSnowman057').then(()=>false).catch(()=>true)");ck('Failed holiday purchase restores state',failed and p.evaluate('JSON.stringify([S.world,S.living])===priorState057'))
  failed=p.evaluate("()=>{UI.pendingSpace057='salon';return placeOwned('decor','hwGhost057').then(()=>false).catch(()=>true)}")
  ck('Failed room move restores assignment and placement',failed and p.evaluate('JSON.stringify([S.world,S.living])===priorState057'))
  failed=p.evaluate("enhancedAction('space-style057',{dataset:{field:'floor',value:'walnut'}},{}).then(()=>false).catch(()=>true)")
  ck('Failed room style change rolls back',failed and p.evaluate("S.living.rooms057.styles.bathroom.floor==='tile'"))
  p.evaluate('persist=savedPersist057')
  # Available old collections remain reachable in thematic shop.
  for tab,selector,count in [('sakura055','.sakura-card055',30),('anatolia056','.sakura-card055',12)]:
   p.evaluate('tab=>{UI.gardenRoom=false;UI.shopDestination054=false;UI.shopTab=tab;route("shop")}',tab)
   ck('Existing catalogue '+tab+' intact',p.locator(selector).count()==count)
  # Modal overlap reproduced by normal bulk-select and delete UI.
  p.evaluate("()=>{S.notes=[{id:'n1',title:'Kış bahçesi fikirleri',html:'<p>Yeni bitkiler</p>',plainText:'Yeni bitkiler',attachments:[],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),category:'Genel'},{id:'n2',title:'Çalışma planı',html:'<p>Bugünün konusu</p>',plainText:'Bugünün konusu',attachments:[],updatedAt:new Date().toISOString(),category:'Genel'}];UI.gardenFull=false;route('notes');beginNoteSelection054('n1');}")
  ck('Selection bar visible before confirmation',p.locator('.bulk-bar054').is_visible())
  p.locator('[data-action=bulk-trash054]').click();p.wait_for_timeout(50)
  ck('Floating selection bar hidden behind confirmation',not p.locator('.bulk-bar054').is_visible())
  ck('Background noninteractive; overlay remains interactive',p.evaluate("$('#screen').hasAttribute('inert')&&!$('#overlay-root').hasAttribute('inert')"))
  ck('Top layer at confirm button belongs to modal',p.evaluate("()=>{const e=$('[data-action=confirm]')||$('.sheet .btn.primary'),r=e.getBoundingClientRect();return !!document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('.sheet')}"))
  p.screenshot(path=str(O/'notes-confirm.png'))
  p.evaluate('closeSheet()');p.wait_for_timeout(30)
  ck('Cancel retains selection and restores action bar',p.locator('.bulk-bar054').is_visible() and p.evaluate("selection054().has('n1')&&!getNote('n1').deletedAt&&!$('#screen').hasAttribute('inert')"))
  p.locator('[data-action=notes-select-all054]').click();ck('Select all selects both notes',p.evaluate('selection054().size===2'))
  p.locator('[data-action=bulk-trash054]').click()
  print('CONFIRM ACTIONS',p.locator('.sheet button').evaluate_all('(es)=>es.map(e=>e.dataset.action)'),flush=True)
  p.locator('[data-action=confirm]').click();p.wait_for_timeout(100)
  ck('Confirmed bulk trash affects selected notes',p.evaluate('S.notes.every(n=>n.deletedAt)&&!selection054()'))
  p.locator('[data-action=bulk-undo054]').click();ck('Undo bulk trash restores notes',p.evaluate('S.notes.every(n=>!n.deletedAt)'))
  # Dismiss sheets with actual touch events.
  p.evaluate('weatherSheet()');cdp=p.context.new_cdp_session(p);q=p.locator('.sheet-drag-zone053').bounding_box();x=q['x']+q['width']/2;y=q['y']+q['height']/2
  def touch(t,ps):cdp.send('Input.dispatchTouchEvent',{'type':t,'touchPoints':[{'id':i+1,'x':a,'y':b}for i,(a,b) in enumerate(ps)]})
  touch('touchStart',[(x,y)])
  for d in [15,40,80,110]:touch('touchMove',[(x,y+d)])
  touch('touchEnd',[]);p.wait_for_timeout(300)
  ck('Sheet drag dismissal preserved and inert cleared',p.locator('.sheet').count()==0 and p.evaluate("!$('#screen').hasAttribute('inert')"))
  p.evaluate("()=>{route('garden');window.g=[...gardenInstances].find(x=>!x.passive);g.setZoom(2)}")
  for dx,dy in [(1e6,1e6),(-1e6,-1e6),(-1e6,1e6),(1e6,-1e6)]:
   p.evaluate('([x,y])=>{g.pan={x,y};g.paint(performance.now())}',[dx,dy]);ck('Garden camera remains in bounds '+str((dx,dy)),p.evaluate('g.fit.ox<=.01&&g.fit.oy<=.01&&g.fit.ox+g.world.width*g.fit.scale>=g.width-.01&&g.fit.oy+g.world.height*g.fit.scale>=g.height-.01'))
  p.evaluate('g.setZoom(1)')
  for space in ['salon','kitchen','bathroom','lounge','bedroom','greenhouse']:
   p.evaluate('id=>openSpace057(id)',space);ck(space+' canvas rendered large portrait',p.evaluate('[...gardenInstances].some(g=>g.room&&g.world.width===360&&g.world.height===480)'))
  for ww,hh in [(320,700),(390,844),(430,932),(844,390)]:
   p.set_viewport_size({'width':ww,'height':hh});p.evaluate("openSpace057('greenhouse')");ck('Room no horizontal page overflow '+str(ww),p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
   action(p,'space-list057');ck('Room chooser within viewport '+str(ww),p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'));p.evaluate('closeSheet()')
   p.evaluate("()=>{UI.gardenRoom=false;UI.shopDestination054=false;UI.shopTab='winter057';route('shop')}");ck('Holiday shop no horizontal overflow '+str(ww),p.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
  p.set_viewport_size({'width':390,'height':844});p.evaluate('mixerSheet()')
  ck('Piano choices show three distinct meters',all(s in p.locator('.sheet').inner_text() for s in ['4/4','3/4','6/8']))
  for track in ['pianoMoon','pianoDawn','pianoSakura']:
   p.locator('[data-action=piano-track056][data-track='+track+']').click();ck('Only selected piano has positive volume '+track,p.evaluate('(k)=>S.preferences.volumes[k]>0&&Object.keys(PIANO_TRACKS056).filter(x=>S.preferences.volumes[x]>0).length===1',track))
  p.evaluate('closeSheet();updateWebAudio({playing:false,volumes:{}})')
  ck('No unhandled application JS errors',not errors,'; '.join(errors))
  p.close();d=page(b,True);d.evaluate('S.living.baseCoins=43');d.evaluate("buyItem('decor','wnSnowman057')")
  ck('New holiday purchase uses test wallet first',d.evaluate('testCoinsBreakdown().real===43&&testCoinsBreakdown().test===99999580'))
  d.evaluate("()=>{UI.pendingSpace057='greenhouse';return placeOwned('decor','wnSnowman057')}");d.evaluate('S=normalize(structuredClone(S));S=normalize(structuredClone(S));')
  ck('Test wallet does not regrant and room is preserved',d.evaluate("testCoinsBreakdown().test===99999580&&S.living.rooms057.assignments['decor:wnSnowman057']==='greenhouse'"));d.close()
 except Exception as e:traceback.print_exc();ck('Unhandled test exception',False,str(e))
 finally:
  b.close();(O/'haven-results.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2));print('RESULT',sum(x['passed']for x in rows),'/',len(rows));
  if any(not x['passed']for x in rows):raise SystemExit(1)
