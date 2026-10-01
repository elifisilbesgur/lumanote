'use strict';
// Download only publicly playable previews, with licence/source provenance.
// No account credentials, API keys, arbitrary URLs or login bypass.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),out=path.join(root,'assets/recordings');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const catalog=[
 {key:'rain',id:412424,author:'DBlover',title:'Rain on concrete sound',page:'https://freesound.org/people/DBlover/sounds/412424/',license:'CC0 1.0',licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/'},
 {key:'ocean',id:48412,author:'Luftrum',title:'oceanwavescrushing.wav',page:'https://freesound.org/people/Luftrum/sounds/48412/',license:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/'},
 {key:'fire',id:484337,author:'BonnyOrbit',title:'Fireplace.wav',page:'https://freesound.org/people/BonnyOrbit/sounds/484337/',license:'CC0 1.0',licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/'},
 {key:'piano',id:570347,author:'szegvari',title:'Late Jazz Piano.wav',page:'https://freesound.org/people/szegvari/sounds/570347/',license:'CC0 1.0',licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/'}
];

function allowedURL(url){const u=new URL(url);if(u.protocol!=='https:'||!['freesound.org','cdn.freesound.org'].includes(u.hostname)||u.username||u.password||u.port)throw new Error('Beklenmeyen indirme sunucusu');return u;}
async function fetchLimited(url,limit,redirects=0){allowedURL(url);const response=await fetch(url,{signal:AbortSignal.timeout(18000),redirect:'manual',headers:{'User-Agent':'LumaNote-Local-Setup/0.5.4','Accept':'*/*'}});
 if([301,302,303,307,308].includes(response.status)){if(redirects>=3)throw new Error('Çok fazla yönlendirme');return fetchLimited(new URL(response.headers.get('location'),url).href,limit,redirects+1);}
 if(!response.ok)throw new Error('HTTP '+response.status);if(Number(response.headers.get('content-length'))>limit)throw new Error('Dosya çok büyük');const chunks=[];let n=0;for await(const chunk of response.body){n+=chunk.length;if(n>limit)throw new Error('Boyut sınırı');chunks.push(Buffer.from(chunk));}return Buffer.concat(chunks);
}
function decodeHTML(s){return s.replace(/\\u002[fF]/g,'/').replace(/\\\//g,'/').replace(/&amp;/g,'&').replace(/&quot;|&#34;/g,'"').replace(/&#39;|&apos;/g,"'");}
function extractPreview(html,item){const clean=decodeHTML(html),path=item.licenseUrl.replace(/^https?:\/\//,'').replace(/\/$/,'');if(!clean.includes(path))throw new Error('Lisans doğrulanamadı; dosya indirilmedi.');
 const candidates=[...clean.matchAll(/(?:https?:)?\/\/(?:cdn\.)?freesound\.org\/(?:data\/)?previews\/\d+\/\d+_\d+-hq\.mp3/g)].map(m=>m[0]);
 // Some source pages emit local, rather than absolute media paths.
 for(const m of clean.matchAll(/["'\s](\/(?:data\/)?previews\/\d+\/\d+_\d+-hq\.mp3)/g))candidates.push('https://freesound.org'+m[1]);
 const found=candidates.map(u=>u.startsWith('//')?'https:'+u:u.replace(/^http:/,'https:')).find(u=>new URL(u).pathname.includes('/'+item.id+'_'));if(!found)throw new Error('Herkese açık MP3 önizlemesi sayfada bulunamadı.');allowedURL(found);return found;
}
function isMP3(bytes){if(bytes.length<10000)return false;if(bytes.toString('ascii',0,3)==='ID3')return true;return bytes[0]===255&&(bytes[1]&224)===224;}
function noLinks(folder){let current=path.parse(path.resolve(folder)).root;for(const part of path.resolve(folder).slice(current.length).split(path.sep)){current=path.join(current,part);if(fs.existsSync(current)&&fs.lstatSync(current).isSymbolicLink())throw new Error('Ses yolunda sembolik bağlantı kabul edilmez.');}}
function atomic(file,bytes){noLinks(file);fs.mkdirSync(path.dirname(file),{recursive:true});const tmp=file+'.'+process.pid+'.tmp';if(fs.existsSync(tmp))throw new Error('Geçici dosya zaten var.');fs.writeFileSync(tmp,bytes,{flag:'wx'});fs.renameSync(tmp,file);}
async function main(options={}){const destDir=options.out||out,fetcher=options.fetcher||fetchLimited,keys=options.keys||process.env.LUMA_AUDIO_KEYS?.split(',')||['ocean','fire'],log=options.log||console.log,warn=options.warn||console.warn;noLinks(destDir);fs.mkdirSync(destDir,{recursive:true});const manifest=path.join(destDir,'manifest.json');noLinks(manifest);let previous={};try{previous=JSON.parse(fs.readFileSync(manifest));}catch{}const results={};
 // Retain independently verified previous tracks; failures never replace them.
 for(const [key,value]of Object.entries(previous)){if(!catalog.some(c=>c.key===key))continue;const file=path.join(destDir,key+'.mp3');noLinks(file);if(fs.existsSync(file)&&isMP3(fs.readFileSync(file))&&sha(fs.readFileSync(file))===value.sha256)results[key]=value;}
 const missing=[];
 for(const item of catalog.filter(c=>keys.includes(c.key))){if(results[item.key]){log(item.key+': gerçek kayıt hazır ('+results[item.key].author+').');continue;}
  try{const html=(await fetcher(item.page,3*1024*1024)).toString('utf8'),url=extractPreview(html,item);let bytes;try{bytes=await fetcher(url,12*1024*1024);}catch(first){await new Promise(r=>setTimeout(r,700));bytes=await fetcher(url,12*1024*1024);}if(!isMP3(bytes))throw new Error('İndirilen dosya geçerli bir MP3 başlığı taşımıyor.');
   const record={...item,kind:'recording',download:url,downloadedAt:new Date().toISOString(),sha256:sha(bytes),note:'Public MP3 preview. Playback gain and loop crossfade adapted. The author does not endorse LumaNote.'};
   atomic(path.join(destDir,item.key+'.mp3'),bytes);results[item.key]=record;log(item.key+': GERÇEK KAYIT İNDİRİLDİ · '+item.author+' · '+item.license);
  }catch(e){missing.push(item.key);warn(item.key+': kayıt alınamadı: '+e.message);}}
 atomic(manifest,JSON.stringify(results,null,2));if(!options.out)atomic(path.join(root,'licenses/Downloaded-Audio.json'),JSON.stringify(results,null,2));
 if(missing.length)warn('Eksik gerçek kayıtlar: '+missing.join(', ')+'. Bu kanallar demo oynatmayacak. SESLERI_INDIR.command ile yeniden dene.');
 return {records:results,missing};
}
module.exports={main,catalog,fetchLimited,extractPreview,isMP3,allowedURL};if(require.main===module)main().then(result=>{if(result.missing.length)process.exitCode=2;}).catch(e=>{console.error(e);process.exitCode=1;});
