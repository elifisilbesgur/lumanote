/* Version 0.4 interaction layer. Existing note and planner actions stay intact. */
async function enhancedAction(name,el,e){
 const d=el.dataset;
 switch(name){
  case 'pet-sheet':petSheet();return true;
  case 'select-pet':await selectPet(d.item);return true;
  case 'companion':await selectPet(d.pet);return true;
  case 'shop-tab':UI.shopTab=['pets','decor','scenery'].includes(d.tab)?d.tab:'pets';render();return true;
  case 'buy-item':await buyItem(d.type,d.item);return true;
  case 'place-owned':await placeOwned(d.type,d.item);return true;
  case 'inventory':inventorySheet();return true;
  case 'scenery-sheet':sheet('Manzara',sceneryCards(),'scenery');return true;
  case 'select-scenery':{
   const item=SCENERIES[d.key];if(!item)return true;
   if(worldSeconds()/60<item.minutes){toast(`${Math.ceil(item.minutes-worldSeconds()/60)} dakika odak daha.`);return true;}
   S.world.background=d.key;await persist(true);closeSheet();render();return true;
  }
  case 'garden-edit':UI.gardenEdit=!UI.gardenEdit;UI.selectedWorldItem=null;await persist(true);render();return true;
  case 'world-item':
   if(Date.now()<(UI.ignoreWorldClickUntil||0))return true;
   if(UI.gardenEdit){UI.selectedWorldItem=d.item;render();}
   else {const item=getWorldItem(d.item);if(item?.type==='pet')petSheet();else if(item?.type==='plant')toast('Bahçende kalıcı olarak büyüyor.');}
   return true;
  case 'world-nudge':{if(!UI.selectedWorldItem){toast('Önce bir öğe seç.');return true;}const item=getWorldItem(UI.selectedWorldItem);if(!item)return true;const delta={left:[-3,0],right:[3,0],up:[0,-3],down:[0,3]}[d.direction];if(delta){moveWorldItem(item.id,item.x+delta[0],item.y+delta[1]);await persist(true);}return true;}
  case 'world-remove':{
   const item=getWorldItem(UI.selectedWorldItem);if(!item){toast('Önce bir öğe seç.');return true;}
   if(item.type==='pet'&&item.item===S.preferences.companion){toast('Yol arkadaşın bahçede kalır. Başka bir arkadaş seçebilirsin.');return true;}
   S.world.layout=S.world.layout.filter(x=>x.id!==item.id);UI.selectedWorldItem=null;await persist(true);render();toast('Koleksiyonuna kaldırıldı.');return true;
  }
  case 'seed-sheet':seedSheet(Number(d.slot));return true;
  case 'plant-seed':await plantSeed(Number(d.slot),d.kind);return true;
  case 'harvest':await harvestPlant(Number(d.slot));return true;
  case 'water':{const p=S.world.plots[Number(d.slot)];if(p){p.watered=true;await persist(true);seedSheet(Number(d.slot));}return true;}
  case 'pot-sheet':potSheet();return true;
  case 'select-pot':{
   if(d.item!=='clay'&&!owns('decor',d.item)){if(await confirmAction('Saksıyı al',`${DECOR[d.item]?.name} · ${DECOR[d.item]?.price} jeton`,'Satın al'))await buyItem('decor',d.item);}
   if(d.item==='clay'||owns('decor',d.item)){S.world.pot=d.item;await persist(true);closeSheet();render();}return true;
  }
  case 'economy-info':sheet('Jetonlar',`<div class="reading-content"><h3>1 dakika odak = 3 jeton</h3><p>Çalışma bittiğinde ya da kısmi kaydedildiğinde kazanırsın. Kısa oturumların saniyeleri birleşir. Molalar jeton kazandırmaz.</p><p>Jetonlarla arkadaş ve dekor alırsın. Manzaralar toplam odak sürenle açılır; jeton harcatmaz.</p><p>Eski odak geçmişin bir kez hesaba katılır. Ara verdiğinde jetonların azalmaz, hayvanların kaybolmaz, bitkilerin solmaz.</p><p>Bu cihazda tutulan bir motivasyon sistemidir; gerçek para, ödül çekilişi veya satın alma yoktur.</p></div>`,'economy');return true;
  case 'week-prev':UI.weekStart=addDays(UI.weekStart||mondayFor(),-7);render();return true;
  case 'week-next':{const next=addDays(UI.weekStart||mondayFor(),7);if(next<=mondayFor())UI.weekStart=next;render();return true;}
  case 'week-day':{const sessions=S.focusHistory.filter(s=>s.phase!=='break'&&localDay(new Date(s.endedAt))===d.day);sheet(fmtDate(d.day),sessions.map(s=>`<button class="history-row" data-action="session-detail" data-id="${esc(s.id)}">${icon('focus',18)}<div class="grow"><h3>${esc(s.title||'Odak')}</h3></div><strong>${Math.round(s.completedMinutes)} dk</strong></button>`).join('')||'<p class="hint">Bu gün için kayıt yok.</p>','week-day');return true;}
  case 'week-goal':weeklyGoalSheet(false);return true;
  case 'week-reflection':weeklyGoalSheet(true);return true;
  case 'weekly-to-note':await weeklyToNote();return true;
  case 'export-backup':exportBackupSheet();return true;
  case 'import-backup':await beginBackupImport();return true;
  case 'share-backup':{
   if(!S.backupInfo?.fileName){toast('Önce bir yedek oluştur.');return true;}
   await Native.call('shareBackup',{fileName:S.backupInfo.fileName});
   toast(Native.active?'Dosyayı paylaşım menüsünden güvenli bir yere kaydet.':'İndirme dosyalarını kontrol et.');return true;
  }
  case 'backup-commit':await restorePreviewedBackup();return true;
  case 'theme':{if(!themes[d.theme])return true;const open=UI.overlay==='lava';S.preferences.theme=d.theme;await persist(true);currentLava?.destroy();currentLava=null;applyTheme();render();if(open)lavaSheet();return true;}
  case 'editor-more-tools':{const tools=$('.editor-format');if(tools){tools.classList.toggle('expanded');el.setAttribute('aria-expanded',tools.classList.contains('expanded')?'true':'false');}return true;}
  case 'close':case 'backdrop':
   if((name==='close'||e.target===el)&&['backup-preview','backup-unlock'].includes(UI.overlay)){UI.backupPreview=null;await Native.call('cancelBackupImport').catch(()=>{});}return false;
  default:return false;
 }
}
async function enhancedSubmit(form){
 if(form.id==='pet-name-form'){if(!form.reportValidity())return true;S.world.petNames[S.preferences.companion]=String(new FormData(form).get('petName')||'').trim().slice(0,22);await persist(true);closeSheet();if(!UI.editorId)render();toast('İsmi kaydedildi.');return true;}
 if(form.id==='week-goal-form'){if(!form.reportValidity())return true;const data=new FormData(form),key=String(data.get('week'));if(!/^\d{4}-\d{2}-\d{2}$/.test(key))return true;const g=S.weeklyGoals[key]||{minutes:0,intention:'',reflection:''};if(data.has('minutes')){g.minutes=Math.round(clamp(data.get('minutes'),0,6000));g.intention=String(data.get('intention')||'').trim().slice(0,200);}if(data.has('reflection'))g.reflection=String(data.get('reflection')||'').trim().slice(0,1500);S.weeklyGoals[key]=g;await persist(true);closeSheet();render();return true;}
 return await submitBackupForm(form);
}
document.addEventListener('change',e=>{
 if(e.target.id==='backup-encrypted'){
  const encrypted=e.target.checked;$('#backup-password-fields')?.classList.toggle('hidden',!encrypted);$('#backup-plain-warning')?.classList.toggle('hidden',encrypted);
  $$('#backup-password-fields input').forEach(input=>{input.required=encrypted;input.disabled=!encrypted;if(!encrypted)input.value='';});
 }
});
let worldDrag=null;
document.addEventListener('pointerdown',e=>{
 const el=e.target.closest?.('[data-world-id]');if(!el||!UI.gardenEdit)return;
 const world=$('#pixel-world'),item=getWorldItem(el.dataset.worldId);if(!world||!item)return;
 UI.selectedWorldItem=item.id;$$('.world-item').forEach(n=>n.classList.toggle('selected',n.dataset.worldId===item.id));
 worldDrag={id:item.id,el,rect:world.getBoundingClientRect(),x:e.clientX,y:e.clientY,beforeX:item.x,beforeY:item.y,moved:false};
 el.setPointerCapture?.(e.pointerId);e.preventDefault();
});
document.addEventListener('pointermove',e=>{if(!worldDrag)return;const d=worldDrag,dx=e.clientX-d.x,dy=e.clientY-d.y;if(Math.abs(dx)+Math.abs(dy)>4)d.moved=true;if(d.moved){moveWorldItem(d.id,d.beforeX+dx/d.rect.width*100,d.beforeY+dy/d.rect.height*100);e.preventDefault();}});
async function finishWorldDrag(e,cancel=false){if(!worldDrag)return;const d=worldDrag;worldDrag=null;if(cancel)moveWorldItem(d.id,d.beforeX,d.beforeY);UI.ignoreWorldClickUntil=Date.now()+350;try{await persist(true);if(UI.route==='garden')render();}catch(err){moveWorldItem(d.id,d.beforeX,d.beforeY);toast('Yerleşim kaydedilemedi.');}}
document.addEventListener('pointerup',e=>finishWorldDrag(e));document.addEventListener('pointercancel',e=>finishWorldDrag(e,true));
document.addEventListener('keydown',e=>{const el=e.target.closest?.('[data-world-id]');if(!UI.gardenEdit||!el)return;const map={ArrowLeft:[-2,0],ArrowRight:[2,0],ArrowUp:[0,-2],ArrowDown:[0,2]},delta=map[e.key];if(delta){e.preventDefault();const item=getWorldItem(el.dataset.worldId);moveWorldItem(item.id,item.x+delta[0],item.y+delta[1]);persist(true).catch(err=>toast(err.message));}});
