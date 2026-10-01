/** Native capabilities for the bundled offline interface. All bridge commands are
 * explicitly allowlisted; file operations never fetch remote content. */
import { encryptBackup, decryptBackup, isEncryptedBackup } from './BackupCrypto';
import { Buffer } from 'buffer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FS from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Notifications from 'expo-notifications';
import * as Sharing from 'expo-sharing';
import { Platform, Linking } from 'react-native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import type { Attachment, AppData, Plan, BridgeMessage, NativeEvent, AudioSettings } from './types';
import { isAppData } from './types';

const NAMESPACE = 'lumanote-nocturne';
const ROOT = `${FS.documentDirectory}lumanote-living-v05/`;
const LEGACY_ROOT = `${FS.documentDirectory}lumanote-nocturne/`;
const STORE = `${ROOT}state.json`;
const FILES = `${ROOT}files/`;
const CATEGORY = 'LUMA_STUDY_V3';
const CHANNEL = 'luma-reminders-v3';
const MAX_EMBEDDED = 80 * 1024 * 1024;
const safeName = (name: string) => name.replace(/[^\p{L}\p{N}._ -]/gu, '_').slice(0, 100) || 'dosya';
const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
const localDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const explain = (e: unknown) => e instanceof Error ? e.message : 'İşlem tamamlanamadı.';

