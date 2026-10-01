from pathlib import Path
import tempfile,shutil,subprocess,os,json,hashlib
R=Path(__file__).resolve().parents[2];B=Path(os.environ.get('LUMA_BASELINES','/mnt/data/luma056_work/baselines'));rows=[]
def check(n,v):rows.append({'name':n,'passed':bool(v)});print('PASS'if v else'FAIL',n,flush=True)
with tempfile.TemporaryDirectory(prefix='luma056-chain-') as tmp:
 root=Path(tmp);home=root/'home';home.mkdir();env={**os.environ,'HOME':str(home)}
 def patch(source,target):return subprocess.run(['node',str(source/'tools/repair-existing.cjs'),str(target)],capture_output=True,text=True,env=env,timeout=40)
 for v in ['05','053','055']:
  p=root/v;shutil.copytree(B/v,p);q=patch(R,p);check('Cumulative '+v+' ->056 installs',q.returncode==0)
  (R/'tests/056'/('chain-'+v+'.log')).write_text(q.stdout+q.stderr)
  check('Cumulative '+v+' includes actual Japanese and Atelier code',all((p/'tools/ui'/f).exists()for f in ['sakura-collection.js','sakura-art.js','atelier-art.js','atelier-model.js']))
  check('Cumulative '+v+' ships local ocean and fire files',all((p/'assets/atelier'/(k+'.mp3')).stat().st_size>2000000 for k in ['ocean','fire']))
 # Simulate the user's in-place progression, rather than only opening a pristine ZIP.
 p=root/'installed-chain';shutil.copytree(B/'054',p);q=patch(B/'055',p);check('Historical 054->055 installer succeeds',q.returncode==0)
 q=patch(R,p);check('Actual previously patched 055->056 succeeds',q.returncode==0)
 # Test source file corruption is caught before code backup/mutation.
 src=root/'corrupt';shutil.copytree(R,src);f=src/'assets/atelier/ocean.mp3';f.write_bytes(f.read_bytes()[:-1]+b'x')
 fresh=root/'fresh';shutil.copytree(B/'055',fresh);before=(fresh/'tools/ui/core.js').read_bytes();q=patch(src,fresh)
 check('Corrupt audio rejected before changing target',q.returncode!=0 and (fresh/'tools/ui/core.js').read_bytes()==before and not(fresh/'assets/atelier/ocean.mp3').exists())
(R/'tests/056/chain-results.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2));print('RESULT',sum(x['passed']for x in rows),'/',len(rows))
if any(not x['passed']for x in rows):raise SystemExit(1)
