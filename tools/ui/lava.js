/* Analytic, lit 2D metaball field. Shapes merge continuously; this is not a video.
   Resolution is capped and rendering stops while hidden. No external assets. */
let currentLava=null;
const LAVA_VERTEX='attribute vec2 a; varying vec2 v; void main(){v=a*.5+.5; gl_Position=vec4(a,0.,1.);}';
const LAVA_FRAGMENT=`precision mediump float;
varying vec2 v; uniform vec2 uSize; uniform float uTime; uniform float uLight;
uniform vec3 uBg; uniform vec3 uA; uniform vec3 uB;
void main(){
 float aspect=uSize.x/uSize.y; vec2 p=(v-.5)*vec2(aspect,1.)*2.;
 float f=0.; vec2 grad=vec2(0.); float time=uTime*.22;
 for(int i=0;i<8;i++){
  float k=float(i); vec2 c=vec2(sin(k*2.73+time*.41)*aspect*.80, sin(k*1.87+time*(.45+mod(k,3.)*.08))*1.28);
  vec2 d=(p-c)*vec2(1.,.80+.12*sin(k));
  float r=.20+.09*(.5+.5*sin(k*2.33)); float den=dot(d,d)+.014;
  f+=r*r/den; grad+=(-2.*r*r*d/(den*den))*vec2(1.,.80+.12*sin(k));
 }
 float wax=smoothstep(1.25,1.32,f);
 vec3 n=normalize(vec3(-grad*.14,1.5));
 vec3 light=normalize(vec3(-.7,.85,1.));
 float diffuse=.32+.68*max(0.,dot(n,light));
 float spec=pow(max(0.,dot(reflect(-light,n),vec3(.0,.0,1.))),22.);
 float pearlescent=pow(max(0.,dot(n,normalize(vec3(.55,.1,.3)))),5.);
 float edge=exp(-abs(f-1.31)*9.5);
 float blend=clamp(.5+.4*sin(p.y*1.5-p.x*1.8+time*.08),0.,1.);
 vec3 base=mix(uA,uB,blend);
 vec3 bg=uBg+(uA*.11+uB*.08)*exp(-length(p-vec2(.0,.2))*1.0);
 vec3 waxColor=base*diffuse*.91+mix(uB,vec3(.79,.63,.84),.22)*spec*.39+uB*pearlescent*.10;
 waxColor+=mix(uA,uB,.60)*edge*.38;
 vec3 col=mix(bg,waxColor,wax);
 col+=uA*exp(-abs(f-1.25)*5.)*.04;
 float vignette=smoothstep(1.65,.30,length((v-.5)*vec2(1.1,1.0)));
 col*=mix(.6,1.,vignette)*uLight;
 gl_FragColor=vec4(col,1.);
}`;
class Lava{
 constructor(host){this.host=host;this.alive=true;this.time=0;this.last=0;this.lastFrame=0;this.canvas=document.createElement('canvas');this.canvas.setAttribute('aria-hidden','true');host.append(this.canvas);try{this.gl=this.canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power',preserveDrawingBuffer:false});if(!this.gl)throw new Error('WebGL unavailable');const gl=this.gl;const compile=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){const m=gl.getShaderInfoLog(s);gl.deleteShader(s);throw new Error(m)}return s};this.vert=compile(gl.VERTEX_SHADER,LAVA_VERTEX);this.frag=compile(gl.FRAGMENT_SHADER,themes[S.preferences.theme]?.luxury056?LUX_LAVA_FRAGMENT056:LAVA_FRAGMENT);this.program=gl.createProgram();gl.attachShader(this.program,this.vert);gl.attachShader(this.program,this.frag);gl.linkProgram(this.program);if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw new Error('Shader linking failed');gl.useProgram(this.program);this.buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const a=gl.getAttribLocation(this.program,'a');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);this.uniforms={};for(const name of ['uSize','uTime','uLight','uBg','uA','uB','uC','uVariant'])this.uniforms[name]=gl.getUniformLocation(this.program,name);this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(host);this.visibility=()=>{if(document.hidden)this.pause();else this.resume()};document.addEventListener('visibilitychange',this.visibility);this.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();if(!this.alive)return;this.pause();this.fallback()},{once:true});this.resize();this.update();this.resume()}catch(e){console.warn('Lava fallback:',e.message);this.fallback()}}
 resize(){if(!this.gl||!this.alive)return;const r=this.host.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1);this.canvas.width=Math.max(1,Math.round(r.width*dpr));this.canvas.height=Math.max(1,Math.round(r.height*dpr));this.gl.viewport(0,0,this.canvas.width,this.canvas.height);this.draw()}
 update(){this.fallbackRenderer?.update();this.still=!S?.preferences.motion||matchMedia('(prefers-reduced-motion: reduce)').matches;this.draw();this.resume()}
 draw(){if(!this.gl||!this.program||!this.alive)return;const gl=this.gl,pref=S?.preferences||defaultPrefs,colors=(themes[pref.theme||'nocturne'].lava||themes.nocturne.lava);gl.useProgram(this.program);gl.uniform2f(this.uniforms.uSize,this.canvas.width,this.canvas.height);gl.uniform1f(this.uniforms.uTime,22+this.time);gl.uniform1f(this.uniforms.uLight,pref.lavaLight+.25);gl.uniform3fv(this.uniforms.uBg,colors[0]);gl.uniform3fv(this.uniforms.uA,colors[1]);gl.uniform3fv(this.uniforms.uB,colors[2]);gl.uniform3fv(this.uniforms.uC,colors[3]||colors[2]);gl.uniform1f(this.uniforms.uVariant,themes[pref.theme]?.luxury056||0);gl.drawArrays(gl.TRIANGLES,0,6)}
 frame=(now)=>{if(!this.alive||document.hidden||this.still){this.frameId=null;return}if(!this.last)this.last=now;this.time+=Math.min((now-this.last)/1000,.15)*(S.preferences.lavaSpeed||.55);this.last=now;if(now-this.lastFrame>40){this.draw();this.lastFrame=now}this.frameId=requestAnimationFrame(this.frame)};
 pause(){this.fallbackRenderer?.pause();cancelAnimationFrame(this.frameId);this.frameId=null;this.last=0}
 resume(){this.fallbackRenderer?.resume();if(this.alive&&this.gl&&!this.frameId&&!document.hidden&&!this.still)this.frameId=requestAnimationFrame(this.frame)}
 fallback(){this.pause();this.canvas.style.display='none';if(!this.fallbackRenderer)this.fallbackRenderer=new CanvasLava(this.host)}
 destroy(){this.alive=false;this.pause();this.fallbackRenderer?.destroy();this.resizeObserver?.disconnect();document.removeEventListener('visibilitychange',this.visibility);if(this.gl){this.gl.deleteBuffer(this.buffer);this.gl.deleteProgram(this.program);this.gl.deleteShader(this.vert);this.gl.deleteShader(this.frag);this.gl.getExtension('WEBGL_lose_context')?.loseContext()}this.host.innerHTML=''}
}
/* Canvas fallback for devices without WebGL. It uses the same field and lighting,
   at a deliberately small internal resolution and 10 fps, then smooth upscaling. */
class CanvasLava {
 constructor(host){this.host=host;this.time=0;this.last=0;this.active=true;this.canvas=document.createElement('canvas');this.canvas.setAttribute('aria-hidden','true');host.appendChild(this.canvas);this.ctx=this.canvas.getContext('2d',{alpha:false});this.resize=()=>{const r=host.getBoundingClientRect();this.aspect=Math.max(.2,r.width/Math.max(1,r.height));this.canvas.width=Math.min(112,Math.max(72,Math.round(r.width*.3)));this.canvas.height=Math.min(224,Math.max(70,Math.round(this.canvas.width/this.aspect)));this.image=this.ctx.createImageData(this.canvas.width,this.canvas.height);this.draw()};this.observer=new ResizeObserver(this.resize);this.observer.observe(host);this.visibility=()=>document.hidden?this.pause():this.resume();document.addEventListener('visibilitychange',this.visibility);this.resize();this.update()}
 draw(){if(!this.active||!this.ctx)return;const w=this.canvas.width,h=this.canvas.height,d=this.image.data,pref=S?.preferences||defaultPrefs,cols=(themes[pref.theme||'nocturne'].lava||themes.nocturne.lava),bg=cols[0],a=cols[1],b=cols[2],time=(22+this.time)*.22,blobs=[];for(let k=0;k<8;k++){const r=.20+.09*(.5+.5*Math.sin(k*2.33));blobs.push({x:Math.sin(k*2.73+time*.41)*this.aspect*.80,y:Math.sin(k*1.87+time*(.45+(k%3)*.08))*1.28,ys:.8+.12*Math.sin(k),rr:r*r})}const ln=Math.hypot(-.7,.85,1),lx=-.7/ln,ly=.85/ln,lz=1/ln;for(let y=0;y<h;y++){const vy=1-(y+.5)/h,py=(vy-.5)*2;for(let x=0;x<w;x++){const vx=(x+.5)/w,px=(vx-.5)*this.aspect*2;let f=0,gx=0,gy=0;for(const k of blobs){const dx=px-k.x,dy=(py-k.y)*k.ys,den=dx*dx+dy*dy+.014;f+=k.rr/den;const mul=-2*k.rr/(den*den);gx+=mul*dx;gy+=mul*dy*k.ys}const wax=clamp((f-1.25)/.07,0,1);const mask=wax*wax*(3-2*wax);let nx=-gx*.14,ny=-gy*.14,nz=1.5;const length=Math.hypot(nx,ny,nz);nx/=length;ny/=length;nz/=length;const dot=nx*lx+ny*ly+nz*lz,diff=.32+.68*Math.max(0,dot),spec=Math.pow(Math.max(0,-lz+2*dot*nz),22),edge=Math.exp(-Math.abs(f-1.31)*9.5),blend=clamp(.5+.4*Math.sin(py*1.5-px*1.8+time*.08),0,1),halo=Math.exp(-Math.hypot(px,py-.2)),vignette=.95;const idx=(y*w+x)*4;for(let ch=0;ch<3;ch++){const base=a[ch]*(1-blend)+b[ch]*blend;const back=bg[ch]+(a[ch]*.11+b[ch]*.08)*halo;const waxCol=base*diff*.91+(b[ch]*.78+[.79,.63,.84][ch]*.22)*spec*.39+(a[ch]*.4+b[ch]*.6)*edge*.38;const value=(back*(1-mask)+waxCol*mask+a[ch]*Math.exp(-Math.abs(f-1.25)*5)*.04)*(pref.lavaLight+.25)*vignette;d[idx+ch]=Math.min(255,Math.max(0,Math.round(value*255)))}d[idx+3]=255}}this.ctx.putImageData(this.image,0,0)}
 frame=()=>{if(!this.active||document.hidden||this.still)return;this.time+=.10*(S.preferences.lavaSpeed||.55);this.draw();this.id=setTimeout(this.frame,100)};
 update(){this.still=!S.preferences.motion||matchMedia('(prefers-reduced-motion: reduce)').matches;this.draw();this.pause();this.resume()}
 pause(){clearTimeout(this.id);this.id=null}
 resume(){if(this.active&&!this.still&&!document.hidden&&!this.id)this.id=setTimeout(this.frame,100)}
 destroy(){this.active=false;this.pause();this.observer.disconnect();document.removeEventListener('visibilitychange',this.visibility);this.canvas.remove()}
}