export function createNativeServices(options: {
  emit: (event: NativeEvent) => void;
  setAudio: (settings: AudioSettings) => void;
  setAppearance: (value: { light: boolean; background: string }) => void;
}) {
  let writeTail: Promise<unknown> = Promise.resolve();
  let notificationTail: Promise<unknown> = Promise.resolve();
  let uiReady = false;
  let pendingEvents: NativeEvent[] = [];
  const queueEvent = (event: NativeEvent) => uiReady ? options.emit(event) : pendingEvents.push(event);
  let lastResponse = '';
  let responseSubscription: ReturnType<typeof Notifications.addNotificationResponseReceivedListener> | undefined;

  async function prepare() {
    if (!FS.documentDirectory) throw new Error('Cihazın belge klasörüne ulaşılamadı.');
    await FS.makeDirectoryAsync(FILES, { intermediates: true });
  }
  async function load(): Promise<AppData | null> {
    await prepare();
    let foundSavedFile = false, foundCurrent = false;
    // Recover from an interrupted write without erasing the previous valid file.
    for (const path of [STORE, `${STORE}.tmp`, `${STORE}.previous`, LEGACY_ROOT+'state.json', LEGACY_ROOT+'state.json.tmp', LEGACY_ROOT+'state.json.previous']) {
      if(path.startsWith(LEGACY_ROOT)&&foundCurrent)throw new Error('Yeni sürümün kaydı okunamadı. Eski sürümün dosyaları korunuyor; otomatik geri dönüş yapılmadı.');
      if (!(await FS.getInfoAsync(path)).exists) continue;
      foundSavedFile=true;if(!path.startsWith(LEGACY_ROOT))foundCurrent=true;
      try {
        const value: unknown = JSON.parse(await FS.readAsStringAsync(path));
        if (!isAppData(value)) throw new Error('Invalid saved state');
        if (path !== STORE && !path.startsWith(LEGACY_ROOT)) queueEvent({type:'notice', payload:'Son geçerli yerel kaydın geri yüklendi.'});
        if(Number(value.schema||1)<2 && !(await FS.getInfoAsync(ROOT+'before-v04-state.json')).exists)await FS.copyAsync({from:path,to:ROOT+'before-v04-state.json'});
        if(Number(value.schema||1)<3 && !(await FS.getInfoAsync(ROOT+'before-v05-state.json')).exists)await FS.copyAsync({from:path,to:ROOT+'before-v05-state.json'});
        if(path.startsWith(LEGACY_ROOT)){
          // Copy-on-migrate: v0.4 state and attachments remain byte-for-byte intact.
          const copy=JSON.parse(JSON.stringify(value)) as AppData;
          const assets=copy.notes.flatMap(n=>n.attachments||[]);
          const custom=copy.preferences?.customAudio as Attachment|null;
          if(custom)assets.push(custom);
          const mapped=new Map<string,string>();
          for(const attachment of assets){try{assertReadable(attachment.uri);if(!mapped.has(attachment.uri)){
            if(!(await FS.getInfoAsync(attachment.uri)).exists)throw new Error('Eksik ek');
            const dest=FILES+newId()+'-'+safeName(attachment.name||'ek');await FS.copyAsync({from:attachment.uri,to:dest});mapped.set(attachment.uri,dest);
          }attachment.uri=mapped.get(attachment.uri)!;}catch{queueEvent({type:'notice',payload:'Eski bir ek dosya kopyalanamadı. Eski kayıt ve dosya yolu korundu; veri yedeğini sakla.'});}}
          queueEvent({type:'notice',payload:'Eski kayıtların bu sürüme kopyalandı. Önceki sürümün dosyaları değiştirilmedi.'});
          return copy;
        }
        return value;
      } catch (e) {
        if (path === `${STORE}.previous` || path === LEGACY_ROOT+'state.json.previous') throw new Error('Yerel kayıt okunamadı. Dosyalar korunuyor; yedeğini kullanarak kurtar.');
      }
    }
    if(foundSavedFile) throw new Error('Kayıt dosyası okunamadı. Eski dosyalar korunuyor; yedeğini kullan.');
    // v0.2 migration is read-only with regard to the old AsyncStorage key.
    const raw = await AsyncStorage.getItem('lumanote:v2');
    if (!raw) return null;
    const old: unknown = JSON.parse(raw);
    if (!isAppData(old)) throw new Error('Eski sürümdeki kayıt beklenen biçimde değil. Eski kayıt silinmedi.');
    const migrated = JSON.parse(JSON.stringify(old)) as AppData;
    for (const note of migrated.notes) {
      for (const attachment of note.attachments || []) {
        try {
          if (attachment.uri && isSandboxURI(attachment.uri) && (await FS.getInfoAsync(attachment.uri)).exists) {
            const dest = FILES + newId() + '-' + safeName(attachment.name || 'ek');
            await FS.copyAsync({ from: attachment.uri, to: dest });
            attachment.uri = dest;
          }
        } catch { /* Original metadata is retained so the user can recover the file. */ }
      }
    }
    migrated.onboarded = true;
    return migrated;
  }
  function save(state: unknown) {
    if (!isAppData(state)) return Promise.reject(new Error('Kaydedilecek veri biçimi geçersiz.'));
    const text = JSON.stringify(state);
    if (text.length > 30 * 1024 * 1024) return Promise.reject(new Error('Not verisi çok büyük. Önce yedek alıp içeriği azalt.'));
    const operation = async () => {
      await prepare();
      await FS.writeAsStringAsync(`${STORE}.tmp`, text);
      if ((await FS.getInfoAsync(STORE)).exists) {
        await FS.deleteAsync(`${STORE}.previous`, {idempotent: true});
        await FS.copyAsync({from: STORE, to: `${STORE}.previous`});
        await FS.deleteAsync(STORE, {idempotent: true});
      }
      await FS.moveAsync({from: `${STORE}.tmp`, to: STORE});
      return true;
    };
    writeTail = writeTail.then(operation, operation);
    return writeTail;
  }
  function isSandboxURI(uri: string) {
    try {
      const value = decodeURIComponent(uri);
      return !value.includes('/../') && !value.includes('/./') &&
        [FS.documentDirectory, FS.cacheDirectory].some(root => !!root && value.startsWith(root));
    } catch { return false; }
  }
  function assertReadable(uri: unknown): asserts uri is string {
    if (typeof uri !== 'string' || !isSandboxURI(uri)) throw new Error('Yalnızca bu uygulamanın yerel dosyaları açılabilir.');
  }
  async function copyPicked(uri: string, name: string, kind: Attachment['type'], size?: number, mimeType?: string): Promise<Attachment> {
    await prepare();
    const max = kind === 'audio'||kind==='pdf' ? 25 * 1024 * 1024 : 12 * 1024 * 1024;
    const info = await FS.getInfoAsync(uri);
    const bytes = size || (info.exists && 'size' in info ? Number(info.size) : 0);
    if (bytes > max) throw new Error(`En fazla ${Math.round(max / 1024 / 1024)} MB boyutunda bir dosya seç.`);
    const id = newId();
    const dest = FILES + id + '-' + safeName(name);
    await FS.copyAsync({from: uri, to: dest});
    return { id, uri: dest, name, type: kind, size: bytes, mimeType };
  }
  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({mediaTypes: ['images'], quality: 0.75, allowsMultipleSelection: false});
    if (result.canceled || !result.assets?.[0]) return null;
    const asset = result.assets[0];
    return copyPicked(asset.uri, asset.fileName || `foto-${newId()}.jpg`, 'image', asset.fileSize, asset.mimeType || 'image/jpeg');
  }
  async function pickFile(kind: 'audio'|'pdf') {
    const result = await DocumentPicker.getDocumentAsync({type: kind === 'audio' ? 'audio/*' : 'application/pdf', copyToCacheDirectory: true, multiple: false});
    if (result.canceled || !result.assets?.[0]) return null;
    const asset = result.assets[0];
    return copyPicked(asset.uri, asset.name, kind, asset.size, asset.mimeType);
  }
  async function shareFile(uri: string, mimeType?: string) {
    assertReadable(uri);
    if (!(await FS.getInfoAsync(uri)).exists) throw new Error('Bu dosya artık cihazda bulunamıyor.');
    if (!await Sharing.isAvailableAsync()) throw new Error('Bu cihazda paylaşım menüsü kullanılamıyor.');
    await Sharing.shareAsync(uri, {mimeType, dialogTitle: 'LumaNote · paylaş veya başka uygulamada aç'});
    return true;
  }
  // Staging is in memory only. Picking/decrypting/previewing never replaces state.
  let stagedBackup: {token:string;raw:any;encrypted:boolean;createdAt:number} | null = null;
  function backupSummary(raw:any){
    const state=raw?.state||raw;
    if(!isAppData(state))throw new Error('Bu dosya geçerli bir LumaNote yedeği değil.');
    if(raw?.format && raw.format!=='lumanote-nocturne')throw new Error('Bu yedek biçimi desteklenmiyor.');
    if(Number(state.schema||1)>3)throw new Error('Yedek daha yeni bir uygulama sürümüne ait. Önce uygulamayı güncelle.');
    if(state.notes.some(n=>!n||typeof n.id!=='string'||(n.attachments!==undefined&&!Array.isArray(n.attachments))))throw new Error('Yedekte geçersiz bir not var.');
    if(state.notes.length>20000||state.planner.length>20000||state.focusHistory.length>200000)throw new Error('Yedek kayıt sayısı sınırını aşıyor.');
    if(raw.files!==undefined&&!Array.isArray(raw.files))throw new Error('Yedek ekleri geçersiz.');
    let bytes=0;
    for(const f of raw.files||[]){
      if(!f||typeof f.uri!=='string'||typeof f.base64!=='string'||!/^[A-Za-z0-9+/]*={0,2}$/.test(f.base64)||f.base64.length%4!==0)throw new Error('Yedekte bozuk bir ek dosya var.');
      bytes+=f.base64.length*.75;
    }
    if(bytes>MAX_EMBEDDED)throw new Error('Dosya ekleri 80 MB sınırını aşıyor.');
    const attachments=state.notes.flatMap(n=>n.attachments||[]);
    return {notes:state.notes.length,plans:state.planner.length,sessions:state.focusHistory.length,attachments:attachments.length,files:(raw.files||[]).length,missing:Array.isArray(raw.missingFiles)?raw.missingFiles.map(String):[],exportedAt:typeof raw.exportedAt==='string'?raw.exportedAt:null,hasGarden:!!state.world};
  }
  async function createBackup(state:AppData,password?:string){
    if(!isAppData(state))throw new Error('Geçersiz yedek verisi.');
    const copy=JSON.parse(JSON.stringify(state)) as AppData;
    const attachments=copy.notes.flatMap(n=>n.attachments||[]);
    const custom=copy.preferences?.customAudio as Attachment|null;
    if(custom)attachments.push(custom);
    const unique=[...new Map(attachments.map(a=>[a.uri,a])).values()];
    const files:Array<{uri:string;name:string;mimeType?:string;base64:string}>=[],missing:string[]=[];
    let total=0;
    for(const a of unique){
      try{
        assertReadable(a.uri);const info=await FS.getInfoAsync(a.uri);
        if(!info.exists){missing.push(a.name);continue;}
        total+='size' in info?Number(info.size):0;
        if(total>MAX_EMBEDDED)throw new Error('Dosya ekleri 80 MB sınırını aşıyor. Ekleri ayrıca yedekle.');
        files.push({uri:a.uri,name:a.name,mimeType:a.mimeType,base64:await FS.readAsStringAsync(a.uri,{encoding:FS.EncodingType.Base64})});
      }catch(e){if(total>MAX_EMBEDDED)throw e;missing.push(a.name||'Adsız ek');}
    }
    await prepare();const createdAt=new Date().toISOString();
    const raw={format:'lumanote-nocturne',version:2,exportedAt:createdAt,state:copy,files,missingFiles:[...new Set(missing)]};
    // Ensure files we create fit the import limit, including UTF-8 and Base64 expansion.
    const rawBytes=Buffer.byteLength(JSON.stringify(raw),'utf8');
    const estimatedBytes=password?Math.ceil((rawBytes+28)/3)*4+4096:rawBytes;
    if(estimatedBytes>160*1024*1024)throw new Error('Bu yedek 160 MB sınırını aşıyor. Büyük dosya eklerini ayrıca yedekle.');
    // No plaintext intermediary is written when password protection is selected.
    const output=password?await encryptBackup(raw,password):raw;
    const fileName=`LumaNote-yedek-${createdAt.replace(/[:.]/g,'-')}${password?'-sifreli':''}.json`;
    await FS.writeAsStringAsync(ROOT+fileName,JSON.stringify(output));
    return {...backupSummary(raw),fileName,createdAt,encrypted:!!password};
  }
  async function shareBackup(fileName:string){
    if(typeof fileName!=='string'||fileName!==safeName(fileName)||!/^LumaNote-yedek-[\w.-]+\.json$/.test(fileName))throw new Error('Yedek dosya adı geçersiz.');
    await shareFile(ROOT+fileName,'application/json');return true;
  }
  async function previewBackup(){
    const picked=await DocumentPicker.getDocumentAsync({type:['application/json','text/plain','application/octet-stream'],copyToCacheDirectory:true,multiple:false});
    if(picked.canceled||!picked.assets?.[0])return null;
    const file=picked.assets[0];if((file.size||0)>160*1024*1024)throw new Error('Yedek dosyası çok büyük.');
    let raw:any;try{raw=JSON.parse(await FS.readAsStringAsync(file.uri));}catch{throw new Error('Bu dosya okunabilir bir JSON yedeği değil.');}
    const encrypted=isEncryptedBackup(raw),token=newId();
    if(!encrypted)backupSummary(raw);
    stagedBackup={token,raw,encrypted,createdAt:Date.now()};
    return {token,encrypted,...(encrypted?{}:backupSummary(raw))};
  }
  function requireStage(token:string){
    if(!stagedBackup||stagedBackup.token!==token||Date.now()-stagedBackup.createdAt>15*60*1000)throw new Error('Önizleme süresi doldu. Yedek dosyasını tekrar seç.');
    return stagedBackup;
  }
  async function unlockBackup(token:string,password:string){
    const stage=requireStage(token);if(!stage.encrypted)return {token,encrypted:false,...backupSummary(stage.raw)};
    const raw=await decryptBackup(stage.raw,password);const summary=backupSummary(raw);
    stage.raw=raw;stage.encrypted=false;return {token,encrypted:false,wasEncrypted:true,...summary};
  }
  async function commitBackup(token:string){
    const stage=requireStage(token);if(stage.encrypted)throw new Error('Önce yedeğin şifresini aç.');
    backupSummary(stage.raw);const raw=stage.raw;
    const state=JSON.parse(JSON.stringify(raw.state||raw)) as AppData;
    await writeTail;await prepare();
    // A local rollback snapshot is created; original attachment files are untouched.
    if((await FS.getInfoAsync(STORE)).exists)await FS.copyAsync({from:STORE,to:ROOT+`before-import-${Date.now()}.json`});
    const mapping=new Map<string,string>(),created:string[]=[];
    let total=0;
    try{
      for(const f of raw.files||[]){const uri=FILES+newId()+'-'+safeName(String(f.name||'ek'));await FS.writeAsStringAsync(uri,f.base64,{encoding:FS.EncodingType.Base64});created.push(uri);mapping.set(f.uri,uri);total+=f.base64.length*.75;}
      const attachments=state.notes.flatMap(n=>n.attachments||[]),custom=state.preferences?.customAudio as Attachment|null;if(custom)attachments.push(custom);
      for(const a of attachments){
        if(mapping.has(a.uri))a.uri=mapping.get(a.uri)!;
        else if(typeof a.uri==='string'&&/^data:[a-z0-9.+\-/]+;base64,/i.test(a.uri)){
          const base64=a.uri.slice(a.uri.indexOf(',')+1);if(!/^[A-Za-z0-9+/]*={0,2}$/.test(base64)||base64.length%4!==0)throw new Error('Yedekte bozuk bir dosya eki var.');
          total+=base64.length*.75;if(total>MAX_EMBEDDED)throw new Error('Dosya ekleri 80 MB sınırını aşıyor.');
          const uri=FILES+newId()+'-'+safeName(a.name||'ek');await FS.writeAsStringAsync(uri,base64,{encoding:FS.EncodingType.Base64});created.push(uri);a.uri=uri;
        }
      }
      // The UI normalizes this candidate before calling save; no state replacement yet.
      stagedBackup=null;return state;
    }catch(e){for(const uri of created)await FS.deleteAsync(uri,{idempotent:true}).catch(()=>{});throw e;}
  }

  async function permissions(request: boolean) {
    if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync(CHANNEL,{name:'LumaNote anımsatıcıları',importance:Notifications.AndroidImportance.HIGH,sound:'default'});
    let current = await Notifications.getPermissionsAsync();
    if (!current.granted && request) current = await Notifications.requestPermissionsAsync();
    return {granted:current.granted,status:current.status};
  }
  function isOurs(notification: Notifications.NotificationRequest) {
    return notification.content.data?.luma === NAMESPACE;
  }
  async function cancelPlannerNotifications(plannerId?: string) {
    const requests = await Notifications.getAllScheduledNotificationsAsync();
    for (const request of requests) {
      const data = request.content.data;
      // Also removes v0.2 reminders for this specific migrated planner ID.
      if (data?.kind === 'timerEnd') continue;
      if ((isOurs(request) && (!plannerId || data?.plannerId === plannerId)) || (plannerId && data?.plannerId === plannerId)) await Notifications.cancelScheduledNotificationAsync(request.identifier);
    }
  }
  function occurrences(plan: Plan) {
    const result: Array<{date:Date;day:string;plan:Plan}> = [];
    const now=Date.now();
    const original = new Date(`${plan.date}T${plan.time}:00`);
    if (!Number.isFinite(original.getTime())) return result;
    const add=(date:Date)=>{
      const day=localDay(date);
      if(plan.repeat && plan.repeat!=='none' ? plan.completedDates?.[day] : plan.completed) return;
      if(date.getTime()<=now) return;
      const notificationTime=Math.max(now+2000,date.getTime()-(Number(plan.reminderMinutes)||0)*60000);
      result.push({date:new Date(notificationTime),day,plan});
    };
    if(!plan.repeat || plan.repeat==='none'){add(original);return result;}
    // Rolling calendar-accurate dates prevent reminders occurring BEFORE a future
    // recurrence start date. Refilled on launch/resume; see README for the horizon.
    const day = new Date(); day.setHours(12,0,0,0);
    for(let i=0;i<120;i++){
      const occurrence = new Date(day); occurrence.setDate(day.getDate()+i);
      const [h,m]=plan.time.split(':').map(Number); occurrence.setHours(h,m,0,0);
      if(occurrence < original) continue;
      if(plan.repeat==='weekly' && occurrence.getDay()!==original.getDay()) continue;
      if(plan.repeat==='weekdays' && (occurrence.getDay()===0||occurrence.getDay()===6)) continue;
      add(occurrence);
    }
    return result;
  }
  function reconcile(plans: Plan[], enabled: boolean) {
    const op = async () => {
      await cancelPlannerNotifications();
      const allowed = enabled && (await permissions(false)).granted;
      const all: Record<string,{ids:string[];status:string}> = {};
      for(const p of plans) all[p.id]={ids:[],status:enabled?'denied':'off'};
      if(!allowed) return all;
      const ordered=plans.flatMap(occurrences).sort((a,b)=>a.date.getTime()-b.date.getTime());
      for(const p of plans) all[p.id].status=ordered.some(o=>o.plan.id===p.id)?'queued':'past';
      // 48 reminders, reserving room for focus completion and snoozes on iOS.
      for(const item of ordered.slice(0,48)){
        const p=item.plan;
        try {
          const id=await Notifications.scheduleNotificationAsync({content:{title:`${p.icon||'✦'} ${p.title}`,body:p.kind==='study'?`${p.durationMinutes||50} dakikalık çalışma alanın hazır. Başlat'a dokun.`:'Kendine ayırdığın zamanı hatırlatıyorum.',sound:'default',categoryIdentifier:p.kind==='study'?CATEGORY:undefined,data:{luma:NAMESPACE,kind:p.kind,plannerId:p.id,plannerDay:item.day,title:p.title,duration:p.durationMinutes||50}},trigger:{type:Notifications.SchedulableTriggerInputTypes.DATE,date:item.date,channelId:Platform.OS==='android'?CHANNEL:undefined}});
          all[p.id].ids.push(id);all[p.id].status='scheduled';
        }catch{if(!all[p.id].ids.length)all[p.id].status='error';}
      }
      return all;
    };
    const result=notificationTail.then(op,op);
    notificationTail=result;
    return result;
  }
  async function cancelTimer() {
    const requests=await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(requests.filter(r=>isOurs(r)&&r.content.data?.kind==='timerEnd').map(r=>Notifications.cancelScheduledNotificationAsync(r.identifier)));
    return true;
  }
  async function processResponse(response: Notifications.NotificationResponse | null) {
    if(!response)return;
    const data=response.notification.request.content.data;
    if(data?.luma!==NAMESPACE)return;
    const token=response.notification.request.identifier+':'+response.actionIdentifier;
    if(lastResponse===token || await AsyncStorage.getItem('luma:last-response-v3')===token)return;
    lastResponse=token;await AsyncStorage.setItem('luma:last-response-v3',token);
    if(response.actionIdentifier==='LUMA_SNOOZE'){
      await Notifications.scheduleNotificationAsync({content:response.notification.request.content,trigger:{type:Notifications.SchedulableTriggerInputTypes.DATE,date:new Date(Date.now()+10*60000),channelId:Platform.OS==='android'?CHANNEL:undefined}});
      queueEvent({type:'notification',payload:{...data,action:'snooze'}});
    }else queueEvent({type:'notification',payload:{...data,action:'start'}});
  }
  async function init() {
    await prepare();
    Notifications.setNotificationHandler({handleNotification:async()=>({shouldShowBanner:true,shouldShowList:true,shouldPlaySound:true,shouldSetBadge:false})});
    await Notifications.setNotificationCategoryAsync(CATEGORY,[{identifier:'LUMA_START',buttonTitle:'Başlat',options:{opensAppToForeground:true}},{identifier:'LUMA_SNOOZE',buttonTitle:'10 dk ertele',options:{opensAppToForeground:true}}]);
    responseSubscription=Notifications.addNotificationResponseReceivedListener(r=>{processResponse(r).catch(e=>queueEvent({type:'notice',payload:explain(e)}));});
    await processResponse(await Notifications.getLastNotificationResponseAsync());
  }
  async function refreshReminders() {
    const data=await load();
    if(!data)return;
    const knownIds=new Set(data.planner.map(p=>p.id));
    const existing=await Notifications.getAllScheduledNotificationsAsync();
    for(const request of existing){const d=request.content.data;if(d?.luma!==NAMESPACE&&typeof d?.plannerId==='string'&&knownIds.has(d.plannerId))await Notifications.cancelScheduledNotificationAsync(request.identifier);}
    const all=await reconcile(data.planner,!!data.preferences?.notifications);
    queueEvent({type:'notificationState',payload:all});
  }
  async function handle(message: BridgeMessage): Promise<unknown> {
    const p=message.payload||{};
    switch(message.type){
      case'load':return load();
      case'save':return save(p.state);
      case'ready':uiReady=true;for(const event of pendingEvents)options.emit(event);pendingEvents=[];refreshReminders().catch(e=>queueEvent({type:'notice',payload:'Anımsatıcılar yenilenemedi: '+explain(e)}));return true;
      case'appearance':options.setAppearance({light:!!p.light,background:/^#[0-9a-f]{6}$/i.test(p.background)?p.background:'#090a12'});return true;
      case'pickImage':return pickImage();
      case'pickFile':return pickFile(p.type==='audio'?'audio':'pdf');
      case'readImage':{
        assertReadable(p.uri);const info=await FS.getInfoAsync(p.uri);
        if(!info.exists)throw new Error('Fotoğraf dosyası bulunamadı.');
        if('size' in info&&Number(info.size)>12*1024*1024)throw new Error('Önizleme için fotoğraf çok büyük.');
        const extension=p.uri.split('.').pop()?.toLowerCase();const mime=extension==='png'?'image/png':extension==='webp'?'image/webp':extension==='heic'?'image/heic':'image/jpeg';
        return `data:${mime};base64,`+await FS.readAsStringAsync(p.uri,{encoding:FS.EncodingType.Base64});
      }
      case'readDocument':{
        assertReadable(p.uri);const info=await FS.getInfoAsync(p.uri);
        if(!info.exists)throw new Error('PDF dosyası bulunamadı.');
        if('size' in info&&Number(info.size)>25*1024*1024)throw new Error('PDF en fazla 25 MB olabilir.');
        const data=await FS.readAsStringAsync(p.uri,{encoding:FS.EncodingType.Base64});
        if(!Buffer.from(data.slice(0,80),'base64').toString('ascii').includes('%PDF-'))throw new Error('Bu dosya geçerli bir PDF başlığı taşımıyor.');return data;
      }
      case'exportBinary':{
        if(typeof p.base64!=='string'||p.base64.length>35*1024*1024||!/^[A-Za-z0-9+/]*={0,2}$/.test(p.base64)||p.base64.length%4!==0)throw new Error('Dosya içeriği geçersiz veya çok büyük.');
        if(!['image/png','application/pdf'].includes(p.mimeType))throw new Error('Desteklenmeyen dışa aktarma türü.');
        await prepare();const uri=FILES+'export-'+newId()+'-'+safeName(String(p.name||'LumaNote-ek'));
        await FS.writeAsStringAsync(uri,p.base64,{encoding:FS.EncodingType.Base64});return shareFile(uri,p.mimeType);
      }
      case'openFile':return shareFile(p.uri,typeof p.mimeType==='string'?p.mimeType:undefined);
      case'createBackup':return createBackup(p.state,typeof p.password==='string'&&p.password?p.password:undefined);
      case'shareBackup':return shareBackup(p.fileName);
      case'previewBackup':return previewBackup();
      case'unlockBackup':return unlockBackup(p.token,p.password);
      case'commitBackup':return commitBackup(p.token);
      case'cancelBackupImport':stagedBackup=null;return true;
      case'exportText':{
        await prepare();if(typeof p.text!=='string'||p.text.length>20*1024*1024)throw new Error('Paylaşılacak metin geçersiz veya çok büyük.');
        const uri=ROOT+safeName(String(p.name||'LumaNote.txt'));await FS.writeAsStringAsync(uri,p.text);return shareFile(uri,p.mimeType||'text/plain');
      }
      case'openLink':if(typeof p.url!=='string'||!/^https?:\/\//i.test(p.url))throw new Error('Desteklenmeyen bağlantı.');await Linking.openURL(p.url);return true;
      case'permission':return permissions(true);
      case'cancelNotifications':await cancelPlannerNotifications(typeof p.plannerId==='string'?p.plannerId:undefined);return true;
      case'schedulePlan':{
        const plans=Array.isArray(p.plans)?p.plans:[p.plan];
        const all=await reconcile(plans,true);return {...(all[p.plan.id]||{ids:[],status:'error'}),all};
      }
      case'cancelTimer':return cancelTimer();
      case'scheduleTimer':{
        await cancelTimer();if(!(await permissions(false)).granted)return {status:'denied'};
        if(!Number.isFinite(p.endAt)||p.endAt<=Date.now())return {status:'past'};
        const id=await Notifications.scheduleNotificationAsync({content:{title:p.phase==='break'?'Molan tamamlandı.':'Biraz odak, yeni bir filiz. 🌱',body:p.phase==='break'?'Hazır olduğunda yeniden başlayabilirsin.':'Oturumun tamamlandı. Bahçene bir göz at.',sound:'default',data:{luma:NAMESPACE,kind:'timerEnd',sessionId:p.id}},trigger:{type:Notifications.SchedulableTriggerInputTypes.DATE,date:new Date(p.endAt),channelId:Platform.OS==='android'?CHANNEL:undefined}});return{id,status:'scheduled'};
      }
      case'keepAwake':if(p.enabled)await activateKeepAwakeAsync(NAMESPACE);else await deactivateKeepAwake(NAMESPACE);return true;
      case'audio':{
        const volumes:Record<string,number>={};for(const key of ['rain','ocean','brown','fire','piano','pianoMoon','pianoDawn','pianoSakura','cafe'])volumes[key]=Math.max(0,Math.min(100,Number(p.volumes?.[key])||0));
        if(p.customAudio)assertReadable(p.customAudio.uri);
        options.setAudio({playing:!!p.playing,volumes,customAudio:p.customAudio||null});return true;
      }
      default:throw new Error('Desteklenmeyen uygulama komutu.');
    }
  }
  return {handle,init,refreshReminders,dispose(){responseSubscription?.remove();deactivateKeepAwake(NAMESPACE).catch(()=>{});}};
}
