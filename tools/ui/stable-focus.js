/* Focus transitions persist once. Optional notification/audio work never holds
   the timer's input lock. No timer state is reconstructed from animation time. */
let focusFeedbackTimer053;
function focusFeedback053(on){clearTimeout(focusFeedbackTimer053);$('.focus-busy053')?.remove();
 $$('[data-action="focus-toggle"],[data-action="finish-partial"]').forEach(b=>b.disabled=on);
 if(on)focusFeedbackTimer053=setTimeout(()=>{if(!focusBusy)return;const el=document.createElement('div');el.className='focus-busy053';el.setAttribute('role','status');el.textContent='Çalışman kaydediliyor…';document.body.append(el);},450);
}
function focusBackground053(playing){
 const run=()=>{scheduleTimerEnd().catch(e=>console.warn('[LumaNote] timer-notification: '+e.message));
  if(!playing||S.preferences.soundWithFocus)setSoundPlaying(!!playing).catch(()=>{});
  Native.call('keepAwake',{enabled:!!playing&&S.preferences.keepAwake}).catch(()=>{});};run();
}
startFocus=async function(minutes,meta={}){
 if(focusBusy||rewardBusy)return;
 if(S.timer){const id=S.timer.id;if(!await confirmAction('Oturumu değiştir?','Geçen çalışma süren kaydedilecek.','Kaydet ve değiştir'))return;if(S.timer?.id!==id)return;await endFocus(false,false);if(S.timer)return;}
 if(focusBusy||rewardBusy)return;focusBusy=true;focusFeedback053(true);const previousPending=S.practice.pending;
 try{const rest=meta.phase==='break',flow=!rest&&S.preferences.method==='flow',m=flow?720:clamp(minutes,1,720),now=Date.now();
  S.timer={id:uid(),title:meta.title||UI.focusIntention||getNote(UI.selectedNote)?.title||'Serbest odak',noteId:meta.noteId||UI.selectedNote||null,plannerId:meta.plannerId||null,plannerDay:meta.plannerDay||localDay(),totalSeconds:m*60,remaining:m*60,remainingMs:m*60000,endAt:now+m*60000,checkpointAt:now,startedAt:new Date(now).toISOString(),status:'running',phase:rest?'break':'focus',flow,method:S.preferences.method};
  S.practice.pending=null;
  try{await persist(true);}catch(e){S.timer=null;S.practice.pending=previousPending;throw e;}
  closeSheet();UI.editorId=null;UI.route='focus';UI.gardenFull=false;UI.gardenRoom=false;render();focusBackground053(true);
 }finally{focusBusy=false;focusFeedback053(false);}
};
toggleFocus=async function(){if(focusBusy||rewardBusy)return;if(!S.timer)return startFocus(S.preferences.focusMinutes);if(S.timer.status==='running'&&remaining(S.timer)===0)return endFocus(true);
 focusBusy=true;focusFeedback053(true);const prev={...S.timer};try{
  if(S.timer.status==='running'){checkpointTimer(S.timer);S.timer.status='paused';}else{S.timer.endAt=Date.now()+S.timer.remainingMs;S.timer.checkpointAt=Date.now();S.timer.status='running';}
  try{await persist(true);}catch(e){S.timer=prev;throw e;}
  render();focusBackground053(S.timer.status==='running');
 }finally{focusBusy=false;focusFeedback053(false);}
};
endFocus=async function(completed=true,show=true){const t=S.timer;if(!t||focusBusy||rewardBusy||finishingSession===t.id)return;
 focusBusy=true;rewardBusy=true;finishingSession=t.id;focusFeedback053(true);
 const before=wallet(),old={history:S.focusHistory.slice(),world:structuredClone(S.world),planner:structuredClone(S.planner),living:structuredClone(S.living),practice:structuredClone(S.practice)};
 let session,committed=false,autoPhase=null;
 try{
  const rem=remainingMs(t),complete=completed&&rem<=0,seconds=complete?t.totalSeconds:Math.max(0,(t.totalSeconds*1000-rem)/1000),endedAt=complete?Math.min(Date.now(),t.endAt):Date.now();
  session={id:t.id,startedAt:t.startedAt,endedAt:new Date(endedAt).toISOString(),plannedMinutes:t.totalSeconds/60,completedMinutes:seconds/60,completedSeconds:seconds,completed:complete,title:t.title,noteId:t.noteId,plannerId:t.plannerId,phase:t.phase||'focus'};
  const duplicate=S.focusHistory.some(s=>s.id===t.id);S.timer=null;
  if(session.phase!=='break'&&seconds>0&&!duplicate){S.focusHistory.unshift(session);syncWorld(S);session.coinsAwarded=Math.max(0,wallet()-before);
   S.living.bonds[S.preferences.companion]=(S.living.bonds[S.preferences.companion]||0)+seconds;if(complete||t.flow)S.practice.cycle++;queueGrowth();
   if(complete&&t.plannerId){const p=S.planner.find(p=>p.id===t.plannerId);if(p){if(p.repeat&&p.repeat!=='none'){p.completedDates||={};p.completedDates[t.plannerDay||localDay()]=true;}else p.completed=true;}}
   S.practice.pending={phase:'break',minutes:nextBreakMinutes(session)};
  }else if(session.phase==='break')S.practice.pending={phase:'focus',minutes:S.preferences.focusMinutes};
  try{await persist(true);committed=true;}catch(e){S.timer=t;S.focusHistory=old.history;S.world=old.world;S.planner=old.planner;S.living=old.living;S.practice=old.practice;throw e;}
  focusBusy=false;focusFeedback053(false);focusBackground053(false);if(UI.route==='focus')render();
  if(show&&UI.route==='focus'){
   closeSheet();if(session.phase!=='break'&&seconds>0&&!duplicate){await coinCelebration(session.coinsAwarded||0,before,wallet());}
   // A bell must never block completion or opening the next phase.
   ringStudyBell().catch(()=>{});
   if(UI.route==='focus'&&!UI.overlay){if(session.phase==='break'){if(S.preferences.autoFocus)autoPhase=S.practice.pending;else breakCompleteSheet();}
    else if(seconds>0){if(S.preferences.autoBreak)autoPhase=S.practice.pending;else completionSheet(session);}}
  }
  return session;
 }finally{finishingSession=null;focusBusy=false;rewardBusy=false;focusFeedback053(false);if(committed&&autoPhase&&!S.timer)startFocus(autoPhase.minutes,{phase:autoPhase.phase,title:autoPhase.phase==='break'?'Biraz nefes':undefined}).catch(e=>toast(e.message));}
};
// Serialize reconciliation so rapid pause/resume cannot leave a stale alarm.
let notificationGeneration053=0,notificationRunning053=false;
scheduleTimerEnd=async function(){notificationGeneration053++;if(notificationRunning053)return;notificationRunning053=true;
 try{let handled;do{handled=notificationGeneration053;await Native.call('cancelTimer').catch(()=>{});
  if(handled!==notificationGeneration053)continue;const t=S.timer;if(t&&t.status==='running'&&!t.flow&&S.preferences.notifications){try{await Native.call('scheduleTimer',{endAt:t.endAt,title:t.title,id:t.id,phase:t.phase});}catch(e){toast('Sayaç çalışıyor; bitiş bildirimi kurulamadı.',3500);}}
 }while(handled!==notificationGeneration053);}finally{notificationRunning053=false;}
};
