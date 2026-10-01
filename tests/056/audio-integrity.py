from pathlib import Path
import subprocess,json,hashlib,numpy as np
R=Path(__file__).resolve().parents[2];M=json.loads((R/'assets/atelier/manifest.json').read_text());rows=[]
def ck(n,v,d=None):rows.append({'name':n,'passed':bool(v),'detail':d});print('PASS'if v else'FAIL',n,d or'',flush=True)
for k,m in M.items():
 f=R/'assets/atelier'/(k+'.mp3');j=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','stream=channels,sample_rate,codec_name:format=duration','-of','json',str(f)]));s=j['streams'][0]
 ck(k+' hash',hashlib.sha256(f.read_bytes()).hexdigest()==m['sha256'])
 ck(k+' stereo MP3 44.1k',s['channels']==2 and int(s['sample_rate'])==44100 and s['codec_name']=='mp3')
 ck(k+' duration',abs(float(j['format']['duration'])-m['durationSeconds'])<.15,float(j['format']['duration']))
 samples=np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',str(f),'-f','f32le','-acodec','pcm_f32le','-']),dtype=np.float32)
 peak=float(np.max(np.abs(samples)));rms=float(np.sqrt(np.mean(samples*samples)))
 ck(k+' finite unclipped non-silent samples',np.isfinite(samples).all() and peak<.99 and .03<rms<.2,{'peak':round(peak,6),'rms':round(rms,6)})
 del samples
(R/'tests/056/audio-integrity-results.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2));print('RESULT',sum(x['passed']for x in rows),'/',len(rows))
if any(not x['passed']for x in rows):raise SystemExit(1)
