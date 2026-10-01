/* Animations stay in the existing throttled/visibility-aware canvas loop.
   No extra RAF, timers, audio, DOM nodes per frame or persistent tap state. */
const animatedSakura055=new Set(['jpKoiPond','jpFrogPond','jpBambooFountain','jpWindChime']);
const artBeforeSakura055=LivingGarden.prototype.art054;
LivingGarden.prototype.art054=function(kind,x,y,size,t=0){
 artBeforeSakura055.call(this,kind,x,y,size,t);
 if(!Object.prototype.hasOwnProperty.call(SAKURA_CATALOG055,kind))return;
 const c=this.ctx,k=size/64,motion=!document.body.classList.contains('no-motion'),now=performance.now();
 t=motion?t:0;
 const touched=motion&&Number.isFinite(this.sakuraTap055?.[kind])?Math.max(0,1-(now-this.sakuraTap055[kind])/2000):0;
 c.save();c.translate(Math.round(x-size/2),Math.round(y-size));c.scale(k,k);c.imageSmoothingEnabled=false;
 const rect=(a,b,w,h,col)=>this.rect(Math.round(a),Math.round(b),w,h,col);
 if(kind==='jpKoiPond'){
  const speed=this.passive?.6:1;
  for(let i=0;i<4;i++){
   const phase=t*.20*speed+i*Math.PI/2,px=31+Math.cos(phase)*(11+i%2*2),py=33+Math.sin(phase)*(6+i%2),flip=Math.cos(phase+Math.PI/2)<0;
   c.save();c.translate(Math.round(px),Math.round(py));c.scale(flip?-1:1,1);
   rect(-4,-1,8,3,'#fcf0d0');rect(-2,-2,5,1,'#f9f0d8');rect(-2,2,3,1,'#b4d4cb');
   const col=i===2?'#354e58':i===3?'#dcaa5d':'#dc6849';rect(-2,-1,i%2?4:2,2,col);rect(2,0,2,2,col);rect(4,0,1,1,'#263f43');
   const tail=motion&&Math.sin(t*2.4+i)>0?1:0;rect(-7,-2+tail,2,2,'#f7e6c4');rect(-7,1+tail,2,2,'#f7e6c4');rect(-5,0,2,1,col);c.restore();
  }
  for(let i=0;i<3;i++)rect(18+i*12+(motion?Math.sin(t*.7+i)*2:0),23+i*8,5,1,'#c0e8d880');
  if(touched){const q=1-touched;c.strokeStyle='#d8eceb';c.globalAlpha=touched*.9;c.lineWidth=.7;c.strokeRect(32-q*10,34-q*4,q*20+2,q*8+1);c.globalAlpha=1;}
 }
 if(kind==='jpFrogPond'){
  for(const [i,[fx,fy]]of [[14,24],[47,42],[28,45]].entries()){
   const hop=motion?(touched?Math.abs(Math.sin((1-touched)*Math.PI*3))*5:i===0?Math.max(0,Math.sin(t*.5))*2:0):0;
   c.save();c.translate(fx,fy-Math.round(hop));rect(-5,-2,10,5,'#578551');rect(-4,-4,3,3,'#93b974');rect(2,-4,3,3,'#93b974');rect(-3,-3,1,1,'#243b40');rect(3,-3,1,1,'#243b40');rect(-3,0,7,3,'#c4d493');rect(-6,3,3,1,'#4c7550');rect(4,3,3,1,'#4c7550');c.restore();
  }
  if(touched){c.strokeStyle='#d5e9c6';c.globalAlpha=touched;c.lineWidth=.6;c.strokeRect(25-(1-touched)*6,35,13+(1-touched)*12,4);c.globalAlpha=1;}
 }
 if(kind==='jpBambooFountain'){
  const phase=(t*.14)%1,tilt=motion&&phase>.70?Math.sin((phase-.70)/.30*Math.PI)*.30:0;
  c.save();c.translate(42,30);c.rotate(tilt);rect(-16,-2,23,4,'#b9c78b');rect(-15,-2,21,1,'#e1dfaa');rect(-16,1,22,1,'#6a8a5b');rect(-16,-2,2,4,'#52775a');c.restore();
  if(!motion||phase<.74)for(let i=0;i<3;i++)rect(31,18+(t*12+i*4)%8,1,2,'#c1e8db');
  if(motion&&phase>.78){rect(30,34+(phase-.78)*36,1,3,'#d1eade');rect(32,34+(phase-.78)*25,1,2,'#cce4e3');}
 }
 if(kind==='jpWindChime'){
  // Repaint the hanging tag over its fixed recipe; slight sway only inside model.
  if(motion){const sx=Math.round(Math.sin(t*.9)*(touched?3:1));rect(25,36,10,16,'#ecd5b6');rect(26+sx,40,3,3,'#cc809e');rect(28+sx,43,3,3,'#da9ab2');rect(29+sx,31,1,7,'#896b50');}
 }
 if(['jpPaperLantern','jpLanternTrio','jpBlossomLantern','jpDragonLantern','jpFestivalGarland','jpPagoda'].includes(kind)&&gardenTime()!=='day'){
  c.globalAlpha=.10+(motion?.025*Math.sin(t*.7):0);rect(15,15,35,29,'#fff1b3');c.globalAlpha=1;
 }
 c.restore();
};
const upBeforeSakura055=LivingGarden.prototype.up;
LivingGarden.prototype.up=async function(e,cancel=false){const d=this.drag,hit=d?.hit;
 if(!cancel&&!this.passive&&!UI.gardenEdit&&!UI.overlay&&d&&!d.moved&&!this.pinch&&animatedSakura055.has(hit?.item)&&this.pointers.has(e.pointerId)){
  this.pointers.delete(e.pointerId);this.drag=null;this.sakuraTap055??={};this.sakuraTap055[hit.item]=performance.now();
  this.paint(performance.now());if(!document.body.classList.contains('no-motion'))this.schedule();return;
 }
 return upBeforeSakura055.call(this,e,cancel);
};
