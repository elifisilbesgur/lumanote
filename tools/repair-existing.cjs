'use strict';
/** Install the cumulative Home & Greenhouse package into known Living Garden sources. No npm changes, no
 * downloaded audio changes, no user data writes. Verify backup before mutation.
 * Keep the existing test-wallet switch; know both versions of the 0.5.4 addon. */
const fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),BUILD='LUMA-0.5.7-HOME-GREENHOUSE';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function ok(x,m){if(!x)throw Error(m);}
function safe(base,rel){ok(!path.isAbsolute(rel)&&rel.split('/').every(s=>s&&s!=='.'&&s!=='..'),'Güvensiz yol: '+rel);let f=base;for(const s of rel.split('/')){f=path.join(f,s);try{ok(!fs.lstatSync(f).isSymbolicLink(),'Sembolik bağlantı kabul edilmedi: '+f);}catch(e){if(e.code!=='ENOENT')throw e;}}return f;}
function run(exe,args,cwd){const p=cp.spawnSync(exe,args,{cwd,encoding:'utf8',maxBuffer:32*1024*1024});if(p.stdout)process.stdout.write(p.stdout);if(p.stderr)process.stderr.write(p.stderr);if(p.error)throw p.error;ok(p.status===0,exe+' tamamlanamadı ('+p.status+').');}
function atomic(file,data){fs.mkdirSync(path.dirname(file),{recursive:true});const tmp=file+'.luma057-'+process.pid;try{fs.writeFileSync(tmp,data,{flag:'wx'});fs.renameSync(tmp,file);}finally{if(fs.existsSync(tmp))fs.unlinkSync(tmp);}}
function repair(target){
 target=path.resolve(target);ok(target!==root,'Bu klasör tam projenin kendisi. BASLAT.command ile açılır; güncelleyici mevcut çalışma klasörüne uygulanır.');
 ok(fs.existsSync(target)&&fs.realpathSync(target)===target,'Mevcut proje bulunamadı veya gerçek yol değil: '+target);
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'docs/repair-057.json'),'utf8'));
 ok(manifest.build===BUILD,'Paket sürümü uyuşmuyor.');
 const pkgFile=safe(target,'package.json'),appFile=safe(target,'app.json'),pkg=JSON.parse(fs.readFileSync(pkgFile)),app=JSON.parse(fs.readFileSync(appFile));
 ok(pkg.name==='lumanote-yasayan-bahce'&&pkg.main==='index.js','Bu hedef Yaşayan Bahçe projesi değil.');
 ok(String(pkg.dependencies?.expo||'').includes('57.'),'Bu paket mevcut Expo 57 projesi içindir; SDK değiştirilmedi.');
 ok(app.expo&&typeof app.expo.slug==='string','Uygulama kimliği okunamadı.');
 const versionFile=safe(target,'tools/ui/living-model.js');ok(/LUMA-0\.5(?:\.[3-7])?-/.test(fs.readFileSync(versionFile,'utf8')),'Bilinen Yaşayan Bahçe 0.5–0.5.7 kaynakları bulunamadı; üzerine yazılmadı.');
 for(const name of ['App.js','App.jsx','index.ts','app.config.js','app.config.ts'])ok(!fs.existsSync(path.join(target,name)),'Başlangıç çakışması: '+name);
 const allowed=/^(?:tools\/ui\/[a-z0-9.-]+|tools\/(?:build-ui|verify|setup|toggle-test-coins)\.cjs|tools\/(?:generate-atelier-audio|generate-piano-057|generate-haven-art)\.py|nocturne\/(?:NativeServices|AudioEngine|NobleCrypto|BackupCrypto|types)\.tsx?|assets\/atelier\/(?:ocean|fire|pianoMoon|pianoDawn|pianoSakura)\.mp3|assets\/atelier\/(?:manifest|pianoMoon-score057|pianoDawn-score057|pianoSakura-score057)\.json|licenses\/(?:Atelier-Audio-056|Home-Greenhouse-057)\.md|App\.tsx|index\.js|metro\.config\.js|BASLAT\.command|TEST_JETONLARI\.command|README_TR\.md)$/;
 ok(Array.isArray(manifest.files)&&new Set(manifest.files.map(e=>e.path)).size===manifest.files.length,'Manifest dosya listesi geçersiz.');
 for(const e of manifest.files){ok(allowed.test(e.path),'İzin verilmeyen manifest yolu: '+e.path);ok(hash(fs.readFileSync(safe(root,e.path)))===e.newSha256,'Paket dosyası değiştirilmiş: '+e.path);
  const f=safe(target,e.path);if(fs.existsSync(f)){ok([e.newSha256,...e.allowedOldSha256].includes(hash(fs.readFileSync(f))),'Beklenmeyen kişisel kod değişikliği: '+e.path+'\nÜzerine yazılmadı. Çalışan projenin geliştirme ZIP kopyası gerekli.');}else ok(e.mayBeMissing,'Beklenen dosya yok: '+e.path);
 }
 const generated=['ONIZLEME.html','nocturne/UI_HTML.ts','nocturne/AudioAssets.ts','licenses/Audio-Included.json'];
 for(const f of generated)safe(target,f);
 const lock=safe(target,'.luma057-install-lock');ok(!fs.existsSync(lock),'Başka güncelleme çalışıyor veya kilit kalmış. İncelemeden devam edilmedi.');fs.mkdirSync(lock);
 let backup;
 try{
  const dir=path.join(os.homedir(),'Desktop/LumaNote_Yedekleri');fs.mkdirSync(dir,{recursive:true});ok(fs.realpathSync(dir)===dir,'Yedek dizini gerçek yol olmalı.');
  backup=path.join(dir,'LumaNote_057_oncesi_'+new Date().toISOString().replace(/[:.]/g,'-')+'_'+process.pid+'.zip');
  console.log('Önce mevcut proje kodu yedekleniyor…');
  run('zip',['-qry',backup,path.basename(target),'-x','*/node_modules/*','*/.expo/*','*/.git/*','*/.luma/diagnostic-export/*','*/.DS_Store','*/.luma057-install-lock/*'],path.dirname(target));
  run('unzip',['-tq',backup],target);console.log('KOD YEDEĞİ DOĞRULANDI: '+backup+'\nBu arşiv telefon verilerini içermez; özel yapılandırmalar içerebilir.');
  const changed=[...manifest.files.map(e=>e.path),'package.json','app.json',...generated];
  const prior=new Map(changed.map(rel=>{const f=safe(target,rel);return [rel,fs.existsSync(f)?fs.readFileSync(f):null];}));
  try{
   for(const e of manifest.files){const f=safe(target,e.path);if(e.preserveExisting&&fs.existsSync(f))continue;atomic(f,fs.readFileSync(safe(root,e.path)));}
   // Preserve exact dependencies, package version/lock agreement and project IDs.
   pkg.lumaNocturne={...(pkg.lumaNocturne||{}),build:BUILD,repair:'0.5.7'};app.expo.extra={...(app.expo.extra||{}),lumaNocturneBuild:BUILD};
   atomic(pkgFile,JSON.stringify(pkg,null,2)+'\n');atomic(appFile,JSON.stringify(app,null,2)+'\n');
   run(process.execPath,['tools/build-ui.cjs'],target);run(process.execPath,['tools/verify.cjs'],target);
  }catch(e){for(const [rel,data]of prior){const f=path.join(target,rel);if(data===null){if(fs.existsSync(f))fs.unlinkSync(f);}else atomic(f,data);}throw Error('Güncelleme geri alındı: '+e.message+'\nKod yedeği: '+backup);}
  const active=fs.readFileSync(path.join(target,'tools/ui/test-coins.js'),'utf8').includes('LUMA_TEST_COINS_SWITCH = true');
  console.log('\nTAMAMLANDI: '+BUILD+'\nProje: '+target+'\nTest jetonu ayarı: '+(active?'AÇIK (mevcut ayar korundu)':'KAPALI')+'\nKurulu paketler, eski ses kayıtları ve kişisel veriler korunur. Yeni odalar ve üç farklı piyano parçası eklendi.');return {backup,target,active};
 }finally{fs.rmdirSync(lock);}
}
module.exports={repair,hash};
if(require.main===module){try{repair(process.argv[2]||path.join(os.homedir(),'Desktop/LumaNote_Yasayan_Bahce'));}catch(e){console.error('\nDURDU: '+e.message);process.exitCode=1;}}
