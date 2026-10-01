/* 0.5.3: a fixed portrait viewport. Camera movement and item movement are separate.
   Saved item coordinates remain in the 0.5 coordinate system; no lossy migration. */
function sceneryProfile(){return SCENERIES[S.world.background]||SCENERIES.night;}
gardenTime=function(){if(S.living.time!=='auto')return S.living.time;return ({night:'night',cosmic:'night',meadow:'day',pond:'dusk',autumn:'dusk',snow:'day'})[S.world.background]||'night';};
gardenWeather=function(){if(S.living.weather!=='auto')return S.living.weather;return S.world.background==='pond'?'rain':S.world.background==='snow'?'snow':'clear';};
const OriginalLivingGarden=LivingGarden;
LivingGarden=class StableGarden extends OriginalLivingGarden{
 constructor(host,opts={}){
  super(host,opts);cancelAnimationFrame(this.raf);this.frameTimer=null;this.dirty=true;this.suspended=false;
  this.canvas.style.touchAction=this.passive?'none':(UI.gardenEdit?'none':'pan-y');
  this.visibility=()=>document.hidden?this.pause():this.resume();document.addEventListener('visibilitychange',this.visibility);
  this.io=typeof IntersectionObserver!=='undefined'?new IntersectionObserver(es=>{this.inView=es[0]?.isIntersecting!==false;this.inView?this.resume():this.pause();},{rootMargin:'80px'}):null;
  this.io?.observe(host);this.inView=true;this.schedule();
  // Gesture ownership is provided by the 0.5.6 bounded-camera layer.

 }
 schedule(){if(this.dead||this.suspended||document.hidden||this.inView===false||this.frameTimer)return;
  this.frameTimer=setTimeout(()=>{this.frameTimer=null;if(this.dead||this.suspended||document.hidden)return;this.paint(performance.now());
   if(!document.body.classList.contains('no-motion')||this.hearts.length)this.schedule();},this.passive?100:80);
 }
 pause(){this.suspended=true;clearTimeout(this.frameTimer);this.frameTimer=null;cancelAnimationFrame(this.raf);}
 resume(){if(this.dead)return;this.suspended=false;this.paint(performance.now());this.schedule();}
 update(){this.paint(performance.now());if(document.body.classList.contains('no-motion')){clearTimeout(this.frameTimer);this.frameTimer=null;}else this.resume();}
 destroy(){this.pause();this.io?.disconnect();document.removeEventListener('visibilitychange',this.visibility);super.destroy();this.canvas.remove();}
 point(pos){if(this.room)return {x:pos.x,y:pos.y};return {x:24+(pos.x-30)*312/420,y:181+(pos.y-88)*256/204};}
 layoutPoint(p){return this.room?{x:clamp(p.x,30,450),y:clamp(p.y,88,292),room:true}:{x:clamp(30+(p.x-24)*420/312,30,450),y:clamp(88+(p.y-181)*204/256,88,292),room:false};}
 clampCamera(){const w=this.world.width,h=this.world.height;const base=Math.min(this.width/w,this.height/h),scale=(this.passive?Math.max(this.width/w,this.height/h):base)*this.zoom;
  const maxX=Math.max(0,(w*scale-this.width)/2),maxY=Math.max(0,(h*scale-this.height)/2);
  this.pan.x=this.zoom<=1?0:clamp(this.pan.x,-maxX,maxX);this.pan.y=this.zoom<=1?0:clamp(this.pan.y,-maxY,maxY);
  return {scale,ox:(this.width-w*scale)/2+this.pan.x,oy:(this.height-h*scale)/2+this.pan.y};
 }
 setZoom(z){this.zoom=clamp(z,1,2.7);this.clampCamera();this.paint(performance.now());}
 down(e){if(this.passive||UI.overlay)return;const h=this.canvas;
  this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(this.pointers.size===2){const a=[...this.pointers.values()];this.pinch={distance:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),zoom:this.zoom};this.drag=null;return;}
  const p=this.coord(e),hit=[...this.hits].reverse().find(h=>p.x>=h.x&&p.x<=h.x+h.w&&p.y>=h.y&&p.y<=h.y+h.h);
  this.drag={id:e.pointerId,sx:e.clientX,sy:e.clientY,hit,moved:false,before:hit?.key&&S.living.placement[hit.key]?{...S.living.placement[hit.key]}:null};
  if(UI.gardenEdit){e.preventDefault();h.setPointerCapture?.(e.pointerId);if(hit?.key&&!UI.groundBrush){UI.selectedLiving=hit.key;updateGardenSelection();}
   if(UI.groundBrush){this.drag.brush=true;this.drag.groundBefore=JSON.stringify(S.living.ground);rememberGarden();this.brushAt(this.layoutPoint(p));}}
 }
 move(e){if(!this.pointers.has(e.pointerId))return;this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(this.pointers.size===2&&this.pinch){const a=[...this.pointers.values()];this.setZoom(this.pinch.zoom*Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)/Math.max(1,this.pinch.distance));if(e.cancelable)e.preventDefault();return;}
  const d=this.drag;if(!d)return;const dx=e.clientX-d.sx,dy=e.clientY-d.sy;if(Math.hypot(dx,dy)>7)d.moved=true;
  // Never pan the scene on a single-finger drag. Outside edit mode it scrolls the page.
  if(!UI.gardenEdit)return;
  if(d.brush){this.brushAt(this.layoutPoint(this.coord(e)));return;}
  if(d.moved&&d.hit?.key){if(!d.remembered){rememberGarden();d.remembered=true;}S.living.placement[d.hit.key]=this.layoutPoint(this.coord(e));this.paint(performance.now());}
 }
 async up(e,cancel=false){if(!this.pointers.has(e.pointerId))return;this.pointers.delete(e.pointerId);
  if(this.pinch){if(!this.pointers.size)this.pinch=null;this.drag=null;return;}const d=this.drag;this.drag=null;if(!d)return;
  if(cancel){if(d.remembered&&d.hit?.key){if(d.before)S.living.placement[d.hit.key]=d.before;else delete S.living.placement[d.hit.key];}if(d.groundBefore)S.living.ground=JSON.parse(d.groundBefore);this.paint(performance.now());return;}
  if(d.moved){if(UI.gardenEdit&&(d.remembered||d.brush))await persist(true).catch(err=>toast(err.message));return;}
  if(UI.gardenEdit){if(d.hit?.key){UI.selectedLiving=d.hit.key;updateGardenSelection();this.paint(performance.now());}return;}
  const hit=d.hit,p=this.coord(e);if(hit?.kind==='cabin'){UI.gardenRoom=true;render();return;}if(hit?.kind==='exit'){UI.gardenRoom=false;render();return;}
  if(hit?.kind==='greenhouse'){seedAlbum();return;}if(hit?.kind==='pond'){this.hearts.push({x:p.x,y:p.y,at:performance.now(),water:true});this.schedule();return;}
  if(hit?.pet){this.hearts.push({x:p.x,y:p.y-12,at:performance.now()});this.schedule();toast(petLabel(hit.pet)+' yanında.',1500);return;}
  if(hit?.kind==='memorial'){toast(hit.name,2200);return;}
 }
 portraitScenery(t){const c=this.ctx,p=sceneryProfile(),night=gardenTime()==='night',snow=gardenWeather()==='snow';
  this.rect(0,0,360,480,p.grass);const r=seeded(71);for(let i=0;i<870;i++){const x=r()*360,y=68+r()*412;this.rect(x,y,i%6===0?2:1,1,i%2?p.hill:p.earth);}
  this.rect(0,0,360,81,p.sky);this.poly([[0,58],[32,32],[71,61],[125,27],[164,52],[215,36],[269,58],[312,28],[360,61],[360,90],[0,90]],p.far);
  this.poly([[0,79],[52,58],[103,78],[176,54],[245,81],[315,53],[360,81],[360,105],[0,105]],p.hill);
  if(night){const rr=seeded(119);for(let i=0;i<24;i++)this.rect(rr()*360,rr()*53,1,i%3?1:2,p.light);c.fillStyle=p.light;c.fillRect(292,16,14,14);c.fillStyle=p.sky;c.fillRect(297,13,13,13);}else{this.rect(286,18,16,16,'#f8de9b');this.rect(31,20,30,5,'#ecf0dc');this.rect(41,15,16,5,'#ecf0dc');}
  const path=snow?'#aab9ca':'#c5b591';this.poly([[66,171],[80,171],[112,246],[281,257],[286,267],[106,260],[72,420],[57,420],[96,248]],path);
  for(let y=254;y<417;y+=15)this.rect(72+(417-y)*.16,y,5,2,snow?'#849cad':'#ac987c');
  // House geometry is retained, at a new portrait-world location.
  c.save();c.translate(-21,28);c.scale(.86,.86);const n=this.hits.length;this.cabin(t);const h=this.hits[n];if(h){h.x=h.x*.86-21;h.y=h.y*.86+28;h.w*=.86;h.h*=.86;}c.restore();
  this.rect(167,133,63,57,'#bfd7c366');this.rect(170,138,57,48,'#9cbba333');this.poly([[165,134],[198,111],[231,134]],'#c8dace66');
  for(const x of [167,197,228])this.rect(x,135,2,56,'#c6d5bd');this.rect(167,134,64,2,'#c6d5bd');this.rect(167,161,63,2,'#c6d5bd');this.rect(185,165,18,25,'#b8c6ae');this.hits.push({kind:'greenhouse',x:165,y:111,w:68,h:82});
  this.poly([[258,202],[312,211],[334,238],[328,275],[306,293],[261,284],[242,260],[243,230]],p.earth);
  this.poly([[259,210],[309,218],[325,240],[320,270],[303,283],[263,276],[251,257],[252,231]],S.world.background==='cosmic'?'#7c6aab':'#4d8499');
  for(let i=0;i<14;i++)this.rect(259+(i*11)%53,226+(i*17)%48,5+i%7,1,i%2?'#acd1ce66':'#d7ede166');
  this.rect(311,253,32,9,'#786347');for(let i=0;i<6;i++)this.rect(313,229+i*7,29,5,'#b3966d');this.hits.push({kind:'pond',x:247,y:208,w:80,h:79});
  // The nursery lives below the scene, not duplicated as tiny floating pot buttons.
  for(const [x,y,s,pine] of [[14,118,.9,0],[132,115,.78,1],[259,115,.8,0],[343,139,.9,1],[20,337,.95,0],[342,369,.8,1],[20,454,.65,1]])this.tree(x,y,s,pine,t);
  for(let x=12;x<355;x+=24){this.rect(x,454,3,21,'#8f7558');this.rect(x-2,453,7,3,'#b29977');}this.rect(5,459,350,3,'#b29977');this.rect(5,468,350,2,'#90785c');
  for(const tile of S.living.ground){const pos=this.point({x:tile.x*16,y:tile.y*16}),color=tile.kind==='wood'?'#9b7457':tile.kind==='stone'?'#cec3a3':'#80a469';this.rect(pos.x,pos.y,11,17,color);this.rect(pos.x+2,pos.y+2,5,2,tile.kind==='flower'?'#e7c5b6':'#ead8b955');}
  if(S.world.background==='autumn'){c.fillStyle='#b87b442e';c.fillRect(0,80,360,400);}if(S.world.background==='cosmic'){c.fillStyle='#7358a026';c.fillRect(0,80,360,400);}
 }
 paint(now){if(this.dead||!ready)return;const w=this.room?480:360,h=this.room?320:480;if(this.world.width!==w||this.world.height!==h){this.world.width=w;this.world.height=h;}
  const c=this.ctx,motion=!document.body.classList.contains('no-motion'),t=motion?now/1000:0;this.hits=[];c.imageSmoothingEnabled=false;c.globalAlpha=1;
  this.room?this.interior(t):this.portraitScenery(t);
  const ps=livingPlacements().filter(p=>!!p.pos.room===this.room).sort((a,b)=>a.pos.y-b.pos.y);
  for(const p of ps){let {x,y}=this.point(p.pos);const selected=UI.gardenEdit&&UI.selectedLiving===p.key;let flip=false;
   if(p.type==='pet'&&motion&&!UI.gardenEdit){const phase=t*(this.passive?.1:.25)+keyHash(p.item),rest=Math.sin(t*.06+keyHash(p.item))>.65;
    if(p.item==='duck'&&!this.room){x=278+Math.sin(phase*.4)*19;y=250+Math.cos(phase*.3)*14;}
    else {const near=p.item==='cat'?ps.find(z=>z.item==='catbed'||z.item==='bench'):p.item==='bee'?ps.find(z=>z.item==='beehive'||z.item==='flowers'):['bird','owl','parrot'].includes(p.item)?ps.find(z=>z.item==='birdhouse'):null;
     if(near&&(rest||p.item==='bee')){const home=this.point(near.pos);x=home.x+(p.item==='bee'?Math.sin(phase)*13:0);y=home.y-(p.item==='bee'?22:p.item==='cat'?8:25);}else if(!rest){x+=Math.sin(phase)*7;y+=Math.cos(phase*.6)*4;}}flip=Math.cos(phase)<0;
   }
   c.globalAlpha=.15;this.rect(x-10,y-1,20,3,'#112322');c.globalAlpha=1;
   if(p.type==='decor')this.decor(p.item,x,y,t);else if(p.type==='plant'){const plant=S.world.harvested.find(q=>q.id===p.item);this.spr(SEEDS[plant?.kind]?.sprite||'flower',x,y,32);}else this.spr(p.item,x,y,30,flip);
   if(selected){c.strokeStyle='#fff3ac';c.lineWidth=1;c.strokeRect(Math.round(x)-20,Math.round(y)-35,40,39);}
   this.hits.push({key:p.key,pet:p.type==='pet'?p.item:null,x:x-20,y:y-35,w:40,h:39});
  }
  if(!this.room){for(const [i,m] of S.living.memorials.entries()){const x=122+i%5*24,y=355+Math.floor(i/5)*24;this.spr('tree',x,y,27);this.hits.push({kind:'memorial',name:m.name,x:x-13,y:y-27,w:26,h:30});}
   const time=gardenTime();if(time!=='day'){c.fillStyle=time==='night'?'#13153042':'#67455025';c.fillRect(0,80,w,h-80);for(const [x,y] of [[48,125],[85,125],[225,297],[52,433]]){c.fillStyle='#ffdf9135';c.fillRect(x-7,y-7,16,16);this.rect(x,y,2,4,'#fbe5a3');}}
   if(gardenWeather()==='rain'){const rr=seeded(921);c.strokeStyle='#d4e9f077';c.lineWidth=1;for(let i=0;i<(this.passive?45:85);i++){const x=rr()*w,y=(rr()*h+t*74)%h;c.beginPath();c.moveTo(x,y);c.lineTo(x-2,y+5);c.stroke();}for(let i=0;i<5;i++){const q=(t*.6+i*.2)%1;c.strokeStyle='#d4e9f066';c.strokeRect(265+i*9,230+i%3*14,3+q*5,1+q*2);}}
   if(gardenWeather()==='snow'){const r=seeded(118);for(let i=0;i<48;i++)this.rect((r()*w+Math.sin(t*.3+i)*2)%w,(r()*h+t*8)%h,2,2,'#f7faf1');}
   if(time==='night'&&gardenWeather()==='clear')for(let i=0;i<16;i++){c.globalAlpha=.35+.3*Math.sin(t+i);this.rect(40+(i*31)%280+Math.sin(t*.1+i)*3,290+(i*23)%130,1,2,'#f1eab8');}c.globalAlpha=1;
  }
  if(UI.gardenEdit&&!this.passive){c.strokeStyle='#f8efb31c';for(let x=24;x<340;x+=16){c.beginPath();c.moveTo(x,182);c.lineTo(x,437);c.stroke();}for(let y=181;y<440;y+=16){c.beginPath();c.moveTo(24,y);c.lineTo(338,y);c.stroke();}}
  this.hearts=this.hearts.filter(v=>now-v.at<1500);for(const a of this.hearts){const q=(now-a.at)/1500;c.globalAlpha=1-q;if(a.water){c.strokeStyle='#d7eeeb';c.strokeRect(a.x-q*10,a.y-q*4,q*20,q*8);}else this.spr('star',a.x,a.y-q*17,12);c.globalAlpha=1;}
  this.fit=this.clampCamera();const v=this.view;v.imageSmoothingEnabled=false;v.fillStyle=this.room?'#292531':sceneryProfile().grass;v.fillRect(0,0,this.width,this.height);v.drawImage(this.world,this.fit.ox,this.fit.oy,w*this.fit.scale,h*this.fit.scale);
 }
};
function waterCan053(){return '<svg width="32" height="30" viewBox="0 0 32 30" shape-rendering="crispEdges" aria-hidden="true"><path d="M19 9h7v10h-6M20 12h3v4h-3" fill="#637e91"/><path d="M8 11h13v14H8z" fill="#8cc8ce"/><path d="M8 11h13v3H8zM8 23h13v2H8z" fill="#4c939f"/><path d="M6 5h3v3H6zM6 7h10v4H6z" fill="#aacbd4"/><path d="M8 17 2 12v-4H0v8l8 7z" fill="#92ccd0"/><path d="M0 7h5v3H0z" fill="#d5edf0"/><path d="M18 14h2v8h-2z" fill="#c6e8dd"/></svg>';}
function nurseryMarkup(){return `<section class="nursery053"><div class="section-top"><h2>Yetiştir</h2><button class="text-btn" data-action="pot-sheet">Saksılar ${icon('chevron',13)}</button></div><div class="growing-plots">${S.world.plots.map((p,i)=>{const q=plantProgress(p),water=p&&Date.now()-(S.living.watering[p.id]||0)<3500;return `<button class="growing-plot ${!p?'empty-plot':''} ${q>=1?'ready-plant':''} ${water?'watering053':''}" data-plant-id="${p?esc(p.id):''}" data-action="seed-sheet" data-slot="${i}"><div class="pot-stage pot-${esc(S.world.pot)}">${p?pixel(activePlantSprite(p),67):icon('plus',24)}<i class="pixel-pot"></i><span class="watering-can053" aria-hidden="true">${waterCan053()}</span><span class="water-drops053" aria-hidden="true"><i></i><i></i><i></i><i></i></span></div><strong>${p?SEEDS[p.kind].name:'Tohum ek'}</strong><small>${p?q>=1?'Bahçeye dik':plantMilestone(p)+' dk kaldı':'Ücretsiz'}</small><div class="growth-track"><i style="width:${q*100}%"></i></div></button>`;}).join('')}</div></section>`;}
function stableToolbar(){return `<div class="garden-tools"><button class="icon-btn" data-action="garden-zoom" data-delta=".25" aria-label="Yakınlaştır">+</button><button class="icon-btn" data-action="garden-zoom" data-delta="-.25" aria-label="Uzaklaştır">−</button><button class="icon-btn" data-action="garden-reset-view" aria-label="Görünümü sığdır">${icon('grid',17)}</button><button class="icon-btn" data-action="garden-full" aria-label="${UI.gardenFull?'Tam ekrandan çık':'Tam ekran'}">${icon(UI.gardenFull?'shrink':'expand',19)}</button>${UI.gardenRoom?`<button class="icon-btn" data-action="living-exit-room" aria-label="Bahçeye dön">${icon('back',18)}</button>`:''}</div>`;}
renderGarden=function(){return `<div class="${UI.gardenFull?'garden-full':'page garden-page living-page'}">${UI.gardenFull?'':header()+`<div class="section-heading garden-heading053"><div><span class="eyebrow">${esc(sceneryProfile().name)}</span><h1>${UI.gardenRoom?'Kulübem':'Bahçem'}</h1></div><button class="round-link" data-action="scenery-sheet">${icon('image',17)} Manzara</button></div>`}<div class="garden-stage">${livingHost()}${stableToolbar()}${UI.gardenEdit?'<div class="garden-edit-chip">Düzenleme</div>':''}</div><div class="garden-dock"><button data-action="garden-edit" class="${UI.gardenEdit?'active':''}">${icon(UI.gardenEdit?'check':'edit',18)}${UI.gardenEdit?'Bitti':'Düzenle'}</button><button data-action="route" data-route="shop">${icon('grid',18)}Mağaza</button><button data-action="inventory">${icon('leaf',18)}Koleksiyon</button><button data-action="living-weather">${icon('rain',18)}Hava</button></div>${UI.gardenEdit?'<div id="garden-selection"></div>':''}${UI.gardenFull?'':`<div class="garden-quiet-stats"><span>${fmtMinutes(worldSeconds()/60)} odak</span><span>${S.world.harvested.length} bitki</span></div>${nurseryMarkup()}<button class="weekly-link" data-action="route" data-route="weekly">${icon('calendar',19)} Haftam ${icon('arrow',17)}</button>`}</div>`;};
updateGardenSelection=function(){const node=$('#garden-selection');if(!node)return;const picked=UI.selectedLiving;node.innerHTML=`<div class="selection053"><span>${picked?'Oklarla taşı veya öğeyi sürükle.':'Taşımak için bir öğeye dokun.'}</span><div class="nudge-bar">${[['left','←','Sola'],['up','↑','Yukarı'],['down','↓','Aşağı'],['right','→','Sağa']].map(([d,c,l])=>`<button data-action="living-nudge" data-direction="${d}" aria-label="${l} taşı" ${picked?'':'disabled'}>${c}</button>`).join('')}<button data-action="living-undo" aria-label="Geri al">${icon('undo',18)}</button><button data-action="living-remove" aria-label="Koleksiyona kaldır" ${picked?'':'disabled'}>${icon('archive',18)}</button></div><button class="text-btn" data-action="living-ground">Zemin ve yerleşim</button></div>`;};
const actionBefore053=enhancedAction;
enhancedAction=async function(name,el,e){const d=el.dataset;
 if(name==='living-nudge'){const delta={left:[-8,0],right:[8,0],up:[0,-6],down:[0,6]}[d.direction],p=livingPlacements().find(x=>x.key===UI.selectedLiving);if(!p||!delta)return true;rememberGarden();S.living.placement[p.key]={x:clamp(p.pos.x+delta[0],30,450),y:clamp(p.pos.y+delta[1],88,292),room:!!p.pos.room};for(const g of gardenInstances)g.paint(performance.now());await persist(true);return true;}
 if(name==='garden-zoom'){for(const g of gardenInstances)if(!g.passive)g.setZoom(g.zoom+Number(d.delta));return true;}
 if(name==='garden-reset-view'){for(const g of gardenInstances)if(!g.passive){g.pan={x:0,y:0};g.setZoom(1);}return true;}
 if(name==='living-water'){const p=S.world.plots[Number(d.slot)];if(p){S.living.watering[p.id]=Date.now();S.living.pendingWater=[];await persist(true);closeSheet();if(UI.route!=='garden')route('garden');else render();setTimeout(()=>document.querySelector('.nursery053')?.scrollIntoView({behavior:'smooth',block:'nearest'}),40);}return true;}
 if(name==='select-scenery'){const key=d.key;if(SCENERIES[key]&&worldSeconds()/60>=SCENERIES[key].minutes){S.living.time='auto';S.living.weather='auto';}}
 const result=await actionBefore053(name,el,e);return result;
};
// The canonical scenery action already checks unlocks and retains owned items.
const stableRenderFocus=renderFocus;
renderFocus=function(){const html=stableRenderFocus();if(UI.immersive)return html;const buddy=S.preferences.showCompanion===false?'':`<div class="focus-companion053">${pixel(S.preferences.companion,34)}<span>${esc(petLabel())} yanında.</span></div>`;return html.replace('</section>',buddy+'</section>');};
