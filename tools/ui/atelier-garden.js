/* Bounded camera uses world coordinates. At fit, one finger scrolls the page;
   after zoom it moves the camera, not the world or the items. All state commits
   remain in existing storage; a cancelled item drag restores its old position. */
const GardenBefore056=LivingGarden;
LivingGarden=class AtelierGarden056 extends GardenBefore056 {
 constructor(host,options={}) {
  super(host,options);this.syncTouch056();this.touchPinch056=null;this.lastTap056=0;
  this.canvas.addEventListener('touchstart',e=>{
   if(this.passive||UI.overlay||e.touches.length!==2)return;
   this.rollbackDrag056();this.drag=null;this.pointers.clear();this.pinch=null;
   const [a,b]=e.touches,r=this.canvas.getBoundingClientRect();
   this.touchPinch056={distance:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),zoom:this.zoom,anchor:this.coord({clientX:(a.clientX+b.clientX)/2,clientY:(a.clientY+b.clientY)/2})};
   this.touchBlock056=true;if(e.cancelable)e.preventDefault();
  },{passive:false});
  this.canvas.addEventListener('touchmove',e=>{
   if(!this.touchPinch056||e.touches.length!==2)return;
   if(e.cancelable)e.preventDefault();const [a,b]=e.touches,p=this.touchPinch056,r=this.canvas.getBoundingClientRect();
   this.zoom=clamp(p.zoom*Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)/Math.max(1,p.distance),1,2.7);
   const scale=this.baseScale056()*this.zoom;
   this.pan={x:(a.clientX+b.clientX)/2-r.left-(this.width-this.world.width*scale)/2-p.anchor.x*scale,y:(a.clientY+b.clientY)/2-r.top-(this.height-this.world.height*scale)/2-p.anchor.y*scale};
   this.clampCamera();this.syncTouch056();this.paint(performance.now());
  },{passive:false});
  const end=e=>{if(e.touches.length<2)this.touchPinch056=null;if(!e.touches.length){this.touchBlock056=false;this.pointers.clear();this.pinch=null;this.drag=null;this.syncTouch056();}};
  this.canvas.addEventListener('touchend',end,{passive:true});this.canvas.addEventListener('touchcancel',end,{passive:true});
  this.canvas.addEventListener('wheel',()=>this.syncTouch056(),{passive:true});
 }
 baseScale056(){return Math.max(this.width/this.world.width,this.height/this.world.height);}
 clampCamera(){const scale=this.baseScale056()*this.zoom,w=this.world.width,h=this.world.height,mx=Math.max(0,(w*scale-this.width)/2),my=Math.max(0,(h*scale-this.height)/2);this.pan.x=clamp(this.pan.x,-mx,mx);this.pan.y=clamp(this.pan.y,-my,my);return {scale,ox:(this.width-w*scale)/2+this.pan.x,oy:(this.height-h*scale)/2+this.pan.y};}
 syncTouch056(){if(this.canvas)this.canvas.style.touchAction=this.passive?'none':UI.gardenEdit||this.zoom>1.01||this.full?'none':'pan-y';}
 setZoom(z){this.zoom=clamp(z,1,2.7);if(this.zoom===1)this.pan={x:0,y:0};this.clampCamera();this.syncTouch056();this.paint(performance.now());}
 rollbackDrag056(){const d=this.drag;if(d?.remembered&&d.hit?.key){if(d.before)S.living.placement[d.hit.key]=d.before;else delete S.living.placement[d.hit.key];}if(d?.groundBefore)S.living.ground=JSON.parse(d.groundBefore);}
 down(e){if(this.passive||UI.overlay||this.touchBlock056)return;
  if(this.zoom<=1.01&&!UI.gardenEdit&&!this.full)return super.down(e);
  e.preventDefault();this.canvas.setPointerCapture?.(e.pointerId);this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(this.pointers.size===2){this.rollbackDrag056();this.drag=null;const a=[...this.pointers.values()];this.pinch={zoom:this.zoom,distance:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),pan:{...this.pan}};return;}
  const p=this.coord(e),hit=[...this.hits].reverse().find(h=>p.x>=h.x&&p.x<=h.x+h.w&&p.y>=h.y&&p.y<=h.y+h.h);
  this.drag={id:e.pointerId,sx:e.clientX,sy:e.clientY,pan:{...this.pan},hit,moved:false,before:hit?.key&&S.living.placement[hit.key]?{...S.living.placement[hit.key]}:null,camera:!UI.gardenEdit||(!hit?.key&&!UI.groundBrush)};
  if(UI.gardenEdit&&hit?.key&&!UI.groundBrush){UI.selectedLiving=hit.key;updateGardenSelection();this.paint(performance.now());}
  if(UI.gardenEdit&&UI.groundBrush){this.drag.brush=true;this.drag.camera=false;this.drag.groundBefore=JSON.stringify(S.living.ground);rememberGarden();this.brushAt(this.layoutPoint(p));}
 }
 move(e){if(this.touchBlock056||!this.pointers.has(e.pointerId))return;
  this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(this.pointers.size===2&&this.pinch){if(e.cancelable)e.preventDefault();const a=[...this.pointers.values()];this.setZoom(this.pinch.zoom*Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)/Math.max(1,this.pinch.distance));return;}
  const d=this.drag;if(!d)return;const dx=e.clientX-d.sx,dy=e.clientY-d.sy;if(Math.hypot(dx,dy)>7)d.moved=true;
  if(d.camera&&d.moved){if(e.cancelable)e.preventDefault();this.pan={x:d.pan.x+dx,y:d.pan.y+dy};this.clampCamera();this.paint(performance.now());return;}
  return super.move(e);
 }
 async up(e,cancel=false){if(this.touchBlock056){this.pointers.delete(e.pointerId);return;}
  const d=this.drag;if(d?.camera&&d.moved){this.pointers.delete(e.pointerId);this.drag=null;if(cancel){this.pan=d.pan;this.clampCamera();this.paint(performance.now());}return;}
  if(d?.remembered||d?.brush){this.pointers.delete(e.pointerId);this.drag=null;
   if(cancel){this.drag=d;this.rollbackDrag056();this.drag=null;this.paint(performance.now());return;}
   try{await persist(true);}catch(err){this.drag=d;this.rollbackDrag056();this.drag=null;this.paint(performance.now());toast('Yerleşim kaydedilemedi. Önceki konum korundu.');}return;
  }
  if(!cancel&&d&&!d.moved&&!UI.gardenEdit&&d.hit?.kind==='memorial'){this.pointers.delete(e.pointerId);this.drag=null;openMemorial056(d.hit.key.slice(9));return;}
  if(!cancel&&d&&!d.moved&&!d.hit&&!UI.gardenEdit){const now=Date.now();if(now-this.lastTap056<320){this.pointers.delete(e.pointerId);this.drag=null;this.setZoom(this.zoom>1?1:1.8);this.lastTap056=0;return;}this.lastTap056=now;}
  return super.up(e,cancel);
 }
};
stableToolbar=function(){return `<div class="garden-tools"><button class="icon-btn" data-action="garden-full" aria-label="${UI.gardenFull?'Tam ekrandan çık':'Tam ekran'}">${icon(UI.gardenFull?'shrink':'expand',19)}</button>${UI.gardenRoom?`<button class="icon-btn" data-action="living-exit-room" aria-label="Bahçeye dön">${icon('back',18)}</button>`:''}</div>`;};
function memorySection056(){return `<section class="memories056" aria-labelledby="memories-title056"><div class="section-top"><h2 id="memories-title056">Anı bahçem</h2><button class="text-btn" data-action="living-memorial">${icon('plus',15)} Anı dik</button></div>${S.living.memorials.length?`<div class="memories-list056">${S.living.memorials.map(m=>`<button data-action="memory-detail056" data-id="${esc(m.id)}">${pixel(m.kind||'tree',38)}<span><strong>${esc(m.name)}</strong><small>${m.hidden?'Saklı anı · yeniden dik':'Bahçede · yerini değiştir'}</small></span>${icon('chevron',14)}</button>`).join('')}</div>`:'<button class="memory-empty056" data-action="living-memorial">'+pixel('flower',42)+'<span><strong>Bir anını burada büyüt.</strong><small>İlk çalışmandan sonra bir çiçek veya ağaç dik.</small></span>'+icon('plus',18)+'</button>'}</section>`;}
const renderGardenBefore056=renderGarden;
renderGarden=function(){let html=renderGardenBefore056();if(!UI.gardenFull&&!UI.gardenRoom){html=html.replace(/<\/section>(?=<button class="weekly-link")/,()=>'</section>'+memorySection056());html=html.replace('<div class="garden-dock">','<div class="camera-hint056">İki parmakla yakınlaş · yakınken sürükle</div><div class="garden-dock">');}return html;};
function memorialForm056(m){sheet(m?'Anımı düzenle':'Bir anıyı büyüt',`<form id="memory056-form" data-id="${m?esc(m.id):''}"><label class="field"><span>Anının adı</span><input name="name" maxlength="60" value="${esc(m?.name||'')}" placeholder="İlk projem tamamlandı" required></label><div class="memory-kinds056">${[['flower','Çiçek'],['tulip','Lale'],['lavender','Lavanta'],['tree','Ağaç']].map(([id,label])=>`<label><input type="radio" name="kind" value="${id}" ${id===(m?.kind||'flower')?'checked':''}>${pixel(id,40)}<span>${label}</span></label>`).join('')}</div><button class="btn primary full" type="submit">${m?'Kaydet':'Anıyı dik'}</button><p class="hint">Ücretsiz · çalışma süreni veya jetonlarını değiştirmez. En fazla 20 anı.</p></form>`,'memory056');}
function openMemorial056(id){const m=S.living.memorials.find(m=>m.id===id);if(!m)return;sheet(m.name,`<div class="sakura-preview055">${pixel(m.kind||'tree',106)}</div><button class="btn primary full" data-action="memory-move056" data-id="${esc(id)}">${m.hidden?'Bahçeye yeniden dik':'Yerini değiştir'}</button><button class="btn ghost full" data-action="memory-edit056" data-id="${esc(id)}">Adını / bitkisini düzenle</button><button class="text-btn full" data-action="memory-hide056" data-id="${esc(id)}">${m.hidden?'Saklı kalıyor':'Bahçeden kaldır · anıyı sakla'}</button>`,'memory-detail');}
const gardenActionBefore056=enhancedAction;
enhancedAction=async function(name,el,e){const d=el.dataset;
 if(name==='living-memorial'){memorialForm056();return true;}
 if(name==='memory-detail056'){openMemorial056(d.id);return true;}
 if(name==='memory-edit056'){const m=S.living.memorials.find(m=>m.id===d.id);if(m)memorialForm056(m);return true;}
 if(name==='memory-move056'){const m=S.living.memorials.find(m=>m.id===d.id);if(!m)return true;const was=m.hidden;m.hidden=false;try{await persist(true);}catch(err){m.hidden=was;throw err;}UI.gardenRoom=false;UI.gardenEdit=true;UI.groundBrush=null;UI.selectedLiving='memorial:'+m.id;closeSheet();route('garden');return true;}
 if(name==='memory-hide056'||name==='living-remove'&&UI.selectedLiving?.startsWith('memorial:')){const m=S.living.memorials.find(m=>m.id===(d.id||UI.selectedLiving.slice(9)));if(m){const old=m.hidden;m.hidden=true;try{await persist(true);}catch(err){m.hidden=old;throw err;}UI.selectedLiving=null;closeSheet();render();}return true;}
 return gardenActionBefore056(name,el,e);
};
const submitBefore056=enhancedSubmit;
enhancedSubmit=async function(form){if(form.id!=='memory056-form')return submitBefore056(form);if(!form.reportValidity())return true;const f=new FormData(form),name=String(f.get('name')||'').trim().slice(0,60),kind=String(f.get('kind'));if(!name||!['flower','tree','tulip','lavender'].includes(kind))return true;
 const id=form.dataset.id;let m=S.living.memorials.find(m=>m.id===id);if(!m&&!S.focusHistory.some(s=>s.phase!=='break'&&s.completedMinutes>0)){toast('İlk çalışmanı kaydettikten sonra bir anı dikebilirsin.');return true;}if(!m&&S.living.memorials.length>=20){toast('En fazla 20 anı saklanabilir.');return true;}
 const before=structuredClone(S.living);if(m){m.name=name;m.kind=kind;}else{m={id:uid(),name,kind,createdAt:new Date().toISOString(),hidden:false};S.living.memorials.push(m);S.living.placement['memorial:'+m.id]={x:246,y:252,room:false};}
 try{await persist(true);}catch(err){S.living=before;throw err;}UI.gardenRoom=false;UI.gardenEdit=true;UI.groundBrush=null;UI.selectedLiving='memorial:'+m.id;closeSheet();route('garden');toast('Anını oklarla veya sürükleyerek yerleştir.');return true;
};
// Tea steam and candle flame are visual only: no hidden audio channels.
const artBeforeAtelier056=LivingGarden.prototype.art054;
LivingGarden.prototype.art054=function(kind,x,y,size,t=0){artBeforeAtelier056.call(this,kind,x,y,size,t);if(!ANATOLIA056[kind]||document.body.classList.contains('no-motion'))return;const c=this.ctx;c.save();c.translate(x-size/2,y-size);c.scale(size/64,size/64);
 if(['trTea056','trKettle056','trCoffee056','trCezve056'].includes(kind))for(let i=0;i<3;i++){const q=(t*.22+i/3)%1;c.globalAlpha=(1-q)*.42;this.rect(30+Math.sin(q*7+i)*3,17-q*12,2,4,'#e8e9dd');}
 if(kind==='trCandle056'){c.globalAlpha=.5+.2*Math.sin(t*3);this.rect(27,12,2,5,'#fff3b4');}c.restore();};
