/* Original pixel scenery, painted from geometry and LumaNote sprites.
   No Stardew Valley assets, remote textures or third-party font files. */
const gardenInstances=new Set(),spriteImages=new Map();
const seeded=n=>{let s=n|0;return()=>{s=(Math.imul(s,1664525)+1013904223)|0;return(s>>>0)/4294967296;};};
const keyHash=s=>[...String(s)].reduce((a,c)=>Math.imul(a^c.charCodeAt(0),16777619),2166136261)>>>0;
function livingPlacements(){
 const list=S.world.layout.map(p=>({key:p.type+':'+p.item,type:p.type,item:p.item}));
 if(!list.some(p=>p.type==='pet'&&p.item===S.preferences.companion))list.push({key:'pet:'+S.preferences.companion,type:'pet',item:S.preferences.companion});
 return list.map((p,i)=>({...p,pos:S.living.placement[p.key]||{x:200+(i*47)%160,y:180+(i*31)%95,room:false}}));
}
function gardenWeather(){return S.living.weather==='auto'?(S.preferences.theme==='midnight'||S.world.background==='pond'?'rain':S.world.background==='snow'?'snow':'clear'):S.living.weather;}
function gardenTime(){if(S.living.time!=='auto')return S.living.time;const h=new Date().getHours();return h>=7&&h<17?'day':h>=17&&h<20?'dusk':'night';}
function spriteImage(kind){
 if(spriteImages.has(kind))return spriteImages.get(kind);
 const im=new Image();spriteImages.set(kind,im);im.onload=()=>gardenInstances.forEach(g=>g.paint(performance.now()));
 im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(pixel(kind,32).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" '));return im;
}
class LivingGarden{
 constructor(host,{passive=false,room=false,full=false}={}){
  this.host=host;this.passive=passive;this.room=room;this.full=full;this.zoom=1;this.pan={x:0,y:0};this.pointers=new Map();this.hearts=[];this.hits=[];this.dead=false;
  this.canvas=document.createElement('canvas');this.canvas.className='living-canvas';this.canvas.setAttribute('aria-label','Yaşayan piksel bahçe');host.append(this.canvas);
  this.world=document.createElement('canvas');this.world.width=480;this.world.height=320;this.ctx=this.world.getContext('2d');this.view=this.canvas.getContext('2d');
  this.resize=()=>{const r=host.getBoundingClientRect();this.width=Math.max(1,r.width);this.height=Math.max(1,r.height);const d=Math.min(2,devicePixelRatio||1);this.canvas.width=Math.round(this.width*d);this.canvas.height=Math.round(this.height*d);this.view.setTransform(d,0,0,d,0,0);this.paint(performance.now());};
  this.ro=new ResizeObserver(this.resize);this.ro.observe(host);gardenInstances.add(this);
  this.canvas.addEventListener('pointerdown',e=>this.down(e));this.canvas.addEventListener('pointermove',e=>this.move(e));
  this.canvas.addEventListener('pointerup',e=>this.up(e));this.canvas.addEventListener('pointercancel',e=>this.up(e,true));
  this.canvas.addEventListener('wheel',e=>{if(this.passive)return;e.preventDefault();this.zoom=clamp(this.zoom-e.deltaY*.001,1,2.7);this.paint(performance.now());},{passive:false});
  if(!passive&&!room&&(S.living.pendingWater||[]).length){for(const id of S.living.pendingWater)S.living.watering[id]=Date.now();S.living.pendingWater=[];persist();}
  this.resize();this.loop=now=>{if(this.dead)return;if(!document.hidden&&(!this.last||now-this.last>65)){this.last=now;this.paint(now);}this.raf=requestAnimationFrame(this.loop);};this.raf=requestAnimationFrame(this.loop);
 }
 destroy(){this.dead=true;cancelAnimationFrame(this.raf);this.ro.disconnect();gardenInstances.delete(this);}
 coord(e){const r=this.canvas.getBoundingClientRect(),f=this.fit||{scale:1,ox:0,oy:0};return{x:(e.clientX-r.left-f.ox)/f.scale,y:(e.clientY-r.top-f.oy)/f.scale};}
 down(e){if(this.passive)return;e.preventDefault();this.canvas.setPointerCapture(e.pointerId);this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  const p=this.coord(e),hit=[...this.hits].reverse().find(h=>p.x>=h.x&&p.x<=h.x+h.w&&p.y>=h.y&&p.y<=h.y+h.h);
  this.drag={sx:e.clientX,sy:e.clientY,pan:{...this.pan},hit,moved:false,before:hit?.key?(S.living.placement[hit.key]?{...S.living.placement[hit.key]}:null):null,groundBefore:UI.groundBrush?JSON.stringify(S.living.ground):null};
  if(this.pointers.size===2){const a=[...this.pointers.values()];this.pinch={distance:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),zoom:this.zoom};this.drag=null;}
  if(UI.gardenEdit&&hit?.key&&!UI.groundBrush){UI.selectedLiving=hit.key;updateGardenSelection();this.paint(performance.now());}
  if(UI.gardenEdit&&UI.groundBrush&&this.pointers.size===1){this.drag.brush=true;rememberGarden();this.brushAt(p);}
 }
 brushAt(p){const x=Math.floor(p.x/16),y=Math.floor(p.y/16);if(x<2||x>27||y<6||y>17)return;S.living.ground=S.living.ground.filter(t=>t.x!==x||t.y!==y);if(UI.groundBrush!=='erase')S.living.ground.push({x,y,kind:UI.groundBrush});this.paint(performance.now());}
 move(e){if(!this.pointers.has(e.pointerId))return;this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(this.pointers.size===2&&this.pinch){const a=[...this.pointers.values()];this.zoom=clamp(this.pinch.zoom*Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)/Math.max(1,this.pinch.distance),1,2.7);return;}
  if(!this.drag)return;const d=this.drag,dx=e.clientX-d.sx,dy=e.clientY-d.sy;if(Math.hypot(dx,dy)>5)d.moved=true;
  if(d.brush){this.brushAt(this.coord(e));return;}
  if(d.moved){if(UI.gardenEdit&&d.hit?.key){if(!d.remembered){rememberGarden();d.remembered=true;}const p=this.coord(e);S.living.placement[d.hit.key]={x:clamp(p.x,30,450),y:clamp(p.y,88,292),room:this.room};}else{this.pan.x=clamp(d.pan.x+dx,-this.width,this.width);this.pan.y=clamp(d.pan.y+dy,-this.height*.6,this.height*.6);}this.paint(performance.now());}
 }
 async up(e,cancel=false){if(!this.pointers.has(e.pointerId))return;this.pointers.delete(e.pointerId);if(this.pinch){if(!this.pointers.size)this.pinch=null;this.drag=null;return;}
  const d=this.drag;this.drag=null;if(!d)return;
  if(cancel){if(d.hit?.key){if(d.before)S.living.placement[d.hit.key]=d.before;else delete S.living.placement[d.hit.key];}if(d.groundBefore)S.living.ground=JSON.parse(d.groundBefore);this.paint(performance.now());return;}
  try{if(d.brush){await persist(true);return;}if(d.moved&&UI.gardenEdit&&d.hit?.key){await persist(true);return;}if(d.moved)return;const p=this.coord(e);
   if(UI.gardenEdit&&UI.groundBrush&&!d.hit?.key){const x=Math.floor(p.x/16),y=Math.floor(p.y/16);if(x<2||x>27||y<6||y>17)return;rememberGarden();S.living.ground=S.living.ground.filter(t=>t.x!==x||t.y!==y);if(UI.groundBrush!=='erase')S.living.ground.push({x,y,kind:UI.groundBrush});await persist(true);return;}
   if(d.hit?.kind==='pot'){seedSheet(d.hit.slot);return;}
   if(d.hit?.kind==='memorial'){toast(d.hit.name,2200);return;}if(d.hit?.kind==='greenhouse'){seedAlbum();return;}if(d.hit?.kind==='cabin'){UI.gardenRoom=true;render();return;}
   if(d.hit?.kind==='exit'){UI.gardenRoom=false;render();return;}
   if(d.hit?.kind==='pond'){this.hearts.push({x:p.x,y:p.y,at:performance.now(),water:true});return;}
   if(d.hit?.key){if(UI.gardenEdit){UI.selectedLiving=d.hit.key;updateGardenSelection();return;}
    this.hearts.push({x:p.x,y:p.y-12,at:performance.now()});const pet=d.hit.pet;if(pet){UI.tappedPet=pet;toast(`${S.world.petNames[pet]||PETS[pet]?.name||'Arkadaşın'} ${['dinleniyor.','seni selamlıyor.','yanında.'][keyHash(pet)%3]}`,1600);}return;}
   if(this.full&&!UI.gardenEdit)this.host.closest('.garden-full')?.classList.toggle('hide-garden-tools');
  }catch(err){toast('Yerleşim kaydedilemedi: '+err.message);}
 }
 rect(x,y,w,h,color){this.ctx.fillStyle=color;this.ctx.fillRect(Math.round(x),Math.round(y),w,h);}
 poly(points,color){const c=this.ctx;c.fillStyle=color;c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fill();}
 spr(kind,x,y,size=24,flip=false){const im=spriteImage(kind);if(!im.complete||!im.naturalWidth)return;const c=this.ctx;c.save();c.translate(Math.round(x),Math.round(y));c.scale(flip?-1:1,1);c.imageSmoothingEnabled=false;c.drawImage(im,-size/2,-size,size,size);c.restore();}
 tree(x,y,s=1,pine=false,t=0){const c=this.ctx;c.save();c.translate(Math.round(x),Math.round(y));c.scale(s,s);this.rect(-13,-2,30,5,'#263e2d');this.rect(-3,-25,7,28,'#654437');this.rect(1,-21,3,21,'#92704c');
  const wind=Math.round(Math.sin(t+x)*.7);c.translate(wind,0);
  if(pine){this.poly([[0,-67],[-22,-21],[22,-21]],'#294c39');this.poly([[0,-61],[-18,-32],[15,-32]],'#477449');this.poly([[0,-51],[-22,-12],[24,-12]],'#366342');this.poly([[-4,-50],[-18,-20],[1,-20]],'#5b8b50');}
  else{this.poly([[-18,-51],[-9,-65],[11,-65],[23,-51],[24,-22],[9,-14],[-14,-18],[-25,-31]],'#2b563b');this.rect(-19,-48,38,25,'#437344');this.rect(-13,-59,23,12,'#568953');this.rect(-22,-38,9,13,'#52854b');this.rect(-13,-49,12,16,'#6c9b58');this.rect(3,-36,15,10,'#365f3b');this.rect(7,-57,9,8,'#7eaa63');this.rect(-8,-54,5,3,'#9bb76a');}
  c.restore();}
 cabin(t){this.rect(54,141,102,9,'#304d31');this.rect(65,90,82,57,'#89573f');this.rect(68,94,77,50,'#bb8756');for(let y=99;y<143;y+=9){this.rect(68,y,77,2,'#865c43');this.rect(73,y-2,15,1,'#d5a777');}
  this.poly([[51,94],[59,83],[70,58],[141,58],[158,94]],S.living.homeStyle==='blue'?'#506b86':S.living.homeStyle==='rose'?'#936373':'#7f4952');
  for(let y=64;y<=91;y+=6){let left=67-(y-64)*.48;this.rect(left,y,147-left+(y-64)*.22,2,'#ac6c67');for(let x=left+6;x<150;x+=13)this.rect(x,y+2,1,4,'#663d49');}
  this.rect(50,92,110,5,'#523c39');this.rect(91,113,21,34,'#593f34');this.rect(96,117,12,23,'#72533d');this.rect(106,130,2,3,'#e5bb67');this.rect(77,106,13,18,'#543e37');this.rect(80,109,8,10,'#f0c779');this.rect(116,105,18,19,'#593d38');this.rect(119,108,12,12,'#efc878');this.rect(124,108,2,12,'#957053');this.rect(119,113,12,2,'#957053');
  this.rect(127,42,11,23,'#756963');for(let i=0;i<3;i++){this.ctx.globalAlpha=.15-i*.035;this.rect(126+Math.sin(t+i)*3,37-i*8-((t*4)%8),10+i*2,5,'#e5dbcb');}this.ctx.globalAlpha=1;
  this.rect(88,147,28,4,'#ccb391');this.rect(86,151,32,3,'#9f896b');this.hits.push({kind:'cabin',x:58,y:60,w:95,h:95});
 }
 scenery(t,motion){const autumn=S.world.background==='autumn',snow=gardenWeather()==='snow';
  this.rect(0,0,480,320,snow?'#becfd0':autumn?'#87934f':'#74985a');
  const r=seeded(9581);for(let i=0;i<1600;i++){const x=Math.floor(r()*480),y=Math.floor(r()*320);this.rect(x,y,1+Math.round(r()*2),1,snow?(i%2?'#a5bec8':'#e4e8d9'):i%3?'#81a564':'#658c50');if(i%13===0)this.rect(x,y-2,1,2,'#4f7a47');}
  // Winding permanent path.
  this.poly([[89,152],[117,152],[136,194],[245,194],[262,210],[252,228],[140,218],[128,273],[89,290],[76,273],[105,255],[110,212]],'#bba77b');
  this.poly([[94,154],[111,154],[130,201],[244,201],[251,213],[247,218],[133,212],[121,269],[92,282],[86,273],[111,262],[118,205]],'#d0bd91');
  const pathR=seeded(321);for(let i=0;i<85;i++){let x=126+pathR()*116,y=200+pathR()*16;this.rect(x,y,3,1,'#a9926a');}
  // Pond with tile shoreline and board bridge.
  this.poly([[301,121],[313,107],[346,101],[391,107],[413,125],[419,158],[408,187],[386,200],[340,200],[312,187],[297,157]],'#456547');
  this.poly([[306,122],[320,111],[353,108],[390,113],[406,128],[411,158],[401,180],[380,190],[344,192],[319,181],[306,156]],'#649b9d');
  this.poly([[318,126],[337,116],[389,120],[399,141],[402,162],[382,181],[345,183],[325,170],[316,153]],'#527e96');
  for(let i=0;i<20;i++){const rr=seeded(20+i),x=322+rr()*70,y=122+rr()*55;this.rect(x+(motion?Math.sin(t*.5+i)*2:0),y,5+rr()*6,1,i%3?'#71a4ad':'#97c1bc');}
  this.hits.push({kind:'pond',x:306,y:116,w:101,h:76});
  for(let i=0;i<5;i++){this.rect(391,150+i*8,43,7,'#aa8255');this.rect(391,155+i*8,43,1,'#d1ae78');}this.rect(391,146,3,49,'#715436');this.rect(432,146,3,49,'#715436');
  for(const [x,y] of [[318,170],[380,130],[349,179]]){this.rect(x,y,8,4,'#72a164');this.rect(x+1,y,4,2,'#a2b574');}
  for(const [x,y] of [[17,79],[40,69],[170,62],[199,76],[234,57],[277,68],[324,68],[384,69],[434,73],[469,92]])this.tree(x,y,.8,x%3===0,t);
  for(let x=20;x<465;x+=24){this.rect(x,296,3,17,'#654b37');this.rect(x-8,299,30,3,'#ba976a');this.rect(x-8,306,30,3,'#a07b51');this.rect(x,294,3,3,'#d2b380');}
  this.tree(25,257,1.15,false,t);this.tree(451,244,1.15,true,t);
  for(const cell of S.living.ground){const x=cell.x*16,y=cell.y*16;
   if(cell.kind==='stone'){this.rect(x,y,15,14,'#a0a69a');this.rect(x+2,y+2,12,2,'#c5c6af');this.rect(x+1,y+13,13,2,'#788777');}
   else if(cell.kind==='wood'){this.rect(x,y,16,15,'#a47750');this.rect(x,y+5,16,1,'#73543c');this.rect(x,y+11,16,1,'#73543c');}
   else if(cell.kind==='flower')for(let i=0;i<3;i++)this.flower(x+i*5+2,y+12-i*2,i);
  }
  for(const [x,y] of [[172,147],[168,167],[178,162],[279,250],[288,264],[72,201],[52,170],[443,129],[197,270]])this.flower(x,y,Math.round(x)%3);
  this.cabin(t);
  // Nursery is a scene element, not a UI overlay.
  this.rect(331,241,98,44,'#826447');this.rect(334,244,92,35,'#b39262');this.rect(331,281,99,4,'#614934');
  for(let i=0;i<3;i++){const x=351+i*30,y=268,p=S.world.plots[i];this.rect(x-10,y-1,20,4,'#593e32');this.rect(x-8,y+3,16,12,S.world.pot==='potMint'?'#81a699':S.world.pot==='potLilac'?'#ac8eab':'#b87651');this.rect(x-5,y+5,3,8,'#d39a72');
   if(p){this.spr(activePlantSprite(p),x,y+2,29);const pr=plantProgress(p);this.rect(x-9,y+18,18,2,'#4b5237');this.rect(x-9,y+18,Math.round(18*pr),2,pr>=1?'#f4dc91':'#a1bf6b');if(pr>=1){this.rect(x+9,y-17,2,6,'#fff0a8');this.rect(x+7,y-15,6,2,'#fff0a8');}
    const at=S.living.watering[p.id];if(at&&Date.now()-at<6000)this.water(x,y,motion?Date.now()-at:1400);
   }else{this.rect(x-3,y-8,6,2,'#dbd0ad');this.rect(x-1,y-10,2,6,'#dbd0ad');}
   this.hits.push({kind:'pot',slot:i,x:x-13,y:y-29,w:26,h:53});
  }
  // Small greenhouse; completed collection grows visually, without new upkeep.
  this.rect(208,106,54,49,'#789a8c');this.poly([[202,107],[234,87],[267,107]],'#c3d1b0');this.rect(209,108,51,39,'#a1b9a4');for(let x=211;x<260;x+=16)this.rect(x,106,2,44,'#e1d9b6');this.rect(209,124,51,2,'#ded7b4');this.rect(231,128,12,24,'#75988b');for(let i=0;i<Math.min(3,S.living.album.length);i++)this.spr('sprout',217+i*14,144,16);this.hits.push({kind:'greenhouse',x:202,y:88,w:65,h:65});
 }
 flower(x,y,i){this.rect(x,y-4,1,5,'#3c6c3e');this.rect(x-2,y-6,5,3,['#edc986','#d69baf','#afb9e0'][i%3]);this.rect(x,y-5,1,1,'#ffe4a0');}
 water(x,y,age){const c=this.ctx;const f=age/6000;if(f>.88)c.globalAlpha=(1-f)/.12;this.rect(x-8,y+1,16,2,'#58483e');c.save();c.translate(x+12,y-36);c.rotate(-.45);this.rect(0,0,12,9,'#83b6c8');this.rect(-4,3,5,3,'#b7d9e0');this.rect(10,-3,4,7,'#568b9f');c.restore();for(let i=0;i<6;i++){const yy=((age*.026+i*7)%28);this.rect(x+7-yy*.23,y-29+yy,1,3,'#b8e3ea');}c.globalAlpha=1;}
 decor(kind,x,y,t){
  if(kind==='bench'){this.rect(x-18,y-22,36,9,'#bd9663');this.rect(x-19,y-10,38,5,'#a77e50');this.rect(x-15,y-5,3,7,'#674b39');this.rect(x+12,y-5,3,7,'#674b39');}
  else if(kind==='campfire'){this.rect(x-10,y-2,20,4,'#675149');this.rect(x-7,y-4,15,4,'#b67a49');for(let i=0;i<4;i++){let h=7+Math.sin(t*4+i)*4;this.rect(x-6+i*3,y-h,4,h-2,'#df8d40');this.rect(x-3+i*2,y-h/2,2,h/2-2,'#ffd880');}}
  else if(kind==='fence'){this.rect(x-15,y-19,3,21,'#946d45');this.rect(x+12,y-19,3,21,'#946d45');this.rect(x-15,y-16,30,3,'#ceab70');this.rect(x-15,y-8,30,3,'#ceab70');}
  else if(kind==='catbed'){this.rect(x-16,y-4,32,6,'#947c99');this.rect(x-12,y-5,24,5,'#cab4c0');}
  else if(kind==='beehive'){this.rect(x-8,y-22,16,24,'#d2a851');for(let yy=-20;yy<1;yy+=5)this.rect(x-9,y+yy,18,2,'#a07840');this.rect(x-2,y-6,4,4,'#72593c');}
  else if(kind==='birdhouse'){this.rect(x-1,y-4,3,8,'#876e4b');this.rect(x-8,y-19,17,16,'#ceab7a');this.poly([[x-11,y-18],[x,y-29],[x+12,y-18]],'#7d5951');this.rect(x-2,y-15,5,6,'#655b43');}
  else if(kind==='picnic'){this.rect(x-20,y-10,40,20,'#d1aa9a');for(let a=0;a<4;a++)for(let b=0;b<2;b++)this.rect(x-20+a*10,y-10+b*10,6,6,'#a07d86');}
  else if(kind==='flowers'){this.rect(x-13,y-3,26,5,'#bc925d');this.flower(x-7,y-3,1);this.flower(x,y-3,0);this.flower(x+7,y-3,2);this.rect(x-10,y+2,4,4,'#544d3d');this.rect(x+7,y+2,4,4,'#544d3d');}
  else this.spr(kind,x,y,30);
 }
 interior(t){this.rect(0,0,480,320,'#423d3e');this.rect(72,40,336,242,'#bd956b');for(let y=83;y<278;y+=14){this.rect(80,y,320,1,'#927454');for(let x=82+(y%3)*12;x<398;x+=48)this.rect(x,y-13,1,13,'#a3825d');}
  this.rect(72,39,336,42,'#9f7b62');this.rect(78,42,324,29,'#ba977d');this.rect(72,76,336,6,'#775b4c');this.rect(72,79,8,204,'#72573f');this.rect(400,79,8,204,'#72573f');
  this.rect(105,47,56,31,'#605663');this.rect(108,49,50,24,gardenTime()==='night'?'#586d85':'#aec8bc');this.rect(131,48,3,28,'#ddccb0');this.rect(107,61,50,2,'#ddccb0');
  this.rect(178,122,144,94,'#c5a2ab');this.rect(183,127,134,84,'#936f8f');this.rect(190,134,120,70,'#ad86a0');
  this.rect(277,95,80,31,'#826043');this.rect(280,97,74,15,'#c49d71');this.rect(281,126,5,15,'#644f3e');this.rect(346,126,5,15,'#644f3e');this.rect(310,96,24,14,'#e5d9b8');this.rect(321,96,1,14,'#a9997d');this.rect(341,88,4,8,'#f1d183');
  this.rect(97,121,45,82,'#6d5242');for(let y=127;y<192;y+=21){for(let i=0;i<6;i++)this.rect(101+i*6,y,4,16,['#8d92a7','#b08084','#93a781'][i%3]);this.rect(99,y+17,42,3,'#bb9369');}
  this.rect(333,172,51,76,'#b39774');this.rect(337,177,43,65,'#7b879f');this.rect(340,180,37,16,'#e4d8c5');this.rect(337,203,43,36,'#aa96b9');
  this.decor('catbed',158,245,t);this.spr('tree',355,82,34);this.spr(S.preferences.companion,225+Math.sin(t*.12)*22,184,34);
  this.rect(222,274,38,10,'#705746');this.hits.push({kind:'exit',x:208,y:254,w:72,h:36});
 }
 paint(now){if(this.dead||!ready)return;const reduced=document.body.classList.contains('no-motion'),motion=!reduced,t=motion?now/1000:0,c=this.ctx;this.hits=[];c.imageSmoothingEnabled=false;
  if(this.room)this.interior(t);else this.scenery(t,motion);
  const placements=livingPlacements().filter(p=>!!p.pos.room===this.room).sort((a,b)=>a.pos.y-b.pos.y);
  for(const p of placements){let x=p.pos.x,y=p.pos.y,flip=false;const selected=UI.gardenEdit&&UI.selectedLiving===p.key;
   if(p.type==='pet'&&motion&&!UI.gardenEdit){const seed=keyHash(p.item),phase=t*(this.passive?.12:.32)+seed;
    const rest=Math.sin(t*.08+seed)>.65;
    if(p.item==='duck'&&!this.room){x=350+Math.sin(phase*.35)*28;y=157+Math.cos(phase*.3)*17;}
    else if(p.item==='turtle'&&!this.room){x=318+Math.sin(phase*.15)*6;y=187;}
    else if(p.item==='cat'&&owns('decor','bench')&&!this.room){const bench=placements.find(x=>x.item==='bench');if(bench){x=bench.pos.x;y=bench.pos.y-10;}}
    else if(p.item==='bee'&&!this.room){const hive=placements.find(h=>h.item==='beehive');x=(hive?.pos.x||174)+Math.sin(phase)*19;y=(hive?.pos.y||151)-9+Math.cos(phase*2)*5;}
    else if(['parrot','owl'].includes(p.item)&&!this.room&&placements.some(h=>h.item==='birdhouse')){const h=placements.find(h=>h.item==='birdhouse');x=h.pos.x+Math.sin(phase*.5)*8;y=h.pos.y-35;}
    else if(!rest){x+=Math.sin(phase)*10;y+=Math.cos(phase*.6)*5;}
    flip=Math.cos(phase)<0;if(rest){this.rect(x+12,y-31,2,1,'#e9dfcf');this.rect(x+14,y-34,3,1,'#e9dfcf');}
   }
   this.ctx.globalAlpha=.18;this.rect(x-10,y-1,20,3,'#19302d');this.ctx.globalAlpha=1;
   if(p.type==='decor')this.decor(p.item,x,y,t);else if(p.type==='plant'){const plant=S.world.harvested.find(h=>h.id===p.item);this.spr(SEEDS[plant?.kind]?.sprite||'flower',x,y,34);}else {this.spr(p.item,x,y,32,flip);if((S.living.bonds[p.item]||0)>=3600){this.rect(x-5,y-12,10,2,'#ce91a6');this.rect(x+3,y-11,3,4,'#e6afbb');}}
   if(selected){c.strokeStyle='#fff0b5';c.lineWidth=1;c.strokeRect(Math.round(x)-21,Math.round(y)-35,42,40);}
   this.hits.push({key:p.key,pet:p.type==='pet'?p.item:null,x:x-20,y:y-35,w:40,h:40});
  }
  if(!this.room){for(let i=0;i<S.living.memorials.length;i++){const x=50+i%4*22,y=185+Math.floor(i/4)*17;this.spr('tree',x,y,28);this.hits.push({kind:'memorial',name:S.living.memorials[i].name,x:x-10,y:y-28,w:20,h:30});}
   const time=gardenTime();if(time!=='day'){c.fillStyle=time==='night'?'rgba(24,24,64,.30)':'rgba(104,57,86,.16)';c.fillRect(0,0,480,320);for(const [x,y] of [[78,111],[128,111],[269,218],[40,280]]){c.fillStyle='rgba(255,202,123,.15)';c.fillRect(x-9,y-9,20,20);this.rect(x-1,y-3,3,6,'#f8d998');}}
   if(gardenWeather()==='rain'){c.strokeStyle='#a8c9d4';c.lineWidth=1;c.globalAlpha=.45;const rr=seeded(750);for(let i=0;i<(this.passive?40:95);i++){const x=rr()*490-5,yy=(rr()*350+t*85)%350-15;c.beginPath();c.moveTo(x,yy);c.lineTo(x-2,yy+6);c.stroke();}c.globalAlpha=1;for(let i=0;i<5;i++){const phase=(t*.65+i*.2)%1;c.strokeStyle='rgba(190,224,226,'+(1-phase)*.6+')';c.strokeRect(325+i*14,140+(i%3)*13,5+phase*6,2+phase*2);}}
   if(gardenWeather()==='snow'){const r=seeded(118);for(let i=0;i<60;i++){this.rect((r()*480+Math.sin(t*.3+i)*3)%480,(r()*320+t*9)%320,2,2,'#e2ebdb');}}
   if(time==='night'&&motion&&gardenWeather()==='clear')for(let i=0;i<12;i++){c.globalAlpha=.2+.5*(.5+.5*Math.sin(t+i));this.rect(170+Math.sin(t*.1+i*8)*140,190+Math.cos(t*.13+i*7)*80,1,2,'#e1e9a3');}c.globalAlpha=1;
  }
  if(UI.gardenEdit&&!this.passive){c.strokeStyle='rgba(255,244,196,.18)';for(let x=32;x<450;x+=16){c.beginPath();c.moveTo(x,96);c.lineTo(x,289);c.stroke();}for(let y=96;y<290;y+=16){c.beginPath();c.moveTo(32,y);c.lineTo(449,y);c.stroke();}}
  this.hearts=this.hearts.filter(h=>now-h.at<1800);for(const h of this.hearts){const q=(now-h.at)/1800;c.globalAlpha=1-q;h.water?c.strokeRect(h.x-q*10,h.y-q*3,20*q,6*q):this.spr('star',h.x,h.y-q*18,12);c.globalAlpha=1;}
  // Whole world is visible initially; pinch/zoom and pan reveal details.
  const scale=(this.passive?Math.max(this.width/480,this.height/320):Math.min(this.width/480,this.height/320))*this.zoom,ox=(this.width-480*scale)/2+this.pan.x,oy=(this.height-320*scale)/2+this.pan.y;this.fit={scale,ox,oy};
  this.view.imageSmoothingEnabled=false;this.view.fillStyle=this.room?'#292531':gardenTime()==='night'?'#1c2831':'#405d3d';this.view.fillRect(0,0,this.width,this.height);this.view.drawImage(this.world,ox,oy,480*scale,320*scale);
 }
}

