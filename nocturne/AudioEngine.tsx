import React,{useEffect,useMemo,useRef} from 'react';
import {useAudioPlayer,setAudioModeAsync} from 'expo-audio';
import {AudioAssets} from './AudioAssets';
import type {AudioSettings} from './types';
/** Allocate players only for audible channels. Idle screens make no periodic
 * audio-player calls. Loop crossfades remain local to the active tracks. */
function Track({source,volume,onError}:{source:number|{uri:string};volume:number;onError:(s:string)=>void}){
 const a=useAudioPlayer(source,{updateInterval:250}),b=useAudioPlayer(source,{updateInterval:250});
 const goal=useRef(volume),error=useRef(onError);goal.current=volume;error.current=onError;
 useEffect(()=>{
  let gone=false,failed=false,active=0,fadeStart=0,switching=false,gain=0;
  const players=[a,b],sent=[-1,-1];a.loop=b.loop=true;a.volume=b.volume=0;
  const setVolume=(i:number,value:number)=>{if(Math.abs(sent[i]-value)>.004){players[i].volume=value;sent[i]=value;}};
  const fail=(e:unknown)=>{if(gone||failed)return;failed=true;error.current(e instanceof Error?e.message:String(e));};
  const interval=setInterval(()=>{if(gone||failed)return;try{
   const p=players[active],q=players[1-active];if(!p.isLoaded)return;
   gain+=(goal.current-gain)*.4;if(Math.abs(goal.current-gain)<.003)gain=goal.current;
   if(!p.playing)p.play();
   if(!switching&&p.duration>6&&p.currentTime>=p.duration-1.65&&q.isLoaded){switching=true;fadeStart=0;setVolume(1-active,0);q.seekTo(0).then(()=>{if(!gone){q.play();fadeStart=Date.now();}}).catch(fail);}
   if(switching&&fadeStart){const mix=Math.min(1,(Date.now()-fadeStart)/1500);setVolume(active,gain*Math.cos(mix*Math.PI/2));setVolume(1-active,gain*Math.sin(mix*Math.PI/2));if(mix>=1){p.pause();active=1-active;switching=false;fadeStart=0;}}
   else setVolume(active,gain);
  }catch(e){fail(e);}},150);
  return()=>{gone=true;clearInterval(interval);try{a.pause();b.pause();}catch{/* useAudioPlayer releases players on unmount */}};
 },[a,b]);return null;
}
export function AudioEngine({settings,onError}:{settings:AudioSettings;onError:(s:string)=>void}){
 const err=useRef(onError);err.current=onError;
 useEffect(()=>{setAudioModeAsync({playsInSilentMode:true,shouldPlayInBackground:false,allowsRecording:false,interruptionMode:'mixWithOthers'}).catch(e=>err.current(String(e?.message||e)));},[]);
 const custom=useMemo(()=>settings.customAudio?{uri:settings.customAudio.uri}:null,[settings.customAudio?.uri]);
 const sum=Object.entries(settings.volumes).filter(([k])=>k!=='cafe'||custom).reduce((s,[,v])=>s+v,0),gain=100/Math.max(100,sum);
 if(!settings.playing)return null;
 return <>{Object.entries(AudioAssets).filter(([key])=>(settings.volumes[key]||0)>0).map(([key,source])=><Track key={key} source={source} volume={(settings.volumes[key]||0)/100*gain*.65} onError={onError}/>)}{custom&&(settings.volumes.cafe||0)>0?<Track key={custom.uri} source={custom} volume={settings.volumes.cafe/100*gain*.65} onError={onError}/>:null}</>;
}
