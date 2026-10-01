/* Every theme has its own movement; rendering is paused when offscreen or in the
   background. Reduced motion renders a single frame rather than hiding scenery. */
class Scene {
  constructor(host){
    this.host=host;
    this.mode=themes[S.preferences.theme].effect||'lava';
    if(this.mode==='lava')return new Lava(host);
    this.canvas=document.createElement('canvas');this.canvas.className='scene-canvas';host.appendChild(this.canvas);
    this.ctx=this.canvas.getContext('2d',{alpha:false});this.time=9.3;this.active=true;this.frameHandle=null;
    this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(host);
    this.visible=()=>document.hidden?this.pause():this.resume();document.addEventListener('visibilitychange',this.visible);
    this.resize();this.update();
  }
  resize(){const r=this.host.getBoundingClientRect();const d=Math.min(window.devicePixelRatio||1,1.5);this.w=Math.max(1,r.width);this.h=Math.max(1,r.height);this.canvas.width=Math.ceil(this.w*d);this.canvas.height=Math.ceil(this.h*d);this.ctx.setTransform(d,0,0,d,0,0);this.draw();}
  glow(x,y,r,color,alpha=1){const c=this.ctx;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');c.globalAlpha=alpha;c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);c.globalAlpha=1;}
  draw(){
    if(!this.ctx)return;const c=this.ctx,w=this.w,h=this.h,t=this.time,mode=this.mode;
    const theme=themes[S.preferences.theme];c.globalAlpha=1;c.fillStyle=theme.bg;c.fillRect(0,0,w,h);
    const intensity=S.preferences.lavaLight||.76;
    if(mode==='rain'){
      this.glow(w*.75,h*.45,w*.9,'#234e79',.8);this.glow(w*.1,h*.8,w*.8,'#385889',.6);
      for(let i=0;i<62;i++){const layer=i%3,x=((i*67.23+t*(9+layer*4))%(w+65))-35,y=((i*51.37+t*(62+layer*26))%(h+90))-45;
        c.strokeStyle=['#85acdc','#668bab','#bacce8'][layer];c.globalAlpha=(.13+layer*.07)*intensity;c.lineWidth=layer===2?1.3:.8;c.beginPath();c.moveTo(x,y);c.lineTo(x+4+layer*2,y+17+layer*7);c.stroke();
      }
      c.globalAlpha=.08;for(let i=0;i<8;i++){const phase=(t*.45+i*.37)%1;c.strokeStyle='#c8dce8';c.beginPath();c.ellipse((i*83)%w,h*.83+(i%3)*19,phase*25,phase*5,0,0,Math.PI*2);c.stroke();}
    }else if(mode==='fire'){
      this.glow(w*.5,h*1.05,h*.75,'#962a2a',.85);this.glow(w*.5,h*.95,w*.9,'#a85a28',.65);
      for(let j=0;j<9;j++){const x=w*(.08+j*.11),height=h*(.29+.10*Math.sin(t*1.1+j*2)+.10*(j%3)),sway=Math.sin(t*1.6+j)*w*.06;
        const g=c.createLinearGradient(0,h,0,h-height);g.addColorStop(0,j%2?'#f4b665':'#bd5438');g.addColorStop(.45,j%2?'#c4673d':'#943442');g.addColorStop(1,'#6c294000');c.fillStyle=g;c.globalAlpha=(.32+(j%2)*.18)*intensity;
        c.beginPath();c.moveTo(x-w*.15,h+4);c.bezierCurveTo(x-w*.1,h-height*.5,x+sway-w*.07,h-height*.8,x+sway,h-height);c.bezierCurveTo(x+sway+w*.07,h-height*.55,x+w*.13,h-height*.35,x+w*.15,h+4);c.fill();
      }
      for(let i=0;i<20;i++){const life=(t*.14+i*.113)%1;c.globalAlpha=(1-life)*.55*intensity;c.fillStyle=i%2?'#eeb779':'#da8167';const x=(i*81)%w+Math.sin(t+i)*9,y=h-life*h*.87;c.fillRect(x,y,i%3===0?2:1,2);}
    }else if(mode==='aurora'){
      this.glow(w*.72,h*.5,w,'#314b68',.65);
      for(let j=0;j<24;j++){const offset=j/24,base=w*(.15+.7*offset),sway=Math.sin(t*.27+offset*4)*w*.16;
        const g=c.createLinearGradient(0,h*.08,0,h);g.addColorStop(0,'#70cab300');g.addColorStop(.34,`rgba(${70+j*3},${155-j},${158+j*3},.25)`);g.addColorStop(.70,'#6975b038');g.addColorStop(1,'#24193800');
        c.strokeStyle=g;c.lineWidth=w*.033;c.globalAlpha=intensity;c.beginPath();c.moveTo(base+sway-w*.12,h*.08);c.bezierCurveTo(base+w*.6,h*.35,base-w*.65,h*.6,base+sway,h*1.1);c.stroke();
      }
      for(let i=0;i<20;i++){c.fillStyle='#d8e5ec';c.globalAlpha=.2+.13*Math.sin(t+i);c.fillRect((i*91)%w,18+(i*61)%(h*.45),1,1);}
    }else if(mode==='waves'){
      this.glow(w*.8,h*.3,w,'#235879',.75);
      for(let j=0;j<7;j++){c.beginPath();const y=h*(.35+j*.1);c.moveTo(-5,h+5);c.lineTo(-5,y);for(let x=0;x<=w+5;x+=5)c.lineTo(x,y+Math.sin(x/w*6+t*(.35+j*.04)+j*.7)*h*(.04+j*.003));c.lineTo(w+5,h+5);c.closePath();c.fillStyle=['#275977','#337086','#3b7e92','#254d70','#338398','#244860','#3c8292'][j];c.globalAlpha=(.14+j*.025)*intensity;c.fill();c.strokeStyle='#a3dfdb';c.globalAlpha=.12*intensity;c.lineWidth=1;c.stroke();}
    }else if(mode==='fireflies'){
      this.glow(w*.2,h*.4,w*.85,'#294435',.8);this.glow(w*.9,h*.8,w*.8,'#445538',.6);
      for(let i=0;i<28;i++){const x=w*(.07+((i*.171)% .88))+Math.sin(t*.25+i)*14,y=h*((i*.137)%1)+Math.cos(t*.4+i)*12;const a=(.3+.4*(.5+.5*Math.sin(t+i*.9)))*intensity;this.glow(x,y,i%4===0?14:8,'#d5d996',a*.25);c.globalAlpha=a;c.fillStyle='#e4dd9e';c.fillRect(x,y,2,2);}
    }else if(mode==='mist'){
      for(let j=0;j<6;j++)this.glow(w*(.15+j*.19)+Math.sin(t*.14+j)*w*.22,h*(.14+j*.14),w*.6,['#4b607e','#56657e','#6a627c'][j%3],.14*intensity);
    }else{
      this.glow(w*.8,h*.55,w*.9,'#6c2e57',.7);
      for(let i=0;i<17;i++){const x=w*((i*.173)%1)+Math.sin(t*.18+i)*12,y=h*((i*.143-t*.018+10)%1);this.glow(x,y,8+(i%4)*14,i%2?'#bc83b9':'#dc9fbc',(.10+.1*Math.sin(t*.25+i)**2)*intensity);}
    }
    c.globalAlpha=1;
    const shade=c.createLinearGradient(0,0,0,h);shade.addColorStop(0,'#00000020');shade.addColorStop(.7,'#00000000');shade.addColorStop(1,'#00000025');c.fillStyle=shade;c.fillRect(0,0,w,h);
  }
  frame=()=>{if(!this.active||document.hidden||this.still)return;this.time+=.045*(S.preferences.lavaSpeed/.55);this.draw();this.frameHandle=setTimeout(this.frame,45)};
  pause(){clearTimeout(this.frameHandle);this.frameHandle=null;}
  resume(){if(this.active&&!this.still&&!document.hidden&&!this.frameHandle)this.frameHandle=setTimeout(this.frame,45)}
  update(){this.still=!S.preferences.motion||matchMedia('(prefers-reduced-motion: reduce)').matches;this.pause();this.draw();this.resume();}
  destroy(){this.active=false;this.pause();this.observer.disconnect();document.removeEventListener('visibilitychange',this.visible);this.canvas.remove();}
}
