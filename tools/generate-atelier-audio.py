#!/usr/bin/env python3
"""Original LumaNote sound design. No downloaded recordings, samples or compositions.
Requires Python 3, NumPy, SciPy and ffmpeg. Only overwrites assets/atelier outputs.
The nature tracks are procedural approximations, NOT field recordings.
"""
from pathlib import Path
import hashlib, json, math, subprocess, tempfile
import numpy as np
from scipy import signal
from scipy.io import wavfile

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets' / 'atelier'
OUT.mkdir(parents=True, exist_ok=True)
SR=44100
RNG=np.random.default_rng(560930)
META={}

def noise(n,lo=None,hi=None,order=2):
    x=RNG.standard_normal(n).astype(np.float32)
    if lo and hi: sos=signal.butter(order,[lo,hi],btype='bandpass',fs=SR,output='sos')
    elif lo: sos=signal.butter(order,lo,btype='highpass',fs=SR,output='sos')
    else: sos=signal.butter(order,hi,btype='lowpass',fs=SR,output='sos')
    x=signal.sosfilt(sos,x).astype(np.float32)
    return x/(float(np.sqrt(np.mean(x*x)))+1e-9)

def smooth_curve(t,spacing,low,high):
    knots=np.arange(0,float(t[-1])+spacing*2,spacing)
    vals=RNG.uniform(low,high,len(knots))
    return np.interp(t,knots,vals).astype(np.float32)

def finish(key,x,title,description):
    x=np.nan_to_num(x).astype(np.float32)
    x=signal.sosfilt(signal.butter(2,35,btype='highpass',fs=SR,output='sos'),x,axis=0).astype(np.float32)
    # Gentle soft saturation only at rare transients; no brick-wall clipping.
    rms=float(np.sqrt(np.mean(x*x)))
    x*=.105/max(rms,1e-9)
    peak=float(np.max(np.abs(x)))
    if peak>.79: x*=.79/peak
    edge=int(.035*SR)
    x[:edge]*=np.linspace(0,1,edge,dtype=np.float32)[:,None]
    x[-edge:]*=np.linspace(1,0,edge,dtype=np.float32)[:,None]
    with tempfile.TemporaryDirectory() as tmp:
        wav=Path(tmp)/'track.wav'
        wavfile.write(str(wav),SR,np.int16(np.clip(x,-1,1)*32767))
        dest=OUT/(key+'.mp3')
        subprocess.run(['ffmpeg','-v','error','-y','-i',str(wav),'-c:a','libmp3lame','-b:a','192k','-ar',str(SR),'-metadata','title='+title,'-metadata','artist=LumaNote original sound design',str(dest)],check=True)
    META[key]={'title':title,'author':'LumaNote','kind':'procedural','license':'Original LumaNote procedural audio; no third-party recordings or samples. Included for use and redistribution with this project.','description':description,'durationSeconds':round(len(x)/SR,3),'sampleRate':SR,'channels':2,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'peakLinear':round(float(np.max(np.abs(x))),6),'rmsLinear':round(float(np.sqrt(np.mean(x*x))),6),'generator':'tools/generate-atelier-audio.py','generatorSeed':560930}
    print(key, 'ready', META[key]['durationSeconds'],'s', flush=True)

