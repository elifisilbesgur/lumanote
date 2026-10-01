/* Requested real-recording channels never silently play a synthetic substitute.
   Existing mix preferences survive; only the outgoing playback message is gated. */
function missingRecording054(key){return ['ocean','fire'].includes(key)&&audioInfo(key).kind!=='recording';}
function effectiveVolumes054(volumes){const next={...volumes};for(const k of ['ocean','fire'])if(missingRecording054(k))next[k]=0;return next;}
const nativeCall054=Native.call.bind(Native);
Native.call=function(type,params={}){if(type==='audio')params={...params,volumes:effectiveVolumes054(params.volumes||{})};return nativeCall054(type,params);};
const summaryAudio053=soundSummary;
soundSummary=function(){if(!UI.soundPlaying)return 'Sessiz';const keys=Object.keys(soundNames).filter(k=>!missingRecording054(k)&&S.preferences.volumes[k]>0&&(k!=='cafe'||S.preferences.customAudio));return keys.length?keys.map(k=>soundNames[k]).join(' + '):'Bir ses seç';};
const mixBefore054=mixerSheet;
mixerSheet=function(){mixBefore054();for(const key of ['ocean','fire']){const button=$(`[data-action="toggle-channel"][data-channel="${key}"]`),row=button?.closest('.sound-row');if(!row||!missingRecording054(key))continue;row.querySelector('.muted').textContent='Gerçek kayıt bu projede henüz kurulu değil';row.querySelector('[data-sound]')?.remove();button.dataset.action='recording-help054';const vol=row.querySelector('.sound-value');if(vol)vol.textContent='Eksik';row.insertAdjacentHTML('beforeend','<button class="text-btn" data-action="recording-help054">Gerçek kaydı kur</button>');}
 const hint=$('.sheet-body053>.hint');if(hint)hint.textContent='Okyanus ve odun ateşi için yalnızca gerçek kayıtlar kullanılır. Kayıt eksikse kanal sessiz kalır. Sesler telefon kilitlenince durur.';
};
const actionAudio053=enhancedAction;
enhancedAction=async function(name,el,e){if(name==='recording-help054'){sheet('Gerçek ses kaydı',`<div class="reading-content"><p>Mac’teki <strong>LumaNote_Yasayan_Bahce</strong> klasöründe <strong>SESLERI_INDIR.command</strong> dosyasını Terminal’den çalıştır. Sonra Expo sunucusunu yeniden aç.</p><p>Kaynak sayfasındaki lisans ve indirilen MP3 kontrol edilir. Kayıt indirilemiyorsa bu kanalda yapay ses oynatılmaz.</p><p>Okyanus: Luftrum · CC BY 4.0<br>Odun ateşi: BonnyOrbit · CC0</p></div>`,'audio-install');return true;}
 if(name==='toggle-channel'&&missingRecording054(el.dataset.channel)){return enhancedAction('recording-help054',el,e);}return actionAudio053(name,el,e);};
