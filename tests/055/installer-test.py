"""Real Node + ZIP filesystem tests on Linux; not macOS/npm/Metro tests."""
from pathlib import Path
import tempfile,os,shutil,subprocess,json,hashlib,re,base64
R=Path(__file__).resolve().parents[2];OLD=Path(os.environ.get('LUMA_054_SOURCE',str(R.with_name('LumaNote_054_Tam_Proje'))));OUT=R/'tests/055';rows=[]
PAYLOAD=json.loads((R/'tests/055/fixtures/test-addon054.json').read_text())
def chk(n,v):rows.append(dict(name=n,passed=bool(v)));print('PASS' if v else 'FAIL',n,flush=True)
def snapshot(p):return {str(f.relative_to(p)):hashlib.sha256(f.read_bytes()).hexdigest() for f in p.rglob('*') if f.is_file() and not f.is_symlink()}
with tempfile.TemporaryDirectory(prefix='luma055-check-') as tmp:
 T=Path(tmp);home=T/'home';home.mkdir();env={**os.environ,'HOME':str(home)}
 def base(name,coins=None):
  p=T/name;shutil.copytree(OLD,p)
  # No dependency install. Sentinel files prove updater does not alter lock, identity or recordings.
  (p/'package-lock.json').write_text('{"lockfileVersion":3,"sentinel":"do not rewrite"}')
  (p/'assets/recordings').mkdir(exist_ok=True);(p/'assets/recordings/ocean.mp3').write_bytes(b'existing downloaded audio sentinel')
  (p/'user-secret.env').write_text('PRIVATE_SETTING=keep')
  if coins is not None:
   (p/'App.tsx').write_text(PAYLOAD['appPatched']);(p/'tools/build-ui.cjs').write_text(PAYLOAD['buildPatched']);(p/'tools/ui/test-coins.js').write_text(PAYLOAD['ui'].replace('LUMA_TEST_COINS_SWITCH = true','LUMA_TEST_COINS_SWITCH = '+str(coins).lower()))
  return p
 def run(p,source=R):return subprocess.run(['node',str(source/'tools/repair-existing.cjs'),str(p)],capture_output=True,text=True,env=env,timeout=40)
 plain=base('plain054');before=snapshot(plain);pkg=json.loads((plain/'package.json').read_text());app=json.loads((plain/'app.json').read_text());result=run(plain)
 (OUT/'repair-success.txt').write_text(result.stdout+result.stderr)
 chk('Plain 054 updates',result.returncode==0)
 chk('Test wallet disabled if not previously installed','LUMA_TEST_COINS_SWITCH = false' in (plain/'tools/ui/test-coins.js').read_text())
 after=snapshot(plain)
 chk('package-lock preserved',after['package-lock.json']==before['package-lock.json'])
 chk('Downloaded audio preserved',after['assets/recordings/ocean.mp3']==before['assets/recordings/ocean.mp3'])
 chk('Unrelated private configuration preserved',after['user-secret.env']==before['user-secret.env'])
 newpkg=json.loads((plain/'package.json').read_text());newapp=json.loads((plain/'app.json').read_text())
 chk('Dependency versions and package version unchanged',newpkg['dependencies']==pkg['dependencies'] and newpkg['version']==pkg['version'])
 chk('Expo slug and identity unchanged',{k:v for k,v in app['expo'].items() if k!='extra'}=={k:v for k,v in newapp['expo'].items() if k!='extra'})
 chk('Only build metadata changed in app.extra',{k:v for k,v in app['expo']['extra'].items() if k!='lumaNocturneBuild'}=={k:v for k,v in newapp['expo']['extra'].items() if k!='lumaNocturneBuild'})
 chk('Backup ZIP created and validated',len(list((home/'Desktop/LumaNote_Yedekleri').glob('*.zip')))==1)
 first=snapshot(plain);second=run(plain)
 chk('Repeat application is idempotent',second.returncode==0 and snapshot(plain)==first)
 for enabled in [True,False]:
  p=base('addon'+str(enabled),coins=enabled);res=run(p)
  chk('Known wallet addon updates ('+str(enabled)+')',res.returncode==0)
  chk('Wallet switch preserved ('+str(enabled)+')','LUMA_TEST_COINS_SWITCH = '+str(enabled).lower() in (p/'tools/ui/test-coins.js').read_text())
  chk('Build includes wallet exactly once ('+str(enabled)+')',(p/'ONIZLEME.html').read_text().count('const TEST_COINS_AMOUNT = 100000000;')==1)
  chk('Native development gate retained ('+str(enabled)+')','LUMA_TEST_COINS_DEV_GATE_V1' in (p/'App.tsx').read_text())
  if enabled:
   res=subprocess.run(['node',str(p/'tools/toggle-test-coins.cjs'),'kapat'],capture_output=True,text=True,env=env,timeout=40)
   chk('Updated native test-wallet command can disable addon',res.returncode==0 and 'LUMA_TEST_COINS_SWITCH = false' in (p/'tools/ui/test-coins.js').read_text())
   res=subprocess.run(['node',str(p/'tools/toggle-test-coins.cjs'),'ac'],capture_output=True,text=True,env=env,timeout=40)
   chk('Updated command can enable addon',res.returncode==0 and 'LUMA_TEST_COINS_SWITCH = true' in (p/'tools/ui/test-coins.js').read_text())
 bad=base('custom');(bad/'tools/ui/living-model.js').write_text((bad/'tools/ui/living-model.js').read_text()+'\n// MY PERSONAL EDIT\n');snap=snapshot(bad);res=run(bad)
 chk('Custom edits rejected without any file writes',res.returncode!=0 and snapshot(bad)==snap)
 sdk=base('wrongSDK');obj=json.loads((sdk/'package.json').read_text());obj['dependencies']['expo']='~56.0.0';(sdk/'package.json').write_text(json.dumps(obj));snap=snapshot(sdk);res=run(sdk)
 chk('Different SDK rejected without changing files',res.returncode!=0 and snapshot(sdk)==snap)
 sym=base('symlink');f=sym/'tools/ui/living-model.js';f.unlink();f.symlink_to(OLD/'tools/ui/living-model.js');snap=snapshot(sym);res=run(sym)
 chk('Symlink source target rejected',res.returncode!=0 and snapshot(sym)==snap)
 space=base('project with spaces');res=run(space);chk('Spaces in path work',res.returncode==0)
 # Controlled verification failure AFTER writes: regenerate trusted source manifest then run.
 corrupt=T/'source-failure';shutil.copytree(R,corrupt);(corrupt/'tools/verify.cjs').write_text("throw Error('injected verify failure')")
 doc=json.loads((corrupt/'docs/repair-055.json').read_text())
 for x in doc['files']:
  if x['path']=='tools/verify.cjs':x['newSha256']=hashlib.sha256((corrupt/x['path']).read_bytes()).hexdigest()
 (corrupt/'docs/repair-055.json').write_text(json.dumps(doc));victim=base('rollback');snap=snapshot(victim);res=run(victim,corrupt)
 chk('Verification failure restores every previous file',res.returncode!=0 and snapshot(victim)==snap)
 chk('Rollback removes install lock',not(victim/'.luma055-install-lock').exists())
 # A malicious traversal in a distribution manifest may not leave target.
 doc['files'][0]['path']='../escape';(corrupt/'docs/repair-055.json').write_text(json.dumps(doc));snap=snapshot(victim);res=run(victim,corrupt)
 chk('Manifest traversal rejected with no modifications',res.returncode!=0 and snapshot(victim)==snap)
(OUT/'installer-results.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2));print('RESULT',sum(x['passed'] for x in rows),'/',len(rows))
if any(not x['passed'] for x in rows):raise SystemExit(1)