def ocean():
    n=SR*126; t=np.arange(n,dtype=np.float32)/SR
    # Irregular sets of shoreward breakers: approach, crest, foam and receding shingle.
    surge=np.zeros(n,np.float32); foam=np.zeros(n,np.float32); recede=np.zeros(n,np.float32)
    centers=np.cumsum(RNG.uniform(7.8,12.8,15))-8
    for j,c in enumerate(centers):
        strength=RNG.uniform(.55,1.05)*( .85+.17*np.sin(j*1.14) )
        rise=RNG.uniform(1.8,2.9); fall=RNG.uniform(3.1,5)
        u=t-c
        env=np.where(u<0,np.exp(-.5*(u/rise)**2),np.exp(-u.clip(0)/fall))
        surge+=strength*env.astype(np.float32)
        foam+=strength*np.exp(-.5*((u-.6)/1.6)**2).astype(np.float32)
        recede+=strength*np.exp(-.5*((u-3.2)/2.6)**2).astype(np.float32)
    swell=(.6+.4*smooth_curve(t,.42,.55,1))
    common=noise(n,85,580); hiss=noise(n,1450,7000)
    x=np.zeros((n,2),np.float32)
    for ch in range(2):
        rumble=.115*noise(n,38,170)
        mid=.32*(.11+surge)*(.73*common+.27*noise(n,85,580))
        fizz=.17*(.02+foam)*swell*(.5*hiss+.5*noise(n,1450,7000))
        wash=.10*recede*smooth_curve(t,.21,.25,1.1)*noise(n,420,2400)
        distance=.045*noise(n,200,1500)
        x[:,ch]=rumble*(.23+.77*surge)+mid+fizz+wash+distance
    # Different time-of-arrival and low-rate spatial motion without headphone extremes.
    x[:,1]=np.roll(x[:,1],97)
    x[:,0]*=1+.09*np.sin(t*.19)
    x[:,1]*=1-.09*np.sin(t*.19)
    finish('ocean',x,'Kıyı Dalgaları','Özgün sentez: düzensiz dalga setleri, köpük ve kıyıya çekiliş. Saha kaydı değildir.')

def fire():
    n=SR*126; t=np.arange(n,dtype=np.float32)/SR
    x=np.zeros((n,2),np.float32)
    warmth=smooth_curve(t,1.2,.58,1.12)*smooth_curve(t,.12,.83,1.03)
    shared=noise(n,65,330)
    for ch in range(2):
        x[:,ch]=.12*warmth*(.75*shared+.25*noise(n,65,330))+.021*noise(n,1600,7400)*smooth_curve(t,.18,.3,1)
    # Individually shaped burning-fibre snaps and low log pops, each with its own pan.
    events=np.sort(RNG.uniform(.1,125.9,1040))
    for at in events:
        large=RNG.random()<.09
        dur=RNG.uniform(.07,.24) if large else RNG.uniform(.007,.065)
        length=int(dur*SR); tt=np.arange(length)/SR
        envelope=np.exp(-tt/(dur*.19))*np.minimum(tt/.00065,1)
        carrier=RNG.normal(0,1,length)
        if large:
            cutoff=RNG.uniform(650,1700)
            carrier=signal.sosfilt(signal.butter(1,cutoff,fs=SR,output='sos'),carrier)
            carrier+=.3*np.sin(2*np.pi*RNG.uniform(90,240)*tt)*np.exp(-tt/.045)
        else:
            carrier=signal.sosfilt(signal.butter(1,[950,9000],btype='bandpass',fs=SR,output='sos'),carrier)
        click=(carrier*envelope*RNG.uniform(.12,.65)*(1.25 if large else .8)).astype(np.float32)
        pos=int(at*SR); end=min(n,pos+length); pan=RNG.uniform(.14,.86)
        x[pos:end,0]+=click[:end-pos]*math.sqrt(1-pan)
        x[pos:end,1]+=click[:end-pos]*math.sqrt(pan)
    finish('fire',x,'Odun Çıtırtısı','Özgün sentez: sıcak köz dokusu, değişken odun patlamaları ve stereo çıtırtılar. Gerçek ateş kaydı değildir.')

