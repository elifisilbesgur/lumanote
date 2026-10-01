'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),ui=path.join(root,'tools/ui');
const files=['core.js','world.js','sprites.js','lava.js','scenes.js','screens.js','world-ui.js','editor.js','editor-v04.js','planner.js','focus.js','weekly.js','backup.js','enhancements.js','browser.js','living-model.js','living-garden.js','living-focus.js','living-notes.js','living-pdf.js','living-audio.js','living-shell.js','stable-garden.js','stable-shell.js','stable-focus.js','polish-model.js','polish-art.js','polish-notes.js','polish-garden.js','polish-shell.js','polish-audio.js','sakura-collection.js','sakura-art.js','sakura-garden.js','atelier-model.js','atelier-art.js','atelier-garden.js','atelier-themes.js','atelier-audio.js','haven-model.js','haven-art.js','haven-garden.js','haven-shell.js','haven-audio.js','events.js'];
// LUMA-CC0-AUDIO-1: only explicitly selected CC0 files override existing tracks.
if(fs.existsSync(path.join(ui,'cc0-audio.js')))files.splice(files.length-1,0,'cc0-audio.js');
// Existing test wallet stays last; its own switch and native __DEV__ gate still apply.
if(fs.existsSync(path.join(ui,'test-coins.js')))files.splice(files.length-1,0,'test-coins.js');
const main=files.map(f=>'\n/* '+f+' */\n'+fs.readFileSync(path.join(ui,f),'utf8')).join('\n');new vm.Script(main,{filename:'lumanote-ui.js'});
const js=path.join(root,'node_modules/pdfjs-dist/build/pdf.mjs'),worker=path.join(root,'node_modules/pdfjs-dist/build/pdf.worker.mjs'),lib=path.join(root,'node_modules/pdf-lib/dist/pdf-lib.min.js');
let vendor='';if([js,worker,lib].every(fs.existsSync)){vendor+='window.LUMA_PDF_MODULE='+JSON.stringify(fs.readFileSync(js,'utf8'))+';\nwindow.LUMA_PDF_WORKER='+JSON.stringify(fs.readFileSync(worker,'utf8'))+';\n'+fs.readFileSync(lib,'utf8')+';\n';}else console.warn('PDF kitaplıkları yok: önizleme hata mesajı gösterecek; npm kurulumu sonrası yeniden üretilecek.');
let manifest={};try{manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/recordings/manifest.json'),'utf8'));}catch{}
const cc0File=path.join(root,'assets/cc0/manifest.json');
const cc0=fs.existsSync(cc0File)?JSON.parse(fs.readFileSync(cc0File,'utf8')):{};
const cc0Allowed=['ocean','fire','pianoDawn','pianoSakura'];
for(const key of Object.keys(cc0))if(!cc0Allowed.includes(key))throw Error('CC0 seçimi izin verilmeyen kanala dokunuyor: '+key);
const meta={},data={},sources={};
let generated={};try{generated=JSON.parse(fs.readFileSync(path.join(root,'assets/atelier/manifest.json'),'utf8'));}catch{}
for(const key of ['rain','ocean','brown','fire','piano','pianoMoon','pianoDawn','pianoSakura']){
 const own=generated[key],ownPath=own&&path.join(root,'assets/atelier',key+'.mp3');
 const ownValid=ownPath&&fs.existsSync(ownPath)&&crypto.createHash('sha256').update(fs.readFileSync(ownPath)).digest('hex')===own.sha256;
 const actual=path.join(root,'assets/recordings',key+'.mp3');
 const recorded=!!manifest[key]&&fs.existsSync(actual)&&crypto.createHash('sha256').update(fs.readFileSync(actual)).digest('hex')===manifest[key].sha256;
 const selected=cc0[key];
 if(selected){const file=path.join(root,'assets/cc0',key+'.mp3');if(selected.license!=='CC0 1.0'||selected.licenseUrl!=='https://creativecommons.org/publicdomain/zero/1.0/'||!fs.existsSync(file)||crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')!==selected.sha256)throw Error('CC0 kaydı doğrulanamadı: '+key+'. Eski senteze sessizce dönülmedi.');}
 const rel=selected?'assets/cc0/'+key+'.mp3':ownValid?'assets/atelier/'+key+'.mp3':recorded?'assets/recordings/'+key+'.mp3':'assets/nocturne/'+key+'.mp3';
 sources[key]=rel;meta[key]=selected?{...selected,kind:'recording'}:ownValid?{...own,kind:'procedural'}:recorded?{...manifest[key],kind:'recording'}:{kind:'synth',author:'LumaNote',title:key==='piano'?'Küçük Bahçe · özgün sentez arpej':'Özgün sentez '+key,license:'Original project-generated synthesis; no third-party samples'};
 if(fs.existsSync(path.join(root,rel)))data[key]=fs.readFileSync(path.join(root,rel)).toString('base64');
 else throw Error('Paketlenmiş ses eksik: '+rel);
}
vendor+='window.LUMA_AUDIO_DATA='+JSON.stringify(data)+';window.LUMA_AUDIO_META='+JSON.stringify(meta)+';\n';
let html=fs.readFileSync(path.join(ui,'index.html'),'utf8');html=html.replace('/*__CSS__*/',()=>['style.css','style-v04.css','living.css','stable.css','polish.css','sakura.css','atelier.css','haven.css'].map(f=>fs.readFileSync(path.join(ui,f),'utf8')).join('\n'));html=html.replace('/*__JS__*/',()=> (vendor+main).replace(/<\/script/gi,'<\\/script'));
fs.writeFileSync(path.join(root,'ONIZLEME.html'),html);const nativeHtml=html.replace('window.LUMA_AUDIO_DATA='+JSON.stringify(data)+';', 'window.LUMA_AUDIO_DATA=null;');fs.writeFileSync(path.join(root,'nocturne/UI_HTML.ts'),'// Generated from tools/ui; native audio stays in AudioAssets.\nexport const UI_HTML: string = '+JSON.stringify(nativeHtml)+';\n');
fs.writeFileSync(path.join(root,'nocturne/AudioAssets.ts'),'// Generated by tools/build-ui.cjs\nexport const AudioAssets={'+Object.entries(sources).map(([k,p])=>k+':require('+JSON.stringify('../'+p)+')').join(',')+'};\n');
fs.mkdirSync(path.join(root,'licenses'),{recursive:true});fs.writeFileSync(path.join(root,'licenses/Audio-Included.json'),JSON.stringify(meta,null,2));
console.log('Arayüz hazır: LUMA-0.5.7-HOME-GREENHOUSE · '+Math.round(html.length/1024)+' KB');
