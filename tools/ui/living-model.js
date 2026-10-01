/* Living Garden 0.5. All migration is local; old balances and notebooks survive.
   No remote account, tracking, random loot or real-money economy. */
const LIVING_BUILD = 'LUMA-0.5.7-HOME-GREENHOUSE';
const safeKey = s => typeof s === 'string' && s.length < 180 && !['__proto__','constructor','prototype'].includes(s);
const cleanMap = o => Object.fromEntries(Object.entries(o && typeof o==='object'?o:{}).filter(([k])=>safeKey(k)));
Object.assign(themes, {garden:{...themes.forest,name:'Bahçem',desc:'Kendi yaşayan dünyan',effect:'garden',accent:'#d6ddae',swatch:'#7f9e65'}});
Object.assign(SEEDS, {
  daisy:{name:'Papatya',minutes:35,sprite:'flower'}, strawberry:{name:'Çilek',minutes:65,sprite:'berry'},
  bluebell:{name:'Çan çiçeği',minutes:80,sprite:'lavender'}, pumpkin:{name:'Balkabağı',minutes:110,sprite:'pumpkin'},
  rose:{name:'Gül',minutes:150,sprite:'tulip'}, moonflower:{name:'Ay çiçeği',minutes:180,sprite:'flower'}
});
Object.assign(DECOR, {bench:{name:'Bahçe bankı',price:85},birdhouse:{name:'Kuş evi',price:110},beehive:{name:'Arı kovanı',price:140},
  campfire:{name:'Kamp ateşi',price:180},catbed:{name:'Yumuşak minder',price:70},fence:{name:'Ahşap çit',price:35},
  flowers:{name:'Çiçek arabası',price:130},picnic:{name:'Piknik örtüsü',price:100}});
