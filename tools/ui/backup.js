/* Backup UI: creation, explicit share/save, password entry and two-step import.
   Passwords stay in local variables, never in S, localStorage or diagnostic logs. */
function stateCounts(state=S){return {notes:state.notes.length,plans:state.planner.length,sessions:state.focusHistory.length,attachments:state.notes.reduce((n,x)=>n+(x.attachments?.length||0),0)}}
function backupCountsHTML(c){return `<div class="backup-counts">${[[c.notes,'not'],[c.plans,'plan'],[c.sessions,'oturum'],[c.attachments,'ek']].map(([v,k])=>`<div><strong>${v||0}</strong><small>${k}</small></div>`).join('')}</div>`}
function renderBackup(){const b=S.backupInfo;return `<div class="page">${header('',true)}<div class="title-row"><h1>Yedeklerim</h1></div><section class="card backup-overview"><div class="backup-symbol">${icon('lock',29)}</div><h2>Notların seninle kalsın.</h2>${backupCountsHTML(stateCounts())}<p class="hint">Jetonlar, hayvanlar, bitkiler ve ayarlar dahil.</p></section><button class="btn primary full" style="margin-top:18px" data-action="export-backup">${icon('download',18)} Yedek oluştur</button><button class="btn ghost full" style="margin-top:10px" data-action="import-backup">${icon('upload',18)} Yedek seç ve incele</button>
 <div class="section-top"><h2>Son oluşturulan dosya</h2></div>${b?`<section class="card flat"><div class="row"><span class="status-dot"></span><div class="grow"><h3>${esc(fmtDate(b.createdAt,{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'}))}</h3><p class="hint">${b.encrypted?'Şifreli':'Şifresiz JSON'} · ${b.notes||0} not · ${b.attachments||0} ek</p></div></div>${b.missing?.length?`<p class="backup-warning">${b.missing.length} ek dosyaya ulaşılamadı.</p>`:''}<button class="text-btn full" data-action="share-backup">${icon('share',16)} Paylaş / Dosyalar’a kaydet</button></section>`:'<p class="hint">Henüz bir yedek dosyası oluşturulmadı.</p>'}
 <details class="backup-help"><summary>Bilmem gerekenler</summary><p>Dosyanın oluşturulması, Mac dışında veya bulutta yedeklendiği anlamına gelmez. Paylaşım menüsünden Dosyalar’a ya da sana ait güvenli bir alana kaydet.</p><p>Şifreli yedeğin parolası saklanmaz ve sıfırlanamaz. Uygulamanın cihazdaki canlı veritabanı bu seçenekle şifrelenmez.</p><p>Geri yüklemeden önce içerik önizlemesini görürsün. Onayladığında mevcut kayıtların yerine yedek gelir; çalışan sayaç aktarılmaz. Yerel bir geri dönüş kopyası da tutulur.</p></details></div>`}
function exportBackupSheet(){sheet('Yedek oluştur',`<form id="backup-create-form"><label class="backup-mode"><input type="checkbox" name="encrypted" id="backup-encrypted" checked><span>${icon('lock',18)} Şifreli yedek</span></label><div id="backup-password-fields"><label class="field"><span>Şifre · en az 10 karakter</span><input type="password" name="password" minlength="10" maxlength="256" autocomplete="new-password" required></label><label class="field"><span>Şifreyi tekrar yaz</span><input type="password" name="confirmPassword" minlength="10" maxlength="256" autocomplete="new-password" required></label><p class="hint">Şifreyi unutursan bu yedek açılamaz.</p></div><p id="backup-plain-warning" class="backup-warning hidden">Şifresiz dosyayı açabilen herkes notlarını okuyabilir.</p><button type="submit" class="btn primary full" style="margin-top:18px">Dosyayı oluştur</button></form>`,'backup-create')}
function showBackupPreview(info){UI.backupPreview=info;if(info.encrypted){sheet('Yedeğin şifresi',`<form id="backup-unlock-form"><label class="field"><span>Şifre</span><input name="password" type="password" autocomplete="current-password" maxlength="256" required></label><p class="hint">Şifre açılmadan kayıtların değiştirilmez.</p><button type="submit" class="btn primary full" style="margin-top:16px">Önizlemeyi aç</button></form>`,'backup-unlock');return;}
 const current=stateCounts();sheet('Geri yükleme önizlemesi',`<div class="backup-preview"><p class="eyebrow">SEÇİLEN YEDEK</p>${backupCountsHTML(info)}<p class="hint">${info.exportedAt?esc(fmtDate(info.exportedAt,{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'})):'Eski sürüm yedeği'}${info.hasGarden?' · bahçe dahil':''}</p><div class="backup-warning">Bu cihazdaki ${current.notes} not, ${current.plans} plan ve ${current.sessions} oturum yerine bu yedek yüklenecek.</div>${info.missing?.length?`<div class="backup-warning">Yedekte eksik ekler: ${info.missing.map(esc).join(', ')}</div>`:''}<p class="hint">Birleştirme yapılmaz. Önce mevcut verinin dışa aktarılmış bir yedeğini sakla.</p></div><div class="actions"><button class="btn ghost" data-action="close">Vazgeç</button><button class="btn primary" data-action="backup-commit">Geri yükle</button></div>`,'backup-preview');}
async function beginBackupImport(){if(S.timer){toast('Önce odak oturumunu bitir; ardından yedeği içe aktar.',5500);return;}const info=await Native.call('previewBackup');if(info)showBackupPreview(info);}
let backupWorking=false;
async function restorePreviewedBackup(){
 if(backupWorking||!UI.backupPreview)return;if(S.timer){toast('Önce odak oturumunu bitir.');return;}
 backupWorking=true;const before=S;
 try{
  const token=UI.backupPreview.token;toast('Yedek hazırlanıyor…',15000);
  const candidate=await Native.call('commitBackup',{token});
  const next=normalize(candidate);next.timer=null;
  for(const p of next.planner){p.notificationIds=[];p.notificationStatus='off';}
  // Do not replace UI data until normalization succeeds. Roll back memory on save errors.
  S=next;try{await persist(true)}catch(e){S=before;throw e;}
  await Native.call('cancelTimer').catch(()=>{});
  for(const p of before.planner)await Native.call('cancelNotifications',{ids:p.notificationIds||[],plannerId:p.id}).catch(()=>{});
  UI.backupPreview=null;applyTheme();route('home');toast('Yedek yüklendi. Bildirimleri ayarlardan yeniden kurabilirsin.',6000);
 }finally{backupWorking=false;}
}
async function submitBackupForm(form){
 if(!['backup-create-form','backup-unlock-form'].includes(form.id))return false;
 if(backupWorking)return true;if(!form.reportValidity())return true;
 const button=$('button[type=submit]',form),oldText=button.textContent;button.disabled=true;button.textContent='İşleniyor…';backupWorking=true;
 try{
  const data=new FormData(form);
  if(form.id==='backup-create-form'){
    const encrypted=data.has('encrypted'),password=String(data.get('password')||'');
    if(encrypted&&(password.length<10||password!==String(data.get('confirmPassword')||'')))throw new Error('Şifreler aynı ve en az 10 karakter olmalı.');
    await persist(true);const result=await Native.call('createBackup',{state:S,password:encrypted?password:undefined});
    S.backupInfo=result;await persist(true);form.reset();closeSheet();UI.route='backup';render();
    sheet('Dosya oluşturuldu',`${backupCountsHTML(result)}${result.missing?.length?`<div class="backup-warning">Dahil edilemeyen ekler: ${result.missing.map(esc).join(', ')}</div>`:''}<p class="hint">Şimdi dosyayı uygulama dışında güvenli bir yere kaydet.</p><button class="btn primary full" style="margin-top:18px" data-action="share-backup">${icon('share',17)} Paylaş / Dosyalar’a kaydet</button>`,'backup-created');
  }else{
    const info=await Native.call('unlockBackup',{token:UI.backupPreview?.token,password:String(data.get('password')||'')});form.reset();showBackupPreview(info);
  }
 }finally{backupWorking=false;if(button.isConnected){button.disabled=false;button.textContent=oldText;}}
 return true;
}
// Browser equivalent uses Web Crypto and the same envelope / authenticated header.
const BACKUP_AAD='lumanote:nocturne:backup:2|PBKDF2-SHA256|600000';
const browserBackupFiles=new Map();let browserStagedBackup=null;
function bytesBase64(bytes){let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(s)}
function fromBase64(text){const s=atob(text);return Uint8Array.from(s,c=>c.charCodeAt(0))}
async function backupKey(password,salt){
 if(password.length<10||password.length>256)throw new Error('Şifre 10–256 karakter olmalı.');
 if(!globalThis.crypto?.subtle)throw new Error('Bu tarayıcı güvenli şifreleme sağlamıyor. Telefonda kullan veya localhost üzerinde önizle.');
 const base=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveKey']);
 return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:600000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
async function encryptBrowserBackup(raw,password){
 const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
 const key=await backupKey(password,salt),cipher=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode(BACKUP_AAD)},key,new TextEncoder().encode(JSON.stringify(raw))));
 const combined=new Uint8Array(iv.length+cipher.length);combined.set(iv);combined.set(cipher,iv.length);
 return {format:'lumanote-nocturne-encrypted',version:2,algorithm:'AES-256-GCM',kdf:'PBKDF2-SHA256',iterations:600000,salt:Array.from(salt,x=>x.toString(16).padStart(2,'0')).join(''),data:bytesBase64(combined)};
}
async function decryptBrowserBackup(envelope,password){
 if(envelope.version!==2||envelope.algorithm!=='AES-256-GCM'||envelope.kdf!=='PBKDF2-SHA256'||envelope.iterations!==600000||!/^[a-f0-9]{32}$/i.test(envelope.salt)||typeof envelope.data!=='string'||envelope.data.length<40||envelope.data.length>160*1024*1024||!/^[A-Za-z0-9+/]*={0,2}$/.test(envelope.data)||envelope.data.length%4!==0)throw new Error('Şifreli yedek biçimi geçersiz.');
 const salt=Uint8Array.from(envelope.salt.match(/../g),x=>parseInt(x,16)),combined=fromBase64(envelope.data),key=await backupKey(password,salt);
 try{const raw=await crypto.subtle.decrypt({name:'AES-GCM',iv:combined.slice(0,12),additionalData:new TextEncoder().encode(BACKUP_AAD)},key,combined.slice(12));return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(raw));}
 catch{throw new Error('Şifre yanlış veya dosya bozulmuş. Verilerin değiştirilmedi.');}
}
function browserBackupSummary(raw){
 if(raw.format&&raw.format!=='lumanote-nocturne')throw new Error('Yedek biçimi desteklenmiyor.');
 if(Number((raw.state||raw)?.schema||1)>3)throw new Error('Yedek daha yeni bir uygulama sürümüne ait.');
 const state=normalize(raw.state||raw);
 return {...stateCounts(state),files:(raw.files||[]).length,missing:raw.missingFiles||[],exportedAt:raw.exportedAt||null,hasGarden:!!(raw.state||raw).world};
}
async function webBackupAction(type,p){
 switch(type){
 case 'createBackup':{const createdAt=new Date().toISOString(),state=JSON.parse(JSON.stringify(p.state)),missing=state.notes.flatMap(n=>n.attachments||[]).filter(a=>!a.uri.startsWith('data:')).map(a=>a.name);const raw={format:'lumanote-nocturne',version:2,exportedAt:createdAt,state,missingFiles:missing};const envelope=p.password?await encryptBrowserBackup(raw,p.password):raw;const fileName=`LumaNote-yedek-${createdAt.replace(/[:.]/g,'-')}${p.password?'-sifreli':''}.json`;browserBackupFiles.set(fileName,JSON.stringify(envelope));return {...browserBackupSummary(raw),fileName,createdAt,encrypted:!!p.password};}
 case 'shareBackup':{const text=browserBackupFiles.get(p.fileName);if(!text)throw new Error('Tarayıcı önizlemesi yeniden açılmış. Dosyayı yeniden oluştur.');downloadText(text,p.fileName);return true;}
 case 'previewBackup':{const file=await chooseBrowserFile('.json,application/json',160*1024*1024);if(!file)return null;let raw;try{raw=JSON.parse(await file.text());}catch{throw new Error('Bu dosya JSON yedeği değil.');}const token=uid(),encrypted=raw.format==='lumanote-nocturne-encrypted';if(!encrypted)browserBackupSummary(raw);browserStagedBackup={raw,token,encrypted};return {token,encrypted,...(encrypted?{}:browserBackupSummary(raw))};}
 case 'unlockBackup':{if(browserStagedBackup?.token!==p.token)throw new Error('Yedek dosyasını yeniden seç.');const raw=await decryptBrowserBackup(browserStagedBackup.raw,p.password);const summary=browserBackupSummary(raw);browserStagedBackup.raw=raw;browserStagedBackup.encrypted=false;return {token:p.token,encrypted:false,wasEncrypted:true,...summary};}
 case 'commitBackup':{if(browserStagedBackup?.token!==p.token||browserStagedBackup.encrypted)throw new Error('Önce yedeği seç ve şifresini aç.');const raw=browserStagedBackup.raw;browserBackupSummary(raw);localStorage.setItem(STORAGE+':before-import',JSON.stringify(S));const state=JSON.parse(JSON.stringify(raw.state||raw));const mapping=new Map((raw.files||[]).map(f=>[f.uri,`data:${f.mimeType||'application/octet-stream'};base64,${f.base64}`]));for(const a of state.notes.flatMap(n=>n.attachments||[]))if(mapping.has(a.uri))a.uri=mapping.get(a.uri);if(state.preferences?.customAudio&&mapping.has(state.preferences.customAudio.uri))state.preferences.customAudio.uri=mapping.get(state.preferences.customAudio.uri);browserStagedBackup=null;return state;}
 case 'cancelBackupImport':browserStagedBackup=null;return true;
 }
 throw new Error('Desteklenmeyen yedek işlemi.');
}
