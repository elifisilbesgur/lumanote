/* All six indoor scenes share the existing bounded camera and editable item system.
 * Each scene owns a separate item assignment. Its floor remains 360 x 480 pixels,
 * matching the large garden portrait rather than a compressed landscape room. */
const GardenBefore057=LivingGarden;
LivingGarden=class HomeGarden057 extends GardenBefore057{
 constructor(host,opts={}){super(host,opts);this.roomId057=opts.roomId||UI.interior057||'salon';this.canvas.setAttribute('aria-label',this.room?(SPACES057[this.roomId057]?.name||'Ev')+' · döşenebilir piksel alan':'Yaşayan piksel bahçe');}
 space057(){return SPACES057[this.roomId057||UI.interior057]?this.roomId057||UI.interior057:'salon';}
 point(pos){return this.room?interiorPoint057(pos):super.point(pos);}
 layoutPoint(p){return this.room?interiorLayout057(p):super.layoutPoint(p);}
 async up(e,cancel=false){const d=this.drag,hit=d?.hit;if(!cancel&&!this.passive&&!UI.overlay&&!UI.gardenEdit&&d&&!d.moved&&!this.pinch&&!this.touchBlock056&&this.pointers.has(e.pointerId)){
  if(['cabin','greenhouse','exit','roomdoor057'].includes(hit?.kind)){this.pointers.delete(e.pointerId);this.drag=null;if(hit.kind==='exit')exitSpace057();else openSpace057(hit.kind==='greenhouse'?'greenhouse':hit.kind==='cabin'?'salon':hit.space);return;}
 }
 return super.up(e,cancel);}
 art054(kind,x,y,size,t=0){super.art054(kind,x,y,size,t);if(!WINTER057[kind]&&!HALLOWEEN057[kind]&&!FURNITURE057[kind])return;
  const c=this.ctx,motion=!document.body.classList.contains('no-motion');c.save();c.translate(x-size/2,y-size);c.scale(size/64,size/64);
  if(['wnStringLights057','wnLantern057','wnStar057','wnCandleRing057','wnWreath057','wnFestiveFence057'].includes(kind)){c.globalAlpha=.12+(motion?.05*Math.sin(t*1.7):0);this.rect(12,16,40,32,'#fff0a7');}
  if(kind==='hwCauldron057'){for(let i=0;i<5;i++){const q=motion?(t*.35+i*.2)%1:.4;c.globalAlpha=(1-q)*.75;this.rect(22+i*5+Math.sin(i+t)*2,26-q*17,2+i%2,3,'#b2e693');}}
  if(kind==='wnSnowGlobe057'){c.globalAlpha=.8;for(let i=0;i<9;i++)this.rect(21+(i*13)%24,18+((motion?t*6:2)+i*7)%20,1,2,'#f6fff3');}
  if(kind==='hwLantern057'||kind==='hwPumpkinArch057'||kind==='hwSpellBook057'){c.globalAlpha=.16+(motion?.07*Math.sin(t*2):0);this.rect(17,24,29,23,'#ffc686');}
  if(kind==='ghTerrarium057'){c.globalAlpha=.24;this.rect(19,27,2,14,'#efffff');}
  c.restore();
 }
 window057(x,y,w,h,t,glass=false){const c=this.ctx,night=gardenTime()==='night',snow=gardenWeather()==='snow';
  this.rect(x-3,y-3,w+6,h+6,'#634b3b');this.rect(x,y,w,h,night?'#394858':snow?'#bbd2cc':'#adbf9d');
  c.save();c.beginPath();c.rect(x,y,w,h);c.clip();
  const r=seeded(Math.round(x*5+y));for(let i=0;i<20;i++){const xx=x+r()*w,yy=y+r()*h,ww=9+r()*15;this.rect(xx,yy,ww,8+r()*16,night?(i%2?'#30434c':'#51635d'):(i%2?'#718e65':'#92a478'));}
  this.poly([[x+w*.48,y],[x+w*.69,y],[x+w*.10,y+h],[x,y+h]],night?'#b1cbb315':'#f5eed331');
  if(gardenWeather()==='rain')for(let i=0;i<12;i++)this.rect(x+(i*13)%Math.max(1,w),y+((t*52+i*19)%h),1,5,'#dce9de90');
  if(snow)for(let i=0;i<10;i++)this.rect(x+(i*17)%Math.max(1,w),y+((t*7+i*23)%h),2,2,'#f3f6ec');
  c.restore();this.rect(x+w/2-2,y,4,h,'#8e6b4e');this.rect(x,y+h*.54,w,4,'#886347');this.rect(x-5,y+h, w+10,6,'#ac8557');this.rect(x-4,y+h,w+8,2,'#d1b286');
 }
 roomBase057(t){const id=this.space057(),style=S.living.rooms057.styles[id],c=this.ctx,green=id==='greenhouse';
  const wall={cream:'#d4c4a4',sage:'#b4c4a6',rose:'#d4b8b5',night:'#929fb0',mist:'#bfced0'}[style.wall]||'#d4c4a4';
  const floor={oak:'#ad8459',walnut:'#705642',light:'#ccba94',tile:'#b7c6b7',stone:'#a7ad91'}[style.floor]||'#ad8459';
  this.rect(0,0,360,480,'#342f2c');this.rect(6,6,348,461,'#66513f');this.rect(12,12,336,167,wall);
  this.poly([[12,159],[348,159],[348,467],[12,467]],floor);
  const rr=seeded(714);const tiled=['tile','stone'].includes(style.floor);
  if(tiled){for(let y=175;y<460;y+=26)for(let x=13;x<348;x+=28){this.rect(x,y,26,24,(x+y)%3?'#cdd4bc55':'#ecebd644');this.rect(x,y,26,1,'#69786550');this.rect(x,y,1,24,'#69786550');if(style.floor==='stone'&&(x+y)%5===0)this.rect(x+5,y+7,10,1,'#e1dfbb77');}}
  else for(let y=169;y<465;y+=15){this.rect(13,y,334,1,'#513e343a');for(let x=14+(y%2)*15;x<344;x+=42){this.rect(x,y+3,Math.min(33,344-x),8,'#f3d1a61a');this.rect(x,y+2,1,12,'#513e3438');}}
  this.rect(10,153,340,9,'#87654b');this.rect(11,155,338,2,'#caa778');this.rect(11,160,4,303,'#614733');this.rect(344,160,5,303,'#654c38');
  if(green){
   this.rect(12,12,336,147,'#b9c9a4');
   // Glass roof and back wall: narrow mullions, view into the garden, string lights.
   for(const [x,w]of [[21,61],[92,68],[170,69],[249,88]])this.window057(x,59,w,95,t,true);
   this.poly([[14,12],[179,12],[14,51]],'#d4ddc8');this.poly([[181,12],[346,12],[346,51]],'#b8cbb1');
   this.poly([[13,12],[20,12],[176,50],[169,52]],'#906b4a');this.poly([[86,12],[96,12],[177,50],[169,54]],'#a77b52');this.poly([[181,12],[188,12],[188,54],[177,54]],'#866044');
   this.poly([[271,12],[281,12],[190,54],[182,54]],'#977049');this.poly([[341,12],[349,12],[197,54],[189,52]],'#9b704e');
   const frame={cream:'#aa8867',sage:'#7f8863',rose:'#a87f79',night:'#5c6b7c',mist:'#83968e'}[style.wall];this.rect(13,51,336,9,frame);this.rect(15,52,332,3,'#bea16d');
   for(const x of [13,83,161,240,338]){this.rect(x,60,7,108,frame);this.rect(x+1,60,2,108,'#b99461');}
   // Border foliage belongs to the architecture, leaving most floor available.
   for(let i=0;i<12;i++){const x=i%2?331:23,y=174+Math.floor(i/2)*32;this.rect(x-5,y,12,14,'#94714d');this.rect(x-6,y,14,3,'#c49667');this.rect(x-1,y-17,2,19,'#4a6d48');for(let j=0;j<4;j++)this.rect(x+(j%2?1:-7),y-17+j*4,8,5,['#4f7850','#769659','#98ac69'][j%3]);}
   this.poly([[17,168],[96,168],[211,460],[155,460]],'#ffe7ac12');
  }else{
   this.rect(12,12,336,9,'#a98b64');this.rect(12,22,336,3,'#ebdcbb');
   this.window057(33,44,id==='bathroom'?59:85,83,t);
   this.window057(id==='bathroom'?268:247,44,id==='bathroom'?59:80,83,t);
   this.rect(140,47,81,84,'#8d7056');this.rect(145,52,71,74,id==='lounge'?'#ad8897':id==='kitchen'?'#68877a':id==='bathroom'?'#acd1ca':'#638385');
   this.poly([[149,107],[166,77],[179,93],[195,65],[211,106],[211,120],[149,120]],id==='bedroom'?'#c9c6ae':'#a6b68e');this.rect(194,63,9,8,'#efe0a6');
   if(id==='kitchen'){this.rect(17,140,326,12,'#d8dac8');for(let x=17;x<343;x+=19)this.rect(x,142,17,8,x%2?'#95b0a0':'#dbe2c9');}
   if(id==='bathroom'){for(let y=19;y<150;y+=16)for(let x=16;x<341;x+=17){c.globalAlpha=.17;this.rect(x,y,15,14,'#f5fff1');}c.globalAlpha=1;}
   this.rect(16,151,326,2,'#e4c69a');
  }
  // Warm bulbs form part of the structure, not unpurchased movable inventory.
  this.rect(27,29,306,1,'#69523e');for(let i=0;i<11;i++){const x=30+i*29,y=32+Math.round(Math.sin(i*.3)*5);this.rect(x,y-4,1,6,'#71563f');c.globalAlpha=.13;this.rect(x-4,y-3,12,13,'#fff1ac');c.globalAlpha=1;this.rect(x-1,y,4,5,'#e9bd66');this.rect(x,y,2,3,'#fff2bc');}
  this.rect(130,454,100,10,'#ddc395');this.rect(148,463,64,4,'#8b6949');this.hits.push({kind:'exit',x:122,y:451,w:116,h:24});
  // Side door opens the room chooser through an explicit destination.
  const target=id==='salon'?'kitchen':id==='kitchen'?'bathroom':id==='bathroom'?'lounge':id==='lounge'?'bedroom':id==='bedroom'?'salon':'salon';
  this.rect(339,272,12,58,'#4b4035');this.rect(339,274,3,55,'#e6c58f');this.rect(342,296,3,7,'#e5c879');this.hits.push({kind:'roomdoor057',space:target,x:333,y:270,w:22,h:64});
 }
 paint(now){if(!this.room)return super.paint(now);if(this.dead||!ready)return;
  if(this.world.width!==360||this.world.height!==480){this.world.width=360;this.world.height=480;}
  const c=this.ctx,t=document.body.classList.contains('no-motion')?0:now/1000;this.hits=[];c.globalAlpha=1;c.imageSmoothingEnabled=false;this.roomBase057(t);
  const floorItems=new Set(['rug','rugRound','jpTatami','jpZenGarden','jpMossPath','jpHanamiPicnic','trKilim056','trTile056','picnic','wnSkatePond057']);
  const ps=livingPlacements().filter(p=>itemSpace057(p)===this.space057()).sort((a,b)=>Number(!floorItems.has(a.item))-Number(!floorItems.has(b.item))||a.pos.y-b.pos.y);
  for(const p of ps){let {x,y}=interiorPoint057(p.pos);const size=(p.type==='decor'?(DECOR[p.item]?.size||48):36)*.92,selected=UI.gardenEdit&&UI.selectedLiving===p.key;
   if(p.type==='pet'&&t&&!UI.gardenEdit){x+=Math.sin(t*.26+keyHash(p.item))*4;y+=Math.cos(t*.2)*2;}
   c.globalAlpha=.16;this.rect(x-size*.35,y-2,size*.7,4,'#3c392f');c.globalAlpha=1;
   if(p.type==='decor')this.art054(p.item,x,y,size,t);else if(p.type==='plant'){const plant=S.world.harvested.find(q=>q.id===p.item);this.spr(SEEDS[plant?.kind]?.sprite||'flower',x,y,size);}else this.spr(p.item,x,y,size);
   if(selected){c.lineWidth=1;c.strokeStyle='#fff0b1';c.strokeRect(x-size/2,y-size,size,size+3);}
   this.hits.push({key:p.key,item:p.item,pet:p.type==='pet'?p.item:null,x:x-size/2,y:y-size,w:size,h:size+4});
  }
  this.hearts=this.hearts.filter(v=>now-v.at<1500);for(const h of this.hearts){const q=(now-h.at)/1500;c.globalAlpha=1-q;this.spr('star',h.x,h.y-q*17,12);}c.globalAlpha=1;
  this.fit=this.clampCamera();this.view.imageSmoothingEnabled=false;this.view.fillStyle='#443b31';this.view.fillRect(0,0,this.width,this.height);this.view.drawImage(this.world,this.fit.ox,this.fit.oy,360*this.fit.scale,480*this.fit.scale);
 }
};
// The canvas has discoverable keyboard/touch alternatives in the room navigation.
const selectionBefore057=updateGardenSelection;
updateGardenSelection=function(){const p=livingPlacements().find(p=>p.key===UI.selectedLiving);if(p&&itemSpace057(p)!==currentSpace057())UI.selectedLiving=null;selectionBefore057();const node=$('#garden-selection');if(node&&UI.gardenRoom)node.insertAdjacentHTML('beforeend','<button class="text-btn move-room057" data-action="move-room057" '+(UI.selectedLiving?'':'disabled')+'>Başka odaya taşı '+icon('arrow',15)+'</button>');};
