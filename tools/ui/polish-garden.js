/* Seasonal scene and furnishing layer on the fixed, no-pan 0.5.3 viewport. */
const sceneryBefore054=sceneryProfile;
sceneryProfile=function(){const base={...sceneryBefore054()},mode=atmosphere054();
 if(mode==='sakura')Object.assign(base,{name:'Sakura bahçesi',sky:'#e9dff1',far:'#bb9ec6',hill:'#91ac8a',grass:'#86a86d',earth:'#668152',light:'#fff3ba'});
 if(mode==='halloween')Object.assign(base,{name:'Cadılar Bayramı',sky:'#292236',far:'#51405b',hill:'#82623f',grass:'#9b7950',earth:'#795835',light:'#f8c97a'});
 if(mode==='winter')Object.assign(base,{name:'Yılbaşı bahçesi',sky:'#192b48',far:'#476087',hill:'#b9cadd',grass:'#e2edf1',earth:'#a9c0d2',light:'#fff0bc'});
 if(gardenWeather()==='snow')Object.assign(base,{grass:'#e5eef2',earth:'#b6cbd7',hill:'#bdcbd9'});
 return base;
};
gardenWeather=function(){return ['clear','rain','snow'].includes(S.living.weather)?S.living.weather:'clear';};
gardenTime=function(){return ['day','dusk','night'].includes(S.living.time)?S.living.time:'day';};
const Garden053=LivingGarden;
LivingGarden=class SeasonalGarden054 extends Garden053{
 tree(x,y,s=1,pine=false,t=0){const mode=atmosphere054(),snow=gardenWeather()==='snow',c=this.ctx;
  if(mode==='normal'){super.tree(x,y,s,pine,t);if(snow){c.save();c.translate(x,y);c.scale(s,s);this.rect(pine?-7:-12,pine?-58:-61,pine?14:24,4,'#f5f8fa');this.rect(pine?-15:-21,pine?-35:-42,pine?30:13,4,'#e0edf5');c.restore();}return;}
  c.save();c.translate(Math.round(x),Math.round(y));c.scale(s,s);this.rect(-14,-2,29,5,snow?'#abc4d6':'#48563d');this.rect(-4,-37,9,40,'#73513a');this.rect(-1,-32,3,34,'#a67a50');
  if(mode==='winter'){
   this.poly([[0,-76],[-16,-48],[-10,-48],[-25,-23],[-16,-23],[-31,-4],[31,-4],[15,-23],[24,-23],[10,-48],[16,-48]],'#234e42');
   this.poly([[-2,-66],[-13,-47],[-4,-47],[-18,-22],[-8,-22],[-25,-8],[1,-8],[9,-26],[3,-26],[8,-49]],'#488365');
   this.rect(-3,-81,6,10,'#f4c952');this.rect(-6,-78,12,4,'#ffe3a0');
   for(let i=0;i<14;i++){const yy=-51+i*3.2,xx=Math.sin(i*1.7)*Math.min(23,Math.abs(yy+70)*.46);this.rect(xx,yy,3,3,['#f6d27b','#d96273','#9adfd1'][i%3]);if(i%4===Math.floor(t)%4){c.globalAlpha=.15;this.rect(xx-2,yy-2,7,7,'#fff2b2');c.globalAlpha=1;}}
   if(snow){this.rect(-6,-64,12,3,'#eaf7fa');this.rect(-16,-37,9,3,'#e5f0f6');this.rect(12,-19,13,3,'#e5f0f6');}
   for(let i=0;i<2;i++){this.rect(-19+i*21,-4-i*2,14,11,i?'#d6656c':'#457bb2');this.rect(-13+i*21,-4-i*2,3,11,'#f3d995');this.rect(-19+i*21,-1-i*2,14,2,'#f3d995');}
  }else{
   const sakura=mode==='sakura';this.poly([[-28,-39],[-34,-51],[-26,-62],[-14,-64],[-9,-75],[9,-77],[17,-68],[30,-64],[36,-49],[29,-36],[15,-29],[-10,-29]],sakura?'#bf759b':'#755438');
   this.poly([[-29,-53],[-20,-64],[-8,-64],[-7,-74],[9,-74],[12,-65],[27,-61],[32,-49],[22,-37],[5,-33],[-15,-37]],sakura?'#eea2c7':'#c08b42');
   this.rect(-26,-55,16,13,sakura?'#fac1da':'#e2b45e');this.rect(-8,-70,13,18,sakura?'#ffdae7':'#dab75e');this.rect(11,-56,15,16,sakura?'#f7b6d4':'#a8aa52');this.rect(-8,-43,14,9,sakura?'#d38aaf':'#a46a3f');
   const rr=seeded(Math.round(x*13+y));for(let i=0;i<14;i++)this.rect(-22+rr()*45,-64+rr()*26,3,i%2?2:3,sakura?(i%2?'#ffe6ee':'#f1c1d3'):(i%2?'#e6c76a':'#b55c3d'));
   if(!sakura){this.art054('pumpkinDisplay',x>180?15:-13,6,23,t);}
   if(snow){this.rect(-21,-63,13,4,'#f6fafc');this.rect(7,-64,14,4,'#f6fafc');}
  }c.restore();
 }
 cabin(t){super.cabin(t);const mode=atmosphere054(),snow=gardenWeather()==='snow';
  if(mode==='sakura'){this.poly([[57,90],[71,58],[141,58],[154,90]],'#9878a4');for(let y=63;y<92;y+=6)this.rect(70-(y-63)*.44,y,74+(y-63)*.62,2,'#d5a6c3');for(const x of [66,145])for(let i=0;i<5;i++){this.rect(x+Math.sin(i)*3,94+i*9,3,7,'#5e8456');this.rect(x-2+Math.sin(i)*3,95+i*9,7,4,i%2?'#f8c0d9':'#e89dc2');}this.rect(97,115,12,24,'#8b6275');}
  if(mode==='winter'||snow){this.poly([[55,88],[68,57],[140,57],[155,88],[147,87],[137,65],[76,65],[63,89]],'#f0f6f8');this.rect(49,93,111,4,'#f5faf9');this.rect(51,97,3,6,'#c6e3ee');this.rect(69,97,3,9,'#c6e3ee');this.rect(145,97,3,5,'#c6e3ee');}
  if(mode==='winter'){this.rect(51,98,109,2,'#406652');for(let i=0;i<12;i++)this.rect(53+i*9,100+i%2*2,3,4,['#f7cf71','#d15e6f','#89cab6'][i%3]);this.rect(89,113,4,23,'#42795a');this.rect(112,113,4,23,'#42795a');this.rect(89,111,27,4,'#5d9458');this.rect(99,110,7,5,'#bb5669');}
  if(mode==='halloween'){this.poly([[54,91],[70,58],[140,58],[158,91]],'#534254');for(let y=65;y<=89;y+=7)this.rect(69-(y-65)*.5,y,75+(y-65)*.7,2,'#795e6b');for(const x of [73,128]){this.rect(x,60,5,15,'#e5dfcb');this.rect(x+4,74,5,18,'#dddcca');this.rect(x+4,91,4,15,'#e7e1cf');this.rect(x+7,104,4,10,'#d0d3c4');}this.art054('pumpkinDisplay',76,149,29,t);this.art054('pumpkinDisplay',136,150,24,t);this.art054('scarecrow',177,158,37,t);}
 }
 interior(t){const walls={cream:['#e9d7b6','#c7b893'],sage:['#c7d2b4','#879d7f'],rose:['#e7c8c7','#bd939c'],night:['#73869d','#485d7b']},floors={oak:['#b8865f','#c89a70'],walnut:['#796049','#8e7051'],light:['#d3bc92','#e1caa5']},[wall,trim]=walls[S.living.roomWall]||walls.cream,[floor,plank]=floors[S.living.roomFloor]||floors.oak;
  this.rect(0,0,480,320,'#252734');this.rect(25,25,430,276,'#624e45');this.rect(31,31,418,115,wall);this.rect(31,139,418,155,floor);
  for(let y=145;y<291;y+=16){this.rect(31,y,418,1,'#72543e55');for(let x=34+(y%32?0:21);x<439;x+=44){this.rect(x,y+3,34,8,plank);this.rect(x+37,y,1,15,'#73574450');}}
  this.rect(31,133,418,7,trim);for(const x of [31,442])this.rect(x,31,7,262,'#877057');this.rect(31,31,418,7,'#9d8061');
  this.rect(64,54,60,57,'#806956');this.rect(69,59,50,47,gardenTime()==='night'?'#354366':'#a3ced3');this.rect(93,59,3,47,'#eee5c8');this.rect(69,81,50,3,'#eee5c8');this.rect(60,110,68,5,'#9b765c');
  if(gardenWeather()==='snow'){for(let i=0;i<9;i++)this.rect(73+(i*13)%40,62+(i*17+t*5)%40,2,2,'#f9fcf9');}else if(gardenWeather()==='rain'){for(let i=0;i<8;i++)this.rect(71+(i*11)%45,63+(i*17+t*32)%40,1,4,'#e0f2ee');}
  const mode=atmosphere054();if(mode==='winter'){for(let i=0;i<20;i++)this.rect(42+i*20,38+Math.sin(i*.4)*3,3,4,['#eec967','#c06c7b','#8fc4b4'][i%3]);}if(mode==='sakura'){for(let i=0;i<6;i++)this.rect(146+i*36,49+(i%2)*4,4,4,'#dda5bd');}if(mode==='halloween'){this.art054('pumpkinDisplay',400,129,35,t);}
  this.rect(204,284,72,10,'#d7c5a1');this.rect(224,294,34,3,'#f0dfb8');this.poly([[235,294],[245,294],[240,299]],'#8c6650');this.hits.push({kind:'exit',x:201,y:281,w:78,h:19});
 }
 art054(kind,x,y,size,t=0){const img=decorCanvas054(kind);if(!img)return;const c=this.ctx;c.imageSmoothingEnabled=false;c.drawImage(img,Math.round(x-size/2),Math.round(y-size),size,size);
  const ux=x-size/2,uy=y-size,k=size/64;c.save();c.translate(ux,uy);c.scale(k,k);
  if(kind==='television'){this.rect(13,19,38,22,S.living.roomDevices.television?'#28475a':'#1a2029');if(S.living.roomDevices.television){this.rect(15,20,34,7,'#739da1');this.poly([[15,35],[23,27],[29,33],[39,24],[49,35],[49,39],[15,39]],'#648f65');this.rect(19+Math.floor(t*.8)%25,23,4,3,'#dfdb9a');}}
  if(kind==='fireplace'&&!S.living.roomDevices.fireplace)this.rect(21,32,22,21,'#332b30');
  if((kind==='fireplace'&&S.living.roomDevices.fireplace)||kind==='campfire'){const by=kind==='fireplace'?51:43;for(let i=0;i<4;i++){const hh=6+Math.floor((Math.sin(t*4+i*2)+1)*4);this.rect(24+i*4,by-hh,4,hh,i%2?'#f5c861':'#e98a45');}}
  if(kind==='fountain'||kind==='birdbath'){for(let i=0;i<3;i++)this.rect(22+i*8,kind==='fountain'?29+(t*8+i*7)%14:29,2,2,'#c6f2e8');}
  if(kind==='aquarium'&&S.living.roomDevices.aquarium){this.rect(16+(Math.sin(t*.6)+1)*13,30,5,2,'#eabc70');this.rect(17+(Math.cos(t*.4)+1)*13,36,4,2,'#e8aea1');}
  if(['lantern','lampPost','floorLamp','stoneLantern','pergola'].includes(kind)&&gardenTime()!=='day'){c.globalAlpha=.10;this.rect(20,10,24,21,'#fff4ab');c.globalAlpha=1;}
  c.restore();
 }
 decor(kind,x,y,t){if(DECOR_ART054[kind])this.art054(kind,x,y,DECOR[kind]?.size||40,t);else super.decor(kind,x,y,t);}
 seasonEffects054(t,motion){const mode=atmosphere054();if(!['sakura','halloween'].includes(mode))return;const r=seeded(486),w=360,h=480;for(let i=0;i<(this.passive?16:33);i++){const x=(r()*w+Math.sin(t*.65+i)*12+w)%w,y=(r()*h+t*(mode==='sakura'?12:16))%h;this.rect(x,y,mode==='sakura'?3:4,2,mode==='sakura'?['#f9c4dc','#f4b2cf','#ffe1ec'][i%3]:['#d6b95d','#b77846','#8fa35d'][i%3]);} }
 async up(e,cancel=false){const d=this.drag,hit=d?.hit,click=!cancel&&d&&!d.moved&&!this.pinch&&!UI.gardenEdit;if(click&&hit?.item&&['television','fireplace','aquarium'].includes(hit.item)){this.pointers.delete(e.pointerId);this.drag=null;S.living.roomDevices[hit.item]=!S.living.roomDevices[hit.item];await persist(true);this.update();return;}return super.up(e,cancel);}
 paint(now){if(this.dead||!ready)return;const w=this.room?480:360,h=this.room?320:480;if(this.world.width!==w||this.world.height!==h){this.world.width=w;this.world.height=h;}
  const c=this.ctx,motion=!document.body.classList.contains('no-motion'),t=motion?now/1000:0;this.hits=[];c.imageSmoothingEnabled=false;c.globalAlpha=1;
  this.room?this.interior(t):this.portraitScenery(t);
  const ps=livingPlacements().filter(p=>!!p.pos.room===this.room).sort((a,b)=>Number(!['rug','rugRound','cobbledPath','vegetablePatch','picnic','jpTatami','jpZenGarden','jpMossPath','jpHanamiPicnic','trKilim056','trTile056'].includes(a.item))-Number(!['rug','rugRound','cobbledPath','vegetablePatch','picnic','jpTatami','jpZenGarden','jpMossPath','jpHanamiPicnic','trKilim056','trTile056'].includes(b.item))||a.pos.y-b.pos.y);
  for(const p of ps){let {x,y}=this.point(p.pos);const selected=UI.gardenEdit&&UI.selectedLiving===p.key;let flip=false;
   if(p.type==='pet'&&motion&&!UI.gardenEdit){const phase=t*(this.passive?.1:.25)+keyHash(p.item),rest=Math.sin(t*.06+keyHash(p.item))>.65;
    if(p.item==='duck'&&!this.room){x=278+Math.sin(phase*.4)*19;y=250+Math.cos(phase*.3)*14;}
    else {const near=p.item==='cat'?ps.find(z=>z.item==='catbed'||z.item==='bench'):p.item==='bee'?ps.find(z=>z.item==='beehive'||z.item==='flowers'):['bird','owl','parrot'].includes(p.item)?ps.find(z=>z.item==='birdhouse'):null;
     if(near&&(rest||p.item==='bee')){const home=this.point(near.pos);x=home.x+(p.item==='bee'?Math.sin(phase)*13:0);y=home.y-(p.item==='bee'?22:p.item==='cat'?8:25);}else if(!rest){x+=Math.sin(phase)*7;y+=Math.cos(phase*.6)*4;}}flip=Math.cos(phase)<0;
   }
   c.globalAlpha=.15;this.rect(x-10,y-1,20,3,'#112322');c.globalAlpha=1;
   if(p.type==='memorial'){const m=S.living.memorials.find(m=>m.id===p.item);this.spr(m?.kind||'tree',x,y,36);}else if(p.type==='decor')this.decor(p.item,x,y,t);else if(p.type==='plant'){const plant=S.world.harvested.find(q=>q.id===p.item);this.spr(SEEDS[plant?.kind]?.sprite||'flower',x,y,32);}else this.spr(p.item,x,y,30,flip);
   const size=p.type==='decor'?(DECOR[p.item]?.size||40):36; if(selected){c.strokeStyle='#fff3ac';c.lineWidth=1;c.strokeRect(Math.round(x)-size/2,Math.round(y)-size,size,size+3);}
   this.hits.push({key:p.key,kind:p.type==='memorial'?'memorial':null,name:p.type==='memorial'?S.living.memorials.find(m=>m.id===p.item)?.name:null,pet:p.type==='pet'?p.item:null,item:p.item,x:x-size/2,y:y-size,w:size,h:size+3});
  }
  if(!this.room){
   const time=gardenTime();if(time!=='day'){c.fillStyle=time==='night'?'#13153042':'#67455025';c.fillRect(0,80,w,h-80);for(const [x,y] of [[48,125],[85,125],[225,297],[52,433]]){c.fillStyle='#ffdf9135';c.fillRect(x-7,y-7,16,16);this.rect(x,y,2,4,'#fbe5a3');}}
   if(gardenWeather()==='rain'){const rr=seeded(921);c.strokeStyle='#d4e9f077';c.lineWidth=1;for(let i=0;i<(this.passive?45:85);i++){const x=rr()*w,y=(rr()*h+t*74)%h;c.beginPath();c.moveTo(x,y);c.lineTo(x-2,y+5);c.stroke();}for(let i=0;i<5;i++){const q=(t*.6+i*.2)%1;c.strokeStyle='#d4e9f066';c.strokeRect(265+i*9,230+i%3*14,3+q*5,1+q*2);}}
   if(gardenWeather()==='snow'){const r=seeded(118);for(let i=0;i<48;i++)this.rect((r()*w+Math.sin(t*.3+i)*2)%w,(r()*h+t*8)%h,2,2,'#f7faf1');}
   if(time==='night'&&gardenWeather()==='clear')for(let i=0;i<16;i++){c.globalAlpha=.35+.3*Math.sin(t+i);this.rect(40+(i*31)%280+Math.sin(t*.1+i)*3,290+(i*23)%130,1,2,'#f1eab8');}c.globalAlpha=1;
  }
  if(!this.room)this.seasonEffects054(t,motion);
  if(UI.gardenEdit&&!this.passive&&!this.room){c.strokeStyle='#f8efb31c';for(let x=24;x<340;x+=16){c.beginPath();c.moveTo(x,182);c.lineTo(x,437);c.stroke();}for(let y=181;y<440;y+=16){c.beginPath();c.moveTo(24,y);c.lineTo(338,y);c.stroke();}}
  this.hearts=this.hearts.filter(v=>now-v.at<1500);for(const a of this.hearts){const q=(now-a.at)/1500;c.globalAlpha=1-q;if(a.water){c.strokeStyle='#d7eeeb';c.strokeRect(a.x-q*10,a.y-q*4,q*20,q*8);}else this.spr('star',a.x,a.y-q*17,12);c.globalAlpha=1;}
  this.fit=this.clampCamera();const v=this.view;v.imageSmoothingEnabled=false;v.fillStyle=this.room?'#292531':sceneryProfile().grass;v.fillRect(0,0,this.width,this.height);v.drawImage(this.world,this.fit.ox,this.fit.oy,w*this.fit.scale,h*this.fit.scale);
 }
};
