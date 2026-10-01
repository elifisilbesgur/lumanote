/* Four original multi-light liquid palettes. Original Nocturne shader unchanged. */
Object.assign(themes,{
 opal056:{name:'Opal Akışı',desc:'İnci · pembe · turkuaz',bg:'#10101d',accent:'#e9cce8',swatch:'#b294d4',gradient:'linear-gradient(135deg,#243352,#ae79b4,#77c5c1)',effect:'lava',luxury056:1,lava:[[.035,.039,.080],[.48,.30,.62],[.36,.76,.72],[.93,.66,.79]]},
 emerald056:{name:'Zümrüt Cam',desc:'Malakit · altın ışık',bg:'#071411',accent:'#b5e1c7',swatch:'#409e86',gradient:'linear-gradient(135deg,#082b29,#199779,#d3b778)',effect:'lava',luxury056:2,lava:[[.014,.045,.039],[.08,.49,.32],[.20,.76,.63],[.80,.67,.30]]},
 amber056:{name:'Kehribar Gece',desc:'Bakır · bal · siyah',bg:'#150e12',accent:'#f6cea0',swatch:'#c08d46',gradient:'linear-gradient(135deg,#27111d,#aa5433,#efd28a)',effect:'lava',luxury056:3,lava:[[.050,.023,.042],[.69,.25,.12],[.90,.58,.18],[.99,.83,.49]]},
 cosmos056:{name:'Kozmik İnci',desc:'Safir · ametist · gül',bg:'#0c0d1a',accent:'#c8c4fc',swatch:'#7269d2',gradient:'linear-gradient(135deg,#0c203c,#444fc0,#b16bba)',effect:'lava',luxury056:4,lava:[[.025,.029,.067],[.18,.26,.73],[.57,.29,.69],[.39,.68,.93]]}
});
const LUX_LAVA_FRAGMENT056=`precision mediump float;
varying vec2 v;uniform vec2 uSize;uniform float uTime;uniform float uLight;uniform float uVariant;uniform vec3 uBg;uniform vec3 uA;uniform vec3 uB;uniform vec3 uC;
void main(){
 float aspect=uSize.x/uSize.y;vec2 p=(v-.5)*vec2(aspect,1.)*2.;float t=uTime*.17;float f=0.;vec2 grad=vec2(0.);
 for(int i=0;i<9;i++){float k=float(i);vec2 c=vec2(sin(k*2.41+t*(.29+mod(k,2.)*.05))*aspect*.85,sin(k*1.7+t*(.36+mod(k,3.)*.07))*1.35);vec2 d=p-c;float r=.18+.085*(.5+.5*sin(k*3.2+uVariant));float den=dot(d,d)+.022;f+=r*r/den;grad-=2.*r*r*d/(den*den);}
 float wax=smoothstep(1.10,1.19,f);vec3 n=normalize(vec3(-grad*.22,1.3));
 vec3 l=normalize(vec3(-.6,.8,1.));float diffuse=.29+.71*max(0.,dot(n,l));
 float spec=pow(max(0.,dot(reflect(-l,n),vec3(0.,0.,1.))),35.);
 float rim=pow(1.-max(0.,n.z),2.);float stripe=.5+.5*sin(p.y*2.+p.x*1.5+t*.12);
 vec3 base=mix(uA,uB,stripe);base=mix(base,uC,.21+.19*sin(p.y*2.7-p.x+t*.09));
 vec3 back=uBg+uB*.06*exp(-length(p-vec2(.2,.4)));float edge=exp(-abs(f-1.15)*11.);
 vec3 liquid=base*diffuse+mix(uC,vec3(1.),.5)*spec*.55+uB*rim*.21+uC*edge*.20;
 vec3 col=mix(back,liquid,wax);col+=uC*exp(-abs(f-1.1)*4.5)*.025;
 float vig=1.-.35*smoothstep(.15,.85,length(v-.5));col*=vig*uLight;gl_FragColor=vec4(col,1.);
}`;
// Equivalent lit-field fallback when WebGL is unavailable. No static image swap.
const plainCanvasDraw056=CanvasLava.prototype.draw;
CanvasLava.prototype.draw=function(){const pref=S?.preferences||defaultPrefs,theme=themes[pref.theme];if(!theme?.luxury056)return plainCanvasDraw056.call(this);if(!this.active||!this.ctx)return;
 const w=this.canvas.width,h=this.canvas.height,data=this.image.data,aspect=w/h,cols=theme.lava,t=(22+this.time)*.17,blobs=[];
 for(let k=0;k<9;k++){const r=.18+.085*(.5+.5*Math.sin(k*3.2+theme.luxury056));blobs.push({x:Math.sin(k*2.41+t*(.29+(k%2)*.05))*aspect*.85,y:Math.sin(k*1.7+t*(.36+(k%3)*.07))*1.35,rr:r*r});}
 const len=Math.hypot(-.6,.8,1),lx=-.6/len,ly=.8/len,lz=1/len;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const vx=(x+.5)/w,vy=1-(y+.5)/h,px=(vx-.5)*aspect*2,py=(vy-.5)*2;let f=0,gx=0,gy=0;
  for(const b of blobs){const dx=px-b.x,dy=py-b.y,d=dx*dx+dy*dy+.022;f+=b.rr/d;const mul=-2*b.rr/(d*d);gx+=mul*dx;gy+=mul*dy;}
  let wax=clamp((f-1.1)/.09,0,1);wax=wax*wax*(3-2*wax);let nx=-gx*.22,ny=-gy*.22,nz=1.3,nl=Math.hypot(nx,ny,nz);nx/=nl;ny/=nl;nz/=nl;
  const dot=nx*lx+ny*ly+nz*lz,diff=.29+.71*Math.max(0,dot),spec=Math.pow(Math.max(0,-lz+2*dot*nz),35),rim=(1-Math.max(0,nz))**2,stripe=.5+.5*Math.sin(py*2+px*1.5+t*.12),blend=.21+.19*Math.sin(py*2.7-px+t*.09),edge=Math.exp(-Math.abs(f-1.15)*11),halo=Math.exp(-Math.abs(f-1.1)*4.5)*.025;let vig=clamp((Math.hypot(vx-.5,vy-.5)-.15)/.70,0,1);vig=1-.35*vig*vig*(3-2*vig);
  const idx=(y*w+x)*4;for(let ch=0;ch<3;ch++){const base=(cols[1][ch]*(1-stripe)+cols[2][ch]*stripe)*(1-blend)+cols[3][ch]*blend,back=cols[0][ch]+cols[2][ch]*.06*Math.exp(-Math.hypot(px-.2,py-.4)),liquid=base*diff+(cols[3][ch]+1)*.5*spec*.55+cols[2][ch]*rim*.21+cols[3][ch]*edge*.20;data[idx+ch]=clamp(Math.round(((1-wax)*back+wax*liquid+cols[3][ch]*halo)*vig*(pref.lavaLight+.25)*255),0,255);}data[idx+3]=255;
 }this.ctx.putImageData(this.image,0,0);
};
