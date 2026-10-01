#!/usr/bin/env python3
"""Three original, compositionally distinct synthesized piano pieces.
No external recordings, samples, copied compositions or paid sound libraries.
Regenerates only three piano keys; never replaces existing ocean/fire recordings.
Requires NumPy, SciPy and ffmpeg. Generated MP3s are shipped, no user generation needed.
"""
from pathlib import Path
import json, math, hashlib, subprocess, tempfile
import numpy as np
from scipy import signal
from scipy.io import wavfile
R=Path(__file__).resolve().parents[1]; O=R/'assets/atelier'; SR=44100
rng=np.random.default_rng(570930); events=[]; cache={}
meta=json.loads((O/'manifest.json').read_text())
def tone(midi,style,gate):
 key=(midi,style,round(gate,2))
 if key in cache:return cache[key]
 f=440*2**((midi-69)/12);dur=min(6.7,gate+2.0);t=np.arange(int(SR*dur),dtype=np.float32)/SR;y=np.zeros(len(t),np.float32)
 damp={'nocturne':.82,'waltz':.31,'rain':.45}[style];brightness={'nocturne':1.65,'waltz':1.15,'rain':1.4}[style]
 B=.00002+max(0,midi-52)*.0000008
 for h in range(1,19):
  hz=f*h*math.sqrt(1+B*h*h)
  if hz>13000:break
  amp=np.exp(-h/15)/(h**brightness);decay=(1.6+max(0,65-midi)*.065)*damp/(1+h*.17)
  osc=np.sin(2*np.pi*hz*t)+.19*np.sin(2*np.pi*hz*1.0012*t+.14)+.14*np.sin(2*np.pi*hz*.9991*t-.1)
  y+=np.asarray(amp*osc*np.exp(-t/decay),np.float32)
 # Key lift genuinely damps staccato notes rather than playing the same long envelope.
 y*=np.minimum(t/.005,1)*np.exp(-np.maximum(0,t-gate)/(.35 if style=='nocturne' else .08))
 hammer=rng.normal(0,.012,len(t)).astype(np.float32)*np.exp(-t/.009);y+=hammer
 y/=max(.001,float(np.max(np.abs(y))));cache[key]=y;return y

