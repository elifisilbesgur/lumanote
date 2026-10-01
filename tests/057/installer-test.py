"""Real local ZIP updater tests. No remote Mac, npm install or Metro simulation."""
from pathlib import Path
import zipfile,tempfile,os,json,hashlib,subprocess,shutil
R=Path(__file__).resolve().parents[2];O=R/'tests/057';rows=[]
def ck(n,v,detail=''):rows.append(dict(name=n,passed=bool(v),detail=detail));print(('PASS 'if v else 'FAIL ')+n,str(detail)[:200],flush=True)
def snap(p):return {str(f.relative_to(p)):hashlib.sha256(f.read_bytes()).hexdigest()for f in p.rglob('*')if f.is_file()and not f.is_symlink()}
with tempfile.TemporaryDirectory(prefix='luma057-install-')as tmp:
 T=Path(tmp);home=T/'home';home.mkdir();env={**os.environ,'HOME':str(home)}
 z=zipfile.ZipFile('/mnt/data/LumaNote_v056_Atolye_Tam_Proje.zip');base_root='LumaNote_056_Tam_Proje/'
 def base(name,switch=None):
  out=T/name;out.mkdir()
  for entry in z.infolist():
   if not entry.filename.startswith(base_root)or entry.is_dir():continue
   p=out/entry.filename[len(base_root):];p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(z.read(entry))
  (out/'package-lock.json').write_text('{"version":"sentinel","private":"keep"}')
  (out/'assets/recordings').mkdir(exist_ok=True);(out/'assets/recordings/fire.mp3').write_bytes(b'USER SOUND KEEP')
  (out/'node_modules/private-marker').mkdir(parents=True);(out/'node_modules/private-marker/module.js').write_text('keep me')
  (out/'private.env').write_text('PRIVATE_KEY=do-not-change')
  p=out/'package.json';d=json.loads(p.read_text());d['scripts']['my-own-script']='echo KEEP';p.write_text(json.dumps(d))
  if switch is not None:
   p=out/'tools/ui/test-coins.js';p.write_text(p.read_text().replace('LUMA_TEST_COINS_SWITCH = false','LUMA_TEST_COINS_SWITCH = '+str(switch).lower()))
  return out
 def run(p,source=R):return subprocess.run(['node',str(source/'tools/repair-existing.cjs'),str(p)],capture_output=True,text=True,env=env,timeout=35)
 good=base('working project',True);before=snap(good);pkg=json.loads((good/'package.json').read_text());app=json.loads((good/'app.json').read_text());r=run(good)
 (O/'installer-success.log').write_text(r.stdout+r.stderr);ck('056 update completes',r.returncode==0,r.stderr[-160:]);after=snap(good)
 for f in ['package-lock.json','assets/recordings/fire.mp3','node_modules/private-marker/module.js','private.env']:
  ck('Preserved '+f,before[f]==after[f])
 newpkg=json.loads((good/'package.json').read_text());newapp=json.loads((good/'app.json').read_text())
 ck('Dependencies and package version preserved',all(pkg[k]==newpkg[k] for k in ['dependencies','devDependencies','version']))
 ck('Custom npm script preserved',newpkg['scripts']['my-own-script']==pkg['scripts']['my-own-script'])
 ck('Expo identity and all extra fields other than version preserved',{k:v for k,v in app['expo'].items()if k!='extra'}=={k:v for k,v in newapp['expo'].items()if k!='extra'} and {k:v for k,v in app['expo']['extra'].items()if k!='lumaNocturneBuild'}=={k:v for k,v in newapp['expo']['extra'].items()if k!='lumaNocturneBuild'})
 ck('Test wallet flag remains enabled','LUMA_TEST_COINS_SWITCH = true' in (good/'tools/ui/test-coins.js').read_text())
 ck('Backup ZIP integrity verified',len(list((home/'Desktop/LumaNote_Yedekleri').glob('*.zip')))==1 and 'KOD YEDEĞİ DOĞRULANDI' in r.stdout)
 ck('New piano files actually installed',all(after['assets/atelier/'+k+'.mp3']!=before['assets/atelier/'+k+'.mp3']for k in ['pianoMoon','pianoDawn','pianoSakura']))
 ck('Ocean/fire unchanged',all(after['assets/atelier/'+k+'.mp3']==before['assets/atelier/'+k+'.mp3']for k in ['ocean','fire']))
 twice=run(good);ck('Same update is idempotent',twice.returncode==0 and snap(good)==after,twice.stderr[-100:])
 off=base('wallet-off',False);r=run(off);ck('Disabled test wallet stays disabled',r.returncode==0 and 'LUMA_TEST_COINS_SWITCH = false' in (off/'tools/ui/test-coins.js').read_text())
 for mode in ['kapat','ac']:
  r=subprocess.run(['node',str(good/'tools/toggle-test-coins.cjs'),mode],capture_output=True,text=True,env=env,timeout=35)
  ck('Test budget '+mode+' command retained',r.returncode==0 and ('LUMA_TEST_COINS_SWITCH = '+str(mode=='ac').lower()) in (good/'tools/ui/test-coins.js').read_text())
 p=base('custom-code');f=p/'tools/ui/screens.js';f.write_text(f.read_text()+'\n// USER CHANGE');s=snap(p);r=run(p);ck('Personal code change stops before writes',r.returncode!=0 and snap(p)==s)
 p=base('wrong-sdk');f=p/'package.json';d=json.loads(f.read_text());d['dependencies']['expo']='~56.0.0';f.write_text(json.dumps(d));s=snap(p);r=run(p);ck('Different SDK blocked without writes',r.returncode!=0 and snap(p)==s)
 p=base('symbolic');f=p/'tools/ui/world.js';f.unlink();f.symlink_to(R/'tools/ui/world.js');s=snap(p);r=run(p);ck('Symbolic source blocked',r.returncode!=0 and snap(p)==s)
 source=T/'bad-package';shutil.copytree(R,source);f=source/'assets/atelier/pianoMoon.mp3';f.write_bytes(b'corrupt');p=base('target-corrupt');s=snap(p);r=run(p,source);ck('Corrupt distribution blocked before mutation',r.returncode!=0 and snap(p)==s)
 # Verification failure after real updates must roll back every changed byte.
 f.write_bytes((R/'assets/atelier/pianoMoon.mp3').read_bytes());v=source/'tools/verify.cjs';v.write_text("throw Error('injected postwrite failure');")
 m=source/'docs/repair-057.json';d=json.loads(m.read_text())
 for e in d['files']:
  if e['path']=='tools/verify.cjs':e['newSha256']=hashlib.sha256(v.read_bytes()).hexdigest()
 m.write_text(json.dumps(d));r=run(p,source)
 ck('Failed postwrite verification restores all files',r.returncode!=0 and snap(p)==s)
 ck('Failed update leaves no install lock',not(p/'.luma057-install-lock').exists())
 d['files'][0]['path']='../outside';m.write_text(json.dumps(d));r=run(p,source);ck('Manifest path traversal blocked',r.returncode!=0 and snap(p)==s)
 # Earlier deliveries accepted directly, using their real archived byte sources.
 for version,archive in [('054','LumaNote_v054_Mevsimler_ve_Notlar_Tam_Proje.zip'),('055','LumaNote_v055_Sakura_Koleksiyonu_Tam_Proje.zip')]:
  az=zipfile.ZipFile('/mnt/data/'+archive);prefix=az.namelist()[0].split('/')[0]+'/';p=T/('old'+version);p.mkdir()
  for e in az.infolist():
   if e.is_dir()or not e.filename.startswith(prefix):continue
   q=p/e.filename[len(prefix):];q.parent.mkdir(parents=True,exist_ok=True);q.write_bytes(az.read(e))
  r=run(p);(O/('installer-'+version+'.log')).write_text(r.stdout+r.stderr);ck(version+' can update directly',r.returncode==0,r.stderr[-160:])
(O/'installer-results.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2));print('RESULT',sum(r['passed']for r in rows),'/',len(rows))
if any(not r['passed']for r in rows):raise SystemExit(1)
