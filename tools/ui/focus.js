/* v0.4 timer: one persisted deadline, fractional elapsed time and an idempotent
   session commit. Lock-screen time is reconciled at resume/next boot. */
let focusBusy=false,finishingSession=null;
function normalizeTimer(raw){
  if(!raw||!['running','paused'].includes(raw.status))return null;
  const totalSeconds=Number(raw.totalSeconds);
  if(!Number.isFinite(totalSeconds)||totalSeconds<1||totalSeconds>43200)return null;
  if(raw.status==='running'&&!Number.isFinite(Number(raw.endAt)))return null;
  return {...raw,id:typeof raw.id==='string'?raw.id:uid(),totalSeconds,
    remainingMs:clamp(raw.remainingMs??Number(raw.remaining)*1000,0,totalSeconds*1000),
    remaining:clamp(raw.remaining,0,totalSeconds),endAt:Number(raw.endAt)||0,
    phase:raw.phase==='break'?'break':'focus',checkpointAt:Number(raw.checkpointAt)||Date.now()};
}
function remainingMs(t,now=Date.now()){
  if(t.status!=='running')return clamp(t.remainingMs??t.remaining*1000,0,t.totalSeconds*1000);
  // The saved upper bound prevents a backwards clock adjustment from adding time.
  return clamp(Math.min(t.endAt-now,t.remainingMs??t.totalSeconds*1000),0,t.totalSeconds*1000);
}
function remaining(t){return Math.ceil(remainingMs(t)/1000)}
function checkpointTimer(t){if(!t)return;t.remainingMs=remainingMs(t);t.remaining=Math.ceil(t.remainingMs/1000);t.checkpointAt=Date.now();}
function clock(seconds){const s=Math.max(0,Math.ceil(seconds)),h=Math.floor(s/3600),m=Math.floor((s%3600)/60),ss=s%60;return(h?String(h).padStart(2,'0')+':':'')+String(m).padStart(2,'0')+':'+String(ss).padStart(2,'0')}
async function startFocus(minutes,meta={}){
  if(focusBusy)return;focusBusy=true;
  try{
    if(S.timer){if(!await confirmAction('Oturumu değiştir?','Çalıştığın süre ve jetonların kaydedilir.','Yeni oturum'))return;await endFocus(false,false);}
    minutes=clamp(minutes,1,720);const now=Date.now();
    S.timer={id:uid(),title:meta.title||getNote(UI.selectedNote)?.title||'Serbest odak',noteId:meta.noteId||UI.selectedNote||null,plannerId:meta.plannerId||null,plannerDay:meta.plannerDay||localDay(),totalSeconds:minutes*60,remaining:minutes*60,remainingMs:minutes*60000,endAt:now+minutes*60000,checkpointAt:now,startedAt:new Date(now).toISOString(),status:'running',phase:meta.phase||'focus'};
    try{await persist(true)}catch(e){S.timer=null;throw e;}
    closeSheet();UI.editorId=null;UI.route='focus';render();await scheduleTimerEnd();
    if(S.preferences.soundWithFocus)await setSoundPlaying(true);
    Native.call('keepAwake',{enabled:S.preferences.keepAwake}).catch(()=>{});
  }finally{focusBusy=false;}
}
async function scheduleTimerEnd(){
  await Native.call('cancelTimer').catch(()=>{});
  if(!S.timer||S.timer.flow||S.timer.status!=='running'||!S.preferences.notifications)return;
  try{await Native.call('scheduleTimer',{endAt:S.timer.endAt,title:S.timer.title,id:S.timer.id,phase:S.timer.phase})}
  catch(e){toast('Sayaç çalışıyor; bitiş bildirimi kurulamadı.',5000)}
}
async function toggleFocus(){
  if(focusBusy)return;
  if(!S.timer)return startFocus(S.preferences.focusMinutes);
  if(S.timer.status==='running'&&remaining(S.timer)===0)return endFocus(true);
  focusBusy=true;
  try{
    const previous={...S.timer};
    if(S.timer.status==='running'){checkpointTimer(S.timer);S.timer.status='paused';}
    else{S.timer.endAt=Date.now()+(S.timer.remainingMs??S.timer.remaining*1000);S.timer.checkpointAt=Date.now();S.timer.status='running';}
    try{await persist(true)}catch(e){S.timer=previous;throw e;}
    if(S.timer.status==='paused'){await Native.call('cancelTimer').catch(()=>{});Native.call('keepAwake',{enabled:false}).catch(()=>{});await setSoundPlaying(false);}
    else{await scheduleTimerEnd();Native.call('keepAwake',{enabled:S.preferences.keepAwake}).catch(()=>{});if(S.preferences.soundWithFocus)await setSoundPlaying(true);}
    render();
  }finally{focusBusy=false;}
}
async function endFocus(completed=true,show=true){
  const t=S.timer;if(!t||finishingSession===t.id)return;
  finishingSession=t.id;
  const previousHistory=S.focusHistory.slice(),previousWorld=JSON.parse(JSON.stringify(S.world)),previousPlanner=JSON.parse(JSON.stringify(S.planner));
  try{
    const rest=remainingMs(t),actualCompleted=completed&&rest<=0;
    const endedAt=actualCompleted?Math.min(Date.now(),t.endAt):Date.now();
    const seconds=actualCompleted?t.totalSeconds:Math.max(0,(t.totalSeconds*1000-rest)/1000);
    const session={id:t.id,startedAt:t.startedAt,endedAt:new Date(endedAt).toISOString(),plannedMinutes:t.totalSeconds/60,completedMinutes:seconds/60,completedSeconds:seconds,completed:actualCompleted,title:t.title,noteId:t.noteId,plannerId:t.plannerId,phase:t.phase||'focus'};
    const beforeCoins=wallet();
    S.timer=null;
    if(session.phase!=='break'&&seconds>0&&!S.focusHistory.some(s=>s.id===session.id))S.focusHistory.unshift(session);
    syncWorld(S);session.coinsAwarded=Math.max(0,wallet()-beforeCoins);
    if(actualCompleted&&t.plannerId&&t.phase!=='break'){
      const p=S.planner.find(p=>p.id===t.plannerId);if(p){if(p.repeat&&p.repeat!=='none'){p.completedDates=p.completedDates||{};p.completedDates[t.plannerDay||localDay()]=true;}else p.completed=true;}
    }
    try{await persist(true)}catch(e){S.timer=t;S.focusHistory=previousHistory;S.world=previousWorld;S.planner=previousPlanner;throw e;}
    Native.call('cancelTimer').catch(()=>{});Native.call('keepAwake',{enabled:false}).catch(()=>{});await setSoundPlaying(false);
    if(UI.route==='focus')render();
    if(show&&actualCompleted){if(t.phase==='break')toast('Molan tamamlandı.');else completionSheet(session);}
    return session;
  }finally{finishingSession=null;}
}
function tick(){
  if(!ready||!S.timer)return;const t=S.timer,rest=remaining(t);
  if(t.status==='running'&&rest===0){endFocus(true).catch(e=>toast(e.message));return;}
  if(UI.route==='focus'&&!UI.editorId){
    const d=$('#timer-digits');if(d)d.textContent=t.flow?clock((t.totalSeconds*1000-remainingMs(t))/1000):clock(rest);
    const ring=$('#timer-progress');if(ring)ring.style.strokeDashoffset=String(911.06*(1-rest/t.totalSeconds));
    const coins=$('#session-coins');if(coins)coins.textContent=String(t.phase==='break'?0:Math.floor((t.totalSeconds*1000-remainingMs(t))/20000));
  }
}
setInterval(tick,450);
// Periodic checkpoint complements background/pagehide saves; no per-tick writes.
setInterval(()=>{if(ready&&S.timer?.status==='running')persist(true).catch(()=>{});},15000);
function completionSheet(s){
 UI.lastSession=s.id;
 sheet('Tamamlandı',`<div class="completion concise-completion">${pixel(S.preferences.companion,104)}<h2>Güzel çalıştın.</h2><div class="reward-receipt"><strong>${Math.round(s.completedMinutes)} dk</strong><span>${coinIcon(23)} +${s.coinsAwarded||0}</span></div><p>${S.world.plots.some(Boolean)?'Bitkilerin de biraz büyüdü.':'Bahçene bir tohum ekebilirsin.'}</p></div><label class="field"><span>Bir cümle (isteğe bağlı)</span><input id="session-journal" maxlength="500" placeholder="Bugünden kalan…"></label><button class="btn primary full" data-action="completion-garden">Bahçeme git ${icon('leaf',17)}</button><button class="text-btn full" data-action="start-break">${S.preferences.breakMinutes} dk mola</button>`,'completion');
}
function sessionDetail(id){const s=S.focusHistory.find(x=>x.id===id);if(!s)return;sheet('Oturum',`<div class="row" style="margin:22px 0">${pixel(plantFor(s),55)}<div><h3>${esc(s.title||'Serbest odak')}</h3><p class="hint">${esc(fmtDate(s.endedAt,{day:'numeric',month:'long',year:'numeric'}))}</p></div></div><div class="session-details"><div><small>Çalıştığın süre</small><strong>${fmtMinutes(s.completedMinutes)}</strong></div><div><small>Planladığın süre</small><strong>${fmtMinutes(s.plannedMinutes)}</strong></div></div><p class="hint">${s.completed?'Tamamlanan oturum · odak süren bahçene işlendi.':'Kısmi oturum · çalıştığın süre toplamlarına eklendi.'}</p>${s.journal?`<div class="notice">${esc(s.journal)}</div>`:''}${s.noteId&&getNote(s.noteId)?`<button class="btn ghost full" style="margin-top:20px" data-action="edit-note" data-id="${esc(s.noteId)}">${icon('note',17)} Bağlı nota git</button>`:''}`,'session-detail')}
function customDuration(){sheet('Odak süresi',`<p class="lead">1–720 dakika.</p><form id="duration-form"><label class="field"><span>Odak süresi · dakika</span><input name="minutes" type="number" min="1" max="720" value="${S.preferences.focusMinutes}" inputmode="numeric" required></label><button class="btn primary full" type="submit">Süreyi ayarla</button></form>`,'duration')}
function focusOptions(){sheet('Odak ayarları',`<p class="lead">Sayacın ekran kapansa da geçen zamana göre hesaplanır. Sesler ekran kilitlendiğinde durur; odak ekranına dönünce yeniden açabilirsin.</p><div class="chips"><button class="chip" data-action="focus-preset" data-focus="25" data-break="5">25 dk / 5 dk mola</button><button class="chip" data-action="focus-preset" data-focus="50" data-break="10">50 dk / 10 dk mola</button></div><section class="card flat" style="margin-top:18px">${toggleMarkup('keepAwake','Ekran açık kalsın','Yalnızca çalışan odak oturumunda.')}${toggleMarkup('soundWithFocus','Sesleri odakla birlikte başlat','Ses karışımın olduğu gibi kullanılır.')}</section>${S.timer?'<button class="btn danger full" style="margin-top:18px" data-action="finish-partial">Bu kadar yeter, oturumu bitir</button>':''}<button class="text-btn" style="width:100%;margin-top:12px" data-action="lava-options">Lava görünümünü ayarla</button>`,'focus-options')}
function focusIntent(){sheet('Şu an neye yer açıyorsun?',`<p class="lead">Bir notla çalış ya da yalnızca serbestçe odaklan.</p><button class="template-card" data-action="choose-focus-note" data-id="">${icon('spark')}<div class="grow"><h3>Serbest odak</h3><p>Bir başlık seçmeden, kendi ritminde.</p></div></button>${activeNotes().map(n=>`<button class="template-card" data-action="choose-focus-note" data-id="${esc(n.id)}">${icon('note')}<div class="grow"><h3>${esc(n.title||'Başlıksız')}</h3><p>${esc(n.category)}</p></div></button>`).join('')}`,'focus-intent')}
const soundNames={rain:'Yağmur dokusu',ocean:'Okyanus dokusu',brown:'Kahverengi gürültü',fire:'Ateş dokusu',cafe:'Kendi kafe kaydın'};
function soundSummary(){if(!UI.soundPlaying)return 'Sessiz';const keys=Object.keys(soundNames).filter(k=>S.preferences.volumes[k]>0&&(k!=='cafe'||S.preferences.customAudio));return keys.length?keys.map(k=>soundNames[k].replace(' dokusu','')).join(' + '):'Henüz bir ses seçilmedi.'}
async function setSoundPlaying(on){UI.soundPlaying=on;try{await Native.call('audio',{playing:on,volumes:S.preferences.volumes,customAudio:S.preferences.customAudio});syncSoundUI()}catch(e){UI.soundPlaying=false;syncSoundUI();toast('Ses başlatılamadı: '+e.message,5000)}}
function syncSoundUI(){const s=$('#sound-summary');if(s)s.textContent=soundSummary();$('#mini-equalizer')?.classList.toggle('playing',UI.soundPlaying);const b=$('#mixer-play');if(b){b.innerHTML=icon(UI.soundPlaying?'pause':'play',17)+(UI.soundPlaying?'Sesleri durdur':'Karışımı dinle');b.setAttribute('aria-pressed',String(UI.soundPlaying))}}
function mixerSheet(){sheet('Sessizliğin tonları',`<p class="lead">Sesleri küçük oranlarda birleştir. Birlikte çalan dört kanal, sana ait tek bir ortam.</p><div class="presets"><button data-action="sound-preset" data-preset="rain">Gece yağmuru</button><button data-action="sound-preset" data-preset="coast">Sakin kıyı</button><button data-action="sound-preset" data-preset="fire">Sıcak bir köşe</button>${S.preferences.soundPresets.map((p,i)=>`<button data-action="saved-mix" data-index="${i}">${esc(p.name)}</button>`).join('')}</div>${Object.entries(soundNames).map(([key,name])=>`<div class="sound-row"><div class="row"><button class="icon-btn" data-action="toggle-channel" data-channel="${key}" aria-label="${name} aç/kapat">${icon(key==='brown'?'noise':key==='cafe'?'coffee':key,21)}</button><div class="grow"><h3 style="font-size:14px">${name}</h3><p class="muted">${key==='cafe'?S.preferences.customAudio?esc(S.preferences.customAudio.name):'Kendi lisanslı ses dosyanı ekle.':key==='brown'?'Yumuşak, alçak frekanslı gürültü':'Cihazla üretilmiş ortam dokusu'}</p></div><span class="sound-value" id="vol-${key}">${S.preferences.volumes[key]}%</span></div>${key==='cafe'&&!S.preferences.customAudio?'<button class="text-btn" data-action="import-audio">Ses dosyası ekle '+icon('plus',14)+'</button>':`<input type="range" min="0" max="100" value="${S.preferences.volumes[key]}" data-sound="${key}" aria-label="${name} ses seviyesi">`}</div>`).join('')}<button id="mixer-play" class="btn primary full" style="margin-top:24px" data-action="sound-toggle">${icon(UI.soundPlaying?'pause':'play',17)}${UI.soundPlaying?'Sesleri durdur':'Karışımı dinle'}</button><button class="text-btn" style="width:100%;margin-top:10px" data-action="save-mix">Bu karışımı kaydet</button><p class="hint" style="margin-top:12px">Hazır kanallar gerçek saha kaydı değil, bu proje için üretilmiş seslerdir. Kulaklıkta düşük seviyeden başla. Kafe kaydının kullanım hakkı sana ait olmalı.</p>`,'mixer')}
function lavaSheet(){sheet('Karanlığın içindeki renk',`<p class="lead">Hafif bir hareket, daha az ışık. Aradığın atmosferi ayarla.</p><div class="chips">${Object.entries(themes).map(([k,t])=>`<button class="chip ${S.preferences.theme===k?'active':''}" data-action="theme" data-theme="${k}">${t.name}</button>`).join('')}</div><div style="margin-top:15px">${lavaControls()}</div>`,'lava')}
