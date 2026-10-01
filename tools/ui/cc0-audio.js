/* LUMA-CC0-AUDIO-1. Only the last two piano slots change.
 * Stable channel keys preserve volumes, presets and the two liked piano tracks.
 * Scene/layout, notes, timers, wallets and rain assets are not edited here. */
const CC0_SLOTS = ['ocean','fire','pianoDawn','pianoSakura'];
for(const [key,name] of [['pianoDawn','Kadife Piyano'],['pianoSakura','Sakin Ezgi']]){
 const m=audioInfo(key);
 if(m.kind==='recording'&&m.license==='CC0 1.0'){
  PIANO_TRACKS056[key]=name;
  soundNames[key]='Piyano · '+name;
  PIANO_DETAIL057[key]=key==='pianoDawn'?'Sıcak stüdyo piyanosu · CC0':'Ambient stüdyo piyanosu · CC0';
 }
}
const mixerBeforeCC0=mixerSheet;
mixerSheet=function(){
 mixerBeforeCC0();
 for(const key of ['ocean','fire']){
  const m=audioInfo(key),row=$(`[data-action="toggle-channel"][data-channel="${key}"]`)?.closest('.sound-row');
  if(row&&m.kind==='recording'&&m.license==='CC0 1.0')row.querySelector('.muted').textContent='Saha kaydı · '+m.author+' · CC0';
 }
 const active=activePiano056(),m=audioInfo(active),desc=$('.piano-panel056 .sound-row .muted');
 if(desc&&['pianoDawn','pianoSakura'].includes(active)&&m.kind==='recording')desc.textContent='Stüdyo kaydı · '+m.author+' · CC0';
 for(const hint of $$('.sheet .hint'))if(hint.textContent.includes('Kıyı ve ateş'))hint.textContent='Kıyı ve ateş gerçek ortam kayıtlarıdır. Son iki piyano CC0 stüdyo parçalarıdır. İlk iki piyano ve yağmur korunur. Sesler ekran kilitlendiğinde durur.';
 const panel=$('.piano-panel056');if(panel)panel.dataset.audioEdition='CC0-AUDIO-1';
};
const actionBeforeCC0=enhancedAction;
enhancedAction=async function(name,el,e){
 if(name==='audio-credits'){
  sheet('Ses kaynakları',`<div class="reading-content"><p>Yeni kıyı ve şömine sesleri saha kayıtlarıdır. Son iki piyano, dijital müzik yazılımlarında hazırlanmış CC0 stüdyo parçalarıdır; akustik piyano icrası garantisi verilmez.</p>${Object.entries(window.LUMA_AUDIO_META||{}).map(([key,a])=>`<h3>${esc(soundNames[key]||key)}</h3><p>${esc(a.title||key)} · ${esc(a.author||'LumaNote')}<br>${a.kind==='recording'?'Kayıt · '+esc(a.license||'Kaynak lisansı'):a.kind==='procedural'?'Özgün ses tasarımı':'Özgün sentez'}</p>`).join('')}<p>İlk iki piyano kendi kaynaklarıyla korunur; bu güncelleme onların lisansını değiştirmez. CC0-AUDIO-1 kaynak listesi proje içindeki licenses/CC0-Audio-Selection.json dosyasındadır.</p></div>`,'audio-credits');
  return true;
 }
 return actionBeforeCC0(name,el,e);
};
