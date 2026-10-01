'use strict';
// Source/package integrity, not a claim of native device testing.
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
let checks=0;function assert(ok,msg){checks++;if(!ok)throw new Error(msg);}
const pkg=JSON.parse(read('package.json')),app=JSON.parse(read('app.json')).expo;
assert(pkg.name==='lumanote-yasayan-bahce'&&pkg.main==='index.js','Bu başlatıcı yalnızca tam 0.5 projesi içindir.');
assert(app.extra.lumaNocturneBuild==='LUMA-0.5.7-HOME-GREENHOUSE','Sürüm etiketi farklı.');
assert(/import App from ['"]\.\/App['"]/.test(read('index.js')),'Giriş dosyası hatalı.');
assert(read('App.tsx').includes("from './nocturne/UI_HTML'"),'Arayüz başlangıcı hatalı.');
const prefix='export const UI_HTML: string = ',gen=read('nocturne/UI_HTML.ts');
const embedded=JSON.parse(gen.slice(gen.indexOf(prefix)+prefix.length).trim().replace(/;$/,''));
const withoutAudio = s => s.replace(/window\.LUMA_AUDIO_DATA=(?:\{[^;]*\}|null);/, 'window.LUMA_AUDIO_DATA=null;');
assert(withoutAudio(embedded)===withoutAudio(read('ONIZLEME.html')),'Telefon ve önizleme arayüzleri farklı.');
assert(embedded.includes('window.LUMA_AUDIO_DATA=null;'),'Native ses verisi iki kez gömülmemeli.');
const files=fs.readdirSync(path.join(root,'tools/ui')).filter(x=>x.endsWith('.js'));
for(const f of files)new vm.Script(read('tools/ui/'+f),{filename:f});
for(const k of ['LUMA-0.5.7-HOME-GREENHOUSE','class LivingGarden','coinCelebration','STUDY_METHODS','note-fab05','readDocument','purchaseAtmosphere054','beginNoteSelection054','constrainPlacement054','writing-panel054','effectiveVolumes054','SAKURA_CATALOG055','SAKURA_ART055','sakura-place055','jpKoiPond','jpMatchaSet','ANATOLIA056','memories056','AtelierGarden056','PIANO_TRACKS056','LUX_LAVA_FRAGMENT056','HomeGarden057','rooms057','WINTER057','HALLOWEEN057','FURNITURE057','PIANO_DETAIL057'])assert(embedded.includes(k),'Eksik kaynak: '+k);
for(const k of ['rain','ocean','brown','fire','piano','pianoMoon','pianoDawn','pianoSakura']){const match=read('nocturne/AudioAssets.ts').match(new RegExp(k+':require\\("([^\"]+)"\\)'));assert(!!match,'Ses kaynağı bulunamadı: '+k);if(match)assert(fs.statSync(path.resolve(root,'nocturne',match[1])).size>1000,'Ses dosyası boş: '+k);}
const audioManifest=JSON.parse(read('assets/atelier/manifest.json'));for(const [key,m]of Object.entries(audioManifest)){assert(require('crypto').createHash('sha256').update(fs.readFileSync(path.join(root,'assets/atelier',key+'.mp3'))).digest('hex')===m.sha256,'Ses bütünlüğü farklı: '+key);}
assert(read('babel.config.js').includes('babel-preset-expo'),'Expo Babel yapılandırması bulunamadı.');
for(const f of ['App.js','App.jsx','index.ts','app.config.js','app.config.ts'])assert(!fs.existsSync(path.join(root,f)),'Eski giriş çakışması: '+f);
assert(!read('App.tsx').includes('expo-router'),'Yanlış başlangıç yönlendiricisi.');
const fonts=[];function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(['node_modules','.git','.expo','.luma'].includes(e.name))continue;const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(/\.(ttf|otf|woff2?|eot)$/i.test(e.name))fonts.push(p);}}walk(root);assert(fonts.length===0,'Paylaşılacak kaynakta font dosyası bulunmamalı.');
console.log(`DOĞRULANDI: LUMA-0.5.7-HOME-GREENHOUSE · ${checks} kaynak kontrolü`);
console.log('index.js → App.tsx → nocturne/UI_HTML.ts. Gerçek cihaz testi ayrı yapılır.');
