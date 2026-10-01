/* v0.4 — offline progression. Balances derive from unique focus-session credits and
   purchases. No rewards for breaks, no daily penalties, no real-money purchases. */
const PETS = {
  bunny: {name:'Tavşan',price:0,color:'#dcd1ef'},
  cat: {name:'Kedi',price:60,color:'#f3bc75'},
  frog: {name:'Kurbağa',price:90,color:'#a1c87b'},
  duck: {name:'Ördek',price:120,color:'#f2d17e'},
  dog: {name:'Köpek',price:160,color:'#c79878'},
  bee: {name:'Arı',price:180,color:'#f0bf65'},
  turtle: {name:'Kaplumbağa',price:200,color:'#7db698'},
  sheep: {name:'Koyun',price:240,color:'#e8e1d2'},
  fox: {name:'Tilki',price:300,color:'#e6a073'},
  parrot: {name:'Papağan',price:320,color:'#86c7ba'},
  owl: {name:'Baykuş',price:360,color:'#c6a0d1'},
  penguin: {name:'Penguen',price:420,color:'#93b6d6'},
  squirrel: {name:'Sincap',price:460,color:'#b8836c'},
  panda: {name:'Panda',price:540,color:'#d7e3df'},
  deer: {name:'Geyik',price:620,color:'#dbb98d'},
  capybara: {name:'Kapibara',price:750,color:'#c69b77'}
};
// Older editions offered these companions for free; keep saved selections,
// without adding them to the new 16-animal shop.
Object.defineProperties(PETS,{
  cloud:{value:{name:'Bulut',price:0,legacy:true},enumerable:false},
  star:{value:{name:'Yıldız',price:0,legacy:true},enumerable:false}
});
const SCENERIES = {
  night:{name:'Ay Bahçesi',minutes:0,sky:'#17152d',far:'#282541',hill:'#434760',grass:'#6d817e',earth:'#343441',light:'#ddd0ef'},
  meadow:{name:'Günışığı Çayırı',minutes:120,sky:'#b5d5d2',far:'#8199ba',hill:'#779c86',grass:'#a8c08a',earth:'#6a7461',light:'#f6e7ad'},
  pond:{name:'Yağmur Göleti',minutes:300,sky:'#253b55',far:'#344c6a',hill:'#426b6b',grass:'#70a09a',earth:'#304e57',light:'#c1e4ea'},
  autumn:{name:'Sonbahar Korusu',minutes:600,sky:'#4b3548',far:'#68465c',hill:'#a06c67',grass:'#d0a07b',earth:'#704957',light:'#f1d29a'},
  snow:{name:'Kar Vadisi',minutes:1200,sky:'#1c294c',far:'#35456a',hill:'#91a9c3',grass:'#d6e3ee',earth:'#677b9a',light:'#e1e7f6'},
  cosmic:{name:'Yıldız Adası',minutes:2400,sky:'#161330',far:'#3d2862',hill:'#6e508c',grass:'#b99bbd',earth:'#4d365f',light:'#e9c4f4'}
};
const DECOR = {
  lantern:{name:'Fener',price:35}, stool:{name:'Ahşap tabure',price:50},
  mushroom:{name:'Mantar kümesi',price:65}, fountain:{name:'Minik havuz',price:100},
  tent:{name:'Kamp çadırı',price:140}, potLilac:{name:'Lavanta saksı',price:45},potMint:{name:'Nane saksı',price:45}
};
const SEEDS = {
  sunflower:{name:'Ayçiçeği',minutes:25,sprite:'flower'},
  tulip:{name:'Lale',minutes:50,sprite:'tulip'},
  lavender:{name:'Lavanta',minutes:90,sprite:'lavender'},
  tree:{name:'Küçük ağaç',minutes:120,sprite:'tree'}
};
function creditSeconds(session){
  if(!session || session.phase==='break')return 0;
  const raw=Number.isFinite(Number(session.completedSeconds))?Number(session.completedSeconds):Number(session.completedMinutes)*60;
  return Math.floor(clamp(raw,0,86400));
}
function makeWorld(state){
  const previous=state.preferences?.companion;
  return {version:1,credits:{},purchases:[],legacyPets:[...new Set(['bunny',...(PETS[previous]?[previous]:[])])],
    background:'night',plots:[null,null,null],harvested:[],layout:[],pot:'clay',petNames:{}};
}
function syncWorld(state){
  const w=state.world;
  const validIds=new Set();
  for(const session of state.focusHistory){
    if(validIds.has(session.id))continue;
    validIds.add(session.id);
    const seconds=creditSeconds(session);
    if(seconds>0 && !Object.prototype.hasOwnProperty.call(w.credits,session.id))w.credits[session.id]=seconds;
  }
  return w;
}
function normalizeWorld(raw,state){
  const w=makeWorld(state);
  if(raw && raw.version===1){
    w.credits=Object.fromEntries(Object.entries(raw.credits||{}).filter(([id,v])=>typeof id==='string'&&id.length<180&&Number.isFinite(Number(v))).map(([id,v])=>[id,Math.floor(clamp(v,0,86400))]));
    const seen=new Set();
    w.purchases=(Array.isArray(raw.purchases)?raw.purchases:[]).filter(p=>{
      const item=p?.type==='pet'?PETS[p.item]:p?.type==='decor'?DECOR[p.item]:null;
      const key=p?.type+':'+p?.item;
      if(!item||seen.has(key))return false;seen.add(key);return true;
    }).map(p=>({...p,id:String(p.id||uid()),cost:Math.floor(clamp(p.cost,0,100000))}));
    w.legacyPets=[...new Set(['bunny',...(Array.isArray(raw.legacyPets)?raw.legacyPets:[]).filter(p=>PETS[p])])];
    w.background=SCENERIES[raw.background]?raw.background:'night';
    w.plots=Array.from({length:3},(_,i)=>{
      const p=raw.plots?.[i];return p&&SEEDS[p.kind]?{id:String(p.id||uid()),kind:p.kind,atSeconds:Math.max(0,Number(p.atSeconds)||0),watered:!!p.watered}:null;
    });
    w.harvested=(Array.isArray(raw.harvested)?raw.harvested:[]).filter(p=>p&&typeof p.id==='string'&&SEEDS[p.kind]).map(p=>({...p}));
    const layoutIds=new Set();
    w.layout=(Array.isArray(raw.layout)?raw.layout:[]).filter(p=>{
      if(!p||typeof p.id!=='string'||layoutIds.has(p.id)||!['pet','plant','decor'].includes(p.type))return false;
      layoutIds.add(p.id);return true;
    }).slice(0,180).map(p=>({...p,x:clamp(p.x,6,94),y:clamp(p.y,59,88)}));
    w.pot=['clay','potLilac','potMint'].includes(raw.pot)?raw.pot:'clay';
    w.petNames=Object.fromEntries(Object.entries(raw.petNames||{}).filter(([k,v])=>PETS[k]&&typeof v==='string').map(([k,v])=>[k,v.slice(0,22)]));
  }
  state.world=w;syncWorld(state);
  if(!raw){
    w.legacyPets=[...new Set([...w.legacyPets,'bunny','cat','frog'])];
    w.harvested=state.focusHistory.filter(s=>s.completed&&s.phase!=='break').map(s=>({id:'legacy:'+s.id,kind:s.plannedMinutes>=120?'tree':s.plannedMinutes>=50?'tulip':'sunflower',at:s.endedAt}));
    w.layout=w.harvested.slice(0,5).map((p,i)=>({id:'plant:'+p.id,type:'plant',item:p.id,x:17+i*16,y:80+(i%2)*4}));
  }
  if(worldSeconds(w)/60<SCENERIES[w.background].minutes)w.background='night';
  const owned=ownedPets(w);
  if(!owned.includes(state.preferences.companion))state.preferences.companion='bunny';
  w.layout=w.layout.filter(p=>p.type==='pet'?owned.includes(p.item):p.type==='plant'?w.harvested.some(x=>x.id===p.item):owns('decor',p.item,w));
  return w;
}
function fresh(){const state=freshBase();state.schema=2;state.weeklyGoals={};state.backupInfo=null;state.preferences.showCompanion=true;state.world=makeWorld(state);return state;}
function normalize(raw){
  if(!raw||typeof raw!=='object'||Number(raw.schema)>2)throw new Error('Bu veri sürümü açılamıyor. Mevcut kayıtların değiştirilmedi.');
  const state=normalizeBase(raw);
  state.schema=2;
  state.focusHistory=[...new Map(state.focusHistory.map(s=>[s.id,s])).values()];
  state.weeklyGoals=Object.fromEntries(Object.entries(raw.weeklyGoals||{}).filter(([k,v])=>/^\d{4}-\d{2}-\d{2}$/.test(k)&&v&&typeof v==='object').map(([k,v])=>[k,{minutes:Math.round(clamp(v.minutes,0,6000)),intention:String(v.intention||'').slice(0,200),reflection:String(v.reflection||'').slice(0,1500)}]));
  state.backupInfo=raw.backupInfo&&typeof raw.backupInfo==='object'?raw.backupInfo:null;
  state.preferences.showCompanion=raw.preferences?.showCompanion!==false;
  state.world=normalizeWorld(raw.world,state);
  if(state.timer)state.timer=normalizeTimer(state.timer);
  return state;
}
function worldSeconds(w=S.world){return Object.values(w.credits).reduce((sum,v)=>sum+Number(v),0)}
function wallet(w=S.world){return Math.max(0,Math.floor(worldSeconds(w)/60)-w.purchases.reduce((sum,p)=>sum+p.cost,0))}
function ownedPets(w=S.world){return [...new Set([...w.legacyPets,...w.purchases.filter(p=>p.type==='pet').map(p=>p.item)])]}
function owns(type,item,w=S.world){return type==='pet'?ownedPets(w).includes(item):w.purchases.some(p=>p.type===type&&p.item===item)}
function petLabel(id=S.preferences.companion){return S.world.petNames[id]||PETS[id]?.name||petNames[id]||'Yol arkadaşım'}
function coinIcon(size=16){return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" class="coin-icon" aria-hidden="true" shape-rendering="crispEdges"><path fill="#d9b77c" d="M4 1h8v2h2v2h1v6h-1v2h-2v2H4v-2H2v-2H1V5h1V3h2z"/><path fill="#f7dfa6" d="M4 3h8v2H4zM3 5h2v6H3z"/><path fill="#926641" d="M7 5h2v6H7z"/></svg>`}
function plantProgress(plot,w=S.world){if(!plot)return 0;return clamp((worldSeconds(w)-plot.atSeconds)/(SEEDS[plot.kind].minutes*60),0,1)}
function activePlantSprite(plot){const progress=plantProgress(plot);return progress<.25?'seed':progress<.65?'sprout':progress<1?'bud':SEEDS[plot.kind].sprite}
let worldBuying=false;
async function buyItem(type,item){
  if(worldBuying)return;const product=type==='pet'?PETS[item]:DECOR[item];if(!product)return;
  if(owns(type,item)){if(type==='pet')await selectPet(item);return;}
  if(wallet()<product.price){toast(`${product.price-wallet()} jeton daha · çalıştıkça birikir.`);return;}
  worldBuying=true;
  try{
    // Optimistic mutation is persisted before changing screens; roll back on a save error.
    const previous=JSON.parse(JSON.stringify(S.world));
    S.world.purchases.push({id:uid(),type,item,cost:product.price,at:new Date().toISOString()});
    try{await persist(true)}catch(e){S.world=previous;throw e}
    if(type==='pet'){S.preferences.companion=item;await persist(true);}
    render();toast(`${product.name} senin!`);
  }finally{worldBuying=false;}
}
async function selectPet(id){if(!owns('pet',id)){UI.shopTab='pets';route('shop');return;}S.preferences.companion=id;await persist(true);closeSheet();if(UI.editorId){$('#editor-pet')?.replaceChildren();const b=$('#editor-pet');if(b)b.innerHTML=pixel(id,28);}else render();toast(`${petLabel(id)} yanında.`)}
async function plantSeed(index,kind){const slot=Number(index);if(!Number.isInteger(slot)||slot<0||slot>=3||!SEEDS[kind]||S.world.plots[slot])return;S.world.plots[slot]={id:uid(),kind,atSeconds:worldSeconds(),watered:false};await persist(true);closeSheet();render();toast('Tohum ekildi. Odaklandıkça büyüyecek.');}
async function harvestPlant(index){const p=S.world.plots[index];if(!p||plantProgress(p)<1)return;const id=p.id;if(!S.world.harvested.some(h=>h.id===id)){
  S.world.harvested.push({id,kind:p.kind,at:new Date().toISOString()});
  if(S.world.layout.length<180)S.world.layout.push({id:'plant:'+id,type:'plant',item:id,x:22+((S.world.harvested.length*17)%60),y:77+(S.world.harvested.length%3)*3});
}S.world.plots[index]=null;await persist(true);closeSheet();render();toast('Bitkin bahçeye taşındı. Saksın yeni bir tohuma hazır.');}
function seedSheet(index){const p=S.world.plots[index];if(p){const progress=plantProgress(p);sheet(SEEDS[p.kind].name,`<div class="plant-inspect">${pixel(activePlantSprite(p),112)}<strong>${Math.round(progress*100)}%</strong><div class="growth-track"><i style="width:${progress*100}%"></i></div><p>${progress>=1?'Bahçeye taşınmaya hazır.':`${Math.ceil(SEEDS[p.kind].minutes*(1-progress))} dk odak kaldı.`}</p></div>${progress>=1?`<button class="btn primary full" data-action="harvest" data-slot="${index}">Bahçeye taşı</button>`:`<button class="btn ghost full" data-action="water" data-slot="${index}" ${p.watered?'disabled':''}>${p.watered?'Sulandı · odaklandıkça büyür':'Sula'}</button><p class="hint" style="text-align:center;margin-top:12px">Sulama dekoratiftir. Bitkin çalıştığın süreyle büyür; solmaz.</p>`}`,'seed');return;}
 sheet('Bir tohum seç',`<div class="seed-grid">${Object.entries(SEEDS).map(([key,s])=>`<button class="seed-card" data-action="plant-seed" data-slot="${index}" data-kind="${key}">${pixel(s.sprite,70)}<strong>${s.name}</strong><span>${s.minutes} dk</span></button>`).join('')}</div><p class="hint" style="text-align:center">Tohumlar ücretsiz. Bitkiler yalnızca yeni odak sürenle büyür.</p>`,'seed');}
