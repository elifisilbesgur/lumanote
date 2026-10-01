/* iOS-safe sheets: visible grip + whole header. Body swipe dismisses only from
   scrollTop=0; drawing, ranges and editable text never trigger dismissal. */
let sheetGesture053=null,sheetDismissTimer053=null;
function resetSheetGesture053(){if(sheetGesture053?.el?.isConnected){sheetGesture053.el.style.transform='';sheetGesture053.el.classList.remove('is-dragging053');}sheetGesture053=null;}
const closeSheetLiving053=closeSheet;
closeSheet=function(){resetSheetGesture053();clearTimeout(sheetDismissTimer053);closeSheetLiving053();if(!UI.overlay)document.body.classList.remove('sheet-open053');};
sheet=function(title,body,kind='generic'){
 if(inkEditor){saveInkInMemory();inkEditor=null;}resetSheetGesture053();clearTimeout(sheetDismissTimer053);
 lastFocus=document.activeElement;UI.overlay=kind;document.body.classList.add('sheet-open053');
 $('#overlay-root').innerHTML=`<div class="modal-backdrop" data-action="backdrop"><section class="sheet" data-kind="${esc(kind)}" role="dialog" aria-modal="true" aria-label="${esc(title)}" tabindex="-1"><div class="sheet-drag-zone053" role="button" tabindex="0" aria-label="Menüyü aşağı sürükleyerek kapat"></div><div class="sheet-head"><h2>${esc(title)}</h2><button class="icon-btn clear" data-action="close" aria-label="Kapat">${icon('close',19)}</button></div><div class="sheet-body053">${body}</div></section></div>`;
 const node=$('.sheet');setTimeout(()=>node?.isConnected&&node.focus({preventScroll:true}),30);
};
function sheetGestureStart053(target,x,y,id,source){if(!(target instanceof Element))return;
 const el=target.closest('.sheet');if(!el)return;
 const grip=target.closest('.sheet-drag-zone053,.sheet-head'),body=target.closest('.sheet-body053');
 if(target.closest('button,input,textarea,select,a,[contenteditable],canvas,[data-no-dismiss]'))return;
 if(!grip&&(!body||body.scrollTop>1||['ink','pdf'].includes(UI.overlay)))return;
 sheetGesture053={el,body,startX:x,startY:y,lastY:y,start:performance.now(),delta:0,id,source,grip:!!grip,claimed:false};
}
function sheetGestureMove053(x,y,event){const d=sheetGesture053;if(!d||!d.el.isConnected)return;const dx=x-d.startX,dy=y-d.startY;
 if(!d.claimed){if(Math.abs(dx)>12&&Math.abs(dx)>Math.abs(dy)){resetSheetGesture053();return;}if(dy<-6||d.body?.scrollTop>1){resetSheetGesture053();return;}if(dy<6)return;d.claimed=true;d.el.classList.add('is-dragging053');}
 d.delta=Math.max(0,dy);d.lastY=y;d.el.style.transform=`translate3d(0,${d.delta}px,0)`;if(event.cancelable)event.preventDefault();
}
function sheetGestureEnd053(cancel=false){const d=sheetGesture053;if(!d)return;sheetGesture053=null;if(!d.el.isConnected)return;
 const speed=d.delta/Math.max(1,performance.now()-d.start),threshold=Math.min(90,d.el.clientHeight*.2);
 if(!cancel&&(d.delta>threshold||(d.delta>30&&speed>.55))){
  if(typeof pdfView!=='undefined'&&pdfView?.exporting){d.el.style.transform='';d.el.classList.remove('is-dragging053');toast('PDF kopyası hazırlanıyor.');return;}
  const kind=UI.overlay;d.el.style.transition='transform 160ms ease-out';d.el.style.transform=`translateY(${d.el.clientHeight+40}px)`;
  sheetDismissTimer053=setTimeout(()=>{if(!d.el.isConnected)return;closeSheet();if(['backup-preview','backup-unlock'].includes(kind))Native.call('cancelBackupImport').catch(()=>{});},170);
 }else{d.el.classList.remove('is-dragging053');d.el.style.transition='transform 160ms ease-out';d.el.style.transform='';}
}
document.addEventListener('touchstart',e=>{if(e.touches.length!==1){resetSheetGesture053();return;}const t=e.touches[0];sheetGestureStart053(e.target,t.clientX,t.clientY,t.identifier,'touch');},{passive:true,capture:true});
document.addEventListener('touchmove',e=>{if(sheetGesture053?.source!=='touch')return;const t=Array.from(e.touches).find(t=>t.identifier===sheetGesture053.id);if(t)sheetGestureMove053(t.clientX,t.clientY,e);},{passive:false,capture:true});
document.addEventListener('touchend',e=>{if(sheetGesture053?.source==='touch'&&Array.from(e.changedTouches).some(t=>t.identifier===sheetGesture053.id))sheetGestureEnd053();},{passive:true,capture:true});
document.addEventListener('touchcancel',()=>{if(sheetGesture053?.source==='touch')sheetGestureEnd053(true);},{passive:true,capture:true});
document.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')return;sheetGestureStart053(e.target,e.clientX,e.clientY,e.pointerId,'pointer');if(sheetGesture053?.grip){e.target.closest('.sheet-drag-zone053,.sheet-head')?.setPointerCapture?.(e.pointerId);}},{capture:true});
document.addEventListener('pointermove',e=>{if(sheetGesture053?.source==='pointer'&&sheetGesture053.id===e.pointerId)sheetGestureMove053(e.clientX,e.clientY,e);},{passive:false,capture:true});
document.addEventListener('pointerup',()=>{if(sheetGesture053?.source==='pointer')sheetGestureEnd053();},{capture:true});
document.addEventListener('pointercancel',()=>{if(sheetGesture053?.source==='pointer')sheetGestureEnd053(true);},{capture:true});
document.addEventListener('keydown',e=>{if(e.target.closest?.('.sheet-drag-zone053')&&['Enter',' '].includes(e.key)){e.preventDefault();closeSheet();}});
// Avoid dispatching a click at a new target after a completed sheet drag.
let lastDismissAt053=0;
const finishGesture053=sheetGestureEnd053;
sheetGestureEnd053=function(cancel){if(sheetGesture053?.delta>20)lastDismissAt053=Date.now();finishGesture053(cancel);};
document.addEventListener('click',e=>{if(Date.now()-lastDismissAt053<250){e.preventDefault();e.stopImmediatePropagation();}},{capture:true});
const receiveBefore053=window.__lumaReceive;
window.__lumaReceive=msg=>{receiveBefore053(msg);const m=typeof msg==='string'?(()=>{try{return JSON.parse(msg)}catch{return {}}})():msg;
 if(m?.type==='background')for(const g of gardenInstances)g.pause();if(m?.type==='resume')for(const g of gardenInstances)g.resume();};

// Local debugging only: surface WebView exceptions in Metro instead of hiding
// behind unrelated SDK warnings. Never send note text or state snapshots.
let lastDiagnostic053=0;
function uiDiagnostic053(kind,error){if(!Native.active||Date.now()-lastDiagnostic053<2000)return;lastDiagnostic053=Date.now();Native.call('diagnostic',{event:kind,message:String(error?.message||error||'Bilinmeyen hata').slice(0,320),route:UI.route}).catch(()=>{});}
window.addEventListener('error',e=>uiDiagnostic053('javascript',e.error||e.message));
window.addEventListener('unhandledrejection',e=>uiDiagnostic053('promise',e.reason));