def render(key,title,bpm,meter,style,bars,chords):
 beat=60/bpm;n=int((bars*meter*beat+4)*SR);x=np.zeros((n,2),np.float32);eventlog=[]
 def note(m,at,gate,vel):
  yy=tone(m,style,gate);idx=max(0,int((at+rng.uniform(-.006,.006))*SR));end=min(n,idx+len(yy))
  if end<=idx:return
  pan=np.clip(.45+(m-60)*.01,.2,.8);g=vel*rng.uniform(.94,1.04);x[idx:end,0]+=yy[:end-idx]*g*math.sqrt(1-pan);x[idx:end,1]+=yy[:end-idx]*g*math.sqrt(pan)
  eventlog.append({'midi':m,'at':round(at,3),'gate':round(gate,3),'velocity':vel})
 for b in range(bars):
  at=b*meter*beat;ch=chords[b%len(chords)]
  if style=='nocturne':
   # Sparse bass and chord breaths; melody holds over the barline, no repeating arpeggio.
   note(ch[0]-12,at,beat*3.4,.31)
   if b%4!=3:
    for j,m in enumerate(ch[1:]):note(m,at+beat*.15+j*.04,beat*2.8,.13)
   motifs=[[69,65],[67],[72,70],[69],[65,64],[67,69],[74],[69,65]]
   for j,m in enumerate(motifs[b%8]):note(m,at+(1.0+j*1.7)*beat,beat*(2 if len(motifs[b%8])==1 else 1.1),.35)
  elif style=='waltz':
   # Light, clearly metered bass-chord-chord. Bright 3/4 rather than slow 4/4 arpeggios.
   note(ch[0]-12,at,beat*.65,.32)
   for off in [1,2]:
    for j,m in enumerate(ch[1:]):note(m,at+off*beat+j*.008,beat*.50,.17)
   motifs=[[79,78,76,74],[74,76,78,79],[81,79,76],[78,74],[76,74,71,69],[74,76,79],[78,76,74],[71,74]]
   mel=motifs[b%8];rhythm=[0,.5,1.5,2.5] if len(mel)==4 else [0,1,2] if len(mel)==3 else [.0,1.5]
   for m,off in zip(mel,rhythm):note(m,at+off*beat,beat*.55,.32)
  else:
   # Pentatonic 6/8 with alternating call/response and airy upper-register accents.
   note(ch[0]-12,at,beat*2.1,.19);note(ch[0]-5,at+3*beat,beat*1.5,.17)
   for off,m in [(1,ch[1]),(4,ch[2])]:note(m,at+off*beat,beat*.9,.12)
   motifs=[[75,79,82],[86,82],[79,77,75],[82],[84,82,79],[77,75],[82,86,87],[86,82]]
   mel=motifs[b%8];positions=([.5,2,4.5] if len(mel)==3 else [1,4] if len(mel)==2 else [2.5])
   for m,off in zip(mel,positions):note(m,at+off*beat,beat*(1.1 if m<84 else .7),.27)
 # Short stereo room response, distinct decay by arrangement.
 dry=x.copy();mult={'nocturne':1.3,'waltz':.5,'rain':1.05}[style]
 for dt,g in [(.027,.11),(.059,.08),(.103,.06),(.181,.04),(.337,.03),(.541,.015)]:
  d=int(SR*dt);x[d:,0]+=dry[:-d,1]*g*mult;x[d:,1]+=dry[:-d,0]*g*mult*.91
 x=signal.sosfilt(signal.butter(2,[35,9500],btype='bandpass',fs=SR,output='sos'),x,axis=0).astype(np.float32)
 rms=np.sqrt(np.mean(x*x));x*=.08/max(float(rms),1e-6);pk=np.max(np.abs(x));x*=min(1,.77/max(float(pk),1e-6));fade=int(2.3*SR);x[-fade:]*=np.linspace(1,0,fade)[:,None];x[:int(.03*SR)]*=np.linspace(0,1,int(.03*SR))[:,None]
 with tempfile.TemporaryDirectory() as tmp:
  wav=Path(tmp)/'piece.wav';wavfile.write(str(wav),SR,(x*32767).astype(np.int16));out=O/(key+'.mp3')
  subprocess.run(['ffmpeg','-v','error','-y','-i',str(wav),'-c:a','libmp3lame','-b:a','192k','-metadata','title='+title,'-metadata','artist=LumaNote original composition',str(out)],check=True)
 meta[key]={'title':title,'author':'LumaNote','kind':'procedural','license':'Original LumaNote composition and synthesis; included for use and redistribution with this project, no third-party samples.','description':{'nocturne':'D minör · seyrek bas, uzun akorlar ve yavaş melodi','waltz':'G majör · canlı üç vuruşlu vals, kısa akorlar ve hareketli melodi','rain':'Mi bemol pentatonik · altı vuruşlu, üst oktavlarda aralıklı çağrı-cevap'}[style],'durationSeconds':round(n/SR,3),'sampleRate':SR,'channels':2,'bpm':bpm,'meter':f'{meter}/'+('8' if style=='rain' else '4'),'noteEvents':len(eventlog),'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'generator':'tools/generate-piano-057.py','peakLinear':float(np.max(np.abs(x))),'rmsLinear':float(np.sqrt(np.mean(x*x)))}
 (O/(key+'-score057.json')).write_text(json.dumps({'title':title,'bpm':bpm,'meter':meta[key]['meter'],'events':eventlog},ensure_ascii=False,indent=2))
 print(title,meta[key]['durationSeconds'],len(eventlog),flush=True)

if __name__=='__main__':
 render('pianoMoon','Gece Notları',48,4,'nocturne',16,[[50,57,62,65],[46,53,58,62],[53,60,65,69],[45,52,57,61]])
 render('pianoDawn','Sabah Valsi',108,3,'waltz',48,[[55,62,67,71],[52,59,64,67],[48,55,60,64],[50,57,62,66]])
 render('pianoSakura','Camdaki Damlalar',84,6,'rain',20,[[51,58,63,67],[56,63,68,72],[48,55,60,63],[58,65,70,74]])
 (O/'manifest.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n')
