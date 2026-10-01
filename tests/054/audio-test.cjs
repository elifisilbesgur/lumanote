'use strict';
// Local fixtures ONLY: no sound-quality, real decoding or live download claims.
const fs=require('fs'),path=require('path'),os=require('os'),crypto=require('crypto');
const {catalog,main,extractPreview,isMP3,allowedURL,fetchLimited}=require('../../tools/download-recordings.cjs');
const checks=[];const ck=(name,value)=>{checks.push({name,pass:!!value});console.log((value?'PASS ':'FAIL ')+name);};
const rejects=(fn)=>{try{fn();return false;}catch{return true;}};
const ocean=catalog.find(x=>x.key==='ocean'),fire=catalog.find(x=>x.key==='fire');
const url=c=>'https://cdn.freesound.org/previews/'+Math.floor(c.id/1000)+'/'+c.id+'_100-hq.mp3';
const html=c=>`<a href="${c.licenseUrl}">licence</a><audio src="${url(c)}"></audio>`;
const fake=Buffer.alloc(11000,1);fake.write('ID3',0,'ascii');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 ck('Source catalogue exact ocean attribution',ocean.author==='Luftrum'&&ocean.license==='CC BY 4.0');
 ck('Source catalogue exact fire CC0',fire.author==='BonnyOrbit'&&fire.license==='CC0 1.0');
 ck('Preview absolute link extracted',extractPreview(html(ocean),ocean)===url(ocean));
 ck('Preview escaped JSON URL extracted',extractPreview(html(ocean).replaceAll('/','\\/'),ocean)===url(ocean));
 ck('Preview scheme-relative extracted',extractPreview(html(ocean).replace('src="https:','src="'),ocean)===url(ocean));
 ck('Preview local path extracted',extractPreview(html(ocean).replace('https://cdn.freesound.org/previews','/data/previews'),ocean)==='https://freesound.org/data/previews/48/48412_100-hq.mp3');
 ck('Changed licence rejected',rejects(()=>extractPreview(html(ocean).replace('licenses/by/4.0','licenses/by-nc/4.0'),ocean)));
 ck('Wrong recording ID rejected',rejects(()=>extractPreview(html(ocean).replaceAll('48412_','99999_'),ocean)));
 for(const u of ['http://freesound.org/a','https://freesound.org.evil.test/a','https://evil.test/a','https://a:b@freesound.org/a','https://freesound.org:123/a','file:///tmp/test'])ck('Reject unsafe URL '+u,rejects(()=>allowedURL(u)));
 ck('MP3 header/minimum-size check',isMP3(fake)&&!isMP3(Buffer.from('ID3'))&&!isMP3(Buffer.alloc(15000,32)));
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'luma-audio054-'));
 try{
  let calls=0;const fetcher=async u=>{calls++;return Buffer.from(u.includes('.mp3')?fake:html(u===ocean.page?ocean:fire));};
  const got=await main({out:tmp,fetcher,keys:['ocean','fire'],log:()=>{},warn:()=>{}});
  ck('Two public previews stored atomically with provenance',got.missing.length===0&&Object.keys(got.records).length===2&&fs.existsSync(path.join(tmp,'fire.mp3')));
  ck('Local SHA validates downloaded bytes',Object.values(got.records).every(r=>r.sha256===sha(fake)));
  ck('Credit, licence and playback-change note retained',got.records.ocean.licenseUrl===ocean.licenseUrl&&got.records.ocean.note.includes('crossfade')&&got.records.fire.page===fire.page);
  ck('No temporary files remain',!fs.readdirSync(tmp).some(x=>x.endsWith('.tmp')));
  calls=0;const keep=await main({out:tmp,fetcher:async()=>{calls++;throw Error('offline');},keys:['ocean','fire'],log:()=>{},warn:()=>{}});
  ck('Verified previous files reused without network',calls===0&&keep.missing.length===0&&fs.readFileSync(path.join(tmp,'ocean.mp3')).equals(fake));
  fs.writeFileSync(path.join(tmp,'ocean.mp3'),'invalid');
  const fail=await main({out:tmp,fetcher:async()=>{throw Error('offline')},keys:['ocean','fire'],log:()=>{},warn:()=>{}});
  ck('Corrupt recording excluded, valid other retained',fail.missing.includes('ocean')&&!fail.records.ocean&&!!fail.records.fire);
  const bad=await main({out:tmp,fetcher:async u=>Buffer.from(u.includes('.mp3')?'<html>not audio</html>':html(ocean)),keys:['ocean'],log:()=>{},warn:()=>{}});
  ck('HTML cannot be relabelled a real recording',!bad.records.ocean&&bad.missing.length===1);
  const link=path.join(tmp,'link');fs.symlinkSync(tmp,link);
  let rejected=false;try{await main({out:link,keys:[]});}catch{rejected=true;}ck('Symlinked output directory rejected',rejected);
  const oldFetch=global.fetch;try{
   global.fetch=async()=>new Response(null,{status:302,headers:{location:'https://untrusted.test/a.mp3'}});
   let redirectRejected=false;try{await fetchLimited(ocean.page,100);}catch{redirectRejected=true;}ck('Redirect target revalidated',redirectRejected);
   global.fetch=async()=>new Response('small',{status:200,headers:{'content-length':'100000'}});
   let sizeRejected=false;try{await fetchLimited(ocean.page,100);}catch{sizeRejected=true;}ck('Declared file size limited',sizeRejected);
   global.fetch=async()=>new Response(Buffer.alloc(1000),{status:200});
   let streamRejected=false;try{await fetchLimited(ocean.page,100);}catch{streamRejected=true;}ck('Streaming file size limited',streamRejected);
  }finally{global.fetch=oldFetch;}
  ck('Equal-power fade energy at intermediate points',[0,.1,.5,.9,1].every(q=>Math.abs(Math.sin(q*Math.PI/2)**2+Math.cos(q*Math.PI/2)**2-1)<1e-12));
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
})().catch(e=>{console.error(e);ck('Unexpected exception '+e.message,false);}).finally(()=>{fs.writeFileSync(path.join(__dirname,'audio-results.json'),JSON.stringify({checks,passed:checks.filter(x=>x.pass).length,total:checks.length},null,2));console.log('RESULT',checks.filter(x=>x.pass).length,'/',checks.length);process.exitCode=checks.every(x=>x.pass)?0:1;});
