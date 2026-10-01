/* Integration glue: native lifecycle stays separate from the pixel scene. */
const renderBeforeLiving=render,routeBeforeLiving=route,closeBeforeLiving=closeSheet,sheetBeforeLiving=sheet,navBeforeLiving=renderNav;
const SceneBeforeLiving=Scene;
Scene=class {
 constructor(host){this.host=host;this.key=(themes[S.preferences.theme]?.effect||'lava')+':'+(themes[S.preferences.theme]?.luxury056||0);this.inner=this.create();}
 create(){return S.preferences.theme==='garden'?new LivingGarden(this.host,{passive:true}):new SceneBeforeLiving(this.host);}
 destroy(){this.inner?.destroy();}
 update(){const key=(themes[S.preferences.theme]?.effect||'lava')+':'+(themes[S.preferences.theme]?.luxury056||0);if(key!==this.key){this.inner?.destroy();this.host.innerHTML='';this.key=key;this.inner=this.create();}else this.inner?.update?.();}
 pause(){this.inner?.pause?.();}resume(){this.inner?.resume?.();}
};
renderNav=function(){navBeforeLiving();if(UI.gardenFull)$('#navigation').classList.add('hidden');};
render=function(){destroyGardens();renderBeforeLiving();mountGardens();updateGardenSelection();document.body.classList.toggle('garden-theme',S.preferences.theme==='garden');
 const old=$('#app-garden-bg');if(old)old.remove();
 if(S.preferences.theme==='garden'&&!['garden','focus'].includes(UI.route)&&!UI.editorId){const b=document.createElement('div');b.id='app-garden-bg';b.innerHTML=livingHost('app-living',true);document.body.prepend(b);mountGardens();}
 if(UI.immersive&&UI.route==='focus')setDisplay(true,UI.landscape?'landscape':'auto');else if(UI.gardenFull)setDisplay(true,'auto');
};
route=function(name,opts={}){if(name!=='garden'){UI.gardenFull=false;UI.gardenRoom=false;}UI.cinemaControls=false;UI.groundBrush=null;routeBeforeLiving(name,opts);if(!UI.gardenFull&&!UI.immersive)setDisplay(false,'portrait');};
closeSheet=function(){if(typeof pdfView!=='undefined'&&pdfView?.exporting){toast('PDF kopyası hazırlanıyor. İşlem bitince kapatabilirsin.');return;}if(inkEditor){saveInkInMemory();inkEditor=null;persist();}if(typeof pdfView!=='undefined'&&pdfView){disposePdfView();}closeBeforeLiving();if(UI.editorId)renderInkPreview();};
sheet=function(title,body,kind='generic'){if(inkEditor){saveInkInMemory();inkEditor=null;}sheetBeforeLiving(title,body,kind);};
let lastDisplayMode='';
async function setDisplay(full,orientation='auto'){const key=full+':'+orientation;if(lastDisplayMode===key)return;lastDisplayMode=key;try{await Native.call('displayMode',{full,orientation});}catch(e){if(Native.active)console.warn(e.message);}}
function weatherSheet(){sheet('Bahçemin havası',`<div class="option-section"><h3>Hava</h3><div class="chips">${[['auto','Temaya göre'],['clear','Açık'],['rain','Yağmur'],['snow','Kar']].map(([k,n])=>`<button class="chip ${S.living.weather===k?'active':''}" data-action="set-weather" data-value="${k}">${n}</button>`).join('')}</div><h3>Işık</h3><div class="chips">${[['auto','Manzaraya göre'],['day','Gündüz'],['dusk','Gün batımı'],['night','Gece']].map(([k,n])=>`<button class="chip ${S.living.time===k?'active':''}" data-action="set-time" data-value="${k}">${n}</button>`).join('')}</div><button class="btn primary full" data-action="use-garden-theme">Bahçemi tema yap</button><button class="text-btn full" data-action="route" data-route="themes">Diğer temalar</button><p class="hint">Görsel hava ile sesler ayrı ayarlanır.</p></div>`,'weather');}
function seedAlbum(){sheet('Tohum albümüm',`<p class="hint">Olgun bitkini bahçeye diktiğinde koleksiyonuna işlenir.</p><div class="seed-grid">${Object.entries(SEEDS).map(([k,s])=>`<button class="seed-card ${S.living.album.includes(k)?'collected':''}" data-action="album-plant" data-kind="${k}">${pixel(s.sprite,48)}<strong>${s.name}</strong><small>${S.living.album.includes(k)?'✓ Yetiştirdin':s.minutes+' dk odak'}</small></button>`).join('')}</div><button class="btn ghost full" data-action="pot-sheet">Saksılarım</button><button class="btn ghost full" data-action="living-memorial">Bir anı ağacı dik</button>`,'seed-album');}
function groundSheet(){sheet('Bahçeyi düzenle',`<p class="hint">Bir zemin seçip sahnede parmağını gezdir. Öğeleri taşımak için seçim moduna dön.</p><div class="chips">${[['','Seç ve taşı'],['stone','Taş yol'],['wood','Ahşap'],['flower','Çiçek bordürü'],['erase','Zemini temizle']].map(([k,n])=>`<button class="chip" data-action="choose-ground" data-brush="${k}">${n}</button>`).join('')}</div><div class="section-top"><h3>Hazır düzen</h3></div><div class="chips">${[['forest','Orman'],['pond','Gölet'],['camp','Gece kampı']].map(([k,n])=>`<button class="chip" data-action="living-layout" data-layout="${k}">${n}</button>`).join('')}</div><h3>Kulübe rengi</h3><div class="chips">${[['wood','Sıcak ahşap'],['blue','Gece mavisi'],['rose','Gül kurusu']].map(([k,n])=>`<button class="chip" data-action="home-color" data-color="${k}">${n}</button>`).join('')}</div>`,'ground');}
async function livingPostcard(){const scene=[...gardenInstances].find(g=>!g.passive);if(!scene)return;const editing=UI.gardenEdit;UI.gardenEdit=false;scene.paint(performance.now());const out=document.createElement('canvas');out.width=scene.world.width*2;out.height=scene.world.height*2;const c=out.getContext('2d');c.imageSmoothingEnabled=false;c.drawImage(scene.world,0,0,out.width,out.height);UI.gardenEdit=editing;scene.paint(performance.now());await Native.call('exportBinary',{base64:out.toDataURL('image/png').split(',')[1],name:'LumaNote-bahcem.png',mimeType:'image/png'});toast('Kartpostal hazır. Paylaşım menüsünden kaydet.');}
function clockStyleSheet(){sheet('Sayaç görünümü',`<div class="clock-style-grid">${[['simple','Sade'],['pixel','Piksel'],['flip','Çevirmeli']].map(([k,n])=>`<button class="clock-style-choice" data-action="set-clock" data-value="${k}"><div class="clock-${k}">25:00</div><span>${n}</span></button>`).join('')}</div>`,'clock-style');}
const enhancedBeforeLiving=enhancedAction;
enhancedAction=async function(name,el,e){const d=el.dataset;switch(name){
 case'note-category':UI.category=d.category;closeSheet();render();return true;
 case'notes-favorites':UI.favorites=!UI.favorites;closeSheet();render();return true;
 case'new-note':closeSheet();await createNote('blank');setTimeout(()=>$('#rich-editor')?.focus(),190);return true;
 case'notes-filter':notesFilter();return true;
 case'note-card-menu':noteCardMenu(d.id);return true;
 case'card-trash':await trashFromList(d.id);return true;
 case'undo-trash':{const n=getNote(d.id);if(n){delete n.deletedAt;await persist(true);render();toast('Not geri getirildi.');}return true;}
 case'card-pin':{const n=getNote(d.id);if(n)n.pinned=!n.pinned;await persist(true);closeSheet();render();return true;}
 case'card-duplicate':{const n=getNote(d.id);if(n){const c=structuredClone(n);c.id=uid();c.title=(c.title||'Not')+' · kopya';c.createdAt=c.updatedAt=new Date().toISOString();S.notes.unshift(c);await persist(true);closeSheet();render();}return true;}
 case'writing-tools':writingTools();return true;
 case'note-insert':noteInsert();return true;
 case'note-templates':templateSheet();return true;
 case'note-paper':paperSheet();return true;
 case'set-paper':{const n=getNote(UI.editorId);if(n){n.paper.kind=d.paper;await persist(true);applyNotePaper(n);closeSheet();}return true;}
 case'paper-image':{closeSheet();const a=await Native.call('pickImage');if(a){const n=getNote(UI.editorId);if(!n)return true;n.attachments.push(a);n.paper={kind:'image',imageId:a.id,opacity:.25};await persist(true);applyNotePaper(n);renderAttachments();}return true;}
 case'open-ink':openInk();return true;
 case'ink-done':await closeInk();return true;
 case'ink-eraser':if(inkEditor){inkEditor.erase=!inkEditor.erase;inkEditor.highlight=false;el.classList.toggle('active',inkEditor.erase);}return true;
 case'ink-highlight':if(inkEditor){inkEditor.highlight=!inkEditor.highlight;inkEditor.erase=false;el.classList.toggle('active',inkEditor.highlight);}return true;
 case'ink-tool':if(inkEditor){inkEditor.tool=d.tool;$$('[data-action="ink-tool"]').forEach(b=>b.classList.toggle('active',b===el));}return true;
 case'ink-undo':if(inkEditor&&inkEditor.strokes.length){inkEditor.redo.push(inkEditor.strokes.pop());inkEditor.draw();saveInkInMemory();}return true;
 case'ink-redo':if(inkEditor&&inkEditor.redo.length){inkEditor.strokes.push(inkEditor.redo.pop());inkEditor.draw();saveInkInMemory();}return true;
 case'insert-heading':closeSheet();format('formatBlock','h2');return true;
 case'table-options':tableOptions();return true;
 case'table-add-row':case'table-add-col':case'table-remove-row':case'table-remove-col':{const cell=UI.tableCell;if(!cell?.isConnected)return true;const table=cell.closest('table'),row=cell.closest('tr'),idx=cell.cellIndex;if(name==='table-add-row'&&table.rows.length<50){const next=table.insertRow(row.rowIndex+1);for(let i=0;i<row.cells.length;i++)next.insertCell().innerHTML='<br>';}if(name==='table-add-col'&&row.cells.length<12)for(const r of table.rows)r.insertCell(Math.min(idx+1,r.cells.length)).innerHTML='<br>';if(name==='table-remove-row')row.remove();if(name==='table-remove-col')for(const r of table.rows)r.cells[idx]?.remove();if(!table.rows.length||!table.rows[0]?.cells.length)table.remove();closeSheet();flushEditor();pushEditorHistory();return true;}
 case'garden-full':UI.gardenFull=!UI.gardenFull;render();await setDisplay(UI.gardenFull,UI.gardenFull?'auto':'portrait');return true;
 case'living-weather':weatherSheet();return true;
 case'set-weather':if(['auto','clear','rain','snow'].includes(d.value)){S.living.weather=d.value;await persist(true);weatherSheet();}return true;
 case'set-time':if(['auto','day','dusk','night'].includes(d.value)){S.living.time=d.value;await persist(true);weatherSheet();}return true;
 case'use-garden-theme':S.preferences.theme='garden';await persist(true);applyTheme();closeSheet();render();return true;
 case'living-exit-room':UI.gardenRoom=false;render();return true;
 case'living-water':{const p=S.world.plots[Number(d.slot)];if(p){S.living.watering[p.id]=Date.now();await persist(true);closeSheet();if(UI.route!=='garden')route('garden');}return true;}
 case'seed-album':seedAlbum();return true;
 case'album-plant':{const slot=S.world.plots.findIndex(p=>!p);if(slot<0){toast('Önce olgunlaşan bir bitkiyi bahçeye taşı.');return true;}await plantSeed(slot,d.kind);return true;}
 case'living-ground':groundSheet();return true;
 case'choose-ground':UI.groundBrush=d.brush||null;UI.gardenEdit=true;closeSheet();render();return true;
 case'garden-edit':UI.gardenEdit=!UI.gardenEdit;UI.groundBrush=null;render();return true;
 case'living-undo':if(gardenUndo.length){Object.assign(S.living,JSON.parse(gardenUndo.pop()));if(S.living.layout){S.world.layout=S.living.layout;delete S.living.layout;}await persist(true);render();}return true;
 case'living-remove':{const key=UI.selectedLiving;if(!key)return true;const pos=key.indexOf(':'),type=key.slice(0,pos),item=key.slice(pos+1);if(type==='pet'&&item===S.preferences.companion){toast('Önce başka bir yol arkadaşı seç.');return true;}rememberGarden();S.world.layout=S.world.layout.filter(x=>!(x.type===type&&x.item===item));delete S.living.placement[key];UI.selectedLiving=null;await persist(true);render();return true;}
 case'home-color':S.living.homeStyle=d.color;await persist(true);closeSheet();render();return true;
 case'living-layout':rememberGarden();S.living.ground=[];for(let x=11;x<20;x++)S.living.ground.push({x,y:d.layout==='pond'?12:14,kind:d.layout==='camp'?'wood':'stone'});for(const [i,p] of livingPlacements().entries())S.living.placement[p.key]={x:110+i%7*39,y:210+Math.floor(i/7)*22,room:false};S.living.time=d.layout==='camp'?'night':S.living.time;await persist(true);closeSheet();render();toast('Yerleşim değişti. Geri al ile önceki hâline dönebilirsin.');return true;
 case'garden-zoom':for(const g of gardenInstances)if(!g.passive){g.zoom=clamp(g.zoom+Number(d.delta),1,2.7);g.paint(performance.now());}return true;
 case'garden-reset-view':for(const g of gardenInstances)if(!g.passive){g.zoom=1;g.pan={x:0,y:0};}return true;
 case'living-postcard':await livingPostcard();return true;
 case'living-memorial':sheet('Bir anıyı büyüt',`<form id="memorial-form"><label class="field"><span>Ağacının adı</span><input name="name" maxlength="60" placeholder="İlk projem tamamlandı" required></label><button class="btn primary full">Anı ağacını dik</button><p class="hint">Bir çalışma oturumun kayıtlı olduğunda kullanılabilir. En fazla 20 anı ağacı.</p></form>`,'memorial');return true;
 case'immersive':UI.immersive=!UI.immersive;UI.cinemaControls=false;closeSheet();render();await setDisplay(UI.immersive,UI.immersive?(UI.landscape?'landscape':'auto'):'portrait');return true;
 case'cinema-controls':showCinemaControls();return true;
 case'rotate-focus':UI.landscape=!UI.landscape;await setDisplay(true,UI.landscape?'landscape':'portrait');showCinemaControls();return true;
 case'clock-style':clockStyleSheet();return true;
 case'set-clock':if(['simple','pixel','flip'].includes(d.value)){S.preferences.timerStyle=d.value;await persist(true);closeSheet();render();}return true;
 case'method-picker':methodPicker();return true;
 case'choose-method':{const m=STUDY_METHODS[d.method];if(!m)return true;if(S.timer){toast('Yöntemi değiştirmeden önce çalışmanı kaydet.');return true;}Object.assign(S.preferences,{method:d.method,focusMinutes:m.work||50,breakMinutes:m.rest,longBreakMinutes:m.long,rounds:m.rounds});S.practice={cycle:0,pending:null};await persist(true);closeSheet();render();return true;}
 case'study-settings':studySettings();return true;
 case'finish-partial':if(S.timer){await endFocus(false,true);}else{toast('Henüz bir çalışma başlatmadın.');}return true;
 case'next-phase':{const p=S.practice.pending;closeSheet();if(p)await startFocus(p.minutes,{phase:p.phase,title:p.phase==='break'?'Biraz nefes':undefined});return true;}
 case'completion-garden':route('garden');return true;
 case'focus-intent':sheet('Bu oturumda',`<form id="focus-intention"><label class="field"><span>Tek bir küçük hedef</span><input name="title" maxlength="160" value="${esc(UI.focusIntention||'')}" placeholder="Örneğin: bir konuyu tekrar et"></label><button class="btn primary full">Hazırım</button></form>`,'focus-intent');return true;
 case'piano-mix':Object.assign(S.preferences.volumes,{rain:55,ocean:0,fire:0,brown:0,piano:25,cafe:0});await persist(true);await setSoundPlaying(true);mixerSheet();return true;
 case'audio-credits':sheet('Ses kaynakları',`<div class="reading-content">${Object.entries(window.LUMA_AUDIO_META||{}).map(([k,m])=>`<h3>${esc(soundNames[k])}</h3><p>${esc(m.title)} · ${esc(m.author)}<br>${esc(m.license)}</p>${m.page?`<button class="text-btn" data-action="audio-source" data-source="${k}">Kaynağı aç</button>`:''}`).join('')}<p>İndirilen kayıtların seviyesi ve döngü geçişleri uygulamada değiştirilir. Üreticiler bu uygulamayı destekliyor anlamına gelmez.</p></div>`,'audio-credits');return true;
 case'audio-source':{const u=window.LUMA_AUDIO_META?.[d.source]?.page;if(u)await Native.call('openLink',{url:u});return true;}
 case'economy-info':sheet('Küçük emekler birikir',`<div class="reading-content"><h3>1 dakika çalışma = 3 jeton</h3><p>Yalnızca gerçek çalışma süresi kaydedildiğinde kazanırsın. Duraklatma ve mola süreleri kazanç üretmez. Eski sürümden gelen jetonların korunur; yeni oran yalnızca bundan sonraki çalışmalara uygulanır.</p><p>Bitkilerin dakika ile büyür. Hayvanları, dekorları ve saksıları jetonla seçersin. Ara verdiğinde hiçbir şey kaybolmaz.</p></div>`,'economy');return true;
 default:if(typeof pdfAction==='function'&&await pdfAction(name,el,e))return true;return enhancedBeforeLiving(name,el,e);
 }};
