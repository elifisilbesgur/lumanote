/* Keep existing audio keys so saved mixes and slider volumes survive. Only the
 * three arrangements change; their scores, meters and rendered audio files are distinct. */
Object.assign(PIANO_TRACKS056,{pianoMoon:'Gece Notları',pianoDawn:'Sabah Valsi',pianoSakura:'Camdaki Damlalar'});
Object.assign(soundNames,{pianoMoon:'Piyano · Gece Notları',pianoDawn:'Piyano · Sabah Valsi',pianoSakura:'Piyano · Camdaki Damlalar'});
const PIANO_DETAIL057={pianoMoon:'Yavaş · 48 BPM · 4/4 · D minör',pianoDawn:'Canlı vals · 108 BPM · 3/4 · G majör',pianoSakura:'Aralıklı melodi · 84 BPM · 6/8 · Pentatonik'};
const mixerBefore057=mixerSheet;
mixerSheet=function(){mixerBefore057();for(const b of $$('.piano-choices056 [data-track]')){const d=PIANO_DETAIL057[b.dataset.track];if(d){const sub=document.createElement('small');sub.className='piano-style057';sub.textContent=d;b.append(sub);}}
 const active=activePiano056(),p=$('.piano-panel056 .sound-row .muted');if(p&&PIANO_DETAIL057[active])p.textContent=PIANO_DETAIL057[active]+' · özgün sentez piyano';};
