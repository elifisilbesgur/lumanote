from pathlib import Path
import subprocess,shutil,tempfile,os,json,hashlib,zipfile
R=Path(__file__).resolve().parents[2];BASE=Path(os.environ.get('LUMA_053_BASE',str(R)));O=R/'tests/053'
results=[]
def ck(n,v):results.append({'name':n,'passed':bool(v)});print(('PASS ' if v else 'FAIL ')+n)
def h(p):return hashlib.sha256(p.read_bytes()).hexdigest()
with tempfile.TemporaryDirectory(prefix='luma053-') as tmp:
 T=Path(tmp);home=T/'home';home.mkdir();env={**os.environ,'HOME':str(home)}
 def project(n):
  p=T/n;shutil.copytree(BASE,p);(p/'node_modules/expo').mkdir(parents=True);(p/'node_modules/expo/package.json').write_text('{"version":"57.0.26"}');(p/'package-lock.json').write_text('{"sentinel":"existing lock not replace"}');(p/'.env').write_text('PRIVATE=stays-local');return p
 def run(p):return subprocess.run(['node',str(R/'tools/repair-existing.cjs'),str(p)],env=env,capture_output=True,text=True,timeout=40)
 p=project('project with spaces');pkg=json.loads((p/'package.json').read_text());pkg['scripts']['my-test']='echo test';pkg['customUserField']='keep';(p/'package.json').write_text(json.dumps(pkg));app=json.loads((p/'app.json').read_text());app['expo']['extra']['sentinel']='kept';(p/'app.json').write_text(json.dumps(app));
 locks=h(p/'package-lock.json');services=h(p/'nocturne/NativeServices.ts');envh=h(p/'.env');modules=h(p/'node_modules/expo/package.json')
 r=run(p);(O/'repair-success.txt').write_text(r.stdout+'\n'+r.stderr)
 ck('repair in path with spaces',r.returncode==0)
 if r.returncode:print(r.stdout,r.stderr)
 ck('existing dependency lock unchanged',h(p/'package-lock.json')==locks)
 ck('existing dependency tree unchanged',h(p/'node_modules/expo/package.json')==modules)
 after=json.loads((p/'package.json').read_text());newapp=json.loads((p/'app.json').read_text())
 ck('custom scripts and dependencies preserved',after['scripts']==pkg['scripts'] and after['dependencies']==pkg['dependencies'] and after['devDependencies']==pkg['devDependencies'] and after['customUserField']=='keep')
 ck('app slug and private fields preserved',newapp['expo']['slug']==app['expo']['slug'] and newapp['expo']['extra']['sentinel']=='kept')
 ck('native data storage service untouched',h(p/'nocturne/NativeServices.ts')==services)
 ck('private local file unchanged',h(p/'.env')==envh)
 backups=list((home/'Desktop/LumaNote_Yedekleri').glob('*.zip'));ck('verified backup created',len(backups)==1)
 with zipfile.ZipFile(backups[0]) as z:
  ck('backup contains original source',hashlib.sha256(z.read('project with spaces/App.tsx')).hexdigest()==h(BASE/'App.tsx'))
  ck('backup keeps package lock and private env',z.read('project with spaces/.env')==b'PRIVATE=stays-local' and z.read('project with spaces/package-lock.json')==(p/'package-lock.json').read_bytes())
  ck('backup excludes node_modules',not any('/node_modules/' in n for n in z.namelist()))
 r=run(p);ck('idempotent repair can be re-run',r.returncode==0)
 # Unknown local edits cause an early refusal, not overwriting the user's code.
 p=project('custom');(p/'App.tsx').write_text((p/'App.tsx').read_text()+'\n// a custom modification\n');before=h(p/'App.tsx');r=run(p)
 ck('custom code rejected without overwrite',r.returncode!=0 and h(p/'App.tsx')==before and 'farklı bir düzenleme' in r.stderr)
 p=project('wrong-sdk');pkg=json.loads((p/'package.json').read_text());pkg['dependencies']['expo']='~56.0.0';(p/'package.json').write_text(json.dumps(pkg));r=run(p);ck('wrong SDK rejected',r.returncode!=0 and 'SDK' in r.stderr)
 p=project('symlink');(p/'App.tsx').unlink();(p/'App.tsx').symlink_to(BASE/'App.tsx');r=run(p);ck('target source symlink rejected',r.returncode!=0 and 'Sembolik' in r.stderr)
 p=project('rollback');(p/'assets/nocturne/rain.mp3').write_bytes(b'')
 rels=[e['path'] for e in json.loads((R/'docs/repair-053.json').read_text())['files']]+['package.json','app.json','ONIZLEME.html','nocturne/UI_HTML.ts','nocturne/AudioAssets.ts','licenses/Audio-Included.json']
 before={n:(p/n).read_bytes() if (p/n).exists() else None for n in rels};r=run(p)
 ck('build validation failure reported',r.returncode!=0 and 'eski hâline' in r.stderr)
 ck('transaction restores every original file',all(((p/n).read_bytes() if (p/n).exists() else None)==v for n,v in before.items()))
 ck('failed transaction retains backup',any('KOD YEDEĞİ DOĞRULANDI' in x for x in r.stdout.splitlines()))
 ck('repair package still verifies source',h(R/'App.tsx')==next(x['newSha256'] for x in json.loads((R/'docs/repair-053.json').read_text())['files'] if x['path']=='App.tsx'))
(O/'installer-results.json').write_text(json.dumps(results,indent=2,ensure_ascii=False))
print('RESULT',sum(x['passed'] for x in results),'/',len(results))
