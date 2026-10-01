"""Executes the real Bash backup branch with a fake npx; no npm/network/Metro."""
from pathlib import Path
import os,tempfile,subprocess,zipfile,json,hashlib,shutil
R=Path(__file__).resolve().parents[1];checks=[]
def check(n,v):checks.append({'name':n,'pass':bool(v)});print('PASS' if v else 'FAIL',n)
with tempfile.TemporaryDirectory(prefix='luma-installer-') as td:
 h=Path(td);d=h/'Desktop';d.mkdir();old=d/'LumaNote_Nocturne_Final';old.mkdir();new=d/'LumaNote_Yasayan_Bahce';new.mkdir();(old/'package.json').write_text('{"working":true}');(old/'App.tsx').write_text('// working version');(old/'package-lock.json').write_text('{}');(old/'.env').write_text('PRIVATE_TEST_VALUE');(old/'node_modules').mkdir();(old/'node_modules/big').write_text('temporary');(old/'symbolic').symlink_to('/does-not-exist');
 (new/'BASLAT.command').write_text((R/'BASLAT.command').read_text());bin=h/'bin';bin.mkdir();(bin/'npx').write_text('#!/bin/bash\nprintf "CALLED" >> "$HOME/npx-called"\nexit 0\n');(bin/'npx').chmod(0o755)
 env={**os.environ,'HOME':str(h),'PATH':str(bin)+':'+os.environ['PATH']}
 before={str(p.relative_to(old)):hashlib.sha256(p.read_bytes()).hexdigest() for p in old.rglob('*') if p.is_file()}
 def run():return subprocess.run(['bash',str(new/'BASLAT.command')],env=env,capture_output=True,text=True)
 x=run();check('Launcher completes backup branch',x.returncode==0)
 zips=list((d/'LumaNote_Yedekleri').glob('*.zip'));check('One timestamped source backup created',len(zips)==1)
 with zipfile.ZipFile(zips[0]) as z:
  check('ZIP is intact',z.testzip() is None);names=z.namelist();check('Backup includes source and dependency lock',all('LumaNote_Nocturne_Final/'+s in names for s in ['App.tsx','package.json','package-lock.json']))
  check('Temporary node_modules excluded',not any('/node_modules/' in n for n in names));check('Private config retained only in local user backup','LumaNote_Nocturne_Final/.env' in names)
 after={str(p.relative_to(old)):hashlib.sha256(p.read_bytes()).hexdigest() for p in old.rglob('*') if p.is_file()};check('Original project files unchanged',before==after)
 check('Backup marker records successful archive', (new/'.luma/before-05-code-backup.txt').exists())
 check('Node execution starts after verified backup',(h/'npx-called').exists())
 x=run();check('Second launch does not duplicate initial backup',len(list((d/'LumaNote_Yedekleri').glob('*.zip')))==1)
 # Force backup tool to fail. Never start package installation in that case.
 (new/'.luma/before-05-code-backup.txt').unlink();(h/'npx-called').unlink();(bin/'zip').write_text('#!/bin/sh\nexit 12\n');(bin/'zip').chmod(0o755)
 x=run();check('Backup failure aborts before npm/npx',x.returncode!=0 and not (h/'npx-called').exists())
 check('Failed backup is not marked complete',not (new/'.luma/before-05-code-backup.txt').exists())
 (bin/'zip').unlink();shutil.move(str(old),str(d/'saved-original'));x=run();check('Missing old project is not called backed up','yedeği alınmadı' in x.stdout and not (new/'.luma/before-05-code-backup.txt').exists())
for name in ['BASLAT.command','TUNEL_ILE_BASLAT.command','SESLERI_INDIR.command']:
 check('Bash syntax '+name,subprocess.run(['bash','-n',str(R/name)],capture_output=True).returncode==0)
(R/'tests/installer-results.json').write_text(json.dumps({'environment':'Linux bash/zip; fake npx, no packages installed','checks':checks},ensure_ascii=False,indent=2))
print(sum(x['pass'] for x in checks),'/',len(checks))
