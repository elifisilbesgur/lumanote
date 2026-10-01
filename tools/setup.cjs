'use strict';
const fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),pkgFile=path.join(root,'package.json'),stateDir=path.join(root,'.luma');
process.chdir(root);
function run(command,args){const r=cp.spawnSync(command,args,{cwd:root,stdio:'inherit',env:process.env});if(r.error)throw r.error;if(r.status!==0)throw new Error(command+' başarısız ('+r.status+'). Eski proje değiştirilmedi.');}
function installed(){try{return JSON.parse(fs.readFileSync(path.join(root,'node_modules/expo/package.json'))).version.startsWith('57.');}catch{return false;}}
const extras=['@react-native-async-storage/async-storage','expo-audio','expo-document-picker','expo-file-system','expo-image-picker','expo-keep-awake','expo-notifications','expo-sharing','expo-status-bar','expo-crypto','expo-screen-orientation','react-native-safe-area-context','react-native-webview','babel-preset-expo'];
function checkImports(){const {createRequire}=require('module');const req=createRequire(pkgFile);for(const k of [...extras,'@noble/hashes/pbkdf2','@noble/hashes/sha256','buffer/','pdf-lib','pdfjs-dist/package.json'])req.resolve(k);if(!installed())throw new Error('Bu proje Expo 57 için hazırlandı. SDK değişimi otomatik yapılmaz.');}
async function main(){fs.mkdirSync(stateDir,{recursive:true});const marker=path.join(stateDir,'setup-05.json');let complete=fs.existsSync(marker);try{if(complete)checkImports();}catch{complete=false;}
 if(!complete){console.log('\nGerekli paketler bu yeni klasöre kuruluyor. Eski projenin node_modules klasörüne dokunulmaz.');run('npm',['install']);if(!installed())throw new Error('Expo 57 kurulumu doğrulanamadı.');run(process.execPath,['node_modules/expo/bin/cli','install',...extras,'--npm']);run(process.execPath,['node_modules/expo/bin/cli','install','--fix','--npm']);checkImports();
  console.log('Atölye sesleri pakette hazır; harici ses indirmesi yapılmıyor.');
  fs.writeFileSync(marker,JSON.stringify({build:'LUMA-0.5.7-HOME-GREENHOUSE',createdAt:new Date().toISOString(),node:process.version},null,2));
 }
 run(process.execPath,['tools/build-ui.cjs']);run(process.execPath,['tools/verify.cjs']);console.log('\nTam proje: '+root+'\nLUMA-0.5.7-HOME-GREENHOUSE\nBu Terminal penceresindeki yeni QR kodunu okut.\n');
 const args=['node_modules/expo/bin/cli','start','--go','--clear','--port',process.env.LUMA_PORT||'8098'];if(process.env.LUMA_TUNNEL==='1')args.push('--tunnel');run(process.execPath,args);
}
main().catch(e=>{console.error('\nDURDU: '+e.message+'\nProje klasörünü veya Expo Go verilerini silme. Bu çıktıyı paylaş.');process.exitCode=1;});
