from pathlib import Path
from playwright.sync_api import sync_playwright
import json
R=Path(__file__).resolve().parents[2];rs=[]
def ck(n,v):rs.append({'name':n,'passed':bool(v)});print(('PASS ' if v else 'FAIL ')+n)
with sync_playwright() as w:
 b=w.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);p=b.new_page(viewport={'width':390,'height':844},has_touch=True)
 p.evaluate("Object.defineProperty(window,'localStorage',{value:{getItem:k=>null,setItem:()=>{},removeItem:()=>{}}})")
 p.set_content((R/'ONIZLEME.html').read_text());p.wait_for_function('ready');p.wait_for_timeout(100)
 p.evaluate("S.preferences.motion=false;S.preferences.theme='garden';applyTheme();route('garden');window.G=()=>[...gardenInstances].find(g=>!g.passive);void 0;")
 c=p.context.new_cdp_session(p)
 c.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':145,'y':390,'id':1},{'x':235,'y':390,'id':2}]})
 for i in range(1,10):
  c.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':145-i*4,'y':390,'id':1},{'x':235+i*4,'y':390,'id':2}]});p.wait_for_timeout(20)
 c.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});p.wait_for_timeout(80)
 ck('two-finger zoom works through browser touch input',p.evaluate('G().zoom>1.3'))
 ck('pinch does not scale the entire application',p.evaluate('Math.abs(visualViewport.scale-1)<.01'))
 ck('pinch leaves camera within bounds',p.evaluate('G().pan.x===0&&G().pan.y===0'))
 p.evaluate('G().setZoom(1)');
 c.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':195,'y':440,'id':1}]})
 for i in range(1,12):
  c.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':195,'y':440-i*12,'id':1}]});p.wait_for_timeout(15)
 c.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});p.wait_for_timeout(80)
 ck('single-finger page scroll does not pan garden',p.evaluate('G().pan.x===0&&G().pan.y===0'))
 ck('page can scroll to the restored nursery',p.evaluate("$('#screen').scrollTop>0"))
 # Original growth record shape, earn enough real history seconds then harvest.
 p.evaluate("plantSeed(0,'daisy')")
 p.evaluate("S.focusHistory.push({id:'sample-session',startedAt:new Date().toISOString(),endedAt:new Date().toISOString(),completedSeconds:2100,completedMinutes:35,phase:'focus'});syncWorld(S);queueGrowth();render()")
 ck('growth is based on accumulated study seconds',p.evaluate('plantProgress(S.world.plots[0])===1'))
 p.evaluate('harvestPlant(0)')
 ck('harvest frees pot and creates planted garden item',p.evaluate("S.world.plots[0]===null&&S.world.harvested.some(p=>p.kind==='daisy')&&UI.selectedLiving.startsWith('plant:')"))
 p.evaluate('UI.gardenEdit=false;render()')
 for width,height in [(320,700),(375,812),(390,844),(430,932),(768,1024)]:
  p.set_viewport_size({'width':width,'height':height});p.wait_for_timeout(120)
  ck('garden fits screen width '+str(width),p.evaluate("$('.garden-stage').getBoundingClientRect().right<=innerWidth+1&&G().pan.x===0&&G().pan.y===0"))
  ck('portrait canvas height '+str(width),p.evaluate('Math.abs(G().height/G().width-4/3)<.01'))
  p.evaluate('weatherSheet()');p.wait_for_timeout(20)
  ck('sheet inside viewport '+str(width),p.evaluate("$('.sheet').getBoundingClientRect().top>=-1 && $('.sheet').getBoundingClientRect().bottom<=innerHeight+1"));p.evaluate('closeSheet()')
 p.set_viewport_size({'width':844,'height':390});p.evaluate('UI.gardenFull=true;render()');p.wait_for_timeout(120)
 ck('full garden has hidden navigation',p.evaluate("$('#navigation').classList.contains('hidden')"))
 ck('full garden logical fit does not retain a pan offset',p.evaluate('G().pan.x===0&&G().pan.y===0'))
 b.close()
(R/'tests/053/touch-results.json').write_text(json.dumps(rs,indent=2));print(sum(x['passed'] for x in rs),'/',len(rs))
