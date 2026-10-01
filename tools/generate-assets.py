"""Original synthesized fallback sound design, not field recordings or acoustic piano.
No samples, soundfonts, commercial compositions or third-party audio are used.
"""
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io.wavfile import write
from pathlib import Path
root=Path(__file__).resolve().parents[1]/'assets'/'nocturne'
sr=22050; duration=48; n=sr*duration
rng=np.random.default_rng(5127); t=np.arange(n)/sr
noise=rng.normal(0,1,(n,2))
def low(v,hz): return sosfilt(butter(2,hz,fs=sr,output='sos'),v,axis=0)
def save(name,a):
    a=a-np.mean(a,axis=0); peak=np.max(np.abs(a)); a=a/(max(peak,1e-9))*0.7
    k=min(sr*2,len(a)//8); q=np.linspace(0,1,k)[:,None]
    a[:k]=a[-k:]*(1-q)+a[:k]*q
    # Crossfaded seam preserves continuity; native engine adds an overlap as well.
    write(root/(name+'.wav'),sr,(np.clip(a,-1,1)*32767).astype(np.int16))
rain=(noise-low(noise,900))*.035+low(noise,4000)*.11
for _ in range(500):
    start=int(rng.uniform(0,duration-.08)*sr); k=int(sr*rng.uniform(.01,.06)); x=np.arange(k)/sr
    drop=np.sin(2*np.pi*rng.uniform(1500,4800)*x)*np.exp(-x*90)*rng.uniform(.02,.08)
    pan=rng.random();rain[start:start+k,0]+=drop*pan;rain[start:start+k,1]+=drop*(1-pan)
save('rain',rain)
wave=.2+.8*(.5+.5*np.sin(2*np.pi*t/12 + .6*np.sin(2*np.pi*t/48)))**2
sea=low(noise,2600)*wave[:,None]*.3+low(noise,180)*.13
save('ocean',sea)
fire=low(noise,220)*.1+low(noise,2200)*.012
for _ in range(120):
    start=int(rng.uniform(0,duration-.15)*sr);k=int(sr*rng.uniform(.008,.11));x=np.arange(k)/sr
    burst=rng.normal(0,1,k)*np.exp(-x*rng.uniform(30,130))*rng.uniform(.01,.12);pan=rng.random();fire[start:start+k,0]+=burst*pan;fire[start:start+k,1]+=burst*(1-pan)
save('fire',fire)
# A quiet original arpeggio, deliberately not attributed to a classical composer.
piano=np.zeros((n,2));chords=[[48,55,60,64,67],[45,52,57,60,64],[41,48,53,57,60],[43,50,55,59,62]]
for bar in range(8):
    notes=chords[bar%4];base=bar*6
    for j,idx in enumerate([0,2,3,4,2,1]):
        midi=notes[idx];freq=440*2**((midi-69)/12);start=int((base+j*.9)*sr);size=min(n-start,int(5*sr));x=np.arange(size)/sr
        note=sum((1/k**1.5)*np.sin(2*np.pi*freq*k*np.sqrt(1+.00008*k*k)*x)*np.exp(-x*(.6+k*.09)) for k in range(1,9))
        note*=np.minimum(1,x/.007)*.08
        piano[start:start+size,0]+=note*.85;piano[start:start+size,1]+=note*.75
# Small room echoes, no external impulse responses.
for delay,gain in [(.113,.16),(.229,.11),(.379,.08)]:
    d=int(sr*delay);piano[d:]+=piano[:-d,::-1]*gain
save('piano',piano)
x=np.arange(int(1.8*sr))/sr;bell=sum(np.sin(2*np.pi*f*x)*np.exp(-3*x) for f in [659.25,880])*np.minimum(1,x/.008)*.08
write(root/'bell.wav',sr,(np.stack([bell,bell],axis=1)*32767).astype(np.int16))
# Developer-only regeneration: the application consumes MP3 assets.
import shutil, subprocess
if shutil.which('ffmpeg'):
    for name in ['rain','ocean','fire','piano']:
        subprocess.run(['ffmpeg','-y','-loglevel','error','-i',str(root/(name+'.wav')),'-codec:a','libmp3lame','-b:a','128k',str(root/(name+'.mp3'))],check=True)
        (root/(name+'.wav')).unlink()
    print('Original synthesized stereo MP3s and bell.wav generated. No field recordings or third-party samples.')
else:
    print('WAVs generated; ffmpeg is required to regenerate the application MP3s. Existing MP3s were not changed.')
