from pathlib import Path
from playwright.sync_api import sync_playwright
import json,traceback
R=Path(__file__).resolve().parents[2];O=R/'tests/057';rows=[];errors=[]
def ck(n,v):rows.append({'name':n,'passed':bool(v)});print(('PASS 'if v else 'FAIL ')+n,flush=True)
with sync_playwright() as w:
 b=w.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);p=b.new_page(viewport={'width':390,'height':844},has_touch=True);p.set_default_timeout(5000);p.on('pageerror',lambda e:errors.append(str(e)))
 p.evaluate("Object.defineProperty(window,'localStorage',{value:{getItem:k=>window.__store?.[k]||null,setItem:(k,v)=>{(window.__store||={})[k]=v},removeItem:k=>delete window.__store[k]}})");p.set_content((R/'ONIZLEME.html').read_text());p.wait_for_function('ready')
 try:
  p.evaluate("()=>{route('garden');window.g=[...gardenInstances].find(g=>!g.passive);}")
  q=p.locator('.living-host canvas').bounding_box();x=q['x']+q['width']*.45;y=q['y']+q['height']*.52;cdp=p.context.new_cdp_session(p)
  def touch(t,pts):cdp.send('Input.dispatchTouchEvent',{'type':t,'touchPoints':[{'id':i+1,'x':a,'y':b}for i,(a,b)in enumerate(pts)]})
  touch('touchStart',[(x-25,y),(x+25,y)])
  for s in [31,42,51]:touch('touchMove',[(x-s,y),(x+s,y)])
  touch('touchEnd',[]);p.wait_for_timeout(80);ck('Two-finger zoom still works without +/- controls',p.evaluate('g.zoom>1.6'))
  p.evaluate('g.pan={x:0,y:0};g.paint(performance.now())');p.mouse.move(x,y);p.mouse.down();p.mouse.move(x+37,y+28,steps=5);p.mouse.up();ck('Zoomed camera pans from pointer gesture',p.evaluate('g.pan.x>20&&g.pan.y>15'))
  # Two taps on an explicitly located free patch restore fit; do not tap on an object.
  point=p.evaluate("()=>{for(let y=190;y<430;y+=13)for(let x=50;x<310;x+=13){const xx=g.fit.ox+x*g.fit.scale,yy=g.fit.oy+y*g.fit.scale;if(xx>20&&xx<g.width-20&&yy>20&&yy<g.height-20&&!g.hits.some(h=>x>=h.x&&x<=h.x+h.w&&y>=h.y&&y<=h.y+h.h))return{x:xx,y:yy}}}")
  p.mouse.dblclick(q['x']+point['x'],q['y']+point['y'],delay=50);ck('Double tap on empty garden resets zoom',p.evaluate('g.zoom===1&&g.pan.x===0&&g.pan.y===0'))
  # Existing catalogue place buttons now offer all new rooms as well.
  p.evaluate("()=>{S.living.baseCoins=10000;UI.shopTab='anatolia056';route('shop');}");p.evaluate("buyItem('decor','trCoffee056')");p.locator('[data-action=atelier-place056][data-item=trCoffee056]').click();ck('Old tea collection can target greenhouse directly',p.locator('[data-action=place-destination057][data-space=greenhouse]').count()==1)
  p.locator('[data-action=place-destination057][data-space=greenhouse]').click();p.wait_for_timeout(100);ck('Old tea object actually assigned greenhouse',p.evaluate("S.living.rooms057.assignments['decor:trCoffee056']==='greenhouse'"))
  # Drag an item and reload numeric coordinates.
  q=p.locator('.living-host canvas').bounding_box();pt=p.evaluate("()=>{window.g=[...gardenInstances].find(g=>!g.passive);const h=g.hits.find(h=>h.key==='decor:trCoffee056');return{x:g.fit.ox+(h.x+h.w/2)*g.fit.scale,y:g.fit.oy+(h.y+h.h/2)*g.fit.scale}}")
  p.evaluate("window.oldPos=structuredClone(S.living.placement['decor:trCoffee056'])");p.mouse.move(q['x']+pt['x'],q['y']+pt['y']);p.mouse.down();p.mouse.move(q['x']+pt['x']+33,q['y']+pt['y']+28,steps=6);p.mouse.up();p.wait_for_timeout(60)
  ck('Drag movable item works inside greenhouse',p.evaluate("S.living.placement['decor:trCoffee056'].x>oldPos.x+10"))
  ck('Rooms keep local state after serialized reopen',p.evaluate("()=>{const before=JSON.stringify(S.living.rooms057);S=normalize(JSON.parse(JSON.stringify(S)));return before===JSON.stringify(S.living.rooms057)}"))
  # Room inventory should not leak into focus garden background.
  p.evaluate("()=>{S.preferences.theme='garden';applyTheme();route('focus');}");ck('Focus uses garden, not last room, as passive background',p.evaluate("[...gardenInstances].some(g=>g.passive&&!g.room)"))
  p.evaluate("startFocus(1,{title:'Test work'})");ck('Starting study clears room UI and does not hold input lock',p.evaluate("S.timer?.status==='running'&&!UI.gardenRoom&&!focusBusy"))
  p.evaluate('toggleFocus()');ck('Pause preserved',p.evaluate("S.timer?.status==='paused'&&!focusBusy"));p.evaluate('toggleFocus()');ck('Resume preserved',p.evaluate("S.timer?.status==='running'&&!focusBusy"))
  p.evaluate("()=>{S.timer.status='paused';S.timer.remainingMs=20000;S.timer.remaining=20;window.beforeCoins=wallet();}");p.evaluate('endFocus(false,false)');ck('Partial saved study earns existing 3 coins/minute',p.evaluate('S.focusHistory.length===1&&wallet()-beforeCoins===2&&!S.timer'))
  p.evaluate('endFocus(false,false)');ck('Repeated end has no duplicate reward',p.evaluate('S.focusHistory.length===1&&wallet()-beforeCoins===2'))
  p.evaluate("startFocus(1,{phase:'break'})");p.evaluate("()=>{S.timer.status='paused';S.timer.remainingMs=0;S.timer.remaining=0;}");p.evaluate('endFocus(true,false)');ck('Break grants no coins',p.evaluate('wallet()-beforeCoins===2'))
  # Existing toolbar formatting kept after modal layering change.
  p.evaluate("()=>{S.notes=[{id:'format-test',title:'Deneme',html:'<p>Renkli kelimeler</p>',plainText:'Renkli kelimeler',attachments:[],updatedAt:new Date().toISOString(),category:'Genel'}];route('notes');openEditor('format-test');}")
  p.evaluate("()=>{const e=$('#rich-editor'),r=document.createRange();r.selectNodeContents(e);const s=getSelection();s.removeAllRanges();s.addRange(r);captureRange();writingTools();}")
  p.locator('#writing-panel054 [data-format=bold]').click();p.locator('#writing-panel054 [data-color="#c3567b"]').click();p.evaluate('flushEditor()')
  ck('Formatting selected text still saves bold/color',p.evaluate("getNote('format-test').html.includes('font-weight')&&getNote('format-test').html.includes('195, 86, 123')"))
  p.evaluate("closeEditor()");p.evaluate("openEditor('format-test')");ck('Saved rich text reopens',p.evaluate("$('#rich-editor').innerHTML.includes('195, 86, 123')"));p.evaluate('closeEditor()')
  ck('All three audio arrangements decode in actual browser',p.evaluate("async()=>{const ctx=new AudioContext();for(const key of ['pianoMoon','pianoDawn','pianoSakura']){const bytes=Uint8Array.from(atob(LUMA_AUDIO_DATA[key]),c=>c.charCodeAt(0));const decoded=await ctx.decodeAudioData(bytes.buffer);if(decoded.duration<80||decoded.numberOfChannels!==2)return false;}await ctx.close();return true;}"))
  ck('No uncaught JS error in gestures/study/notes',not errors)
 except Exception as e:traceback.print_exc();ck('Unexpected test error: '+str(e),False)
 finally:b.close();(O/'interaction-results.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2));print('RESULT',sum(x['passed']for x in rows),'/',len(rows))
 if any(not x['passed']for x in rows):raise SystemExit(1)