NOTE_CACHE={}
def piano_note(midi):
    if midi in NOTE_CACHE:return NOTE_CACHE[midi]
    hz=440*2**((midi-69)/12)
    duration=5.5 if midi<60 else 4.1
    t=np.arange(int(SR*duration),dtype=np.float32)/SR
    y=np.zeros(len(t),np.float32)
    # Inharmonic stretched partials + slightly detuned string unisons.
    B=.000025+.00002*max(0,(midi-48)/36)
    for h in range(1,25):
        f=hz*h*np.sqrt(1+B*h*h)
        if f>14500:break
        decay=(2.5+max(0,65-midi)*.055)/(1+h*.28)
        amp=(1 if h==1 else .9/h**1.33)*np.exp(-h/16)
        partial=np.exp(-t/decay)*(np.sin(2*np.pi*f*t)+.27*np.sin(2*np.pi*f*1.0017*t+.3)+.23*np.sin(2*np.pi*f*.9986*t-.25))
        y+=amp*partial.astype(np.float32)
    y*=1-np.exp(-t/.0038)
    hammer=RNG.normal(size=len(t)).astype(np.float32)
    hammer=signal.sosfilt(signal.butter(1,[400,4200],fs=SR,btype='bandpass',output='sos'),hammer).astype(np.float32)
    y+=.045*hammer*np.exp(-t/.012)
    y*=np.minimum(1,(duration-t)/.09)
    y/=max(1e-5,float(np.max(np.abs(y))))
    NOTE_CACHE[midi]=y
    return y

def piano(key,title,bpm,chords,melodies):
    beat=60/bpm; bars=24; seconds=bars*4*beat+3
    n=int(seconds*SR); x=np.zeros((n,2),np.float32)
    def add(midi,at,vel=.3):
        y=piano_note(midi); pos=max(0,int((at+RNG.uniform(-.01,.01))*SR)); end=min(n,pos+len(y))
        if end<=pos:return
        pan=np.clip(.47+(midi-60)*.008,.24,.73)
        gain=vel*RNG.uniform(.92,1.05)
        x[pos:end,0]+=y[:end-pos]*gain*math.sqrt(1-pan)
        x[pos:end,1]+=y[:end-pos]*gain*math.sqrt(pan)
    for bar in range(bars):
        chord=chords[bar%len(chords)]; base=bar*4*beat
        add(chord[0]-12,base,.30)
        if bar%2==0:add(chord[0]-12,base+2.05*beat,.19)
        order=[0,2,1,3,2,1] if key!='pianoDawn' else [0,1,2,3,1,2]
        for q,c in enumerate(order): add(chord[c],base+(.45+q*.55)*beat,.16 if q%2 else .20)
        mel=melodies[(bar//2)%len(melodies)]
        for j,m in enumerate(mel):
            if m is not None:add(m,base+(.2+j*.91)*beat,.31 if j==0 else .26)
    # Modest room tail: scattered early reflections and exponentially diminishing late reflections.
    dry=x.copy()
    for delay,gain in [(.024,.10),(.041,.085),(.067,.065),(.109,.052),(.181,.041),(.293,.033),(.457,.027),(.701,.018),(.967,.012)]:
        d=int(delay*SR);x[d:,0]+=dry[:-d,1]*gain;x[d:,1]+=dry[:-d,0]*gain*.94
    x=signal.sosfilt(signal.butter(2,9500,fs=SR,output='sos'),x,axis=0).astype(np.float32)
    fade=int(2.4*SR);x[-fade:]*=np.linspace(1,0,fade)[:,None]
    finish(key,x,title,'Bu proje için özgün piyano benzeri sentez ve beste; harici ses örneği veya klasik eser kaydı içermez.')

if __name__=='__main__':
    ocean(); fire()
    piano('pianoMoon','Ay Bahçesi',58,[[50,57,60,65],[46,53,57,62],[53,57,60,64],[48,55,60,62]],[[74,72,69,None],[69,65,67,69],[72,None,69,65],[67,69,72,None]])
    piano('pianoDawn','Sabah Defteri',72,[[48,55,59,64],[45,52,55,60],[53,57,60,64],[43,50,57,62]],[[76,74,72,67],[72,71,69,None],[69,72,76,74],[74,72,71,None]])
    piano('pianoSakura','Pembe Yapraklar',64,[[50,57,62,66],[43,50,59,62],[47,54,57,62],[45,52,59,64]],[[74,78,76,None],[71,74,78,76],[78,81,78,74],[76,74,71,None]])
    (OUT/'manifest.json').write_text(json.dumps(META,ensure_ascii=False,indent=2)+'\n')
    print('All original audio assets generated.',flush=True)