Object.assign(defaultPrefs,{timerStyle:'simple',method:'pomodoro',longBreakMinutes:20,rounds:4,autoBreak:false,autoFocus:false,finishSound:true,flowAutoRest:true});
defaultPrefs.volumes.piano=0;
const STUDY_METHODS={
 pomodoro:{name:'Pomodoro',work:25,rest:5,long:20,rounds:4,icon:'focus',tip:'Tek işe 25 dakika ayır. Dört turdan sonra daha uzun dinlen.'},
 rule5217:{name:'52 / 17',work:52,rest:17,long:17,rounds:1,icon:'clock',tip:'Uzun bir odak bloğunu daha geniş bir molayla eşleştir.'},
 timebox:{name:'Zaman kutusu',work:45,rest:10,long:10,rounds:1,icon:'calendar',tip:'Bir sonuç seç, ona bir zaman sınırı ayır. 45/10 başlangıç önerisidir.'},
 flow:{name:'Flowtime',work:0,rest:10,long:10,rounds:1,icon:'ocean',tip:'Kronometre ileri sayar. Hazır olduğunda kaydet; süreye göre mola önerilir.'},
 frog:{name:'Önce zor iş',work:45,rest:10,long:10,rounds:1,icon:'flag',tip:'En önemli zor işi önce seç. 45/10 LumaNote başlangıç ayarıdır.'},
 deep90:{name:'90 dakika',work:90,rest:20,long:20,rounds:1,icon:'moon',tip:'Uzun odak seçeneği. Herkes için zorunlu bir biyolojik ritim değildir.'},
 custom:{name:'Kendi ritmim',work:50,rest:10,long:20,rounds:4,icon:'sliders',tip:'Süreleri ve tur sayısını sana göre ayarla.'}
};
function newLiving(state,raw){
 const total=worldSeconds(state.world),v=raw&&raw.version===1?raw:{};
 const baseSeconds=Number.isFinite(v.baseSeconds)?clamp(v.baseSeconds,0,total):total;
 const placement={};
 for(const [key,p] of Object.entries(cleanMap(v.placement)))if(p&&typeof p==='object')placement[key]={x:clamp(p.x,30,450),y:clamp(p.y,88,292),room:!!p.room};
 return {version:1,baseSeconds,baseCoins:Number.isFinite(v.baseCoins)?Math.floor(clamp(v.baseCoins,0,10000000)):Math.floor(total/60),
  weather:['auto','clear','rain','snow'].includes(v.weather)?v.weather:'auto',time:['auto','day','dusk','night'].includes(v.time)?v.time:'auto',
  placement,ground:(Array.isArray(v.ground)?v.ground:[]).filter(t=>t&&Number.isInteger(t.x)&&Number.isInteger(t.y)&&t.x>=2&&t.x<28&&t.y>=6&&t.y<18&&['stone','wood','flower','erase'].includes(t.kind)).slice(-500),
  pendingWater:(Array.isArray(v.pendingWater)?v.pendingWater:[]).filter(safeKey).slice(0,3),
  album:[...new Set((Array.isArray(v.album)?v.album:[]).filter(k=>SEEDS[k]))],
  growthSeen:Object.fromEntries(Object.entries(cleanMap(v.growthSeen)).map(([k,n])=>[k,Math.floor(clamp(n,0,3))])),
  watering:Object.fromEntries(Object.entries(cleanMap(v.watering)).map(([k,n])=>[k,clamp(n,0,Date.now()+60000)])),
  bonds:Object.fromEntries(Object.entries(cleanMap(v.bonds)).filter(([k])=>PETS[k]).map(([k,n])=>[k,clamp(n,0,1e9)])),
  memorials:(Array.isArray(v.memorials)?v.memorials:[]).filter(m=>m&&typeof m.id==='string').slice(0,20).map(m=>({id:m.id,name:String(m.name||'Bir anı').slice(0,60),kind:['tree','flower','tulip','lavender'].includes(m.kind)?m.kind:'tree',hidden:!!m.hidden,createdAt:typeof m.createdAt==='string'?m.createdAt:null})),
  homeStyle:['wood','blue','rose'].includes(v.homeStyle)?v.homeStyle:'wood'};
}
const normalize04=normalize;
normalize=function(raw){
 if(!raw||Number(raw.schema)>3)throw new Error('Bu yedek daha yeni bir sürüm gerektiriyor. Kayıtların değiştirilmedi.');
 const s=normalize04({...raw,schema:Math.min(2,Number(raw.schema)||1)});
 s.schema=3;s.living=newLiving(s,raw.living);
 s.practice={cycle:Math.floor(clamp(raw.practice?.cycle,0,99999)),pending:raw.practice?.pending&&['break','focus'].includes(raw.practice.pending.phase)?{phase:raw.practice.pending.phase,minutes:clamp(raw.practice.pending.minutes,1,720)}:null};
 s.preferences.method=STUDY_METHODS[s.preferences.method]?s.preferences.method:'custom';
 s.preferences.longBreakMinutes=clamp(s.preferences.longBreakMinutes||20,1,120);
 s.preferences.breakMinutes=clamp(s.preferences.breakMinutes||5,1,120);
 s.preferences.rounds=Math.floor(clamp(s.preferences.rounds||4,1,12));
 s.preferences.timerStyle=['simple','pixel','flip'].includes(s.preferences.timerStyle)?s.preferences.timerStyle:'simple';
 s.notes=s.notes.map(n=>({...n,paper:normalizePaper(n.paper),ink:normalizeInk(n.ink),pdfInk:normalizePdfInk(n.pdfInk)}));
 return s;
};
const fresh04=fresh;
fresh=function(){const s=fresh04();s.schema=3;s.living=newLiving(s,null);s.practice={cycle:0,pending:null};s.preferences.focusMinutes=25;s.preferences.breakMinutes=5;s.preferences.method='pomodoro';return s;};
wallet=function(w=S.world){
 const l=(typeof S!=='undefined'&&S&&w===S.world)?S.living:null,total=worldSeconds(w);
 const earned=l?l.baseCoins+Math.floor(Math.max(0,total-l.baseSeconds)/20):Math.floor(total/60);
 return Math.max(0,earned-w.purchases.reduce((sum,p)=>sum+p.cost,0));
};
function normalizePaper(p){return {kind:['dark','plain','grid','ruled','dots','image'].includes(p?.kind)?p.kind:'dark',imageId:typeof p?.imageId==='string'?p.imageId:null,opacity:clamp(p?.opacity??.24,.05,1)};}
function normalizeInk(raw){return (Array.isArray(raw)?raw:[]).slice(0,2000).filter(s=>s&&Array.isArray(s.points)).map(s=>({id:s.id||uid(),color:/^#[a-f0-9]{6}$/i.test(s.color)?s.color:'#6652a2',width:clamp(s.width||3,1,24),tool:s.tool==='highlight'?'highlight':'pen',points:s.points.slice(0,10000).filter(p=>Array.isArray(p)&&p.length>=2&&Number.isFinite(p[0])&&Number.isFinite(p[1])).map(p=>[clamp(p[0],0,1),clamp(p[1],0,1)])}));}
function growthStage(p){return p?Math.min(3,Math.floor(plantProgress(p)*3)):0;}
function queueGrowth(){for(const p of S.world.plots){if(!p)continue;const stage=growthStage(p),seen=S.living.growthSeen[p.id]??0;if(stage>seen){S.living.growthSeen[p.id]=stage;S.living.watering[p.id]=Date.now();S.living.pendingWater=[...new Set([...(S.living.pendingWater||[]),p.id])];}}}
function plantMilestone(p){return p?Math.max(0,Math.ceil((SEEDS[p.kind].minutes*60-(worldSeconds()-p.atSeconds))/60)):0;}
const harvest04=harvestPlant;
harvestPlant=async function(index){const p=S.world.plots[index];if(!p||plantProgress(p)<1)return;const id=p.id,kind=p.kind;await harvest04(index);if(!S.living.album.includes(kind))S.living.album.push(kind);UI.gardenEdit=true;UI.selectedLiving='plant:'+id;S.living.placement['plant:'+id]={x:265,y:242,room:false};await persist(true);render();toast('Bitkini sürükleyip bahçene yerleştir. Saksın yeniden boş.');};

function normalizePdfInk(raw){const result={};for(const [fileId,pages] of Object.entries(cleanMap(raw)).slice(0,100)){const out={};for(const [num,p] of Object.entries(cleanMap(pages)).filter(([k])=>/^[1-9][0-9]{0,2}$/.test(k)&&Number(k)<=200)){if(!p||typeof p!=="object")continue;out[num]={strokes:normalizeInk(p.strokes),texts:(Array.isArray(p.texts)?p.texts:[]).slice(0,100).filter(t=>t&&typeof t.text==='string').map(t=>({id:safeKey(t.id)?t.id:uid(),text:t.text.slice(0,2000),x:clamp(t.x,0,1),y:clamp(t.y,0,1),color:/^#[a-f0-9]{6}$/i.test(t.color)?t.color:'#624590'}))};}result[fileId]=out;}return result;}
