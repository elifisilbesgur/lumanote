"""Numerical decoding/score checks; not subjective listening tests."""
from pathlib import Path
import subprocess,json,hashlib,numpy as np
R=Path(__file__).resolve().parents[2];O=R/'tests/057';manifest=json.loads((R/'assets/atelier/manifest.json').read_text());rows=[];sig=[]
def ck(n,v,d=''):rows.append(dict(name=n,passed=bool(v),detail=d));print(('PASS 'if v else 'FAIL ')+n,str(d)[:120])
for key in ['pianoMoon','pianoDawn','pianoSakura']:
 f=R/'assets/atelier'/f'{key}.mp3';a=manifest[key];pr=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(f)]));s=pr['streams'][0]
 ck(key+' stereo 44.1 kHz MP3',s['channels']==2 and s['sample_rate']=='44100' and s['codec_name']=='mp3')
 ck(key+' duration matches manifest',abs(float(pr['format']['duration'])-a['durationSeconds'])<.15)
 ck(key+' SHA256 matches metadata',hashlib.sha256(f.read_bytes()).hexdigest()==a['sha256'])
 pcm=np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',str(f),'-f','f32le','-acodec','pcm_f32le','-']),dtype=np.float32).reshape(-1,2)
 ck(key+' finite non-silent and no hard clipping',np.isfinite(pcm).all() and np.max(np.abs(pcm))<.95 and np.sqrt(np.mean(pcm*pcm))>.015,{'peak':float(np.max(np.abs(pcm))),'rms':float(np.sqrt(np.mean(pcm*pcm)))})
 score=json.loads((R/'assets/atelier'/f'{key}-score057.json').read_text());ck(key+' distinct written event score exists',bool(score))
 sig.append((a['bpm'],a['meter'],a['noteEvents']))
ck('Different meters across all three',len(set(x[1]for x in sig))==3)
ck('Different tempos across all three',len(set(x[0]for x in sig))==3)
ck('Distinct event density, not one renamed file',min(x[2]for x in sig)*3<max(x[2]for x in sig))
(O/'audio-results.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2));print('RESULT',sum(x['passed']for x in rows),'/',len(rows))
if any(not x['passed']for x in rows):raise SystemExit(1)
