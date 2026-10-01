from pathlib import Path
import tempfile,zipfile,subprocess,os,json,hashlib
R=Path(__file__).resolve().parents[2];B=Path(os.environ.get('LUMA_053_SOURCE','/mnt/data/luma054_work/base/LumaNote_053_Tam_Proje'))
Z=Path(os.environ.get('LUMA_05_ZIP','/mnt/data/LumaNote_v05_Yasayan_Bahce_Tam_Proje.zip'));checks=[]
def ck(n,v):checks.append({'name':n,'pass':bool(v)});print(('PASS ' if v else 'FAIL ')+n)
with tempfile.TemporaryDirectory(prefix='luma-real-chain-') as td:
 T=Path(td);home=T/'home';home.mkdir();env={**os.environ,'HOME':str(home),'LUMA_SKIP_RECORDINGS':'1'}
 with zipfile.ZipFile(Z) as z:z.extractall(T)
 p=T/'LumaNote_Yasayan_Bahce';(p/'node_modules/expo').mkdir(parents=True);(p/'node_modules/expo/package.json').write_text('{"version":"57.0.26"}');(p/'package-lock.json').write_text('{"installed":"same"}')
 def run(src):return subprocess.run(['node',str(src/'tools/repair-existing.cjs'),str(p)],capture_output=True,text=True,env=env,timeout=40)
 a=run(B);ck('Exact 0.5 to 0.5.3 in-place upgrade succeeds',a.returncode==0)
 oldstart=(p/'BASLAT.command').read_bytes();ck('Installed 0.5.3 keeps earlier launcher',oldstart!=(B/'BASLAT.command').read_bytes())
 a=run(R);ck('New updater accepts actual installed 0.5.3 chain',a.returncode==0)
 if a.returncode:print(a.stdout,a.stderr)
 ck('Known-chain launch script and UI update to 0.5.4','0.5.4' in (p/'BASLAT.command').read_text() and 'LUMA-0.5.4-SEASONS-NOTES' in (p/'nocturne/UI_HTML.ts').read_text())
 ck('Known-chain existing lock preserved',(p/'package-lock.json').read_text()=='{"installed":"same"}')
 (R/'tests/054/installed-chain-log.txt').write_text(a.stdout+'\n'+a.stderr)
(R/'tests/054/installed-chain-results.json').write_text(json.dumps({'checks':checks,'passed':sum(x['pass'] for x in checks),'total':len(checks)},indent=2))
print('RESULT',sum(x['pass'] for x in checks),'/',len(checks))
