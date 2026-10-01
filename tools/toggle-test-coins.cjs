'use strict';
// Update only the removable test-wallet switch for an already installed 0.5.6.
const fs=require('fs'),path=require('path'),cp=require('child_process'),os=require('os');
const root=path.resolve(__dirname,'..'),mode=process.argv[2];
function ok(v,m){if(!v)throw Error(m);}
function run(exe,args,cwd=root){const r=cp.spawnSync(exe,args,{cwd,stdio:'inherit'});if(r.error)throw r.error;ok(r.status===0,exe+' başarısız.');}
try{
 ok(['ac','kapat'].includes(mode),'Kullanım: TEST_JETONLARI.command ac veya kapat');
 const file=path.join(root,'tools/ui/test-coins.js');ok(fs.realpathSync(root)===root&&!fs.lstatSync(file).isSymbolicLink(),'Gerçek dosya yolu gerekli.');
 const old=fs.readFileSync(file,'utf8');ok(/const LUMA_TEST_COINS_SWITCH = (true|false);/.test(old)&&old.includes("const TEST_COINS_AMOUNT = 100000000;"),'Test jetonu kaynak biçimi beklenenden farklı.');
 const desired=mode==='ac'?'true':'false';
 if(old.includes('LUMA_TEST_COINS_SWITCH = '+desired)){console.log('Test jetonu ayarı zaten '+mode+'.');}
 else{
  const dir=path.join(os.homedir(),'Desktop/LumaNote_Yedekleri');fs.mkdirSync(dir,{recursive:true});ok(fs.realpathSync(dir)===dir,'Yedek yolu gerçek bir dizin olmalı.');const backup=path.join(dir,'LumaNote_056_test_ayari_'+Date.now()+'.zip');
  run('zip',['-qry',backup,path.basename(root),'-x','*/node_modules/*','*/.expo/*','*/.git/*','*/.DS_Store'],path.dirname(root));run('unzip',['-tq',backup]);
  const generated=['ONIZLEME.html','nocturne/UI_HTML.ts','nocturne/AudioAssets.ts','licenses/Audio-Included.json'];
  const prior=generated.map(rel=>[rel,fs.existsSync(path.join(root,rel))?fs.readFileSync(path.join(root,rel)):null]);
  try{fs.writeFileSync(file,old.replace(/LUMA_TEST_COINS_SWITCH = (true|false)/,'LUMA_TEST_COINS_SWITCH = '+desired));run(process.execPath,['tools/build-ui.cjs']);run(process.execPath,['tools/verify.cjs']);}
  catch(e){fs.writeFileSync(file,old);for(const [rel,b]of prior){const f=path.join(root,rel);if(b===null){if(fs.existsSync(f))fs.unlinkSync(f);}else fs.writeFileSync(f,b);}throw e;}
 }
 console.log(mode==='ac'?'Sonraki geliştirme açılışında test bütçesi etkin olur. Yeni çalışma süresi eklenmez.':'Sonraki açılışta test bütçesi ve testle alınan ürünler temizlenir. Notlar ve gerçek çalışma kayıtları korunur.');
}catch(e){console.error('DURDU: '+e.message);process.exitCode=1;}