function livingHost(cls='',passive=false){return `<div class="living-host ${cls}" data-living-host data-passive="${passive?'1':'0'}" role="img" aria-label="Kendi piksel bahçen"></div>`;}
function mountGardens(){for(const h of $$('[data-living-host]'))if(!h.dataset.mounted){h.dataset.mounted='1';new LivingGarden(h,{passive:h.dataset.passive==='1',room:UI.gardenRoom&&UI.route==='garden',full:!!UI.gardenFull});}}
function destroyGardens(){for(const g of [...gardenInstances])g.destroy();}
let gardenUndo=[];
function rememberGarden(){gardenUndo.push(JSON.stringify({placement:S.living.placement,ground:S.living.ground,layout:S.world.layout}));if(gardenUndo.length>25)gardenUndo.shift();}
function gardenToolbar(){return `<div class="garden-tools"><button class="icon-btn" data-action="garden-zoom" data-delta="0.3" aria-label="Bahçeye yakınlaş">+</button><button class="icon-btn" data-action="garden-zoom" data-delta="-0.3" aria-label="Bahçeden uzaklaş">−</button><button class="icon-btn" data-action="garden-full" aria-label="${UI.gardenFull?'Tam ekrandan çık':'Bahçeyi tam ekran yap'}">${icon(UI.gardenFull?'shrink':'expand')}</button><button class="icon-btn" data-action="living-weather" aria-label="Hava ve tema">${icon('rain')}</button><button class="icon-btn" data-action="living-postcard" aria-label="Bahçenin kartpostalını kaydet">${icon('image')}</button>${UI.gardenRoom?`<button class="icon-btn" data-action="living-exit-room" aria-label="Bahçeye çık">${icon('back')}</button>`:''}</div>`;}
renderGarden=function(){return `<div class="${UI.gardenFull?'garden-full':'page garden-page living-page'}">${UI.gardenFull?'':header()+`<div class="section-heading"><div><span class="eyebrow">KENDİ KÜÇÜK DÜNYAN</span><h1>${UI.gardenRoom?'Kulübem':'Bahçem'}</h1></div><button class="round-link" data-action="seed-album">${icon('leaf',16)} Tohumlar</button></div>`}<div class="garden-stage">${livingHost()}${gardenToolbar()}${UI.gardenEdit?`<div class="garden-edit-chip">${icon('edit',14)} Düzenleme <button data-action="living-undo" aria-label="Geri al">${icon('undo',16)}</button></div>`:''}</div><div class="garden-dock"><button class="${UI.gardenEdit?'active':''}" data-action="garden-edit">${icon(UI.gardenEdit?'check':'edit',19)}${UI.gardenEdit?'Bitti':'Düzenle'}</button><button data-action="route" data-route="shop">${icon('grid',19)}Mağaza</button><button data-action="inventory">${icon('leaf',19)}Koleksiyon</button>${UI.gardenEdit?`<button data-action="living-ground">${icon('grid',19)}Zemin</button>`:''}</div>${UI.gardenEdit?'<div id="garden-selection"></div>':''}${UI.gardenFull?'':`<div class="garden-quiet-stats"><span>${fmtMinutes(worldSeconds()/60)} odak</span><span>${S.world.harvested.length} bitki</span><button data-action="living-weather">Bahçemi tema yap ${icon('arrow',14)}</button></div><div class="nursery-status">${S.world.plots.map((p,i)=>`<button data-action="seed-sheet" data-slot="${i}">${p?pixel(activePlantSprite(p),28):icon('plus',19)}<span>${p?plantProgress(p)>=1?'Bahçeye hazır':plantMilestone(p)+' dk kaldı':'Tohum ek'}</span></button>`).join('')}</div><button class="weekly-link" data-action="route" data-route="weekly">${icon('calendar',19)} Haftam ${icon('arrow',16)}</button>`}</div>`;};
function updateGardenSelection(){const node=$('#garden-selection');if(!node)return;node.innerHTML=UI.selectedLiving?`<button class="text-btn" data-action="living-remove">${icon('archive',16)} Seçili öğeyi koleksiyona kaldır</button>`:'<span class="hint">Bir öğeye dokun, sonra sürükle.</span>';}
seedSheet=function(index){const p=S.world.plots[index];UI.seedSlot=index;sheet(p?SEEDS[p.kind].name:'Bir tohum seç',p?`<div class="seed-detail">${pixel(activePlantSprite(p),90)}<div class="growth-track"><i style="width:${plantProgress(p)*100}%"></i></div><strong>${plantProgress(p)>=1?'Bahçeye dikilmeye hazır':plantMilestone(p)+' dakika çalışma kaldı'}</strong><div class="seed-stages">${['seed','sprout','bud',SEEDS[p.kind].sprite].map(k=>pixel(k,35)).join('')}</div><button class="btn primary full" data-action="${plantProgress(p)>=1?'harvest':'living-water'}" data-slot="${index}">${plantProgress(p)>=1?'Bahçeye dik':'Sula'}</button><p class="hint">Çalıştıkça büyür. Ara verince solmaz.</p></div>`:`<div class="seed-grid">${Object.entries(SEEDS).map(([k,s])=>`<button class="seed-card" data-action="plant-seed" data-slot="${index}" data-kind="${k}">${pixel(s.sprite,54)}<strong>${s.name}</strong><small>${s.minutes} dk odak · ücretsiz</small></button>`).join('')}</div>`,'seed');};
placeOwned=async function(type,id){if(type==='decor'&&id.startsWith('pot')){S.world.pot=id;await persist(true);closeSheet();return;}
 if(type==='pet'&&!owns(type,id)||type==='decor'&&!owns(type,id)||type==='plant'&&!S.world.harvested.some(h=>h.id===id))return;
 rememberGarden();if(!S.world.layout.some(p=>p.type===type&&p.item===id)){if(S.world.layout.length>=30){toast('Önce bir öğeyi koleksiyona kaldır.');return;}S.world.layout.push({id:uid(),type,item:id,x:50,y:75});}
 const key=type+':'+id;if(!S.living.placement[key])S.living.placement[key]={x:238,y:245,room:!!UI.gardenRoom};UI.selectedLiving=key;UI.gardenEdit=true;await persist(true);closeSheet();UI.route='garden';render();};
