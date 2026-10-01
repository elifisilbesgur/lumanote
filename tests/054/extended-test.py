from pathlib import Path
from playwright.sync_api import sync_playwright
import json,traceback
R=Path(__file__).resolve().parents[2];O=R/'tests/054';rows=[]
def ck(n,v):rows.append({'name':n,'pass':bool(v)});print(('PASS ' if v else 'FAIL ')+n,flush=True)
with sync_playwright() as w:
 b=w.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader']);p=b.new_page(viewport={'width':390,'height':844},has_touch=True);p.set_default_timeout(6000);errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
 p.evaluate("Object.defineProperty(window,'localStorage',{value:{getItem:k=>window.__store?.[k]||null,setItem:(k,v)=>{(window.__store||={})[k]=v}}})")
 try:
  p.set_content((R/'ONIZLEME.html').read_text());p.wait_for_function('ready')
  ck('Furniture bounds constrained indoors',p.evaluate("()=>{const a=constrainPlacement054('decor:sofa',{x:-500,y:-100,room:true}),z=constrainPlacement054('decor:sofa',{x:800,y:700,room:true});return a.x===78&&a.y===120&&z.x===402&&z.y===286}"))
  ck('Large outdoor model bounds constrained',p.evaluate("()=>{const a=constrainPlacement054('decor:gazebo',{x:-500,y:-100,room:false}),z=constrainPlacement054('decor:gazebo',{x:800,y:700,room:false});return a.x>30&&z.x<450&&z.y<=292}"))
  ck('Mode field cannot activate unowned purchase',p.evaluate("()=>{const v=JSON.parse(JSON.stringify(S));v.living.atmosphere='winter';return normalize(v).living.atmosphere==='normal'}"))
  p.evaluate("()=>{window.confirmOriginal054=confirmAction;window.resolveConfirm054=null;window.countConfirm054=0;confirmAction=()=>{countConfirm054++;return new Promise(r=>resolveConfirm054=r)};S.living.baseCoins=10000;window.buy1= purchaseAtmosphere054('sakura');window.buy2= purchaseAtmosphere054('sakura');}")
  ck('Concurrent mode purchase opens one confirmation',p.evaluate('countConfirm054===1&&seasonalBusy054'))
  p.evaluate('()=>{resolveConfirm054(true)}');p.wait_for_function("ownsAtmosphere054('sakura')")
  ck('Concurrent mode purchase charges once',p.evaluate("wallet()===5500&&S.world.purchases.filter(x=>x.item==='modeSakura').length===1"))
  p.evaluate("()=>{confirmAction=confirmOriginal054;UI.trash=false;UI.archived=false;S.notes=[0,1,2].map(i=>({id:'b'+i,title:'Not '+i,html:'<p>Metin</p>',plainText:'Metin',updatedAt:new Date().toISOString(),createdAt:new Date().toISOString(),attachments:[]}));route('notes');beginNoteSelection054('b0')}")
  p.locator('[data-action=notes-select-all054]').click();ck('Select all marks active list',p.evaluate('selection054().size===3'))
  p.locator('[data-action=notes-select-all054]').click();ck('Second select all clears selection',p.evaluate('selection054().size===0'))
  p.evaluate("()=>{UI.noteSelection054=new Set(['b0','b1']);window.confirmOriginal054=confirmAction;confirmAction=async()=>true}");p.evaluate("bulkApply054('trash')")
  p.evaluate("()=>{UI.trash=true;route('notes');beginNoteSelection054('b0')}");p.evaluate("bulkApply054('restore')")
  ck('Trash bulk restore affects selected only',p.evaluate("!getNote('b0').deletedAt&&!!getNote('b1').deletedAt&&!getNote('b2').deletedAt"))
  p.evaluate("beginNoteSelection054('b1')");p.evaluate("bulkApply054('delete')")
  ck('Permanent delete limited to selected trashed note',p.evaluate("S.notes.length===2&&!getNote('b1')&&!!getNote('b0')&&!!getNote('b2')"))
  p.evaluate("()=>{UI.trash=false;UI.archived=false;UI.noteSelection054=new Set(['b0']);}");p.evaluate("bulkApply054('archive')")
  ck('Bulk archive non-selected unchanged',p.evaluate("getNote('b0').archived&&!getNote('b2').archived"))
  p.evaluate("()=>{UI.archived=true;UI.noteSelection054=new Set(['b0'])}");p.evaluate("bulkApply054('archive')")
  ck('Bulk unarchive restores active list',p.evaluate("!getNote('b0').archived&&!getNote('b2').archived"))
  p.evaluate("()=>{UI.trash=false;UI.archived=false;UI.noteSelection054=new Set(['b0']);countConfirm054=0;confirmAction=()=>{countConfirm054++;return new Promise(r=>resolveConfirm054=r)};window.bulk1=bulkApply054('trash');window.bulk2=bulkApply054('trash')}")
  ck('Concurrent bulk trash opens one confirmation',p.evaluate('countConfirm054===1&&bulkBusy054'))
  p.evaluate('()=>{resolveConfirm054(false)}');p.wait_for_function('!bulkBusy054');ck('Cancelled bulk leaves notes intact',p.evaluate('S.notes.every(x=>!x.deletedAt)'))
  p.evaluate("()=>{confirmAction=confirmOriginal054;UI.noteSelection054=null;route('garden');UI.gardenRoom=false;render();UI.selectedLiving='decor:desk';updateGardenSelection()}")
  ck('Hidden interior selection cleared outdoors',p.evaluate('UI.selectedLiving===null'))
  p.evaluate('()=>{UI.gardenRoom=true;render();UI.gardenEdit=true;UI.selectedLiving="decor:desk";updateGardenSelection()}')
  for _ in range(65):p.evaluate("enhancedAction('living-nudge',{dataset:{direction:'left'}},{})")
  ck('Repeated arrow cannot leave interior',p.evaluate("S.living.placement['decor:desk'].x>=77.5"))
  p.evaluate("()=>{const orig=S.living.placement['decor:desk'];window.oldPlace054=JSON.stringify(orig);window.oldPersist054=persist;persist=async()=>{throw Error('disk')} }")
  msg=p.evaluate("enhancedAction('living-nudge',{dataset:{direction:'right'}},{}).then(()=>null).catch(e=>e.message)")
  ck('Failed move persistence rolls back',msg=='disk' and p.evaluate("JSON.stringify(S.living.placement['decor:desk'])===oldPlace054"))
  p.evaluate("()=>{persist=oldPersist054;UI.gardenRoom=false;UI.gardenEdit=false;route('garden');S.preferences.motion=false;render()}")
  p.wait_for_timeout(100)
  ck('Outdoor camera still centered after room edit',p.evaluate('[...gardenInstances].filter(x=>!x.passive).every(x=>x.pan.x===0&&x.pan.y===0)'))
  # CDP sends touch events through Chromium input, not direct JS handlers.
  p.evaluate('weatherSheet()');p.wait_for_timeout(350);r=p.locator('.sheet-drag-zone053').bounding_box();x=r['x']+120;y=r['y']+18
  c=p.context.new_cdp_session(p);c.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y}]})
  for dy in [20,50,95,155]:c.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x,'y':y+dy}]})
  c.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});p.wait_for_timeout(450)
  ck('Actual browser touch swipe dismisses weather sheet',p.evaluate('!UI.overlay'))
  ck('No browser errors in extended scenarios',not errors)
 except Exception:
  rows.append({'name':'Unexpected exception','pass':False,'detail':traceback.format_exc()});print(traceback.format_exc())
 finally:
  (O/'extended-results.json').write_text(json.dumps({'checks':rows,'passed':sum(x['pass'] for x in rows),'total':len(rows),'errors':errors},indent=2));print('RESULT',sum(x['pass'] for x in rows),'/',len(rows));b.close()
