'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript');
const root=path.resolve(__dirname,'../..'),out=[];
function ck(name,ok){out.push({name,passed:!!ok});console.log((ok?'PASS ':'FAIL ')+name);}
const configCode=fs.readFileSync(path.join(root,'metro.config.js'),'utf8');
let exportsEnabled=true;const cfg={resolver:{unstable_enablePackageExports:true}};
const context={module:{exports:{}},require:n=>n==='expo/metro-config'?{getDefaultConfig:()=>cfg}:require(n),__dirname:root};vm.runInNewContext(configCode,context);
const resolver=context.module.exports.resolver.resolveRequest;
const ctx={originModulePath:'/app/node_modules/@noble/hashes/utils.js',resolveRequest:(_,name,p)=>({type:'fallback',name,p})};
for(const name of ['@noble/hashes/crypto','@noble/hashes/crypto.js','./crypto.js','/app/node_modules/@noble/hashes/crypto.js','/app/node_modules/@noble/hashes/esm/crypto.js']){
 for(const platform of ['ios','android'])ck('scoped crypto resolver '+platform+' '+name,resolver(ctx,name,platform).filePath===path.join(root,'nocturne/NobleCrypto.ts'));
}
ck('package exports remain enabled',cfg.resolver.unstable_enablePackageExports===true);
ck('web resolution unaffected',resolver(ctx,'@noble/hashes/crypto.js','web').type==='fallback');
ck('other dependencies unaffected',resolver(ctx,'expo-crypto','ios').type==='fallback');
ck('unrelated crypto.js import not redirected',resolver({...ctx,originModulePath:'/app/elsewhere.js'},'./crypto.js','ios').type==='fallback');
const native=[];function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory()&&e.name!=='node_modules')walk(p);else if(/\.tsx?$/.test(e.name)&&e.name!=='UI_HTML.ts')native.push(p);}}walk(path.join(root,'nocturne'));native.push(path.join(root,'App.tsx'));
for(const f of native){const result=ts.transpileModule(fs.readFileSync(f,'utf8'),{fileName:f,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React}});ck('TS syntax '+path.basename(f),!result.diagnostics?.some(d=>d.category===ts.DiagnosticCategory.Error));}
const pure=fs.readFileSync(path.join(root,'nocturne/NobleCrypto.ts'),'utf8');ck('crypto provider uses native secure getRandomValues',pure.includes("from 'expo-crypto'")&&pure.includes('getRandomValues')&&!/Math\.random\s*\(/.test(pure));
const assets=fs.readFileSync(path.join(root,'nocturne/AudioEngine.tsx'),'utf8');
const effects=[],React={createElement:(type,props,...children)=>({type,props,children}),Fragment:'fragment',useRef:v=>({current:v}),useMemo:fn=>fn(),useEffect:fn=>effects.push(fn)};
React.default=React;
const compiled=ts.transpileModule(assets,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React}}).outputText;
const m={exports:{}};vm.runInNewContext(compiled,{exports:m.exports,module:m,require:n=>n==='react'?React:n==='expo-audio'?{setAudioModeAsync:()=>Promise.resolve()}:n==='./AudioAssets'?{AudioAssets:{rain:1,ocean:2,fire:3,brown:4,piano:5}}:{},console,setInterval,clearInterval,Date,Math});
const Engine=m.exports.AudioEngine;
ck('idle audio mounts no track players',Engine({settings:{playing:false,volumes:{rain:80,ocean:0,piano:0}},onError:()=>{}})===null);
function countTracks(node){if(!node)return 0;if(Array.isArray(node))return node.reduce((s,n)=>s+countTracks(n),0);if(typeof node.type==='function')return 1;return countTracks(node.children);}
ck('one audible channel mounts only one track',countTracks(Engine({settings:{playing:true,volumes:{rain:80,ocean:0,piano:0}},onError:()=>{}}))===1);
ck('two audible channels mount two tracks',countTracks(Engine({settings:{playing:true,volumes:{rain:80,piano:15,fire:0}},onError:()=>{}}))===2);
ck('native UI omits duplicated base64 audio',fs.readFileSync(path.join(root,'nocturne/UI_HTML.ts'),'utf8').includes('window.LUMA_AUDIO_DATA=null;'));
const base=path.join(root,'../../luma053_work/base/LumaNote_Yasayan_Bahce/nocturne/BackupCrypto.ts');
ck('encryption algorithm source unchanged',require('crypto').createHash('sha256').update(fs.readFileSync(path.join(root,'nocturne/BackupCrypto.ts'))).digest('hex')==='e80f066c34b42dcbb9a8636842e97bbe2f8c70bdc4386c566a48204d98ebffdd');
fs.writeFileSync(path.join(__dirname,'native-source-results.json'),JSON.stringify(out,null,2));
console.log('RESULT',out.filter(x=>x.passed).length,'/',out.length);if(out.some(x=>!x.passed))process.exitCode=1;
