# Terminal'den GitHub'a yükleme

Bu bir tam kaynak projesidir. ZIP'i GitHub'a tek kapalı dosya olarak koymak yerine
ZIP'i aç ve **LumaNote_GitHub klasörünün içindeki kaynakları** Git ile gönder.
`.command` dosyası çalıştırmak gerekmez. macOS güvenlik ayarlarını kapatma.

## 1. Klasörü yerleştir

ZIP'ten çıkan **LumaNote_GitHub** klasörünü Masaüstü'ne koy. Eski proje klasörlerini
silme veya bu klasörle birleştirme. Aynı isimde önceden bir klasör varsa üzerine yazma.

Terminal'de Expo çalışıyorsa Control + C ile durdur. Sonra:

```bash
cd "$HOME/Desktop/LumaNote_GitHub"
pwd
git --version
```

İlk komut hata verirse DUR. Kalan komutları yanlış klasörde çalıştırma. `pwd` çıktısı
`.../Desktop/LumaNote_GitHub` ile bitmeli. Git yoksa macOS kurulum istemini tamamla.
Kopyalarken satırın başına `%`, kullanıcı adı veya `^[[200~` ekleme.

## 2. Kaynak sürümünü kontrol et

```bash
node tools/verify.cjs
```

`LUMA-0.5.7-HOME-GREENHOUSE` ve `62 kaynak kontrolü` beklenir. Node yoksa Git
kurulumu ayrı bir gereksinimdir; kaynakları Git'e almak için npm kurulumu yapman gerekmez.
Bu kontrol paketi açmanın ardından çalıştırılan yerel kontrolü tekrar eder.

## 3. Yerel Git deposu

Bu yeni çıkarılmış klasör `.git` içermez:

```bash
git init
git branch -M main
git add .
git status --short
```

`.gitignore` zaten hazırlanmıştır. `cat > .gitignore` ile üzerine yazmana gerek yok.
`node_modules`, `.expo`, `.luma`, `.env` ve kişisel veri yedekleri görünmemeli.
İncelemek için `git diff --cached --stat` komutunu kullanabilirsin.

Git daha önce ad / e-posta ayarlamanı istemişse, kendi bilgilerinle yalnızca bu depoda:

```bash
git config user.name "GIT_KAYDINDA_GORUNECEK_AD"
git config user.email "GITHUB_COMMIT_EPOSTAN"
```

Yer tutucuları aynen bırakma. E-posta için GitHub Settings → Emails içinde sunulan
noreply adresini kullanabilirsin. `user.name` GitHub kullanıcı adıyla aynı olmak
zorunda değildir. Ad / e-posta ayarı, GitHub hesabına giriş yapmak değildir.

Dosya listesini kontrol ettikten sonra:

```bash
git commit -m "LumaNote 0.5.7 - source and documentation"
```

## 4. GitHub'da boş depo

Tarayıcıdan GitHub hesabında yeni depo oluştur: ad örneği `lumanote`, görünürlük
**Private**. README, .gitignore ve license ekleme seçeneklerini açma: README ve
.gitignore zaten yerel projede var. Aynı adlı depo zaten doluysa üzerine zorla
itmek yerine burada dur ve o deponun durumunu kontrol et.

## 5. Hesaba giriş

Zaten HTTPS kimlik bilgilerin / SSH anahtarın ayarlıysa o yöntemi kullanabilirsin.
GitHub CLI (`gh`) kuruluysa tarayıcı girişi:

```bash
gh auth login --hostname github.com --git-protocol https --web
gh auth setup-git
```

`gh` yoksa bu komutları tekrar tekrar çalıştırma; GitHub CLI kurulumu veya mevcut
SSH / güvenli HTTPS kimlik doğrulaması gerekir. Şifreni veya erişim anahtarını
sohbete yazma; bir anahtarı remote URL'ye veya proje kaynaklarına gömme.

## 6. Gönder

Aşağıdaki URL'deki `KULLANICI_ADIN` bölümünü kendi GitHub kullanıcı adınla değiştir.
En güvenilir yol yeni boş deponun Quick setup bölümündeki HTTPS adresini kopyalamaktır.

```bash
git remote add origin https://github.com/KULLANICI_ADIN/lumanote.git
git remote -v
git push -u origin main
```

`origin already exists`, `repository not found`, `non-fast-forward` veya bir giriş
hatası varsa dur; `--force` kullanma. Yanlış repo üzerine yazma veya dosya silme.

Başarıdan sonra GitHub sayfasını yenile: `App.tsx`, `tools`, `nocturne`, `assets`,
`docs`, `README.md` ve `package.json` görünmeli. İsteğe bağlı doğrulama:

```bash
git rev-parse HEAD
git ls-remote origin refs/heads/main
```

İlk komuttaki kimlik ile ikinci komuttaki satırın ilk sütunu eşleşmeli.

## Daha sonraki değişikliklerde

Aynı klasörde `git status`, `git add .`, `git diff --cached --stat`,
`git commit -m "Degisikligi acikla"` ve `git push` sırasını kullan.
Gizli dosya, yedek veya testte kullandığın özel veri eklemediğinden emin ol.

`package-lock.json` bu kaynak arşivinde yoktur. Yeni klasörde başarılı npm kurulumu
sonrasında oluştuğunda Git'e eklenebilir. `LumaNote_Nocturne_Final` gibi 0.4 olan
başka bir klasörden kilit veya `node_modules` kopyalama.

## Kaynaklar

Komut akışı ve güvenlik uyarıları için resmî belgeler (1 Ekim 2026'da kontrol edildi):

- [Yerel kodu GitHub'a ekleme](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github)
- [.gitignore](https://docs.github.com/en/get-started/git-basics/ignoring-files)
- [GitHub CLI tarayıcı girişi](https://cli.github.com/manual/gh_auth_login)
- [Git kimlik doğrulamasını ayarlama](https://cli.github.com/manual/gh_auth_setup-git)
- [Git kullanıcı adı](https://docs.github.com/en/get-started/git-basics/setting-your-username-in-git)
- [GitHub dosya sınırları](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github)

Bu paket senin hesabında depo oluşturmaz ve kendiliğinden yükleme yapmaz.