const submitBeforeLiving=enhancedSubmit;
enhancedSubmit=async function(form){const f=new FormData(form);if(form.id==='study-settings'){if(!form.reportValidity())return true;S.preferences.focusMinutes=clamp(f.get('work'),1,720);S.preferences.breakMinutes=clamp(f.get('rest'),1,120);S.preferences.longBreakMinutes=clamp(f.get('long'),1,120);S.preferences.rounds=Math.floor(clamp(f.get('rounds'),1,12));if(S.preferences.method==='flow')S.preferences.flowAutoRest=f.has('flowAutoRest');S.preferences.autoBreak=f.has('autoBreak');S.preferences.autoFocus=f.has('autoFocus');await persist(true);closeSheet();render();return true;}
 if(form.id==='table-form'){const rows=Math.floor(clamp(f.get('rows'),1,20)),cols=Math.floor(clamp(f.get('cols'),1,8));closeSheet();format('insertHTML','<table><tbody>'+Array.from({length:rows},()=>'<tr>'+Array.from({length:cols},()=>'<td><br></td>').join('')+'</tr>').join('')+'</tbody></table><p><br></p>');return true;}
 if(form.id==='focus-intention'){UI.focusIntention=String(f.get('title')||'').slice(0,160);if(S.timer){S.timer.title=UI.focusIntention;await persist(true);}closeSheet();render();return true;}
 if(form.id==='memorial-form'){if(!form.reportValidity())return true;if(!S.focusHistory.some(s=>s.phase!=='break'&&s.completedMinutes>0)){toast('İlk çalışmanı kaydettikten sonra dik.');return true;}if(S.living.memorials.length>=20){toast('Anı bahçende 20 ağaç var.');return true;}S.living.memorials.push({id:uid(),name:String(f.get('name')).slice(0,60)});await persist(true);closeSheet();route('garden');return true;}
 return submitBeforeLiving(form);};
// Sheet gestures are implemented once in stable-shell.js.
const originalWebAction05=webAction;
webAction=async function(type,p={}){switch(type){case'displayMode':return{preview:true,full:!!p.full};case'studyBell':{const C=window.AudioContext||window.webkitAudioContext;if(!C)return false;const ctx=webAudio.ctx||new C();webAudio.ctx=ctx;await ctx.resume();for(const [i,hz] of [659.25,880].entries()){const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=hz;g.gain.setValueAtTime(0,ctx.currentTime+i*.2);g.gain.linearRampToValueAtTime(.09,ctx.currentTime+i*.2+.02);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+i*.2+1.2);o.connect(g);g.connect(ctx.destination);o.start(ctx.currentTime+i*.2);o.stop(ctx.currentTime+i*.2+1.3);}return true;}
 case'readDocument':if(!/^data:application\/pdf[;,]/.test(p.uri))throw new Error('PDF dosyası bu tarayıcıda bulunamadı.');return p.uri.split(',')[1];
 case'exportBinary':{const data=Uint8Array.from(atob(p.base64),c=>c.charCodeAt(0));downloadText(data,p.name,p.mimeType);return true;}
 default:return originalWebAction05(type,p);}};
